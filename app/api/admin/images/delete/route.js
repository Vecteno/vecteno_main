import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import ImageModel from "@/app/models/Image";
import { deleteFile } from "@/lib/fileUpload";
import { checkAdminAuth } from "@/lib/adminAuth";
import path from "path";
import fs from "fs";

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

    // Helper to convert API URL → real storage path
    const apiUrlToStoragePath = (fileUrl) => {
      if (!fileUrl) return null;

      // Remove leading /api/uploads/ and replace with storage/
      let relativePath = fileUrl.replace(/^\/api\/uploads\//, "storage/");

      // Join with project root path
      return path.join(process.cwd(), relativePath);
    };

    // Helper to delete if path exists
    const tryDelete = (fileUrl, label) => {
      const filePath = apiUrlToStoragePath(fileUrl);
      if (!filePath) return;

      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
          console.log(`✅ Deleted ${label}: ${filePath}`);
        } catch (err) {
          console.error(`❌ Failed to delete ${label}: ${filePath} - ${err.message}`);
        }
      } else {
        console.warn(`⚠ File not found for ${label}: ${filePath}`);
      }
    };

    // ✅ Delete files from /storage
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
