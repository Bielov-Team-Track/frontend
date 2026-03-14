// frontend/src/app/api/og/templates/BaseTemplate.tsx
import 'server-only';
import type { TemplateConfig } from '../lib/template-config';

interface BaseTemplateProps {
  config: TemplateConfig;
  width: number;
  height: number;
  children: React.ReactNode;
}

/**
 * Base layout wrapper for all OG image templates.
 * Satori constraints: flexbox only, no grid, no z-index, document-order stacking.
 */
export function BaseTemplate({ config, width, height, children }: BaseTemplateProps) {
  const bgStyle = getBackgroundStyle(config);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width,
        height,
        ...bgStyle,
        fontFamily: config.font,
        color: config.colors.text,
        position: 'relative',
      }}
    >
      {/* Background image overlay (rendered first = behind content) */}
      {config.background.type === 'image' && config.background.overlay && (
        <div
          style={{
            display: 'flex',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: `rgba(0,0,0,${config.background.overlay})`,
          }}
        />
      )}

      {/* Content */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          padding: Math.round(width * 0.04),
          position: 'relative',
        }}
      >
        {children}
      </div>

      {/* Watermark */}
      {config.elements.watermark && (
        <div
          style={{
            display: 'flex',
            position: 'absolute',
            bottom: Math.round(height * 0.03),
            right: Math.round(width * 0.04),
            fontSize: Math.round(width * 0.018),
            opacity: 0.4,
            color: config.colors.text,
          }}
        >
          spike.app
        </div>
      )}
    </div>
  );
}

function getBackgroundStyle(config: TemplateConfig): React.CSSProperties {
  switch (config.background.type) {
    case 'solid':
      return { backgroundColor: config.background.color ?? config.colors.secondary };
    case 'gradient':
      return {
        backgroundImage: `linear-gradient(135deg, ${config.background.from}, ${config.background.to})`,
      };
    case 'image':
      return {
        backgroundImage: `url(${config.background.imageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      };
    default:
      return { backgroundColor: config.colors.secondary };
  }
}
