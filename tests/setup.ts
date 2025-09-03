/**
 * @fileoverview Global Test Setup
 * 
 * Configures global testing environment, mocks, and utilities
 * Runs before all tests in the test suite
 */

import '@testing-library/jest-dom';
import { mockEnvVars, resetAllMocks } from './mocks/api';
import { 
  mockLocalStorage, 
  mockMatchMedia, 
  mockIntersectionObserver,
  mockResizeObserver,
  disableAnimations,
} from './utils/test-utils';

// Mock environment variables
Object.assign(process.env, mockEnvVars);

// Mock browser APIs
mockLocalStorage();
mockMatchMedia();
mockIntersectionObserver();
mockResizeObserver();

// Ensure matchMedia exists globally for all components
const mockMatchMediaGlobal = jest.fn((query) => ({
  matches: false, // Default to desktop/no reduced motion
  media: query,
  onchange: null,
  addListener: jest.fn(),
  removeListener: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn(),
}));

// Apply to both window and global for comprehensive coverage
if (typeof window !== 'undefined') {
  window.matchMedia = mockMatchMediaGlobal;
}
if (typeof global !== 'undefined') {
  (global as any).matchMedia = mockMatchMediaGlobal;
}

// Disable animations for consistent testing
disableAnimations();

// Mock window.scrollTo
Object.defineProperty(window, 'scrollTo', {
  value: jest.fn(),
  writable: true,
});

// Mock console methods to reduce noise in tests
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

console.error = (...args: any[]) => {
  // Suppress specific React warnings that are expected in tests
  const message = args[0];
  if (
    typeof message === 'string' &&
    (message.includes('Warning: ReactDOM.render is deprecated') ||
     message.includes('Warning: validateDOMNesting') ||
     message.includes('Warning: Function components cannot be given refs'))
  ) {
    return;
  }
  originalConsoleError.apply(console, args);
};

console.warn = (...args: any[]) => {
  const message = args[0];
  if (
    typeof message === 'string' &&
    message.includes('componentWillReceiveProps has been renamed')
  ) {
    return;
  }
  originalConsoleWarn.apply(console, args);
};

// Global test timeout
jest.setTimeout(10000);

// Mock fetch API
global.fetch = jest.fn();

// Mock Web APIs for Next.js API route testing
global.Request = jest.fn((input: RequestInfo, init?: RequestInit) => ({
  url: typeof input === 'string' ? input : input.url,
  method: init?.method || 'GET',
  headers: new Map(Object.entries(init?.headers || {})),
  body: init?.body,
  json: jest.fn(() => Promise.resolve(init?.body ? JSON.parse(init.body as string) : {})),
  text: jest.fn(() => Promise.resolve(init?.body as string || '')),
  formData: jest.fn(() => Promise.resolve(new FormData())),
  arrayBuffer: jest.fn(() => Promise.resolve(new ArrayBuffer(0))),
  blob: jest.fn(() => Promise.resolve(new Blob())),
  clone: jest.fn(() => ({ ...global.Request })),
  cookies: {
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
  },
})) as any;

global.Response = jest.fn((body?: any, init?: ResponseInit) => ({
  ok: init?.status ? init.status >= 200 && init.status < 300 : true,
  status: init?.status || 200,
  statusText: init?.statusText || 'OK',
  headers: new Map(Object.entries(init?.headers || {})),
  json: jest.fn(() => Promise.resolve(typeof body === 'string' ? JSON.parse(body) : body)),
  text: jest.fn(() => Promise.resolve(typeof body === 'object' ? JSON.stringify(body) : body)),
  arrayBuffer: jest.fn(() => Promise.resolve(new ArrayBuffer(0))),
  blob: jest.fn(() => Promise.resolve(new Blob())),
  clone: jest.fn(() => ({ ...global.Response })),
})) as any;

global.Headers = jest.fn((init?: HeadersInit) => {
  const map = new Map();
  if (init) {
    if (Array.isArray(init)) {
      init.forEach(([key, value]) => map.set(key, value));
    } else if (typeof init === 'object') {
      Object.entries(init).forEach(([key, value]) => map.set(key, value));
    }
  }
  return {
    get: (key: string) => map.get(key),
    set: (key: string, value: string) => map.set(key, value),
    has: (key: string) => map.has(key),
    delete: (key: string) => map.delete(key),
    forEach: (callback: (value: string, key: string) => void) => map.forEach(callback),
    entries: () => map.entries(),
    keys: () => map.keys(),
    values: () => map.values(),
    [Symbol.iterator]: () => map[Symbol.iterator](),
  };
}) as any;

