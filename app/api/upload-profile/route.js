import { NextResponse } from "next/server";
import { uploadFile } from "@/lib/fileUpload";
import { deleteOldImage } from "@/lib/imageUtils";

export const POST = async (req) => {
  try {
    const formData = await req.formData();
    const imageFile = formData.get("image");
    const oldImage = formData.get("oldImage");
    const type = "profileImages"; // force profile images type

    if (!imageFile) {
      return NextResponse.json(
        { success: false, error: "Image file is required." },
        { status: 400 }
      );
    }

    // Upload to storage/profile-images
    const imageRes = await uploadFile(imageFile, type);
    if (!imageRes.success) {
      return NextResponse.json(
        { success: false, error: "Failed to upload image: " + imageRes.error },
        { status: 500 }
      );
    }

    if (oldImage) {
      deleteOldImage(oldImage);
    }

    return NextResponse.json({
      success: true,
      url: imageRes.url, // URL for frontend
      filename: imageRes.filename,
    });
  } catch (err) {
    console.error("Profile upload error:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
};
