import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import ImageModel from "@/app/models/Image";
import { verifyJWT } from "@/lib/jwt";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export async function GET(req) {
  console.log("💡 /api/user/liked hit");

  await connectToDatabase();

  let userId;
  const token = req.cookies.get("token")?.value;
  console.log("Cookie token:", token);

  try {
    if (token) {
      const payload = await verifyJWT(token);
      userId = payload.id;
      console.log("✅ JWT user:", userId);
    } else {
      const session = await getServerSession({ req, ...authOptions });
      console.log("Session from NextAuth:", session);
      if (!session?.user?.id) {
        console.log("❌ No session user ID");
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      userId = session.user.id;
      console.log("✅ Google user:", userId);
    }

    const likedImages = await ImageModel.find({ likedBy: userId }).sort({ createdAt: -1 });
    console.log("👍 Found liked images:", likedImages.length);

    return NextResponse.json({ images: likedImages });
  } catch (err) {
    console.error("❌ Error in liked route:", err);
    return NextResponse.json({ error: "Failed to fetch liked images" }, { status: 500 });
  }
}
