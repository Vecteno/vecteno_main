import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import ImageModel from "@/app/models/Image";
import { checkAdminAuth } from "@/lib/adminAuth";

export const GET = async (req) => {
  try {
    // ✅ Check admin authentication
    const { isAuthorized } = await checkAdminAuth(req);
    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const { searchParams } = new URL(req.url);

    // ✅ Pagination parameters
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 50; // default 50 per page
    const skip = (page - 1) * limit;

    // ✅ Optional search filter (future-proof)
    let query = {};
    const search = searchParams.get("q");
    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    // ✅ Optional category filter (future-proof)
    const category = searchParams.get("category");
    if (category) {
      query.category = category;
    }

    // ✅ Fetch images with filters, sorting, and pagination
    const images = await ImageModel.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await ImageModel.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    // ✅ Debug logging
    console.log(
      `Page ${page} / ${totalPages}, Showing ${images.length} images`
    );

    return NextResponse.json({
      images,
      total,
      page,
      limit,
      totalPages,
    });
  } catch (err) {
    console.error("Error fetching images:", err);
    return NextResponse.json(
      { error: "Failed to fetch images" },
      { status: 500 }
    );
  }
};
