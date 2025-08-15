import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Coupon from "@/app/models/couponModel";

export async function GET() {
  try {
    await dbConnect();
    const coupons = await Coupon.find({}).sort({ createdAt: -1 });
    
    return NextResponse.json({
      success: true,
      coupons,
    });
  } catch (error) {
    console.error("Error fetching coupons:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch coupons" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    const formData = await request.formData();
    
    const code = formData.get("code");
    const discountPercent = formData.get("discountPercent");
    const validFrom = formData.get("validFrom");
    const validTill = formData.get("validTill");
    const usageLimit = formData.get("usageLimit");

    // Validate required fields
    if (!code || !discountPercent || !validFrom || !validTill) {
      return NextResponse.json(
        { success: false, message: "All fields are required" },
        { status: 400 }
      );
    }

    // Check if coupon code already exists
    const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (existingCoupon) {
      return NextResponse.json(
        { success: false, message: "Coupon code already exists" },
        { status: 400 }
      );
    }

    // Create new coupon
    const coupon = new Coupon({
      code: code.toUpperCase(),
      discountPercent: parseInt(discountPercent),
      validFrom: new Date(validFrom),
      validTill: new Date(validTill),
      usageLimit: parseInt(usageLimit) || 10,
      usedBy: [],
    });

    await coupon.save();

    return NextResponse.json({
      success: true,
      message: "Coupon created successfully",
      coupon,
    });
  } catch (error) {
    console.error("Error creating coupon:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create coupon" },
      { status: 500 }
    );
  }
} 