"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

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
}) => (
  <div className="flex flex-wrap items-center gap-4">
    {/* Kategori filtresi */}
    {categories && categories.length > 0 && (
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Kategori:</span>
        <Select
          value={categoryParam ?? "all"}
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
        <Select value={tagParam ?? "all"} onValueChange={handleTagChange}>
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
  </div>
);

export function PaginatedPosts({
  initialData,
  showAdminControls = false,
}: {
  initialData?: PaginatedPostsOutput;
  showAdminControls?: boolean;
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
  const { data, isLoading } = api.blog.getPaginated.useQuery(
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
    // Create new URLSearchParams
    const params = new URLSearchParams(searchParams?.toString());

    // Reset to page 1 when changing category
    params.set("sayfa", "1");

    if (value === "all") {
      params.delete("kategori");
    } else {
      params.set("kategori", value);
    }

    // Navigate with the new params
    router.push(`/blog?${params.toString()}`);
  };

  const handleTagChange = (value: string) => {
    // Create new URLSearchParams
    const params = new URLSearchParams(searchParams?.toString());

    // Reset to page 1 when changing tag
    params.set("sayfa", "1");

    if (value === "all") {
      params.delete("etiket");
    } else {
      params.set("etiket", value);
    }

    // Navigate with the new params
    router.push(`/blog?${params.toString()}`);
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
        <FilterUI
          categories={categories}
          tags={tags}
          categoryParam={categoryParam}
          tagParam={tagParam}
          handleCategoryChange={handleCategoryChange}
          handleTagChange={handleTagChange}
        />
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
        <FilterUI
          categories={categories}
          tags={tags}
          categoryParam={categoryParam}
          tagParam={tagParam}
          handleCategoryChange={handleCategoryChange}
          handleTagChange={handleTagChange}
        />
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
      <FilterUI
        categories={categories}
        tags={tags}
        categoryParam={categoryParam}
        tagParam={tagParam}
        handleCategoryChange={handleCategoryChange}
        handleTagChange={handleTagChange}
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {data.posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            showAdminControls={showAdminControls}
            onDeleteClick={handleDeleteClick}
          />
        ))}
      </div>

      {renderPagination()}

      <ConfirmDialog
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        title="Yazıyı Sil"
        description={`"${postToDelete?.title}" başlıklı yazıyı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`}
        confirmText="Sil"
        cancelText="İptal"
        onConfirm={confirmDelete}
        isLoading={deletePostMutation.isPending}
      />
    </div>
  );
}
