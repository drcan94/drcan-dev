"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { PaginatedPosts } from "@/components/blog/paginated-posts";
import { type PaginatedPosts as PaginatedPostsType } from "@/types";

export default function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams?.get("q") || "";
  const [isClient, setIsClient] = useState(false);

  // Set isClient to true on component mount
  useEffect(() => {
    setIsClient(true);
  }, []);

  const { data, isLoading } = api.blog.search.useQuery(
    { query, page: 1, limit: 10 },
    {
      enabled: isClient && query.length >= 3, // Minimum 3 karakter kontrolü
      staleTime: 60000, // 60 saniye önbellek - performans için
      cacheTime: 300000, // 5 dakika cache
    },
  );

  // Arama terimi çok kısa ise
  if (isClient && query.length > 0 && query.length < 3) {
    return (
      <div className="container mx-auto px-4 py-16">
        <h1 className="mb-4 text-4xl font-bold">Arama Sonuçları</h1>
        <p className="mb-8 text-muted-foreground">
          Lütfen en az 3 karakter içeren bir arama terimi girin.
        </p>
        <Button variant="outline" asChild>
          <Link href="/blog" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Blog Yazılarına Dön
          </Link>
        </Button>
      </div>
    );
  }

  if (!isClient) {
    return (
      <div className="container mx-auto px-4 py-16">
        <h1 className="mb-4 text-4xl font-bold">Arama Sonuçları</h1>
        <p className="mb-8 text-muted-foreground">Yükleniyor...</p>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-4 rounded-lg border p-6">
              <div className="h-6 w-2/3 animate-pulse rounded bg-muted" />
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 animate-pulse rounded-full bg-muted" />
                <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                <div className="h-4 w-4 animate-pulse rounded-full bg-muted" />
                <div className="h-4 w-32 animate-pulse rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!query) {
    return (
      <div className="container mx-auto px-4 py-16">
        <h1 className="mb-4 text-4xl font-bold">Arama Sonuçları</h1>
        <p className="mb-8 text-muted-foreground">
          Lütfen arama kutusuna bir arama terimi girin.
        </p>
        <Button variant="outline" asChild>
          <Link href="/blog" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Blog Yazılarına Dön
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="mb-4 text-4xl font-bold">Arama Sonuçları</h1>
      <p className="mb-8 text-muted-foreground">
        "{query}" için bulunan sonuçlar{" "}
        {!isLoading && data && (
          <span className="font-medium">({data.total} sonuç)</span>
        )}
      </p>

      <Button variant="outline" asChild className="mb-8">
        <Link href="/blog" className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Blog Yazılarına Dön
        </Link>
      </Button>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-4 rounded-lg border p-6">
              <div className="h-6 w-2/3 animate-pulse rounded bg-muted" />
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 animate-pulse rounded-full bg-muted" />
                <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                <div className="h-4 w-4 animate-pulse rounded-full bg-muted" />
                <div className="h-4 w-32 animate-pulse rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>
      ) : data && data.posts.length > 0 ? (
        <div className="space-y-6">
          <PaginatedPosts initialData={data as unknown as PaginatedPostsType} />
        </div>
      ) : (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <h3 className="mb-2 text-lg font-medium">Sonuç bulunamadı</h3>
          <p className="mb-6 text-muted-foreground">
            "{query}" araması için hiçbir sonuç bulunamadı. Lütfen farklı bir
            arama terimi deneyin.
          </p>
        </div>
      )}
    </div>
  );
}