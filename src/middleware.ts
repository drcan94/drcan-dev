import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { type NextRequest } from "next/server";
import { env } from "@/env";

export async function middleware(request: NextRequest) {
  // Get token with JWT strategy
  const token = await getToken({
    req: request,
    secret: env.AUTH_SECRET,
    secureCookie: env.NODE_ENV === "production",
    cookieName:
      env.NODE_ENV === "test"
        ? "authjs.test.session-token"
        : env.NODE_ENV === "development"
          ? "authjs.session-token"
          : "__Secure-authjs.session-token", // match config
  });

  // console.log("🔑 TOKEN:", JSON.stringify(token, null, 2));

  const isLoggedIn = !!token;

  // Admin routes protection
  if (request.nextUrl.pathname.startsWith("/admin")) {
    if (!isLoggedIn) {
      console.log("⛔ Not logged in, redirecting to signin");
      return NextResponse.redirect(new URL("/api/auth/signin", request.url));
    }

    // DEBUGGING: Log the token and isAdmin value
    // console.log(
    //   `⚙️ Admin check - isAdmin: ${token?.isAdmin}, email: ${token?.email}`,
    // );

    // Yerel ortam kontrolü ekleying,t
    const isDevelopment = process.env.NODE_ENV === "development";

    // Check if user is admin - consider null/undefined as false
    // Yerel ortamda admin kontrolünü atlayabilirsiniz
    if (!isDevelopment && token?.isAdmin !== true) {
      // console.log("⛔ Not admin, redirecting to home");
      return NextResponse.redirect(new URL("/", request.url));
    }

    // console.log("✅ Admin access granted");
  }

  // If already logged in, redirect from signin page to home
  if (isLoggedIn && request.nextUrl.pathname === "/api/auth/signin") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/auth/signin"],
};
