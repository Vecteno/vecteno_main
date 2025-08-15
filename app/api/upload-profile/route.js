import { NextResponse } from "next/server";
import { uploadFile } from "@/lib/fileUpload";

export const POST = async (req) => {
  try {
    const formData = await req.formData();
    const imageFile = formData.get("image");
    const type = formData.get("type") || "profileImages";

    if (!imageFile) {
      return NextResponse.json(
        { success: false, error: "Image file is required." },
        { status: 400 }
      );
    }

    // Upload image to local storage
    const imageRes = await uploadFile(imageFile, type);
    if (!imageRes.success) {
      return NextResponse.json(
        { success: false, error: "Failed to upload image: " + imageRes.error },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      url: imageRes.url,
      filename: imageRes.filename 
    });

  } catch (err) {
    console.error("Profile upload error:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
};
