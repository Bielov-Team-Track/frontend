// frontend/src/app/api/og/templates/AwardTemplate.tsx
import 'server-only';
import type { TemplateConfig } from '../lib/template-config';
import { BaseTemplate } from './BaseTemplate';

export interface AwardData {
  playerName: string;
  awardName: string;
  eventName?: string;
  date?: string;
}

interface AwardTemplateProps {
  data: AwardData;
  config: TemplateConfig;
  width?: number;
  height?: number;
}

export function AwardTemplate({ data, config, width = 1200, height = 630 }: AwardTemplateProps) {
  const fs = Math.round(width * 0.03);
  return (
    <BaseTemplate config={config} width={width} height={height}>
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'center', alignItems: 'center', gap: Math.round(height * 0.03) }}>
        <span style={{ fontSize: Math.round(width * 0.08) }}>🏆</span>
        <span style={{ fontSize: fs * 0.5, fontWeight: 700, color: config.colors.primary, textTransform: 'uppercase', letterSpacing: 2 }}>
          {data.awardName}
        </span>
        <span style={{ fontSize: fs * 1.4, fontWeight: 800, textAlign: 'center' }}>
          {data.playerName}
        </span>
        {data.eventName && (
          <span style={{ fontSize: fs * 0.5, opacity: 0.5, textAlign: 'center' }}>
            {data.eventName}
          </span>
        )}
        {config.elements.date && data.date && (
          <span style={{ fontSize: fs * 0.4, opacity: 0.35 }}>{data.date}</span>
        )}
      </div>
    </BaseTemplate>
  );
}
