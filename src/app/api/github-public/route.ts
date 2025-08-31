import { NextResponse } from 'next/server';

// Endpoint removed: keep a small 410 response to signal it's gone while avoiding 404 noise.
export async function GET() {
  return NextResponse.json({ error: 'gone', message: 'The /api/github-public endpoint has been removed from this project.' }, { status: 410 });
}
