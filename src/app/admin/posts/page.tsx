import { Suspense } from "react";
import { type Metadata } from "next";
import { AdminPostsPage } from "./_components/admin-posts-page";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Blog Yazıları Yönetimi",
  description: "Blog yazılarını yönetin, düzenleyin ve silin.",
};

function LoadingFallback() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>

      <div className="mb-6 grid gap-6 md:grid-cols-[2fr,1fr]">
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="rounded-lg border p-4">
                <Skeleton className="mb-2 h-6 w-2/3" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-6 w-6 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-lg border p-4">
          <Skeleton className="h-[400px] w-full" />
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AdminPostsPage />
    </Suspense>
  );
}
