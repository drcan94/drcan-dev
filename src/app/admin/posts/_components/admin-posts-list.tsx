"use client";

import { useSearchParams } from "next/navigation";
import { PostCard } from "@/components/blog/PostCard";
import { api } from "@/trpc/react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { toast } from "sonner";
import { useState } from "react";

const POSTS_PER_PAGE = 10;

export function AdminPostsList() {
  const searchParams = useSearchParams();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<{
    id: string;
    title: string;
  } | null>(null);

  // Get URL params
  const page = searchParams?.get("sayfa")
    ? parseInt(searchParams.get("sayfa")!)
    : 1;
  const query = searchParams?.get("q") || undefined;
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

  // Get posts with filters
  const { data, isLoading } = api.blog.getAllForAdmin.useQuery(
    {
      page,
      limit: POSTS_PER_PAGE,
      query,
      published,
      categoryId,
      tagId,
      fromDate,
      toDate,
      sortBy,
      sortDirection,
    },
    {
      staleTime: 60000,
    },
  );

  const utils = api.useUtils();

  // Delete post mutation
  const deletePostMutation = api.blog.delete.useMutation({
    onSuccess: () => {
      toast.success("Yazı başarıyla silindi");
      void utils.blog.getAllForAdmin.invalidate();
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

  // Create pagination URL
  const createPageUrl = (pageNum: number) => {
    const params = new URLSearchParams(searchParams?.toString());
    params.set("sayfa", pageNum.toString());
    return `/admin/posts?${params.toString()}`;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: POSTS_PER_PAGE }).map((_, index) => (
          <div key={`skeleton-${index}`} className="rounded-lg border p-4">
            <Skeleton className="mb-2 h-6 w-2/3" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-6 rounded-full" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!data || data.posts.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-12 text-center">
        <h3 className="mb-2 text-lg font-medium">Yazı bulunamadı</h3>
        <p className="text-muted-foreground">
          Seçilen filtrelere uygun yazı bulunmamaktadır.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">
        Toplam {data.total} yazı bulundu
      </div>

      {/* Posts list */}
      <div className="space-y-4">
        {data.posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            variant="compact"
            showAdminControls
            onDeleteClick={handleDeleteClick}
          />
        ))}
      </div>

      {/* Pagination */}
      {data.totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            {page > 1 && (
              <PaginationItem>
                <PaginationPrevious href={createPageUrl(page - 1)} />
              </PaginationItem>
            )}

            {Array.from({ length: data.totalPages }).map((_, index) => {
              const pageNum = index + 1;
              // Show first page, last page, and pages around current page
              if (
                pageNum === 1 ||
                pageNum === data.totalPages ||
                (pageNum >= page - 1 && pageNum <= page + 1)
              ) {
                return (
                  <PaginationItem key={pageNum}>
                    <PaginationLink
                      href={createPageUrl(pageNum)}
                      isActive={pageNum === page}
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                );
              }
              // Show ellipsis for skipped pages
              if (
                (pageNum === 2 && page > 3) ||
                (pageNum === data.totalPages - 1 && page < data.totalPages - 2)
              ) {
                return (
                  <PaginationItem key={`ellipsis-${pageNum}`}>
                    <PaginationEllipsis />
                  </PaginationItem>
                );
              }
              return null;
            })}

            {page < data.totalPages && (
              <PaginationItem>
                <PaginationNext href={createPageUrl(page + 1)} />
              </PaginationItem>
            )}
          </PaginationContent>
        </Pagination>
      )}

      {/* Delete confirmation dialog */}
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
