import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Try to serve favicon from public directory first
    const publicFaviconPath = path.join(process.cwd(), 'public', 'favicon.ico');
    const appFaviconPath = path.join(process.cwd(), 'app', 'favicon.ico');
    
    let faviconPath = null;
    
    if (fs.existsSync(publicFaviconPath)) {
      faviconPath = publicFaviconPath;
    } else if (fs.existsSync(appFaviconPath)) {
      faviconPath = appFaviconPath;
    }
    
    if (faviconPath) {
      const faviconBuffer = fs.readFileSync(faviconPath);
      
      return new NextResponse(faviconBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'image/x-icon',
          'Cache-Control': 'public, max-age=31536000',
        },
      });
    } else {
      // Return a simple 1x1 transparent gif as fallback
      const transparentGif = Buffer.from(
        'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
        'base64'
      );
      
      return new NextResponse(transparentGif, {
        status: 200,
        headers: {
          'Content-Type': 'image/gif',
          'Cache-Control': 'public, max-age=31536000',
        },
      });
    }
  } catch (error) {
    console.error('Favicon serving error:', error);
    return new NextResponse('Favicon not found', { status: 404 });
  }
}
