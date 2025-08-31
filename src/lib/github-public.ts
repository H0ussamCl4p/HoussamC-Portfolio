// GitHub helper removed.
// The repository previously included helpers to fetch public GitHub data.
// That functionality has been removed; keep lightweight types for compatibility.
export type PublicGitHubPayload = Record<string, unknown>;

export async function fetchGitHubPublic(_username: string): Promise<{ data?: PublicGitHubPayload; status: number; message?: string }> {
  return { status: 410, message: 'GitHub helper removed' };
}
