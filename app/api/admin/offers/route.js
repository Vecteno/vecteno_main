// app/api/admin/offers/route.js
import connectToDatabase from "@/lib/db";
import OfferModel from "@/app/models/offerModel";
import { NextResponse } from "next/server";
import { uploadFile } from "@/lib/fileUpload";

// GET: Fetch all active offers
export async function GET(request) {
  try {
    console.log('Connecting to database...');
    await connectToDatabase();
    console.log('Database connected successfully');

    const { searchParams } = new URL(request.url);
    const latest = searchParams.get("latest");
    console.log('Latest parameter:', latest);

    if (latest === "true") {
      console.log('Fetching latest offer...');
      const latestOffer = await OfferModel.findOne({ isActive: true }).sort({
        createdAt: -1,
      });
      console.log('Latest offer found:', latestOffer ? 'Yes' : 'No');
      return NextResponse.json({ success: true, offer: latestOffer || null });
    }

    console.log('Fetching all active offers...');
    const offers = await OfferModel.find({ isActive: true }).sort({
      createdAt: -1,
    });
    console.log('Offers found:', offers.length);
    return NextResponse.json({ success: true, offers });
  } catch (error) {
    console.error('Error in offers GET route:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// POST: Create a new offer

export async function POST(req) {
  try {
    await connectToDatabase();
    const formData = await req.formData();

    const imageFile = formData.get("image");
    const title = formData.get("title");
    const description = formData.get("description");
    const discountPercent = formData.get("discountPercent");
    const validFrom = formData.get("validFrom");
    const validTill = formData.get("validTill");

    if (!imageFile || typeof imageFile === "string") {
      return NextResponse.json(
        { success: false, error: "Image file missing or invalid" },
        { status: 400 }
      );
    }

    const uploadRes = await uploadFile(imageFile, "images"); // Upload to local storage
    
    if (!uploadRes.success) {
      return NextResponse.json(
        { success: false, error: "Failed to upload image: " + uploadRes.error },
        { status: 500 }
      );
    }

    const newOffer = new OfferModel({
      title,
      description,
      image: uploadRes.url,
      imagePublicId: uploadRes.filename, // Store filename instead of public_id
      discountPercent,
      validFrom,
      validTill,
    });

    await newOffer.save();

    return NextResponse.json({ success: true, offer: newOffer });
  } catch (err) {
    console.error("Offer POST error:", err);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}
