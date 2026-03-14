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
  const config = DEFAULT_TEMPLATE;

  let name = 'Volleyball Club';
  let description = '';
  try {
    const res = await fetch(`${INTERNAL_API_URL}/clubs/v1/clubs/${id}`, {
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const data = await res.json();
      name = data.name || name;
      description = data.description || '';
    }
  } catch { /* use defaults */ }

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
          backgroundImage: `linear-gradient(135deg, ${config.colors.secondary}, ${config.background.to || '#0f3460'})`,
          color: config.colors.text,
          fontFamily: 'Inter',
          padding: 96,
          textAlign: 'center',
          gap: 16,
        }}
      >
        <span style={{ fontSize: 56, fontWeight: 800 }}>{name}</span>
        {description && (
          <span style={{ fontSize: 24, opacity: 0.6, maxWidth: '80%' }}>{description}</span>
        )}
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
