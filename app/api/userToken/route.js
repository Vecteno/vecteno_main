import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/jwt";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("token")?.value;

    // ✅ Check custom JWT token first
    if (token) {
      try {
        const payload = await verifyJWT(token);
        return NextResponse.json({ isAuthenticated: true, user: payload });
      } catch (err) {
        // fall through to NextAuth check
      }
    }

    // ✅ Fallback to Google (NextAuth) session
    const session = await getServerSession({ req: request, ...authOptions });

    if (session?.user) {
      return NextResponse.json({
        isAuthenticated: true,
        user: session.user,
      });
    }

    // ❌ Not authenticated
    return NextResponse.json({ isAuthenticated: false });
  } catch (error) {
    return NextResponse.json({ isAuthenticated: false });
  }
}
