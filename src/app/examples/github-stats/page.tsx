import GitHubCard from "@/components/GitHubCard";

export default function Page() {
  const username = "H0ussamCl4p";
  return (
    <main className="p-8">
      <h1 className="text-2xl font-semibold mb-4">GitHub stats example</h1>

      <section className="mb-8">
        <GitHubCard username={username} />
      </section>

      <section>
        <h2 className="text-lg font-medium mb-2">Image cards (public)</h2>
        <div className="flex flex-wrap gap-4">
          <img
            src={`https://github-readme-stats.vercel.app/api?username=${username}&show_icons=true`}
            alt="github-stats"
          />
          <img
            src={`https://github-readme-stats.vercel.app/api/top-langs/?username=${username}&layout=compact`}
            alt="top-langs"
          />
          <img
            src={`https://streak-stats.demolab.com?user=${username}`}
            alt="streak-stats"
          />
          <img src={`https://ghchart.rshah.org/${username}`} alt="gh-chart" />
        </div>
      </section>
    </main>
  );
}
