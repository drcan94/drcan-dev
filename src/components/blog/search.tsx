"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Loader2,
  BookOpen,
  FileText,
  ArrowRight,
  ScanSearch,
  Filter,
} from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";
import { useDebounce } from "@/hooks/use-debounce";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function BlogSearch() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [exactMatch, setExactMatch] = useState(false);

  // Uzun debounce süresi (300ms) - daha hızlı yanıt için biraz düşürüldü
  const debouncedSearch = useDebounce(searchQuery, 300);
  // Minimum 3 karakter arama
  const shouldSearch = debouncedSearch.length >= 3;

  // Tıklama olaylarını yönetmek için ref
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Arama önerileri için sorgu
  const { data, isFetching } = api.blog.search.useQuery(
    {
      query: debouncedSearch || "",
      page: 1,
      limit: 6,
      exact: exactMatch,
    },
    {
      enabled: shouldSearch,
      staleTime: 30000, // 30 saniye önbellek - daha güncel sonuçlar için
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

  // Arama kısayolu için klavye olayı dinleyicisi
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+K veya Cmd+K (Mac) kısayolu
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }

      // Escape tuşu ile öneri kutusunu kapat
      if (e.key === "Escape") {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSearch = useCallback(() => {
    if (debouncedSearch.trim().length >= 3) {
      const searchParams = new URLSearchParams();
      searchParams.set("q", debouncedSearch);
      if (exactMatch) {
        searchParams.set("exact", "1");
      }
      router.push(`/blog/search?${searchParams.toString()}`);
      setShowSuggestions(false);
    }
  }, [debouncedSearch, router, exactMatch]);

  // Arama modunu değiştir
  const toggleSearchMode = () => {
    setExactMatch((prev) => !prev);
  };

  // Özel sonuçları yükleme veya boş durumu işleme
  const renderSuggestions = () => {
    if (isFetching) {
      return (
        <div className="flex items-center justify-center p-4">
          <Loader2 className="mr-2 h-4 w-4 animate-spin text-primary" />
          <span>Aranıyor...</span>
        </div>
      );
    }

    if (!data?.posts || data.posts.length === 0) {
      return (
        <div className="px-4 py-3 text-sm text-muted-foreground">
          <p>"{debouncedSearch}" için sonuç bulunamadı</p>
          <p className="mt-1 text-xs">
            {exactMatch
              ? "Tam eşleşme kapalıyken daha fazla sonuç bulabilirsiniz."
              : "Farklı anahtar kelimeler kullanmayı deneyin."}
          </p>
        </div>
      );
    }

    return (
      <div className="py-1">
        {data.posts.map((post) => (
          <Link
            key={post.id}
            href={`/blog/${post.slug}`}
            className="group flex items-start gap-2 px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
            onClick={() => setShowSuggestions(false)}
          >
            <FileText className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground group-hover:text-current" />
            <div>
              <p className="font-medium leading-tight">{post.title}</p>

              {post.category && (
                <div className="mt-1 flex flex-wrap gap-1">
                  <Badge variant="outline" className="text-xs">
                    {post.category.name}
                  </Badge>
                </div>
              )}
            </div>
          </Link>
        ))}

        <div className="border-t p-2">
          <Link
            href={`/blog/search?q=${encodeURIComponent(debouncedSearch)}${exactMatch ? "&exact=1" : ""}`}
            className="flex items-center justify-between rounded px-2 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            onClick={() => setShowSuggestions(false)}
          >
            <span className="font-medium">
              "{debouncedSearch}" için tüm sonuçları gör
            </span>
            <div className="flex items-center gap-1">
              <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-xs font-semibold tabular-nums text-primary">
                {data.total}
              </span>
              <ArrowRight className="h-3 w-3" />
            </div>
          </Link>
        </div>
      </div>
    );
  };

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
        <div className="relative">
          <Input
            ref={inputRef}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Blog yazılarında ara..."
            className="pl-9 pr-10"
            onFocus={() => {
              if (searchQuery.length >= 3) {
                setShowSuggestions(true);
              }
            }}
          />
          <BookOpen className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <div className="absolute right-10 top-1/2 flex -translate-y-1/2 items-center">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className={`h-8 w-8 ${exactMatch ? "text-primary" : "text-muted-foreground"}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSearchMode();
                    }}
                  >
                    {exactMatch ? (
                      <ScanSearch className="h-4 w-4" />
                    ) : (
                      <Filter className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    {exactMatch
                      ? "Tam eşleşme modu açık"
                      : "Tam eşleşme modu kapalı"}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

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
        </div>

        <div className="absolute right-20 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
          <kbd className="hidden rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px] sm:inline-block">
            Ctrl+K
          </kbd>
        </div>
      </form>

      {/* Arama önerileri */}
      {showSuggestions && shouldSearch && (
        <div
          className="absolute left-0 right-0 z-10 mt-1 max-h-[70vh] overflow-auto rounded-md border bg-background shadow-lg"
          onClick={(e) => e.stopPropagation()}
        >
          {renderSuggestions()}
        </div>
      )}
    </div>
  );
}
