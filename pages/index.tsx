import Link from "next/link";
import { GetStaticProps } from "next";
import GlobalQuestion from "../components/GlobalQuestion";
import { getAllVerdictsMeta, VerdictMeta } from "../lib/verdicts";
import { getAllBriefingsMeta, BriefingMeta } from "../lib/briefings";

type Post = {
  type: "Verdict" | "Briefing";
  slug: string;
  title: string;
  date: string;
  summary: string;
  readTime?: string;
  questionId?: string;
};

function parseMDY(dateStr: string) {
  const [mm, dd, yyyy] = dateStr.split("-").map((x) => Number(x));
  if (!mm || !dd || !yyyy) return new Date(0);
  return new Date(yyyy, mm - 1, dd);
}

function SmallCard({ kicker, title, desc, href }: {
  kicker: string; title: string; desc: string; href: string;
}) {
  return (
    <Link href={href} style={{ textDecoration: "none", color: "inherit", display: "block" }}>
      <div style={{
        borderTop: "1px solid var(--border)",
        paddingTop: "1.1rem",
        transition: "opacity 0.15s ease",
      }}
        className="small-card"
      >
        <div style={{
          fontFamily: "var(--font-body)",
          fontSize: "0.65rem",
          fontWeight: 600,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "var(--text-faint)",
          marginBottom: "0.6rem",
        }}>
          {kicker}
        </div>
        <div style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(1rem, 2vw, 1.2rem)",
          lineHeight: 1.25,
          color: "var(--text)",
          marginBottom: "0.5rem",
        }}>
          {title}
        </div>
        <div style={{
          fontFamily: "var(--font-body)",
          fontSize: "0.85rem",
          lineHeight: 1.65,
          color: "var(--text-faint)",
        }}>
          {desc}
        </div>
      </div>
    </Link>
  );
}

function Hero({ post }: { post: Post | null }) {
  if (!post) {
    return (
      <div style={{ borderTop: "1px solid var(--border)", paddingTop: "1.25rem" }}>
        <div className="eyebrow">Latest</div>
        <p style={{ marginTop: "0.75rem", color: "var(--text-faint)", lineHeight: 1.7 }}>
          Add a Briefing or Verdict markdown file to see it here.
        </p>
      </div>
    );
  }

  const href = post.type === "Verdict" ? `/verdicts/${post.slug}` : `/briefings/${post.slug}`;

  return (
    <div style={{ borderTop: "1px solid var(--border)", paddingTop: "1.25rem" }}>
      {/* Meta line */}
      <div style={{
        fontFamily: "var(--font-body)",
        fontSize: "0.65rem",
        fontWeight: 600,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        color: "var(--text-faint)",
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        marginBottom: "1rem",
      }}>
        <span>{post.date}</span>
        {post.readTime && <span>· {post.readTime}</span>}
        <span style={{ color: "var(--gold)" }}>· {post.type}</span>
      </div>

      {/* Title */}
      <h2 style={{
        fontFamily: "var(--font-display)",
        fontSize: "clamp(1.75rem, 4vw, 2.75rem)",
        lineHeight: 1.1,
        fontWeight: 400,
        color: "var(--text)",
        marginBottom: "1rem",
        letterSpacing: "-0.02em",
      }}>
        {post.title}
      </h2>

      {/* Summary */}
      <p style={{
        fontFamily: "var(--font-body)",
        fontSize: "1rem",
        lineHeight: 1.75,
        color: "var(--text-dim)",
        marginBottom: "1.25rem",
        maxWidth: 560,
      }}>
        {post.summary}
      </p>

      <Link href={href} style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.4rem",
        fontFamily: "var(--font-body)",
        fontSize: "0.75rem",
        fontWeight: 600,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        color: "var(--gold)",
        textDecoration: "none",
        borderBottom: "1px solid var(--gold-line)",
        paddingBottom: "2px",
        transition: "border-color 0.15s ease",
      }}>
        Read →
      </Link>

      {post.questionId && (
        <div style={{ marginTop: "1.5rem" }}>
          <GlobalQuestion questionId={post.questionId} />
        </div>
      )}
    </div>
  );
}

