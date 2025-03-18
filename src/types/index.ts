import { type RouterOutputs } from "@/trpc/react";

export type User = {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  isAdmin: boolean;
};

export type Author = {
  name: string | null;
  image: string | null;
};

export type Post = {
  id: string;
  title: string;
  slug: string;
  content: string;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
  authorId: string;
  author: Author;
  categoryId: string;
  category: Category;
  tags: Tag[];
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
};

export type Tag = {
  id: string;
  name: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
};

export type PaginatedPosts = {
  posts: Post[];
  total: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  hasMore: boolean;
};

// Type-safe tRPC output types
export type PostOutput = RouterOutputs["blog"]["getById"];
export type PostsOutput = RouterOutputs["blog"]["getAll"];
export type PaginatedPostsOutput = RouterOutputs["blog"]["getPaginated"];
export type SearchPostsOutput = RouterOutputs["blog"]["search"];
export type CategoriesOutput = RouterOutputs["category"]["getAll"];
export type CategoryOutput = RouterOutputs["category"]["getById"];
export type TagsOutput = RouterOutputs["tag"]["getAll"];
export type TagOutput = RouterOutputs["tag"]["getById"];
