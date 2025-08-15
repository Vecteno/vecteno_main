import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import ImageModel from "@/app/models/Image";
import { deleteFile } from "@/lib/fileUpload";
import { checkAdminAuth } from "@/lib/adminAuth";
import path from "path";

export async function POST(req) {
  try {
    // ✅ Auth check
    const { isAuthorized } = await checkAdminAuth(req);
    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await req.json();
    await connectToDatabase();

    // ✅ Find image document
    const image = await ImageModel.findById(id);
    if (!image) {
      return NextResponse.json({ success: false, error: "Image not found" }, { status: 404 });
    }

    // Helper: delete if path exists
    const tryDelete = (fileUrl, label) => {
      if (!fileUrl) return;
      const relativePath = fileUrl.startsWith("/") ? fileUrl.slice(1) : fileUrl;
      const fullPath = path.join(process.cwd(), "public", relativePath);
      const result = deleteFile(fullPath);
      if (result.success) {
        console.log(`✅ Deleted ${label}: ${relativePath}`);
      } else {
        console.warn(`⚠ Could not delete ${label}: ${relativePath} - ${result.error}`);
      }
    };

    // ✅ Delete files from disk
    tryDelete(image.imageUrl, "main image");
    tryDelete(image.thumbnailUrl, "thumbnail");
    tryDelete(image.downloadUrl, "download file");

    // ✅ Delete from MongoDB
    await ImageModel.findByIdAndDelete(id);

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error("❌ Delete error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
