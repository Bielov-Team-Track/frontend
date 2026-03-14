import type { ShareableEntity, ShareData } from '@/components/features/share/types';
import { buildShareUrl } from './share-utils';

const PRIVATE_ENTITY_TYPES = ['evaluation', 'award'];

/**
 * Build share data (title, text, url) for a given entity.
 *
 * NOTE: Spec requires i18n translation keys, but the app has no i18n system yet
 * (no next-intl, react-i18next, etc.). Strings are hardcoded in English for now.
 * When i18n is adopted, replace these with translation key lookups.
 */
export function getShareData(entity: ShareableEntity): ShareData {
  const url = buildShareUrl(entity.data.url);
  const { title } = entity.data;

  switch (entity.type) {
    case 'event':
      return { title, text: `Check out this event: ${title}`, url };
    case 'match':
      return { title, text: title, url };
    case 'club':
      return { title, text: `Join ${title} on Spike!`, url };
    case 'evaluation':
      return { title, text: `${title} — evaluation results`, url };
    case 'award':
      return { title, text: title, url };
    case 'page':
      return { title, text: entity.data.description ?? title, url };
    default:
      return { title, text: title, url };
  }
}

/**
 * Get the OG image URL for an entity.
 * Reads the current page's og:image meta tag if available (includes Next.js hash suffix).
 * Falls back to constructing the path manually.
 */
export function getOgImageUrl(
  entity: ShareableEntity,
  _options?: {
    templateId?: string;
    preview?: boolean;
  }
): string {
  // Try reading the og:image from the current page's meta tags (client-side only)
  if (typeof document !== 'undefined') {
    const ogMeta = document.querySelector('meta[property="og:image"]');
    if (ogMeta) {
      const content = ogMeta.getAttribute('content');
      if (content) {
        // Convert absolute URL to relative path for same-origin fetch
        try {
          const url = new URL(content, window.location.origin);
          if (url.origin === window.location.origin) {
            return url.pathname + url.search;
          }
          return content;
        } catch {
          return content;
        }
      }
    }
  }

  // Fallback: construct the path (may not include Next.js hash suffix)
  const pagePath = entity.data.url;
  return `${pagePath}/opengraph-image`;
}

/**
 * Get a signed OG image URL for private entities.
 * Calls the server-side signing endpoint to get HMAC signature.
 * For public entities, returns the unsigned URL.
 */
export async function getSignedOgImageUrl(
  entity: ShareableEntity,
  options?: Parameters<typeof getOgImageUrl>[1]
): Promise<string> {
  if (!PRIVATE_ENTITY_TYPES.includes(entity.type)) {
    return getOgImageUrl(entity, options);
  }

  try {
    const response = await fetch('/api/og/sign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: entity.type, id: entity.id }),
    });
    if (response.ok) {
      const { sig, exp } = await response.json();
      return getOgImageUrl(entity, { ...options, sig, exp: String(exp) });
    }
  } catch {
    // Fall through to unsigned URL
  }

  return getOgImageUrl(entity, options);
}
