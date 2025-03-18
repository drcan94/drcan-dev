// src/server/api/routers/blog.ts
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

// Benzersiz slug oluşturmak için yardımcı fonksiyon
async function generateUniqueSlug(
  db: any,
  title: string,
  existingId?: string,
): Promise<string> {
  let slug = createSlug(title);
  let counter = 0;
  let isUnique = false;
  let testSlug = slug;

  // Slug benzersiz olana kadar döngü
  while (!isUnique) {
    // Mevcut bir post güncelleniyorsa, kendi slug'ını kontrol etmekten kaçın
    const existingPost = await db.blogPost.findFirst({
      where: {
        slug: testSlug,
        ...(existingId ? { NOT: { id: existingId } } : {}),
      },
    });

    if (!existingPost) {
      isUnique = true;
    } else {
      counter++;
      testSlug = `${slug}-${counter}`;
    }
  }

  return testSlug;
}

export const blogRouter = createTRPCRouter({
  // ---------------------------------------------------
  // 1) Yayında olan tüm blog yazılarını getirme
  // ---------------------------------------------------
  getAll: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.blogPost.findMany({
      where: { published: true },
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
      orderBy: { createdAt: "desc" },
    });
  }),

  // ---------------------------------------------------
  // 2) Sayfalama ile yayınlanmış yazıları getirme
  // ---------------------------------------------------
  getPaginated: publicProcedure
    .input(
      z.object({
        page: z.number().int().positive().default(1),
        limit: z.number().int().positive().default(10),
        categoryId: z.string().optional(),
        tagId: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { page, limit, categoryId, tagId } = input;
      const skip = (page - 1) * limit;

      const where: Prisma.BlogPostWhereInput = {
        published: true,
        ...(categoryId ? { categoryId } : {}),
        ...(tagId
          ? {
              tags: {
                some: {
                  id: tagId,
                },
              },
            }
          : {}),
      };

      const [posts, total] = await Promise.all([
        ctx.db.blogPost.findMany({
          where,
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
          orderBy: { createdAt: "desc" },
          skip,
          take: limit,
        }),
        ctx.db.blogPost.count({ where }),
      ]);

      const totalPages = Math.ceil(total / limit);
      const hasMore = page < totalPages;

      return {
        posts,
        total,
        currentPage: page,
        pageSize: limit,
        totalPages,
        hasMore,
      };
    }),

  // ---------------------------------------------------
  // 3) Taslak yazıları getirme (sadece admin)
  // ---------------------------------------------------
  getDrafts: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.session.user.isAdmin) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    return ctx.db.blogPost.findMany({
      where: { published: false },
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
      orderBy: { createdAt: "desc" },
    });
  }),

  // ---------------------------------------------------
  // 4) ID ile tekil yazı getirme (yayında değilse admin)
  // ---------------------------------------------------
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const post = await ctx.db.blogPost.findUnique({
        where: { id: input.id },
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
      });

      if (!post || (!post.published && !ctx.session?.user?.isAdmin)) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return post;
    }),

  // ---------------------------------------------------
  // 4.1) Slug ile tekil yazı getirme (yayında değilse admin)
  // ---------------------------------------------------
  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const post = await ctx.db.blogPost.findUnique({
        where: { slug: input.slug },
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
      });

      if (!post || (!post.published && !ctx.session?.user?.isAdmin)) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return post;
    }),

  // ---------------------------------------------------
  // 5) Public arama prosedürü (yayında olan yazılarda)
  // ---------------------------------------------------
  search: publicProcedure
    .input(
      z.object({
        query: z.string().min(1),
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(10),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { query, page, limit } = input;

      // Clean and prepare the search query
      const originalQuery = query.trim();

      // If query is too short or only whitespace, return empty results
      if (!originalQuery || originalQuery.length < 3) {
        // En az 3 karakter gerekli
        console.log("Search: Query too short, returning empty results");
        return {
          posts: [],
          total: 0,
          totalPages: 0,
          page,
          hasMore: false,
        };
      }

      console.log(`Search: Processing query "${originalQuery}"`);

      // Gelişmiş arama yaklaşımı - öncelik sıralamalı
      const where = {
        published: true,
        OR: [
          // Tam başlık eşleşmesi (en yüksek öncelik)
          {
            title: {
              equals: originalQuery,
              mode: Prisma.QueryMode.insensitive,
            },
          },
          // Başlık başlangıç eşleşmesi (yüksek öncelik)
          {
            title: {
              startsWith: originalQuery,
              mode: Prisma.QueryMode.insensitive,
            },
          },
          // Başlık içerisinde eşleşme (orta öncelik)
          {
            title: {
              contains: originalQuery,
              mode: Prisma.QueryMode.insensitive,
            },
          },
          // İçerik eşleşmesi (düşük öncelik)
          {
            content: {
              contains: originalQuery,
              mode: Prisma.QueryMode.insensitive,
            },
          },
        ],
      };

      try {
        // Find matching posts
        const posts = await ctx.db.blogPost.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * limit,
          take: limit,
          include: {
            category: true,
            author: {
              select: {
                name: true,
                image: true,
              },
            },
            tags: true,
          },
        });

        // Get total count for pagination
        const totalCount = await ctx.db.blogPost.count({ where });

        console.log(
          `Search: Query "${originalQuery}" returned ${posts.length} posts (total: ${totalCount})`,
        );

        return {
          posts,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limit),
          page,
          hasMore: page * limit < totalCount,
        };
      } catch (error) {
        console.error("Search error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Search failed",
          cause: error,
        });
      }
    }),

  // ---------------------------------------------------
  // 6) Admin paneli için tüm yazıları getirme (filtre+arama)
  // ---------------------------------------------------
  getAllForAdmin: protectedProcedure
    .input(
      z.object({
        page: z.number().int().positive().default(1),
        limit: z.number().int().positive().default(10),
        query: z.string().optional(),
        published: z.boolean().optional(),
        categoryId: z.string().optional(),
        tagId: z.string().optional(),
        fromDate: z.string().optional(),
        toDate: z.string().optional(),
        sortBy: z
          .enum(["createdAt", "updatedAt", "title"])
          .default("createdAt"),
        sortDirection: z.enum(["asc", "desc"]).default("desc"),
      }),
    )
    .query(async ({ ctx, input }) => {
      if (!ctx.session.user.isAdmin) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const {
        page,
        limit,
        query,
        published,
        categoryId,
        tagId,
        fromDate,
        toDate,
        sortBy,
        sortDirection,
      } = input;

      // Clean the query if provided
      const searchQuery = query?.trim() || "";
      const hasValidQuery = searchQuery.length >= 3; // En az 3 karakter gerekli

      console.log(
        `Admin search: Query "${searchQuery}", valid: ${hasValidQuery}`,
      );

      // Prepare the base where conditions
      const where: Prisma.BlogPostWhereInput = {
        // Filter by published status if specified
        ...(published !== undefined ? { published } : {}),
        // Filter by category if specified
        ...(categoryId ? { categoryId } : {}),
        // Filter by tag if specified
        ...(tagId
          ? {
              tags: {
                some: {
                  id: tagId,
                },
              },
            }
          : {}),
        // Filter by date range if specified
        ...(fromDate
          ? {
              createdAt: {
                gte: new Date(fromDate),
              },
            }
          : {}),
        ...(toDate
          ? {
              createdAt: {
                lte: new Date(`${toDate}T23:59:59.999Z`),
              },
            }
          : {}),
      };

      // Add search condition if query is valid
      if (hasValidQuery) {
        where.OR = [
          // Tam başlık eşleşmesi (en yüksek öncelik)
          {
            title: {
              equals: searchQuery,
              mode: Prisma.QueryMode.insensitive,
            },
          },
          // Başlık başlangıç eşleşmesi (yüksek öncelik)
          {
            title: {
              startsWith: searchQuery,
              mode: Prisma.QueryMode.insensitive,
            },
          },
          // Başlık içinde kelime eşleşmesi
          {
            title: {
              contains: searchQuery,
              mode: Prisma.QueryMode.insensitive,
            },
          },
          // İçerik eşleşmesi (en düşük öncelik)
          {
            content: {
              contains: searchQuery,
              mode: Prisma.QueryMode.insensitive,
            },
          },
        ];
      }

      try {
        // Execute the query with all filters
        const [posts, total] = await Promise.all([
          ctx.db.blogPost.findMany({
            where,
            include: {
              author: {
                select: { name: true, image: true },
              },
              category: true,
              tags: true,
            },
            orderBy: { [sortBy]: sortDirection },
            skip: (page - 1) * limit,
            take: limit,
          }),
          ctx.db.blogPost.count({ where }),
        ]);

        console.log(
          `Admin search: Found ${total} total posts, returning ${posts.length}`,
        );

        const totalPages = Math.ceil(total / limit);
        const hasMore = page < totalPages;

        return {
          posts,
          total,
          currentPage: page,
          pageSize: limit,
          totalPages,
          hasMore,
        };
      } catch (error) {
        console.error("Admin search error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to retrieve posts",
          cause: error,
        });
      }
    }),

  // ---------------------------------------------------
  // 7) Yeni yazı oluşturma (sadece admin)
  // ---------------------------------------------------
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1),
        content: z.string().min(1),
        published: z.boolean().default(false),
        categoryId: z.string().optional(),
        tagIds: z.array(z.string()).optional(),
        slug: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session.user.isAdmin) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      // Log user information for debugging
      console.log("Creating post with user:", {
        userId: ctx.session.user.id,
        userEmail: ctx.session.user.email,
        isAdmin: ctx.session.user.isAdmin,
      });

      // If no category is provided, find the "genel" category
      let categoryId = input.categoryId;
      if (!categoryId) {
        const generalCategory = await ctx.db.category.findFirst({
          where: { slug: "genel" },
        });

        if (!generalCategory) {
          // Create the general category if it doesn't exist
          const newGeneralCategory = await ctx.db.category.create({
            data: {
              name: "Genel",
              slug: "genel",
            },
          });
          categoryId = newGeneralCategory.id;
        } else {
          categoryId = generalCategory.id;
        }
      }

      // Check if user exists in the database
      const userExists = await ctx.db.user.findUnique({
        where: { id: ctx.session.user.id },
      });

      if (!userExists) {
        console.error(`User not found with ID: ${ctx.session.user.id}`);
        throw new TRPCError({
          code: "NOT_FOUND",
          message:
            "Kullanıcı bulunamadı. Lütfen oturumu kapatıp tekrar giriş yapın.",
        });
      }

      try {
        // Slug oluştur veya sağlanan değeri kullan
        const slug =
          input.slug || (await generateUniqueSlug(ctx.db, input.title));

        return await ctx.db.blogPost.create({
          data: {
            title: input.title,
            slug,
            content: input.content,
            published: input.published,
            author: {
              connect: { id: ctx.session.user.id },
            },
            category: {
              connect: { id: categoryId },
            },
            ...(input.tagIds && input.tagIds.length > 0
              ? {
                  tags: {
                    connect: input.tagIds.map((id) => ({ id })),
                  },
                }
              : {}),
          },
        });
      } catch (error) {
        console.error("Error creating blog post:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Yazı oluşturulurken bir hata oluştu: ${
            error instanceof Error ? error.message : "Bilinmeyen hata"
          }`,
          cause: error,
        });
      }
    }),

  // ---------------------------------------------------
  // 8) Yazı güncelleme (sadece admin)
  // ---------------------------------------------------
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(1),
        content: z.string().min(1),
        published: z.boolean(),
        categoryId: z.string().optional(),
        tagIds: z.array(z.string()).optional(),
        slug: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session.user.isAdmin) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const { id, tagIds, ...data } = input;

      // Get current post data to compare tags
      const currentPost = await ctx.db.blogPost.findUnique({
        where: { id },
        include: { tags: true },
      });

      if (!currentPost) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      // If no category is provided, find the "genel" category
      let categoryId = input.categoryId;
      if (!categoryId) {
        const generalCategory = await ctx.db.category.findFirst({
          where: { slug: "genel" },
        });

        if (!generalCategory) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Varsayılan kategori bulunamadı.",
          });
        }
        categoryId = generalCategory.id;
      }

      // Generate slug if title has changed and slug is not manually set
      let slug = currentPost.slug;
      if (input.title !== currentPost.title && !input.slug) {
        slug = await generateUniqueSlug(ctx.db, input.title, id);
      } else if (input.slug && input.slug !== currentPost.slug) {
        // Manually provided slug
        slug = input.slug;
      }

      // Update post with new data
      return ctx.db.blogPost.update({
        where: { id },
        data: {
          ...data,
          slug,
          categoryId,
          tags: {
            // If tagIds is provided, we need to disconnect current tags and connect the new ones
            ...(tagIds
              ? {
                  disconnect: currentPost.tags.map((tag) => ({ id: tag.id })),
                  connect: tagIds.map((tagId) => ({ id: tagId })),
                }
              : {}),
          },
        },
      });
    }),

  // ---------------------------------------------------
  // 9) Yazı silme (sadece admin)
  // ---------------------------------------------------
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session.user.isAdmin) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      return ctx.db.blogPost.delete({
        where: { id: input.id },
      });
    }),
});
