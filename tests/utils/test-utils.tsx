/**
 * @fileoverview Test Utilities for React Testing Library
 * 
 * Custom render functions, providers, and testing helpers
 * Following best practices for React component testing
 */

import React, { ReactElement } from 'react';
import { render, RenderOptions, RenderResult } from '@testing-library/react';
import { ThemeProvider } from 'next-themes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        {children}
      </ThemeProvider>
    </QueryClientProvider>
  );
};

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  wrapper?: React.ComponentType<any>;
}

const customRender = (
  ui: ReactElement,
  options?: CustomRenderOptions
): RenderResult => {
  return render(ui, { wrapper: AllTheProviders, ...options });
};

// Mock form submission helper
export const mockFormSubmit = (formData: Record<string, any>) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        data: formData,
        message: 'Form submitted successfully',
      });
    }, 100);
  });
};

// Mock API response helper
export const mockApiResponse = <T>(data: T, delay: number = 100) => {
  return new Promise<T>((resolve) => {
    setTimeout(() => resolve(data), delay);
  });
};

// Mock error response helper
export const mockApiError = (message: string, status: number = 500, delay: number = 100) => {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error(`HTTP ${status}: ${message}`));
    }, delay);
  });
};

// User event simulation helpers
export const simulateTyping = async (element: HTMLElement, text: string, delay: number = 50) => {
  const { userEvent } = await import('@testing-library/user-event');
  const user = userEvent.setup({ delay });
  
  await user.clear(element);
  await user.type(element, text);
};

export const simulateClick = async (element: HTMLElement) => {
  const { userEvent } = await import('@testing-library/user-event');
  const user = userEvent.setup();
  
  await user.click(element);
};

export const simulateFormSubmission = async (form: HTMLElement) => {
  const { userEvent } = await import('@testing-library/user-event');
  const user = userEvent.setup();
  
  const submitButton = form.querySelector('button[type="submit"]') as HTMLElement;
  if (submitButton) {
    await user.click(submitButton);
  }
};

// Test data generators
export const generateBookingData = (overrides?: Partial<any>) => ({
  clientName: 'Test Client',
  clientEmail: 'test@example.com',
  clientPhone: '(555) 123-4567',
  eventDate: '2024-12-25',
  eventType: 'Wedding',
  services: ['DJ'],
  venueName: 'Test Venue',
  venueAddress: '123 Test St',
  guestCount: 100,
  specialRequests: 'Test request',
  ...overrides,
});

export const generateContactData = (overrides?: Partial<any>) => ({
  name: 'Test Contact',
  email: 'contact@example.com',
  phone: '(555) 987-6543',
  subject: 'Test Subject',
  message: 'This is a test message that is long enough to pass validation.',
  ...overrides,
});

export const generateUserData = (overrides?: Partial<any>) => ({
  id: 'user-123',
  name: 'Test User',
  email: 'user@example.com',
  role: 'USER',
  createdAt: new Date(),
  ...overrides,
});

// Assertion helpers
export const expectElementToBeVisible = (element: HTMLElement | null) => {
  expect(element).toBeInTheDocument();
  expect(element).toBeVisible();
};

export const expectElementToHaveText = (element: HTMLElement | null, text: string) => {
  expect(element).toBeInTheDocument();
  expect(element).toHaveTextContent(text);
};

export const expectFormFieldToHaveValue = (
  container: HTMLElement,
  testId: string,
  value: string
) => {
  const field = container.querySelector(`[data-testid="${testId}"]`) as HTMLInputElement;
  expect(field).toBeInTheDocument();
  expect(field.value).toBe(value);
};

export const expectFormFieldToHaveError = (
  container: HTMLElement,
  fieldTestId: string,
  errorMessage: string
) => {
  const errorElement = container.querySelector(`[data-testid="${fieldTestId}-error"]`);
  expect(errorElement).toBeInTheDocument();
  expect(errorElement).toHaveTextContent(errorMessage);
};

