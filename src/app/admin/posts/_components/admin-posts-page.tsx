"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Loader2 } from "lucide-react";
import Link from "next/link";

import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import { AdminPostsList } from "./admin-posts-list";
import { AdminPostsFilters } from "./admin-posts-filters";

export function AdminPostsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debouncedSearch = useDebounce(searchQuery);

  // Get URL params
  const categoryId = searchParams?.get("kategori") || undefined;
  const tagId = searchParams?.get("etiket") || undefined;
  const published =
    searchParams?.get("durum") === "true"
      ? true
      : searchParams?.get("durum") === "false"
        ? false
        : undefined;
  const fromDate = searchParams?.get("baslangic") || undefined;
  const toDate = searchParams?.get("bitis") || undefined;
  const sortBy =
    (searchParams?.get("sirala") as "createdAt" | "updatedAt" | "title") ||
    "createdAt";
  const sortDirection = (searchParams?.get("yon") as "asc" | "desc") || "desc";

  // Search suggestions query
  const { data: suggestions, isFetching: isFetchingSuggestions } =
    api.blog.getAllForAdmin.useQuery(
      {
        page: 1,
        limit: 5,
        query: debouncedSearch,
        published,
        categoryId,
        tagId,
        fromDate,
        toDate,
        sortBy,
        sortDirection,
      },
      {
        enabled: showSuggestions && debouncedSearch.length > 0,
        staleTime: 60000,
      },
    );

  // Handle search form submission
  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (debouncedSearch) {
      const params = new URLSearchParams(searchParams?.toString());
      params.set("q", debouncedSearch);
      params.set("sayfa", "1"); // Reset to first page
      router.push(`/admin/posts?${params.toString()}`);
      setShowSuggestions(false);
    }
  };

  // Handle Enter key
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Update search when URL query changes
  useEffect(() => {
    const query = searchParams?.get("q") || "";
    setSearchQuery(query);
  }, [searchParams]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Blog Yazıları</h1>
        <Button asChild>
          <Link href="/admin/posts/new">
            <Plus className="mr-2 h-4 w-4" />
            Yeni Yazı
          </Link>
        </Button>
      </div>

      <div className="mb-6 grid gap-6 md:grid-cols-[2fr,1fr]">
        {/* Search and filters */}
        <div className="space-y-4">
          <div className="relative">
            <Input
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onKeyDown={handleKeyDown}
              placeholder="Yazılarda ara..."
              className="w-full"
            />

            {/* Search suggestions dropdown */}
            {showSuggestions && debouncedSearch && (
              <div className="absolute left-0 right-0 z-10 mt-1 rounded-md border bg-background shadow-lg">
                {isFetchingSuggestions ? (
                  <div className="flex items-center justify-center p-4">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    <span>Aranıyor...</span>
                  </div>
                ) : suggestions?.posts && suggestions.posts.length > 0 ? (
                  <div className="py-1">
                    {suggestions.posts.map((post) => (
                      <Link
                        key={post.id}
                        href={`/admin/posts/${post.id}/edit`}
                        className="block px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                        onClick={() => setShowSuggestions(false)}
                      >
                        {post.title}
                        <span className="ml-2 text-xs text-muted-foreground">
                          ({post.published ? "Yayında" : "Taslak"})
                        </span>
                      </Link>
                    ))}
                    <div className="border-t p-2 text-center text-xs text-muted-foreground">
                      <button
                        onClick={handleSearch}
                        className="block w-full hover:text-foreground"
                      >
                        "{debouncedSearch}" için tüm sonuçları gör (
                        {suggestions.total})
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="px-4 py-3 text-sm text-muted-foreground">
                    "{debouncedSearch}" için sonuç bulunamadı
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Post list with pagination */}
          <AdminPostsList />
        </div>

        {/* Filters sidebar */}
        <div className="rounded-lg border p-4">
          <AdminPostsFilters />
        </div>
      </div>
    </div>
  );
}
