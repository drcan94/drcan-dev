import { z } from "zod";
import slugify from "slugify";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const categoryRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.category.findMany({
      orderBy: { name: "asc" },
    });
  }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const category = await ctx.db.category.findUnique({
        where: { id: input.id },
        include: {
          posts: {
            where: { published: true },
            select: { id: true },
          },
        },
      });

      if (!category) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return category;
    }),

  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const category = await ctx.db.category.findUnique({
        where: { slug: input.slug },
        include: {
          posts: {
            where: { published: true },
            select: { id: true },
          },
        },
      });

      if (!category) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return category;
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session.user.isAdmin) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const slug = slugify(input.name, { lower: true, strict: true });

      // Check if slug already exists
      const existing = await ctx.db.category.findUnique({
        where: { slug },
      });

      if (existing) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Bu kategori adı zaten mevcut.",
        });
      }

      return ctx.db.category.create({
        data: {
          name: input.name,
          slug,
        },
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session.user.isAdmin) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const slug = slugify(input.name, { lower: true, strict: true });

      // Check if slug already exists for another category
      const existing = await ctx.db.category.findFirst({
        where: {
          slug,
          id: { not: input.id },
        },
      });

      if (existing) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Bu kategori adı zaten mevcut.",
        });
      }

      return ctx.db.category.update({
        where: { id: input.id },
        data: {
          name: input.name,
          slug,
        },
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session.user.isAdmin) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      // Get the default "genel" category
      const generalCategory = await ctx.db.category.findFirst({
        where: { slug: "genel" },
      });

      if (!generalCategory) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Varsayılan kategori bulunamadı.",
        });
      }

      // Don't allow deleting the default category
      if (input.id === generalCategory.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Varsayılan kategori silinemez.",
        });
      }

      // Find all posts with this category
      const posts = await ctx.db.blogPost.findMany({
        where: { categoryId: input.id },
      });

      // Update all posts to use the default category
      if (posts.length > 0) {
        await ctx.db.blogPost.updateMany({
          where: { categoryId: input.id },
          data: { categoryId: generalCategory.id },
        });
      }

      // Now delete the category
      return ctx.db.category.delete({
        where: { id: input.id },
      });
    }),
});
