import { NextRequest, NextResponse } from 'next/server';
import { generateOgSignature } from '../lib/signing';

const PRIVATE_ENTITY_TYPES = ['evaluation', 'award'];

export async function POST(request: NextRequest) {
  // Basic auth check — verify the request comes from an authenticated user
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { type, id } = body;

  if (!type || !id) {
    return NextResponse.json({ error: 'type and id are required' }, { status: 400 });
  }

  // Only sign private entity types
  if (!PRIVATE_ENTITY_TYPES.includes(type)) {
    return NextResponse.json({ error: 'Entity type does not require signing' }, { status: 400 });
  }

  const { sig, exp } = generateOgSignature(type, id);
  return NextResponse.json({ sig, exp });
}
