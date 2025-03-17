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

export function CategoryManagement() {
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editCategoryId, setEditCategoryId] = useState<string | null>(null);
  const [editCategoryName, setEditCategoryName] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const { data: categories, isLoading } = api.category.getAll.useQuery();
  const utils = api.useUtils();

  // Create category mutation
  const createCategory = api.category.create.useMutation({
    onSuccess: () => {
      toast.success("Kategori başarıyla oluşturuldu");
      setNewCategoryName("");
      void utils.category.getAll.invalidate();
    },
    onError: (error) => {
      toast.error(`Hata: ${error.message}`);
    },
  });

  // Update category mutation
  const updateCategory = api.category.update.useMutation({
    onSuccess: () => {
      toast.success("Kategori başarıyla güncellendi");
      setEditCategoryId(null);
      setEditCategoryName("");
      void utils.category.getAll.invalidate();
    },
    onError: (error) => {
      toast.error(`Hata: ${error.message}`);
    },
  });

  // Delete category mutation
  const deleteCategory = api.category.delete.useMutation({
    onSuccess: () => {
      toast.success("Kategori başarıyla silindi");
      setCategoryToDelete(null);
      setIsDeleteModalOpen(false);
      void utils.category.getAll.invalidate();
    },
    onError: (error) => {
      toast.error(`Hata: ${error.message}`);
    },
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCategoryName.trim()) {
      createCategory.mutate({ name: newCategoryName });
    } else {
      toast.error("Kategori adı gereklidir");
    }
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editCategoryId && editCategoryName.trim()) {
      updateCategory.mutate({ id: editCategoryId, name: editCategoryName });
    } else {
      toast.error("Kategori adı gereklidir");
    }
  };

  const handleDeleteClick = (id: string, name: string) => {
    setCategoryToDelete({ id, name });
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (categoryToDelete) {
      deleteCategory.mutate({ id: categoryToDelete.id });
    }
  };

  const startEdit = (id: string, name: string) => {
    setEditCategoryId(id);
    setEditCategoryName(name);
  };

  const cancelEdit = () => {
    setEditCategoryId(null);
    setEditCategoryName("");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Kategori Yönetimi</CardTitle>
        <CardDescription>
          Blogunuz için kategorileri ekleyin, düzenleyin veya silin
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <form onSubmit={handleCreateSubmit} className="flex items-end gap-2">
            <div className="flex-1 space-y-2">
              <Label htmlFor="newCategory">Yeni Kategori</Label>
              <Input
                id="newCategory"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Kategori adı girin"
                disabled={createCategory.isPending}
              />
            </div>
            <Button
              type="submit"
              size="sm"
              className="mb-px"
              disabled={createCategory.isPending}
            >
              {createCategory.isPending ? (
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
            <h3 className="text-sm font-medium">Mevcut Kategoriler</h3>
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Yükleniyor...</p>
            ) : !categories || categories.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Henüz kategori yok
              </p>
            ) : (
              <div className="divide-y rounded-md border">
                {categories.map((category) => (
                  <div key={category.id} className="p-3">
                    {editCategoryId === category.id ? (
                      <form
                        onSubmit={handleEditSubmit}
                        className="flex items-center gap-2"
                      >
                        <Input
                          value={editCategoryName}
                          onChange={(e) => setEditCategoryName(e.target.value)}
                          placeholder="Kategori adı girin"
                          className="flex-1"
                          disabled={updateCategory.isPending}
                        />
                        <div className="flex gap-1">
                          <Button
                            type="submit"
                            size="sm"
                            disabled={updateCategory.isPending}
                          >
                            {updateCategory.isPending ? "..." : "Kaydet"}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={cancelEdit}
                            disabled={updateCategory.isPending}
                          >
                            İptal
                          </Button>
                        </div>
                      </form>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="space-x-2">
                          <span className="font-medium">{category.name}</span>
                          <span className="text-xs text-muted-foreground">
                            ({category.slug})
                          </span>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              startEdit(category.id, category.name)
                            }
                          >
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Düzenle</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleDeleteClick(category.id, category.name)
                            }
                            disabled={category.slug === "genel"} // Prevent deleting the default category
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Sil</span>
                          </Button>
                        </div>
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
        title="Kategoriyi Sil"
        description={`"${categoryToDelete?.name}" kategorisini silmek istediğinize emin misiniz? Bu kategorideki mevcut yazılar "Genel" kategorisine taşınacaktır.`}
        confirmText="Sil"
        cancelText="İptal"
        onConfirm={confirmDelete}
        isLoading={deleteCategory.isPending}
      />
    </Card>
  );
}
