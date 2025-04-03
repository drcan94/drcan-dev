"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Editor } from "@/components/DynamicEditor";
import { EnhancedEditor } from "@/components/EnhancedDynamicEditor";
import { ImageUploadEditor } from "@/components/DynamicImageUploadEditor";
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

export default function NewPostPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [published, setPublished] = useState(false);
  const [categoryId, setCategoryId] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  // Seri alanları
  const [seriesId, setSeriesId] = useState<string | null>(null);
  const [seriesOrder, setSeriesOrder] = useState<number | null>(null);

  const utils = api.useUtils();

  // Fetch categories
  const { data: categories, isLoading: isCategoriesLoading } =
    api.category.getAll.useQuery();

  // Fetch tags
  const { data: tags, isLoading: isTagsLoading } = api.tag.getAll.useQuery();

  // Fetch series
  const { data: seriesList, isLoading: isSeriesLoading } =
    api.series.getAll.useQuery();

  // Create tag mutation
  const createTagMutation = api.tag.create.useMutation({
    onSuccess: (newTag) => {
      toast.success(`"${newTag.name}" etiketi oluşturuldu ve seçildi`);
      // Add new tag to selected tags
      setSelectedTags((prev) => [...prev, newTag.id]);
      // Reset input
      setNewTagName("");
      // Invalidate tags cache to refresh the list
      void utils.tag.getAll.invalidate();
    },
    onError: (error) => {
      toast.error(`Etiket oluşturulamadı: ${error.message}`);
    },
  });

  const createPost = api.blog.create.useMutation({
    onSuccess: () => {
      toast.success("Yazı başarıyla oluşturuldu");
      void utils.blog.getDrafts.invalidate();
      void utils.blog.getAll.invalidate();
      void utils.blog.getPaginated.invalidate();
      if (seriesId) {
        void utils.series.getById.invalidate({ id: seriesId });
      }
      router.push("/admin");
      router.refresh();
    },
    onError: (error) => {
      setIsSubmitting(false);
      toast.error(`Yazı oluşturulurken hata: ${error.message}`);
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
    if (!categoryId && categories && categories.length > 0) {
      toast.error("Kategori seçimi gereklidir");
      return;
    }

    setIsSubmitting(true);
    createPost.mutate({
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

  // Determine if a default category should be auto-selected
  if (
    !categoryId &&
    categories &&
    categories.length > 0 &&
    !isCategoriesLoading
  ) {
    // Find the "genel" category if it exists, otherwise use the first category
    const generalCategory = categories.find((c) => c.slug === "genel");
    setCategoryId(
      generalCategory ? generalCategory.id : categories[0]?.id || "",
    );
  }

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

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Yeni Yazı Oluştur</h1>
        <p className="text-muted-foreground">Yeni bir blog yazısı oluşturun</p>
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
          {isCategoriesLoading ? (
            <div className="h-10 w-[180px] animate-pulse rounded-md bg-muted"></div>
          ) : categories && categories.length > 0 ? (
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
            <p className="text-sm text-muted-foreground">Kategori bulunamadı</p>
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
          <div className="flex items-center justify-between">
            <Label>Kapak Görseli</Label>
            <span className="text-xs text-muted-foreground">
              16:9 en-boy oranında görseller tavsiye edilir
            </span>
          </div>
          <CoverImageUpload value={coverImage} onChange={setCoverImage} />
        </div>

        <div className="space-y-2">
          <Label>Etiketler</Label>
          {isTagsLoading ? (
            <div className="h-10 w-full animate-pulse rounded-md bg-muted"></div>
          ) : (
            <>
              {/* New tag creation form */}
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

              {/* Selected tags */}
              <div className="mb-2 flex flex-wrap gap-2">
                {selectedTags.length > 0 && tags ? (
                  selectedTags.map((tagId) => {
                    const tag = tags?.find((t) => t.id === tagId);
                    if (!tag) return null;
                    return (
                      <Badge key={tag.id} variant="secondary" className="gap-1">
                        {tag.name}
                        <button
                          type="button"
                          onClick={() => removeTag(tag.id)}
                          className="ml-1 rounded-full p-0.5 hover:bg-accent hover:text-accent-foreground"
                        >
                          <X className="h-3 w-3" />
                          <span className="sr-only">{tag.name} kaldır</span>
                        </button>
                      </Badge>
                    );
                  })
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Henüz etiket seçilmedi
                  </p>
                )}
              </div>

              {/* Available tags */}
              <div className="max-h-40 overflow-y-auto rounded-md border p-3">
                <h4 className="mb-2 text-sm font-medium">Mevcut Etiketler</h4>
                {tags && tags.length > 0 ? (
                  <div className="flex max-w-xl flex-wrap gap-2">
                    {tags.map((tag) => (
                      <div key={tag.id} className="flex items-center gap-2">
                        <Checkbox
                          id={`tag-${tag.id}`}
                          checked={selectedTags.includes(tag.id)}
                          onCheckedChange={() => handleTagToggle(tag.id)}
                        />
                        <Label
                          htmlFor={`tag-${tag.id}`}
                          className="cursor-pointer"
                        >
                          {tag.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Henüz etiket bulunmamaktadır
                  </p>
                )}
              </div>
            </>
          )}
        </div>

        <div className="space-y-2">
          <Label>İçerik</Label>
          <div className="min-h-[400px] rounded-md border">
            <ImageUploadEditor content={content} onChange={setContent} />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="published"
            checked={published}
            onCheckedChange={(checked) => setPublished(!!checked)}
          />
          <Label htmlFor="published" className="cursor-pointer">
            Hemen yayınla
          </Label>
        </div>

        <div className="flex gap-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Oluşturuluyor..." : "Yazıyı Oluştur"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            İptal
          </Button>
        </div>
      </form>
    </div>
  );
}
