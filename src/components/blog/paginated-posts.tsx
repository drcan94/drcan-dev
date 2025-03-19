"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Filter, ChevronUp, ChevronDown } from "lucide-react";

import { api } from "@/trpc/react";
import { type PaginatedPostsOutput } from "@/types";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { toast } from "sonner";
import { PostCard } from "@/components/blog/PostCard";

const POSTS_PER_PAGE = 9;

const FilterUI = ({
  categories,
  tags,
  categoryParam,
  tagParam,
  handleCategoryChange,
  handleTagChange,
}: {
  categories: any[] | undefined;
  tags: any[] | undefined;
  categoryParam: string | null;
  tagParam: string | null;
  handleCategoryChange: (value: string) => void;
  handleTagChange: (value: string) => void;
}) => {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  // Aktif filtre var mı kontrol et
  const hasActiveFilters = categoryParam !== null || tagParam !== null;

  // Mobil ekranda mıyız?
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
    setIsFiltersOpen(!isMobile);
  }, [isMobile]);

  return (
    <div className="mb-6 w-full rounded-lg border bg-card shadow-sm">
      <button
        onClick={() => setIsFiltersOpen(!isFiltersOpen)}
        className="flex w-full items-center justify-between p-3 text-left"
      >
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-primary" />
          <span className="font-medium">Filtreler</span>
          {hasActiveFilters && (
            <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
              Aktif
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          {isFiltersOpen ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </div>
      </button>

      {isFiltersOpen && (
        <div className="border-t p-3">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Kategori filtresi */}
            {categories && categories.length > 0 && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Kategori</label>
                <Select
                  value={categoryParam ?? "all"}
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
                  value={tagParam ?? "all"}
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
        </div>
      )}
    </div>
  );
};

export function PaginatedPosts({
  initialData,
  showAdminControls = false,
  showFilters = true,
}: {
  initialData?: PaginatedPostsOutput;
  showAdminControls?: boolean;
  showFilters?: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pageParam = searchParams?.get("sayfa");
  const categoryParam = searchParams?.get("kategori");
  const tagParam = searchParams?.get("etiket");
  const currentPage = pageParam ? parseInt(pageParam) : 1;

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<{
    id: string;
    title: string;
  } | null>(null);

  // Get categories for filter
  const { data: categories } = api.category.getAll.useQuery();

  // Get tags for filter
  const { data: tags } = api.tag.getAll.useQuery();

  // Get paginated posts
  const { data, isLoading, isFetching } = api.blog.getPaginated.useQuery(
    {
      page: currentPage,
      limit: POSTS_PER_PAGE,
      categoryId: categoryParam ?? undefined,
      tagId: tagParam ?? undefined,
    },
    {
      initialData,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
    },
  );

  const utils = api.useUtils();

  // Delete post mutation
  const deletePostMutation = api.blog.delete.useMutation({
    onSuccess: () => {
      toast.success("Yazı başarıyla silindi");
      void utils.blog.getPaginated.invalidate();
      void utils.blog.getAll.invalidate();
      setIsDeleteModalOpen(false);
      setPostToDelete(null);
    },
    onError: (error) => {
      toast.error(`Hata: ${error.message}`);
    },
  });

  const handleDeleteClick = (id: string, title: string) => {
    setPostToDelete({ id, title });
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (postToDelete) {
      deletePostMutation.mutate({ id: postToDelete.id });
    }
  };

  const handleCategoryChange = (value: string) => {
    // Yükleniyor durumunu göster
    const loadingToast = toast.loading("Kategori filtreleniyor...");

    // Create new URLSearchParams
    const params = new URLSearchParams(searchParams?.toString());

    // Reset to page 1 when changing category
    params.set("sayfa", "1");

    // Kategori değişikliğini ayarla
    let categoryName = "Tüm kategoriler";
    if (value === "all") {
      params.delete("kategori");
    } else {
      params.set("kategori", value);
      // Seçilen kategorinin adını bul
      const selectedCategory = categories?.find((c) => c.id === value);
      if (selectedCategory) {
        categoryName = selectedCategory.name;
      }
    }

    // Arama sayfasına yönlendir
    setTimeout(() => {
      // Bildirimi kapat
      toast.dismiss(loadingToast);

      // Başarılı bildirimi göster
      if (value === "all") {
        toast.success("Tüm kategoriler gösteriliyor");
      } else {
        toast.success(
          `"${categoryName}" kategorisine ait sonuçlar gösteriliyor`,
        );
      }

      // Sayfayı yönlendir
      router.push(`/blog/search?${params.toString()}`);
    }, 600); // Kısa bir gecikme ekleyerek yükleniyor hissini verelim
  };

  const handleTagChange = (value: string) => {
    // Yükleniyor durumunu göster
    const loadingToast = toast.loading("Etiket filtreleniyor...");

    // Create new URLSearchParams
    const params = new URLSearchParams(searchParams?.toString());

    // Reset to page 1 when changing tag
    params.set("sayfa", "1");

    // Etiket değişikliğini ayarla
    let tagName = "Tüm etiketler";
    if (value === "all") {
      params.delete("etiket");
    } else {
      params.set("etiket", value);
      // Seçilen etiketin adını bul
      const selectedTag = tags?.find((t) => t.id === value);
      if (selectedTag) {
        tagName = selectedTag.name;
      }
    }

    // Arama sayfasına yönlendir
    setTimeout(() => {
      // Bildirimi kapat
      toast.dismiss(loadingToast);

      // Başarılı bildirimi göster
      if (value === "all") {
        toast.success("Tüm etiketler gösteriliyor");
      } else {
        toast.success(`"${tagName}" etiketine ait sonuçlar gösteriliyor`);
      }

      // Sayfayı yönlendir
      router.push(`/blog/search?${params.toString()}`);
    }, 600); // Kısa bir gecikme ekleyerek yükleniyor hissini verelim
  };

  const renderPagination = () => {
    if (!data || data.totalPages <= 1) return null;

    // Calculate which page numbers to show
    const pageNumbers = [];
    const ellipsisAdded = { start: false, end: false };

    for (let i = 1; i <= data.totalPages; i++) {
      if (
        i === 1 || // Always show first page
        i === data.totalPages || // Always show last page
        (i >= currentPage - 1 && i <= currentPage + 1) // Show pages around current
      ) {
        pageNumbers.push(i);
      } else if (i < currentPage && !ellipsisAdded.start) {
        pageNumbers.push("ellipsis-start");
        ellipsisAdded.start = true;
      } else if (i > currentPage && !ellipsisAdded.end) {
        pageNumbers.push("ellipsis-end");
        ellipsisAdded.end = true;
      }
    }

    // Create URL with current parameters but changed page
    const createPageUrl = (page: number) => {
      const params = new URLSearchParams(searchParams?.toString());
      params.set("sayfa", page.toString());

      // Sayfanın bulunduğu URL'yi kontrol et
      const isSearchPage = window.location.pathname.includes("/blog/search");

      // Arama sayfasında veya filtre varsa search sayfasına yönlendir
      if (isSearchPage || categoryParam || tagParam) {
        return `/blog/search?${params.toString()}`;
      }

      // Normal blog sayfasında sayfalam
      return `/blog?${params.toString()}`;
    };

    return (
      <Pagination className="mt-8">
        <PaginationContent>
          {currentPage > 1 && (
            <PaginationItem>
              <PaginationPrevious href={createPageUrl(currentPage - 1)} />
            </PaginationItem>
          )}

          {pageNumbers.map((page, i) => {
            if (page === "ellipsis-start" || page === "ellipsis-end") {
              return (
                <PaginationItem key={`ellipsis-${page}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              );
            }

            return (
              <PaginationItem key={`page-${page}`}>
                <PaginationLink
                  href={createPageUrl(page as number)}
                  isActive={page === currentPage}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            );
          })}

          {currentPage < data.totalPages && (
            <PaginationItem>
              <PaginationNext href={createPageUrl(currentPage + 1)} />
            </PaginationItem>
          )}
        </PaginationContent>
      </Pagination>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {showFilters && (
          <FilterUI
            categories={categories}
            tags={tags}
            categoryParam={categoryParam}
            tagParam={tagParam}
            handleCategoryChange={handleCategoryChange}
            handleTagChange={handleTagChange}
          />
        )}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: POSTS_PER_PAGE }).map((_, index) => (
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
      </div>
    );
  }

  if (!data || data.posts.length === 0) {
    return (
      <div className="space-y-6">
        {showFilters && (
          <FilterUI
            categories={categories}
            tags={tags}
            categoryParam={categoryParam}
            tagParam={tagParam}
            handleCategoryChange={handleCategoryChange}
            handleTagChange={handleTagChange}
          />
        )}
        <div className="rounded-lg border border-dashed p-12 text-center">
          <h3 className="mb-2 text-lg font-medium">Yazı bulunamadı</h3>
          <p className="text-muted-foreground">
            {categoryParam && tagParam
              ? "Seçili kategori ve etiket kombinasyonunda yazı bulunmamaktadır."
              : categoryParam
                ? "Seçili kategoride yazı bulunmamaktadır."
                : tagParam
                  ? "Seçili etikette yazı bulunmamaktadır."
                  : "Henüz yazı bulunmamaktadır veya yakında yeni yazılar eklenecektir."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {showFilters && (
        <FilterUI
          categories={categories}
          tags={tags}
          categoryParam={categoryParam}
          tagParam={tagParam}
          handleCategoryChange={handleCategoryChange}
          handleTagChange={handleTagChange}
        />
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isFetching || isLoading ? (
          <>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-4 rounded-lg border p-6">
                <Skeleton className="h-5 w-2/3" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-5 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            ))}
          </>
        ) : data?.posts.length === 0 ? (
          <div className="col-span-3 rounded-lg border p-8 text-center">
            <p className="text-muted-foreground">
              Gösterilecek yazı bulunamadı.
            </p>
          </div>
        ) : (
          <>
            {data?.posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                showAdminControls={showAdminControls}
                onDeleteClick={
                  showAdminControls
                    ? () => handleDeleteClick(post.id, post.title)
                    : undefined
                }
              />
            ))}
          </>
        )}
      </div>

      {data && data.totalPages > 1 && renderPagination()}

      {/* Silme onay dialogu */}
      <ConfirmDialog
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        onConfirm={confirmDelete}
        title="Yazıyı Sil"
        description={`"${postToDelete?.title}" yazısını silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`}
        confirmText="Evet, Sil"
        cancelText="İptal"
        isLoading={deletePostMutation.isPending}
      />
    </div>
  );
}
