import connectToDatabase from "@/lib/db";
import ImageModel from "@/app/models/Image";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    await connectToDatabase();
    const { slug } = await params;
    
    // Fetch the main image
    const image = await ImageModel.findOne({ slug: slug });
    
    if (!image) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }
    
    // Fetch related images
    const relatedImages = await ImageModel.aggregate([
      {
        $match: {
          category: image.category,
          _id: { $ne: image._id },
        },
      },
      {
        $sample: { size: 8 },
      },
    ]);
    
    return NextResponse.json({
      image,
      relatedImages,
    });
  } catch (error) {
    console.error("Error fetching image:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
