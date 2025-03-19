import { Suspense } from "react";
import { api } from "@/trpc/server";
import SearchResults from "./_components/search-results";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const query = typeof searchParams.q === "string" ? searchParams.q : "";
  const exact = searchParams.exact === "1";
  const categoryId =
    typeof searchParams.kategori === "string"
      ? searchParams.kategori
      : undefined;
  const tagId =
    typeof searchParams.etiket === "string" ? searchParams.etiket : undefined;

  // Kategorileri ve etiketleri server tarafında yükle
  const [categories, tags] = await Promise.all([
    api.category.getAll(),
    api.tag.getAll(),
  ]);

  // İlk arama sonuçlarını getir (eğer gerekli parametreler varsa)
  let initialData = null;

  try {
    if ((query && query.length >= 3) || categoryId || tagId) {
      initialData = await api.blog.search({
        query,
        page: 1,
        limit: 10,
        exact,
        categoryId,
        tagId,
      });
    }
  } catch (error) {
    console.error("Arama sonuçları yüklenirken bir hata oluştu:", error);
    // Hatayı yutsak da en azından logluyoruz ve UI'daki hata korumasına güveniyoruz
  }

  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-16">
          <h1 className="mb-4 text-4xl font-bold">Arama Sonuçları</h1>
          <p className="mb-8 text-muted-foreground">Yükleniyor...</p>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-4 rounded-lg border p-6">
                <div className="h-6 w-2/3 animate-pulse rounded bg-muted" />
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 animate-pulse rounded-full bg-muted" />
                  <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                  <div className="h-4 w-4 animate-pulse rounded-full bg-muted" />
                  <div className="h-4 w-32 animate-pulse rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        </div>
      }
    >
      <SearchResults
        initialData={initialData}
        initialCategories={categories}
        initialTags={tags}
      />
    </Suspense>
  );
}
