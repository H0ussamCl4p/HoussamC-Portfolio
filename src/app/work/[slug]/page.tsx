import { notFound } from "next/navigation";
import { getPosts } from "@/utils/utils";
import { fetchDriveMdx } from "@/lib/rust-api";
import {
  Meta,
  Schema,
  AvatarGroup,
  Column,
  Heading,
  Media,
  Text,
  SmartLink,
  Row,
  Line,
} from "@once-ui-system/core";
import { baseURL, about, person, work } from "@/resources";
import { formatDate } from "@/utils/formatDate";
import { ScrollToHash, CustomMDX } from "@/components";
import { Metadata } from "next";
import { Projects } from "@/components/work/Projects";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ISR Configuration - Revalidate content hourly
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const revalidate = 3600; // 1 hour

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const posts = getPosts(["src", "app", "work", "projects"]);
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string | string[] }>;
}): Promise<Metadata> {
  const routeParams = await params;
  const slugPath = Array.isArray(routeParams.slug)
    ? routeParams.slug.join("/")
    : routeParams.slug || "";

  // Try Google Drive first (category: projects)
  const driveContent = await fetchDriveMdx("projects", slugPath);

  if (driveContent.status === "success" && driveContent.data) {
    return Meta.generate({
      title: driveContent.data.metadata.title,
      description: driveContent.data.metadata.summary,
      baseURL: baseURL,
      image:
        driveContent.data.metadata.image ||
        `/api/og/generate?title=${encodeURIComponent(driveContent.data.metadata.title)}`,
      path: `${work.path}/${slugPath}`,
    });
  }

  // Fall back to local MDX
  const posts = getPosts(["src", "app", "work", "projects"]);
  const post = posts.find((post) => post.slug === slugPath);

  if (!post) return {};

  return Meta.generate({
    title: post.metadata.title,
    description: post.metadata.summary,
    baseURL: baseURL,
    image: post.metadata.image || `/api/og/generate?title=${post.metadata.title}`,
    path: `${work.path}/${post.slug}`,
  });
}

export default async function Project({
  params,
}: {
  params: Promise<{ slug: string | string[] }>;
}) {
  const routeParams = await params;
  const slugPath = Array.isArray(routeParams.slug)
    ? routeParams.slug.join("/")
    : routeParams.slug || "";

  // ─── Try Google Drive content first (category: projects) ───
  const driveContent = await fetchDriveMdx("projects", slugPath);

  if (driveContent.status === "success" && driveContent.data) {
    const post = driveContent.data;
    const avatars =
      post.metadata.team?.map((p) => ({
        src: p.avatar,
      })) || [];

    return (
      <ProjectContent
        slug={slugPath}
        title={post.metadata.title}
        summary={post.metadata.summary}
        publishedAt={post.metadata.publishedAt}
        images={post.metadata.images}
        team={post.metadata.team}
        content={post.content}
        avatars={avatars}
      />
    );
  }

  // Handle Drive errors (only log actual errors, not "not-found")
  if (driveContent.status === "error") {
    console.error(`Drive fetch error for ${slugPath}:`, driveContent.error);
  }

  // ─── Fall back to local MDX files ───
  const post = getPosts(["src", "app", "work", "projects"]).find(
    (post) => post.slug === slugPath,
  );

  if (!post) {
    notFound();
  }

  const avatars =
    post.metadata.team?.map((p) => ({
      src: p.avatar,
    })) || [];

  return (
    <ProjectContent
      slug={post.slug}
      title={post.metadata.title}
      summary={post.metadata.summary}
      publishedAt={post.metadata.publishedAt}
      images={post.metadata.images}
      team={post.metadata.team}
      content={post.content}
      avatars={avatars}
    />
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SHARED CONTENT COMPONENT - Fixed heights for CLS = 0
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
interface ProjectContentProps {
  slug: string;
  title: string;
  summary: string;
  publishedAt: string;
  images: string[];
  team?: Array<{ name: string; avatar: string; linkedIn: string }>;
  content: string;
  avatars: Array<{ src: string }>;
}

function ProjectContent({
  slug,
  title,
  summary,
  publishedAt,
  images,
  team,
  content,
  avatars,
}: ProjectContentProps) {
  return (
    <Column as="section" maxWidth="m" horizontal="center" gap="l">
      <Schema
        as="blogPosting"
        baseURL={baseURL}
        path={`${work.path}/${slug}`}
        title={title}
        description={summary}
        datePublished={publishedAt}
        dateModified={publishedAt}
        image={images[0] || `/api/og/generate?title=${encodeURIComponent(title)}`}
        author={{
          name: person.name,
          url: `${baseURL}${about.path}`,
          image: `${baseURL}${person.avatar}`,
        }}
      />

      {/* Header Section - Fixed min-height to prevent CLS */}
      <Column
        maxWidth="s"
        gap="16"
        horizontal="center"
        align="center"
        style={{ minHeight: "180px" }}
      >
        <SmartLink href="/work">
          <Text variant="label-strong-m">Projects</Text>
        </SmartLink>
        <Text variant="body-default-xs" onBackground="neutral-weak" marginBottom="12">
          {publishedAt && formatDate(publishedAt)}
        </Text>
        <Heading variant="display-strong-m">{title}</Heading>
      </Column>

      {/* Team Section - Fixed min-height */}
      <Row
        marginBottom="32"
        horizontal="center"
        style={{ minHeight: team && team.length > 0 ? "48px" : "0" }}
      >
        {team && team.length > 0 && (
          <Row gap="16" vertical="center">
            <AvatarGroup reverse avatars={avatars} size="s" />
            <Text variant="label-default-m" onBackground="brand-weak">
              {team.map((member, idx) => (
                <span key={idx}>
                  {idx > 0 && (
                    <Text as="span" onBackground="neutral-weak">
                      ,{" "}
                    </Text>
                  )}
                  <SmartLink href={member.linkedIn}>{member.name}</SmartLink>
                </span>
              ))}
            </Text>
          </Row>
        )}
      </Row>

      {/* Hero Image - Fixed aspect ratio for CLS prevention */}
      {images.length > 0 && (
        <div style={{ aspectRatio: "16 / 9", width: "100%" }}>
          <Media priority aspectRatio="16 / 9" radius="m" alt={title} src={images[0]} />
        </div>
      )}

      {/* Content Section */}
      <Column style={{ margin: "auto" }} as="article" maxWidth="xs">
        <CustomMDX source={content} />
      </Column>

      {/* Related Projects */}
      <Column fillWidth gap="40" horizontal="center" marginTop="40">
        <Line maxWidth="40" />
        <Heading as="h2" variant="heading-strong-xl" marginBottom="24">
          Related projects
        </Heading>
        <Projects exclude={[slug]} range={[2]} />
      </Column>

      <ScrollToHash />
    </Column>
  );
}
