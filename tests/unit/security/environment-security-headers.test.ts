/**
 * @fileoverview Environment-Specific Security Headers Tests
 * 
 * Tests to ensure security headers are properly configured for both
 * development and production environments, with appropriate CSP policies
 * that don't break Next.js development features.
 */

// Mock Next.js config
const createNextConfig = (nodeEnv: string) => {
  process.env.NODE_ENV = nodeEnv;
  
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

  return {
    source: '/(.*)',
    headers: [
      ...baseHeaders,
      ...(isProduction ? productionHeaders : []), // Only add production headers in production
      cspHeader,
    ],
  };
};

describe('Environment-Specific Security Headers', () => {
  const originalNodeEnv = process.env.NODE_ENV;
  
  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
  });

  describe('Development Environment', () => {
    let devConfig: any;
    
    beforeEach(() => {
      devConfig = createNextConfig('development');
    });

    it('should include base security headers in development', () => {
      const headerKeys = devConfig.headers.map((h: any) => h.key);
      
      expect(headerKeys).toContain('X-Content-Type-Options');
      expect(headerKeys).toContain('X-Frame-Options');
      expect(headerKeys).toContain('X-XSS-Protection');
      expect(headerKeys).toContain('Referrer-Policy');
      expect(headerKeys).toContain('Content-Security-Policy');
    });

    it('should NOT include production-only headers in development', () => {
      const headerKeys = devConfig.headers.map((h: any) => h.key);
      
      expect(headerKeys).not.toContain('Strict-Transport-Security');
      expect(headerKeys).not.toContain('Permissions-Policy');
      expect(headerKeys).not.toContain('Cross-Origin-Opener-Policy');
      expect(headerKeys).not.toContain('Cross-Origin-Resource-Policy');
      expect(headerKeys).not.toContain('X-DNS-Prefetch-Control');
    });

    it('should allow unsafe-eval and unsafe-inline for Next.js HMR', () => {
      const cspHeader = devConfig.headers.find((h: any) => h.key === 'Content-Security-Policy');
      const cspValue = cspHeader?.value || '';
      
      expect(cspValue).toContain("'unsafe-eval'");
      expect(cspValue).toContain("'unsafe-inline'");
    });

    it('should allow WebSocket connections for HMR', () => {
      const cspHeader = devConfig.headers.find((h: any) => h.key === 'Content-Security-Policy');
      const cspValue = cspHeader?.value || '';
      
      expect(cspValue).toContain('ws://localhost:*');
      expect(cspValue).toContain('wss://localhost:*');
    });

    it('should NOT include upgrade-insecure-requests in development', () => {
      const cspHeader = devConfig.headers.find((h: any) => h.key === 'Content-Security-Policy');
      const cspValue = cspHeader?.value || '';
      
      expect(cspValue).not.toContain('upgrade-insecure-requests');
    });

    it('should still maintain essential security directives', () => {
      const cspHeader = devConfig.headers.find((h: any) => h.key === 'Content-Security-Policy');
      const cspValue = cspHeader?.value || '';
      
      expect(cspValue).toContain("default-src 'self'");
      expect(cspValue).toContain("frame-ancestors 'none'");
      expect(cspValue).toContain("base-uri 'self'");
      expect(cspValue).toContain("object-src 'none'");
    });
  });

  describe('Production Environment', () => {
    let prodConfig: any;
    
    beforeEach(() => {
      prodConfig = createNextConfig('production');
    });

    it('should include ALL security headers in production', () => {
      const headerKeys = prodConfig.headers.map((h: any) => h.key);
      
      // Base headers
      expect(headerKeys).toContain('X-Content-Type-Options');
      expect(headerKeys).toContain('X-Frame-Options');
      expect(headerKeys).toContain('X-XSS-Protection');
      expect(headerKeys).toContain('Referrer-Policy');
      expect(headerKeys).toContain('Content-Security-Policy');
      
      // Production-only headers
      expect(headerKeys).toContain('Strict-Transport-Security');
      expect(headerKeys).toContain('Permissions-Policy');
      expect(headerKeys).toContain('Cross-Origin-Opener-Policy');
      expect(headerKeys).toContain('Cross-Origin-Resource-Policy');
      expect(headerKeys).toContain('X-DNS-Prefetch-Control');
    });

    it('should NOT allow unsafe-eval in production CSP', () => {
      const cspHeader = prodConfig.headers.find((h: any) => h.key === 'Content-Security-Policy');
      const cspValue = cspHeader?.value || '';
      
      expect(cspValue).not.toContain("'unsafe-eval'");
    });

    it('should NOT allow unsafe-inline for scripts in production', () => {
      const cspHeader = prodConfig.headers.find((h: any) => h.key === 'Content-Security-Policy');
      const cspValue = cspHeader?.value || '';
      
      // Check that script-src doesn't contain unsafe-inline
      const scriptSrcMatch = cspValue.match(/script-src[^;]+/);
      expect(scriptSrcMatch?.[0]).not.toContain("'unsafe-inline'");
    });

    it('should include upgrade-insecure-requests in production', () => {
      const cspHeader = prodConfig.headers.find((h: any) => h.key === 'Content-Security-Policy');
      const cspValue = cspHeader?.value || '';
      
      expect(cspValue).toContain('upgrade-insecure-requests');
    });

    it('should have strict connect-src in production', () => {
      const cspHeader = prodConfig.headers.find((h: any) => h.key === 'Content-Security-Policy');
      const cspValue = cspHeader?.value || '';
      
      expect(cspValue).toContain("connect-src 'self' https://api.stripe.com https://api.resend.com");
      expect(cspValue).not.toContain('ws://localhost:*');
      expect(cspValue).not.toContain('wss://localhost:*');
    });

    it('should have HSTS with proper configuration', () => {
      const hstsHeader = prodConfig.headers.find((h: any) => h.key === 'Strict-Transport-Security');
      
      expect(hstsHeader?.value).toBe('max-age=31536000; includeSubDomains; preload');
    });
  });

  describe('Environment-Specific CSP Policies', () => {
    it('should allow Next.js development features in dev mode', () => {
      const devConfig = createNextConfig('development');
      const cspHeader = devConfig.headers.find((h: any) => h.key === 'Content-Security-Policy');
      const cspValue = cspHeader?.value || '';
      
      // Features needed for Next.js development
      expect(cspValue).toContain("'unsafe-eval'"); // For webpack eval
      expect(cspValue).toContain("'unsafe-inline'"); // For development scripts
      expect(cspValue).toContain('ws://localhost:*'); // For hot reloading
    });

    it('should block dangerous features in production', () => {
      const prodConfig = createNextConfig('production');
      const cspHeader = prodConfig.headers.find((h: any) => h.key === 'Content-Security-Policy');
      const cspValue = cspHeader?.value || '';
      
      // Should not contain development-only unsafe directives
      expect(cspValue).not.toContain("'unsafe-eval'");
      expect(cspValue).not.toContain('ws://localhost:*');
    });

    it('should maintain consistent security across environments', () => {
      const devConfig = createNextConfig('development');
      const prodConfig = createNextConfig('production');
      
      const devCsp = devConfig.headers.find((h: any) => h.key === 'Content-Security-Policy')?.value || '';
      const prodCsp = prodConfig.headers.find((h: any) => h.key === 'Content-Security-Policy')?.value || '';
      
      // Common security directives should be present in both
      const commonDirectives = [
        "default-src 'self'",
        "frame-ancestors 'none'",
        "base-uri 'self'",
        "object-src 'none'",
        "img-src 'self' data: https:",
        "font-src 'self' data:",
        "style-src 'self' 'unsafe-inline'"
      ];
      
      commonDirectives.forEach(directive => {
        expect(devCsp).toContain(directive);
        expect(prodCsp).toContain(directive);
      });
    });
  });

  describe('Header Count Validation', () => {
    it('should have fewer headers in development', () => {
      const devConfig = createNextConfig('development');
      const prodConfig = createNextConfig('production');
      
      expect(devConfig.headers.length).toBeLessThan(prodConfig.headers.length);
    });

    it('should have specific header counts', () => {
      const devConfig = createNextConfig('development');
      const prodConfig = createNextConfig('production');
      
      // Development: base headers (4) + CSP (1) = 5
      expect(devConfig.headers.length).toBe(5);
      
      // Production: base headers (4) + production headers (5) + CSP (1) = 10
      expect(prodConfig.headers.length).toBe(10);
    });
  });
});