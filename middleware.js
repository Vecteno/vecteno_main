import { NextResponse } from "next/server";
import { verifyJWT } from "@/lib/jwt";
import { getToken } from "next-auth/jwt";

export async function middleware(request) {
  const pathname = request.nextUrl.pathname;

  // Allow public routes
  if (
    pathname === "/" ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/resetProfile") ||
    pathname.startsWith("/unauthorized") ||
    pathname.startsWith("/admin/login") ||
    pathname.startsWith("/admin/forgot-password") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/adminLogin") ||
    pathname.startsWith("/api/admin/send-login-otp") ||
    pathname.startsWith("/api/admin/verify-login-otp") ||
    pathname.startsWith("/api/admin/send-reset-otp") ||
    pathname.startsWith("/api/admin/verify-reset-otp") ||
    pathname.startsWith("/api/admin/reset-password") ||
    pathname.startsWith("/api/reset-admin") ||
    pathname.startsWith("/api/debug-token") ||
    pathname.startsWith("/api/fix-admin-password") ||
    pathname.startsWith("/api/createAdmin") ||
    pathname.startsWith("/products") ||
    pathname.startsWith("/search") ||
    pathname.startsWith("/category") ||
    pathname.startsWith("/about") ||
    pathname.startsWith("/contact") ||
    pathname.startsWith("/pricing") ||
    pathname.startsWith("/api/images") ||
    pathname.startsWith("/api/search") ||
    pathname.startsWith("/api/plans") ||
    pathname.startsWith("/api/uploads") ||
    pathname.startsWith("/uploads") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    // Allow category and product routes (e.g., /templates/product-slug, /psd-files/product-slug, etc.)
    /^\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+\/?$/.test(pathname) ||
    /^\/[a-zA-Z0-9_-]+\/?$/.test(pathname) ||
    // Allow three-segment routes for alternative product page structure
    /^\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+\/?$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  // Skip middleware for admin routes - let the client handle authentication
  if (pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  const jwtToken = request.cookies.get("token")?.value;
  let user = null;

  if (jwtToken) {
    try {
      user = await verifyJWT(jwtToken); // custom JWT
    } catch (err) {
      user = null;
    }
  }

  // Try getting user from NextAuth token (for Google logins)
  if (!user) {
    const nextAuthToken = await getToken({ req: request });

    if (nextAuthToken) {
      user = {
        id: nextAuthToken.id,
        role: nextAuthToken.role || "user",
      };
    }
  }

  if (!user) {
    const redirectTo = pathname.startsWith("/admin")
      ? "/admin/login"
      : "/login";
    return NextResponse.redirect(new URL(redirectTo, request.url));
  }

  // Role based protection
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
