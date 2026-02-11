import Link from "next/link";
import { GetStaticProps } from "next";
import { getAllVerdictsMeta, VerdictMeta } from "../lib/verdicts";
import { getAllBriefingsMeta, BriefingMeta } from "../lib/briefings";

function Card({
  kicker,
  title,
  desc,
  href,
}: {
  kicker: string;
  title: string;
  desc: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      style={{
        textDecoration: "none",
        color: "inherit",
        display: "block",
        border: "1px solid #e5e7eb",
        background: "#fff",
        borderRadius: 0,
        padding: 16,
      }}
    >
      <div style={{ fontSize: 12, letterSpacing: 1, color: "#6b7280", textTransform: "uppercase" }}>
        {kicker}
      </div>
      <div style={{ marginTop: 8, fontSize: 18, fontWeight: 700, letterSpacing: -0.2 }}>
        {title}
      </div>
      <div style={{ marginTop: 8, color: "#6b7280", lineHeight: 1.6 }}>
        {desc}
      </div>
    </Link>
  );
}

export default function HomePage({
  latestVerdicts,
  latestBriefings,
}: {
  latestVerdicts: VerdictMeta[];
  latestBriefings: BriefingMeta[];
}) {
  const lead = latestVerdicts[0];

  return (
    <main style={{ maxWidth: 1120, margin: "0 auto", padding: "28px 24px 64px" }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 44, fontWeight: 800, letterSpacing: -1.2, margin: 0 }}>
            The People’s Verdict
          </h1>
          <p style={{ marginTop: 10, color: "#6b7280", fontSize: 18, lineHeight: 1.6 }}>
            A publication for understanding political disagreement.
          </p>
        </div>
      </div>

      <div
  style={{
    marginTop: 18,
    paddingTop: 14,
    borderTop: "1px solid #e5e7eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  }}
>
  <div style={{ fontSize: 12, letterSpacing: 1, color: "#6b7280", textTransform: "uppercase" }}>
    Latest
  </div>
  <div style={{ fontSize: 13, color: "#6b7280" }}>
    Updated by markdown
  </div>
</div>
      <div
        className="frontgrid"
        style={{
          marginTop: 28,
          display: "grid",
          gridTemplateColumns: "1.3fr 1fr 1fr",
          gap: 16,
        }}
      >
        {/* Lead */}
        <div style={{ border: "1px solid #e5e7eb", borderRadius: 0, padding: 18, background: "#f9fafb" }}>
          <div style={{ fontSize: 12, letterSpacing: 1, color: "#6b7280", textTransform: "uppercase" }}>
            Lead Verdict
          </div>

          {lead ? (
            <>
              <h2 style={{ marginTop: 10, fontSize: 30, fontWeight: 800, letterSpacing: -0.8, lineHeight: 1.1 }}>
                {lead.title}
              </h2>
              <p style={{ marginTop: 12, color: "#6b7280", lineHeight: 1.7 }}>
                {lead.summary}
              </p>
              <div style={{ marginTop: 14 }}>
                <Link
                  href={`/verdicts/${lead.slug}`}
                  style={{ color: "#1f4fbf", textDecoration: "none", fontWeight: 600 }}
                >
                  Read →
                </Link>
              </div>
            </>
          ) : (
            <p style={{ marginTop: 12, color: "#6b7280", lineHeight: 1.7 }}>
              Add a Verdict markdown file to see it here.
            </p>
          )}
        </div>

        {/* Latest Verdicts */}
        <div style={{ display: "grid", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
            <div style={{ fontSize: 14, fontWeight: 700 }}>Latest Verdicts</div>
            <Link href="/verdicts" style={{ color: "#6b7280", textDecoration: "none", fontSize: 13 }}>
              View all
            </Link>
          </div>

          {latestVerdicts.slice(0, 2).map((v) => (
            <Card
              key={v.slug}
              kicker={`Verdict • ${v.date}`}
              title={v.title}
              desc={v.summary}
              href={`/verdicts/${v.slug}`}
            />
          ))}
        </div>

        {/* Latest Briefings */}
        <div style={{ display: "grid", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
            <div style={{ fontSize: 14, fontWeight: 700 }}>Latest Briefings</div>
            <Link href="/briefings" style={{ color: "#6b7280", textDecoration: "none", fontSize: 13 }}>
              View all
            </Link>
          </div>

          {latestBriefings.slice(0, 2).map((b) => (
            <Card
              key={b.slug}
              kicker={`Briefing • ${b.date}`}
              title={b.title}
              desc={b.summary}
              href={`/briefings/${b.slug}`}
            />
          ))}
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 900px) {
          .frontgrid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </main>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const latestVerdicts = getAllVerdictsMeta();
  const latestBriefings = getAllBriefingsMeta();

  return {
    props: {
      latestVerdicts,
      latestBriefings,
    },
  };
};