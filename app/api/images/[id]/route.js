// app/api/images/[id]/route.js
import ImageModel from '@/app/models/Image';
import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';

export async function DELETE(req, { params }) {
  await connectToDatabase;
  const { id } = params;

  try {
    const deletedImage = await ImageModel.findByIdAndDelete(id);
    if (!deletedImage) {
      return NextResponse.json({ message: 'Image not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Image deleted successfully' });
  } catch (error) {
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
