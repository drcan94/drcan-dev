import React from "react";
import Image from "next/image";
import Link from "next/link";
import { FileText, Tag, Trash2, Eye, Edit2, Calendar } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Type for the post data
interface Post {
  id: string;
  title: string;
  slug: string;
  content?: string;
  coverImage?: string | null;
  author: {
    name: string | null;
    image: string | null;
  };
  createdAt: Date;
  updatedAt?: Date;
  category?: {
    id: string;
    name: string;
  } | null;
  tags: {
    id: string;
    name: string;
  }[];
  published?: boolean;
}

interface PostCardProps {
  post: Post;
  showAdminControls?: boolean;
  onDeleteClick?: (id: string, title: string) => void;
  variant?: "default" | "compact";
  className?: string;
}

export function PostCard({
  post,
  showAdminControls = false,
  onDeleteClick,
  variant = "default",
  className,
}: PostCardProps) {
  const isCompact = variant === "compact";

  // Extract first paragraph from content for the excerpt
  const getContentExcerpt = () => {
    if (!post.content) return "Bu yazıyı okumak için tıklayın...";

    try {
      const contentObj = JSON.parse(post.content);
      // Extract text from the first content blocks if available
      const textContent = contentObj
        .slice(0, 2)
        .flatMap(
          (block: any) =>
            block.content?.map((c: any) => c.text).filter(Boolean) || [],
        )
        .join(" ");
      return textContent || "Bu yazıyı okumak için tıklayın...";
    } catch (e) {
      return "Bu yazıyı okumak için tıklayın...";
    }
  };

  // Compact variant for admin listings
  if (isCompact) {
    return (
      <div
        className={cn(
          "relative my-4 flex overflow-hidden rounded-lg border bg-card shadow-sm transition-all hover:shadow-md",
          className,
        )}
      >
        {/* Cover image for compact view - using aspect ratio */}
        <div className="relative h-auto w-[120px] shrink-0 overflow-hidden md:w-[180px]">
          <div className="relative aspect-square h-full w-full">
            {post.coverImage ? (
              <Image
                src={post.coverImage}
                alt={post.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 120px, 180px"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-muted">
                <FileText className="h-8 w-8 opacity-20" />
              </div>
            )}
          </div>
        </div>

        {/* Content section */}
        <div className="flex flex-1 flex-col justify-between p-3">
          <div>
            <Link
              href={`/blog/${post.slug}`}
              className="block"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="line-clamp-2 text-base font-semibold hover:text-primary md:text-lg">
                {post.title}
              </h3>
            </Link>

            <div className="mt-1 line-clamp-2 text-xs text-muted-foreground sm:text-sm">
              {getContentExcerpt()}
            </div>
          </div>

          {/* Meta info at bottom */}
          <div className="mt-auto pt-2 text-xs text-muted-foreground">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <time>
                  {new Date(
                    post.updatedAt || post.createdAt,
                  ).toLocaleDateString("tr-TR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </time>
              </div>

              {/* Category and tags */}
              <div className="flex flex-wrap items-center gap-1.5">
                {post.category && (
                  <Badge
                    variant="outline"
                    className="px-1.5 py-0 text-[10px] hover:bg-primary/10 sm:text-xs"
                  >
                    {post.category.name}
                  </Badge>
                )}

                {post.tags && post.tags.length > 0 && (
                  <Badge
                    variant="secondary"
                    className="px-1.5 py-0 text-[10px] sm:text-xs"
                  >
                    {post.tags[0]?.name}
                    {post.tags.length > 1 ? ` +${post.tags.length - 1}` : ""}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Admin Controls - positioned absolutely */}
        {showAdminControls && (
          <div className="absolute right-2 top-2 flex gap-0.5 rounded-md bg-background/90 p-0.5 shadow-sm backdrop-blur-sm">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 sm:h-7 sm:w-7"
              asChild
            >
              <Link href={`/blog/${post.slug}`} target="_blank">
                <Eye className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                <span className="sr-only">Görüntüle</span>
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 sm:h-7 sm:w-7"
              asChild
            >
              <Link href={`/admin/posts/${post.id}/edit`}>
                <Edit2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                <span className="sr-only">Düzenle</span>
              </Link>
            </Button>
            {onDeleteClick && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 sm:h-7 sm:w-7"
                onClick={() => onDeleteClick(post.id, post.title)}
              >
                <Trash2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                <span className="sr-only">Sil</span>
              </Button>
            )}
          </div>
        )}
      </div>
    );
  }

  // Default card variant - completely redesigned for better image display
  return (
    <article
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-lg border bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md",
        className,
      )}
    >
      {/* Cover Image - Using consistent aspect ratio with better image display */}
      <div className="relative w-full overflow-hidden">
        <div className="relative aspect-[16/9] w-full">
          {post.coverImage ? (
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
              className="object-cover transition-transform group-hover:scale-105"
              priority
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted">
              <FileText className="h-16 w-16 text-muted-foreground opacity-20" />
            </div>
          )}

          {/* Category overlay on image */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3 pt-6">
            <div className="flex flex-wrap gap-2">
              {post.category && (
                <Badge
                  variant="outline"
                  className="bg-background/80 px-2 py-0.5 text-xs backdrop-blur-sm"
                >
                  {post.category.name}
                </Badge>
              )}

              {post.tags &&
                post.tags.length > 0 &&
                post.tags.slice(0, 1).map((tag) => (
                  <Badge
                    key={tag.id}
                    variant="secondary"
                    className="bg-primary/80 px-2 py-0.5 text-xs text-primary-foreground backdrop-blur-sm"
                  >
                    {tag.name}
                  </Badge>
                ))}

              {post.tags && post.tags.length > 1 && (
                <Badge
                  variant="secondary"
                  className="bg-primary/80 px-2 py-0.5 text-xs text-primary-foreground backdrop-blur-sm"
                >
                  +{post.tags.length - 1}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-between p-4">
        <div className="space-y-2">
          {/* Title */}
          <h3 className="text-lg font-semibold group-hover:text-primary md:text-xl">
            <Link
              href={`/blog/${post.slug}`}
              className="after:absolute after:inset-0 after:content-['']"
            >
              {post.title}
            </Link>
          </h3>

          {/* Excerpt - takes up available space */}
          <div className="line-clamp-3 text-sm text-muted-foreground">
            {getContentExcerpt()}
          </div>
        </div>

        {/* Author and date fixed at bottom */}
        <div className="mt-4 border-t pt-3 text-xs text-muted-foreground sm:text-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {post.author.image ? (
                <Image
                  src={post.author.image}
                  alt={post.author.name ?? ""}
                  className="h-6 w-6 rounded-full"
                  width={24}
                  height={24}
                />
              ) : (
                <div className="h-6 w-6 rounded-full bg-muted"></div>
              )}
              <span>{post.author.name}</span>
            </div>

            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <time>
                {new Date(post.createdAt).toLocaleDateString("tr-TR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Controls */}
      {showAdminControls && (
        <div className="absolute right-2 top-2 flex gap-0.5 rounded-md bg-background/90 p-0.5 shadow-sm backdrop-blur-sm">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 sm:h-7 sm:w-7"
            asChild
          >
            <Link href={`/blog/${post.slug}`} target="_blank">
              <Eye className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              <span className="sr-only">Görüntüle</span>
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 sm:h-7 sm:w-7"
            asChild
          >
            <Link href={`/admin/posts/${post.id}/edit`}>
              <Edit2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              <span className="sr-only">Düzenle</span>
            </Link>
          </Button>
          {onDeleteClick && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 sm:h-7 sm:w-7"
              onClick={() => onDeleteClick(post.id, post.title)}
            >
              <Trash2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              <span className="sr-only">Sil</span>
            </Button>
          )}
        </div>
      )}
    </article>
  );
}
