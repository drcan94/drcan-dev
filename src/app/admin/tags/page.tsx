"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Suspense } from "react";
import { type Metadata } from "next";
import { AdminTagsPage } from "./_components/admin-tags-page";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Etiket Yönetimi",
  description: "Blog etiketlerini yönetin, düzenleyin ve silin.",
};

function LoadingFallback() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>

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
    </div>
  );
}

export default function Page() {
  const router = useRouter();
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/");
    },
  });

  if (!session?.user.isAdmin) {
    return null;
  }

  return (
    <Suspense fallback={<LoadingFallback />}>
      <AdminTagsPage />
    </Suspense>
  );
}
