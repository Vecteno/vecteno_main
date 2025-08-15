import { verifyJWT } from '@/lib/jwt';

export async function POST(request) {
  try {
    const { token } = await request.json();
    
    console.log('🔍 Admin Auth Status Check');
    console.log('Token provided:', token ? 'Yes' : 'No');
    
    if (!token) {
      return Response.json({ 
        authenticated: false,
        message: 'No token provided'
      });
    }

    try {
      const verified = await verifyJWT(token);
      console.log('Token verified:', verified);
      
      if (verified && verified.role === 'admin') {
        return Response.json({
          authenticated: true,
          admin: verified,
          message: 'Admin authenticated successfully'
        });
      } else {
        return Response.json({
          authenticated: false,
          message: 'Invalid admin token'
        });
      }
      
    } catch (jwtError) {
      console.log('JWT verification failed:', jwtError.message);
      return Response.json({
        authenticated: false,
        message: 'Token verification failed',
        error: jwtError.message
      });
    }
    
  } catch (error) {
    console.error('Auth status check error:', error);
    return Response.json({ 
      authenticated: false,
      message: 'Server error',
      error: error.message
    }, { status: 500 });
  }
}
