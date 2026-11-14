import { ImageResponse } from "next/og";

// Favicon in the banner style: ink "h" on paper with the red full stop.
export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
        background: "#F3F0EA",
        border: "2px solid #1F1D1A",
        borderRadius: 12,
        color: "#1F1D1A",
        fontSize: 44,
        fontWeight: 700,
        letterSpacing: "-0.04em",
      }}
    >
      h<span style={{ color: "#E0262B" }}>.</span>
    </div>,
    size,
  );
}
