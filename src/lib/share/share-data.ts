import type { ShareableEntity, ShareData } from '@/components/features/share/types';
import { buildShareUrl } from './share-utils';

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
    default:
      return { title, text: title, url };
  }
}

export function getOgImageUrl(
  entity: ShareableEntity,
  options?: {
    templateId?: string;
    width?: number;
    height?: number;
    preview?: boolean;
    sig?: string;
    configHash?: string;
  }
): string {
  const params = new URLSearchParams();
  if (options?.templateId) params.set('templateId', options.templateId);
  if (options?.width) params.set('width', String(options.width));
  if (options?.height) params.set('height', String(options.height));
  if (options?.preview) params.set('preview', 'true');
  if (options?.sig) params.set('sig', options.sig);
  if (options?.configHash) params.set('v', options.configHash);

  const query = params.toString();
  return `/api/og/${entity.type}/${entity.id}${query ? `?${query}` : ''}`;
}
