const fs = require('node:fs');

async function run() {
  const debug = process.argv.includes('--debug');
  // Use GITHUB_TOKEN (provided by GitHub Actions) if available. No user PAT required.
  const token = process.env.GITHUB_TOKEN;
  const user = process.env.GITHUB_STATS_USER || process.env.GITHUB_ACTOR || 'H0ussamCl4p';
  const year = process.env.YEAR || new Date().getFullYear();

  if (!token) {
    console.warn('No GitHub token provided (GITHUB_TOKEN). Skipping stats generation; will rely on badge images or artifact.');
    process.exit(0);
  }

  const from = `${year}-01-01T00:00:00Z`;
  const to = `${year}-12-31T23:59:59Z`;

  // Also fetch the authenticated viewer so we can detect if the provided token
  // belongs to the same user (private contributions require the owner's token).
  // Query stable fields from ContributionsCollection. The schema no longer
  // exposes `contributedRepositories` on ContributionsCollection in some
  // API versions; avoid requesting it to prevent GraphQL errors.
  const query = `query($login:String!, $from: DateTime!, $to: DateTime!) {
    viewer { login }
    user(login: $login) {
      contributionsCollection(from: $from, to: $to) {
        contributionCalendar { totalContributions }
        totalCommitContributions
        totalPullRequestContributions
        totalIssueContributions
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
      throw new Error(`GraphQL error: ${resp.status} ${text}`);
    }

    const json = await resp.json();
    if (debug) {
      console.log('--- GraphQL raw response ---');
      console.log(JSON.stringify(json, null, 2));
    }
    const viewer = json?.data?.viewer?.login;
    const coll = json?.data?.user?.contributionsCollection;
    if (debug) {
      console.log('viewer:', viewer, 'requested user:', user);
      if (viewer && viewer !== user) {
        console.log('Note: the token belongs to a different account than the requested user. Private contributions will not be included.');
      }
    }

    const result = {
      generatedAt: new Date().toISOString(),
      user,
      year,
      totalContributions: coll?.contributionCalendar?.totalContributions ?? 0,
      totalCommitContributions: coll?.totalCommitContributions ?? 0,
      totalPullRequestContributions: coll?.totalPullRequestContributions ?? 0,
      totalIssueContributions: coll?.totalIssueContributions ?? 0,
      // ContributionsCollection no longer exposes contributedRepositories in
      // some API versions; keep a safe numeric fallback.
      contributedRepositoriesCount: 0,
    };

    // fetch repo-level stats for this repo as well
    const owner = process.env.GITHUB_STATS_OWNER || user;
    const repoName = process.env.GITHUB_STATS_REPO || 'magic-portfolio';
    const repoUrl = `https://api.github.com/repos/${owner}/${repoName}`;
    const repoResp = await fetch(repoUrl, {
      headers: { Authorization: `token ${token}`, 'User-Agent': 'magic-portfolio' },
    });
    if (repoResp.ok) {
      const repoJson = await repoResp.json();
      if (debug) {
        console.log('--- Repo REST response ---');
        console.log(JSON.stringify(repoJson, null, 2));
      }
      result.repo = {
        stars: repoJson.stargazers_count ?? 0,
        forks: repoJson.forks_count ?? 0,
        watchers: repoJson.watchers_count ?? 0,
      };
    }
  
      // Fetch repository metrics using the REST Metrics endpoints.
      // Note: these endpoints are computed and may return 202 Accepted initially.
      async function fetchWithRetry(url, opts = {}, maxAttempts = 6) {
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
          const r = await fetch(url, opts);
          if (r.status === 202) {
            // still being generated, wait and retry
            const waitMs = Math.min(3000, 500 * (2 ** attempt));
            if (debug) console.log(`Stats endpoint ${url} returned 202, retrying in ${waitMs}ms (attempt ${attempt})`);
            await new Promise((res) => setTimeout(res, waitMs));
            continue;
          }
          if (!r.ok) {
            const txt = await r.text();
            throw new Error(`REST stats error ${r.status}: ${txt}`);
          }
          return r.json();
        }
        throw new Error(`Stats endpoint ${url} did not become ready after ${maxAttempts} attempts`);
      }

      try {
        const base = `https://api.github.com/repos/${owner}/${repoName}`;
        // commit activity (last year, weekly)
        const commitActivity = await fetchWithRetry(`${base}/stats/commit_activity`, {
          headers: { Authorization: `token ${token}`, 'User-Agent': 'magic-portfolio' },
        });

        // contributors aggregate (each contributor with total and weeks)
        const contributorsStats = await fetchWithRetry(`${base}/stats/contributors`, {
          headers: { Authorization: `token ${token}`, 'User-Agent': 'magic-portfolio' },
        });

        // participation (weekly commit counts for owner and all)
        const participation = await fetchWithRetry(`${base}/stats/participation`, {
          headers: { Authorization: `token ${token}`, 'User-Agent': 'magic-portfolio' },
        });

        // attach metrics to the repo object
        result.repo = result.repo || {};
        result.repo.metrics = {
          commitActivity: Array.isArray(commitActivity) ? commitActivity : [],
          contributors: Array.isArray(contributorsStats) ? contributorsStats : [],
          participation: participation || null,
        };
        if (debug) {
          console.log('Fetched REST metrics: commitActivity length=', (result.repo.metrics.commitActivity||[]).length);
          console.log('contributors count=', (result.repo.metrics.contributors||[]).length);
          console.log('participation=', result.repo.metrics.participation);
        }
      } catch (e) {
        // don't fail the whole generation if metrics endpoints are temporarily unavailable
    console.warn('Could not fetch REST metrics:', e?.message ?? e);
      }

  if (!fs.existsSync('public')) fs.mkdirSync('public');
    fs.writeFileSync('public/github-stats.json', JSON.stringify(result, null, 2));
    console.log('Wrote public/github-stats.json');
  } catch (err) {
    console.error('Failed to fetch GitHub stats', err);
    process.exit(1);
  }
}

run();
