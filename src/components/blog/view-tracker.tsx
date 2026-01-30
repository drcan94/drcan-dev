"use client";

import { useEffect, useRef } from "react";
import { api } from "@/trpc/react";

interface ViewTrackerProps {
  slug: string;
}

export function ViewTracker({ slug }: ViewTrackerProps) {
  const hasTracked = useRef(false);
  const incrementViewCount = api.blog.incrementViewCount.useMutation();

  useEffect(() => {
    // Only track once per page load
    if (hasTracked.current) return;
    hasTracked.current = true;

    // Small delay to avoid counting bots and quick bounces
    const timer = setTimeout(() => {
      incrementViewCount.mutate({ slug });
    }, 1000);

    return () => clearTimeout(timer);
  }, [slug, incrementViewCount]);

  // This component doesn't render anything
  return null;
}

