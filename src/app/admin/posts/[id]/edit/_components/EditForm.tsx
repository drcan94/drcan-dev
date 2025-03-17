"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Editor } from "@/components/DynamicEditor";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, X } from "lucide-react";

const EditForm = ({ id }: { id: string }) => {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [published, setPublished] = useState(false);
  const [categoryId, setCategoryId] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [editorKey, setEditorKey] = useState(0); // Key for forcing re-render
  const contentLoadedRef = useRef(false);

  const utils = api.useUtils();

  // Fetch the post data
  const { data: post, isLoading, error } = api.blog.getById.useQuery({ id });

  // Fetch categories and tags
  const { data: categories } = api.category.getAll.useQuery();
  const { data: tags } = api.tag.getAll.useQuery();

  // Create tag mutation
  const createTagMutation = api.tag.create.useMutation({
    onSuccess: (newTag) => {
      toast.success(`"${newTag.name}" etiketi oluşturuldu ve seçildi`);
      setSelectedTags((prev) => [...prev, newTag.id]);
      setNewTagName("");
      void utils.tag.getAll.invalidate();
    },
    onError: (error) => {
      toast.error(`Etiket oluşturulamadı: ${error.message}`);
    },
  });

  // Handle post data fetched
  useEffect(() => {
    if (post) {
      console.log("Post data loaded:", {
        title: post.title,
        hasContent: !!post.content,
      });

      setTitle(post.title);
      setPublished(post.published);
      setCategoryId(post.categoryId);
      setSelectedTags(post.tags.map((tag) => tag.id));

      // Set content and trigger editor re-render
      if (post.content && !contentLoadedRef.current) {
        try {
          // Ensure content is valid JSON
          JSON.parse(post.content);
          setContent(post.content);
          contentLoadedRef.current = true;

          // Force editor to re-render with new content
          setTimeout(() => {
            setEditorKey((prevKey) => prevKey + 1);
          }, 100);
        } catch (e) {
          console.error("Invalid content format:", e);
          toast.error("İçerik formatı geçersiz, editör yüklenemedi");
        }
      }
    }
  }, [post]);

  // Handle error
  useEffect(() => {
    if (error) {
      toast.error(`Yazı yüklenirken hata oluştu: ${error.message}`);
      router.push("/admin");
    }
  }, [error, router]);

  // Update post mutation
  const updatePost = api.blog.update.useMutation({
    onSuccess: () => {
      toast.success("Yazı başarıyla güncellendi");
      void utils.blog.getDrafts.invalidate();
      void utils.blog.getAll.invalidate();
      void utils.blog.getById.invalidate({ id });
      router.push("/admin");
    },
    onError: (error) => {
      setIsSubmitting(false);
      toast.error(`Hata: ${error.message}`);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) {
      toast.error("Başlık gereklidir");
      return;
    }
    if (!content) {
      toast.error("İçerik gereklidir");
      return;
    }
    if (!categoryId) {
      toast.error("Kategori seçimi gereklidir");
      return;
    }

    setIsSubmitting(true);
    updatePost.mutate({
      id,
      title,
      content,
      published,
      categoryId,
      tagIds: selectedTags,
    });
  };

  const handleTagToggle = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId],
    );
  };

  const removeTag = (tagId: string) => {
    setSelectedTags((prev) => prev.filter((id) => id !== tagId));
  };

  // Handle creation of a new tag
  const handleCreateTag = (e: React.MouseEvent) => {
    if (!newTagName.trim()) {
      toast.error("Etiket adı boş olamaz");
      return;
    }

    createTagMutation.mutate({ name: newTagName.trim() });
  };

  // Handle content change
  const handleContentChange = (newContent: string) => {
    console.log("Content changed");
    setContent(newContent);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-12">
        <div className="space-y-4">
          <div className="h-8 w-48 animate-pulse rounded bg-muted"></div>
          <div className="h-4 w-full max-w-xl animate-pulse rounded bg-muted"></div>
          <div className="mt-6 h-12 w-full max-w-xl animate-pulse rounded bg-muted"></div>
          <div className="mt-6 h-96 w-full animate-pulse rounded bg-muted"></div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-12 text-center">
        <h1 className="text-3xl font-bold">Yazı bulunamadı</h1>
        <p className="mt-4 text-muted-foreground">
          Aradığınız yazı mevcut değil veya düzenleme izniniz bulunmuyor.
        </p>
        <Button className="mt-8" onClick={() => router.push("/admin")}>
          Gösterge Paneline Dön
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Yazı Düzenle</h1>
        <p className="text-muted-foreground">Yazınızda değişiklikler yapın</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-2">
          <Label htmlFor="title">Başlık</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Yazı başlığı girin"
            className="max-w-xl"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Kategori</Label>
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger className="max-w-xl">
              <SelectValue placeholder="Kategori seçin" />
            </SelectTrigger>
            <SelectContent>
              {categories?.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Etiketler</Label>

          <div className="mb-4">
            <div className="flex max-w-xl items-center gap-2">
              <Input
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder="Yeni etiket ekle..."
                className="flex-1"
              />
              <Button
                type="button"
                size="sm"
                disabled={createTagMutation.isPending}
                className="shrink-0"
                onClick={handleCreateTag}
              >
                {createTagMutation.isPending ? (
                  "Ekleniyor..."
                ) : (
                  <>
                    <Plus className="mr-1 h-4 w-4" />
                    Etiket Ekle
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="mb-2 flex flex-wrap gap-2">
            {selectedTags.length > 0 && tags ? (
              selectedTags.map((tagId) => {
                const tag = tags.find((t) => t.id === tagId);
                return tag ? (
                  <Badge
                    key={tag.id}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {tag.name}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0"
                      onClick={() => removeTag(tag.id)}
                    >
                      <X className="h-3 w-3" />
                      <span className="sr-only">Kaldır</span>
                    </Button>
                  </Badge>
                ) : null;
              })
            ) : (
              <p className="text-sm text-muted-foreground">
                Henüz etiket seçilmedi
              </p>
            )}
          </div>

          <div className="max-h-36 overflow-y-auto rounded-md border p-2">
            <h4 className="mb-2 text-sm font-medium">Mevcut Etiketler</h4>
            <div className="space-y-2">
              {tags?.map((tag) => (
                <div key={tag.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`tag-${tag.id}`}
                    checked={selectedTags.includes(tag.id)}
                    onCheckedChange={() => handleTagToggle(tag.id)}
                  />
                  <Label
                    htmlFor={`tag-${tag.id}`}
                    className="cursor-pointer text-sm font-normal"
                  >
                    {tag.name}
                  </Label>
                </div>
              ))}
              {!tags?.length && (
                <p className="text-sm text-muted-foreground">
                  Henüz etiket yok
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label>İçerik</Label>
          <div className="min-h-[400px] rounded-md border">
            {content && (
              <Editor
                key={editorKey}
                content={content}
                onChange={handleContentChange}
              />
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="published"
            checked={published}
            onCheckedChange={(checked) => setPublished(!!checked)}
          />
          <Label htmlFor="published" className="cursor-pointer">
            {published ? "Yayınlandı" : "Şimdi yayınla"}
          </Label>
        </div>

        <div className="flex gap-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            İptal
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditForm;
