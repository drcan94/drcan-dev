import { z } from "zod";
import { Prisma } from "@prisma/client";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";

// Slug oluşturma yardımcı fonksiyonu
function createSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Benzersiz slug oluşturma
async function generateUniqueSlug(
  db: any,
  title: string,
  existingId?: string,
): Promise<string> {
  let slug = createSlug(title);
  let counter = 0;
  let finalSlug = slug;
  let exists = true;

  while (exists) {
    const where: Prisma.SeriesWhereInput = {
      slug: finalSlug,
    };

    // Eğer düzenleme yapılıyorsa, mevcut ID'yi hariç tut
    if (existingId) {
      where.id = { not: existingId };
    }

    const existing = await db.series.findFirst({ where });
    exists = !!existing;

    if (exists) {
      counter++;
      finalSlug = `${slug}-${counter}`;
    }
  }

  return finalSlug;
}

export const seriesRouter = createTRPCRouter({
  // Tüm serileri getir
  getAll: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.series.findMany({
      include: {
        author: {
          select: {
            name: true,
            image: true,
          },
        },
        posts: {
          where: { published: true },
          orderBy: { seriesOrder: "asc" },
          select: {
            id: true,
            title: true,
            slug: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }),

  // ID ile seri getir
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const series = await ctx.db.series.findUnique({
        where: { id: input.id },
        include: {
          author: {
            select: {
              name: true,
              image: true,
            },
          },
          posts: {
            where: {
              OR: [
                { published: true },
                { published: false, AND: { authorId: ctx.session?.user?.id } },
              ],
            },
            orderBy: { seriesOrder: "asc" },
            include: {
              author: {
                select: {
                  name: true,
                  image: true,
                },
              },
              category: true,
              tags: true,
            },
          },
        },
      });

      if (!series) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return series;
    }),

  // Slug ile seri getir
  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const series = await ctx.db.series.findUnique({
        where: { slug: input.slug },
        include: {
          author: {
            select: {
              name: true,
              image: true,
            },
          },
          posts: {
            where: {
              OR: [
                { published: true },
                { published: false, AND: { authorId: ctx.session?.user?.id } },
              ],
            },
            orderBy: { seriesOrder: "asc" },
            include: {
              author: {
                select: {
                  name: true,
                  image: true,
                },
              },
              category: true,
              tags: true,
            },
          },
        },
      });

      if (!series) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return series;
    }),

  // Yeni seri oluştur
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        coverImage: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session.user.isAdmin) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      try {
        const slug = await generateUniqueSlug(ctx.db, input.title);

        return await ctx.db.series.create({
          data: {
            title: input.title,
            description: input.description,
            slug,
            coverImage: input.coverImage,
            author: {
              connect: { id: ctx.session.user.id },
            },
          },
        });
      } catch (error) {
        console.error("Error creating series:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Seri oluşturulurken bir hata oluştu: ${
            error instanceof Error ? error.message : "Bilinmeyen hata"
          }`,
          cause: error,
        });
      }
    }),

  // Seriyi güncelle
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(1),
        description: z.string().optional(),
        coverImage: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session.user.isAdmin) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const { id, ...data } = input;

      // Mevcut seriyi kontrol et
      const currentSeries = await ctx.db.series.findUnique({
        where: { id },
      });

      if (!currentSeries) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      // Eğer başlık değiştiyse, yeni slug oluştur
      let slug = currentSeries.slug;
      if (input.title !== currentSeries.title) {
        slug = await generateUniqueSlug(ctx.db, input.title, id);
      }

      try {
        return await ctx.db.series.update({
          where: { id },
          data: {
            title: input.title,
            description: input.description,
            slug,
            coverImage: input.coverImage,
          },
        });
      } catch (error) {
        console.error("Error updating series:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Seri güncellenirken bir hata oluştu: ${
            error instanceof Error ? error.message : "Bilinmeyen hata"
          }`,
          cause: error,
        });
      }
    }),

  // Seriyi sil
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session.user.isAdmin) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      try {
        // Önce yazıların seriye olan bağlantısını kaldır
        await ctx.db.blogPost.updateMany({
          where: { seriesId: input.id },
          data: {
            seriesId: null,
            seriesOrder: null,
          },
        });

        // Sonra seriyi sil
        return await ctx.db.series.delete({
          where: { id: input.id },
        });
      } catch (error) {
        console.error("Error deleting series:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Seri silinirken bir hata oluştu: ${
            error instanceof Error ? error.message : "Bilinmeyen hata"
          }`,
          cause: error,
        });
      }
    }),

  // Yazıyı seriden çıkar
  removePostFromSeries: protectedProcedure
    .input(z.object({ postId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session.user.isAdmin) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      try {
        return await ctx.db.blogPost.update({
          where: { id: input.postId },
          data: {
            seriesId: null,
            seriesOrder: null,
          },
        });
      } catch (error) {
        console.error("Error removing post from series:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Yazı seriden çıkarılırken bir hata oluştu: ${
            error instanceof Error ? error.message : "Bilinmeyen hata"
          }`,
          cause: error,
        });
      }
    }),

  // Yazının seri sırasını güncelle
  updatePostOrder: protectedProcedure
    .input(
      z.object({
        postId: z.string(),
        seriesOrder: z.number().int().positive(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session.user.isAdmin) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      try {
        return await ctx.db.blogPost.update({
          where: { id: input.postId },
          data: { seriesOrder: input.seriesOrder },
        });
      } catch (error) {
        console.error("Error updating post order:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Yazı sırası güncellenirken bir hata oluştu: ${
            error instanceof Error ? error.message : "Bilinmeyen hata"
          }`,
          cause: error,
        });
      }
    }),
});
