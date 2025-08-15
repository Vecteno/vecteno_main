import { cookies } from 'next/headers';
import { verifyJWT } from '@/lib/jwt';
import connectToDatabase from '@/lib/db';
import userModel from '@/app/models/userModel';
import bcrypt from 'bcrypt';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    await connectToDatabase();
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await verifyJWT(token);
    const { newPassword } = await request.json();

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await userModel.findByIdAndUpdate(payload.id, {
      password: hashedPassword,
    });

    return NextResponse.json({ message: 'Password changed' }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}
