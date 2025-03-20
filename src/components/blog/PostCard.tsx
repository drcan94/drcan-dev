import React from "react";
import Image from "next/image";
import Link from "next/link";
import { FileText, Tag, Trash2, Eye, Edit2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Type for the post data
interface Post {
  id: string;
  title: string;
  slug: string;
  content?: string;
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
          "relative my-4 flex flex-col gap-2 rounded-lg border bg-card p-3 shadow-sm transition-all hover:shadow-md",
          className,
        )}
      >
        <div className="flex items-start justify-between">
          <div className="max-w-[80%]">
            <h3 className="mb-1 text-base font-semibold group-hover:text-primary sm:text-lg">
              {post.title}
            </h3>

            <div className="mb-2 line-clamp-2 text-xs text-muted-foreground sm:text-sm">
              {getContentExcerpt()}
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <time>
                {post.updatedAt ? "Son güncelleme: " : ""}
                {new Date(post.updatedAt || post.createdAt).toLocaleDateString(
                  "tr-TR",
                  {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  },
                )}
              </time>
            </div>
          </div>

          {showAdminControls && (
            <div className="flex flex-col gap-1 rounded-lg border bg-background/90 p-1 shadow-sm backdrop-blur-sm">
              <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                <Link href={`/blog/${post.slug}`} target="_blank">
                  <Eye className="h-3.5 w-3.5" />
                  <span className="sr-only">Görüntüle</span>
                </Link>
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                <Link href={`/admin/posts/${post.id}/edit`}>
                  <Edit2 className="h-3.5 w-3.5" />
                  <span className="sr-only">Düzenle</span>
                </Link>
              </Button>
              {onDeleteClick && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => onDeleteClick(post.id, post.title)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span className="sr-only">Sil</span>
                </Button>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {post.category && (
            <Link
              href={`/blog/search?kategori=${post.category.id}`}
              className="flex items-center gap-1 no-underline"
              onClick={(e) => e.stopPropagation()}
            >
              <FileText className="h-3 w-3 text-muted-foreground" />
              <Badge
                variant="outline"
                className="px-1.5 py-0 text-[10px] hover:bg-primary/10 sm:text-xs"
              >
                {post.category.name}
              </Badge>
            </Link>
          )}

          {post.tags && post.tags.length > 0 && (
            <div className="flex items-center gap-1">
              <Tag className="h-3 w-3 text-muted-foreground" />
              <div className="flex flex-wrap gap-1">
                {post.tags.slice(0, 2).map((tag) => (
                  <Link
                    key={tag.id}
                    href={`/blog/search?etiket=${tag.id}`}
                    className="no-underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Badge
                      variant="secondary"
                      className="px-1.5 py-0 text-[10px] sm:text-xs"
                    >
                      {tag.name}
                    </Badge>
                  </Link>
                ))}
                {post.tags.length > 2 && (
                  <Badge
                    variant="secondary"
                    className="px-1 py-0 text-[10px] sm:text-xs"
                  >
                    +{post.tags.length - 2}
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Default card variant
  return (
    <article
      className={cn(
        "group relative rounded-lg border bg-card p-3 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md sm:p-4",
        className,
      )}
    >
      {/* Title */}
      <h3 className="mb-1.5 text-base font-semibold group-hover:text-primary sm:text-lg md:text-xl">
        <Link
          href={`/blog/${post.slug}`}
          className="after:absolute after:inset-0 after:content-['']"
        >
          {post.title}
        </Link>
      </h3>

      {/* Author and date - daha kompakt görünüm */}
      <div className="flex flex-wrap items-center gap-1.5 text-xs sm:gap-2 sm:text-sm">
        {post.author.image && (
          <Image
            src={post.author.image}
            alt={post.author.name ?? ""}
            className="h-4 w-4 rounded-full sm:h-5 sm:w-5"
            width={20}
            height={20}
          />
        )}
        <span className="text-muted-foreground">{post.author.name}</span>
        <span className="text-muted-foreground/50">•</span>
        <time className="text-muted-foreground">
          {new Date(post.createdAt).toLocaleDateString("tr-TR", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </time>
      </div>

      {/* Excerpt - smaller on mobile */}
      <div className="my-1.5 line-clamp-2 text-xs text-muted-foreground sm:my-2 sm:text-sm">
        {getContentExcerpt()}
      </div>

      {/* Category and Tags - bottom placement (like compact variant) */}
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        {post.category && (
          <Link
            href={`/blog/search?kategori=${post.category.id}`}
            className="flex items-center gap-1 no-underline"
            onClick={(e) => e.stopPropagation()}
          >
            <FileText className="h-3 w-3 text-muted-foreground" />
            <Badge
              variant="outline"
              className="px-1.5 py-0 text-[10px] hover:bg-primary/10 sm:text-xs"
            >
              {post.category.name}
            </Badge>
          </Link>
        )}

        {post.tags && post.tags.length > 0 && (
          <div className="flex items-center gap-1">
            <Tag className="h-3 w-3 text-muted-foreground" />
            <div className="flex flex-wrap gap-1">
              {post.tags.slice(0, 2).map((tag) => (
                <Link
                  key={tag.id}
                  href={`/blog/search?etiket=${tag.id}`}
                  className="no-underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Badge
                    variant="secondary"
                    className="px-1.5 py-0 text-[10px] sm:text-xs"
                  >
                    {tag.name}
                  </Badge>
                </Link>
              ))}
              {post.tags.length > 2 && (
                <Badge
                  variant="secondary"
                  className="px-1 py-0 text-[10px] sm:text-xs"
                >
                  +{post.tags.length - 2}
                </Badge>
              )}
            </div>
          </div>
        )}
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
