import { cookies } from 'next/headers';
import { verifyJWT } from '@/lib/jwt';
import connectToDatabase from '@/lib/db';
import userModel from '@/app/models/userModel';
import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function POST(request) {
  try {
    await connectToDatabase();

    let userId = null;

    // 1. Try JWT token
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (token) {
      try {
        const payload = await verifyJWT(token);
        userId = payload.id;
      } catch (err) {
        userId = null;
      }
    }

    // 2. Try Google login session
    if (!userId) {
      const session = await getToken({ req: request });
      if (session?.id) {
        userId = session.id;
      }
    }

    // 3. No auth = reject
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, profileImage, mobile } = await request.json();

    await userModel.findByIdAndUpdate(userId, {
      name,
      profileImage,
      mobile,
    });

    return NextResponse.json({ message: 'Profile updated' }, { status: 200 });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}
