// @ts-check

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable static exports only for production builds when STATIC_EXPORT is true
  ...(process.env.STATIC_EXPORT === 'true' ? { output: 'export' } : {}),
  trailingSlash: true,
  
  // Configure image optimization for static export
  images: {
    unoptimized: true,
    domains: ['lh3.googleusercontent.com', 'localhost'],
  },
  
  // Custom rewrites for serving uploaded files
  async rewrites() {
    return [
      {
        source: '/favicon.ico',
        destination: '/api/favicon',
      },
    ];
  },
  
  // Serve uploads directory as static files
  async headers() {
    return [
      {
        source: '/uploads/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  
  
  // Environment variables that should be available on the client side
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000',
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  },
  
  // Enable React Strict Mode
  reactStrictMode: true,
  
  // Disable TypeScript checking during build for now
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Disable ESLint during build for now
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Add custom webpack config
  webpack: (config, { isServer }) => {
    // Fixes npm packages that depend on `node:` protocol
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        dns: false,
        child_process: false,
        dgram: false,
        zlib: false,
        http: false,
        https: false,
        stream: false,
        crypto: false,
      };
    }
    
    // Handle PDFKit assets
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        canvas: 'canvas',
      });
      
      // Copy PDFKit assets
      config.resolve.alias = {
        ...config.resolve.alias,
        'pdfkit/js/data': 'pdfkit/js/data',
      };
    }
    
    return config;
  },
};

module.exports = nextConfig;
