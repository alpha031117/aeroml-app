/**
 * API configuration and utilities
 * Centralized API base URL management
 */

/**
 * Get the API base URL from environment variables
 * Falls back to http://127.0.0.1:8000 if not set
 */
export const getApiBaseUrl = (): string => {
  if (typeof window === 'undefined') {
    // Server-side: use process.env directly
    return process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000';
  }
  // Client-side: use window location or fallback   
  return process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000';
};

/**
 * Build a full API URL from a path
 * @param path - API endpoint path (e.g., '/api/model-training/model-info/123')
 * @returns Full URL (e.g., 'http://127.0.0.1:8000/api/model-training/model-info/123')
 */
export const buildApiUrl = (path: string): string => {
  const baseUrl = getApiBaseUrl();
  // Remove leading slash from path if present to avoid double slashes
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  // Ensure baseUrl doesn't end with a slash
  const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  return `${cleanBaseUrl}/${cleanPath}`;
};

