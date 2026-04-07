import Link from "next/link";
import { GetStaticProps } from "next";
import type { BulletinMeta } from "../../lib/bulletin";
import OgHead from "../../components/OgHead";

function parseMDY(dateStr: string) {
  const [mm, dd, yyyy] = dateStr.split("-").map((x) => Number(x));
  if (!mm || !dd || !yyyy) return new Date(0);
  return new Date(yyyy, mm - 1, dd);
}

function formatDisplayDate(dateStr: string) {
  const d = parseMDY(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function BulletinCard({ b }: { b: BulletinMeta }) {
  return (
    <Link
      href={`/bulletin/${b.slug}`}
      style={{ textDecoration: "none", color: "inherit", display: "block" }}
      className="bulletin-card"
    >
      <div
        style={{
          borderTop: "1px solid var(--border)",
          paddingTop: "1.25rem",
          paddingBottom: "1.25rem",
          transition: "opacity 0.15s ease",
        }}
      >
        {/* Meta */}
        <div
          style={{
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
          }}
        >
          <span>{formatDisplayDate(b.date)}</span>
          {b.readTime && (
            <>
              <span>·</span>
              <span>{b.readTime}</span>
            </>
          )}
          <span style={{ color: "var(--gold)" }}>· The Bulletin</span>
        </div>

        {/* Title */}
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(1.1rem, 2vw, 1.35rem)",
            lineHeight: 1.2,
            color: "var(--text)",
            marginBottom: "0.6rem",
          }}
        >
          {b.title}
        </div>

        {/* Subhead */}
        <div
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.85rem",
            lineHeight: 1.7,
            color: "var(--text-faint)",
          }}
        >
          {b.subhead}
        </div>

        {/* Read link */}
        <div
          style={{
            marginTop: "0.75rem",
            fontFamily: "var(--font-body)",
            fontSize: "0.65rem",
            fontWeight: 600,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--gold)",
            opacity: 0,
            transition: "opacity 0.15s ease",
          }}
          className="read-link"
        >
          Read →
        </div>
      </div>
    </Link>
  );
}

export default function BulletinIndex({ bulletins }: { bulletins: BulletinMeta[] }) {
  return (
    <>
      <OgHead title="The Bulletin — TPV" type="default" />
      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "2.5rem 1.25rem 5rem" }}>

        {/* Header */}
        <div className="fade-up" style={{ marginBottom: "2rem", maxWidth: 640 }}>
          <div className="eyebrow" style={{ marginBottom: "1rem" }}>The Bulletin</div>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1.9rem, 4vw, 2.75rem)",
              fontWeight: 400,
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              color: "var(--text)",
              marginBottom: "1rem",
            }}
          >
            Daily updates,<br /><em>every morning.</em>
          </h1>
          <div className="divider" />
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.95rem",
              lineHeight: 1.75,
              color: "var(--text-dim)",
              marginTop: "1rem",
            }}
          >
            What you need to know before your day starts: markets, politics,
            and the stories that matter. Published every morning.
          </p>
        </div>

        <div style={{ borderTop: "1px solid var(--border)", margin: "0 0 0.5rem" }} />

        {/* Grid */}
        {bulletins.length === 0 ? (
          <p style={{ color: "var(--text-faint)", fontFamily: "var(--font-body)", paddingTop: "1.5rem" }}>
            Nothing here yet. Check back tomorrow.
          </p>
        ) : (
          <div className="bulletin-grid fade-up-delay-2">
            {bulletins.map((b) => (
              <BulletinCard key={b.slug} b={b} />
            ))}
          </div>
        )}

        <style jsx>{`
          .bulletin-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 0;
          }
          @media (min-width: 900px) {
            .bulletin-grid {
              grid-template-columns: repeat(3, 1fr);
              gap: 0 2rem;
            }
          }
          :global(.bulletin-card:hover .read-link) {
            opacity: 1 !important;
          }
          :global(.bulletin-card:hover > div) {
            opacity: 0.8;
          }
        `}</style>
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const { getAllBulletinsMeta } = require("../../lib/bulletin");
  const bulletins = getAllBulletinsMeta();
  return { props: { bulletins } };
};