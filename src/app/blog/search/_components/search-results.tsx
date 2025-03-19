"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Search, Clock, Tag, Calendar, Loader2 } from "lucide-react";
import Link from "next/link";

import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { PaginatedPosts } from "@/components/blog/paginated-posts";
import { type PaginatedPosts as PaginatedPostsType } from "@/types";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams?.get("q") || "";
  const [isClient, setIsClient] = useState(false);
  const [localQuery, setLocalQuery] = useState(query);

  // Set isClient to true on component mount
  useEffect(() => {
    setIsClient(true);
    setLocalQuery(query);
  }, [query]);

  const { data, isLoading } = api.blog.search.useQuery(
    { query, page: 1, limit: 10 },
    {
      enabled: isClient && query.length >= 3, // Minimum 3 karakter kontrolü
      staleTime: 60000, // 60 saniye önbellek - performans için
    },
  );

  // Arama alanı işleyici
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (localQuery && localQuery.length >= 3) {
      const params = new URLSearchParams();
      params.set("q", localQuery);
      window.location.href = `/blog/search?${params.toString()}`;
    }
  };

  // Arama terimi çok kısa ise
  if (isClient && query.length > 0 && query.length < 3) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-16">
        <div className="mb-8 space-y-4">
          <div className="flex items-center gap-2 text-primary">
            <Search className="h-6 w-6" />
            <h1 className="text-4xl font-bold">Arama Sonuçları</h1>
          </div>
          <div className="rounded-lg border bg-amber-50 p-4 text-amber-800 dark:bg-amber-950 dark:text-amber-200">
            <p className="font-medium">
              Lütfen en az 3 karakter içeren bir arama terimi girin.
            </p>
          </div>
        </div>

        <form onSubmit={handleSearch} className="mb-8 flex gap-2">
          <Input
            type="search"
            placeholder="Blog yazılarında ara..."
            className="max-w-md"
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
          />
          <Button type="submit" disabled={localQuery.length < 3}>
            <Search className="mr-2 h-4 w-4" />
            Ara
          </Button>
        </form>

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
      <div className="container mx-auto max-w-4xl px-4 py-16">
        <div className="mb-8 space-y-4">
          <div className="flex items-center gap-2 text-primary">
            <Search className="h-6 w-6" />
            <h1 className="text-4xl font-bold">Arama Sonuçları</h1>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <p>Yükleniyor...</p>
          </div>
        </div>

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
      <div className="container mx-auto max-w-4xl px-4 py-16">
        <div className="mb-8 space-y-4">
          <div className="flex items-center gap-2 text-primary">
            <Search className="h-6 w-6" />
            <h1 className="text-4xl font-bold">Arama</h1>
          </div>
          <p className="text-muted-foreground">Blog yazılarında arama yapın</p>
        </div>

        <form onSubmit={handleSearch} className="mb-8 flex gap-2">
          <Input
            type="search"
            placeholder="Ne aramak istersiniz?"
            className="max-w-md"
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            autoFocus
          />
          <Button type="submit" disabled={localQuery.length < 3}>
            <Search className="mr-2 h-4 w-4" />
            Ara
          </Button>
        </form>

        <div className="mt-12 rounded-lg border border-dashed p-8 text-center">
          <Search className="mx-auto mb-4 h-12 w-12 text-muted-foreground opacity-40" />
          <h2 className="mb-2 text-xl font-medium">Aramaya Başlayın</h2>
          <p className="mb-6 text-muted-foreground">
            Sağlık ve yazılım konularında blog yazılarında arama yapabilirsiniz
          </p>
          <Button variant="outline" asChild>
            <Link href="/blog" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Blog Yazılarına Dön
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-16">
      <div className="mb-8 space-y-4">
        <div className="flex items-center gap-2 text-primary">
          <Search className="h-6 w-6" />
          <h1 className="text-4xl font-bold">Arama Sonuçları</h1>
        </div>
        <p className="text-lg text-muted-foreground">
          <span className="font-medium text-foreground">"{query}"</span> için
          bulunan sonuçlar{" "}
          {!isLoading && data && data.total > 0 && (
            <Badge variant="outline" className="ml-2">
              <span className="font-medium">{data.total} sonuç</span>
            </Badge>
          )}
        </p>
      </div>

      <form onSubmit={handleSearch} className="mb-8 flex gap-2">
        <Input
          type="search"
          placeholder="Blog yazılarında ara..."
          className="max-w-md"
          value={localQuery}
          onChange={(e) => setLocalQuery(e.target.value)}
        />
        <Button type="submit" disabled={localQuery.length < 3}>
          <Search className="mr-2 h-4 w-4" />
          Ara
        </Button>
      </form>

      <Button variant="outline" asChild className="mb-8">
        <Link href="/blog" className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Blog Yazılarına Dön
        </Link>
      </Button>

      {isLoading ? (
        <div className="rounded-lg border p-8">
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <p className="text-lg font-medium">Arama yapılıyor...</p>
          </div>
        </div>
      ) : data && data.posts.length > 0 ? (
        <div className="space-y-6">
          <PaginatedPosts initialData={data as unknown as PaginatedPostsType} />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="rounded-lg border border-dashed p-12 text-center">
            <Search className="mx-auto mb-4 h-12 w-12 text-muted-foreground opacity-40" />
            <h3 className="mb-2 text-lg font-medium">Sonuç bulunamadı</h3>
            <p className="mb-6 text-muted-foreground">
              "{query}" araması için hiçbir sonuç bulunamadı. Lütfen farklı bir
              arama terimi deneyin.
            </p>

            <div className="mt-8 text-left">
              <h4 className="mb-2 font-medium">Arama ipuçları:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Tag className="h-4 w-4" /> Daha genel anahtar kelimeler
                  kullanın
                </li>
                <li className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" /> Yazım hatalarını kontrol edin
                </li>
                <li className="flex items-center gap-2">
                  <Clock className="h-4 w-4" /> Farklı terimlerle tekrar deneyin
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
