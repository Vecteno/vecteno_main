import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import ImageModel from "@/app/models/Image";
import { uploadFile } from "@/lib/fileUpload";

export const POST = async (req) => {
  try {
    const formData = await req.formData();

    const thumbnailFile = formData.get("thumbnail"); // Main display image
    const downloadFile = formData.get("downloadFile"); // Optional download file
    const title = formData.get("title");
    
    // Get slug from form or generate from title
    let slug = formData.get("slug") || title
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-") // Convert spaces to hyphens
      .replace(/[^a-z0-9\-]/g, "") // Remove special characters except hyphens
      .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
      .replace(/^-|-$/g, ""); // Remove leading/trailing hyphens

    if (!thumbnailFile) {
      return NextResponse.json(
        { success: false, error: "Thumbnail image is required." },
        { status: 400 }
      );
    }

    // Upload thumbnail to local storage (this will be the main display image)
    const thumbnailRes = await uploadFile(thumbnailFile, 'images');
    if (!thumbnailRes.success) {
      return NextResponse.json(
        { success: false, error: "Failed to upload thumbnail: " + thumbnailRes.error },
        { status: 500 }
      );
    }

    // Upload download file if provided
    let downloadRes = null;
    if (downloadFile) {
      downloadRes = await uploadFile(downloadFile, 'downloads');
      if (!downloadRes.success) {
        return NextResponse.json(
          { success: false, error: "Failed to upload download file: " + downloadRes.error },
          { status: 500 }
        );
      }
    }

    // Save both URLs to MongoDB
    await connectToDatabase();
    const isTrending =
      formData.get("isTrending") === "true" ||
      formData.get("isTrending") === true;

    // Extract fileTypes and orientation arrays
    const fileTypesStr = formData.get("fileTypes");
    const orientationStr = formData.get("orientation");
    
    let fileTypes = [];
    let orientation = [];
    
    // Handle JSON strings from form
    try {
      if (fileTypesStr) {
        fileTypes = typeof fileTypesStr === 'string' && fileTypesStr.startsWith('[') 
          ? JSON.parse(fileTypesStr)
          : fileTypesStr.split(",").map((type) => type.trim()).filter(Boolean);
      }
    } catch (e) {
      fileTypes = [];
    }
    
    try {
      if (orientationStr) {
        orientation = typeof orientationStr === 'string' && orientationStr.startsWith('[')
          ? JSON.parse(orientationStr)
          : orientationStr.split(",").map((orient) => orient.trim()).filter(Boolean);
      }
    } catch (e) {
      orientation = [];
    }

    // Parse tags
    const tagsInput = formData.get("tags") || "";
    const tags = tagsInput ? tagsInput.split(",").map((tag) => tag.trim()).filter(Boolean) : [];
    
    const imageData = {
      title: title,
      slug: slug,
      description: formData.get("description"),
      category: formData.get("category"),
      tags: tags,
      type: formData.get("type") || "free",
      imageUrl: thumbnailRes.url, // Use thumbnail as main image
      fileName: thumbnailRes.filename,
      thumbnailUrl: thumbnailRes.url, // Same as imageUrl for now
      thumbnailFileName: thumbnailRes.filename,
      isTrending,
      fileTypes,
      orientation,
      // SEO fields
      metaTitle: formData.get("metaTitle") || "",
      metaDescription: formData.get("metaDescription") || "",
      focusKeywords: formData.get("focusKeywords") || "",
    };
    
    // Add download file info if provided
    if (downloadRes) {
      imageData.downloadUrl = downloadRes.url;
      imageData.downloadFileName = downloadRes.filename;
    }
    
    const newImage = await ImageModel.create(imageData);
    console.log("Raw isTrending:", formData.get("isTrending"));
    console.log("Image object:", newImage);

    return NextResponse.json({ success: true, image: newImage });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
};
