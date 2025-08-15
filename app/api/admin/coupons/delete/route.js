import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Coupon from "@/app/models/couponModel";

export async function POST(request) {
  try {
    await dbConnect();
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Coupon ID is required" },
        { status: 400 }
      );
    }

    const deletedCoupon = await Coupon.findByIdAndDelete(id);
    
    if (!deletedCoupon) {
      return NextResponse.json(
        { success: false, message: "Coupon not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Coupon deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting coupon:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete coupon" },
      { status: 500 }
    );
  }
} 