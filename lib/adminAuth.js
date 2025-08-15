import { verifyJWT } from "@/lib/jwt";
import { getToken } from "next-auth/jwt";

export async function checkAdminAuth(req) {
  // Check authentication
  let token = req.cookies.get("token")?.value;
  let user = null;

  // If no cookie token, check Authorization header for Bearer token
  if (!token) {
    const authHeader = req.headers.get('Authorization') || req.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }

  if (token) {
    try {
      user = await verifyJWT(token);
    } catch (err) {
      user = null;
    }
  }

  // Try NextAuth token if custom JWT fails
  if (!user) {
    const nextAuthToken = await getToken({ req });
    if (nextAuthToken) {
      user = {
        id: nextAuthToken.id,
        role: nextAuthToken.role || "user",
      };
    }
  }

  // Check if user is admin
  if (!user || user.role !== "admin") {
    return { isAuthorized: false, user: null };
  }

  return { isAuthorized: true, user };
}
