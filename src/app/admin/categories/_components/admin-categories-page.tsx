"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CategoryManagement } from "@/components/admin/category-management";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

function CategoryManagementWithSuspense() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <Skeleton className="h-12 w-full" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-lg border p-4">
                <Skeleton className="mb-2 h-6 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        </div>
      }
    >
      <CategoryManagement />
    </Suspense>
  );
}

export function AdminCategoriesPage() {
  const router = useRouter();
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/auth/signin?callbackUrl=/admin/categories");
    },
  });

  // Check if user is admin
  if (!session?.user.isAdmin) {
    router.push("/");
    return null;
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 py-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Kategoriler</h1>
          <p className="text-muted-foreground">
            Blog yazıları için kategorileri yönetin
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/admin" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Yönetim Paneline Dön
          </Link>
        </Button>
      </div>

      <CategoryManagementWithSuspense />
    </div>
  );
}
