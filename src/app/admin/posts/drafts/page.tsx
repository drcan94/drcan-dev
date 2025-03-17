"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { PostCard } from "@/components/blog/PostCard";

export default function DraftsPage() {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<{
    id: string;
    title: string;
  } | null>(null);

  const utils = api.useUtils();
  const { data: posts, isLoading, error } = api.blog.getDrafts.useQuery();

  // Handle error
  useEffect(() => {
    if (error) {
      toast.error(`Taslaklar yüklenirken hata oluştu: ${error.message}`);
    }
  }, [error]);

  const deletePost = api.blog.delete.useMutation({
    onSuccess: () => {
      toast.success("Yazı başarıyla silindi");
      void utils.blog.getDrafts.invalidate();
      void utils.blog.getAll.invalidate();
      setDeletingId(null);
    },
    onError: (error) => {
      toast.error(`Yazı silinirken hata oluştu: ${error.message}`);
      setDeletingId(null);
    },
    onSettled: () => {
      setPostToDelete(null);
    },
  });

  const handleDeleteClick = (id: string, title: string) => {
    setPostToDelete({ id, title });
    setConfirmDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (postToDelete) {
      setDeletingId(postToDelete.id);
      deletePost.mutate({ id: postToDelete.id });
      setConfirmDialogOpen(false);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Taslaklar</h1>
          <p className="text-muted-foreground">
            Yayınlanmamış yazılarınızı yönetin
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/posts/new">
            <Plus className="mr-2 h-4 w-4" />
            Yeni Yazı
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-lg border bg-muted/10"
            />
          ))}
        </div>
      ) : (
        <>
          {posts && posts.length > 0 ? (
            <div className="rounded-lg border bg-card">
              <div className="divide-y px-6">
                {posts.map((post) => (
                  <div key={post.id}>
                    <PostCard
                      post={post}
                      variant="compact"
                      showAdminControls={true}
                      onDeleteClick={(id, title) => {
                        if (deletingId !== id) {
                          handleDeleteClick(id, title);
                        }
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-dashed p-12 text-center">
              <h3 className="mb-2 text-lg font-medium">Taslak bulunamadı</h3>
              <p className="mb-6 text-muted-foreground">
                Henüz taslağınız bulunmamaktadır. Yeni bir yazı oluşturmaya
                başlayın!
              </p>
              <Button asChild>
                <Link href="/admin/posts/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Yeni Yazı Oluştur
                </Link>
              </Button>
            </div>
          )}
        </>
      )}

      <ConfirmDialog
        open={confirmDialogOpen}
        onOpenChange={setConfirmDialogOpen}
        title="Yazıyı Sil"
        description={`"${postToDelete?.title}" başlıklı yazıyı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`}
        confirmText="Sil"
        cancelText="İptal"
        onConfirm={handleConfirmDelete}
        isLoading={!!deletingId}
      />
    </div>
  );
}
