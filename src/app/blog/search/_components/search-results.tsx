"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Search,
  Clock,
  Tag,
  Calendar,
  Loader2,
  ScanSearch,
  Filter,
  FilterX,
} from "lucide-react";
import Link from "next/link";

import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { PaginatedPosts } from "@/components/blog/paginated-posts";
import { type PaginatedPosts as PaginatedPostsType } from "@/types";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SearchResultsProps {
  initialData?: any;
  initialCategories?: any[];
  initialTags?: any[];
}

export default function SearchResults({
  initialData,
  initialCategories,
  initialTags,
}: SearchResultsProps) {
  const searchParams = useSearchParams();
  const query = searchParams?.get("q") || "";
  const exactParam = searchParams?.get("exact");
  const categoryParam = searchParams?.get("kategori");
  const tagParam = searchParams?.get("etiket");

  const [isClient, setIsClient] = useState(false);
  const [localQuery, setLocalQuery] = useState(query);
  const [exactMatch, setExactMatch] = useState(exactParam === "1");
  const [selectedCategory, setSelectedCategory] = useState(categoryParam || "");
  const [selectedTag, setSelectedTag] = useState(tagParam || "");

  // Kategorileri ve etiketleri alma
  const { data: categories } = api.category.getAll.useQuery(undefined, {
    initialData: initialCategories,
    enabled: !initialCategories,
  });

  const { data: tags } = api.tag.getAll.useQuery(undefined, {
    initialData: initialTags,
    enabled: !initialTags,
  });

  // Set isClient to true on component mount
  useEffect(() => {
    setIsClient(true);
    setLocalQuery(query);
    setExactMatch(exactParam === "1");
    setSelectedCategory(categoryParam || "");
    setSelectedTag(tagParam || "");
  }, [query, exactParam, categoryParam, tagParam]);

  const { data, isLoading } = api.blog.search.useQuery(
    {
      query,
      page: 1,
      limit: 10,
      exact: exactMatch,
      categoryId: categoryParam || undefined,
      tagId: tagParam || undefined,
    },
    {
      enabled:
        isClient &&
        (query.length >= 3 || // Minimum 3 karakter kontrolü
          Boolean(categoryParam) || // Veya bir kategori seçilmiş
          Boolean(tagParam)), // Veya bir etiket seçilmiş
      staleTime: 60000, // 60 saniye önbellek - performans için
      initialData: initialData,
    },
  );

  // Arama veya filtreleme aktif mi?
  const isFiltering = Boolean(query || categoryParam || tagParam);

  // Arama alanı işleyici
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    // URL parametrelerini oluştur
    const params = new URLSearchParams();

    // Arama sorgusu varsa ekle
    if (localQuery && localQuery.length >= 3) {
      params.set("q", localQuery);
    }

    // Tam eşleşme modunu ekle
    if (exactMatch) {
      params.set("exact", "1");
    }

    // Kategori ve etiket filtrelerini ekle
    if (selectedCategory) {
      params.set("kategori", selectedCategory);
    }

    if (selectedTag) {
      params.set("etiket", selectedTag);
    }

    window.location.href = `/blog/search?${params.toString()}`;
  };

  // Arama modunu değiştir
  const toggleSearchMode = () => {
    setExactMatch((prev) => !prev);
  };

  // Kategori değişikliğini handle et
  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value === "all" ? "" : value);
  };

  // Etiket değişikliğini handle et
  const handleTagChange = (value: string) => {
    setSelectedTag(value === "all" ? "" : value);
  };

  // Tüm filtreleri temizle
  const clearAllFilters = () => {
    setLocalQuery("");
    setExactMatch(false);
    setSelectedCategory("");
    setSelectedTag("");
  };

  // Render a search form
  const renderSearchForm = () => (
    <div className="mb-8 space-y-4">
      <form onSubmit={handleSearch} className="mb-4 flex gap-2">
        <div className="relative max-w-md grow">
          <Input
            type="search"
            placeholder="Blog yazılarında ara..."
            className="pr-10"
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            autoFocus={!query}
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className={`h-8 w-8 ${exactMatch ? "text-primary" : "text-muted-foreground"}`}
                    onClick={() => toggleSearchMode()}
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
        </div>
        <Button
          type="submit"
          disabled={localQuery.length > 0 && localQuery.length < 3}
        >
          <Search className="mr-2 h-4 w-4" />
          Ara
        </Button>
      </form>

      <div className="flex flex-wrap gap-4">
        {/* Kategori filtresi */}
        {categories && categories.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Kategori:</span>
            <Select
              value={selectedCategory || "all"}
              onValueChange={handleCategoryChange}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Kategori Seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tümü</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Etiket filtresi */}
        {tags && tags.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Etiket:</span>
            <Select
              value={selectedTag || "all"}
              onValueChange={handleTagChange}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Etiket Seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tümü</SelectItem>
                {tags.map((tag) => (
                  <SelectItem key={tag.id} value={tag.id}>
                    {tag.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Filtreleri uygula butonu */}
        <Button
          type="button"
          variant="outline"
          onClick={handleSearch}
          disabled={
            !selectedCategory && !selectedTag && !(localQuery.length >= 3)
          }
        >
          Filtreleri Uygula
        </Button>

        {/* Filtreleri temizle butonu */}
        {(selectedCategory || selectedTag || localQuery) && (
          <Button
            type="button"
            variant="ghost"
            onClick={clearAllFilters}
            className="gap-1"
          >
            <FilterX className="h-4 w-4" />
            Temizle
          </Button>
        )}
      </div>
    </div>
  );

  // Aktif filtreleri göster
  const renderActiveFilters = () => {
    if (!isFiltering) return null;

    return (
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {query && (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Search className="h-3 w-3" />
            <span>{query}</span>
          </Badge>
        )}

        {exactMatch && query && (
          <Badge variant="secondary" className="flex items-center gap-1">
            <ScanSearch className="h-3 w-3" />
            <span>Tam eşleşme</span>
          </Badge>
        )}

        {categoryParam && categories && (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Tag className="h-3 w-3" />
            <span>
              {categories.find((c) => c.id === categoryParam)?.name ||
                "Kategori"}
            </span>
          </Badge>
        )}

        {tagParam && tags && (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Tag className="h-3 w-3" />
            <span>{tags.find((t) => t.id === tagParam)?.name || "Etiket"}</span>
          </Badge>
        )}
      </div>
    );
  };

  // Arama terimi çok kısa ise
  if (
    isClient &&
    query.length > 0 &&
    query.length < 3 &&
    !categoryParam &&
    !tagParam
  ) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-16">
        <div className="mb-8 space-y-4">
          <div className="flex items-center gap-2 text-primary">
            <Search className="h-6 w-6" />
            <h1 className="text-4xl font-bold">Arama Sonuçları</h1>
          </div>
          <div className="rounded-lg border bg-amber-50 p-4 text-amber-800 dark:bg-amber-950 dark:text-amber-200">
            <p className="font-medium">
              Lütfen en az 3 karakter içeren bir arama terimi girin veya
              filtrelerden seçim yapın.
            </p>
          </div>
        </div>

        {renderSearchForm()}

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

  if (!isFiltering) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-16">
        <div className="mb-8 space-y-4">
          <div className="flex items-center gap-2 text-primary">
            <Search className="h-6 w-6" />
            <h1 className="text-4xl font-bold">Arama</h1>
          </div>
          <p className="text-muted-foreground">
            Blog yazılarında arama yapın veya kategoriye göre
            filtreleyebilirsiniz
          </p>
        </div>

        {renderSearchForm()}

        <div className="mt-12 rounded-lg border border-dashed p-8 text-center">
          <Search className="mx-auto mb-4 h-12 w-12 text-muted-foreground opacity-40" />
          <h2 className="mb-2 text-xl font-medium">Aramaya Başlayın</h2>
          <p className="mb-6 text-muted-foreground">
            Sağlık ve yazılım konularında blog yazılarında arama yapabilir veya
            kategorileri kullanarak filtreleyebilirsiniz
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
        <div className="flex flex-wrap items-center gap-2">
          {query ? (
            <p className="text-lg text-muted-foreground">
              <span className="font-medium text-foreground">"{query}"</span>{" "}
              için bulunan sonuçlar
            </p>
          ) : (
            <p className="text-lg text-muted-foreground">
              Filtrelenmiş sonuçlar
            </p>
          )}
          {!isLoading && data && data.total > 0 && (
            <Badge variant="outline" className="ml-2">
              <span className="font-medium">{data.total} sonuç</span>
            </Badge>
          )}
        </div>

        {renderActiveFilters()}
      </div>

      {renderSearchForm()}

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
              {query &&
                `"${query}" araması için ${exactMatch ? "tam eşleşme modunda " : ""}`}
              {categoryParam &&
                categories &&
                `"${categories.find((c) => c.id === categoryParam)?.name}" kategorisinde `}
              {tagParam &&
                tags &&
                `"${tags.find((t) => t.id === tagParam)?.name}" etiketinde `}
              hiçbir sonuç bulunamadı.
            </p>

            <div className="mt-8 text-left">
              <h4 className="mb-2 font-medium">Arama ipuçları:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  {exactMatch && query
                    ? "Tam eşleşme modunu kapatarak daha fazla sonuç bulabilirsiniz"
                    : "Daha genel filtreler kullanın"}
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
