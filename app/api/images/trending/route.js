// app/api/images/trending/route.js
import { NextResponse } from 'next/server';
import ImageModel from '@/app/models/Image';
import connectToDatabase from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  await connectToDatabase()

  try {
    const trendingImages = await ImageModel.find({ isTrending: true }).sort({ createdAt: -1 }).limit(8);
    return NextResponse.json(trendingImages);
  } catch (error) {
    console.error('Error fetching trending images:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
