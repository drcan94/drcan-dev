import { z } from "zod";
import slugify from "slugify";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const tagRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.tag.findMany({
      orderBy: { name: "asc" },
    });
  }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const tag = await ctx.db.tag.findUnique({
        where: { id: input.id },
        include: {
          posts: {
            where: { published: true },
            select: { id: true },
          },
        },
      });

      if (!tag) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return tag;
    }),

  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const tag = await ctx.db.tag.findUnique({
        where: { slug: input.slug },
        include: {
          posts: {
            where: { published: true },
            select: { id: true },
          },
        },
      });

      if (!tag) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return tag;
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
      const existing = await ctx.db.tag.findUnique({
        where: { slug },
      });

      if (existing) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Bu etiket adı zaten mevcut.",
        });
      }

      return ctx.db.tag.create({
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

      // Check if slug already exists for another tag
      const existing = await ctx.db.tag.findFirst({
        where: {
          slug,
          id: { not: input.id },
        },
      });

      if (existing) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Bu etiket adı zaten mevcut.",
        });
      }

      return ctx.db.tag.update({
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

      // Find the tag
      const tag = await ctx.db.tag.findUnique({
        where: { id: input.id },
        include: {
          posts: true,
        },
      });

      if (!tag) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      // First disconnect the tag from all posts
      // This is to prevent relation errors when deleting the tag
      for (const post of tag.posts) {
        await ctx.db.blogPost.update({
          where: { id: post.id },
          data: {
            tags: {
              disconnect: { id: tag.id },
            },
          },
        });
      }

      // Now delete the tag
      return ctx.db.tag.delete({
        where: { id: input.id },
      });
    }),
});
