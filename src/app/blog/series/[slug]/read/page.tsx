import { type Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ChevronLeft, Home } from "lucide-react";

import { api } from "@/trpc/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Editor } from "@/components/DynamicEditor";
import { Separator } from "@/components/ui/separator";
import { auth } from "@/server/auth";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  try {
    const series = await api.series.getBySlug({ slug: params.slug });
    return {
      title: `${series.title} - Tüm Yazılar - DrCan.dev`,
      description: `${series.title} serisindeki tüm yazıları tek sayfada okuyun - Dr. Burak Can`,
    };
  } catch (error) {
    return {
      title: "Seri Bulunamadı - DrCan.dev",
      description: "Aradığınız blog yazı serisi bulunamadı.",
    };
  }
}

export default async function ReadSeriesPage({
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

    // Sort posts by seriesOrder if available
    const sortedPosts = [...visiblePosts].sort((a, b) => {
      if (a.seriesOrder && b.seriesOrder) {
        return a.seriesOrder - b.seriesOrder;
      }
      // Fallback to createdAt date if seriesOrder is not set
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

    if (sortedPosts.length === 0) {
      return (
        <div className="container mx-auto max-w-4xl px-4 py-8 md:py-12">
          <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-3xl font-bold">{series.title}</h1>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link
                  href={`/blog/series/${series.slug}`}
                  className="flex items-center gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Geri Dön
                </Link>
              </Button>
            </div>
          </div>
          <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
            Bu seride henüz yayınlanmış yazı bulunmuyor.
          </div>
        </div>
      );
    }

    return (
      <div className="container mx-auto max-w-4xl px-4 py-8 md:py-12">
        <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex flex-wrap gap-2 text-sm text-muted-foreground">
              <Link href="/" className="hover:text-foreground">
                <Home className="mr-1 inline-block h-3 w-3" />
                Ana Sayfa
              </Link>
              <span>→</span>
              <Link href="/blog" className="hover:text-foreground">
                Blog
              </Link>
              <span>→</span>
              <Link href="/blog/series" className="hover:text-foreground">
                Seriler
              </Link>
              <span>→</span>
              <Link
                href={`/blog/series/${series.slug}`}
                className="hover:text-foreground"
              >
                {series.title}
              </Link>
            </div>
            <h1 className="text-2xl font-bold sm:text-3xl md:text-4xl">
              {series.title}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Serinin tüm yazıları tek sayfada görüntüleniyor (
              {sortedPosts.length} yazı)
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link
                href={`/blog/series/${series.slug}`}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Seriye Dön
              </Link>
            </Button>
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
          <div className="prose prose-lg dark:prose-invert mb-8 max-w-none">
            <p className="text-xl">{series.description}</p>
          </div>
        )}

        {/* Table of Contents */}
        <div className="mb-8 rounded-lg border bg-muted/30 p-4">
          <h2 className="mb-4 text-xl font-bold">İçindekiler</h2>
          <ol className="list-inside list-decimal space-y-2">
            {sortedPosts.map((post, index) => (
              <li key={post.id} className="hover:text-primary">
                <a href={`#post-${post.id}`} className="hover:underline">
                  {post.title}
                </a>
                {!post.published && isAdmin && (
                  <Badge
                    variant="outline"
                    className="ml-2 bg-yellow-300/10 text-yellow-600 dark:text-yellow-400"
                  >
                    Taslak
                  </Badge>
                )}
              </li>
            ))}
          </ol>
        </div>

        {/* Posts Content */}
        <div className="space-y-12">
          {sortedPosts.map((post, index) => (
            <article
              key={post.id}
              id={`post-${post.id}`}
              className="scroll-mt-20"
            >
              <div className="mb-6">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-2xl font-bold">
                    {index + 1}. {post.title}
                  </h2>
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/blog/${post.slug}`}>
                      Tek başına görüntüle
                    </Link>
                  </Button>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    {post.author.image && (
                      <Image
                        src={post.author.image}
                        alt={post.author.name ?? ""}
                        className="h-6 w-6 rounded-full"
                        width={24}
                        height={24}
                      />
                    )}
                    <span>{post.author.name}</span>
                  </div>
                  <span>•</span>
                  <time>
                    {new Date(post.createdAt).toLocaleDateString("tr-TR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
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

              {/* Post Cover Image */}
              {post.coverImage && (
                <div className="relative mb-6 max-h-[500px] w-full overflow-hidden rounded-lg border">
                  <div className="relative aspect-[16/9] w-full">
                    <Image
                      src={post.coverImage}
                      alt={post.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 800px"
                      className="object-contain"
                    />
                  </div>
                </div>
              )}

              {/* Post Content */}
              <div className="prose prose-lg dark:prose-invert max-w-none">
                <Editor content={post.content} isEditable={false} />
              </div>

              {/* Separator between posts */}
              {index < sortedPosts.length - 1 && (
                <div className="mt-8 pt-4">
                  <Separator className="mb-2" />
                  <div className="flex justify-between">
                    <div className="text-sm text-muted-foreground">
                      Yazı sonu
                    </div>
                    <a
                      href="#top"
                      className="text-sm text-muted-foreground hover:text-primary hover:underline"
                    >
                      Yukarı çık ↑
                    </a>
                  </div>
                </div>
              )}
            </article>
          ))}
        </div>

        <div className="mt-16 border-t pt-8">
          <div className="flex flex-wrap justify-between gap-4">
            <Button variant="outline" asChild>
              <Link
                href={`/blog/series/${series.slug}`}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Seriye Geri Dön
              </Link>
            </Button>
            <Button asChild>
              <a href="#top">Başa Dön ↑</a>
            </Button>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    notFound();
  }
}
