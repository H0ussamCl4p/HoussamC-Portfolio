"use client";

import React, { useRef } from "react";
import { Column, Row, Button, Heading } from "@once-ui-system/core";
import { ProjectCard } from "@/components";

type Post = {
  slug: string;
  metadata: any;
  content?: string;
};

interface Props {
  projects: Post[];
}

export default function FeaturedProjectsClient({ projects }: Props) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  function scroll(dir: number) {
    if (!scrollerRef.current) return;
    const w = scrollerRef.current.clientWidth;
    scrollerRef.current.scrollBy({
      left: dir * Math.round(w * 0.8),
      behavior: "smooth",
    });
  }

  return (
    <Column fillWidth gap="xl" paddingX="l" marginBottom="40">
      <Row fillWidth paddingRight="64">
        <Heading as="h2" variant="display-strong-xs" wrap="balance">
          Projects showcase
        </Heading>
      </Row>

      <Row gap="12" paddingLeft="l" paddingTop="24" horizontal="center">
        <Button variant="secondary" size="s" onClick={() => scroll(-1)}>
          ‹
        </Button>

        <div
          ref={scrollerRef}
          style={{
            display: "flex",
            gap: 24,
            overflowX: "auto",
            scrollSnapType: "x mandatory",
            paddingBottom: 8,
            WebkitOverflowScrolling: "touch",
          }}
        >
          {projects.map((post) => (
            <div
              key={post.slug}
              style={{
                minWidth: 320,
                maxWidth: 960,
                scrollSnapAlign: "center",
              }}
            >
              <ProjectCard
                priority={false}
                href={`work/${post.slug}`}
                images={post.metadata.images}
                title={post.metadata.title}
                description={post.metadata.summary}
                content={post.content || ""}
                avatars={(post.metadata.team || []).map((m: unknown) => {
                  const member = m as { avatar?: string };
                  return { src: member?.avatar || "/images/avatar.jpg" };
                })}
                link={post.metadata.link || ""}
              />
            </div>
          ))}
        </div>

        <Button variant="secondary" size="s" onClick={() => scroll(1)}>
          ›
        </Button>
      </Row>
    </Column>
  );
}
