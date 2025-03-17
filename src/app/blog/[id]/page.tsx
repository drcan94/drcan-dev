import { type Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Edit, Tag as TagIcon } from "lucide-react";

import { api } from "@/trpc/server";
import { Button } from "@/components/ui/button";
import { Editor } from "@/components/DynamicEditor";
import { auth } from "@/server/auth";
import { Badge } from "@/components/ui/badge";

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  try {
    const post = await api.blog.getById({ id: params.id });
    return {
      title: `${post.title} - DrCan.dev`,
      description: `${post.title} - Dr. Burak Can tarafından yazılmış blog yazısı`,
    };
  } catch (error) {
    return {
      title: "Blog Yazısı Bulunamadı - DrCan.dev",
      description: "Aradığınız blog yazısı bulunamadı.",
    };
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: { id: string };
}) {
  // Get the current session to check if user is admin
  const session = await auth();
  const isAdmin = session?.user.isAdmin;

  try {
    const post = await api.blog.getById({ id: params.id });

    return (
      <div className="container mx-auto max-w-4xl px-4 py-8 md:py-12">
        <article className="prose prose-lg dark:prose-invert">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-3xl font-bold md:text-4xl">{post.title}</h1>

            {/* Edit button for admin users */}
            {isAdmin && (
              <Button variant="outline" size="sm" asChild>
                <Link
                  href={`/admin/posts/${post.id}/edit`}
                  className="flex items-center gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Düzenle
                </Link>
              </Button>
            )}
          </div>

          <div className="mb-4 flex flex-wrap items-center gap-3 text-muted-foreground">
            <div className="flex items-center gap-2">
              {post.author.image && (
                <Image
                  src={post.author.image}
                  alt={post.author.name ?? ""}
                  className="h-8 w-8 rounded-full"
                  width={32}
                  height={32}
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

            {/* Category badge */}
            {post.category && (
              <>
                <span>•</span>
                <Link
                  href={`/blog?kategori=${post.category.id}`}
                  className="rounded-md bg-muted px-2 py-1 text-xs font-medium no-underline hover:bg-muted/80"
                >
                  {post.category.name}
                </Link>
              </>
            )}
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="mb-8 flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 text-muted-foreground">
                <TagIcon className="h-4 w-4" />
                <span className="text-sm">Etiketler:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <Link
                    href={`/blog?etiket=${tag.id}`}
                    key={tag.id}
                    className="no-underline"
                  >
                    <Badge
                      variant="secondary"
                      className="hover:bg-secondary/80"
                    >
                      {tag.name}
                    </Badge>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="min-h-[200px]">
            <Editor content={post.content} isEditable={false} />
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
