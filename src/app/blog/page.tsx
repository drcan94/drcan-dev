import { type Metadata } from "next";
import { Suspense } from "react";

import { api } from "@/trpc/server";
import { PaginatedPosts } from "@/components/blog/paginated-posts";
import { BlogSearch } from "@/components/blog/search";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Blog Yazıları - DrCan.dev",
  description: "Dr. Burak Can'ın tıp ve yazılım üzerine blog yazıları",
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

  // Server-side initial data fetch for better SEO and performance
  const initialData = await api.blog.getPaginated({
    page,
    limit: 9, // Match the limit in the client component
    categoryId,
    tagId,
  });

  return (
    <div className="container mx-auto max-w-4xl px-4 py-16">
      <div className="mb-8 space-y-4">
        <h1 className="text-4xl font-bold">Blog Yazıları</h1>
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <p className="text-lg text-muted-foreground">
            Tıp, yazılım ve sağlık teknolojileri üzerine yazılar
          </p>
          <div className="w-full max-w-xs">
            <BlogSearch />
          </div>
        </div>
      </div>

      <Suspense
        fallback={
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={`skeleton-${index}`}
                className="space-y-4 rounded-lg border p-6"
              >
                <Skeleton className="h-6 w-2/3" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-6 w-6 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <Skeleton className="h-4 w-32" />
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
