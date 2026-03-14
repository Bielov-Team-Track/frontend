// frontend/src/app/api/og/templates/MatchResultTemplate.tsx
import 'server-only';
import type { TemplateConfig } from '../lib/template-config';
import { BaseTemplate } from './BaseTemplate';

interface MatchData {
  teamA: string;
  teamB: string;
  scoreA: number;
  scoreB: number;
  sets?: { scoreA: number; scoreB: number }[];
  venue?: string;
  date?: string;
}

interface MatchResultTemplateProps {
  data: MatchData;
  config: TemplateConfig;
  width?: number;
  height?: number;
}

export function MatchResultTemplate({
  data,
  config,
  width = 1200,
  height = 630,
}: MatchResultTemplateProps) {
  const fontSize = Math.round(width * 0.03);

  return (
    <BaseTemplate config={config} width={width} height={height}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: Math.round(height * 0.04),
        }}
      >
        <span style={{ fontSize: fontSize * 0.6, fontWeight: 700, color: config.colors.primary, textTransform: 'uppercase', letterSpacing: 1 }}>
          Spike
        </span>
        {config.elements.date && data.date && (
          <span style={{ fontSize: fontSize * 0.5, opacity: 0.5 }}>{data.date}</span>
        )}
      </div>

      {/* Teams + Score */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flex: 1,
          gap: Math.round(width * 0.04),
        }}
      >
        {/* Team A */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
          <span style={{ fontSize: fontSize * 0.7, fontWeight: 500, opacity: 0.8, textAlign: 'center' }}>
            {data.teamA}
          </span>
        </div>

        {/* Score */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{ fontSize: fontSize * 2.5, fontWeight: 800, letterSpacing: 4 }}>
            {data.scoreA} : {data.scoreB}
          </span>
          <span style={{ fontSize: fontSize * 0.4, opacity: 0.4, textTransform: 'uppercase', letterSpacing: 1 }}>
            Final
          </span>
        </div>

        {/* Team B */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
          <span style={{ fontSize: fontSize * 0.7, fontWeight: 500, opacity: 0.8, textAlign: 'center' }}>
            {data.teamB}
          </span>
        </div>
      </div>

      {/* Set scores */}
      {config.elements.setScores && data.sets && data.sets.length > 0 && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: Math.round(width * 0.015),
            marginTop: Math.round(height * 0.02),
          }}
        >
          {data.sets.map((set, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                backgroundColor: 'rgba(255,255,255,0.08)',
                borderRadius: 6,
                padding: `${Math.round(height * 0.01)}px ${Math.round(width * 0.015)}px`,
              }}
            >
              <span style={{ fontSize: fontSize * 0.3, opacity: 0.35, textTransform: 'uppercase' }}>
                Set {i + 1}
              </span>
              <span style={{ fontSize: fontSize * 0.55, fontWeight: 600 }}>
                {set.scoreA}-{set.scoreB}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Venue */}
      {config.elements.venue && data.venue && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            marginTop: Math.round(height * 0.04),
            fontSize: fontSize * 0.4,
            opacity: 0.4,
          }}
        >
          {data.venue}
        </div>
      )}
    </BaseTemplate>
  );
}
