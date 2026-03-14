// frontend/src/app/api/og/templates/EventTemplate.tsx
import type { TemplateConfig } from '../lib/template-config';
import { BaseTemplate } from './BaseTemplate';

export interface EventData {
  name: string;
  date?: string;
  venue?: string;
  spotsLeft?: number;
  totalSpots?: number;
  surface?: string; // grass, indoor, beach
}

interface EventTemplateProps {
  data: EventData;
  config: TemplateConfig;
  width?: number;
  height?: number;
}

export function EventTemplate({ data, config, width = 1200, height = 630 }: EventTemplateProps) {
  const fs = Math.round(width * 0.03);
  return (
    <BaseTemplate config={config} width={width} height={height}>
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'center', alignItems: 'center', gap: Math.round(height * 0.03) }}>
        <span style={{ fontSize: fs * 0.5, fontWeight: 700, color: config.colors.primary, textTransform: 'uppercase', letterSpacing: 2 }}>
          {data.surface || 'Volleyball Event'}
        </span>
        <span style={{ fontSize: fs * 1.4, fontWeight: 800, textAlign: 'center', maxWidth: '80%' }}>
          {data.name}
        </span>
        <div style={{ display: 'flex', gap: Math.round(width * 0.04), fontSize: fs * 0.5, opacity: 0.6 }}>
          {config.elements.date && data.date && <span>{data.date}</span>}
          {config.elements.venue && data.venue && <span>{data.venue}</span>}
        </div>
        {data.spotsLeft != null && data.totalSpots != null && (
          <span style={{ fontSize: fs * 0.45, color: config.colors.accent, fontWeight: 600 }}>
            {data.spotsLeft} / {data.totalSpots} spots available
          </span>
        )}
      </div>
    </BaseTemplate>
  );
}
