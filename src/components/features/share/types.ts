export type ShareableEntityType =
  | 'match' | 'event' | 'club' | 'evaluation' | 'award'
  | 'post' | 'profile' | 'venue';

export interface ShareableEntity {
  type: ShareableEntityType;
  id: string;
  data: {
    title: string;
    description?: string;
    url: string;
    imageUrl?: string;
  };
}

export type ShareTarget =
  | 'clipboard' | 'whatsapp' | 'telegram' | 'instagram'
  | 'facebook' | 'viber' | 'email' | 'twitter' | 'sms';

export interface ShareData {
  title: string;
  text: string;
  url: string;
}

export const RICH_ENTITY_TYPES: ShareableEntityType[] =
  ['match', 'event', 'club', 'evaluation', 'award'];

export function isRichEntity(type: ShareableEntityType): boolean {
  return RICH_ENTITY_TYPES.includes(type);
}
