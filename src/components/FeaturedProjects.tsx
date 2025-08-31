import { getPosts } from "@/utils/utils";
import FeaturedProjectsClient from "./FeaturedProjects.client";

interface FeaturedProjectsProps {
  count?: number;
  exclude?: string[];
}

export default function FeaturedProjects({
  count = 3,
  exclude = [],
}: FeaturedProjectsProps) {
  const allProjects = getPosts(["src", "app", "work", "projects"]).filter(
    (p) => !exclude.includes(p.slug)
  );

  const projects = allProjects
    .sort(
      (a, b) =>
        new Date(b.metadata.publishedAt).getTime() -
        new Date(a.metadata.publishedAt).getTime()
    )
    .slice(0, count);

  return <FeaturedProjectsClient projects={projects} />;
}
