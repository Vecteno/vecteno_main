import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  const cookieStore = cookies();
  // Clear custom JWT token
  cookieStore.set("token", "", {
    path: "/",
    maxAge: 0,
  });
  // Clear NextAuth session cookies (for Google login)  
  cookieStore.set("next-auth.session-token", "", {
    path: "/",
    maxAge: 0,
  });
  cookieStore.set("next-auth.csrf-token", "", {
    path: "/",
    maxAge: 0,
  });
  cookieStore.set("next-auth.callback-url", "", {
    path: "/",
    maxAge: 0,
  });
  // Note: After logout, reload the page on frontend to ensure all cookies/session are cleared
  return NextResponse.json({ message: "Logged out Successfully", status: 200 });
}