export default function HomePage({
  latestVerdicts,
  latestBriefings,
}: {
  latestVerdicts: VerdictMeta[];
  latestBriefings: BriefingMeta[];
}) {
  const verdictPosts: Post[] = latestVerdicts.map((v) => ({
    type: "Verdict",
    slug: v.slug,
    title: v.title,
    date: v.date,
    summary: v.summary,
    readTime: v.readTime,
    questionId: (v as any).questionId,
  }));

  const briefingPosts: Post[] = latestBriefings.map((b) => ({
    type: "Briefing",
    slug: b.slug,
    title: b.title,
    date: b.date,
    summary: b.summary,
    readTime: b.readTime,
    questionId: (b as any).questionId,
  }));

  const all = [...verdictPosts, ...briefingPosts].sort(
    (a, b) => parseMDY(b.date).getTime() - parseMDY(a.date).getTime()
  );

  const hero = all[0] ?? null;
  const below = all.slice(1, 4);

  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: "3rem 1.25rem 5rem" }}>

      {/* ── MASTHEAD ── */}
      <div className="masthead fade-up" style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "2.5rem",
        alignItems: "start",
        marginBottom: "2.5rem",
      }}>
        {/* Left — identity */}
        <div>
          <div className="eyebrow" style={{ marginBottom: "1rem" }}>The People's Verdict</div>

          <h1 style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(2.25rem, 5vw, 3.5rem)",
            lineHeight: 1.05,
            fontWeight: 400,
            letterSpacing: "-0.02em",
            color: "var(--text)",
            marginBottom: "1rem",
          }}>
            The political noise,<br />
            <em>decoded.</em>
          </h1>

          <p style={{
            fontFamily: "var(--font-body)",
            fontSize: "1rem",
            lineHeight: 1.75,
            color: "var(--text-dim)",
            maxWidth: 420,
            marginBottom: "1.5rem",
          }}>
            For people who care about politics but don't know where to start.
            No spin. No outrage. Just the structure you need to think for yourself.
          </p>

          {/* Social proof */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            flexWrap: "wrap",
          }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.5rem 0.9rem",
              background: "var(--gold-dim)",
              border: "1px solid var(--gold-line)",
              borderRadius: 3,
            }}>
              <span style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.7rem",
                fontWeight: 600,
                letterSpacing: "0.08em",
                color: "var(--gold)",
              }}>
                Readers have weighed in on recent issues
              </span>
            </div>

            <Link href="/bound" style={{
              fontFamily: "var(--font-display)",
              fontStyle: "italic",
              fontSize: "0.95rem",
              color: "var(--text-dim)",
              textDecoration: "none",
              borderBottom: "1px solid var(--border-light)",
              paddingBottom: "1px",
              transition: "color 0.15s ease, border-color 0.15s ease",
            }}>
              Play Bound →
            </Link>
          </div>
        </div>

        {/* Right — publishing commitment */}
        <div className="commitment-desktop" style={{
          borderLeft: "1px solid var(--border)",
          paddingLeft: "2rem",
          paddingTop: "0.25rem",
        }}>
          <div className="eyebrow" style={{ marginBottom: "0.75rem" }}>Publishing Commitment</div>
          <p style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.88rem",
            lineHeight: 1.75,
            color: "var(--text-faint)",
          }}>
            Two structured analyses weekly —{" "}
            <strong style={{ color: "var(--text-dim)", fontWeight: 500 }}>Briefing</strong> (Tue) and{" "}
            <strong style={{ color: "var(--text-dim)", fontWeight: 500 }}>Verdict</strong> (Fri).
            Coverage is limited to developments of structural or national significance.
            TPV is not a breaking-news service.
          </p>

          {/* What each type means */}
          <div style={{ marginTop: "1.5rem", display: "grid", gap: "0.75rem" }}>
            {[
              { label: "Verdict", desc: "Deep issue breakdowns using the IDU framework — values, facts, forecasts, and where you land." },
              { label: "Briefing", desc: "Quick context on trending claims — what's real, what's noise, and why it matters." },
            ].map((item) => (
              <div key={item.label} style={{
                display: "flex",
                gap: "0.75rem",
                alignItems: "flex-start",
              }}>
                <div style={{
                  width: 2,
                  minHeight: "100%",
                  alignSelf: "stretch",
                  background: "var(--gold-line)",
                  flexShrink: 0,
                  marginTop: 3,
                }} />
                <div>
                  <div style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "0.72rem",
                    fontWeight: 600,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "var(--gold)",
                    marginBottom: "0.2rem",
                  }}>
                    {item.label}
                  </div>
                  <div style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "0.82rem",
                    lineHeight: 1.6,
                    color: "var(--text-faint)",
                  }}>
                    {item.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── DIVIDER ── */}
      <div style={{ borderTop: "1px solid var(--border)", margin: "0 0 2rem" }} />

      {/* ── CONTENT GRID ── */}
      <div className="homegrid fade-up-delay-2" style={{
        display: "grid",
        gridTemplateColumns: "1.6fr 1fr",
        gap: "2rem",
        alignItems: "start",
      }}>
        {/* Hero article */}
        <Hero post={hero} />

        {/* Recent sidebar */}
        <div style={{ display: "grid", gap: "1.25rem" }}>
          <div style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            gap: 12,
            paddingBottom: "0.5rem",
          }}>
            <div style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.65rem",
              fontWeight: 600,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--text-faint)",
            }}>
              More recent
            </div>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              {[
                { href: "/briefings", label: "Briefings" },
                { href: "/verdicts", label: "Verdicts" },
              ].map((l) => (
                <Link key={l.href} href={l.href} style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "var(--text-faint)",
                  textDecoration: "none",
                  transition: "color 0.15s ease",
                }}>
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          {below.map((p) => {
            const kicker = `${p.date}${p.readTime ? ` · ${p.readTime}` : ""} · ${p.type}`;
            return (
              <SmallCard
                key={`${p.type}-${p.slug}`}
                kicker={kicker}
                title={p.title}
                desc={p.summary}
                href={p.type === "Verdict" ? `/verdicts/${p.slug}` : `/briefings/${p.slug}`}
              />
            );
          })}
        </div>
      </div>

      <style jsx>{`
        .small-card:hover { opacity: 0.75; }

        @media (max-width: 900px) {
          .homegrid {
            grid-template-columns: 1fr !important;
          }
          .masthead {
            grid-template-columns: 1fr !important;
          }
          .commitment-desktop {
            border-left: none !important;
            padding-left: 0 !important;
            border-top: 1px solid var(--border);
            padding-top: 1.5rem !important;
          }
        }

        @media (max-width: 600px) {
          main {
            padding-top: 2rem !important;
            padding-bottom: 4rem !important;
          }
        }
      `}</style>
    </main>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const latestVerdicts = getAllVerdictsMeta();
  const latestBriefings = getAllBriefingsMeta();
  return { props: { latestVerdicts, latestBriefings } };
};