import { blogRouter } from "@/server/api/routers/blog";
import { categoryRouter } from "@/server/api/routers/category";
import { tagRouter } from "@/server/api/routers/tag";
import { seriesRouter } from "@/server/api/routers/series";
import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  blog: blogRouter,
  category: categoryRouter,
  tag: tagRouter,
  series: seriesRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
