"use client";

import React, { useEffect, useState } from "react";

type Props = { username: string };

type Payload = {
  login: string;
  name?: string | null;
  avatar_url?: string | null;
  bio?: string | null;
  followers?: number;
  public_repos?: number;
  total_stars?: number;
  repos_count?: number;
};

export default function GitHubCard({ username }: Props) {
  const [data, setData] = useState<Payload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetch(`/api/github-public?u=${encodeURIComponent(username)}`)
      .then(async (r) => {
        if (!r.ok) {
          const json = await r.json().catch(() => ({}));
          setError(json?.message || json?.error || `status:${r.status}`);
          return null;
        }
        return r.json();
      })
      .then((json) => {
        if (!mounted) return;
        if (json) setData(json as Payload);
      })
      .catch((e: unknown) => {
        const msg = e instanceof Error ? e.message : String(e);
        setError(msg);
      })
      .finally(() => setLoading(false));
    return () => {
      mounted = false;
    };
  }, [username]);

  if (loading)
    return (
      <div className="p-4 rounded-lg bg-gray-900 text-gray-100">Loading...</div>
    );
  if (error)
    return (
      <div className="p-4 rounded-lg bg-yellow-900 text-yellow-100">
        {error}
      </div>
    );
  if (!data) return null;

  return (
    <article
      className="max-w-sm bg-gray-900 text-gray-100 rounded-lg p-4 shadow-lg"
      aria-label={`GitHub card for ${data.login}`}
    >
      <header className="flex items-center gap-3">
        <img
          src={data.avatar_url || ""}
          alt={`${data.login} avatar`}
          className="w-14 h-14 rounded-full object-cover"
        />
        <div>
          <div className="font-semibold text-lg">{data.name || data.login}</div>
          <div className="text-sm text-gray-400">@{data.login}</div>
        </div>
      </header>

      {data.bio && <p className="mt-3 text-sm text-gray-300">{data.bio}</p>}

      <dl className="mt-4 grid grid-cols-3 gap-3 text-center">
        <div>
          <dt className="text-xs text-gray-400">Followers</dt>
          <dd className="font-medium">{data.followers ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-xs text-gray-400">Public repos</dt>
          <dd className="font-medium">{data.public_repos ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-xs text-gray-400">Total stars</dt>
          <dd className="font-medium">{data.total_stars ?? "—"}</dd>
        </div>
      </dl>

      <div className="mt-4 flex gap-2">
        <a
          className="text-xs px-2 py-1 rounded bg-gray-800 hover:bg-gray-700"
          href={`https://github.com/${data.login}`}
          target="_blank"
          rel="noreferrer"
        >
          View on GitHub
        </a>
        <a
          className="text-xs px-2 py-1 rounded bg-gray-800 hover:bg-gray-700"
          href={`https://github.com/${data.login}?tab=repositories`}
          target="_blank"
          rel="noreferrer"
        >
          Repositories
        </a>
      </div>
    </article>
  );
}
