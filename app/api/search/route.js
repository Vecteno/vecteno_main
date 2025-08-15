import { NextResponse } from "next/server"; 
import connectToDatabase from "@/lib/db";
import ImageModel from "@/app/models/Image";

export async function GET(request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const category = searchParams.get("category") || "";

    const regex = new RegExp(query, "i");

    let filter = {
      $or: [
        { title: regex },
        { description: regex },
        { tags: { $in: [regex] } },
      ],
    };

    if (category && category.toLowerCase() !== "all" && category.toLowerCase() !== "all creatives") {
      filter.category = category;
    }

    const images = await ImageModel.find(filter);

    return NextResponse.json({ images });
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json({ images: [] }, { status: 500 });
  }
}

