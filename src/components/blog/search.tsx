"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2 } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";
import { useDebounce } from "@/hooks/use-debounce";

export function BlogSearch() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  // Uzun debounce süresi (500ms) - varsayılan değer
  const debouncedSearch = useDebounce(searchQuery);
  // Minimum 3 karakter arama
  const shouldSearch = debouncedSearch.length >= 3;

  // Tıklama olaylarını yönetmek için ref
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Arama önerileri için sorgu
  const { data, isFetching } = api.blog.search.useQuery(
    { query: debouncedSearch, page: 1, limit: 5 },
    {
      enabled: shouldSearch,
      staleTime: 60000, // 60 saniye önbellek - performansı artırmak için
    },
  );

  // isFetching değiştiğinde loading durumunu güncelle
  useEffect(() => {
    setIsLoading(isFetching);
  }, [isFetching]);

  // Dışarı tıklandığında öneri kutusunu kapat - daha iyi click-outside yönetimi
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Arama terimi değiştiğinde öneri kutusunu aç
  useEffect(() => {
    if (shouldSearch) {
      setShowSuggestions(true);
      setIsLoading(isFetching);
    } else {
      // Arama sorgusu çok kısaysa öneri kutusunu kapat
      setShowSuggestions(false);
      setIsLoading(false);
    }
  }, [shouldSearch, isFetching]);

  const handleSearch = useCallback(() => {
    if (debouncedSearch.trim().length >= 3) {
      router.push(`/blog/search?q=${encodeURIComponent(debouncedSearch)}`);
      setShowSuggestions(false);
    }
  }, [debouncedSearch, router]);

  return (
    <div className="relative" ref={searchContainerRef}>
      <form
        action={handleSearch}
        className="relative"
        onSubmit={(e) => {
          e.preventDefault();
          handleSearch();
        }}
        onClick={(e) => {
          e.stopPropagation();
          if (searchQuery.length >= 3) {
            setShowSuggestions(true);
          }
        }}
      >
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Blog yazılarında ara... (en az 3 karakter)"
          className="pr-10"
        />
        <Button
          type="submit"
          variant="ghost"
          size="icon"
          className="absolute right-0 top-0 h-10 w-10"
          disabled={isLoading || searchQuery.length < 3}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
          <span className="sr-only">Ara</span>
        </Button>
      </form>

      {/* Arama önerileri */}
      {showSuggestions && shouldSearch && (
        <div
          className="absolute left-0 right-0 z-10 mt-1 overflow-hidden rounded-md border bg-background shadow-lg"
          onClick={(e) => e.stopPropagation()}
        >
          {isFetching ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              <span>Aranıyor...</span>
            </div>
          ) : data?.posts && data.posts.length > 0 ? (
            <div className="py-1">
              {data.posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="block px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                  onClick={() => setShowSuggestions(false)}
                >
                  {post.title}
                </Link>
              ))}
              <div className="border-t p-2 text-center text-xs text-muted-foreground">
                <Link
                  href={`/blog/search?q=${encodeURIComponent(debouncedSearch)}`}
                  className="block hover:text-foreground"
                  onClick={() => setShowSuggestions(false)}
                >
                  "{debouncedSearch}" için tüm sonuçları gör ({data.total})
                </Link>
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
  );
}
