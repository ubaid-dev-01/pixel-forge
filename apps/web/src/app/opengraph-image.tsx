import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "PixelForge — professional image infrastructure";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

function Mark({ size = 56 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64">
      <path
        fill="#1E82A2"
        d="M13 10h14a7 7 0 0 1 7 7v13h-4v4h4v13a7 7 0 0 1-7 7H13a7 7 0 0 1-7-7V17a7 7 0 0 1 7-7z"
      />
      <path
        fill="#5BA8C4"
        d="M43 10h7l6 6v7a5 5 0 0 1-5 5h-8a5 5 0 0 1-5-5v-8a5 5 0 0 1 5-5z"
      />
      <rect x="38" y="32" width="18" height="22" rx="5" fill="#5BA8C4" />
      <rect x="30" y="30" width="8" height="4" rx="1" fill="#A8D4E4" />
    </svg>
  );
}

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 64,
          background: "#0C1127",
          color: "#FDFCFA",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <Mark size={56} />
          <div style={{ fontSize: 36, fontWeight: 600, letterSpacing: -1 }}>PixelForge</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 920 }}>
          <div style={{ fontSize: 56, fontWeight: 600, lineHeight: 1.1, letterSpacing: -1.2 }}>
            Professional image infrastructure for people who care about visual quality.
          </div>
          <div style={{ fontSize: 22, color: "#1E82A2", letterSpacing: 2 }}>
            RESTORE · ENHANCE · UPSCALE · SHARPEN · TRANSFORM
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
