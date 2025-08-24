import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const user = searchParams.get('user');
  const year = searchParams.get('year') || new Date().getFullYear().toString();

  if (!user) {
    return NextResponse.json({ error: 'missing user parameter' }, { status: 400 });
  }

  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return NextResponse.json({ error: 'GITHUB_TOKEN not set on server' }, { status: 500 });
  }

  const from = `${year}-01-01T00:00:00Z`;
  const to = `${year}-12-31T23:59:59Z`;

  const query = `query($login:String!, $from: DateTime!, $to: DateTime!) {
    user(login: $login) {
      contributionsCollection(from: $from, to: $to) {
        contributionCalendar { totalContributions }
        totalCommitContributions
        totalPullRequestContributions
        totalIssueContributions
        contributedRepositories(first: 1) { totalCount }
      }
    }
  }`;

  try {
    const resp = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ query, variables: { login: user, from, to } }),
    });

    if (!resp.ok) {
      const text = await resp.text();
      return NextResponse.json({ error: 'GitHub GraphQL error', detail: text }, { status: resp.status });
    }

    const json = await resp.json();
    const coll = json?.data?.user?.contributionsCollection;
    if (!coll) {
      return NextResponse.json({ error: 'no contribution data' }, { status: 404 });
    }

    const result = {
      totalContributions: coll.contributionCalendar?.totalContributions ?? 0,
      totalCommitContributions: coll.totalCommitContributions ?? 0,
      totalPullRequestContributions: coll.totalPullRequestContributions ?? 0,
      totalIssueContributions: coll.totalIssueContributions ?? 0,
      contributedRepositoriesCount: coll.contributedRepositories?.totalCount ?? 0,
    };

    return NextResponse.json(result);
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: 'request failed', detail }, { status: 500 });
  }
}
