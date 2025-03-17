import { PrismaAdapter } from "@auth/prisma-adapter";
import { type DefaultSession, type NextAuthConfig } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

import { db } from "@/server/db";
import { env } from "@/env";
import { type Adapter } from "next-auth/adapters";
/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      isAdmin: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    isAdmin: boolean;
  }

  interface JWT {
    isAdmin?: boolean;
  }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authConfig = {
  providers: [
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    }),
    /**
     * ...add more providers here.
     *
     * Most other providers require a bit more work than the Discord provider. For example, the
     * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
     * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
     *
     * @see https://next-auth.js.org/providers/github
     */
  ],
  adapter: PrismaAdapter(db) as Adapter,
  secret: env.AUTH_SECRET,
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Secure-authjs.session-token"
          : "authjs.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        domain:
          process.env.NODE_ENV === "production" ? "drcan.dev" : "localhost",
      },
    },
  },
  callbacks: {
    signIn: async ({ user }) => {
      // Only allow specific email to sign in
      return user.email === "drcan94@gmail.com";
    },
    jwt: async ({ token, user, account }) => {
      // Log for debugging
      console.log("JWT Callback - User:", user);
      console.log("JWT Callback - Token:", token);

      // Initial sign in
      if (account && user) {
        // If the email is our admin email, set isAdmin to true
        const isAdmin = user.email === "drcan94@gmail.com";

        return {
          ...token,
          isAdmin,
          id: user.id,
        };
      }

      // Return previous token if the user data is not available
      return token;
    },
    session: ({ session, token }) => {
      if (token && session.user) {
        session.user.id = token.sub as string;
        session.user.isAdmin = !!token.isAdmin;
      }
      // Log for debugging
      console.log("Session Callback - Session:", session);
      return session;
    },
  },
} satisfies NextAuthConfig;
