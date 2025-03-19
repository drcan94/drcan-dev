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
  ChevronDown,
  ChevronUp,
  X,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

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

  // Mobil ekran için filtre panelinin gösterilip gösterilmediğini kontrol et
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Ekran boyutunu kontrol et
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // İlk yükleme kontrolü
    checkScreenSize();

    // Ekran boyutu değiştiğinde kontrol et
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // PC ekranda filtreleri her zaman açık tut, mobilde kapat
  useEffect(() => {
    setIsFilterPanelOpen(!isMobile);
  }, [isMobile]);

  // Kategorileri ve etiketleri alma
  const { data: categories } = api.category.getAll.useQuery(undefined, {
    initialData: initialCategories,
    enabled: !initialCategories,
  });

  const { data: tags } = api.tag.getAll.useQuery(undefined, {
    initialData: initialTags,
    enabled: !initialTags,
  });

  // Set isClient to true on component mount and sync state with URL parameters
  useEffect(() => {
    if (!isClient) {
      setIsClient(true);
    }

    // URL ile state senkronizasyonu
    setLocalQuery(query);
    setExactMatch(exactParam === "1");

    // URL'deki kategori/etiket parametrelerini state ile senkronize et
    setSelectedCategory(categoryParam || "");
    setSelectedTag(tagParam || "");
  }, [query, exactParam, categoryParam, tagParam, isClient]);

  const { data, isLoading } = api.blog.search.useQuery(
    {
      query: query || "",
      page: 1,
      limit: 10,
      exact: exactMatch,
      categoryId: categoryParam || undefined,
      tagId: tagParam || undefined,
    },
    {
      enabled:
        isClient &&
        ((query && query.length >= 3) || // Minimum 3 karakter kontrolü
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
    let hasCriteria = false;

    // Arama sorgusu varsa ekle
    if (localQuery && localQuery.length >= 3) {
      params.set("q", localQuery);
      hasCriteria = true;
    }

    // Tam eşleşme modunu ekle
    if (exactMatch) {
      params.set("exact", "1");
    }

    // Kategori ve etiket filtrelerini ekle
    if (selectedCategory) {
      params.set("kategori", selectedCategory);
      hasCriteria = true;
    }

    if (selectedTag) {
      params.set("etiket", selectedTag);
      hasCriteria = true;
    }

    // Hiçbir filtre seçilmediyse uyarı ver
    if (!hasCriteria) {
      toast.error("Lütfen bir arama terimi girin veya filtre seçin");
      return;
    }

    // Yükleniyor bildirimi göster
    const loadingToast = toast.loading("Arama sonuçları getiriliyor...");

    // Yükleme hissi için kısa bir gecikme ekle
    setTimeout(() => {
      toast.dismiss(loadingToast);
      window.location.href = `/blog/search?${params.toString()}`;
    }, 600);
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
    // State'i temizle
    setLocalQuery("");
    setExactMatch(false);
    setSelectedCategory("");
    setSelectedTag("");

    // Yükleniyor bildirimi göster
    const loadingToast = toast.loading("Filtreler temizleniyor...");

    // Sayfayı filtresiz olarak yeniden yükle
    setTimeout(() => {
      toast.dismiss(loadingToast);
      toast.success("Tüm filtreler temizlendi");
      window.location.href = `/blog/search`;
    }, 500);
  };

  // Belirli bir filtreyi temizle
  const clearSingleFilter = (type: "query" | "exact" | "category" | "tag") => {
    const params = new URLSearchParams(searchParams?.toString() || "");
    let message = "";

    switch (type) {
      case "query":
        params.delete("q");
        params.delete("exact");
        message = "Arama terimi kaldırıldı";
        break;
      case "exact":
        params.delete("exact");
        message = "Tam eşleşme modu kapatıldı";
        break;
      case "category":
        const categoryName =
          categories?.find((c) => c.id === categoryParam)?.name || "Kategori";
        params.delete("kategori");
        message = `"${categoryName}" filtresi kaldırıldı`;
        break;
      case "tag":
        const tagName = tags?.find((t) => t.id === tagParam)?.name || "Etiket";
        params.delete("etiket");
        message = `"${tagName}" filtresi kaldırıldı`;
        break;
    }

    // Yükleniyor bildirimi göster
    const loadingToast = toast.loading("Filtre kaldırılıyor...");

    // Eğer hiç parametre kalmadıysa, ana arama sayfasına yönlendir
    setTimeout(() => {
      toast.dismiss(loadingToast);
      toast.success(message);

      const newUrl = params.toString()
        ? `/blog/search?${params.toString()}`
        : "/blog/search";

      window.location.href = newUrl;
    }, 500);
  };

  // Render a search form
  const renderSearchForm = () => (
    <div className="mb-6">
      {/* Ana arama formu ve filtre toggle butonu */}
      <div className="mb-3 flex w-full flex-wrap gap-2">
        <form onSubmit={handleSearch} className="flex flex-1 gap-1">
          <div className="relative flex-1">
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
            <span className="hidden sm:inline">Ara</span>
          </Button>
        </form>

        {/* Filtre düğmesi (mobile için) */}
        <Button
          type="button"
          variant="outline"
          className="flex items-center gap-1"
          onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
        >
          <Filter className="h-4 w-4" />
          <span>Filtreler</span>
          {(selectedCategory || selectedTag) && (
            <span className="ml-1 rounded-full bg-primary px-1.5 py-0.5 text-[10px] leading-none text-primary-foreground">
              {[selectedCategory, selectedTag].filter(Boolean).length}
            </span>
          )}
          {isFilterPanelOpen ? (
            <ChevronUp className="ml-1 h-3 w-3" />
          ) : (
            <ChevronDown className="ml-1 h-3 w-3" />
          )}
        </Button>
      </div>

      {/* Açılabilir Filtre Paneli */}
      {isFilterPanelOpen && (
        <div className="mb-4 rounded-lg border bg-card p-3 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-medium">Filtreleme Seçenekleri</h3>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setIsFilterPanelOpen(false)}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Kapat</span>
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Kategori filtresi */}
            {categories && categories.length > 0 && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Kategori</label>
                <Select
                  value={selectedCategory || "all"}
                  onValueChange={handleCategoryChange}
                >
                  <SelectTrigger className="w-full">
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
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Etiket</label>
                <Select
                  value={selectedTag || "all"}
                  onValueChange={handleTagChange}
                >
                  <SelectTrigger className="w-full">
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
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {/* Filtreleri uygula butonu */}
            <Button
              type="button"
              variant="default"
              onClick={handleSearch}
              className="flex-1"
            >
              Uygula
            </Button>

            {/* Filtreleri temizle butonu */}
            <Button
              type="button"
              variant="outline"
              onClick={clearAllFilters}
              className="flex-1 gap-1"
            >
              <FilterX className="h-4 w-4" />
              Temizle
            </Button>
          </div>
        </div>
      )}
    </div>
  );

  // Aktif filtreleri göster
  const renderActiveFilters = () => {
    if (!isFiltering) return null;

    return (
      <div className="mb-3 flex flex-wrap items-center gap-2">
        {query && (
          <Badge
            variant="secondary"
            className="group flex cursor-pointer items-center gap-1"
            onClick={() => clearSingleFilter("query")}
          >
            <Search className="h-3 w-3" />
            <span>{query}</span>
            <span className="ml-1 opacity-60 group-hover:opacity-100">×</span>
          </Badge>
        )}

        {exactMatch && query && (
          <Badge
            variant="secondary"
            className="group flex cursor-pointer items-center gap-1"
            onClick={() => clearSingleFilter("exact")}
          >
            <ScanSearch className="h-3 w-3" />
            <span>Tam eşleşme</span>
            <span className="ml-1 opacity-60 group-hover:opacity-100">×</span>
          </Badge>
        )}

        {categoryParam && categories && (
          <Badge
            variant="secondary"
            className="group flex cursor-pointer items-center gap-1"
            onClick={() => clearSingleFilter("category")}
          >
            <Tag className="h-3 w-3" />
            <span>
              {categories.find((c) => c.id === categoryParam)?.name ||
                "Kategori"}
            </span>
            <span className="ml-1 opacity-60 group-hover:opacity-100">×</span>
          </Badge>
        )}

        {tagParam && tags && (
          <Badge
            variant="secondary"
            className="group flex cursor-pointer items-center gap-1"
            onClick={() => clearSingleFilter("tag")}
          >
            <Tag className="h-3 w-3" />
            <span>{tags.find((t) => t.id === tagParam)?.name || "Etiket"}</span>
            <span className="ml-1 opacity-60 group-hover:opacity-100">×</span>
          </Badge>
        )}

        {isFiltering && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="h-7 gap-1 px-2"
          >
            <FilterX className="h-3 w-3" />
            <span className="text-xs">Tümünü Temizle</span>
          </Button>
        )}
      </div>
    );
  };

  // Ana render fonksiyonları
  if (
    isClient &&
    query.length > 0 &&
    query.length < 3 &&
    !categoryParam &&
    !tagParam
  ) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-6 md:py-12">
        <div className="mb-4 space-y-3">
          <div className="flex items-center gap-2 text-primary">
            <Search className="h-5 w-5 md:h-6 md:w-6" />
            <h1 className="text-2xl font-bold md:text-4xl">Arama Sonuçları</h1>
          </div>
          <div className="rounded-lg border bg-amber-50 p-3 text-amber-800 dark:bg-amber-950 dark:text-amber-200">
            <p className="font-medium">
              Lütfen en az 3 karakter içeren bir arama terimi girin veya
              filtrelerden seçim yapın.
            </p>
          </div>
        </div>

        {renderSearchForm()}

        <Button variant="outline" asChild size="sm" className="mt-2">
          <Link href="/blog" className="flex items-center gap-1">
            <ArrowLeft className="h-3 w-3" />
            Blog Yazılarına Dön
          </Link>
        </Button>
      </div>
    );
  }

  if (!isClient) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-6 md:py-12">
        <div className="mb-6 space-y-3">
          <div className="flex items-center gap-2 text-primary">
            <Search className="h-5 w-5 md:h-6 md:w-6" />
            <h1 className="text-2xl font-bold md:text-4xl">Arama Sonuçları</h1>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <p>Yükleniyor...</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-4 rounded-lg border p-4 md:p-6">
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
      <div className="container mx-auto max-w-4xl px-4 py-6 md:py-12">
        <div className="mb-4 space-y-3">
          <div className="flex items-center gap-2 text-primary">
            <Search className="h-5 w-5 md:h-6 md:w-6" />
            <h1 className="text-2xl font-bold md:text-4xl">Arama</h1>
          </div>
          <p className="text-muted-foreground">
            Blog yazılarında arama yapın veya filtreleyebilirsiniz
          </p>
        </div>

        {renderSearchForm()}

        <div className="mt-8 rounded-lg border border-dashed p-6 text-center">
          <Search className="mx-auto mb-4 h-10 w-10 text-muted-foreground opacity-40" />
          <h2 className="mb-2 text-lg font-medium">Aramaya Başlayın</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Blog yazılarında arama yapabilir veya kategorileri kullanarak
            filtreleyebilirsiniz
          </p>
          <Button variant="outline" asChild size="sm">
            <Link href="/blog" className="flex items-center gap-1">
              <ArrowLeft className="h-3 w-3" />
              Blog Yazılarına Dön
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-6 md:py-12">
      <div className="mb-4 space-y-3">
        <div className="flex items-center gap-2 text-primary">
          <Search className="h-5 w-5 md:h-6 md:w-6" />
          <h1 className="text-2xl font-bold md:text-4xl">Arama Sonuçları</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {query ? (
            <p className="text-base text-muted-foreground md:text-lg">
              <span className="font-medium text-foreground">"{query}"</span>{" "}
              için bulunan sonuçlar
            </p>
          ) : (
            <p className="text-base text-muted-foreground md:text-lg">
              Filtrelenmiş sonuçlar
            </p>
          )}
          {!isLoading && data && data.total > 0 && (
            <Badge variant="outline" className="ml-1">
              <span className="font-medium">{data.total} sonuç</span>
            </Badge>
          )}
        </div>

        {renderActiveFilters()}
      </div>

      {renderSearchForm()}

      <Button variant="outline" asChild size="sm" className="mb-4">
        <Link href="/blog" className="flex items-center gap-1">
          <ArrowLeft className="h-3 w-3" />
          Blog'a Dön
        </Link>
      </Button>

      {isLoading ? (
        <div className="rounded-lg border p-6">
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <p className="font-medium">Arama yapılıyor...</p>
          </div>
        </div>
      ) : data && data.posts.length > 0 ? (
        <div className="space-y-6">
          <PaginatedPosts
            initialData={data as unknown as PaginatedPostsType}
            showFilters={false}
          />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="rounded-lg border border-dashed p-6 text-center md:p-10">
            <Search className="mx-auto mb-4 h-10 w-10 text-muted-foreground opacity-40" />
            <h3 className="mb-2 text-lg font-medium">Sonuç bulunamadı</h3>
            <p className="mb-4 text-sm text-muted-foreground">
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

            <div className="mt-6 text-left">
              <h4 className="mb-2 text-sm font-medium">Arama ipuçları:</h4>
              <ul className="space-y-1 text-xs text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Tag className="h-3 w-3" />
                  {exactMatch && query
                    ? "Tam eşleşme modunu kapatarak daha fazla sonuç bulabilirsiniz"
                    : "Daha genel filtreler kullanın"}
                </li>
                <li className="flex items-center gap-2">
                  <Calendar className="h-3 w-3" /> Yazım hatalarını kontrol edin
                </li>
                <li className="flex items-center gap-2">
                  <Clock className="h-3 w-3" /> Farklı terimlerle tekrar deneyin
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
