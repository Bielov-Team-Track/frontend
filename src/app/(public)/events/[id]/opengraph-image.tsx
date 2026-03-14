import { ImageResponse } from 'next/og';
import { getFonts } from '@/app/api/og/lib/fonts';
import { DEFAULT_TEMPLATE } from '@/app/api/og/lib/template-config';

export const runtime = 'nodejs';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const INTERNAL_API_URL = process.env.INTERNAL_API_URL || 'http://localhost:8000';

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const fonts = await getFonts();

  let title = 'Volleyball Event';
  try {
    const res = await fetch(`${INTERNAL_API_URL}/events/v1/events/${id}`, {
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const data = await res.json();
      title = data.name || data.title || title;
    }
  } catch { /* use default title */ }

  const config = DEFAULT_TEMPLATE;

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 1200,
          height: 630,
          backgroundImage: `linear-gradient(135deg, ${config.colors.secondary}, ${config.background.to || '#0f3460'})`,
          color: config.colors.text,
          fontFamily: 'Inter',
          fontSize: 48,
          fontWeight: 700,
          padding: 96,
          textAlign: 'center',
        }}
      >
        {title}
      </div>
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
