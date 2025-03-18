"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Code, FileText, Stethoscope, Loader2 } from "lucide-react";

import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { PostCard } from "@/components/blog/PostCard";

export default function Home() {
  const { data: posts, isPending } = api.blog.getAll.useQuery();

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12 md:py-20">
      {/* Hero Section */}
      <section className="mb-16">
        <div className="flex flex-col gap-8 md:flex-row md:items-center md:gap-12">
          <div className="flex-1 space-y-6">
            <div className="flex items-center gap-4">
              {/* Profile image - smaller on mobile, next to name */}
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border-2 border-primary/10 shadow-md md:hidden">
                <Image
                  src="/me.jpg"
                  alt="Dr. Burak Can"
                  fill
                  sizes="80px"
                  className="object-cover"
                  priority
                />
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                  Dr. Burak Can
                </h1>
                <p className="text-xl text-muted-foreground">
                  Tıp Doktoru & Yazılım Geliştirici
                </p>
              </div>
            </div>
            <p className="text-lg text-muted-foreground">
              Ocak 2023'te Sakarya Üniversitesi'nden mezun oldum. Çeşitli
              görevlendirmelerden sonra şu an Karaman Eğitim ve Araştırma
              Hastanesi Acil Servisi'nde pratisyen hekim olarak çalışıyorum.
              2020 yılından beri yazılım geliştirmeye olan ilgimle sağlık
              teknolojileri alanında köprü kurmaya çalışıyorum.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg">
                <Link href="/blog">
                  Blog Yazıları
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" asChild size="lg">
                <Link href="/about">Hakkımda</Link>
              </Button>
            </div>
          </div>
          {/* Desktop image */}
          <div className="hidden flex-1 md:flex md:justify-end">
            <div className="relative h-64 w-64 overflow-hidden rounded-full border-4 border-primary/10 shadow-xl">
              <Image
                src="/me.jpg"
                alt="Dr. Burak Can"
                fill
                sizes="256px"
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Recent Posts */}
      <section className="mb-16">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-3xl font-bold">Son Yazılar</h2>
          <Button variant="ghost" asChild>
            <Link href="/blog" className="font-medium">
              Tüm Yazılar
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {isPending ? (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="h-10 w-10 animate-spin" />
            </div>
          ) : (
            posts
              ?.slice(0, 6)
              .map((post) => <PostCard key={post.id} post={post} />)
          )}
        </div>
        {!posts?.length && (
          <div className="rounded-lg border border-dashed p-12 text-center">
            <h3 className="mb-2 text-lg font-medium">Henüz yazı bulunamadı</h3>
            <p className="mb-6 text-muted-foreground">
              Yakında yeni yazılar eklenecektir.
            </p>
          </div>
        )}
      </section>

      {/* Features */}
      <section className="mb-16">
        <h2 className="mb-6 text-3xl font-bold">İlgi Alanlarım</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border bg-card p-6 shadow-sm transition-all hover:shadow-md">
            <Stethoscope className="mb-4 h-10 w-10 text-primary" />
            <h3 className="mb-2 text-xl font-medium">Tıp</h3>
            <p className="text-muted-foreground">
              Tıbbi uzmanlığımı kullanarak sağlık sektöründeki yenilikleri ve
              gelişmeleri paylaşıyorum.
            </p>
          </div>
          <div className="rounded-lg border bg-card p-6 shadow-sm transition-all hover:shadow-md">
            <Code className="mb-4 h-10 w-10 text-primary" />
            <h3 className="mb-2 text-xl font-medium">Yazılım Geliştirme</h3>
            <p className="text-muted-foreground">
              Web ve mobil uygulama geliştirme konusundaki deneyimlerimi ve
              öğrendiklerimi aktarıyorum.
            </p>
          </div>
          <div className="rounded-lg border bg-card p-6 shadow-sm transition-all hover:shadow-md">
            <FileText className="mb-4 h-10 w-10 text-primary" />
            <h3 className="mb-2 text-xl font-medium">Sağlık Teknolojileri</h3>
            <p className="text-muted-foreground">
              Tıp ve teknoloji arasındaki kesişim noktalarını araştırıyor ve bu
              alandaki yenilikleri takip ediyorum.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
