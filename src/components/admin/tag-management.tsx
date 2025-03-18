"use client";

import { useState } from "react";
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
  slug: z.string().min(2, {
    message: "Slug en az 2 karakter olmalıdır",
  }),
});

type TagFormValues = z.infer<typeof tagSchema>;

type TagData = {
  id: string;
  name: string;
  slug: string;
};

export function TagManagement() {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState<TagData | null>(null);

  // Get all tags
  const { data: tags, isLoading } = api.tag.getAll.useQuery(undefined, {
    staleTime: 10000,
  });

  // Create form for adding/editing tag
  const form = useForm<TagFormValues>({
    resolver: zodResolver(tagSchema),
    defaultValues: {
      name: "",
      slug: "",
    },
  });

  // Handle edit button click
  const handleEditClick = (tag: TagData) => {
    setSelectedTag(tag);
    form.reset({
      name: tag.name,
      slug: tag.slug,
    });
    setIsEditModalOpen(true);
  };

  // Handle add button click
  const handleAddClick = () => {
    setSelectedTag(null);
    form.reset({
      name: "",
      slug: "",
    });
    setIsCreateModalOpen(true);
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
      setIsCreateModalOpen(false);
      void utils.tag.getAll.invalidate();
    },
    onError: (error) => {
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

  // Form submission function (create)
  const onCreateSubmit = (values: TagFormValues) => {
    createMutation.mutate(values);
  };

  // Form submission function (update)
  const onUpdateSubmit = (values: TagFormValues) => {
    if (selectedTag) {
      updateMutation.mutate({
        id: selectedTag.id,
        ...values,
      });
    }
  };

  // Delete confirmation
  const handleConfirmDelete = () => {
    if (selectedTag) {
      deleteMutation.mutate({ id: selectedTag.id });
    }
  };

  // Handle slug generation
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    form.setValue("name", name);

    // Only auto-generate slug if it's empty or matches the previous auto-generated slug
    if (
      !form.getValues("slug") ||
      form.getValues("slug") ===
        selectedTag?.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "")
    ) {
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      form.setValue("slug", slug);
    }
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
      <div className="flex justify-end">
        <Button onClick={handleAddClick}>
          <Plus className="mr-2 h-4 w-4" />
          Yeni Etiket
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

      {/* Create Tag Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Yeni Etiket Ekle</DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onCreateSubmit)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Etiket Adı</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        onChange={(e) => handleNameChange(e)}
                        autoComplete="off"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug</FormLabel>
                    <FormControl>
                      <Input {...field} autoComplete="off" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateModalOpen(false)}
                >
                  İptal
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="gap-1"
                >
                  {createMutation.isPending && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  Etiketi Ekle
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

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
                      <Input
                        {...field}
                        onChange={(e) => handleNameChange(e)}
                        autoComplete="off"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug</FormLabel>
                    <FormControl>
                      <Input {...field} autoComplete="off" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
        description={`"${selectedTag?.name}" etiketini silmek istediğinize emin misiniz? Bu işlem geri alınamaz ve bu etikete bağlı yazıların bağlantısı kaldırılacaktır.`}
        confirmText="Sil"
        cancelText="İptal"
        onConfirm={handleConfirmDelete}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
