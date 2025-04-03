import { type Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { BookOpen, ChevronRight } from "lucide-react";

import { api } from "@/trpc/server";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { type RouterOutputs } from "@/trpc/react";

export const metadata: Metadata = {
  title: "Blog Serileri - DrCan.dev",
  description:
    "Dr. Burak Can'ın sağlık ve yazılım üzerine bilgilendirici yazı serileri. İlgili konularda kapsamlı bilgiler.",
  keywords: [
    "blog serileri",
    "sağlık yazı serisi",
    "yazılım serisi",
    "Dr. Burak Can",
  ],
  openGraph: {
    title: "Blog Serileri - DrCan.dev",
    description: "Sağlık ve yazılım dünyasından kapsamlı yazı serileri",
    type: "website",
    url: "https://drcan.dev/blog/series",
    images: [
      {
        url: "/opengraph-image.jpg",
        width: 1200,
        height: 630,
        alt: "DrCan.dev Blog Serileri",
      },
    ],
  },
};

export default async function SeriesListPage() {
  const seriesList = await api.series.getAll();

  // Yalnızca yazı içeren serileri göster
  const seriesWithPosts = seriesList.filter(
    (series: RouterOutputs["series"]["getAll"][number]) =>
      series.posts.length > 0,
  );

  return (
    <div className="container mx-auto max-w-4xl px-4 py-4 md:py-8">
      <div className="mb-6">
        <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/blog" className="hover:text-foreground">
            Blog
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">Seriler</span>
        </div>
        <h1 className="text-xl font-bold sm:text-2xl md:text-3xl">
          Blog Yazı Serileri
        </h1>
        <p className="mt-2 text-muted-foreground">
          Belirli konularda derinlemesine bilgi içeren yazı koleksiyonları
        </p>
      </div>

      {seriesWithPosts.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <BookOpen className="mb-4 h-12 w-12 text-muted-foreground/60" />
          <h3 className="mb-2 text-lg font-medium">
            Henüz yazı serisi bulunmuyor
          </h3>
          <p className="mb-6 text-muted-foreground">
            Yakında seri içerikler eklenecektir.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {seriesWithPosts.map((series) => (
            <Card
              key={series.id}
              className="flex h-full flex-col overflow-hidden"
            >
              {series.coverImage && (
                <div className="relative aspect-[16/9] w-full overflow-hidden">
                  <Image
                    src={series.coverImage}
                    alt={series.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <CardHeader>
                <CardTitle>{series.title}</CardTitle>
                {series.description && (
                  <CardDescription>{series.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent className="flex-1">
                <div className="text-sm text-muted-foreground">
                  <span className="font-medium">{series.posts.length}</span>{" "}
                  yazıdan oluşan seri
                </div>
              </CardContent>
              <CardFooter>
                <Button asChild variant="outline" className="w-full">
                  <Link
                    href={`/blog/series/${series.slug}`}
                    className="flex items-center justify-center gap-2"
                  >
                    <span>Seriyi Görüntüle</span>
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
