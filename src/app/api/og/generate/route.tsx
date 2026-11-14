import { ImageResponse } from "next/og";
import { baseURL, designs, home, person } from "@/resources";

export const runtime = "nodejs";

// Only page titles from the content files can be rendered, so the route can't be
// used to put arbitrary text on an image served from this domain. Anything else
// falls back to the site title.
const allowedTitles = new Set([home.title, designs.title]);

// Banner palette (see src/resources/custom.css).
const paper = "#F3F0EA";
const ink = "#1F1D1A";
const ink2 = "#6B6760";
const red = "#E0262B";
const grid = "rgba(31, 29, 26, 0.05)";

// Plain-text headline for the image (the home page headline is JSX), broken where the banner breaks it.
const homeHeadline = ["Securing the systems where", "AI, industry and health meet"];

export async function GET(request: Request) {
  const requested = new URL(request.url).searchParams.get("title") ?? "";
  const title = allowedTitles.has(requested) ? requested : home.title;
  const lines = title === home.title ? homeHeadline : [designs.label];
  const host = new URL(baseURL).host;

  return new ImageResponse(
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        padding: "56px 72px",
        background: paper,
        backgroundImage: `linear-gradient(${grid} 1px, transparent 1px), linear-gradient(90deg, ${grid} 1px, transparent 1px)`,
        backgroundSize: "40px 40px",
        color: ink,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 22,
          color: ink2,
        }}
      >
        <span>{home.eyebrow}</span>
        <span>{home.coordinates}</span>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
          justifyContent: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            fontSize: 70,
            lineHeight: 1.08,
            letterSpacing: "-0.03em",
            fontWeight: 500,
          }}
        >
          {lines.map((line, i) => (
            // The red full stop sits in the same row as the last line so it can't wrap away.
            <div key={line} style={{ display: "flex" }}>
              <span>{line}</span>
              {i === lines.length - 1 && <span style={{ color: red }}>.</span>}
            </div>
          ))}
        </div>
        <div style={{ display: "flex", marginTop: 24, fontSize: 26, color: ink2 }}>
          {home.subtitle}
        </div>
        <div
          style={{
            display: "flex",
            width: 760,
            height: 1,
            marginTop: 36,
            background: "rgba(31, 29, 26, 0.18)",
          }}
        />
        <div style={{ display: "flex", marginTop: 24, fontSize: 22, color: ink2 }}>
          {(home.credentials ?? []).join("  ·  ")}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          fontSize: 24,
        }}
      >
        <span style={{ fontWeight: 600 }}>
          {person.name}
          <span style={{ color: red }}>.</span>
        </span>
        <span style={{ color: ink2, fontSize: 22 }}>{host}</span>
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
      headers: {
        // Output only changes on deploy.
        "Cache-Control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400",
      },
    },
  );
}
