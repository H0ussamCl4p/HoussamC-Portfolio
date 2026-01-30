import FeaturedProjectsClient from "./FeaturedProjects.client";

interface ProjectSummary {
  slug: string;
  title: string;
  summary: string;
  image?: string;
  publishedAt: string;
  images?: string[];
  team?: Array<{ name: string; avatar: string }>;
}

interface FeaturedProjectsProps {
  count?: number;
  exclude?: string[];
}

async function fetchDriveProjects(): Promise<ProjectSummary[]> {
  try {
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NODE_ENV === "development"
        ? "http://localhost:3000"
        : "";

    const response = await fetch(`${baseUrl}/api/drive-projects`, {
      next: { revalidate: 300 },
    });

    if (!response.ok) return [];

    const data = await response.json();
    return data.projects || [];
  } catch (error) {
    console.error("Error fetching Drive projects:", error);
    return [];
  }
}

export default async function FeaturedProjects({
  count = 3,
  exclude = [],
}: FeaturedProjectsProps) {
  const allProjects = await fetchDriveProjects();
  
  const filteredProjects = allProjects
    .filter((p) => !exclude.includes(p.slug))
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    )
    .slice(0, count);

  // Transform to the format expected by client component
  const projects = filteredProjects.map((p) => ({
    slug: p.slug,
    content: "",
    metadata: {
      title: p.title,
      summary: p.summary,
      publishedAt: p.publishedAt,
      images: p.images || [],
      image: p.image,
      team: p.team,
    },
  }));

  return <FeaturedProjectsClient projects={projects} />;
}
