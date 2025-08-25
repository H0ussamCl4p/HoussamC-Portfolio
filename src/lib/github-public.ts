// Lightweight helper to fetch public GitHub user and repo data without auth.
export type PublicGitHubPayload = {
  login: string;
  name?: string | null;
  avatar_url?: string | null;
  bio?: string | null;
  followers?: number;
  public_repos?: number;
  total_stars?: number;
  repos_count?: number;
  rateLimitRemaining?: number | null;
};

export async function fetchGitHubPublic(username: string): Promise<{ data?: PublicGitHubPayload; status: number; message?: string }> {
  const headers = { Accept: 'application/vnd.github+json' };
  const userUrl = `https://api.github.com/users/${encodeURIComponent(username)}`;
  const reposUrl = `https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=100&sort=updated`;

  // Fetch user
  const userRes = await fetch(userUrl, { headers });
  const rateRemaining = userRes.headers.get('x-ratelimit-remaining');

  if (userRes.status === 404) return { status: 404, message: 'GitHub user not found' };
  if (userRes.status === 403 && rateRemaining === '0') return { status: 429, message: 'GitHub rate limit exceeded' };
  if (!userRes.ok) return { status: userRes.status, message: `Failed to fetch user: ${userRes.statusText}` };

  const userJson = await userRes.json();

  // Fetch repos (public only)
  const reposRes = await fetch(reposUrl, { headers });
  if (reposRes.status === 403 && reposRes.headers.get('x-ratelimit-remaining') === '0') {
    return { status: 429, message: 'GitHub rate limit exceeded' };
  }

  const reposJson = reposRes.ok ? await reposRes.json() : [];

  // Sum stars across returned repos (note: per_page=100; if a user has >100 public repos this is an approximation)
  let totalStars = 0;
  if (Array.isArray(reposJson)) {
    totalStars = reposJson.reduce((s: number, r: unknown) => {
      const repoObj = r as (Record<string, unknown> & { stargazers_count?: unknown }) | null;
      const raw = repoObj?.stargazers_count;
      const count = typeof raw === 'number' ? raw : raw != null ? Number(String(raw)) || 0 : 0;
      return s + count;
    }, 0);
  }

  const payload: PublicGitHubPayload = {
    login: userJson.login,
    name: userJson.name ?? null,
    avatar_url: userJson.avatar_url ?? null,
    bio: userJson.bio ?? null,
    followers: userJson.followers ?? 0,
    public_repos: userJson.public_repos ?? 0,
    total_stars: totalStars,
    repos_count: Array.isArray(reposJson) ? reposJson.length : 0,
    rateLimitRemaining: rateRemaining ? Number(rateRemaining) : null,
  };

  return { status: 200, data: payload };
}
