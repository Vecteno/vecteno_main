// /api/images/like/route.js
import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import ImageModel from "@/app/models/Image";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { getServerSession } from "next-auth";
import { verifyJWT } from "@/lib/jwt";

export async function POST(req) {
  try {
    await connectToDatabase();

    let userId = null;

    // ✅ Try custom JWT first
    const token = req.cookies.get("token")?.value;
    if (token) {
      try {
        const payload = await verifyJWT(token);
        userId = payload.id;
      } catch (err) {
        userId = null;
      }
    }

    // ✅ Fallback to Google session (NextAuth)
    if (!userId) {
      const session = await getServerSession({ req, ...authOptions });
      if (session?.user?.id) {
        userId = session.user.id;
      }
    }

    // ❌ No user found
    if (!userId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { imageId } = body;

    const image = await ImageModel.findById(imageId);
    if (!image) {
      return NextResponse.json({ success: false, message: "Image not found" }, { status: 404 });
    }

    if (!Array.isArray(image.likedBy)) {
      image.likedBy = [];
    }

    const alreadyLiked = image.likedBy.some((id) => id?.toString() === userId);

    if (alreadyLiked) {
      image.likedBy.pull(userId);
      image.likes -= 1;
    } else {
      image.likedBy.push(userId);
      image.likes += 1;
    }

    await image.save();

    return NextResponse.json({
      success: true,
      liked: !alreadyLiked,
      likes: image.likes,
    });
  } catch (err) {
    console.error("❌ Like route error:", err);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
