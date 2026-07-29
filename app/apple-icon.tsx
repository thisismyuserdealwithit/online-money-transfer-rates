import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 36,
          background: "#2e5cff",
          color: "white",
          fontFamily: "Arial, sans-serif",
          fontSize: 54,
          fontWeight: 800,
          letterSpacing: -2,
        }}
      >
        OMT
      </div>
    ),
    size,
  );
}
