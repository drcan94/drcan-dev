"use server";

import { db } from "@/server/db";
import { generateFingerprint } from "@/lib/fingerprint";

// View expiration time: 24 hours in milliseconds
const VIEW_EXPIRATION_MS = 24 * 60 * 60 * 1000;

interface IncrementViewResult {
  success: boolean;
  viewCount?: number;
  isNewView?: boolean;
  error?: string;
}

/**
 * Server Action to increment the view count for a blog post.
 * 
 * Uses fingerprinting (IP + User-Agent hash) to prevent duplicate
 * counts from the same visitor within 24 hours.
 * 
 * The operation is atomic via Prisma transaction to ensure data consistency.
 * 
 * @param slug - The unique slug of the blog post
 * @returns Object with success status, current viewCount, and whether this was a new view
 */
export async function incrementView(slug: string): Promise<IncrementViewResult> {
  try {
    // 1. Generate fingerprint for this visitor
    const fingerprint = await generateFingerprint();
    
    // 2. Find the post by slug
    const post = await db.blogPost.findUnique({
      where: { slug },
      select: { id: true, published: true, viewCount: true },
    });
    
    // Post not found or not published
    if (!post || !post.published) {
      return {
        success: false,
        error: "Post not found",
      };
    }
    
    // 3. Check if this fingerprint has viewed this post in the last 24 hours
    const cutoffTime = new Date(Date.now() - VIEW_EXPIRATION_MS);
    
    const existingView = await db.postView.findFirst({
      where: {
        postId: post.id,
        fingerprint: fingerprint,
        createdAt: {
          gte: cutoffTime,
        },
      },
      select: { id: true },
    });
    
    // 4. If already viewed recently, return early without incrementing
    if (existingView) {
      return {
        success: true,
        viewCount: post.viewCount,
        isNewView: false,
      };
    }
    
    // 5. New view - run transaction to create view record and increment counter
    const result = await db.$transaction(async (tx) => {
      // Create the view record
      await tx.postView.create({
        data: {
          postId: post.id,
          fingerprint: fingerprint,
        },
      });
      
      // Increment the view count on the post
      const updatedPost = await tx.blogPost.update({
        where: { id: post.id },
        data: {
          viewCount: {
            increment: 1,
          },
        },
        select: {
          viewCount: true,
        },
      });
      
      return updatedPost;
    });
    
    return {
      success: true,
      viewCount: result.viewCount,
      isNewView: true,
    };
  } catch (error) {
    console.error("[incrementView] Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Optional cleanup function to delete old view records.
 * Can be called periodically (e.g., via cron job) to keep the database clean.
 * 
 * @param olderThanDays - Delete records older than this many days (default: 30)
 * @returns Number of deleted records
 */
export async function cleanupOldViews(olderThanDays = 30): Promise<number> {
  try {
    const cutoffDate = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000);
    
    const result = await db.postView.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
      },
    });
    
    console.log(`[cleanupOldViews] Deleted ${result.count} old view records`);
    return result.count;
  } catch (error) {
    console.error("[cleanupOldViews] Error:", error);
    return 0;
  }
}

