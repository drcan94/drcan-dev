"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

export function AdminPostsFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get current filter values from URL
  const categoryId = searchParams?.get("kategori") || undefined;
  const tagId = searchParams?.get("etiket") || undefined;
  const published = searchParams?.get("durum");
  const fromDate = searchParams?.get("baslangic");
  const toDate = searchParams?.get("bitis");
  const sortBy = searchParams?.get("sirala") || "createdAt";
  const sortDirection = searchParams?.get("yon") || "desc";

  // Get categories and tags
  const { data: categories } = api.category.getAll.useQuery();
  const { data: tags } = api.tag.getAll.useQuery();

  // Update filters
  const updateFilters = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams?.toString());

    // Update provided parameters
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    // Reset to first page when filters change
    params.set("sayfa", "1");

    router.push(`/admin/posts?${params.toString()}`);
  };

  // Reset all filters
  const resetFilters = () => {
    const params = new URLSearchParams();
    params.set("sayfa", "1");
    router.push(`/admin/posts?${params.toString()}`);
  };

  // Count active filters
  const getActiveFilterCount = () => {
    let count = 0;
    if (published !== null) count++;
    if (categoryId !== undefined) count++;
    if (tagId !== undefined) count++;
    if (fromDate !== null) count++;
    if (toDate !== null) count++;
    if (sortBy !== "createdAt") count++;
    if (sortDirection !== "desc") count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <Accordion type="single" collapsible defaultValue="item-1">
      <AccordionItem value="item-1">
        <div className="flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold">Filtreler</h2>
            {activeFilterCount > 0 && (
              <span className="flex h-6 items-center justify-center rounded-full bg-primary/10 px-2 text-xs font-medium text-primary">
                {activeFilterCount} aktif filtre
              </span>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              resetFilters();
            }}
            className="h-8 px-2 text-xs"
          >
            Filtreleri Temizle
          </Button>
        </div>

        <AccordionTrigger className="py-4 hover:no-underline">
          <span className="text-sm text-muted-foreground">
            {activeFilterCount > 0
              ? "Filtreleri düzenlemek için tıklayın"
              : "Filtre eklemek için tıklayın"}
          </span>
        </AccordionTrigger>

        <AccordionContent>
          <div className="space-y-4 pt-4">
            {/* Status filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Durum</label>
              <Select
                value={published ?? "all"}
                onValueChange={(value) =>
                  updateFilters({
                    durum: value === "all" ? null : value,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Durum seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  <SelectItem value="true">Yayında</SelectItem>
                  <SelectItem value="false">Taslak</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Category filter */}
            {categories && categories.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Kategori</label>
                <Select
                  value={categoryId ?? "all"}
                  onValueChange={(value) =>
                    updateFilters({
                      kategori: value === "all" ? null : value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Kategori seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tümü</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Tag filter */}
            {tags && tags.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Etiket</label>
                <Select
                  value={tagId ?? "all"}
                  onValueChange={(value) =>
                    updateFilters({
                      etiket: value === "all" ? null : value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Etiket seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tümü</SelectItem>
                    {tags.map((tag) => (
                      <SelectItem key={tag.id} value={tag.id}>
                        {tag.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Date range filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Tarih Aralığı</label>
              <div className="grid gap-2">
                {/* From date */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !fromDate && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {fromDate ? (
                        format(new Date(fromDate), "d MMMM yyyy", {
                          locale: tr,
                        })
                      ) : (
                        <span>Başlangıç tarihi</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={fromDate ? new Date(fromDate) : undefined}
                      onSelect={(date: Date | undefined) =>
                        updateFilters({
                          baslangic: date?.toISOString().split("T")[0] ?? null,
                        })
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>

                {/* To date */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !toDate && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {toDate ? (
                        format(new Date(toDate), "d MMMM yyyy", { locale: tr })
                      ) : (
                        <span>Bitiş tarihi</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={toDate ? new Date(toDate) : undefined}
                      onSelect={(date: Date | undefined) =>
                        updateFilters({
                          bitis: date?.toISOString().split("T")[0] ?? null,
                        })
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Sort options */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Sıralama</label>
              <div className="grid grid-cols-2 gap-2">
                <Select
                  value={sortBy}
                  onValueChange={(value) =>
                    updateFilters({
                      sirala: value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="createdAt">Oluşturma Tarihi</SelectItem>
                    <SelectItem value="updatedAt">Güncelleme Tarihi</SelectItem>
                    <SelectItem value="title">Başlık</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={sortDirection}
                  onValueChange={(value) =>
                    updateFilters({
                      yon: value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desc">Azalan</SelectItem>
                    <SelectItem value="asc">Artan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
