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

// Form schema for tag
const tagSchema = z.object({
  name: z.string().min(2, {
    message: "Etiket adı en az 2 karakter olmalıdır",
  }),
});

type TagFormValues = z.infer<typeof tagSchema>;

type TagData = {
  id: string;
  name: string;
  slug: string;
};

// Tag router zaten slug oluşturduğu için, bu fonksiyon sadece tahmini bir gösterim sağlar
function createSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function TagManagement() {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState<TagData | null>(null);
  const newTagInputRef = useRef<HTMLInputElement>(null);
  const [newTagName, setNewTagName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // Get all tags
  const { data: tags, isLoading } = api.tag.getAll.useQuery(undefined, {
    staleTime: 10000,
  });

  // Create form for editing tag
  const form = useForm<TagFormValues>({
    resolver: zodResolver(tagSchema),
    defaultValues: {
      name: "",
    },
  });

  // Handle edit button click
  const handleEditClick = (tag: TagData) => {
    setSelectedTag(tag);
    form.reset({
      name: tag.name,
    });
    setIsEditModalOpen(true);
  };

  // Handle delete button click
  const handleDeleteClick = (tag: TagData) => {
    setSelectedTag(tag);
    setIsDeleteModalOpen(true);
  };

  // TRPC utils
  const utils = api.useUtils();

  // Create tag mutation
  const createMutation = api.tag.create.useMutation({
    onSuccess: () => {
      toast.success("Etiket başarıyla oluşturuldu");
      setNewTagName("");
      setIsCreating(false);
      void utils.tag.getAll.invalidate();
    },
    onError: (error) => {
      setIsCreating(false);
      toast.error(`Hata: ${error.message}`);
    },
  });

  // Update tag mutation
  const updateMutation = api.tag.update.useMutation({
    onSuccess: () => {
      toast.success("Etiket başarıyla güncellendi");
      setIsEditModalOpen(false);
      void utils.tag.getAll.invalidate();
    },
    onError: (error) => {
      toast.error(`Hata: ${error.message}`);
    },
  });

  // Delete tag mutation
  const deleteMutation = api.tag.delete.useMutation({
    onSuccess: () => {
      toast.success("Etiket başarıyla silindi");
      setIsDeleteModalOpen(false);
      void utils.tag.getAll.invalidate();
    },
    onError: (error) => {
      toast.error(`Hata: ${error.message}`);
    },
  });

  // Basit etiket oluşturma
  const handleCreateTag = () => {
    if (!newTagName || newTagName.length < 2) {
      toast.error("Etiket adı en az 2 karakter olmalıdır");
      return;
    }

    setIsCreating(true);
    createMutation.mutate({
      name: newTagName,
    });
  };

  // Form submission function (update)
  const onUpdateSubmit = (values: TagFormValues) => {
    if (selectedTag) {
      updateMutation.mutate({
        id: selectedTag.id,
        name: values.name,
      });
    }
  };

  // Delete confirmation
  const handleConfirmDelete = () => {
    if (selectedTag) {
      deleteMutation.mutate({ id: selectedTag.id });
    }
  };

  // Yeni etiket input alanına odaklan
  const focusNewTagInput = () => {
    setTimeout(() => {
      if (newTagInputRef.current) {
        newTagInputRef.current.focus();
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
      {/* Yeni etiket ekleme alanı */}
      <div className="flex rounded-lg border p-4">
        <Input
          ref={newTagInputRef}
          value={newTagName}
          onChange={(e) => setNewTagName(e.target.value)}
          placeholder="Yeni etiket adını girin..."
          className="mr-2"
          onFocus={focusNewTagInput}
        />
        <Button
          onClick={handleCreateTag}
          disabled={!newTagName || newTagName.length < 2 || isCreating}
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

      {/* Tags grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tags?.map((tag) => (
          <div
            key={tag.id}
            className="flex flex-col rounded-lg border p-4 shadow-sm"
          >
            <div className="mb-2">
              <h3 className="text-xl font-semibold">{tag.name}</h3>
              <p className="text-sm text-muted-foreground">/{tag.slug}</p>
            </div>

            <div className="mt-auto flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEditClick(tag)}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Düzenle
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDeleteClick(tag)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Sil
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Tag Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Etiket Düzenle</DialogTitle>
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
                    <FormLabel>Etiket Adı</FormLabel>
                    <FormControl>
                      <Input {...field} autoComplete="off" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <p className="text-sm text-muted-foreground">
                Slug otomatik olarak etiket adından oluşturulacaktır.
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
        title="Etiketi Sil"
        description={`"${selectedTag?.name}" etiketini silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`}
        confirmText="Sil"
        cancelText="İptal"
        onConfirm={handleConfirmDelete}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
