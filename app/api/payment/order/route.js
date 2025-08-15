import { NextResponse } from "next/server";
import { getRazorpayInstance } from "@/lib/razorpay";
import connectToDatabase from "@/lib/db";

export async function POST(req) {
  try {
    await connectToDatabase();
    const body = await req.json();

    console.log("Amount received in body:", body.amount);

    if (!body.amount) {
      return NextResponse.json({ success: false, error: "Amount is required" }, { status: 400 });
    }

    const razorpay = await getRazorpayInstance();

    const options = {
      amount: body.amount * 100, // in paise
      currency: "INR",
      receipt: `receipt_order_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    return NextResponse.json({ success: true, order });
  } catch (err) {
    console.error("Razorpay error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
