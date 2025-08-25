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

  const result: Record<string, unknown> = {
      totalContributions: coll.contributionCalendar?.totalContributions ?? 0,
      totalCommitContributions: coll.totalCommitContributions ?? 0,
      totalPullRequestContributions: coll.totalPullRequestContributions ?? 0,
      totalIssueContributions: coll.totalIssueContributions ?? 0,
      contributedRepositoriesCount: coll.contributedRepositories?.totalCount ?? 0,
    };

    // Try to fetch REST metrics for the user's primary repo if specified via env
    let owner = process.env.GITHUB_STATS_OWNER || user;
    let repoName = process.env.GITHUB_STATS_REPO || 'magic-portfolio';
    const repoSlug = process.env.GITHUB_REPOSITORY;
    if (repoSlug?.includes('/')) {
      const parts = repoSlug.split('/');
      owner = parts[0] || owner;
      repoName = parts[1] || repoName;
    }
    const base = `https://api.github.com/repos/${owner}/${repoName}`;

  async function fetchWithRetry(url: string, opts: RequestInit = {}, maxAttempts = 6) {
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        const r = await fetch(url, opts);
        if (r.status === 202) {
          const waitMs = Math.min(3000, 500 * (2 ** attempt));
          await new Promise((res) => setTimeout(res, waitMs));
          continue;
        }
        if (!r.ok) {
          const txt = await r.text();
          throw new Error(`REST stats error ${r.status}: ${txt}`);
        }
        return r.json();
      }
      throw new Error(`Stats endpoint ${url} did not become ready`);
    }

    try {
      // optionally load local summarizer to reduce payload size
  let summarize: ((m: Record<string, unknown>) => Record<string, unknown> | null) | null = null;
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        summarize = require('../../../../scripts/metrics-summary').summarizeMetrics;
      } catch (e) {
        // summarizer not present - it's optional
      }
      const commitActivity = await fetchWithRetry(`${base}/stats/commit_activity`, {
        headers: { Authorization: `token ${token}`, 'User-Agent': 'magic-portfolio' },
      });
      const contributorsStats = await fetchWithRetry(`${base}/stats/contributors`, {
        headers: { Authorization: `token ${token}`, 'User-Agent': 'magic-portfolio' },
      });
      const participation = await fetchWithRetry(`${base}/stats/participation`, {
        headers: { Authorization: `token ${token}`, 'User-Agent': 'magic-portfolio' },
      });

      result.repo = {
        metrics: {
          commitActivity: Array.isArray(commitActivity) ? commitActivity : [],
          contributors: Array.isArray(contributorsStats) ? contributorsStats : [],
          participation: participation ?? null,
        },
      };
      if (summarize) {
        try {
          // attach a compact summary useful for the frontend
          // attach summary in a typed-safe way
          const r = result as Record<string, unknown>;
          const repoObj = r.repo as Record<string, unknown> || {};
          const summary = summarize({
            commitActivity: commitActivity,
            contributors: contributorsStats,
            participation: participation,
          });
          if (summary) repoObj.summary = summary;
          r.repo = repoObj;
        } catch (e) {
          // ignore summarizer errors
        }
      }
    } catch (e) {
      // do not fail if metrics endpoints are delayed; include a warning field
      result.metricsWarning = (e instanceof Error) ? e.message : String(e);
    }

    return NextResponse.json(result);
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: 'request failed', detail }, { status: 500 });
  }
}
