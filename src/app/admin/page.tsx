"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Edit2, Plus, Tag, Grid3X3, FileText } from "lucide-react";
import { useSession } from "next-auth/react";

import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PostCard } from "@/components/blog/PostCard";

export default function AdminDashboard() {
  const router = useRouter();
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/");
    },
  });

  const { data: drafts, isPending: isDraftsLoading } =
    api.blog.getDrafts.useQuery(undefined, {
      enabled: session?.user.isAdmin,
    });

  const { data: publishedPosts, isPending: isPublishedLoading } =
    api.blog.getAll.useQuery(undefined, {
      enabled: session?.user.isAdmin,
    });

  const { mutateAsync: deleteMutation } = api.blog.delete.useMutation();

  if (!session?.user.isAdmin) {
    return null;
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-16">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-4xl font-bold">Yönetim Paneli</h1>
        <Button asChild>
          <Link href="/admin/posts/new">
            <Plus className="mr-2" />
            Yeni Yazı
          </Link>
        </Button>
      </div>

      <div className="mb-8 grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>İçerik Yönetimi</CardTitle>
            <CardDescription>
              Blog yazılarını ve taslakları yönetin
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" asChild className="w-full justify-start">
              <Link href="/admin/posts/new">
                <Plus className="mr-2 h-4 w-4" />
                Yeni Yazı Oluştur
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full justify-start">
              <Link href="/admin/posts/drafts">
                <Edit2 className="mr-2 h-4 w-4" />
                Taslakları Görüntüle
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full justify-start">
              <Link href="/admin/posts">
                <FileText className="mr-2 h-4 w-4" />
                Tüm Yazıları Görüntüle
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Taksonomi</CardTitle>
            <CardDescription>
              Kategorileri ve etiketleri yönetin
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" asChild className="w-full justify-start">
              <Link href="/admin/categories">
                <Grid3X3 className="mr-2 h-4 w-4" />
                Kategorileri Yönet
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full justify-start">
              <Link href="/admin/tags">
                <Tag className="mr-2 h-4 w-4" />
                Etiketleri Yönet
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Son Taslaklar */}
      <div className="mb-8 rounded-lg border">
        <div className="border-b px-6 py-4">
          <h2 className="text-lg font-semibold">Son Taslaklar</h2>
        </div>
        <div className="divide-y px-6">
          {isDraftsLoading ? (
            <div className="py-6">Yükleniyor...</div>
          ) : drafts?.length === 0 ? (
            <div className="py-6 text-center text-muted-foreground">
              Taslak bulunamadı.
            </div>
          ) : (
            drafts?.map((post) => (
              <div key={post.id}>
                <PostCard
                  post={post}
                  variant="compact"
                  showAdminControls={true}
                  onDeleteClick={(id, title) => {
                    if (
                      window.confirm(
                        `"${title}" başlıklı yazıyı silmek istediğinizden emin misiniz?`,
                      )
                    ) {
                      deleteMutation({ id });
                      router.refresh();
                    }
                  }}
                />
              </div>
            ))
          )}
        </div>
      </div>

      {/* Yayınlanmış Yazılar */}
      <div className="rounded-lg border">
        <div className="border-b px-6 py-4">
          <h2 className="text-lg font-semibold">Son Yayınlanan Yazılar</h2>
        </div>
        <div className="divide-y px-6">
          {isPublishedLoading ? (
            <div className="py-6">Yükleniyor...</div>
          ) : publishedPosts?.length === 0 ? (
            <div className="py-6 text-center text-muted-foreground">
              Yayınlanmış yazı bulunamadı.
            </div>
          ) : (
            publishedPosts?.slice(0, 5).map((post) => (
              <div key={post.id}>
                <PostCard
                  post={post}
                  variant="compact"
                  showAdminControls={true}
                  onDeleteClick={(id, title) => {
                    if (
                      window.confirm(
                        `"${title}" başlıklı yazıyı silmek istediğinizden emin misiniz?`,
                      )
                    ) {
                      deleteMutation({ id });
                      router.refresh();
                    }
                  }}
                />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
