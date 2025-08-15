import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request, { params }) {
  try {
    const { path: filePath } = await params;
    const fullPath = path.join(process.cwd(), 'storage', ...filePath);
    
    console.log('File serving request for:', fullPath);

    // Check if file exists
    if (!fs.existsSync(fullPath)) {
      console.log('File not found:', fullPath);
      return new NextResponse('File not found', { status: 404 });
    }

    // Get file stats
    const stats = fs.statSync(fullPath);
    if (!stats.isFile()) {
      return new NextResponse('Not a file', { status: 404 });
    }

    // Read file
    const fileBuffer = fs.readFileSync(fullPath);
    
    // Get file extension to determine content type
    const ext = path.extname(fullPath).toLowerCase();
    const contentTypeMap = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
      '.webp': 'image/webp',
      '.avif': 'image/avif',
      '.bmp': 'image/bmp',
      '.tiff': 'image/tiff',
      '.tif': 'image/tiff',
      '.pdf': 'application/pdf',
      '.zip': 'application/zip',
      '.ai': 'application/postscript',
      '.eps': 'application/postscript',
      '.psd': 'application/octet-stream',
      '.cdr': 'application/octet-stream',
    };

    const contentType = contentTypeMap[ext] || 'application/octet-stream';

    // Set appropriate headers
    const responseHeaders = {
      'Content-Type': contentType,
      'Content-Length': stats.size.toString(),
      'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
    };

    // For downloadable files, add content-disposition header
    if (['.zip', '.ai', '.eps', '.psd', '.cdr', '.pdf'].includes(ext)) {
      const filename = path.basename(fullPath);
      responseHeaders['Content-Disposition'] = `attachment; filename="${filename}"`;
    }

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: responseHeaders,
    });

  } catch (error) {
    console.error('File serving error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
