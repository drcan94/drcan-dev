"use client";

import dynamic from "next/dynamic";

export const ImageUploadEditor = dynamic(
  () =>
    import("./ImageUploadEditor").then((mod) => ({
      default: mod.ImageUploadEditor,
    })),
  { ssr: false },
);
