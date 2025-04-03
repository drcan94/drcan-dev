"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { UploadDropzone } from "@/lib/uploadthing";
import { Button } from "./button";
import { X, Info, ImageIcon } from "lucide-react";

interface CoverImageUploadProps {
  value: string | null | undefined;
  onChange: (url: string | null) => void;
}

export function CoverImageUpload({ value, onChange }: CoverImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(value || null);

  // Update preview when value prop changes
  useEffect(() => {
    console.log("CoverImageUpload value changed:", value);
    setPreview(value || null);
  }, [value]);

  const handleRemove = () => {
    setPreview(null);
    onChange(null);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-md bg-blue-50 p-4 text-sm dark:bg-blue-950/50">
        <div className="mb-3 flex items-center gap-2 font-medium text-blue-700 dark:text-blue-400">
          <Info className="h-4 w-4" />
          <span>En iyi görünüm için görsel yükleme kuralları:</span>
        </div>
        <ul className="ml-6 list-disc space-y-1.5 text-blue-700/90 dark:text-blue-400/90">
          <li>
            <strong>16:9 en-boy oranı</strong> kullanın (1920×1080, 1280×720,
            800×450 piksel)
          </li>
          <li>Görseller, kartlarda tam olarak görüntülenecektir</li>
          <li>Maksimum dosya boyutu: 4MB</li>
          <li>Önerilen formatlar: JPEG, PNG veya WebP</li>
          <li>Daha net görünüm için yüksek çözünürlüklü görseller kullanın</li>
        </ul>
      </div>

      {preview ? (
        <div className="relative w-full overflow-hidden rounded-lg border">
          <div className="relative aspect-[16/9]">
            <Image
              src={preview}
              alt="Cover image"
              fill
              className="object-contain"
            />
          </div>
          <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity hover:bg-black/20 hover:opacity-100">
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="shadow-md"
              onClick={handleRemove}
            >
              <X className="mr-2 h-4 w-4" />
              Görseli Kaldır
            </Button>
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-md border-2 border-dashed border-muted-foreground/25">
          <UploadDropzone
            endpoint="coverImage"
            onClientUploadComplete={(res) => {
              console.log("Upload complete:", res);
              // Use the first file's URL if available
              if (res && res[0]) {
                const url = res[0].url;
                setPreview(url);
                onChange(url);
              }
            }}
            onUploadError={(error: Error) => {
              console.error("Upload error:", error);
              alert(`Yükleme hatası: ${error.message}`);
            }}
            className="py-8"
            content={{
              label: (
                <div className="flex flex-col items-center gap-4">
                  <ImageIcon className="h-10 w-10 text-muted-foreground/50" />
                  <div className="space-y-2 text-center">
                    <p className="text-sm font-medium text-foreground">
                      Kapak görseli yüklemek için tıklayın veya dosyayı
                      sürükleyin
                    </p>
                    <p className="text-xs text-muted-foreground">
                      16:9 oranında görsel yüklemeniz önerilir (1920×1080,
                      1280×720)
                    </p>
                  </div>
                </div>
              ),
            }}
          />
        </div>
      )}
    </div>
  );
}
