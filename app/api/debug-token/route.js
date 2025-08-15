import { verifyJWT } from '@/lib/jwt';

export async function POST(request) {
  try {
    const { token } = await request.json();
    
    console.log('🔍 Debug Token Request');
    console.log('Token received:', token ? `${token.substring(0, 20)}...` : 'No token');
    
    if (!token) {
      return Response.json({ 
        error: 'No token provided',
        status: 400 
      });
    }

    try {
      const verified = await verifyJWT(token);
      console.log('✅ Token verification successful');
      console.log('Payload:', verified);
      
      return Response.json({
        valid: true,
        payload: verified,
        message: 'Token is valid'
      });
      
    } catch (jwtError) {
      console.log('❌ Token verification failed:', jwtError.message);
      return Response.json({
        valid: false,
        error: jwtError.message,
        message: 'Token is invalid'
      }, { status: 401 });
    }
    
  } catch (error) {
    console.error('🔥 Debug error:', error);
    return Response.json({ 
      error: error.message,
      status: 500 
    }, { status: 500 });
  }
}
