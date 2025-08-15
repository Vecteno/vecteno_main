// app/api/images/[id]/trending/route.js
import connectToDatabase from "@/lib/db";
import ImageModel from "@/app/models/Image";
import { NextResponse } from "next/server";

export async function PATCH(req, { params }) {
  const { id } = params;
  await connectToDatabase();

  try {
    const { isTrending } = await req.json();

    const image = await ImageModel.findByIdAndUpdate(
      id,
      { isTrending },
      { new: true }
    );

    if (!image) {
      return NextResponse.json({ message: "Image not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Trending status updated", image });
  } catch (error) {
    console.error("PATCH /trending error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
