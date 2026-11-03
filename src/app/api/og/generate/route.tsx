/* eslint-disable @next/next/no-img-element */
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { designs, home, person } from "@/resources";

export const runtime = "nodejs";

// Only page titles from the content files can be rendered, so the route can't be
// used to put arbitrary text on an image served from this domain. Anything else
// falls back to the site title.
const allowedTitles = new Set([home.title, designs.title]);

let avatarDataUrl: Promise<string | null> | undefined;

// Read once per instance from the deployment bundle (see outputFileTracingIncludes),
// so rendering never makes an outbound request.
function loadAvatar() {
  avatarDataUrl ??= readFile(join(process.cwd(), "public", person.avatar))
    .then((file) => `data:image/jpeg;base64,${file.toString("base64")}`)
    .catch(() => null);
  return avatarDataUrl;
}

export async function GET(request: Request) {
  const requested = new URL(request.url).searchParams.get("title") ?? "";
  const title = allowedTitles.has(requested) ? requested : home.title;
  const avatar = await loadAvatar();

  return new ImageResponse(
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        padding: "6rem",
        background: "#151515",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: "4rem",
          fontStyle: "normal",
          color: "white",
        }}
      >
        <span
          style={{
            padding: "1rem",
            fontSize: "5rem",
            lineHeight: "6.5rem",
            letterSpacing: "-0.03em",
            whiteSpace: "wrap",
            textWrap: "balance",
            overflow: "hidden",
          }}
        >
          {title}
        </span>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "5rem",
          }}
        >
          {avatar && (
            <img
              src={avatar}
              alt={person.name}
              style={{
                width: "12rem",
                height: "12rem",
                objectFit: "cover",
                borderRadius: "100%",
              }}
            />
          )}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
            }}
          >
            <span
              style={{
                fontSize: "4.5rem",
                lineHeight: "4.5rem",
                whiteSpace: "pre-wrap",
                textWrap: "balance",
              }}
            >
              {person.name}
            </span>
            <span
              style={{
                fontSize: "2.5rem",
                lineHeight: "2.5rem",
                whiteSpace: "pre-wrap",
                textWrap: "balance",
                opacity: "0.6",
              }}
            >
              {person.role}
            </span>
          </div>
        </div>
      </div>
    </div>,
    {
      width: 1280,
      height: 720,
      headers: {
        // Output only changes on deploy.
        "Cache-Control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400",
      },
    },
  );
}
