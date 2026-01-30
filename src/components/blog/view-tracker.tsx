"use client";

import { useEffect, useRef } from "react";
import { api } from "@/trpc/react";

interface ViewTrackerProps {
  slug: string;
}

// View expiration time in milliseconds (24 hours)
const VIEW_EXPIRATION_MS = 24 * 60 * 60 * 1000;
const STORAGE_KEY = "drcan_viewed_posts";

interface ViewedPosts {
  [slug: string]: number; // timestamp of when viewed
}

function getViewedPosts(): ViewedPosts {
  if (typeof window === "undefined") return {};
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? (JSON.parse(stored) as ViewedPosts) : {};
  } catch {
    return {};
  }
}

function setViewedPost(slug: string): void {
  if (typeof window === "undefined") return;
  try {
    const viewed = getViewedPosts();
    const now = Date.now();

    // Clean up expired entries while we're here
    const cleaned: ViewedPosts = {};
    for (const [key, timestamp] of Object.entries(viewed)) {
      if (now - timestamp < VIEW_EXPIRATION_MS) {
        cleaned[key] = timestamp;
      }
    }

    // Add current post
    cleaned[slug] = now;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
  } catch {
    // localStorage might be full or disabled
  }
}

function hasViewedRecently(slug: string): boolean {
  const viewed = getViewedPosts();
  const viewedAt = viewed[slug];
  if (!viewedAt) return false;

  const now = Date.now();
  return now - viewedAt < VIEW_EXPIRATION_MS;
}

export function ViewTracker({ slug }: ViewTrackerProps) {
  const hasTracked = useRef(false);
  const incrementViewCount = api.blog.incrementViewCount.useMutation();

  useEffect(() => {
    // Only track once per component instance
    if (hasTracked.current) return;
    hasTracked.current = true;

    // Check if already viewed from this browser recently
    if (hasViewedRecently(slug)) return;

    // Small delay to avoid counting bots and quick bounces
    const timer = setTimeout(() => {
      incrementViewCount.mutate({ slug });
      setViewedPost(slug);
    }, 1000);

    return () => clearTimeout(timer);
  }, [slug, incrementViewCount]);

  // This component doesn't render anything
  return null;
}