// Mock URL.createObjectURL for file testing
Object.defineProperty(URL, 'createObjectURL', {
  value: jest.fn(() => 'blob:mock-url'),
  writable: true,
});

Object.defineProperty(URL, 'revokeObjectURL', {
  value: jest.fn(),
  writable: true,
});

// Mock performance API for performance testing
Object.defineProperty(window, 'performance', {
  value: {
    now: jest.fn(() => Date.now()),
    mark: jest.fn(),
    measure: jest.fn(),
    navigation: {
      type: 'navigate',
    },
  },
  writable: true,
});

// Mock crypto API for generating test IDs
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: jest.fn(() => 'test-uuid-123'),
    getRandomValues: jest.fn((arr) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256);
      }
      return arr;
    }),
  },
  writable: true,
});

// Mock next/router
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
    pathname: '/',
    query: {},
    asPath: '/',
    route: '/',
    events: {
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn(),
    },
  }),
}));

// Mock next/navigation for App Router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt || ''} />;
  },
}));

// Mock next/link
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// Mock next/head
jest.mock('next/head', () => ({
  __esModule: true,
  default: ({ children }: any) => <>{children}</>,
}));

// Mock React Email components
jest.mock('@react-email/components', () => ({
  Html: ({ children, ...props }: any) => <html {...props}>{children}</html>,
  Head: ({ children, ...props }: any) => <head {...props}>{children}</head>,
  Body: ({ children, ...props }: any) => <body {...props}>{children}</body>,
  Container: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  Section: ({ children, ...props }: any) => <section {...props}>{children}</section>,
  Row: ({ children, ...props }: any) => <tr {...props}>{children}</tr>,
  Column: ({ children, ...props }: any) => <td {...props}>{children}</td>,
  Text: ({ children, ...props }: any) => <p {...props}>{children}</p>,
  Button: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
  Link: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
  Img: (props: any) => <img {...props} alt={props.alt || ''} />,
  Hr: (props: any) => <hr {...props} />,
}));

// Mock Prisma Client
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => ({
    booking: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    contact: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    calendarAvailability: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    $transaction: jest.fn(),
    $disconnect: jest.fn(),
  })),
}));

// Mock Resend
jest.mock('resend', () => ({
  Resend: jest.fn(() => ({
    emails: {
      send: jest.fn(),
    },
  })),
}));

// Mock Stripe
jest.mock('stripe', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    paymentIntents: {
      create: jest.fn(),
      retrieve: jest.fn(),
      update: jest.fn(),
    },
    customers: {
      create: jest.fn(),
      retrieve: jest.fn(),
    },
  })),
}));

// Mock analytics
jest.mock('@/lib/analytics', () => ({
  analytics: {
    track: jest.fn(),
    identify: jest.fn(),
    page: jest.fn(),
    reset: jest.fn(),
  },
}));

// Setup cleanup after each test
afterEach(() => {
  // Clear all mocks
  resetAllMocks();
  
  // Clear DOM
  document.body.innerHTML = '';
  
  // Clear local storage
  localStorage.clear();
  
  // Reset timers
  jest.clearAllTimers();
  jest.useRealTimers();
});

// Setup cleanup after all tests
afterAll(() => {
  // Restore console methods
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});

// Custom matchers for better assertions
expect.extend({
  toBeValidEmail(received: string) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const pass = emailRegex.test(received);
    
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid email`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid email`,
        pass: false,
      };
    }
  },
  
  toBeValidPhoneNumber(received: string) {
    const phoneRegex = /^\(\d{3}\) \d{3}-\d{4}$/;
    const pass = phoneRegex.test(received);
    
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid phone number`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid phone number format (555) 123-4567`,
        pass: false,
      };
    }
  },
  
  toBeValidBookingReference(received: string) {
    const refRegex = /^DSE-\d{6}-[A-Z0-9]{3}$/;
    const pass = refRegex.test(received);
    
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid booking reference`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid booking reference format DSE-123456-ABC`,
        pass: false,
      };
    }
  },
});

// TypeScript declaration for custom matchers
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidEmail(): R;
      toBeValidPhoneNumber(): R;
      toBeValidBookingReference(): R;
    }
  }
}