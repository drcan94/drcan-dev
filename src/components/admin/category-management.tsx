"use client";

import { useState, useRef } from "react";
import { api } from "@/trpc/react";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/confirm-dialog";

// Form schema for category
const categorySchema = z.object({
  name: z.string().min(2, {
    message: "Kategori adı en az 2 karakter olmalıdır",
  }),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

type CategoryData = {
  id: string;
  name: string;
  slug: string;
};

// Slug oluşturma yardımcı fonksiyonu
function createSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function CategoryManagement() {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryData | null>(
    null,
  );
  const newCategoryInputRef = useRef<HTMLInputElement>(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // Get all categories
  const { data: categories, isLoading } = api.category.getAll.useQuery(
    undefined,
    {
      staleTime: 10000,
    },
  );

  // Create form for editing category
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
    },
  });

  // Handle edit button click
  const handleEditClick = (category: CategoryData) => {
    setSelectedCategory(category);
    form.reset({
      name: category.name,
    });
    setIsEditModalOpen(true);
  };

  // Handle delete button click
  const handleDeleteClick = (category: CategoryData) => {
    setSelectedCategory(category);
    setIsDeleteModalOpen(true);
  };

  // TRPC utils
  const utils = api.useUtils();

  // Create category mutation
  const createMutation = api.category.create.useMutation({
    onSuccess: () => {
      toast.success("Kategori başarıyla oluşturuldu");
      setNewCategoryName("");
      setIsCreating(false);
      void utils.category.getAll.invalidate();
    },
    onError: (error) => {
      setIsCreating(false);
      toast.error(`Hata: ${error.message}`);
    },
  });

  // Update category mutation
  const updateMutation = api.category.update.useMutation({
    onSuccess: () => {
      toast.success("Kategori başarıyla güncellendi");
      setIsEditModalOpen(false);
      void utils.category.getAll.invalidate();
    },
    onError: (error) => {
      toast.error(`Hata: ${error.message}`);
    },
  });

  // Delete category mutation
  const deleteMutation = api.category.delete.useMutation({
    onSuccess: () => {
      toast.success("Kategori başarıyla silindi");
      setIsDeleteModalOpen(false);
      void utils.category.getAll.invalidate();
    },
    onError: (error) => {
      toast.error(`Hata: ${error.message}`);
    },
  });

  // Basit kategori oluşturma
  const handleCreateCategory = () => {
    if (!newCategoryName || newCategoryName.length < 2) {
      toast.error("Kategori adı en az 2 karakter olmalıdır");
      return;
    }

    setIsCreating(true);
    createMutation.mutate({
      name: newCategoryName,
      slug: createSlug(newCategoryName), // Otomatik slug oluştur
    });
  };

  // Form submission function (update)
  const onUpdateSubmit = (values: CategoryFormValues) => {
    if (selectedCategory) {
      updateMutation.mutate({
        id: selectedCategory.id,
        name: values.name,
        slug: createSlug(values.name), // Otomatik slug oluştur
      });
    }
  };

  // Delete confirmation
  const handleConfirmDelete = () => {
    if (selectedCategory) {
      deleteMutation.mutate({ id: selectedCategory.id });
    }
  };

  // Yeni kategori input alanına odaklan
  const focusNewCategoryInput = () => {
    setTimeout(() => {
      if (newCategoryInputRef.current) {
        newCategoryInputRef.current.focus();
      }
    }, 0);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-32" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-lg border p-4">
              <Skeleton className="mb-2 h-6 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Yeni kategori ekleme alanı */}
      <div className="flex rounded-lg border p-4">
        <Input
          ref={newCategoryInputRef}
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          placeholder="Yeni kategori adını girin..."
          className="mr-2"
          onFocus={focusNewCategoryInput}
        />
        <Button
          onClick={handleCreateCategory}
          disabled={
            !newCategoryName || newCategoryName.length < 2 || isCreating
          }
          className="min-w-24"
        >
          {isCreating ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Plus className="mr-2 h-4 w-4" />
          )}
          Ekle
        </Button>
      </div>

      {/* Category grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories?.map((category) => (
          <div
            key={category.id}
            className="flex flex-col rounded-lg border p-4 shadow-sm"
          >
            <div className="mb-2">
              <h3 className="text-xl font-semibold">{category.name}</h3>
              <p className="text-sm text-muted-foreground">/{category.slug}</p>
            </div>

            <div className="mt-auto flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEditClick(category)}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Düzenle
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDeleteClick(category)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Sil
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Category Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Kategori Düzenle</DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onUpdateSubmit)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kategori Adı</FormLabel>
                    <FormControl>
                      <Input {...field} autoComplete="off" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <p className="text-sm text-muted-foreground">
                Slug otomatik olarak kategori adından oluşturulacaktır.
              </p>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  İptal
                </Button>
                <Button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="gap-1"
                >
                  {updateMutation.isPending && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  Değişiklikleri Kaydet
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        title="Kategoriyi Sil"
        description={`"${selectedCategory?.name}" kategorisini silmek istediğinize emin misiniz? Bu işlem geri alınamaz ve bu kategoriye bağlı yazılar "Genel" kategorisine taşınacaktır.`}
        confirmText="Sil"
        cancelText="İptal"
        onConfirm={handleConfirmDelete}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
