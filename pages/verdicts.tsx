import Link from "next/link";
import { GetStaticProps } from "next";
import { getAllVerdictsMeta, VerdictMeta } from "../lib/verdicts";

function Row({
  title,
  summary,
  date,
  href,
}: {
  title: string;
  summary: string;
  date: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      style={{
        textDecoration: "none",
        color: "inherit",
        display: "block",
        padding: "14px 0",
        borderBottom: "1px solid #e5e7eb",
      }}
    >
      <div
        style={{
          fontSize: 12,
          color: "#6b7280",
          letterSpacing: 1,
          textTransform: "uppercase",
        }}
      >
        Verdict • {date}
      </div>

      <div
        style={{
          marginTop: 6,
          fontSize: 20,
          fontWeight: 800,
          letterSpacing: -0.4,
        }}
      >
        {title}
      </div>

      <div style={{ marginTop: 8, color: "#6b7280", lineHeight: 1.7 }}>
        {summary}
      </div>
    </Link>
  );
}

export default function VerdictsPage({ items }: { items: VerdictMeta[] }) {
  return (
    <main style={{ maxWidth: 960, margin: "0 auto", padding: "42px 24px 72px" }}>
      <h1
        style={{
          fontSize: 46,
          fontWeight: 900,
          letterSpacing: -1.2,
          margin: 0,
        }}
      >
        Verdicts
      </h1>

      <p style={{ marginTop: 12, color: "#6b7280", fontSize: 18, lineHeight: 1.6 }}>
        Short, structured maps of political disagreement—written so both sides feel accurately represented.
      </p>

      <div style={{ marginTop: 28 }}>
        {items.map((v) => (
          <Row
            key={v.slug}
            date={v.date}
            title={v.title}
            summary={v.summary}
            href={`/verdicts/${v.slug}`}
          />
        ))}
      </div>
    </main>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const items = getAllVerdictsMeta();
  return { props: { items } };
};