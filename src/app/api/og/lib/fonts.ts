// frontend/src/app/api/og/lib/fonts.ts

let cachedFonts: { name: string; data: ArrayBuffer; weight: 700 | 400 }[] | null = null;

export async function getFonts() {
  if (cachedFonts) return cachedFonts;

  // Use fetch to load font files from the public directory
  // This works in both Turbopack and Webpack contexts
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const [boldRes, regularRes] = await Promise.all([
    fetch(`${baseUrl}/fonts/Inter-Bold.ttf`),
    fetch(`${baseUrl}/fonts/Inter-Regular.ttf`),
  ]);

  const [boldData, regularData] = await Promise.all([
    boldRes.arrayBuffer(),
    regularRes.arrayBuffer(),
  ]);

  cachedFonts = [
    { name: 'Inter', data: boldData, weight: 700 },
    { name: 'Inter', data: regularData, weight: 400 },
  ];

  return cachedFonts;
}
