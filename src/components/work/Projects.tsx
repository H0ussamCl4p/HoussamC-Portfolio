import { Column } from "@once-ui-system/core";
import { ProjectCard } from "@/components";

interface ProjectSummary {
  slug: string;
  title: string;
  summary: string;
  image?: string;
  publishedAt: string;
  images?: string[];
  team?: Array<{ name: string; avatar: string }>;
}

interface ProjectsProps {
  range?: [number, number?];
  exclude?: string[];
  showEmptyState?: boolean;
}

async function fetchDriveProjects(): Promise<ProjectSummary[]> {
  try {
    // Use absolute URL for server-side fetch
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NODE_ENV === "development"
        ? "http://localhost:3000"
        : "";

    // During local production builds there is no server to fetch from.
    if (!baseUrl) {
      return [];
    }

    const response = await fetch(`${baseUrl}/api/drive-projects`, {
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      console.error("Failed to fetch Drive projects:", await response.text());
      return [];
    }

    const data = await response.json();
    return data.projects || [];
  } catch (error) {
    console.error("Error fetching Drive projects:", error);
    return [];
  }
}

export async function Projects({ range, exclude, showEmptyState = true }: ProjectsProps) {
  let allProjects = await fetchDriveProjects();

  // Exclude by slug (exact match)
  if (exclude && exclude.length > 0) {
    allProjects = allProjects.filter((project) => !exclude.includes(project.slug));
  }

  const sortedProjects = allProjects.sort((a, b) => {
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  });

  const displayedProjects = range
    ? sortedProjects.slice(range[0] - 1, range[1] ?? sortedProjects.length)
    : sortedProjects;

  if (displayedProjects.length === 0) {
    if (!showEmptyState) return null;

    return (
      <Column fillWidth gap="l" paddingX="l">
        <p style={{ textAlign: "center", opacity: 0.6 }}>
          No projects found. Add projects to your Google Drive folder.
        </p>
      </Column>
    );
  }

  return (
    <Column fillWidth gap="xl" marginBottom="40" paddingX="l">
      {displayedProjects.map((project, index) => (
        <ProjectCard
          priority={index < 2}
          key={project.slug}
          href={`work/${project.slug}`}
          images={project.images || (project.image ? [project.image] : [])}
          title={project.title}
          description={project.summary}
          content=""
          avatars={project.team?.map((member) => ({ src: member.avatar })) || []}
          link=""
        />
      ))}
    </Column>
  );
}
