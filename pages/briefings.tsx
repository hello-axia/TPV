import Link from "next/link";
import { GetStaticProps } from "next";
import { getAllBriefingsMeta, BriefingMeta } from "../lib/briefings";

function Card({
  title,
  summary,
  date,
  readTime,
  href,
}: {
  title: string;
  summary: string;
  date: string;
  readTime?: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      style={{
        textDecoration: "none",
        color: "inherit",
        display: "block",
        borderTop: "1px solid #e5e7eb",
        paddingTop: 16,
      }}
    >
      {/* meta line */}
      <div
        style={{
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
      </div>

      {/* title */}
      <div
        style={{
          marginTop: 10,
          fontSize: 22,
          lineHeight: 1.18,
          fontWeight: 900,
          letterSpacing: -0.6,
          color: "#111827",
        }}
      >
        {title}
      </div>

      {/* summary */}
      <div
        style={{
          marginTop: 10,
          fontSize: 15,
          lineHeight: 1.65,
          color: "#374151",
        }}
      >
        {summary}
      </div>
    </Link>
  );
}

export default function BriefingsPage({ items }: { items: BriefingMeta[] }) {
  return (
    <main
      style={{
        maxWidth: 1280,
        margin: "0 auto",
        padding: "28px 14px 64px",
      }}
    >
      {/* header */}
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
          Briefings
        </div>

        <h1
          style={{
            fontSize: 56,
            lineHeight: 1.02,
            fontWeight: 900,
            letterSpacing: -1.2,
            margin: "10px 0 0",
          }}
        >
          Systems under explanation.
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
          Coverage of complex developments, breaking it down to daily vernacular.
        </p>
      </div>

      <div style={{ borderTop: "1px solid #e5e7eb", margin: "18px 0 22px" }} />

      {/* grid */}
      <div className="tpv-grid">
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
          gap: 26px;
        }

        @media (min-width: 900px) {
          .tpv-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 28px;
          }
        }
      `}</style>
    </main>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const items = getAllBriefingsMeta();
  return { props: { items } };
};