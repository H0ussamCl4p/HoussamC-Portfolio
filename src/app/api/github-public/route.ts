import { NextResponse } from 'next/server';
import { fetchGitHubPublic } from '@/lib/github-public';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const u = url.searchParams.get('u') || url.searchParams.get('username');
  if (!u) return NextResponse.json({ error: 'missing username param (u)' }, { status: 400 });

  try {
    const res = await fetchGitHubPublic(u);
    if (res.status === 429) {
      // rate limited — return friendly message and cache briefly
      const body = { error: 'rate_limited', message: res.message || 'GitHub rate limit exceeded' };
      return new NextResponse(JSON.stringify(body), { status: 429, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' } });
    }
    if (!res.data) return NextResponse.json({ error: res.message || 'failed' }, { status: res.status });

    const headers = {
      'Content-Type': 'application/json',
      // edge caching: cache at CDN for 1 hour, allow stale revalidate window
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=600',
    };

    return new NextResponse(JSON.stringify(res.data), { status: 200, headers });
  } catch (e) {
    return NextResponse.json({ error: 'internal_error', detail: (e as Error).message }, { status: 500 });
  }
}
