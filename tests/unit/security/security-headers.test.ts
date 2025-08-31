/**
 * @fileoverview Security Headers Validation Tests
 * 
 * Tests to ensure security headers are properly configured for production:
 * - Content Security Policy (CSP) without unsafe directives
 * - Strict Transport Security (HSTS)
 * - Cross-origin isolation headers
 * - Modern security headers
 * - Environment-specific configurations
 */

import { NextRequest } from 'next/server';

// Import actual Next.js config for testing
const nextConfig = require('../../../next.config.js');

// Mock Next.js config for testing (legacy - keeping for reference)
const mockNextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
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
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' https://js.stripe.com",
              "style-src 'self' 'unsafe-inline'", // Needed for Tailwind CSS
              "img-src 'self' data: https:",
              "font-src 'self' data:",
              "connect-src 'self' https://api.stripe.com https://api.resend.com",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "object-src 'none'",
              "upgrade-insecure-requests"
            ].join('; '),
          },
        ],
      },
    ];
  }
};

describe('Security Headers Configuration', () => {
  let headers: Array<{source: string; headers: Array<{key: string; value: string}>}>;

  beforeAll(async () => {
    headers = await mockNextConfig.headers();
  });

  describe('Content Security Policy (CSP)', () => {
    let cspValue: string;

    beforeAll(() => {
      const cspHeader = headers[0].headers.find(h => h.key === 'Content-Security-Policy');
      cspValue = cspHeader?.value || '';
    });

    it('should have a Content-Security-Policy header', () => {
      expect(cspValue).toBeTruthy();
      expect(cspValue.length).toBeGreaterThan(0);
    });

    it('should not contain unsafe-eval in script-src', () => {
      expect(cspValue).not.toContain("'unsafe-eval'");
    });

    it('should have secure default-src policy', () => {
      expect(cspValue).toContain("default-src 'self'");
    });

    it('should allow necessary external scripts', () => {
      expect(cspValue).toContain('https://js.stripe.com');
    });

    it('should allow necessary API connections', () => {
      expect(cspValue).toContain('https://api.stripe.com');
      expect(cspValue).toContain('https://api.resend.com');
    });

    it('should prevent frame embedding', () => {
      expect(cspValue).toContain("frame-ancestors 'none'");
    });

    it('should have secure base-uri', () => {
      expect(cspValue).toContain("base-uri 'self'");
    });

    it('should block object embedding', () => {
      expect(cspValue).toContain("object-src 'none'");
    });

    it('should upgrade insecure requests', () => {
      expect(cspValue).toContain('upgrade-insecure-requests');
    });

    it('should allow Tailwind CSS inline styles', () => {
      // This is a necessary compromise for Tailwind CSS
      expect(cspValue).toContain("style-src 'self' 'unsafe-inline'");
    });
  });

  describe('Strict Transport Security (HSTS)', () => {
    let hstsValue: string;

    beforeAll(() => {
      const hstsHeader = headers[0].headers.find(h => h.key === 'Strict-Transport-Security');
      hstsValue = hstsHeader?.value || '';
    });

    it('should have HSTS header', () => {
      expect(hstsValue).toBeTruthy();
    });

    it('should have long max-age', () => {
      expect(hstsValue).toContain('max-age=31536000'); // 1 year
    });

    it('should include subdomains', () => {
      expect(hstsValue).toContain('includeSubDomains');
    });

    it('should be preloadable', () => {
      expect(hstsValue).toContain('preload');
    });
  });

  describe('Cross-Origin Security Headers', () => {
    it('should have Cross-Origin-Opener-Policy header', () => {
      const coopHeader = headers[0].headers.find(h => h.key === 'Cross-Origin-Opener-Policy');
      expect(coopHeader?.value).toBe('same-origin');
    });

    it('should have Cross-Origin-Resource-Policy header', () => {
      const corpHeader = headers[0].headers.find(h => h.key === 'Cross-Origin-Resource-Policy');
      expect(corpHeader?.value).toBe('same-origin');
    });

    it('should have X-DNS-Prefetch-Control header', () => {
      const dnsPrefetchHeader = headers[0].headers.find(h => h.key === 'X-DNS-Prefetch-Control');
      expect(dnsPrefetchHeader?.value).toBe('off');
    });
  });

  describe('Permissions Policy', () => {
    let permissionsPolicyValue: string;

    beforeAll(() => {
      const ppHeader = headers[0].headers.find(h => h.key === 'Permissions-Policy');
      permissionsPolicyValue = ppHeader?.value || '';
    });

    it('should have Permissions-Policy header', () => {
      expect(permissionsPolicyValue).toBeTruthy();
    });

    it('should disable camera access', () => {
      expect(permissionsPolicyValue).toContain('camera=()');
    });

    it('should disable microphone access', () => {
      expect(permissionsPolicyValue).toContain('microphone=()');
    });

    it('should disable geolocation', () => {
      expect(permissionsPolicyValue).toContain('geolocation=()');
    });

    it('should disable interest-cohort (FLoC)', () => {
      expect(permissionsPolicyValue).toContain('interest-cohort=()');
    });
  });

  describe('Legacy Security Headers', () => {
    it('should have X-Content-Type-Options header', () => {
      const ctHeader = headers[0].headers.find(h => h.key === 'X-Content-Type-Options');
      expect(ctHeader?.value).toBe('nosniff');
    });

    it('should have X-Frame-Options header', () => {
      const frameHeader = headers[0].headers.find(h => h.key === 'X-Frame-Options');
      expect(frameHeader?.value).toBe('DENY');
    });

    it('should have X-XSS-Protection header', () => {
      const xssHeader = headers[0].headers.find(h => h.key === 'X-XSS-Protection');
      expect(xssHeader?.value).toBe('1; mode=block');
    });

    it('should have Referrer-Policy header', () => {
      const referrerHeader = headers[0].headers.find(h => h.key === 'Referrer-Policy');
      expect(referrerHeader?.value).toBe('strict-origin-when-cross-origin');
    });
  });

  describe('Header Configuration Structure', () => {
    it('should apply headers to all routes', () => {
      expect(headers[0].source).toBe('/(.*)');;
    });

    it('should have all required headers', () => {
      const headerKeys = headers[0].headers.map(h => h.key);
      const requiredHeaders = [
        'X-Content-Type-Options',
        'X-Frame-Options',
        'X-XSS-Protection',
        'Referrer-Policy',
        'Strict-Transport-Security',
        'Permissions-Policy',
        'Cross-Origin-Opener-Policy',
        'Cross-Origin-Resource-Policy',
        'X-DNS-Prefetch-Control',
        'Content-Security-Policy'
      ];

      requiredHeaders.forEach(header => {
        expect(headerKeys).toContain(header);
      });
    });

    it('should have no duplicate headers', () => {
      const headerKeys = headers[0].headers.map(h => h.key);
      const uniqueKeys = new Set(headerKeys);
      expect(headerKeys.length).toBe(uniqueKeys.size);
    });
  });
});

