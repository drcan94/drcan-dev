// src/server/api/routers/blog.ts
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { revalidateTag } from "next/cache";

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
      // OPTIMIZATION: Only select fields needed for list view, excluding heavy 'content'
      select: {
        id: true,
        title: true,
        slug: true,
        coverImage: true,
        createdAt: true,
        updatedAt: true,
        published: true,
        viewCount: true,
        author: {
          select: {
            name: true,
            image: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        tags: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
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
          // OPTIMIZATION: Only select fields needed for list view, excluding heavy 'content'
          select: {
            id: true,
            title: true,
            slug: true,
            coverImage: true,
            createdAt: true,
            updatedAt: true,
            published: true,
            viewCount: true,
            author: {
              select: {
                name: true,
                image: true,
              },
            },
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
            tags: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
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
      // OPTIMIZATION: Only select fields needed for list view, excluding heavy 'content'
      select: {
        id: true,
        title: true,
        slug: true,
        coverImage: true,
        createdAt: true,
        updatedAt: true,
        published: true,
        viewCount: true,
        author: {
          select: {
            name: true,
            image: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        tags: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
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
        query: z.string().optional().default(""),
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(10),
        exact: z.boolean().optional(),
        categoryId: z.string().optional(),
        tagId: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { query = "", page, limit, exact, categoryId, tagId } = input;

      // Clean and prepare the search query - boşlukları temizle
      const originalQuery = query.trim().replace(/\s+/g, " ");

      // If query is too short or only whitespace, and no filters, return empty results
      if (
        (!originalQuery || originalQuery.length < 3) &&
        !categoryId &&
        !tagId
      ) {
        // En az 3 karakter gerekli veya herhangi bir filtre
        console.log(
          "Search: Query too short and no filters, returning empty results",
        );
        return {
          posts: [],
          total: 0,
          totalPages: 0,
          page,
          hasMore: false,
        };
      }

      console.log(
        `Search: Processing query "${originalQuery}" with filters: categoryId=${categoryId}, tagId=${tagId}`,
      );

      // Türkçe karakterleri normalize et
      const normalizeText = (text: string) => {
        // Büyük/küçük harf dönüşümünü ve türkçe karakterleri normalize et
        return text
          .toLowerCase()
          .replace(/ğ/g, "g")
          .replace(/ü/g, "u")
          .replace(/ş/g, "s")
          .replace(/ı/g, "i")
          .replace(/ö/g, "o")
          .replace(/ç/g, "c");
      };

      const normalizedQuery = normalizeText(originalQuery);

      // Yaygın bağlaçları ve stopwords'leri filtrele
      const stopWords = [
        "ile",
        "ve",
        "bu",
        "bir",
        "de",
        "da",
        "için",
        "the",
        "in",
        "on",
        "at",
        "veya",
        "ama",
        "fakat",
        "ancak",
        "olarak",
        "gibi",
        "kadar",
        "nasıl",
        "sonra",
        "önce",
        "dolayı",
        "nedeniyle",
        "rağmen",
        "üzere",
        "diye",
        "ya",
        "ki",
        "ise",
        "hatta",
        "birlikte",
        "karşın",
        "sanki",
        "oysa",
        "çünkü",
        "of",
        "to",
        "from",
        "with",
        "by",
        "as",
        "for",
        "about",
        "than",
        "but",
      ];

      // Arama sorgusunu kelimelere ayır
      const searchTerms = normalizedQuery
        .split(/\s+/)
        .filter((term) => term.length >= 2 && !stopWords.includes(term));

      // İçerikten metin çıkarma fonksiyonu (JSON içeriği için)
      const extractTextFromContent = (content: string) => {
        try {
          const contentObj = JSON.parse(content);
          // Extract text from all content blocks
          return contentObj
            .flatMap(
              (block: any) =>
                block.content?.map((c: any) => c.text).filter(Boolean) || [],
            )
            .join(" ");
        } catch (e) {
          return content;
        }
      };

      // Benzerlik skoru hesaplama (0-100 arası)
      const calculateRelevanceScore = (post: any): number => {
        const postTitle = normalizeText(post.title);
        const postContentText = normalizeText(
          extractTextFromContent(post.content),
        );

        // Başlangıç skoru
        let score = 0;

        // Tam başlık eşleşmesi - en yüksek skor (100)
        if (postTitle === normalizedQuery) {
          return 100;
        }

        // Başlık başlangıç eşleşmesi (80)
        if (postTitle.startsWith(normalizedQuery)) {
          score = Math.max(score, 80);
        }

        // Başlık içinde tam ifade eşleşmesi (70)
        if (postTitle.includes(normalizedQuery)) {
          score = Math.max(score, 70);
        }

        // İçerikte tam ifade eşleşmesi (60)
        if (postContentText.includes(normalizedQuery)) {
          score = Math.max(score, 60);
        }

        // Başlık kelime eşleşmeleri (40-50)
        const titleMatches = searchTerms.filter((term) =>
          postTitle.includes(term),
        );
        if (titleMatches.length > 0) {
          const titleMatchScore =
            40 + (titleMatches.length / searchTerms.length) * 10;
          score = Math.max(score, titleMatchScore);
        }

        // İçerik eşleşmeleri (20-30)
        const contentMatches = searchTerms.filter((term) =>
          postContentText.includes(term),
        );
        if (contentMatches.length > 0) {
          const contentMatchScore =
            20 + (contentMatches.length / searchTerms.length) * 10;
          score = Math.max(score, contentMatchScore);
        }

        return score;
      };

      const skip = (page - 1) * limit;

      // Temel sorgu koşulları - published yazılar
      const baseWhereCondition: Prisma.BlogPostWhereInput = {
        published: true,
      };

      // Kategori filtresi
      if (categoryId) {
        baseWhereCondition.categoryId = categoryId;
      }

      // Etiket filtresi
      if (tagId) {
        baseWhereCondition.tags = {
          some: { id: tagId },
        };
      }

      // Arama sorgusu için where koşulu
      let whereCondition: Prisma.BlogPostWhereInput = { ...baseWhereCondition };

      // Arama sorgusu varsa sorgulama koşullarını ekle
      if (originalQuery && originalQuery.length >= 3) {
        // Tam eşleşme modunda, ekleme yap
        if (exact) {
          // Tam eşleşme modu - Sadece tam ifadeyi ara
          const exactSearchConditions = [
            // Başlık tam eşleşme
            {
              title: {
                contains: originalQuery,
                mode: Prisma.QueryMode.insensitive,
              },
            },
            // İçerik tam eşleşme
            {
              content: {
                contains: originalQuery,
                mode: Prisma.QueryMode.insensitive,
              },
            },
          ];

          // Tam eşleşme modunda AND ile birleştir
          whereCondition = {
            AND: [baseWhereCondition, { OR: exactSearchConditions }],
          };
        } else {
          // Gelişmiş arama modu - tüm olası eşleşmeleri dene
          const orderConditions = [
            // Tam ifade araması - en yüksek öncelik
            {
              title: {
                equals: originalQuery,
                mode: Prisma.QueryMode.insensitive,
              },
            },
            {
              title: {
                startsWith: originalQuery,
                mode: Prisma.QueryMode.insensitive,
              },
            },
            {
              title: {
                contains: originalQuery,
                mode: Prisma.QueryMode.insensitive,
              },
            },
            {
              content: {
                contains: originalQuery,
                mode: Prisma.QueryMode.insensitive,
              },
            },
          ];

          // Kelime bazlı arama - düşük öncelik
          const termConditions = searchTerms.flatMap((term) => [
            {
              title: {
                contains: term,
                mode: Prisma.QueryMode.insensitive,
              },
            },
            {
              content: {
                contains: term,
                mode: Prisma.QueryMode.insensitive,
              },
            },
          ]);

          const fuzzySearchConditions = [...orderConditions, ...termConditions];

          // Normal arama modunda AND ile birleştir
          whereCondition = {
            AND: [baseWhereCondition, { OR: fuzzySearchConditions }],
          };
        }
      }

      // Sıralama için ilgililik skoru hesapla - fuzzy search söz konusu ise
      const hasSearchQuery = originalQuery && originalQuery.length >= 3;

      try {
        // Ana sorgu
        const [posts, total] = await Promise.all([
          ctx.db.blogPost.findMany({
            where: whereCondition,
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
            orderBy: hasSearchQuery
              ? { createdAt: "desc" } // İlgililik skoru sıralama işlemi yap
              : { createdAt: "desc" }, // Sadece filtre varsa tarihe göre sırala
            skip,
            take: limit,
          }),
          ctx.db.blogPost.count({ where: whereCondition }),
        ]);

        // ... devam eden kod ...

        // Final results
        const postsWithScores = hasSearchQuery
          ? posts
              .map((post) => {
                const relevanceScore = calculateRelevanceScore(post);
                return { ...post, relevanceScore };
              })
              .sort((a, b) => b.relevanceScore - a.relevanceScore)
          : posts;

        const totalPages = Math.ceil(total / limit);
        const hasMore = page < totalPages;

        // Format the results
        return {
          posts: postsWithScores,
          total,
          totalPages,
          page,
          hasMore,
        };
      } catch (error) {
        console.error("Search error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Arama sırasında bir hata oluştu",
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
            // OPTIMIZATION: Only select fields needed for admin list view, excluding heavy 'content'
            select: {
              id: true,
              title: true,
              slug: true,
              coverImage: true,
              createdAt: true,
              updatedAt: true,
              published: true,
              viewCount: true,
              author: {
                select: { name: true, image: true },
              },
              category: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
              tags: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
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
        coverImage: z.string().optional(),
        seriesId: z.string().optional(),
        seriesOrder: z.number().int().positive().optional(),
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

        const post = await ctx.db.blogPost.create({
          data: {
            title: input.title,
            slug,
            content: input.content,
            published: input.published,
            coverImage: input.coverImage,
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
            ...(input.seriesId
              ? {
                  series: {
                    connect: { id: input.seriesId },
                  },
                  seriesOrder: input.seriesOrder || 1,
                }
              : {}),
          },
        });

        // OPTIMIZATION: Invalidate cache after creating a post
        revalidateTag("blog-posts");

        return post;
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
        coverImage: z.string().optional(),
        seriesId: z.string().optional(),
        seriesOrder: z.number().int().positive().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session.user.isAdmin) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const { id, tagIds, categoryId: inputCategoryId, seriesId, seriesOrder, slug: inputSlug, ...data } = input;

      // Get current post data to compare tags
      const currentPost = await ctx.db.blogPost.findUnique({
        where: { id },
        include: { tags: true },
      });

      if (!currentPost) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      // If no category is provided, find the "genel" category
      let categoryId = inputCategoryId;
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
      if (input.title !== currentPost.title && !inputSlug) {
        slug = await generateUniqueSlug(ctx.db, input.title, id);
      } else if (inputSlug && inputSlug !== currentPost.slug) {
        // Manually provided slug
        slug = inputSlug;
      }

      // Update post with new data
      const updatedPost = await ctx.db.blogPost.update({
        where: { id },
        data: {
          ...data,
          slug,
          category: {
            connect: { id: categoryId },
          },
          tags: {
            // If tagIds is provided, we need to disconnect current tags and connect the new ones
            ...(tagIds
              ? {
                  disconnect: currentPost.tags.map((tag) => ({ id: tag.id })),
                  connect: tagIds.map((tagId) => ({ id: tagId })),
                }
              : {}),
          },
          ...(seriesId !== undefined
            ? seriesId
              ? {
                  series: {
                    connect: { id: seriesId },
                  },
                  seriesOrder: seriesOrder || 1,
                }
              : {
                  series: {
                    disconnect: true,
                  },
                  seriesOrder: null,
                }
            : {}),
        },
      });

      // OPTIMIZATION: Invalidate cache after updating a post
      revalidateTag("blog-posts");

      return updatedPost;
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

      const deletedPost = await ctx.db.blogPost.delete({
        where: { id: input.id },
      });

      // OPTIMIZATION: Invalidate cache after deleting a post
      revalidateTag("blog-posts");

      return deletedPost;
    }),

  // ---------------------------------------------------
  // 10) Görüntülenme sayısını artırma (public)
  // ---------------------------------------------------
  incrementViewCount: publicProcedure
    .input(z.object({ slug: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const post = await ctx.db.blogPost.findUnique({
        where: { slug: input.slug },
        select: { id: true, published: true },
      });

      if (!post || !post.published) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return ctx.db.blogPost.update({
        where: { slug: input.slug },
        data: {
          viewCount: {
            increment: 1,
          },
        },
        select: {
          viewCount: true,
        },
      });
    }),
});
