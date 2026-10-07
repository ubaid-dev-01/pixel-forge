import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "PixelForge — professional image infrastructure";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

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
          color: "#F7F9FC",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 12,
              background: "#011F55",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
            }}
          >
            <div style={{ position: "absolute", top: 8, left: 8, width: 8, height: 8, background: "#6EC1E4" }} />
            <div style={{ position: "absolute", top: 8, left: 18, width: 8, height: 8, background: "#1E82A2" }} />
            <div style={{ position: "absolute", top: 18, left: 8, width: 8, height: 8, background: "#1E82A2" }} />
            <div style={{ width: 18, height: 28, background: "#6EC1E4", marginTop: 8, marginLeft: 4 }} />
          </div>
          <div style={{ fontSize: 36, fontWeight: 600, letterSpacing: -0.5 }}>PixelForge</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 920 }}>
          <div style={{ fontSize: 56, fontWeight: 600, lineHeight: 1.1, letterSpacing: -1.2 }}>
            Professional image infrastructure for people who care about visual quality.
          </div>
          <div style={{ fontSize: 22, color: "#6EC1E4", letterSpacing: 2 }}>
            RESTORE · ENHANCE · UPSCALE · SHARPEN · TRANSFORM
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
