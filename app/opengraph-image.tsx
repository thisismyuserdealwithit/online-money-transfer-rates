import { ImageResponse } from "next/og";

export const alt =
  "Online Money Transfer, independent rate checks with provider receipts";
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
          position: "relative",
          overflow: "hidden",
          background: "#f4efe5",
          color: "#112343",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: "0 0 auto auto",
            width: 480,
            height: 480,
            borderRadius: 480,
            background: "#2e5cff",
            opacity: 0.12,
            transform: "translate(130px, -170px)",
          }}
        />
        <div
          style={{
            width: 62,
            background: "#2e5cff",
            height: "100%",
            display: "flex",
          }}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "68px 78px 62px",
            width: "100%",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
            <div
              style={{
                width: 92,
                height: 92,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 22,
                background: "#2e5cff",
                color: "white",
                fontSize: 30,
                fontWeight: 800,
              }}
            >
              OMT
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 31,
                fontWeight: 700,
                letterSpacing: -0.5,
              }}
            >
              Online Money Transfer
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            <div
              style={{
                display: "flex",
                color: "#2e5cff",
                fontSize: 22,
                fontWeight: 800,
                letterSpacing: 2.5,
                textTransform: "uppercase",
              }}
            >
              Independent UK rate checks
            </div>
            <div
              style={{
                display: "flex",
                maxWidth: 900,
                fontSize: 68,
                lineHeight: 1.03,
                fontWeight: 800,
                letterSpacing: -3,
              }}
            >
              See what actually arrives.
            </div>
            <div
              style={{
                display: "flex",
                maxWidth: 920,
                fontSize: 29,
                lineHeight: 1.35,
                color: "#536174",
              }}
            >
              Current provider rates, visible fees and dated screenshot proof
              for every published result.
            </div>
          </div>
          <div
            style={{
              display: "flex",
              gap: 34,
              color: "#112343",
              fontSize: 21,
              fontWeight: 700,
            }}
          >
            <span>£200 UK comparisons</span>
            <span>52 corridors</span>
            <span>Checked daily</span>
            <span>Receipts retained</span>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
