"use client";

import { useState } from "react";
import { Edit, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ConfirmDialog } from "@/components/confirm-dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function TagManagement() {
  const [newTagName, setNewTagName] = useState("");
  const [editTagId, setEditTagId] = useState<string | null>(null);
  const [editTagName, setEditTagName] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [tagToDelete, setTagToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const { data: tags, isLoading } = api.tag.getAll.useQuery();
  const utils = api.useUtils();

  // Create tag mutation
  const createTagMutation = api.tag.create.useMutation({
    onSuccess: () => {
      toast.success("Etiket başarıyla oluşturuldu");
      setNewTagName("");
      void utils.tag.getAll.invalidate();
    },
    onError: (error) => {
      toast.error(`Hata: ${error.message}`);
    },
  });

  // Update tag mutation
  const updateTagMutation = api.tag.update.useMutation({
    onSuccess: () => {
      toast.success("Etiket başarıyla güncellendi");
      setEditTagId(null);
      setEditTagName("");
      void utils.tag.getAll.invalidate();
    },
    onError: (error) => {
      toast.error(`Hata: ${error.message}`);
    },
  });

  // Delete tag mutation
  const deleteTagMutation = api.tag.delete.useMutation({
    onSuccess: () => {
      toast.success("Etiket başarıyla silindi");
      setTagToDelete(null);
      setIsDeleteModalOpen(false);
      void utils.tag.getAll.invalidate();
    },
    onError: (error) => {
      toast.error(`Hata: ${error.message}`);
    },
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTagName.trim()) {
      createTagMutation.mutate({ name: newTagName });
    } else {
      toast.error("Etiket adı gereklidir");
    }
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editTagId && editTagName.trim()) {
      updateTagMutation.mutate({ id: editTagId, name: editTagName });
    } else {
      toast.error("Etiket adı gereklidir");
    }
  };

  const handleDeleteClick = (id: string, name: string) => {
    setTagToDelete({ id, name });
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (tagToDelete) {
      deleteTagMutation.mutate({ id: tagToDelete.id });
    }
  };

  const startEdit = (id: string, name: string) => {
    setEditTagId(id);
    setEditTagName(name);
  };

  const cancelEdit = () => {
    setEditTagId(null);
    setEditTagName("");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Etiket Yönetimi</CardTitle>
        <CardDescription>
          Blogunuz için etiketleri ekleyin, düzenleyin veya silin
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <form onSubmit={handleCreateSubmit} className="flex items-end gap-2">
            <div className="flex-1 space-y-2">
              <Label htmlFor="newTag">Yeni Etiket</Label>
              <Input
                id="newTag"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder="Etiket adı girin"
                disabled={createTagMutation.isPending}
              />
            </div>
            <Button
              type="submit"
              size="sm"
              className="mb-px"
              disabled={createTagMutation.isPending}
            >
              {createTagMutation.isPending ? (
                "Ekleniyor..."
              ) : (
                <>
                  <Plus className="mr-1 h-4 w-4" />
                  Ekle
                </>
              )}
            </Button>
          </form>

          <div className="space-y-2">
            <h3 className="text-sm font-medium">Mevcut Etiketler</h3>
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Yükleniyor...</p>
            ) : !tags || tags.length === 0 ? (
              <p className="text-sm text-muted-foreground">Henüz etiket yok</p>
            ) : (
              <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
                {tags.map((tag) => (
                  <div key={tag.id} className="rounded-md border p-3">
                    {editTagId === tag.id ? (
                      <form onSubmit={handleEditSubmit} className="space-y-2">
                        <Input
                          value={editTagName}
                          onChange={(e) => setEditTagName(e.target.value)}
                          placeholder="Etiket adı girin"
                          className="w-full"
                          disabled={updateTagMutation.isPending}
                        />
                        <div className="flex gap-1">
                          <Button
                            type="submit"
                            size="sm"
                            className="w-full"
                            disabled={updateTagMutation.isPending}
                          >
                            {updateTagMutation.isPending ? "..." : "Kaydet"}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={cancelEdit}
                            disabled={updateTagMutation.isPending}
                          >
                            İptal
                          </Button>
                        </div>
                      </form>
                    ) : (
                      <div>
                        <div className="mb-2 flex items-center justify-between">
                          <span className="font-medium">{tag.name}</span>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => startEdit(tag.id, tag.name)}
                            >
                              <Edit className="h-3 w-3" />
                              <span className="sr-only">Düzenle</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleDeleteClick(tag.id, tag.name)
                              }
                            >
                              <Trash2 className="h-3 w-3" />
                              <span className="sr-only">Sil</span>
                            </Button>
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {tag.slug}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>

      <ConfirmDialog
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        title="Etiketi Sil"
        description={`"${tagToDelete?.name}" etiketini silmek istediğinize emin misiniz? Bu etiket tüm yazılardan kaldırılacaktır.`}
        confirmText="Sil"
        cancelText="İptal"
        onConfirm={confirmDelete}
        isLoading={deleteTagMutation.isPending}
      />
    </Card>
  );
}