// Mock localStorage for testing
export const mockLocalStorage = () => {
  const storage: Record<string, string> = {};

  return {
    getItem: jest.fn((key: string) => storage[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      storage[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete storage[key];
    }),
    clear: jest.fn(() => {
      Object.keys(storage).forEach(key => delete storage[key]);
    }),
    length: Object.keys(storage).length,
    key: jest.fn((index: number) => Object.keys(storage)[index] || null),
  };
};

// Mock window.matchMedia for responsive testing
export const mockMatchMedia = (matches: boolean = false) => {
  const mockMatchMediaFn = jest.fn().mockImplementation(query => ({
    matches,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  }));

  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: mockMatchMediaFn,
  });

  // Also ensure it exists on global object for jsdom
  if (typeof global !== 'undefined') {
    Object.defineProperty(global, 'matchMedia', {
      writable: true,
      value: mockMatchMediaFn,
    });
  }
};

// Mock intersection observer for viewport testing
export const mockIntersectionObserver = () => {
  const mockIntersectionObserver = jest.fn();
  mockIntersectionObserver.mockReturnValue({
    observe: () => null,
    unobserve: () => null,
    disconnect: () => null,
  });
  window.IntersectionObserver = mockIntersectionObserver;
  window.IntersectionObserverEntry = jest.fn();
};

// Mock ResizeObserver for responsive component testing
export const mockResizeObserver = () => {
  const mockResizeObserver = jest.fn();
  mockResizeObserver.mockReturnValue({
    observe: () => null,
    unobserve: () => null,
    disconnect: () => null,
  });
  window.ResizeObserver = mockResizeObserver;
};

// Date testing utilities
export const mockDate = (dateString: string) => {
  const mockDate = new Date(dateString);
  const originalDate = Date;
  
  global.Date = jest.fn(() => mockDate) as any;
  global.Date.UTC = originalDate.UTC;
  global.Date.parse = originalDate.parse;
  global.Date.now = () => mockDate.getTime();
  
  return () => {
    global.Date = originalDate;
  };
};

// Network request mocking utilities
export const mockFetch = (response: any, status: number = 200) => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: status >= 200 && status < 300,
      status,
      statusText: status >= 200 && status < 300 ? 'OK' : 'Error',
      json: () => Promise.resolve(response),
      text: () => Promise.resolve(JSON.stringify(response)),
    })
  ) as jest.Mock;
};

export const mockFetchError = (message: string = 'Network Error') => {
  global.fetch = jest.fn(() => Promise.reject(new Error(message))) as jest.Mock;
};

// File upload testing utilities
export const createMockFile = (
  name: string = 'test.jpg',
  size: number = 1024,
  type: string = 'image/jpeg'
) => {
  const file = new File(['test content'], name, { type });
  Object.defineProperty(file, 'size', { value: size });
  return file;
};

export const mockFileReader = (result: string | ArrayBuffer) => {
  const mockFileReader = {
    readAsDataURL: jest.fn(),
    readAsText: jest.fn(),
    readAsArrayBuffer: jest.fn(),
    result,
    onload: null as any,
    onerror: null as any,
  };

  global.FileReader = jest.fn(() => mockFileReader) as any;

  // Simulate successful file read
  setTimeout(() => {
    if (mockFileReader.onload) {
      mockFileReader.onload({ target: mockFileReader } as any);
    }
  }, 0);

  return mockFileReader;
};

// Animation testing utilities
export const disableAnimations = () => {
  const style = document.createElement('style');
  style.innerHTML = `
    *, *::before, *::after {
      animation-duration: 0s !important;
      animation-delay: 0s !important;
      transition-duration: 0s !important;
      transition-delay: 0s !important;
    }
  `;
  document.head.appendChild(style);
  
  return () => {
    document.head.removeChild(style);
  };
};

// Cleanup utilities
export const cleanupMocks = () => {
  jest.clearAllMocks();
  jest.clearAllTimers();
  jest.restoreAllMocks();
};

// Re-export everything from testing-library
export * from '@testing-library/react';
export { customRender as render };