// components/ArticleShell.tsx
import Link from "next/link";
import { ReactNode } from "react";

export default function ArticleShell({
  type, // "Verdict" | "Briefing"
  title,
  date,
  readTime,
  summary,
  backHref,
  children,
  rightRail,
}: {
  type: "Verdict" | "Briefing";
  title: string;
  date: string;
  readTime?: string;
  summary: string;
  backHref: string;
  children: ReactNode;
  rightRail?: ReactNode;
}) {
  return (
    <main style={{ maxWidth: 1120, margin: "0 auto", padding: "28px 14px 64px" }}>
      {/* Header */}
      <div style={{ marginBottom: 18 }}>
        <div
          style={{
            fontSize: 12,
            fontWeight: 900,
            letterSpacing: 1.2,
            color: "#ef4444",
            textTransform: "uppercase",
          }}
        >
          {type}
        </div>

        <div
          style={{
            marginTop: 10,
            fontSize: 12,
            color: "#6b7280",
            display: "flex",
            alignItems: "center",
            gap: 8,
            flexWrap: "wrap",
          }}
        >
          <span>{date}</span>
          {readTime ? (
            <span style={{ color: "rgba(239, 68, 68, 0.65)", fontWeight: 700 }}>
              • {readTime}
            </span>
          ) : null}
          <span style={{ color: "#9ca3af", fontWeight: 700 }}>• {type}</span>
          <span style={{ color: "#9ca3af", fontWeight: 700 }}>•</span>

          <Link href={backHref} style={{ color: "#111827", textDecoration: "none", fontWeight: 800 }}>
            Back
          </Link>
        </div>

        <h1
          style={{
            fontSize: 56,
            lineHeight: 1.02,
            fontWeight: 900,
            letterSpacing: -1.2,
            margin: "12px 0 0",
            color: "#111827",
          }}
        >
          {title}
        </h1>

        <p
          style={{
            marginTop: 12,
            color: "#374151",
            fontSize: 18,
            lineHeight: 1.6,
            fontStyle: "italic",
            maxWidth: 900,
          }}
        >
          {summary}
        </p>
      </div>

      <div style={{ borderTop: "1px solid #e5e7eb", margin: "18px 0 22px" }} />

      {/* Layout */}
      <div className="tpv-article">
        <section style={{ minWidth: 0 }}>{children}</section>
        {rightRail ? <aside style={{ minWidth: 0 }}>{rightRail}</aside> : null}
      </div>

      <style jsx>{`
        .tpv-article {
          display: grid;
          grid-template-columns: 1fr;
          gap: 26px;
        }
        @media (min-width: 980px) {
          .tpv-article {
            grid-template-columns: 1.25fr 0.75fr;
            gap: 36px;
            align-items: start;
          }
        }
      `}</style>
    </main>
  );
}