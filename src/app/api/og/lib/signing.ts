import 'server-only';
import { createHmac } from 'crypto';

const OG_SIGNING_SECRET = process.env.OG_SIGNING_SECRET || 'dev-og-signing-secret-change-in-production';

// Signature covers type + id + optional expiry
// Default expiry: 7 days from now
const DEFAULT_EXPIRY_SECONDS = 7 * 24 * 60 * 60;

/**
 * Generate an HMAC signature for an OG image URL.
 * Used server-side when the share flow creates signed URLs for private entities.
 */
export function generateOgSignature(type: string, id: string, expiresAt?: number): { sig: string; exp: number } {
  const exp = expiresAt ?? Math.floor(Date.now() / 1000) + DEFAULT_EXPIRY_SECONDS;
  const payload = `${type}:${id}:${exp}`;
  const sig = createHmac('sha256', OG_SIGNING_SECRET).update(payload).digest('hex');
  return { sig, exp };
}

/**
 * Validate an HMAC signature from URL query params.
 * Returns true if signature is valid and not expired.
 */
export function validateOgSignature(type: string, id: string, sig: string, exp: string): boolean {
  const expNum = parseInt(exp, 10);
  if (isNaN(expNum)) return false;

  // Check expiry
  const now = Math.floor(Date.now() / 1000);
  if (now > expNum) return false;

  // Recalculate and compare
  const payload = `${type}:${id}:${expNum}`;
  const expected = createHmac('sha256', OG_SIGNING_SECRET).update(payload).digest('hex');

  // Timing-safe comparison
  if (sig.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < sig.length; i++) {
    diff |= sig.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return diff === 0;
}
