import { verifyJWT } from '@/lib/jwt';

export async function GET(request) {
  try {
    console.log('Admin verify endpoint called');
    
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    console.log('Auth header:', authHeader ? 'Present' : 'Missing');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ No valid authorization header');
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    console.log('Token extracted, length:', token.length);
    
    // Verify the JWT token's validity and role
    try {
      const verified = await verifyJWT(token);
      console.log('Token verified:', verified);
      
      if (verified && verified.role === 'admin') {
        console.log('✅ Admin token verified successfully');
        return Response.json({ valid: true, admin: verified }, { status: 200 });
      } else {
        console.log('❌ Invalid role or payload:', verified);
        return Response.json({ error: 'Invalid token' }, { status: 401 });
      }
    } catch (jwtError) {
      console.log('❌ JWT verification failed:', jwtError.message);
      return Response.json({ error: 'Invalid token' }, { status: 401 });
    }
    
  } catch (error) {
    console.error('🔥 Admin verification error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
