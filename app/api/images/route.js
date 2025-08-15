import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import ImageModel from "@/app/models/Image";

export const GET = async (req) => {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 13;
    const skip = (page - 1) * limit;

    const type = searchParams.get("type");
    const category = searchParams.get("category");
    const orientation = searchParams.get("orientation");
    const fileType = searchParams.get("fileType");
    
    let query = {};
    
    // Type filter (premium/free)
    if (type === "premium") query.type = "premium";
    if (type === "free") query.type = "free";
    
    // Category filter - flexible matching
    if (category) {
      query.category = { $regex: new RegExp(category, "i") };
    }
    
    // Orientation filter
    if (orientation) {
      const orientations = orientation.split(',').filter(o => o.trim());
      if (orientations.length > 0) {
        query.orientation = { $in: orientations };
      }
    }
    
    // File type filter
    if (fileType) {
      const fileTypes = fileType.split(',').filter(f => f.trim());
      if (fileTypes.length > 0) {
        query.fileTypes = { $in: fileTypes };
      }
    }

    const images = await ImageModel.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await ImageModel.countDocuments(query);

    return new Response(JSON.stringify({ images, total }), { status: 200 });
  } catch (err) {
    console.error('Error fetching images:', err);
    return new Response(JSON.stringify({ images: [], total: 0, error: "Failed to fetch" }), {
      status: 500,
    });
  }
};
