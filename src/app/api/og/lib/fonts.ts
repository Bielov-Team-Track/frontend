// frontend/src/app/api/og/lib/fonts.ts
import 'server-only';
import { readFile } from 'fs/promises';
import { join } from 'path';

// Font ArrayBuffers loaded once at module scope, reused across all requests.
const fontsDir = join(process.cwd(), 'public', 'fonts');

const interBoldPromise = readFile(join(fontsDir, 'Inter-Bold.ttf'));
const interRegularPromise = readFile(join(fontsDir, 'Inter-Regular.ttf'));

export async function getFonts() {
  const [interBold, interRegular] = await Promise.all([
    interBoldPromise,
    interRegularPromise,
  ]);

  return [
    { name: 'Inter', data: interBold, weight: 700 as const },
    { name: 'Inter', data: interRegular, weight: 400 as const },
  ];
}
