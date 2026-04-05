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

export default function BulletinIndex({
  bulletins,
}: {
  bulletins: BulletinMeta[];
}) {
  return (
    <>
      <OgHead title="The Bulletin — TPV" type="default" />
      <main
        style={{ maxWidth: 1100, margin: "0 auto", padding: "3rem 1.25rem 5rem" }}
      >
        {/* Header */}
        <div style={{ marginBottom: "2.5rem" }}>
          <div
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.65rem",
              fontWeight: 700,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--gold)",
              marginBottom: "0.75rem",
            }}
          >
            The Bulletin
          </div>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(2rem, 5vw, 3rem)",
              fontWeight: 400,
              color: "var(--text)",
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              marginBottom: "0.75rem",
            }}
          >
            Daily updates, every morning.
          </h1>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "1rem",
              lineHeight: 1.75,
              color: "var(--text-dim)",
              maxWidth: 540,
            }}
          >
            What you need to know before your day starts: markets, politics,
            and the stories that matter. Published every morning.
          </p>
        </div>

        <div style={{ borderTop: "1px solid var(--border)", marginBottom: "2rem" }} />

        {/* Bulletin list */}
        {bulletins.length === 0 ? (
          <p style={{ color: "var(--text-faint)", fontFamily: "var(--font-body)" }}>
            Nothing here yet. Check back tomorrow.
          </p>
        ) : (
          <div style={{ display: "grid", gap: "0" }}>
            {bulletins.map((b, i) => (
              <Link
                key={b.slug}
                href={`/bulletin/${b.slug}`}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <div
                  style={{
                    borderTop: i === 0 ? "none" : "1px solid var(--border)",
                    padding: "1.5rem 0",
                    display: "grid",
                    gridTemplateColumns: "180px 1fr",
                    gap: "2rem",
                    alignItems: "start",
                    transition: "opacity 0.15s",
                  }}
                  className="bulletin-row"
                >
                  {/* Date */}
                  <div
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "0.78rem",
                      color: "var(--text-faint)",
                      fontWeight: 500,
                      paddingTop: "0.2rem",
                      lineHeight: 1.4,
                    }}
                  >
                    {formatDisplayDate(b.date)}
                  </div>

                  {/* Content */}
                  <div>
                    <div
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "clamp(1.1rem, 2vw, 1.35rem)",
                        color: "var(--text)",
                        lineHeight: 1.25,
                        marginBottom: "0.4rem",
                        fontWeight: 400,
                      }}
                    >
                      {b.title}
                    </div>
                    <div
                      style={{
                        fontFamily: "var(--font-body)",
                        fontSize: "0.85rem",
                        color: "var(--text-faint)",
                        lineHeight: 1.6,
                      }}
                    >
                      {b.subhead}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        <style jsx>{`
          .bulletin-row:hover {
            opacity: 0.72;
          }
          @media (max-width: 600px) {
            .bulletin-row {
              grid-template-columns: 1fr !important;
              gap: 0.4rem !important;
            }
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