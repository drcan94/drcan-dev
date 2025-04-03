"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { UploadDropzone } from "@/lib/uploadthing";
import { Button } from "./button";
import { X } from "lucide-react";

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
      {preview ? (
        <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
          <Image
            src={preview}
            alt="Cover image"
            fill
            className="object-cover"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute right-2 top-2"
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Remove</span>
          </Button>
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
            alert(`Upload error: ${error.message}`);
          }}
          className="border-2 border-dashed border-muted-foreground/25"
        />
      )}
    </div>
  );
}
