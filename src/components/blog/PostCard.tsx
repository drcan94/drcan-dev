import React from "react";
import Image from "next/image";
import Link from "next/link";
import { FileText, Tag, Edit2, Trash2, Eye } from "lucide-react";
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
      <div className={cn("relative flex flex-col gap-3 py-4", className)}>
        <div className="flex items-start justify-between">
          <div className="max-w-[80%]">
            <h3 className="mb-1 text-lg font-semibold">{post.title}</h3>

            <div className="mb-2 line-clamp-2 text-sm text-muted-foreground">
              {getContentExcerpt()}
            </div>

            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
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
            <div className="flex flex-col gap-1 rounded-lg border bg-background/80 p-1 backdrop-blur-sm">
              <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                <Link href={`/blog/${post.slug}`} target="_blank">
                  <Eye className="h-4 w-4" />
                  <span className="sr-only">Görüntüle</span>
                </Link>
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                <Link href={`/admin/posts/${post.id}/edit`}>
                  <Edit2 className="h-4 w-4" />
                  <span className="sr-only">Düzenle</span>
                </Link>
              </Button>
              {onDeleteClick && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onDeleteClick(post.id, post.title)}
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Sil</span>
                </Button>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {post.category && (
            <Link
              href={`/blog?kategori=${post.category.id}`}
              className="flex items-center gap-1 no-underline"
              onClick={(e) => e.stopPropagation()}
            >
              <FileText className="h-3 w-3 text-muted-foreground" />
              <Badge
                variant="outline"
                className="px-1.5 py-0 text-xs hover:bg-primary/10"
              >
                {post.category.name}
              </Badge>
            </Link>
          )}

          {post.tags && post.tags.length > 0 && (
            <div className="flex items-center gap-1">
              <Tag className="h-3 w-3 text-muted-foreground" />
              <div className="flex flex-wrap gap-1">
                {post.tags.slice(0, 3).map((tag) => (
                  <Link
                    key={tag.id}
                    href={`/blog?etiket=${tag.id}`}
                    className="no-underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Badge variant="secondary" className="px-1.5 py-0 text-xs">
                      {tag.name}
                    </Badge>
                  </Link>
                ))}
                {post.tags.length > 3 && (
                  <Badge variant="secondary" className="px-1 py-0 text-xs">
                    +{post.tags.length - 3}
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
        "group relative rounded-lg border bg-card p-4 shadow-sm transition-all hover:shadow-md",
        className,
      )}
    >
      {/* Category and Tags - Top right */}
      <div className="absolute right-2 top-2 flex flex-wrap items-center gap-1.5 rounded-md bg-background/80 p-1 backdrop-blur-sm">
        {post.category && (
          <Link
            href={`/blog?kategori=${post.category.id}`}
            className="flex items-center gap-1 no-underline"
            onClick={(e) => e.stopPropagation()}
          >
            <FileText className="h-3 w-3 text-muted-foreground" />
            <Badge
              variant="outline"
              className="px-1.5 py-0 text-xs hover:bg-primary/10"
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
                  href={`/blog?etiket=${tag.id}`}
                  className="no-underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Badge variant="secondary" className="px-1.5 py-0 text-xs">
                    {tag.name}
                  </Badge>
                </Link>
              ))}
              {post.tags.length > 2 && (
                <Badge variant="secondary" className="px-1 py-0 text-xs">
                  +{post.tags.length - 2}
                </Badge>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Title */}
      <h3 className="mb-2 mt-6 text-xl font-semibold group-hover:text-primary">
        {post.title}
      </h3>

      {/* Author and date */}
      <div className="mb-2 flex flex-wrap items-center gap-2 text-sm">
        {post.author.image && (
          <Image
            src={post.author.image}
            alt={post.author.name ?? ""}
            className="h-5 w-5 rounded-full"
            width={20}
            height={20}
          />
        )}
        <span className="text-muted-foreground">{post.author.name}</span>
        <span className="text-muted-foreground">•</span>
        <time className="text-muted-foreground">
          {new Date(post.createdAt).toLocaleDateString("tr-TR", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </time>
      </div>

      {/* Content excerpt */}
      <div className="mb-2 line-clamp-2 text-sm text-muted-foreground">
        {getContentExcerpt()}
      </div>

      {/* Admin controls */}
      {showAdminControls && (
        <div className="absolute right-2 top-2 flex flex-col gap-1 rounded-lg border bg-background/80 p-1 backdrop-blur-sm">
          <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
            <Link href={`/blog/${post.slug}`} target="_blank">
              <Eye className="h-4 w-4" />
              <span className="sr-only">Görüntüle</span>
            </Link>
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
            <Link href={`/admin/posts/${post.id}/edit`}>
              <Edit2 className="h-4 w-4" />
              <span className="sr-only">Düzenle</span>
            </Link>
          </Button>
          {onDeleteClick && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onDeleteClick(post.id, post.title)}
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Sil</span>
            </Button>
          )}
        </div>
      )}

      <Link href={`/blog/${post.slug}`} className="absolute inset-0">
        <span className="sr-only">Yazıyı Oku</span>
      </Link>
    </article>
  );
}
