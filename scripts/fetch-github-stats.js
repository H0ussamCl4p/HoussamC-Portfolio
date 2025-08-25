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

  if (!fs.existsSync('public')) fs.mkdirSync('public');
    fs.writeFileSync('public/github-stats.json', JSON.stringify(result, null, 2));
    console.log('Wrote public/github-stats.json');
  } catch (err) {
    console.error('Failed to fetch GitHub stats', err);
    process.exit(1);
  }
}

run();
