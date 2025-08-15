import connectToDatabase from "@/lib/db";
import OfferModel from "@/app/models/offerModel";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    console.log('Testing database connection...');
    await connectToDatabase();
    console.log('Database connection successful');

    // Test if we can query the offers collection
    const offerCount = await OfferModel.countDocuments();
    console.log('Total offers in database:', offerCount);

    // Test if we can find active offers
    const activeOffers = await OfferModel.find({ isActive: true });
    console.log('Active offers found:', activeOffers.length);

    return NextResponse.json({
      success: true,
      message: 'Database connection and queries working',
      totalOffers: offerCount,
      activeOffers: activeOffers.length,
      sampleOffer: activeOffers[0] || null
    });
  } catch (error) {
    console.error('Test endpoint error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
} 