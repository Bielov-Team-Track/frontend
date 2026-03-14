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
 * Uses the page's own Next.js opengraph-image route (served at {pagePath}/opengraph-image).
 * This means the preview in the share modal matches exactly what messengers will show.
 */
export function getOgImageUrl(
  entity: ShareableEntity,
  options?: {
    templateId?: string;
    preview?: boolean;
    sig?: string;
    exp?: string;
    configHash?: string;
  }
): string {
  // The page's OG image is at {pageUrl}/opengraph-image
  const pagePath = entity.data.url; // e.g. /events/abc123 or /sign-up
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
