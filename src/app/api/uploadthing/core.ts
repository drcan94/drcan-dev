import { createUploadthing, type FileRouter } from "uploadthing/next";
import { auth } from "@/server/auth";

const f = createUploadthing();

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Route for blog post cover images - larger size, single file
  coverImage: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(async () => {
      // Run auth to verify user is logged in and admin
      const session = await auth();

      if (!session?.user || !session.user.isAdmin) {
        throw new Error("Unauthorized: Admin only");
      }

      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Cover image uploaded by", metadata.userId);
      return { uploadedBy: metadata.userId, url: file.url };
    }),

  // Route for blog post inline content images - multiple files possible
  blogInlineImage: f({ image: { maxFileSize: "2MB", maxFileCount: 4 } })
    .middleware(async () => {
      // Run auth to verify user is logged in and admin
      const session = await auth();

      if (!session?.user || !session.user.isAdmin) {
        throw new Error("Unauthorized: Admin only");
      }

      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Inline image uploaded by", metadata.userId);
      return { uploadedBy: metadata.userId, url: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
