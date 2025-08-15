import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-for-development-only-12345678901234567890';
const secret = new TextEncoder().encode(JWT_SECRET);

// Generate JWT
export async function generateJWT(payload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(secret);
}

// Verify JWT
export async function verifyJWT(token) {
  try {
    const { payload } = await jwtVerify(token, secret);
    console.log('JWT payload:', payload);
    return payload;
  } catch (error) {
    console.error('JWT verification failed:', error.message);
    throw new Error('Invalid token');
  }
}
