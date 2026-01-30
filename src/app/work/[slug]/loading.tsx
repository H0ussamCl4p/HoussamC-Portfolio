import { Column, Row } from "@once-ui-system/core";

/**
 * Skeleton Loader for Project Page
 * Matches exact layout dimensions to achieve CLS = 0
 *
 * This is the default "projects" skeleton. For category-specific skeletons,
 * use the exported skeleton components in category-specific routes.
 */
export default function ProjectLoading() {
  return <ProjectSkeleton />;
}

/**
 * Projects category skeleton - Large hero image, moderate text
 */
export function ProjectSkeleton() {
  return (
    <Column as="section" maxWidth="m" horizontal="center" gap="l">
      {/* Header Section Skeleton - Fixed height: 180px */}
      <Column
        maxWidth="s"
        gap="16"
        horizontal="center"
        align="center"
        style={{ minHeight: "180px" }}
      >
        {/* Back link skeleton */}
        <div className="skeleton" style={{ width: "80px", height: "20px", borderRadius: "4px" }} />

        {/* Date skeleton */}
        <div
          className="skeleton"
          style={{ width: "120px", height: "16px", borderRadius: "4px", marginBottom: "12px" }}
        />

        {/* Title skeleton - matches display-strong-m */}
        <div
          className="skeleton skeleton--heading-lg"
          style={{
            width: "80%",
            height: "clamp(2.5rem, 1.643rem + 4.286vw, 4rem)",
            borderRadius: "8px",
          }}
        />
      </Column>

      {/* Team Section Skeleton - Fixed height: 48px */}
      <Row marginBottom="32" horizontal="center" style={{ minHeight: "48px" }}>
        <Row gap="16" vertical="center">
          {/* Avatar group skeleton */}
          <div style={{ display: "flex", gap: "-8px" }}>
            {[1, 2].map((i) => (
              <div
                key={`avatar-${i}`}
                className="skeleton skeleton--avatar"
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  marginLeft: i > 1 ? "-8px" : "0",
                }}
              />
            ))}
          </div>

          {/* Team names skeleton */}
          <div className="skeleton" style={{ width: "150px", height: "20px", borderRadius: "4px" }} />
        </Row>
      </Row>

      {/* Hero Image Skeleton - Fixed aspect ratio 16:9 (large for projects) */}
      <div
        className="skeleton skeleton--image"
        style={{
          aspectRatio: "16 / 9",
          width: "100%",
          borderRadius: "12px",
        }}
      />

      {/* Content Section Skeleton */}
      <Column style={{ margin: "auto", width: "100%" }} maxWidth="xs">
        <ContentParagraphsSkeleton lineCount={4} />
      </Column>

      {/* Related Projects Skeleton */}
      <RelatedProjectsSkeleton />
    </Column>
  );
}

/**
 * Blog category skeleton - Smaller header image, more text content
 */
export function BlogSkeleton() {
  return (
    <Column as="article" maxWidth="xs" horizontal="center" gap="l" style={{ padding: "0 16px" }}>
      {/* Blog Header - Compact */}
      <Column gap="12" horizontal="center" align="center" style={{ minHeight: "120px" }}>
        {/* Back link */}
        <div className="skeleton" style={{ width: "60px", height: "18px", borderRadius: "4px" }} />

        {/* Category tag skeleton */}
        <div className="skeleton" style={{ width: "80px", height: "24px", borderRadius: "12px" }} />

        {/* Title - slightly smaller than projects */}
        <div
          className="skeleton skeleton--heading-md"
          style={{
            width: "90%",
            height: "clamp(2rem, 1.5rem + 2.5vw, 3rem)",
            borderRadius: "6px",
          }}
        />

        {/* Date and reading time */}
        <div className="skeleton" style={{ width: "180px", height: "14px", borderRadius: "4px" }} />
      </Column>

      {/* Blog hero image - 2:1 aspect ratio (wider, shorter than projects) */}
      <div
        className="skeleton skeleton--image"
        style={{
          aspectRatio: "2 / 1",
          width: "100%",
          borderRadius: "8px",
        }}
      />

      {/* Blog content - More text lines */}
      <Column style={{ width: "100%" }} gap="20">
        <ContentParagraphsSkeleton lineCount={6} />

        {/* Subheading */}
        <div
          className="skeleton skeleton--heading-sm"
          style={{ width: "50%", height: "24px", marginTop: "12px" }}
        />

        <ContentParagraphsSkeleton lineCount={5} />

        {/* Blockquote skeleton */}
        <div
          className="skeleton"
          style={{
            width: "100%",
            height: "80px",
            borderRadius: "4px",
            borderLeft: "4px solid var(--color-border-primary)",
            paddingLeft: "16px",
          }}
        />

        <ContentParagraphsSkeleton lineCount={4} />
      </Column>
    </Column>
  );
}

/**
 * Canva/Design category skeleton - Gallery-focused layout
 */
export function CanvaSkeleton() {
  return (
    <Column as="section" maxWidth="l" horizontal="center" gap="l" style={{ padding: "0 16px" }}>
      {/* Design Header */}
      <Column gap="12" horizontal="center" align="center" style={{ minHeight: "100px" }}>
        <div className="skeleton" style={{ width: "60px", height: "18px", borderRadius: "4px" }} />
        <div
          className="skeleton skeleton--heading-md"
          style={{ width: "60%", height: "32px", borderRadius: "6px" }}
        />
        <div className="skeleton" style={{ width: "200px", height: "14px", borderRadius: "4px" }} />
      </Column>

      {/* Design gallery grid - Multiple images */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "16px",
          width: "100%",
        }}
      >
        {[1, 2, 3, 4].map((i) => (
          <div
            key={`canva-${i}`}
            className="skeleton skeleton--image"
            style={{
              aspectRatio: "4 / 5",
              width: "100%",
              borderRadius: "8px",
            }}
          />
        ))}
      </div>

      {/* Brief description */}
      <Column style={{ width: "100%", maxWidth: "600px" }}>
        <ContentParagraphsSkeleton lineCount={2} />
      </Column>
    </Column>
  );
}

/**
 * Reusable content paragraphs skeleton
 */
function ContentParagraphsSkeleton({ lineCount = 4 }: { lineCount?: number }) {
  const widths = ["100%", "95%", "88%", "75%", "92%", "85%", "70%", "98%"];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      {Array.from({ length: lineCount }).map((_, i) => (
        <div
          key={`line-${i}`}
          className="skeleton skeleton--text"
          style={{ width: widths[i % widths.length], height: "18px" }}
        />
      ))}
    </div>
  );
}

/**
 * Related projects skeleton section
 */
function RelatedProjectsSkeleton() {
  return (
    <Column fillWidth gap="40" horizontal="center" marginTop="40">
      {/* Divider */}
      <div style={{ width: "40px", height: "1px", background: "var(--color-border-primary)" }} />

      {/* Section heading skeleton */}
      <div
        className="skeleton skeleton--heading-sm"
        style={{ width: "200px", height: "32px", marginBottom: "24px" }}
      />

      {/* Project cards skeleton grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "24px",
          width: "100%",
        }}
      >
        {[1, 2].map((i) => (
          <div
            key={`related-${i}`}
            className="skeleton skeleton--card"
            style={{
              aspectRatio: "16 / 10",
              width: "100%",
              borderRadius: "12px",
            }}
          />
        ))}
      </div>
    </Column>
  );
}