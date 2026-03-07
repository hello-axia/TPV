// components/ArticleShell.tsx
import Link from "next/link";
import { ReactNode, useEffect, useState } from "react";

function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    function update() {
      const el = document.documentElement;
      const scrolled = el.scrollTop || document.body.scrollTop;
      const total = el.scrollHeight - el.clientHeight;
      setProgress(total > 0 ? Math.min(100, (scrolled / total) * 100) : 0);
    }
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      height: 2,
      zIndex: 100,
      background: "var(--border)",
    }}>
      <div style={{
        height: "100%",
        width: `${progress}%`,
        background: "var(--gold)",
        transition: "width 0.1s linear",
      }} />
    </div>
  );
}

export default function ArticleShell({
  type,
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
    <>
      <ReadingProgress />

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "2.5rem 1.25rem 5rem" }}>

        {/* ── ARTICLE HEADER ── */}
        <div className="article-header fade-up" style={{ marginBottom: "2rem", maxWidth: 720 }}>

          {/* Back + meta row */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            marginBottom: "1.25rem",
            flexWrap: "wrap",
          }}>
            <Link href={backHref} style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.65rem",
              fontWeight: 600,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--text-faint)",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: "0.3rem",
              transition: "color 0.15s ease",
              borderBottom: "1px solid var(--border)",
              paddingBottom: "1px",
            }}>
              ← Back
            </Link>

            <span style={{ color: "var(--border-light)", fontSize: "0.6rem" }}>·</span>

            <span style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.65rem",
              fontWeight: 600,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--text-faint)",
            }}>
              {date}
            </span>

            {readTime && (
              <>
                <span style={{ color: "var(--border-light)", fontSize: "0.6rem" }}>·</span>
                <span style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "0.65rem",
                  fontWeight: 600,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "var(--text-faint)",
                }}>
                  {readTime}
                </span>
              </>
            )}

            <span style={{ color: "var(--border-light)", fontSize: "0.6rem" }}>·</span>

            {/* Type badge */}
            <span style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.6rem",
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--gold)",
              background: "var(--gold-dim)",
              border: "1px solid var(--gold-line)",
              borderRadius: 2,
              padding: "2px 7px",
            }}>
              {type}
            </span>
          </div>

          {/* Title */}
          <h1 style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(1.9rem, 4.5vw, 3rem)",
            lineHeight: 1.1,
            fontWeight: 400,
            letterSpacing: "-0.02em",
            color: "var(--text)",
            marginBottom: "1rem",
          }}>
            {title}
          </h1>

          {/* Gold divider */}
          <div className="divider" />

          {/* Summary / deck */}
          <p style={{
            fontFamily: "var(--font-body)",
            fontSize: "1.05rem",
            lineHeight: 1.75,
            color: "var(--text-dim)",
            fontStyle: "italic",
            marginTop: "1rem",
          }}>
            {summary}
          </p>
        </div>

        {/* ── FULL DIVIDER ── */}
        <div style={{ borderTop: "1px solid var(--border)", margin: "0 0 2.5rem" }} />

        {/* ── ARTICLE LAYOUT ── */}
        <div className="tpv-article">
          <section className="prose fade-up-delay-1" style={{ minWidth: 0 }}>
            {children}
          </section>
          {rightRail && (
            <aside style={{ minWidth: 0 }}>
              {rightRail}
            </aside>
          )}
        </div>

        <style jsx>{`
          .tpv-article {
            display: grid;
            grid-template-columns: 1fr;
            gap: 2rem;
          }

          @media (min-width: 980px) {
            .tpv-article {
              grid-template-columns: 1.35fr 0.65fr;
              gap: 3rem;
              align-items: start;
            }
          }

          @media (max-width: 600px) {
            .article-header {
              margin-bottom: 1.5rem !important;
            }
          }
        `}</style>
      </main>
    </>
  );
}