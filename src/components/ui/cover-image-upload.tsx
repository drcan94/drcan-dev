"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { UploadDropzone } from "@/lib/uploadthing";
import { Button } from "./button";
import { X, Info } from "lucide-react";

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
      <div className="rounded-md bg-muted p-3 text-sm">
        <div className="mb-2 flex items-center gap-2 font-medium">
          <Info className="h-4 w-4 text-blue-500" />
          <span>Kapak görseli önerileri:</span>
        </div>
        <ul className="ml-6 list-disc space-y-1 text-muted-foreground">
          <li>Önerilen boyut: 1200×630 piksel (16:9 oranı)</li>
          <li>Maksimum dosya boyutu: 4MB</li>
          <li>Format: JPEG, PNG veya WebP</li>
          <li>Yatay (landscape) görsel kullanmanız önerilir</li>
          <li>İçeriği ortalayın, kenarlardan kırpılabilir</li>
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
          className="border-2 border-dashed border-muted-foreground/25"
        />
      )}
    </div>
  );
}
