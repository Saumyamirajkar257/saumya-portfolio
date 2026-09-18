import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const dynamic = "force-static";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0b0e12 0%, #0d1117 40%, #12171e 100%)",
          padding: "80px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-20%",
            right: "-10%",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(0,201,139,0.3), transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-15%",
            left: "-5%",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(22,201,160,0.25), transparent 70%)",
          }}
        />
        <span
          style={{
            fontSize: "18px",
            color: "rgba(79,220,180,0.8)",
            fontFamily: "monospace",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            marginBottom: "20px",
            zIndex: 1,
          }}
        >
          IoT + Embedded Systems
        </span>
        <span
          style={{
            fontSize: "72px",
            fontWeight: 800,
            color: "#f4f3f0",
            lineHeight: 1.0,
            fontFamily: "sans-serif",
            zIndex: 1,
          }}
        >
          Saumya
        </span>
        <span
          style={{
            fontSize: "72px",
            fontWeight: 800,
            background: "linear-gradient(115deg, #8fffd2, #00e5a0, #00b87f)",
            backgroundClip: "text",
            color: "transparent",
            lineHeight: 1.0,
            fontFamily: "sans-serif",
            zIndex: 1,
          }}
        >
          Mirajkar
        </span>
        <span
          style={{
            fontSize: "22px",
            color: "rgba(244,243,240,0.6)",
            fontFamily: "monospace",
            marginTop: "28px",
            zIndex: 1,
          }}
        >
          Computer Engineering & IoT Student, open to internships
        </span>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
