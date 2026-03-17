import Link from "next/link";
import { GetStaticProps } from "next";
import OgHead from "../../components/OgHead";
import { getAllDeskMeta, DeskMeta } from "../../lib/desk";

function formatDate(dateStr: string) {
  if (!dateStr) return "";
  // Handle MM-DD-YYYY
  const parts = dateStr.split("-");
  if (parts.length === 3 && parts[0].length === 2) {
    const [mm, dd, yyyy] = parts;
    return new Date(`${yyyy}-${mm}-${dd}`).toLocaleDateString("en-US", {
      month: "long", day: "numeric", year: "numeric",
    });
  }
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  });
}

export default function DeskIndexPage({ items }: { items: DeskMeta[] }) {
  return (
    <>
      <OgHead title="The Desk — The People's Verdict" type="default" />
      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "3rem 1.25rem 6rem" }}>

        {/* ── HEADER ── */}
        <div style={{ maxWidth: 640, marginBottom: "2.5rem" }}>
          <div className="eyebrow" style={{ marginBottom: "1rem" }}>
            The People's Verdict
          </div>
          <h1 style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(2.25rem, 5vw, 3.5rem)",
            fontWeight: 400,
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
            color: "var(--text)",
            marginBottom: "1rem",
          }}>
            The Desk
          </h1>
          <p style={{
            fontFamily: "var(--font-body)",
            fontSize: "1rem",
            lineHeight: 1.75,
            color: "var(--text-dim)",
            marginBottom: "1.5rem",
          }}>
            Reader questions answered on demand. Good questions get a full breakdown. Great ones become Verdicts or Briefings.
          </p>
          <Link href="/desk/ask" style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
            fontFamily: "var(--font-body)",
            fontSize: "0.72rem",
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--bg)",
            background: "var(--gold)",
            textDecoration: "none",
            padding: "12px 20px",
            borderRadius: 3,
            whiteSpace: "nowrap",
            transition: "opacity 0.15s ease",
          }}>
            Ask a Question →
          </Link>
        </div>

        <div style={{ borderTop: "1px solid var(--border)", marginBottom: "3rem" }} />

        {/* ── QUESTIONS LIST ── */}
        {items.length === 0 ? (
          <div style={{ maxWidth: 600 }}>
            <p style={{
              fontFamily: "var(--font-body)",
              fontSize: "1rem",
              color: "var(--text-faint)",
              lineHeight: 1.75,
              marginBottom: "1.5rem",
            }}>
              No questions answered yet. Be the first to ask.
            </p>
            <Link href="/desk/ask" style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.75rem",
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--gold)",
              textDecoration: "none",
              borderBottom: "1px solid var(--gold-line)",
              paddingBottom: 2,
            }}>
              Submit a question →
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {items.map((item, i) => (
              <Link
                key={item.slug}
                href={`/desk/${item.slug}`}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <div
                  className="desk-card"
                  style={{
                    padding: "2rem 0",
                    borderBottom: "1px solid var(--border)",
                    borderTop: i === 0 ? "none" : undefined,
                    transition: "opacity 0.15s ease",
                    maxWidth: 720,
                  }}
                >
                  {/* Date + kicker */}
                  <div style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "0.65rem",
                    fontWeight: 600,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "var(--text-faint)",
                    marginBottom: "0.85rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}>
                    <span>{formatDate(item.date)}</span>
                    <span style={{ color: "var(--border-light)" }}>·</span>
                    <span style={{ color: "var(--gold)" }}>The Desk</span>
                  </div>

                  {/* The original question */}
                  <div style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "0.78rem",
                    fontWeight: 600,
                    letterSpacing: "0.04em",
                    color: "var(--text-faint)",
                    marginBottom: "0.5rem",
                    textTransform: "uppercase",
                  }}>
                    Q
                  </div>
                  <div style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "clamp(1.1rem, 2.5vw, 1.45rem)",
                    fontWeight: 400,
                    lineHeight: 1.25,
                    color: "var(--text)",
                    marginBottom: "1rem",
                    fontStyle: "italic",
                  }}>
                    "{item.question}"
                  </div>

                  {/* Answer summary */}
                  <p style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "0.92rem",
                    lineHeight: 1.75,
                    color: "var(--text-dim)",
                    marginBottom: "1rem",
                    margin: "0 0 1rem",
                  }}>
                    {item.summary}
                  </p>

                  <div style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "var(--gold)",
                  }}>
                    Read the full answer →
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        <style jsx>{`
          .desk-card:hover { opacity: 0.75; }
        `}</style>
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const items = getAllDeskMeta();
  return { props: { items } };
};