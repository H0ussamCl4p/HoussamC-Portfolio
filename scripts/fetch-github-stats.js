const fs = require('node:fs');

async function run() {
  const token = process.env.GITHUB_TOKEN;
  const user = process.env.GITHUB_STATS_USER || 'H0ussamCl4p';
  const year = process.env.YEAR || new Date().getFullYear();

  if (!token) {
    console.error('GITHUB_TOKEN not provided');
    process.exit(1);
  }

  const from = `${year}-01-01T00:00:00Z`;
  const to = `${year}-12-31T23:59:59Z`;

  const query = 'query($login:String!, $from: DateTime!, $to: DateTime!) { user(login: $login) { contributionsCollection(from: $from, to: $to) { contributionCalendar { totalContributions } totalCommitContributions totalPullRequestContributions totalIssueContributions contributedRepositories(first: 1) { totalCount } } } }';

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
    const coll = json?.data?.user?.contributionsCollection;

    const result = {
      generatedAt: new Date().toISOString(),
      user,
      year,
      totalContributions: coll?.contributionCalendar?.totalContributions ?? 0,
      totalCommitContributions: coll?.totalCommitContributions ?? 0,
      totalPullRequestContributions: coll?.totalPullRequestContributions ?? 0,
      totalIssueContributions: coll?.totalIssueContributions ?? 0,
      contributedRepositoriesCount: coll?.contributedRepositories?.totalCount ?? 0,
    };

    // fetch repo-level stats for this repo as well
    const repoResp = await fetch('https://api.github.com/repos/once-ui-system/magic-portfolio', {
      headers: { Authorization: `token ${token}`, 'User-Agent': 'magic-portfolio' },
    });
    if (repoResp.ok) {
      const repoJson = await repoResp.json();
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
