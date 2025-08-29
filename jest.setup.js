import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

// Polyfill for Node.js environment
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock Web APIs for Next.js API route testing (must be defined before any imports)
global.Request = class MockRequest {
  constructor(input, init = {}) {
    this.url = typeof input === 'string' ? input : input.url;
    this.method = init.method || 'GET';
    this.headers = new Map(Object.entries(init.headers || {}));
    this.body = init.body;
    this._json = init.body ? JSON.parse(init.body) : {};
  }
  async json() { return this._json; }
  async text() { return this.body || ''; }
  async formData() { return new FormData(); }
  async arrayBuffer() { return new ArrayBuffer(0); }
  async blob() { return new Blob(); }
  clone() { return new MockRequest(this.url, { method: this.method, headers: Object.fromEntries(this.headers), body: this.body }); }
};

global.Response = class MockResponse {
  constructor(body, init = {}) {
    this.ok = init.status ? init.status >= 200 && init.status < 300 : true;
    this.status = init.status || 200;
    this.statusText = init.statusText || 'OK';
    this.headers = new Map(Object.entries(init.headers || {}));
    this._body = body;
  }
  async json() { return typeof this._body === 'string' ? JSON.parse(this._body) : this._body; }
  async text() { return typeof this._body === 'object' ? JSON.stringify(this._body) : this._body; }
  async arrayBuffer() { return new ArrayBuffer(0); }
  async blob() { return new Blob(); }
  clone() { return new MockResponse(this._body, { status: this.status, statusText: this.statusText, headers: Object.fromEntries(this.headers) }); }
};

global.Headers = class MockHeaders {
  constructor(init = {}) {
    this._map = new Map();
    if (init) {
      if (Array.isArray(init)) {
        init.forEach(([key, value]) => this._map.set(key, value));
      } else if (typeof init === 'object') {
        Object.entries(init).forEach(([key, value]) => this._map.set(key, value));
      }
    }
  }
  get(key) { return this._map.get(key); }
  set(key, value) { this._map.set(key, value); }
  has(key) { return this._map.has(key); }
  delete(key) { return this._map.delete(key); }
  forEach(callback) { this._map.forEach(callback); }
  entries() { return this._map.entries(); }
  keys() { return this._map.keys(); }
  values() { return this._map.values(); }
  [Symbol.iterator]() { return this._map[Symbol.iterator](); }
};

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    };
  },
  useSearchParams() {
    return new URLSearchParams();
  },
  usePathname() {
    return '/';
  },
}));

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.NEXT_PUBLIC_BASE_URL = 'http://localhost:3000';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
process.env.RESEND_API_KEY = 'test-api-key';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.NEXTAUTH_SECRET = 'test-nextauth-secret';

// Global test utilities
global.console = {
  ...console,
  // Suppress console.log in tests
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};