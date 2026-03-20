import Link from "next/link";
import { GetStaticProps } from "next";
import { useEffect, useState } from "react";
import GlobalQuestion from "../components/GlobalQuestion";
import { getAllVerdictsMeta, VerdictMeta } from "../lib/verdicts";
import { getAllBriefingsMeta, BriefingMeta } from "../lib/briefings";
import { getAllDeskMeta, DeskMeta } from "../lib/desk";
import OgHead from "../components/OgHead";

type Post = {
  type: "Verdict" | "Briefing" | "The Desk";
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

function useReaderCount(questionId?: string): number | null {
  const [count, setCount] = useState<number | null>(null);
  useEffect(() => {
    if (!questionId) return;
    let alive = true;
    (async () => {
      try {
        const res = await fetch(`/api/question/${encodeURIComponent(questionId)}`, {
          cache: "no-store",
          credentials: "same-origin",
        });
        if (!res.ok || !alive) return;
        const json = await res.json();
        const q = json.question;
        if (!q || !alive) return;
        const t = (q.a_count || 0) + (q.b_count || 0) + (q.c_count || 0) + (q.d_count || 0);
        if (t > 0) setCount(t);
      } catch { /* fail silently */ }
    })();
    return () => { alive = false; };
  }, [questionId]);
  return count;
}

function useCommunityCount(): number | null {
  const [count, setCount] = useState<number | null>(null);
  useEffect(() => {
    fetch("/api/community-count")
      .then((r) => r.json())
      .then((j) => { if (j.count > 0) setCount(j.count); })
      .catch(() => {});
  }, []);
  return count;
}

function SmallCard({ kicker, title, desc, href }: {
  kicker: string; title: string; desc: string; href: string;
}) {
  return (
    <Link href={href} style={{ textDecoration: "none", color: "inherit", display: "block" }}>
      <div
        style={{
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
  const readerCount = useReaderCount(post?.questionId);

  if (!post) {
    return (
      <div style={{ borderTop: "1px solid var(--border)", paddingTop: "1.25rem" }}>
        <div className="eyebrow">Latest</div>
        <p style={{ marginTop: "0.75rem", color: "var(--text-faint)", lineHeight: 1.7 }}>
          Nothing here yet. Check back Tuesday or Friday.
        </p>
      </div>
    );
  }

  const href = post.type === "Verdict"
    ? `/verdicts/${post.slug}`
    : post.type === "The Desk"
    ? `/desk/${post.slug}`
    : `/briefings/${post.slug}`;

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
        flexWrap: "wrap",
        marginBottom: "1rem",
      }}>
        <span>{post.date}</span>
        {post.readTime && <span>· {post.readTime}</span>}
        <span style={{ color: "var(--gold)" }}>· {post.type}</span>
        {readerCount !== null && (
          <span>· {readerCount} {readerCount === 1 ? "reader" : "readers"} weighed in</span>
        )}
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
  latestDesk,
}: {
  latestVerdicts: VerdictMeta[];
  latestBriefings: BriefingMeta[];
  latestDesk: DeskMeta[];
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

  const deskPosts: Post[] = latestDesk.map((d) => ({
    type: "The Desk",
    slug: d.slug,
    title: d.title,
    date: d.date,
    summary: d.summary,
    readTime: d.readTime ?? undefined,
    questionId: d.questionId ?? undefined,
  }));

  const all = [...verdictPosts, ...briefingPosts, ...deskPosts].sort(
    (a, b) => parseMDY(b.date).getTime() - parseMDY(a.date).getTime()
  );

  const hero = all[0] ?? null;
  const below = all.slice(1, 4);
  const communityCount = useCommunityCount();

  return (
    <>
      <OgHead title="The People's Verdict" type="default" />
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: "3rem 1.25rem 5rem" }}>

      {/* ── MASTHEAD ── */}
      <div className="masthead fade-up" style={{
        marginBottom: "2.5rem",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "2.5rem",
        alignItems: "start",
      }}>
        {/* Identity block */}
        <div style={{ marginBottom: "2rem" }}>
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
            Structured analysis for independent thinkers.
          </h1>

          <p style={{
            fontFamily: "var(--font-body)",
            fontSize: "1rem",
            lineHeight: 1.75,
            color: "var(--text-dim)",
            maxWidth: 520,
            marginBottom: "1.5rem",
          }}>
            TPV breaks every political issue into its real components, values, facts, and incentives, so you can form an opinion that's actually yours.
          </p>
          <p style={{
            fontFamily: "var(--font-body)",
            fontSize: "1rem",
            lineHeight: 1.75,
            color: "var(--text-dim)",
            maxWidth: 520,
            marginBottom: "1.5rem",
          }}>
            Committed to text. Built for a community who want depth.
          </p>

          {communityCount !== null && (
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              marginBottom: "1.25rem",
            }}>
              <span style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "var(--gold)",
                flexShrink: 0,
                display: "inline-block",
              }} />
              <span style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.78rem",
                color: "var(--text-faint)",
                fontWeight: 500,
              }}>
                {communityCount} readers committed to independent thinking
              </span>
            </div>
          )}

          {/* CTAs */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            flexWrap: "wrap",
          }}>
            {[
              { href: "/verdicts", label: "Read a Verdict →" },
              { href: "/briefings", label: "Read a Briefing" },
              { href: "/desk", label: "Ask the Desk" },
            ].map((btn) => (
              <Link
                key={btn.href}
                href={btn.href}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "var(--font-body)",
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  textDecoration: "none",
                  padding: "11px 18px",
                  borderRadius: 3,
                  border: "1px solid var(--border-light)",
                  color: "var(--text-dim)",
                  background: "transparent",
                  transition: "background 0.2s ease, color 0.2s ease, border-color 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--gold)";
                  e.currentTarget.style.color = "var(--bg)";
                  e.currentTarget.style.borderColor = "var(--gold)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "var(--text-dim)";
                  e.currentTarget.style.borderColor = "var(--border-light)";
                }}
              >
                {btn.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Format explainer — right column */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: "1rem",
            borderLeft: "1px solid var(--border)",
            paddingLeft: "2rem",
            paddingTop: "0.25rem",
          }}
          className="format-grid"
        >
          {[
            {
              label: "Verdict",
              freq: "UNDER CONSTRUCTION",
              desc: "Polarizing issues broken down by values, facts, forecasts and incentives. Ends with a reader poll.",
              href: "/verdicts",
            },
            {
              label: "Briefing",
              freq: "UNDER CONSTRUCTION",
              desc: "Institutional and policy stories structured as: what happened, why it matters, what changes, what to watch.",
              href: "/briefings",
            },
            {
              label: "The Desk",
              freq: "On demand",
              desc: "Got a question about a policy or current event? Submit it. Good questions get answered. Great ones become Verdicts.",
              href: "/desk",
            },
          ].map((item) => (
            <Link key={item.label} href={item.href} style={{ textDecoration: "none" }}>
              <div
                style={{
                  padding: "1.1rem",
                  border: "1px solid var(--border-light)",
                  borderRadius: 4,
                  background: "var(--bg2)",
                  transition: "border-color 0.15s ease",
                }}
                className="format-card"
              >
                <div style={{
                  display: "flex",
                  alignItems: "baseline",
                  justifyContent: "space-between",
                  gap: 8,
                  marginBottom: "0.5rem",
                }}>
                  <div style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "1.1rem",
                    color: "var(--text)",
                    fontWeight: 400,
                  }}>
                    {item.label}
                  </div>
                  <div style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "0.62rem",
                    fontWeight: 600,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "var(--gold)",
                  }}>
                    {item.freq}
                  </div>
                </div>
                <div style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "0.82rem",
                  lineHeight: 1.65,
                  color: "var(--text-faint)",
                }}>
                  {item.desc}
                </div>
              </div>
            </Link>
          ))}
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
        <div className="recent-sidebar" style={{ display: "grid", gap: "1.25rem" }}>
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
                href={p.type === "Verdict" ? `/verdicts/${p.slug}` : p.type === "The Desk" ? `/desk/${p.slug}` : `/briefings/${p.slug}`}
              />
            );
          })}
        </div>
      </div>

      <style jsx>{`
        .small-card:hover { opacity: 0.75; }
        .cta-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
          font-family: var(--font-body);
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          text-decoration: none;
          padding: 11px 18px;
          border-radius: 3px;
          border: 1px solid var(--border-light);
          color: var(--text-dim);
          background: transparent;
          transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease;
        }
        @media (hover: hover) {
          .cta-btn:hover {
            background: var(--gold);
            color: var(--bg);
            border-color: var(--gold);
          }
        }
        .format-card:hover { border-color: var(--gold-line) !important; }

        /* ── 900px: masthead and homegrid collapse to single column ── */
        @media (max-width: 900px) {
          .homegrid {
            grid-template-columns: 1fr !important;
          }
          .masthead {
            grid-template-columns: 1fr !important;
            gap: 1.5rem !important;
            margin-bottom: 1.75rem !important;
          }
          .format-grid {
            grid-template-columns: 1fr 1fr !important;
            border-left: none !important;
            padding-left: 0 !important;
            border-top: 1px solid var(--border) !important;
            padding-top: 1.5rem !important;
          }
          /* recent sidebar gets a top separator when it drops below the hero */
          .recent-sidebar {
            border-top: 1px solid var(--border);
            padding-top: 1.5rem;
            margin-top: 0.25rem;
          }
        }

        /* ── 600px: tighten spacing, stack format cards, full-width CTAs ── */
        @media (max-width: 600px) {
          main {
            padding-top: 1.5rem !important;
            padding-bottom: 4rem !important;
          }
          .masthead {
            margin-bottom: 1.25rem !important;
          }
          /* format cards go single column — two cards side by side is too cramped */
          .format-grid {
            grid-template-columns: 1fr !important;
          }
          /* CTA buttons go full width and stack */
          .cta-row {
            flex-direction: column;
            align-items: stretch !important;
            gap: 0.6rem !important;
          }
          .cta-btn {
            width: 100%;
            justify-content: center;
            padding: 13px 18px !important;
          }
          /* homegrid tighter gap */
          .homegrid {
            gap: 0 !important;
          }
          /* hero title slightly tighter on small screens */
          .homegrid h2 {
            font-size: clamp(1.6rem, 6vw, 2.75rem) !important;
          }
        }

        /* ── 480px: minor polish for very small phones ── */
        @media (max-width: 480px) {
          main {
            padding-left: 1rem !important;
            padding-right: 1rem !important;
          }
        }
          
      `}</style>
    </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const latestVerdicts = getAllVerdictsMeta();
  const latestBriefings = getAllBriefingsMeta();
  const latestDesk = getAllDeskMeta();
  return { props: { latestVerdicts, latestBriefings, latestDesk } };
};