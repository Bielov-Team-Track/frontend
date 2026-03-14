// frontend/src/app/api/og/[type]/[id]/route.tsx
import 'server-only';
import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { getFonts } from '../../lib/fonts';
import { parseTemplateConfig, DEFAULT_TEMPLATE } from '../../lib/template-config';
import { MatchResultTemplate } from '../../templates/MatchResultTemplate';
import { EventTemplate } from '../../templates/EventTemplate';
import { ClubTemplate } from '../../templates/ClubTemplate';
import { EvaluationTemplate } from '../../templates/EvaluationTemplate';
import { AwardTemplate } from '../../templates/AwardTemplate';

const INTERNAL_API_URL = process.env.INTERNAL_API_URL || 'http://localhost:8000';

const VALID_TYPES = ['match', 'event', 'club', 'evaluation', 'award'] as const;
type OgType = typeof VALID_TYPES[number];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ type: string; id: string }> }
) {
  const { type, id } = await params;

  // Validate type
  if (!VALID_TYPES.includes(type as OgType)) {
    return new Response('Invalid type', { status: 400 });
  }

  // Parse query params
  const { searchParams } = request.nextUrl;
  const width = Number(searchParams.get('width')) || 1200;
  const height = Number(searchParams.get('height')) || 630;
  const preview = searchParams.get('preview') === 'true';
  const templateId = searchParams.get('templateId');

  // Clamp dimensions
  const w = Math.min(Math.max(width, 200), 1920);
  const h = Math.min(Math.max(height, 200), 1920);
  const finalW = preview ? Math.round(w * 0.5) : w;
  const finalH = preview ? Math.round(h * 0.5) : h;

  try {
    // Fetch entity data from backend
    const entityData = await fetchEntityData(type as OgType, id);
    if (!entityData) {
      return new Response('Entity not found', { status: 404 });
    }

    // Access control for private entities (HMAC sig) — deferred to follow-up plan
    // Template config fetching from clubs-service — deferred to TemplatePicker integration

    const config = DEFAULT_TEMPLATE; // Uses Spike default; club templates wired after CRUD integration
    const fonts = await getFonts();

    // Select template component based on type
    const element = renderTemplate(type as OgType, entityData, config, finalW, finalH);

    // Determine cache headers based on entity visibility
    const isPublic = entityData.isPublic !== false;
    const cacheControl = isPublic
      ? 'public, s-maxage=3600, stale-while-revalidate=86400'
      : 'private, no-store';

    return new ImageResponse(element, {
      width: finalW,
      height: finalH,
      fonts: fonts.map((f) => ({
        name: f.name,
        data: f.data,
        weight: f.weight,
        style: 'normal' as const,
      })),
      headers: { 'Cache-Control': cacheControl },
    });
  } catch (err) {
    console.error('OG image generation error:', err);
    return new Response('Image generation failed', { status: 500 });
  }
}

async function fetchEntityData(type: OgType, id: string) {
  // Map type to backend endpoint
  const endpoints: Record<OgType, string> = {
    match: `/events/v1/games/${id}`,
    event: `/events/v1/events/${id}`,
    club: `/clubs/v1/clubs/${id}`,
    evaluation: `/events/v1/evaluations/${id}`, // Placeholder — evaluations are in coaching-service; update endpoint when OG-safe API exists
    award: `/events/v1/awards/${id}`, // Placeholder — awards endpoint TBD; update when implemented
  };

  try {
    const res = await fetch(`${INTERNAL_API_URL}${endpoints[type]}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

function renderTemplate(
  type: OgType,
  data: Record<string, unknown>,
  config: ReturnType<typeof parseTemplateConfig>,
  width: number,
  height: number,
) {
  switch (type) {
    case 'match':
      return (
        <MatchResultTemplate
          data={{
            teamA: String(data.teamA || 'Team A'),
            teamB: String(data.teamB || 'Team B'),
            scoreA: Number(data.scoreA || 0),
            scoreB: Number(data.scoreB || 0),
            sets: data.sets as { scoreA: number; scoreB: number }[] | undefined,
            venue: data.venue as string | undefined,
            date: data.date as string | undefined,
          }}
          config={config}
          width={width}
          height={height}
        />
      );
    case 'event':
      return (
        <EventTemplate
          data={{
            name: String(data.name || data.title || 'Event'),
            date: data.date as string | undefined,
            venue: data.venue as string | undefined,
            surface: data.surface as string | undefined,
          }}
          config={config}
          width={width}
          height={height}
        />
      );
    case 'club':
      return (
        <ClubTemplate
          data={{
            name: String(data.name || 'Club'),
            description: data.description as string | undefined,
            memberCount: data.memberCount as number | undefined,
            logoUrl: data.logoUrl as string | undefined,
          }}
          config={config}
          width={width}
          height={height}
        />
      );
    case 'evaluation':
      return (
        <EvaluationTemplate
          data={{
            playerName: String(data.playerName || 'Player'),
            sessionName: data.sessionName as string | undefined,
            overallScore: data.overallScore as number | undefined,
          }}
          config={config}
          width={width}
          height={height}
        />
      );
    case 'award':
      return (
        <AwardTemplate
          data={{
            playerName: String(data.playerName || 'Player'),
            awardName: String(data.awardName || 'Award'),
            eventName: data.eventName as string | undefined,
            date: data.date as string | undefined,
          }}
          config={config}
          width={width}
          height={height}
        />
      );
    default:
      // Fallback: render entity title on branded background
      return (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width,
            height,
            backgroundImage: `linear-gradient(135deg, ${config.colors.secondary}, ${config.background.to || '#0f3460'})`,
            color: config.colors.text,
            fontFamily: config.font,
            fontSize: Math.round(width * 0.04),
            fontWeight: 700,
            padding: Math.round(width * 0.08),
            textAlign: 'center',
          }}
        >
          {String(data.title || data.name || 'Spike')}
        </div>
      );
  }
}
