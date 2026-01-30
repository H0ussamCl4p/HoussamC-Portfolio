import { BlogSkeleton } from "@/app/work/[slug]/loading";

/**
 * Blog post loading skeleton
 * Uses the category-specific skeleton from the shared loading module
 */
export default function BlogLoading() {
  return <BlogSkeleton />;
}
