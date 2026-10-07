import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0C1127",
          borderRadius: 7,
          position: "relative",
        }}
      >
        <div style={{ position: "absolute", top: 5, left: 5, width: 4, height: 4, background: "#6EC1E4" }} />
        <div style={{ position: "absolute", top: 5, left: 10, width: 4, height: 4, background: "#1E82A2" }} />
        <div style={{ position: "absolute", top: 10, left: 5, width: 4, height: 4, background: "#1E82A2" }} />
        <div style={{ width: 10, height: 16, background: "#6EC1E4", marginTop: 4, marginLeft: 2 }} />
      </div>
    ),
    { ...size },
  );
}
