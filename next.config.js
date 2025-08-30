/** @type {import('next').NextConfig} */
const nextConfig = {
  // Development mode optimizations
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Improve HMR WebSocket stability
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
        ignored: /node_modules/,
      };
    }
    return config;
  },
  
  images: {
    formats: ['image/webp', 'image/avif'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'dappersquad.com',
      },
    ],
  },
  async headers() {
    const isProduction = process.env.NODE_ENV === 'production';
    
    // Base headers for all environments
    const baseHeaders = [
      {
        key: 'X-Content-Type-Options',
        value: 'nosniff',
      },
      {
        key: 'X-Frame-Options',
        value: 'DENY',
      },
      {
        key: 'X-XSS-Protection',
        value: '1; mode=block',
      },
      {
        key: 'Referrer-Policy',
        value: 'strict-origin-when-cross-origin',
      },
    ];

    // Production-only security headers
    const productionHeaders = [
      {
        key: 'Strict-Transport-Security',
        value: 'max-age=31536000; includeSubDomains; preload',
      },
      {
        key: 'Permissions-Policy',
        value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
      },
      {
        key: 'Cross-Origin-Opener-Policy',
        value: 'same-origin',
      },
      {
        key: 'Cross-Origin-Resource-Policy',
        value: 'same-origin',
      },
      {
        key: 'X-DNS-Prefetch-Control',
        value: 'off',
      },
    ];

    // Environment-specific CSP
    const cspDirectives = [
      "default-src 'self'",
      isProduction 
        ? "script-src 'self' https://js.stripe.com" // Production: strict CSP
        : "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com", // Development: allow Next.js HMR
      "style-src 'self' 'unsafe-inline'", // Required for Tailwind CSS
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      isProduction
        ? "connect-src 'self' https://api.stripe.com https://api.resend.com" // Production
        : "connect-src 'self' ws://localhost:* wss://localhost:* https://api.stripe.com https://api.resend.com", // Development: allow HMR WebSockets
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "object-src 'none'",
    ];

    // Add upgrade-insecure-requests only in production (conflicts with localhost HTTP)
    if (isProduction) {
      cspDirectives.push("upgrade-insecure-requests");
    }

    const cspHeader = {
      key: 'Content-Security-Policy',
      value: cspDirectives.join('; '),
    };

    return [
      {
        source: '/(.*)',
        headers: [
          ...baseHeaders,
          ...(isProduction ? productionHeaders : []), // Only add production headers in production
          cspHeader,
        ],
      },
    ];
  },
};

module.exports = nextConfig;