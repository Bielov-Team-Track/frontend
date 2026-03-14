import type { ShareTarget, ShareData } from '@/components/features/share/types';

export interface ShareTargetConfig {
  id: ShareTarget;
  label: string;
  icon: string;
  color: string;
  buildUrl: (data: ShareData) => string | null;
}

function enc(value: string): string {
  return encodeURIComponent(value);
}

export const SHARE_TARGETS: ShareTargetConfig[] = [
  {
    id: 'clipboard',
    label: 'Copy Link',
    icon: 'Link',
    color: '#555555',
    buildUrl: () => null,
  },
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    icon: 'MessageCircle',
    color: '#25D366',
    buildUrl: ({ text, url }) => `https://wa.me/?text=${enc(`${text} ${url}`)}`,
  },
  {
    id: 'telegram',
    label: 'Telegram',
    icon: 'Send',
    color: '#0088cc',
    buildUrl: ({ text, url }) => `https://t.me/share/url?url=${enc(url)}&text=${enc(text)}`,
  },
  {
    id: 'instagram',
    label: 'Instagram',
    icon: 'Instagram',
    color: '#E4405F',
    buildUrl: () => null,
  },
  {
    id: 'facebook',
    label: 'Facebook',
    icon: 'Facebook',
    color: '#4267B2',
    buildUrl: ({ url }) => `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`,
  },
  {
    id: 'viber',
    label: 'Viber',
    icon: 'Phone',
    color: '#7C4DFF',
    buildUrl: ({ text, url }) => `viber://forward?text=${enc(`${text} ${url}`)}`,
  },
  {
    id: 'email',
    label: 'Email',
    icon: 'Mail',
    color: '#EA4335',
    buildUrl: ({ title, text, url }) =>
      `mailto:?subject=${enc(title)}&body=${enc(`${text}\n\n${url}`)}`,
  },
  {
    id: 'twitter',
    label: 'Twitter / X',
    icon: 'Twitter',
    color: '#1DA1F2',
    buildUrl: ({ text, url }) =>
      `https://twitter.com/intent/tweet?url=${enc(url)}&text=${enc(text)}`,
  },
  {
    id: 'sms',
    label: 'SMS',
    icon: 'MessageSquare',
    color: '#555555',
    buildUrl: ({ text, url }) => `sms:?body=${enc(`${text} ${url}`)}`,
  },
];

export function getDropdownTargets(count: number = 5): ShareTargetConfig[] {
  return SHARE_TARGETS.slice(0, count);
}
