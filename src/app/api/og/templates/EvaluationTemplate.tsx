// frontend/src/app/api/og/templates/EvaluationTemplate.tsx
import type { TemplateConfig } from '../lib/template-config';
import { BaseTemplate } from './BaseTemplate';

export interface EvaluationData {
  playerName: string;
  sessionName?: string;
  overallScore?: number;
  metrics?: { name: string; score: number }[];
}

interface EvaluationTemplateProps {
  data: EvaluationData;
  config: TemplateConfig;
  width?: number;
  height?: number;
}

export function EvaluationTemplate({ data, config, width = 1200, height = 630 }: EvaluationTemplateProps) {
  const fs = Math.round(width * 0.03);
  return (
    <BaseTemplate config={config} width={width} height={height}>
      <div style={{ display: 'flex', flex: 1, alignItems: 'center', gap: Math.round(width * 0.06) }}>
        {/* Left: player info */}
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: Math.round(height * 0.02) }}>
          <span style={{ fontSize: fs * 0.5, color: config.colors.primary, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>
            Player Evaluation
          </span>
          <span style={{ fontSize: fs * 1.2, fontWeight: 800 }}>{data.playerName}</span>
          {data.sessionName && <span style={{ fontSize: fs * 0.5, opacity: 0.5 }}>{data.sessionName}</span>}
          {data.overallScore != null && (
            <span style={{ fontSize: fs * 2, fontWeight: 800, color: config.colors.primary }}>{data.overallScore}</span>
          )}
        </div>
        {/* Right: metrics */}
        {data.metrics && data.metrics.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: Math.round(height * 0.015) }}>
            {data.metrics.slice(0, 5).map((m) => (
              <div key={m.name} style={{ display: 'flex', alignItems: 'center', gap: Math.round(width * 0.015) }}>
                <span style={{ fontSize: fs * 0.4, opacity: 0.6, minWidth: Math.round(width * 0.1) }}>{m.name}</span>
                <span style={{ fontSize: fs * 0.5, fontWeight: 700 }}>{m.score}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </BaseTemplate>
  );
}
