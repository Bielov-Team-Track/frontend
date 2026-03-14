import { ImageResponse } from 'next/og';
import { getFonts } from '@/app/api/og/lib/fonts';
import { DEFAULT_TEMPLATE } from '@/app/api/og/lib/template-config';
import { ClubTemplate } from '@/app/api/og/templates/ClubTemplate';

export const runtime = 'nodejs';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const INTERNAL_API_URL = process.env.INTERNAL_API_URL || 'http://localhost:8000';

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const fonts = await getFonts();

  let clubData = { name: 'Volleyball Club' } as Record<string, unknown>;
  try {
    const res = await fetch(`${INTERNAL_API_URL}/clubs/v1/clubs/${id}`, {
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      clubData = await res.json();
    }
  } catch { /* use defaults */ }

  return new ImageResponse(
    (
      <ClubTemplate
        data={{
          name: String(clubData.name || 'Volleyball Club'),
          description: clubData.description as string | undefined,
          memberCount: clubData.memberCount as number | undefined,
          logoUrl: clubData.logoUrl as string | undefined,
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
