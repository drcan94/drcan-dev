import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { v2 as cloudinary } from "cloudinary";

export const generateSignatureRouter = createTRPCRouter({
  getSignature: protectedProcedure.query(() => {
    const api_secret = process.env.NEXT_PUBLIC_CLOUDINARY_SECRET_KEY || "";
    const folder = process.env.NEXT_PUBLIC_CLOUDINARY_FOLDER_NAME || "";;
    const timestamp = Math.round(new Date().getTime() / 1000);
    const signature = cloudinary.utils.api_sign_request({ timestamp, folder }, api_secret);
    return { signature, timestamp, folder };
  }),
});
