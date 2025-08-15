// app/api/admin/homepage/route.js

import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import HomepageSettings from "@/app/models/HomepageSettings";
import cloudinary from "@/lib/cloudinary";

export async function GET() {
  try {
    await connectToDatabase();
    const settings = await HomepageSettings.findOne({});
    return NextResponse.json({ success: true, data: settings });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("image"); // optional
    const mainHeading = formData.get("mainHeading") || "";
    const subHeading = formData.get("subHeading") || "";

    await connectToDatabase();

    let heroImageUrl = null;
    let public_id = null;

    const existingSettings = await HomepageSettings.findOne();

    // ✅ Upload new image and delete old one if exists
    if (file && file.size > 0) {
      const buffer = Buffer.from(await file.arrayBuffer());

      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { folder: "vecteno_homepage" },
          (err, res) => {
            if (err) reject(err);
            else resolve(res);
          }
        ).end(buffer);
      });

      if (existingSettings?.public_id) {
        await cloudinary.uploader.destroy(existingSettings.public_id);
        console.log("🗑️ Old banner deleted:", existingSettings.public_id);
      }

      heroImageUrl = result.secure_url;
      public_id = result.public_id;
    }

    // ✅ Create or update the settings
    const updatedSettings = await HomepageSettings.findOneAndUpdate(
      {},
      {
        ...(heroImageUrl && { heroImageUrl }),
        ...(public_id && { public_id }),
        ...(mainHeading && { mainHeading }),
        ...(subHeading && { subHeading }),
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({ success: true, data: updatedSettings });
  } catch (err) {
    console.error("Banner upload error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
