import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import ImageModel from "@/app/models/Image";

export async function GET() {
  try {
    await connectToDatabase();

    // First try to get images sorted by likes, if no likes then by creation date
    let images = await ImageModel.find({})
      .sort({ likes: -1, createdAt: -1 }) // Most liked first, then newest
      .limit(8);

    // If no images found, still return success with empty array
    console.log("Found images:", images.length);
    if (images.length > 0) {
      console.log("Sample image:", {
        title: images[0].title,
        imageUrl: images[0].imageUrl,
        thumbnailUrl: images[0].thumbnailUrl
      });
    }

    return NextResponse.json({ success: true, images });
  } catch (err) {
    console.error("Top liked route error:", err);
    return NextResponse.json(
      { success: false, message: "Failed to fetch top liked images", error: err.message },
      { status: 500 }
    );
  }
}
