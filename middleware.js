import { NextResponse } from "next/server";
import { verifyJWT } from "@/lib/jwt";
import { getToken } from "next-auth/jwt";

export async function middleware(request) {
  const pathname = request.nextUrl.pathname;

  // ✅ Public routes
  const publicRoutes = [
    "/", "/login", "/signup", "/resetProfile", "/unauthorized",
    "/admin/login", "/admin/forgot-password",
    "/api/auth", "/api/auth/", "/api/auth/signin", "/api/auth/signin/google", "/api/auth/callback", "/api/auth/callback/google", "/api/auth/session", "/api/auth/providers", "/api/auth/csrf", "/api/auth/error", "/api/auth/_log", "/api/adminLogin", "/api/admin/send-login-otp",
    "/api/admin/verify-login-otp", "/api/admin/send-reset-otp",
    "/api/admin/verify-reset-otp", "/api/admin/reset-password",
    "/api/reset-admin", "/api/debug-token", "/api/fix-admin-password",
    "/api/createAdmin", "/products", "/search", "/category",
    "/about", "/contact", "/pricing", "/api/images", "/api/search",
    "/api/plans", "/api/uploads", "/uploads", "/_next", "/favicon.ico"
  ];

  if (
    publicRoutes.some(route => pathname.startsWith(route)) ||
    /^\/[a-zA-Z0-9_-]+\/?$/.test(pathname) ||
    /^\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+\/?$/.test(pathname) ||
    /^\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+\/?$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  // Skip admin routes, handled client-side
  if (pathname.startsWith("/admin")) return NextResponse.next();

  let user = null;

  // ✅ Check custom JWT
  const jwtToken = request.cookies.get("token")?.value;
  if (jwtToken) {
    try {
      user = await verifyJWT(jwtToken);
    } catch (err) {
      user = null;
    }
  }

  // ✅ Check NextAuth session for Google login
  if (!user) {
    const nextAuthToken = await getToken({ req: request });
    if (nextAuthToken) {
      user = {
        id: nextAuthToken.id,
        role: nextAuthToken.role || "user"
      };
    }
  }

  // ❌ Not authenticated → redirect to login
  if (!user) {
    const redirectTo = pathname.startsWith("/admin") ? "/admin/login" : "/login";
    return NextResponse.redirect(new URL(redirectTo, request.url));
  }

  // ✅ Role-based protection
  if (pathname.startsWith("/admin") && user.role !== "admin") {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }
  if (pathname.startsWith("/user") && user.role !== "user") {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  console.log("✅ Authenticated user:", user);
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
