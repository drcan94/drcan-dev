import { type Metadata } from "next";
import { Suspense } from "react";
import { unstable_cache } from "next/cache";
import { type Prisma } from "@prisma/client";

import { db } from "@/server/db";
import { PaginatedPosts } from "@/components/blog/paginated-posts";
import { BlogSearch } from "@/components/blog/search";
import { Skeleton } from "@/components/ui/skeleton";

// OPTIMIZATION: Direct database query for caching (tRPC uses headers which can't be cached)
async function getPaginatedPostsFromDb(
  page: number,
  limit: number,
  categoryId?: string,
  tagId?: string
) {
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
    db.blogPost.findMany({
      where,
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
    db.blogPost.count({ where }),
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
}

// OPTIMIZATION: Cache blog posts for 60 seconds to reduce DB hits
const getCachedPaginatedPosts = unstable_cache(
  getPaginatedPostsFromDb,
  ["blog-posts-paginated"],
  {
    revalidate: 60,
    tags: ["blog-posts"],
  }
);

export const metadata: Metadata = {
  title: "Blog Yazıları - DrCan.dev",
  description:
    "Dr. Burak Can'ın sağlık ve yazılım üzerine bilgilendirici blog yazıları. En güncel içerikler ve faydalı bilgiler.",
  keywords: ["blog yazıları", "sağlık blogu", "yazılım blogu", "Dr. Burak Can"],
  openGraph: {
    title: "Blog Yazıları - DrCan.dev",
    description: "Sağlık ve yazılım dünyasından en güncel yazılar",
    type: "website",
    url: "https://drcan.dev/blog",
    images: [
      {
        url: "/opengraph-image.jpg",
        width: 1200,
        height: 630,
        alt: "DrCan.dev Blog",
      },
    ],
  },
};

export default async function BlogPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const page =
    typeof searchParams.sayfa === "string" ? parseInt(searchParams.sayfa) : 1;
  const categoryId =
    typeof searchParams.kategori === "string"
      ? searchParams.kategori
      : undefined;
  const tagId =
    typeof searchParams.etiket === "string" ? searchParams.etiket : undefined;

  // OPTIMIZATION: Use cached query to reduce DB hits on page refreshes
  const initialData = await getCachedPaginatedPosts(
    page,
    9, // Match the limit in the client component
    categoryId,
    tagId
  );

  return (
    <div className="container mx-auto max-w-4xl px-4 py-4 md:py-8">
      {/* Mobil-öncelikli kompakt başlık alanı */}
      <div className="mb-4 md:mb-6">
        {/* Ana başlık alanı ve arama kutusu - daha akıllıca yapılandırılmış */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:items-center md:gap-6">
          <div className="flex items-center gap-2">
            <div className="flex-1 space-y-1 sm:space-y-2">
              <h1 className="text-xl font-bold sm:text-2xl md:text-3xl">
                Blog Yazıları
              </h1>
              <p className="hidden text-sm text-muted-foreground sm:block md:text-base">
                Tıp, yazılım ve sağlık teknolojileri üzerine yazılar
              </p>
            </div>
          </div>

          {/* Arama çubuğu - hem mobil hem desktop için optimize edilmiş */}
          <div className="w-full">
            <BlogSearch />
          </div>
        </div>
      </div>

      <Suspense
        fallback={
          <div className="mt-4 grid gap-3 sm:gap-4 md:grid-cols-2 md:gap-5 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={`skeleton-${index}`}
                className="space-y-2 rounded-lg border p-3 sm:p-4 md:p-5"
              >
                <Skeleton className="h-4 w-2/3 sm:h-5 md:h-6" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4 rounded-full sm:h-5 sm:w-5 md:h-6 md:w-6" />
                  <Skeleton className="h-3 w-16 sm:h-3 sm:w-20 md:h-4 md:w-24" />
                  <Skeleton className="h-3 w-3 rounded-full sm:h-3 sm:w-3 md:h-4 md:w-4" />
                  <Skeleton className="h-3 w-20 sm:h-3 sm:w-24 md:h-4 md:w-28" />
                </div>
              </div>
            ))}
          </div>
        }
      >
        <PaginatedPosts initialData={initialData} />
      </Suspense>
    </div>
  );
}
