"use client";

import { useEffect, useRef } from "react";
import { incrementView } from "@/server/actions/views";

interface ViewTrackerProps {
  slug: string;
}

/**
 * Client component that tracks unique views for a blog post.
 * 
 * Uses server-side fingerprinting (IP + User-Agent hash) for deduplication,
 * so no localStorage is needed. The server action handles all the logic
 * for checking if this visitor has viewed the post in the last 24 hours.
 * 
 * Features:
 * - Renders nothing (invisible component)
 * - Tracks view only once per component mount
 * - 1-second delay to filter out bots and quick bounces
 * - All deduplication logic handled server-side
 */
export function ViewTracker({ slug }: ViewTrackerProps) {
  const hasTracked = useRef(false);

  useEffect(() => {
    // Only track once per component instance
    if (hasTracked.current) return;
    hasTracked.current = true;

    // Small delay to avoid counting bots and quick bounces
    const timer = setTimeout(async () => {
      try {
        const result = await incrementView(slug);
        if (result.isNewView) {
          console.debug(`[ViewTracker] New view recorded for: ${slug}`);
        }
      } catch (error) {
        // Silently fail - view tracking should not affect UX
        console.error("[ViewTracker] Error tracking view:", error);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [slug]);

  // This component doesn't render anything
  return null;
}
