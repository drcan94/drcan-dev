"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { EnhancedEditor } from "@/components/EnhancedDynamicEditor";
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
import { CoverImageUpload } from "@/components/ui/cover-image-upload";

const EditForm = ({ id }: { id: string }) => {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [published, setPublished] = useState(false);
  const [categoryId, setCategoryId] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [editorKey, setEditorKey] = useState(0); // Key for forcing re-render
  const contentLoadedRef = useRef(false);
  // Seri alanları
  const [seriesId, setSeriesId] = useState<string | null>(null);
  const [seriesOrder, setSeriesOrder] = useState<number | null>(null);

  const utils = api.useUtils();

  // Fetch the post data
  const { data: post, isLoading, error } = api.blog.getById.useQuery({ id });

  // Fetch categories and tags
  const { data: categories } = api.category.getAll.useQuery();
  const { data: tags } = api.tag.getAll.useQuery();

  // Fetch series
  const { data: seriesList, isLoading: isSeriesLoading } =
    api.series.getAll.useQuery();

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
        coverImage: post.coverImage,
        seriesId: post.seriesId,
        seriesOrder: post.seriesOrder,
      });

      setTitle(post.title);
      setPublished(post.published);
      setCategoryId(post.categoryId);
      setSelectedTags(post.tags.map((tag) => tag.id));

      // Seri bilgilerini ayarla
      if (post.seriesId) {
        setSeriesId(post.seriesId);
        setSeriesOrder(post.seriesOrder || null);
      }

      // Make sure to properly set the cover image value
      if (post.coverImage) {
        console.log("Setting cover image:", post.coverImage);
        setCoverImage(post.coverImage);
      } else {
        setCoverImage(null);
      }

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
      if (seriesId) {
        void utils.series.getById.invalidate({ id: seriesId });
      }
      router.push("/admin");
    },
    onError: (error) => {
      setIsSubmitting(false);
      toast.error(`Hata: ${error.message}`);
    },
  });

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Başlık gereklidir");
      return;
    }

    if (!content) {
      toast.error("İçerik gereklidir");
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
      coverImage: coverImage || undefined,
      seriesId: seriesId || undefined,
      seriesOrder: seriesOrder || undefined,
    });
  };

  // Handle content changes
  const handleContentChange = (newContent: string) => {
    setContent(newContent);
  };

  // Handle tag toggle
  const handleTagToggle = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId],
    );
  };

  // Remove tag
  const removeTag = (tagId: string) => {
    setSelectedTags((prev) => prev.filter((id) => id !== tagId));
  };

  // Create new tag
  const handleCreateTag = () => {
    if (!newTagName.trim()) {
      toast.error("Etiket adı boş olamaz");
      return;
    }

    createTagMutation.mutate({ name: newTagName.trim() });
  };

  // Seriden çıkarma işlemi
  const handleRemoveFromSeries = () => {
    setSeriesId(null);
    setSeriesOrder(null);
  };

  // Seri seçildiğinde, otomatik olarak bir sonraki sıra numarasını belirle
  const handleSeriesChange = (selectedSeriesId: string) => {
    setSeriesId(selectedSeriesId);

    // Eğer seri seçildiyse ve seriesList mevcutsa
    if (selectedSeriesId && seriesList) {
      // Seçilen seriyi bul
      const selectedSeries = seriesList.find((s) => s.id === selectedSeriesId);
      if (selectedSeries) {
        // Serideki mevcut yazı sayısını al ve sıradaki sayıyı belirle
        const nextOrder = selectedSeries.posts.length + 1;
        setSeriesOrder(nextOrder);
      } else {
        setSeriesOrder(1); // Varsayılan olarak ilk sırayı ata
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg text-muted-foreground">Yazı yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Yazıyı Düzenle</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">Başlık</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="max-w-xl"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Kategori</Label>
          {categories ? (
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Kategori seçin" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div className="h-9 w-[180px] animate-pulse rounded-md bg-muted" />
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="series">Blog Serisi</Label>
          {isSeriesLoading ? (
            <div className="h-10 w-[280px] animate-pulse rounded-md bg-muted"></div>
          ) : (
            <div className="space-y-3">
              {seriesId ? (
                <div className="flex items-center gap-3">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="px-3 py-1.5">
                        {seriesList?.find((s) => s.id === seriesId)?.title}
                      </Badge>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleRemoveFromSeries}
                      >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Seriden Çıkar</span>
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <Label htmlFor="seriesOrder" className="text-sm">
                        Sıra
                      </Label>
                      <Input
                        id="seriesOrder"
                        type="number"
                        min="1"
                        value={seriesOrder ?? ""}
                        onChange={(e) =>
                          setSeriesOrder(parseInt(e.target.value) || null)
                        }
                        className="w-24"
                      />
                    </div>
                  </div>
                </div>
              ) : seriesList && seriesList.length > 0 ? (
                <Select onValueChange={handleSeriesChange}>
                  <SelectTrigger className="w-[280px]">
                    <SelectValue placeholder="Bu yazıyı bir seriye ekleyin (isteğe bağlı)" />
                  </SelectTrigger>
                  <SelectContent>
                    {seriesList.map((series) => (
                      <SelectItem key={series.id} value={series.id}>
                        {series.title} ({series.posts.length} yazı)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Henüz bir blog serisi oluşturulmamış
                </p>
              )}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label>Kapak Görseli</Label>
          <CoverImageUpload value={coverImage} onChange={setCoverImage} />
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
            <EnhancedEditor
              key={editorKey}
              content={content}
              onChange={handleContentChange}
            />
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
