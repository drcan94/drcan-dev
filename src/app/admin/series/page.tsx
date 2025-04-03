"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import {
  Pencil,
  Plus,
  Trash,
  RefreshCcw,
  BookOpen,
  LinkIcon,
} from "lucide-react";

import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function SeriesAdminPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newSeriesTitle, setNewSeriesTitle] = useState("");
  const [newSeriesDescription, setNewSeriesDescription] = useState("");
  const [selectedSeriesId, setSelectedSeriesId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const utils = api.useUtils();

  // Serileri getir
  const { data: seriesList, isLoading } = api.series.getAll.useQuery();

  // Seri oluştur
  const createMutation = api.series.create.useMutation({
    onSuccess: () => {
      toast.success("Seri başarıyla oluşturuldu");
      setIsCreateDialogOpen(false);
      setNewSeriesTitle("");
      setNewSeriesDescription("");
      void utils.series.getAll.invalidate();
    },
    onError: (error) => {
      toast.error(`Seri oluşturulurken hata: ${error.message}`);
      setIsSubmitting(false);
    },
  });

  // Seri sil
  const deleteMutation = api.series.delete.useMutation({
    onSuccess: () => {
      toast.success("Seri başarıyla silindi");
      setSelectedSeriesId(null);
      void utils.series.getAll.invalidate();
    },
    onError: (error) => {
      toast.error(`Seri silinirken hata: ${error.message}`);
    },
  });

  // Yeni seri oluştur
  const handleCreateSeries = () => {
    if (!newSeriesTitle.trim()) {
      toast.error("Seri başlığı gereklidir");
      return;
    }

    setIsSubmitting(true);
    createMutation.mutate({
      title: newSeriesTitle.trim(),
      description: newSeriesDescription.trim() || undefined,
    });
  };

  // Seriyi sil
  const handleDeleteSeries = () => {
    if (!selectedSeriesId) return;
    deleteMutation.mutate({ id: selectedSeriesId });
  };

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold">Blog Serileri</h1>
          <p className="text-muted-foreground">
            İlişkili blog yazılarını seriler halinde yönetin
          </p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Yeni Seri Oluştur
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Yeni Blog Serisi</DialogTitle>
              <DialogDescription>
                İlişkili blog yazılarını bir araya getirecek yeni bir seri
                oluşturun.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="col-span-4">
                  Seri Başlığı
                </Label>
                <Input
                  id="title"
                  placeholder="Başlık girin"
                  value={newSeriesTitle}
                  onChange={(e) => setNewSeriesTitle(e.target.value)}
                  className="col-span-4"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="col-span-4">
                  Açıklama (İsteğe bağlı)
                </Label>
                <Textarea
                  id="description"
                  placeholder="Seri hakkında kısa bir açıklama yazın"
                  value={newSeriesDescription}
                  onChange={(e) => setNewSeriesDescription(e.target.value)}
                  className="col-span-4 min-h-[100px]"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="ghost"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                İptal
              </Button>
              <Button
                onClick={handleCreateSeries}
                disabled={isSubmitting || !newSeriesTitle.trim()}
              >
                {isSubmitting ? "Oluşturuluyor..." : "Oluştur"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-48 animate-pulse rounded-lg border bg-muted"
            />
          ))}
        </div>
      ) : !seriesList || seriesList.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <BookOpen className="mb-4 h-12 w-12 text-muted-foreground/60" />
          <h3 className="mb-2 text-lg font-medium">Henüz seri oluşturulmadı</h3>
          <p className="mb-4 max-w-md text-muted-foreground">
            Blog yazılarınızı organize etmek için yeni bir seri oluşturun.
            Seriler, ilgili yazıları bir araya getirerek okuyucularınıza daha
            iyi bir deneyim sunar.
          </p>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Yeni Seri Oluştur
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {seriesList.map((series) => (
            <Card key={series.id} className="overflow-hidden">
              <div className="flex flex-col sm:flex-row">
                {series.coverImage && (
                  <div className="relative h-40 w-full shrink-0 sm:h-auto sm:w-48 md:w-64">
                    <Image
                      src={series.coverImage}
                      alt={series.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="flex flex-1 flex-col">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{series.title}</CardTitle>
                        {series.description && (
                          <CardDescription className="mt-2">
                            {series.description}
                          </CardDescription>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground">
                        <span className="font-medium">
                          {series.posts.length}
                        </span>{" "}
                        yazı
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <span className="font-medium">Oluşturulma: </span>
                        <span className="ml-1">
                          {new Date(series.createdAt).toLocaleDateString(
                            "tr-TR",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            },
                          )}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-wrap items-center gap-2">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setSelectedSeriesId(series.id)}
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          Sil
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Seriyi Sil</AlertDialogTitle>
                          <AlertDialogDescription>
                            <p>
                              <strong>{series.title}</strong> serisini silmek
                              istediğinizden emin misiniz?
                            </p>
                            <p className="mt-2">
                              Bu seri silindiğinde, seriye ait yazılar
                              silinmeyecek, ancak seriden çıkarılacaktır.
                            </p>
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>İptal</AlertDialogCancel>
                          <AlertDialogAction onClick={handleDeleteSeries}>
                            Sil
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>

                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/admin/series/${series.id}/edit`}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Düzenle
                      </Link>
                    </Button>

                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/admin/series/${series.id}`}>
                        <RefreshCcw className="mr-2 h-4 w-4" />
                        Sıralamayı Düzenle
                      </Link>
                    </Button>

                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/blog/series/${series.slug}`}>
                        <LinkIcon className="mr-2 h-4 w-4" />
                        Seriyi Görüntüle
                      </Link>
                    </Button>
                  </CardFooter>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
