import Link from "next/link";
import { GetStaticProps } from "next";
import { getAllBriefingsMeta, BriefingMeta } from "../lib/briefings";

function Card({ title, summary, date, readTime, href }: {
  title: string; summary: string; date: string; readTime?: string; href: string;
}) {
  return (
    <Link href={href} style={{ textDecoration: "none", color: "inherit", display: "block" }} className="briefing-card">
      <div style={{
        borderTop: "1px solid var(--border)",
        paddingTop: "1.25rem",
        paddingBottom: "1.25rem",
        transition: "opacity 0.15s ease",
      }}>
        {/* Meta */}
        <div style={{
          fontFamily: "var(--font-body)",
          fontSize: "0.62rem",
          fontWeight: 600,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "var(--text-faint)",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          marginBottom: "0.65rem",
          flexWrap: "wrap",
        }}>
          <span>{date}</span>
          {readTime && <><span>·</span><span>{readTime}</span></>}
          <span style={{ color: "var(--gold)" }}>· Briefing</span>
        </div>

        {/* Title */}
        <div style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(1.1rem, 2vw, 1.35rem)",
          lineHeight: 1.2,
          color: "var(--text)",
          marginBottom: "0.6rem",
        }}>
          {title}
        </div>

        {/* Summary */}
        <div style={{
          fontFamily: "var(--font-body)",
          fontSize: "0.85rem",
          lineHeight: 1.7,
          color: "var(--text-faint)",
        }}>
          {summary}
        </div>

        {/* Read link */}
        <div style={{
          marginTop: "0.75rem",
          fontFamily: "var(--font-body)",
          fontSize: "0.65rem",
          fontWeight: 600,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "var(--gold)",
          opacity: 0,
          transition: "opacity 0.15s ease",
        }} className="read-link">
          Read →
        </div>
      </div>
    </Link>
  );
}

export default function BriefingsPage({ items }: { items: BriefingMeta[] }) {
  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: "2.5rem 1.25rem 5rem" }}>

      {/* Header */}
      <div className="fade-up" style={{ marginBottom: "2rem", maxWidth: 640 }}>
        <div className="eyebrow" style={{ marginBottom: "1rem" }}>Briefings</div>
        <h1 style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(1.9rem, 4vw, 2.75rem)",
          fontWeight: 400,
          lineHeight: 1.1,
          letterSpacing: "-0.02em",
          color: "var(--text)",
          marginBottom: "1rem",
        }}>
          Complex news,<br /><em>in plain language.</em>
        </h1>
        <div className="divider" />
        <p style={{
          fontFamily: "var(--font-body)",
          fontSize: "0.95rem",
          lineHeight: 1.75,
          color: "var(--text-dim)",
          marginTop: "1rem",
        }}>
          Quick context on trending claims and complex developments —
          what's real, what's noise, and why it matters to you.
        </p>
      </div>

      <div style={{ borderTop: "1px solid var(--border)", margin: "0 0 0.5rem" }} />

      {/* Grid */}
      <div className="tpv-grid fade-up-delay-2">
        {items.map((b) => (
          <Card
            key={b.slug}
            title={b.title}
            summary={b.summary}
            date={b.date}
            readTime={b.readTime}
            href={`/briefings/${b.slug}`}
          />
        ))}
      </div>

      <style jsx>{`
        .tpv-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 0;
        }
        @media (min-width: 900px) {
          .tpv-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 0 2rem;
          }
        }
        :global(.briefing-card:hover .read-link) {
          opacity: 1 !important;
        }
        :global(.briefing-card:hover > div) {
          opacity: 0.8;
        }
      `}</style>
    </main>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const items = getAllBriefingsMeta();
  return { props: { items } };
};