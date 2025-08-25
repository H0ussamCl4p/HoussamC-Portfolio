GitHub public stats (no tokens)

This project includes a simple public-only GitHub stats integration that uses unauthenticated GitHub REST endpoints and caches at the edge.

Usage

- API: /api/github-public?u=USERNAME

  - Returns: { login, name, avatar_url, bio, followers, public_repos, total_stars, repos_count }
  - Caching: responses are cached at the edge for 1 hour (s-maxage=3600)

- Component: `src/components/GitHubCard.tsx`
  - Usage: <GitHubCard username="H0ussamCl4p" />
  - Shows avatar, name, @username, bio, followers, public repos, total stars.

Notes & rate limits

- This approach does not use any tokens or secrets. It relies on public GitHub endpoints and is therefore subject to unauthenticated rate limits (~60 requests per hour per IP).
- The server-side API route applies caching headers to reduce requests to GitHub. If the rate limit is exceeded, the API responds with 429 and a friendly message.
- Stars are summed across up to 100 public repos (per_page=100). For users with more than 100 repos, this is an approximation.

SEO

- The API route returns JSON only. If you need server-rendered SEO content, consider running a server-side job (CI) to generate a static artifact and include it in your site.