describe('Real Next.js Configuration Validation', () => {
  // Test the actual Next.js config by importing it
  let realNextConfig: any;
  const originalNodeEnv = process.env.NODE_ENV;
  
  beforeAll(() => {
    // Set production environment for testing
    process.env.NODE_ENV = 'production';
    // Clear module cache to get fresh config
    const configPath = require.resolve('../../../next.config.js');
    delete require.cache[configPath];
    realNextConfig = require('../../../next.config.js');
  });

  afterAll(() => {
    // Restore original NODE_ENV
    process.env.NODE_ENV = originalNodeEnv;
  });

  describe('Production CSP Validation', () => {
    it('should not contain unsafe-eval in production CSP', async () => {
      const headers = await realNextConfig.headers();
      const cspHeader = headers[0]?.headers?.find((h: any) => h.key === 'Content-Security-Policy');
      const cspValue = cspHeader?.value || '';
      
      expect(cspValue).not.toContain("'unsafe-eval'");
    });

    it('should allow necessary external resources', async () => {
      const headers = await realNextConfig.headers();
      const cspHeader = headers[0]?.headers?.find((h: any) => h.key === 'Content-Security-Policy');
      const cspValue = cspHeader?.value || '';
      
      expect(cspValue).toContain('https://js.stripe.com');
      expect(cspValue).toContain('https://api.stripe.com');
      expect(cspValue).toContain('https://api.resend.com');
      expect(cspValue).toContain('data:');
    });
  });

  describe('HSTS Implementation', () => {
    it('should have strong HSTS policy', async () => {
      const headers = await realNextConfig.headers();
      const hstsHeader = headers[0]?.headers?.find((h: any) => h.key === 'Strict-Transport-Security');
      
      expect(hstsHeader?.value).toBeTruthy();
      expect(hstsHeader?.value).toContain('max-age=31536000');
      expect(hstsHeader?.value).toContain('includeSubDomains');
      expect(hstsHeader?.value).toContain('preload');
    });
  });

  describe('Modern Security Headers', () => {
    it('should have all modern security headers', async () => {
      const headers = await realNextConfig.headers();
      const headerKeys = headers[0]?.headers?.map((h: any) => h.key) || [];
      
      const modernHeaders = [
        'Strict-Transport-Security',
        'Permissions-Policy',
        'Cross-Origin-Opener-Policy', 
        'Cross-Origin-Resource-Policy',
        'X-DNS-Prefetch-Control'
      ];
      
      modernHeaders.forEach(header => {
        expect(headerKeys).toContain(header);
      });
    });

    it('should have secure permissions policy', async () => {
      const headers = await realNextConfig.headers();
      const ppHeader = headers[0]?.headers?.find((h: any) => h.key === 'Permissions-Policy');
      const ppValue = ppHeader?.value || '';
      
      expect(ppValue).toContain('camera=()');
      expect(ppValue).toContain('microphone=()');
      expect(ppValue).toContain('geolocation=()');
      expect(ppValue).toContain('interest-cohort=()');
    });
  });

  describe('Cross-Origin Security', () => {
    it('should prevent cross-origin attacks', async () => {
      const headers = await realNextConfig.headers();
      const coopHeader = headers[0]?.headers?.find((h: any) => h.key === 'Cross-Origin-Opener-Policy');
      const corpHeader = headers[0]?.headers?.find((h: any) => h.key === 'Cross-Origin-Resource-Policy');
      
      expect(coopHeader?.value).toBe('same-origin');
      expect(corpHeader?.value).toBe('same-origin');
    });
  });

  describe('Legacy Header Compatibility', () => {
    it('should maintain all legacy security headers', async () => {
      const headers = await realNextConfig.headers();
      const headerMap = new Map(headers[0]?.headers?.map((h: any) => [h.key, h.value]) || []);
      
      expect(headerMap.get('X-Content-Type-Options')).toBe('nosniff');
      expect(headerMap.get('X-Frame-Options')).toBe('DENY');
      expect(headerMap.get('X-XSS-Protection')).toBe('1; mode=block');
      expect(headerMap.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin');
    });
  });
});