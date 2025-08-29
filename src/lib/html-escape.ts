/**
 * @fileoverview HTML escaping utilities for security
 * 
 * Prevents XSS attacks by properly escaping user input in HTML templates
 */

/**
 * Escape HTML special characters to prevent XSS
 */
export function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Escape HTML attributes (more restrictive)
 */
export function escapeHtmlAttribute(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .replace(/\=/g, '&#x3D;')
    .replace(/`/g, '&#x60;');
}

/**
 * Safely join array elements for HTML with escaping
 */
export function escapeAndJoinArray(array: string[], separator: string = ', '): string {
  return array.map(escapeHtml).join(separator);
}

/**
 * Create a safe URL for links (basic validation + escaping)
 */
export function escapeUrl(url: string): string {
  // Basic URL validation - only allow http/https/mailto
  const urlPattern = /^(https?:\/\/|mailto:)/i;
  if (!urlPattern.test(url)) {
    return '#'; // Return safe default
  }
  
  return escapeHtmlAttribute(url);
}

/**
 * Template literal tag for safe HTML interpolation
 * Usage: safeHtml`<p>Hello ${userName}</p>`
 */
export function safeHtml(strings: TemplateStringsArray, ...values: any[]): string {
  let result = '';
  
  for (let i = 0; i < strings.length; i++) {
    result += strings[i];
    
    if (i < values.length) {
      const value = values[i];
      
      // Handle arrays (like services array)
      if (Array.isArray(value)) {
        result += escapeAndJoinArray(value);
      }
      // Handle objects with special formatting
      else if (typeof value === 'object' && value !== null) {
        result += escapeHtml(String(value));
      }
      // Handle regular strings/numbers
      else {
        result += escapeHtml(String(value));
      }
    }
  }
  
  return result;
}

/**
 * Safe conditional HTML rendering
 */
export function conditionalHtml(condition: any, html: string): string {
  return condition ? html : '';
}