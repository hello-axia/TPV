// pages/api/og.tsx
import { ImageResponse } from "@vercel/og";
import type { NextRequest } from "next/server";

export const config = { runtime: "edge" };

export default function handler(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const title = searchParams.get("title") ?? "The People's Verdict";
  const kicker = searchParams.get("kicker") ?? "TPV";
  const type = searchParams.get("type") ?? "default"; // "verdict" | "briefing" | "bound" | "default"
  const date = searchParams.get("date") ?? "";

  // Type-specific accent label
  const typeLabel =
    type === "verdict"
      ? "VERDICT"
      : type === "briefing"
      ? "BRIEFING"
      : type === "bound"
      ? "TPV GAMES"
      : "TPVERDICT.COM";

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          background: "#0e0e0e",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "60px 72px",
          fontFamily: "serif",
          position: "relative",
        }}
      >
        {/* Top bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Logo wordmark */}
          <div
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: "#c8a96e",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              fontFamily: "sans-serif",
            }}
          >
            The People&apos;s Verdict
          </div>

          {/* Type badge */}
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "#0e0e0e",
              background: "#c8a96e",
              padding: "6px 14px",
              borderRadius: "3px",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              fontFamily: "sans-serif",
            }}
          >
            {typeLabel}
          </div>
        </div>

        {/* Main content */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Kicker */}
          {kicker && kicker !== typeLabel && (
            <div
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: "#c8a96e",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                fontFamily: "sans-serif",
              }}
            >
              {kicker}
            </div>
          )}

          {/* Title */}
          <div
            style={{
              fontSize: title.length > 60 ? 42 : title.length > 40 ? 50 : 58,
              fontWeight: 400,
              color: "#f0ece4",
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              maxWidth: "900px",
            }}
          >
            {title}
          </div>

          {/* Date */}
          {date && (
            <div
              style={{
                fontSize: 15,
                color: "#6b6b6b",
                fontFamily: "sans-serif",
                fontWeight: 600,
                marginTop: "4px",
              }}
            >
              {date}
            </div>
          )}
        </div>

        {/* Bottom bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid #2a2a2a",
            paddingTop: "24px",
          }}
        >
          <div
            style={{
              fontSize: 14,
              color: "#4a4a4a",
              fontFamily: "sans-serif",
              fontWeight: 600,
              letterSpacing: "0.05em",
            }}
          >
            tpverdict.com
          </div>
          <div
            style={{
              fontSize: 13,
              color: "#3a3a3a",
              fontFamily: "sans-serif",
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            Political analysis for the next generation
          </div>
        </div>

        {/* Subtle gold left border accent */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: "4px",
            background: "#c8a96e",
          }}
        />
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}