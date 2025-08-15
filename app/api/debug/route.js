import connectToDatabase from "@/lib/db";
import ImageModel from "@/app/models/Image";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectToDatabase();
    
    // Get all unique categories
    const categories = await ImageModel.distinct('category');
    
    // Get all images with slug containing 'demo'
    const demoImages = await ImageModel.find({ 
      slug: { $regex: /demo/i } 
    }).select('title category slug');
    
    // Get first 5 images to see structure
    const sampleImages = await ImageModel.find({}).limit(5).select('title category slug');
    
    return NextResponse.json({
      success: true,
      data: {
        categories,
        demoImages,
        sampleImages,
        totalImages: await ImageModel.countDocuments()
      }
    });
  } catch (error) {
    console.error('Debug API error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
