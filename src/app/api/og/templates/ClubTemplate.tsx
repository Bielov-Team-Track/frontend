// frontend/src/app/api/og/templates/ClubTemplate.tsx
import 'server-only';
import type { TemplateConfig } from '../lib/template-config';
import { BaseTemplate } from './BaseTemplate';

export interface ClubData {
  name: string;
  description?: string;
  memberCount?: number;
  logoUrl?: string;
}

interface ClubTemplateProps {
  data: ClubData;
  config: TemplateConfig;
  width?: number;
  height?: number;
}

export function ClubTemplate({ data, config, width = 1200, height = 630 }: ClubTemplateProps) {
  const fs = Math.round(width * 0.03);
  return (
    <BaseTemplate config={config} width={width} height={height}>
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'center', alignItems: 'center', gap: Math.round(height * 0.03) }}>
        {data.logoUrl && (
          <img src={data.logoUrl} alt="" width={Math.round(width * 0.1)} height={Math.round(width * 0.1)} style={{ borderRadius: '50%' }} />
        )}
        <span style={{ fontSize: fs * 1.6, fontWeight: 800, textAlign: 'center' }}>
          {data.name}
        </span>
        {data.description && (
          <span style={{ fontSize: fs * 0.5, opacity: 0.6, textAlign: 'center', maxWidth: '70%' }}>
            {data.description}
          </span>
        )}
        {data.memberCount != null && (
          <span style={{ fontSize: fs * 0.45, color: config.colors.accent, fontWeight: 600 }}>
            {data.memberCount} members
          </span>
        )}
      </div>
    </BaseTemplate>
  );
}
