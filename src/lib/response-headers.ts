/**
 * @fileoverview Response Header Utilities
 * 
 * Utilities for setting secure response headers on API endpoints,
 * particularly for authenticated responses that contain sensitive data.
 */

import { NextResponse } from 'next/server';

/**
 * Creates a secure JSON response with appropriate cache control headers
 * for authenticated endpoints containing sensitive data.
 */
export function createSecureApiResponse<T>(
  data: T,
  status: number = 200
): NextResponse {
  const response = NextResponse.json(data, { status });
  
  // Prevent caching of sensitive authenticated data
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  response.headers.set('Pragma', 'no-cache'); // Legacy compatibility
  response.headers.set('Expires', '0'); // Force immediate expiration
  
  return response;
}

/**
 * Creates a secure error response with no-cache headers
 */
export function createSecureErrorResponse(
  message: string,
  status: number = 500
): NextResponse {
  return createSecureApiResponse(
    { error: message },
    status
  );
}

/**
 * Creates a secure unauthorized response
 */
export function createUnauthorizedResponse(
  message: string = 'Unauthorized'
): NextResponse {
  return createSecureApiResponse(
    { error: message },
    401
  );
}

/**
 * Creates a secure forbidden response  
 */
export function createForbiddenResponse(
  message: string = 'Forbidden'
): NextResponse {
  return createSecureApiResponse(
    { error: message },
    403
  );
}

/**
 * Adds secure cache control headers to an existing response
 */
export function addSecureCacheHeaders(response: NextResponse): NextResponse {
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');
  
  return response;
}