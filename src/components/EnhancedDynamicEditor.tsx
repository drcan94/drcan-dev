"use client";

import dynamic from "next/dynamic";

export const EnhancedEditor = dynamic(
  () =>
    import("./EnhancedEditor").then((mod) => ({ default: mod.EnhancedEditor })),
  { ssr: false },
);
