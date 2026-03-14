// frontend/src/app/api/og/lib/template-config.ts

export type LayoutPreset = 'centered-score' | 'banner-hero' | 'stats-card' | 'achievement';
export type LogoPosition = 'top-left' | 'top-center' | 'top-right';
export type LogoSize = 'sm' | 'md' | 'lg';

export interface TemplateConfig {
  layout: LayoutPreset;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    text: string;
  };
  logo?: {
    url: string;
    position: LogoPosition;
    size: LogoSize;
  };
  background: {
    type: 'solid' | 'gradient' | 'image';
    color?: string;
    from?: string;
    to?: string;
    imageUrl?: string;
    overlay?: number;
  };
  font: string;
  elements: {
    venue: boolean;
    date: boolean;
    setScores: boolean;
    clubBadge: boolean;
    watermark: boolean;
  };
}

/** Default Spike-branded template used when no club template exists. */
export const DEFAULT_TEMPLATE: TemplateConfig = {
  layout: 'centered-score',
  colors: {
    primary: '#FF7D00',
    secondary: '#1a1a2e',
    accent: '#29757A',
    text: '#ffffff',
  },
  background: {
    type: 'gradient',
    from: '#1a1a2e',
    to: '#0f3460',
  },
  font: 'Inter',
  elements: {
    venue: true,
    date: true,
    setScores: true,
    clubBadge: true,
    watermark: true,
  },
};

/** Safely extract only known fields from a raw config object. */
export function parseTemplateConfig(raw: unknown): TemplateConfig {
  if (!raw || typeof raw !== 'object') return DEFAULT_TEMPLATE;
  const obj = raw as Record<string, unknown>;

  return {
    layout: validateLayout(obj.layout) ?? DEFAULT_TEMPLATE.layout,
    colors: {
      primary: asString(obj.colors, 'primary') ?? DEFAULT_TEMPLATE.colors.primary,
      secondary: asString(obj.colors, 'secondary') ?? DEFAULT_TEMPLATE.colors.secondary,
      accent: asString(obj.colors, 'accent') ?? DEFAULT_TEMPLATE.colors.accent,
      text: asString(obj.colors, 'text') ?? DEFAULT_TEMPLATE.colors.text,
    },
    background: parseBackground(obj.background),
    font: (typeof obj.font === 'string' ? obj.font : DEFAULT_TEMPLATE.font),
    elements: parseElements(obj.elements),
  };
}

function validateLayout(v: unknown): LayoutPreset | null {
  const valid: LayoutPreset[] = ['centered-score', 'banner-hero', 'stats-card', 'achievement'];
  return typeof v === 'string' && valid.includes(v as LayoutPreset) ? v as LayoutPreset : null;
}

function asString(obj: unknown, key: string): string | null {
  if (obj && typeof obj === 'object' && key in obj) {
    const val = (obj as Record<string, unknown>)[key];
    return typeof val === 'string' ? val : null;
  }
  return null;
}

function parseBackground(raw: unknown): TemplateConfig['background'] {
  if (!raw || typeof raw !== 'object') return DEFAULT_TEMPLATE.background;
  const obj = raw as Record<string, unknown>;
  return {
    type: (['solid', 'gradient', 'image'].includes(obj.type as string) ? obj.type : 'gradient') as 'solid' | 'gradient' | 'image',
    color: typeof obj.color === 'string' ? obj.color : undefined,
    from: typeof obj.from === 'string' ? obj.from : DEFAULT_TEMPLATE.background.from,
    to: typeof obj.to === 'string' ? obj.to : DEFAULT_TEMPLATE.background.to,
    imageUrl: typeof obj.imageUrl === 'string' ? obj.imageUrl : undefined,
    overlay: typeof obj.overlay === 'number' ? obj.overlay : undefined,
  };
}

function parseElements(raw: unknown): TemplateConfig['elements'] {
  if (!raw || typeof raw !== 'object') return DEFAULT_TEMPLATE.elements;
  const obj = raw as Record<string, unknown>;
  const def = DEFAULT_TEMPLATE.elements;
  return {
    venue: typeof obj.venue === 'boolean' ? obj.venue : def.venue,
    date: typeof obj.date === 'boolean' ? obj.date : def.date,
    setScores: typeof obj.setScores === 'boolean' ? obj.setScores : def.setScores,
    clubBadge: typeof obj.clubBadge === 'boolean' ? obj.clubBadge : def.clubBadge,
    watermark: typeof obj.watermark === 'boolean' ? obj.watermark : def.watermark,
  };
}
