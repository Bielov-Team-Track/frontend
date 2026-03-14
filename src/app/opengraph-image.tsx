import { ImageResponse } from 'next/og';

export const runtime = 'nodejs';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: 1200,
          height: 630,
          background: 'linear-gradient(160deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
          color: '#ffffff',
          gap: 20,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ display: 'flex', position: 'absolute', top: -80, right: -80, width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,125,0,0.07)' }} />
        <div style={{ display: 'flex', position: 'absolute', bottom: -60, left: -60, width: 200, height: 200, borderRadius: '50%', background: 'rgba(41,117,122,0.08)' }} />
        <span style={{ fontSize: 28, fontWeight: 700, color: '#FF7D00', textTransform: 'uppercase', letterSpacing: 6 }}>
          ⚡ Spike
        </span>
        <span style={{ fontSize: 52, fontWeight: 800, textAlign: 'center' }}>
          Volleyball Community
        </span>
        <span style={{ fontSize: 22, color: 'rgba(255,255,255,0.45)', textAlign: 'center', maxWidth: '70%' }}>
          Organize events, manage clubs, track games, and connect with players
        </span>
      </div>
    ),
    { ...size }
  );
}
