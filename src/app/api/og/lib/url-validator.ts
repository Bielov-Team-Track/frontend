// frontend/src/app/api/og/lib/url-validator.ts

const ALLOWED_DOMAINS = [
  process.env.NEXT_PUBLIC_S3_DOMAIN,       // e.g., "cdn.spike.app"
  process.env.NEXT_PUBLIC_APP_URL,          // e.g., "https://spike.app"
].filter(Boolean) as string[];

const BLOCKED_PATTERNS = [
  /^file:/i,
  /localhost/i,
  /127\.\d+\.\d+\.\d+/,
  /10\.\d+\.\d+\.\d+/,
  /172\.(1[6-9]|2\d|3[01])\.\d+\.\d+/,
  /192\.168\.\d+\.\d+/,
  /169\.254\.\d+\.\d+/,
  /\[::1\]/,
  /0\.0\.0\.0/,
];

/**
 * Validate that a URL is safe to fetch server-side (SSRF prevention).
 * Returns true only if the URL points to an allowed domain.
 */
export function isUrlSafe(url: string | undefined | null): boolean {
  if (!url) return false;

  // Check for blocked patterns
  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(url)) return false;
  }

  // Relative URLs are always safe (they reference our own domain)
  if (url.startsWith('/')) return true;

  // Check against allowed domains
  try {
    const parsed = new URL(url);
    return ALLOWED_DOMAINS.some(
      (domain) => parsed.hostname === domain || parsed.origin === domain
    );
  } catch {
    return false;
  }
}
