// Summarize GitHub REST metrics into compact numbers for frontend consumption
function summarizeMetrics({ commitActivity = [], contributors = [], participation = null } = {}) {
  // commitActivity: [{ total: number, week: number, days: [..] }, ...]
  const totalCommitsLastYear = Array.isArray(commitActivity)
    ? commitActivity.reduce((sum, w) => sum + (w?.total ?? 0), 0)
    : 0;

  // contributors: [{ total: number, author: { login } }, ...]
  const flatContribs = Array.isArray(contributors)
    ? contributors.map((c) => ({ login: c?.author?.login || c?.login || '<unknown>', total: c?.total || 0 }))
    : [];

  const topContributors = flatContribs
    .slice()
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  // participation: { all: [weekCounts], owner: [weekCounts] }
  let participationOwner = 0;
  let participationAll = 0;
  if (participation && typeof participation === 'object') {
    const all = Array.isArray(participation.all) ? participation.all : [];
    const owner = Array.isArray(participation.owner) ? participation.owner : [];
    participationAll = all.reduce((s, n) => s + (Number(n) || 0), 0);
    participationOwner = owner.reduce((s, n) => s + (Number(n) || 0), 0);
  }

  return {
    totalCommitsLastYear,
    topContributors,
    participationAll,
    participationOwner,
  };
}

module.exports = { summarizeMetrics };
