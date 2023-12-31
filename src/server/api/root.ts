import { createTRPCRouter } from '~/server/api/trpc'
import {
  postRouter,
  userRouter,
  generateSignatureRouter
} from '~/server/api/routers'

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  post: postRouter,
  user: userRouter,
  generateSignature: generateSignatureRouter,
})

// export type definition of API
export type AppRouter = typeof appRouter
