import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import ImageModel from "@/app/models/Image";

export const GET = async () => {
  try {
    await connectToDatabase();
    
    // Get all images
    const images = await ImageModel.find({});

    let updatedCount = 0;
    let errors = [];
    
    for (const image of images) {
      try {
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
        
        console.log(`Updated: ${image.title} -> ${slug}`);
      } catch (error) {
        errors.push(`Error updating ${image.title}: ${error.message}`);
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Updated ${updatedCount} products with proper slugs`,
      updatedCount,
      errors: errors.length > 0 ? errors : null
    });
  } catch (error) {
    console.error("Error fixing all slugs:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}; 