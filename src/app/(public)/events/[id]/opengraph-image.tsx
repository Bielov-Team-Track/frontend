import { ImageResponse } from 'next/og';
import { getFonts } from '@/app/api/og/lib/fonts';
import { DEFAULT_TEMPLATE } from '@/app/api/og/lib/template-config';
import { EventTemplate } from '@/app/api/og/templates/EventTemplate';

export const runtime = 'nodejs';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const INTERNAL_API_URL = process.env.INTERNAL_API_URL || 'http://localhost:8000';

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const fonts = await getFonts();

  let eventData = { name: 'Volleyball Event' } as Record<string, unknown>;
  try {
    const res = await fetch(`${INTERNAL_API_URL}/events/v1/events/${id}`, {
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      eventData = await res.json();
    }
  } catch { /* use defaults */ }

  return new ImageResponse(
    (
      <EventTemplate
        data={{
          name: String(eventData.name || eventData.title || 'Volleyball Event'),
          date: eventData.date as string | undefined,
          venue: eventData.venue as string | undefined,
          surface: eventData.surface as string | undefined,
        }}
        config={DEFAULT_TEMPLATE}
        width={size.width}
        height={size.height}
      />
    ),
    {
      ...size,
      fonts: fonts.map((f) => ({
        name: f.name,
        data: f.data,
        weight: f.weight,
        style: 'normal' as const,
      })),
    }
  );
}
