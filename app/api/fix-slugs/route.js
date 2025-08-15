import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import ImageModel from "@/app/models/Image";

export const GET = async () => {
  try {
    await connectToDatabase();
    
    // Find all images that don't have a proper slug or have undefined slug
    const images = await ImageModel.find({
      $or: [
        { slug: { $exists: false } },
        { slug: null },
        { slug: undefined },
        { slug: "" }
      ]
    });

    let updatedCount = 0;
    
    for (const image of images) {
      // Generate slug from title - convert spaces to hyphens and remove special characters
      const slug = image.title
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-") // Convert spaces to hyphens
        .replace(/[^a-z0-9\-]/g, "") // Remove special characters except hyphens
        .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
        .replace(/^-|-$/g, ""); // Remove leading/trailing hyphens
      
      // Update the image with the new slug
      await ImageModel.findByIdAndUpdate(image._id, { slug });
      updatedCount++;
    }

    return NextResponse.json({ 
      success: true, 
      message: `Updated ${updatedCount} products with proper slugs`,
      updatedCount 
    });
  } catch (error) {
    console.error("Error fixing slugs:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}; 