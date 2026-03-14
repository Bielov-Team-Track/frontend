import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

const INTERNAL_API_URL = process.env.INTERNAL_API_URL || 'http://localhost:8000';
const VALID_TYPES = ['match', 'event', 'club', 'evaluation', 'award'] as const;
type OgType = typeof VALID_TYPES[number];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ type: string; id: string }> }
) {
  const { type, id } = await params;

  if (!VALID_TYPES.includes(type as OgType)) {
    return new Response('Invalid type', { status: 400 });
  }

  const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!UUID_REGEX.test(id)) {
    return new Response('Invalid entity ID', { status: 400 });
  }

  const preview = request.nextUrl.searchParams.get('preview') === 'true';
  const w = preview ? 600 : 1200;
  const h = preview ? 315 : 630;

  try {
    const entityData = await fetchEntityData(type as OgType, id);
    const title = entityData?.name || entityData?.title || type.charAt(0).toUpperCase() + type.slice(1);
    const subtitle = buildSubtitle(type as OgType, entityData);

    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: w,
            height: h,
            background: 'linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%)',
            color: '#ffffff',
            padding: Math.round(w * 0.06),
            gap: Math.round(h * 0.03),
          }}
        >
          <span style={{ fontSize: Math.round(w * 0.02), fontWeight: 700, color: '#FF7D00', textTransform: 'uppercase', letterSpacing: 3 }}>
            Spike
          </span>
          <span style={{ fontSize: Math.round(w * 0.045), fontWeight: 700, textAlign: 'center', maxWidth: '85%' }}>
            {String(title)}
          </span>
          {subtitle && (
            <span style={{ fontSize: Math.round(w * 0.018), opacity: 0.5, textAlign: 'center' }}>
              {subtitle}
            </span>
          )}
        </div>
      ),
      { width: w, height: h }
    );
  } catch (err) {
    console.error('OG image generation error:', err);
    return new Response(`Image generation failed: ${err}`, { status: 500 });
  }
}

function buildSubtitle(type: OgType, data: Record<string, unknown> | null): string | null {
  if (!data) return null;
  switch (type) {
    case 'event': {
      const parts: string[] = [];
      if (data.startTime) parts.push(new Date(data.startTime as string).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }));
      if (data.location && typeof data.location === 'object' && (data.location as Record<string, unknown>).name) parts.push(String((data.location as Record<string, unknown>).name));
      return parts.length > 0 ? parts.join(' · ') : null;
    }
    case 'club':
      return data.description ? String(data.description).slice(0, 80) : null;
    default:
      return null;
  }
}

async function fetchEntityData(type: OgType, id: string) {
  const endpoints: Record<OgType, string> = {
    match: `/events/v1/games/${id}`,
    event: `/events/v1/events/${id}`,
    club: `/clubs/v1/clubs/${id}`,
    evaluation: `/events/v1/evaluations/${id}`,
    award: `/events/v1/awards/${id}`,
  };
  try {
    const res = await fetch(`${INTERNAL_API_URL}${endpoints[type]}`, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    return res.json();
  } catch { return null; }
}
