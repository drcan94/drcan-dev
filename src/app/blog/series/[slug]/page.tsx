import { type Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronRight,
  Edit,
  BookOpen,
  FileText,
} from "lucide-react";

import { api } from "@/trpc/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { auth } from "@/server/auth";
import { PostCard } from "@/components/blog/PostCard";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  try {
    const series = await api.series.getBySlug({ slug: params.slug });
    return {
      title: `${series.title} - Yazı Serisi - DrCan.dev`,
      description:
        series.description ||
        `${series.title} - Dr. Burak Can tarafından hazırlanan blog yazı serisi`,
    };
  } catch (error) {
    return {
      title: "Seri Bulunamadı - DrCan.dev",
      description: "Aradığınız blog yazı serisi bulunamadı.",
    };
  }
}

export default async function SeriesPage({
  params,
}: {
  params: { slug: string };
}) {
  // Get the current session to check if user is admin
  const session = await auth();
  const isAdmin = session?.user.isAdmin;

  try {
    const series = await api.series.getBySlug({ slug: params.slug });

    // Filter visible posts (admin can see both published and unpublished posts)
    const visiblePosts = series.posts.filter(
      (post) => post.published || isAdmin,
    );

    return (
      <div className="container mx-auto max-w-4xl px-4 py-8 md:py-12">
        <article className="space-y-8">
          <div className="mb-4">
            <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
              <Link href="/blog" className="hover:text-foreground">
                Blog
              </Link>
              <ChevronRight className="h-4 w-4" />
              <span>Seriler</span>
              <ChevronRight className="h-4 w-4" />
              <span className="text-foreground">{series.title}</span>
            </div>

            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h1 className="text-3xl font-bold md:text-4xl">{series.title}</h1>

              {/* Edit button for admin users */}
              {isAdmin && (
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link
                      href={`/admin/series/${series.id}/edit`}
                      className="flex items-center gap-2"
                    >
                      <Edit className="h-4 w-4" />
                      Seriyi Düzenle
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Series Cover Image */}
          {series.coverImage && (
            <div className="relative mb-8 max-h-[400px] w-full overflow-hidden rounded-lg border shadow-sm">
              <div className="relative aspect-[16/9] w-full">
                <Image
                  src={series.coverImage}
                  alt={series.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 800px"
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          )}

          {/* Series description */}
          {series.description && (
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <p className="text-xl">{series.description}</p>
            </div>
          )}

          {/* Tek Sayfada Okuma Butonu */}
          {visiblePosts.length > 0 && (
            <div className="flex justify-center">
              <Button size="lg" asChild className="gap-2">
                <Link href={`/blog/series/${series.slug}/read`}>
                  <FileText className="h-5 w-5" />
                  Tüm Yazıları Tek Sayfada Oku
                </Link>
              </Button>
            </div>
          )}

          {/* Series posts */}
          <div className="mt-8 space-y-6">
            <h2 className="text-2xl font-bold">Bu serideki yazılar</h2>

            {visiblePosts.length === 0 ? (
              <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
                Bu seride henüz yazı bulunmuyor.
              </div>
            ) : (
              <div className="space-y-2">
                {visiblePosts.map((post, index) => (
                  <div
                    key={post.id}
                    className="group rounded-lg border p-4 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        {index + 1}
                      </div>
                      <div className="flex flex-1 flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <Link
                            href={`/blog/${post.slug}`}
                            className="hover:text-primary hover:underline"
                          >
                            <h3 className="font-medium">{post.title}</h3>
                          </Link>
                          <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              {post.author.image && (
                                <Image
                                  src={post.author.image}
                                  alt={post.author.name ?? ""}
                                  className="h-5 w-5 rounded-full"
                                  width={20}
                                  height={20}
                                />
                              )}
                              <span>{post.author.name}</span>
                            </div>
                            <span>•</span>
                            <time>
                              {new Date(post.createdAt).toLocaleDateString(
                                "tr-TR",
                                {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                },
                              )}
                            </time>

                            {!post.published && isAdmin && (
                              <>
                                <span>•</span>
                                <Badge
                                  variant="outline"
                                  className="bg-yellow-300/10 text-yellow-600 dark:text-yellow-400"
                                >
                                  Taslak
                                </Badge>
                              </>
                            )}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          asChild
                          className="mt-2 sm:mt-0"
                        >
                          <Link href={`/blog/${post.slug}`} className="gap-1">
                            Oku
                            <ChevronRight className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-8 border-t pt-6">
            <Button variant="outline" asChild>
              <Link href="/blog" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Tüm Yazılara Dön
              </Link>
            </Button>
          </div>
        </article>
      </div>
    );
  } catch (error) {
    notFound();
  }
}
