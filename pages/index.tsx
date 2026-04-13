import Link from "next/link";
import { GetStaticProps } from "next";
import { useEffect, useState } from "react";
import GlobalQuestion from "../components/GlobalQuestion";
import { getAllVerdictsMeta, VerdictMeta } from "../lib/verdicts";
import { getAllBriefingsMeta, BriefingMeta } from "../lib/briefings";
import { getAllDeskMeta, DeskMeta } from "../lib/desk";
import OgHead from "../components/OgHead";

// ── Types ──────────────────────────────────────────────────────────
type Post = {
  type: "Verdict" | "Briefing" | "The Desk";
  slug: string;
  title: string;
  date: string;
  summary: string;
  readTime?: string | null;
  questionId?: string | null;
};

type BulletinPreview = {
  slug: string;
  title: string;
  date: string;
  subhead: string;
} | null;

// ── Helpers ────────────────────────────────────────────────────────
function parseMDY(dateStr: string) {
  const [mm, dd, yyyy] = dateStr.split("-").map((x) => Number(x));
  if (!mm || !dd || !yyyy) return new Date(0);
  return new Date(yyyy, mm - 1, dd);
}

function formatDisplayDate(dateStr: string) {
  const d = parseMDY(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });
}

function postHref(p: Post) {
  if (p.type === "Verdict") return `/verdicts/${p.slug}`;
  if (p.type === "The Desk") return `/desk/${p.slug}`;
  return `/briefings/${p.slug}`;
}

// ── Community count hook ───────────────────────────────────────────
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

function useReaderCount(questionId?: string): number | null {
  const [count, setCount] = useState<number | null>(null);
  useEffect(() => {
    if (!questionId) return;
    let alive = true;
    (async () => {
      try {
        const res = await fetch(`/api/question/${encodeURIComponent(questionId)}`, {
          cache: "no-store", credentials: "same-origin",
        });
        if (!res.ok || !alive) return;
        const json = await res.json();
        const q = json.question;
        if (!q || !alive) return;
        const t = (q.a_count || 0) + (q.b_count || 0) + (q.c_count || 0) + (q.d_count || 0);
        if (t > 0) setCount(t);
      } catch { /* ignore */ }
    })();
    return () => { alive = false; };
  }, [questionId]);
  return count;
}

// ── Bulletin Hero ──────────────────────────────────────────────────
function BulletinHero({ bulletin }: { bulletin: BulletinPreview }) {
  if (!bulletin) return null;

  return (
    <div style={{
      borderTop: "2px solid var(--gold)",
      paddingTop: "1.5rem",
      marginBottom: "2.5rem",
    }}>
      {/* Kicker */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "0.6rem",
        marginBottom: "0.85rem",
      }}>
        <span style={{
          width: 20, height: 1,
          background: "var(--gold)",
          display: "inline-block",
          flexShrink: 0,
        }} />
        <span style={{
          fontFamily: "var(--font-body)",
          fontSize: "0.62rem",
          fontWeight: 700,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: "var(--gold)",
        }}>
          The Bulletin · {formatDisplayDate(bulletin.date)}
        </span>
      </div>

      {/* Headline */}
      <h2 style={{
        fontFamily: "var(--font-display)",
        fontSize: "clamp(1.5rem, 3.5vw, 2.25rem)",
        fontWeight: 400,
        lineHeight: 1.15,
        letterSpacing: "-0.02em",
        color: "var(--text)",
        marginBottom: "0.6rem",
      }}>
        {bulletin.title}
      </h2>

      {/* Subhead */}
      <p style={{
        fontFamily: "var(--font-body)",
        fontSize: "0.95rem",
        lineHeight: 1.65,
        color: "var(--text-faint)",
        marginBottom: "1.1rem",
        maxWidth: 540,
      }}>
        {bulletin.subhead}
      </p>

      <Link href={`/bulletin/${bulletin.slug}`} style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.4rem",
        fontFamily: "var(--font-body)",
        fontSize: "0.72rem",
        fontWeight: 700,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        color: "var(--gold)",
        textDecoration: "none",
        borderBottom: "1px solid var(--gold-line)",
        paddingBottom: "2px",
        transition: "border-color 0.15s ease",
      }}>
        Read today's bulletin →
      </Link>
    </div>
  );
}

// ── Carousel Day Content ───────────────────────────────────────────
function CarouselDayContent({ day }: { day: number }) {
  const content = [
    // Day 1 — The Overview
    {
      section: "Day 1 · The Overview",
      heading: "The Overview",
      body: `On January 1, 2026, Zohran Kwame Mamdani was inaugurated as the 112th mayor of New York City. He is 34 years old, a former state assemblyman from Queens, the first Muslim and first South Asian American to hold the office — and he defeated Andrew Cuomo, a three-term governor, in what most observers called one of the biggest upsets in New York political history.

He didn't win on charisma alone. He won on a single thesis: New York City has become unaffordable for the people who actually run it. His platform was built around five specific promises — a rent freeze on stabilized apartments, free city buses, universal childcare, city-operated grocery stores, and a $30 minimum wage by 2030.

He has now been in office for 95 days. In that time he has signed over 20 executive orders, navigated two major winter storms, inherited a budget deficit his office estimates at $5.4 billion over two years, faced an ISIS-inspired attack outside his official residence, and managed a budget standoff that puts him against both Governor Hochul and City Council Speaker Julie Menin simultaneously.`,
      poll: {
        question: "When a city faces an affordability crisis, who bears the primary responsibility for fixing it?",
        options: [
          "The government, through direct intervention and public programs",
          "The market, if given fewer regulations and more competition",
          "Both share responsibility equally",
          "It depends on the specific problem",
        ],
      },
      stats: [
        { label: "Age at inauguration", value: "34 — youngest since 1892" },
        { label: "General election result", value: "50.78% — highest turnout since 1969" },
        { label: "Inherited budget gap", value: "~$5.4B over two years" },
        { label: "NYC renters", value: "68% of all residents" },
      ],
    },
    // Day 2 — The Disagreement
    {
      section: "Day 2 · The Disagreement",
      heading: "The Disagreement",
      body: `The surface argument about Mamdani is about buses and grocery stores. The real argument is older and harder.

His supporters frame it this way: New York has been governed for and by the wealthy for decades. The cost of living — sky-high rent, $26,000/year infant childcare, a transit system that charges fares while running late — is not a natural disaster. It is the output of policy choices made by people who were comfortable with those outcomes.

His critics frame it differently: The math doesn't work. Free buses cost $800M a year. Universal childcare costs $6B. The city already has a $5.4B deficit. You cannot promise everything to everyone and then tax your way to solvency in a city where the wealthy can simply leave.

What they're actually disagreeing about comes down to two theories of what a city is for. Theory 1: the city as a market — prosperity depends on maintaining conditions attractive to capital. Theory 2: the city as a commons — housing, transit, and childcare are infrastructure, not markets. Neither theory is obviously wrong.`,
      poll: {
        question: "Which theory of what a city is for do you find more compelling?",
        options: [
          "A city's first job is to maintain conditions that attract investment",
          "A city's first job is to directly provide what markets fail to deliver affordably",
          "The two goals are compatible and cities should pursue both",
          "I'm genuinely uncertain",
        ],
      },
      stats: null,
    },
    // Day 3 — The Architecture
    {
      section: "Day 3 · The Architecture",
      heading: "The Architecture",
      body: `Before you can evaluate Mamdani's policies, you have to know what they actually are. Four terms are doing most of the rhetorical work in this debate — and all four are being used imprecisely.

"Democratic socialism" — to critics this evokes Venezuela. To supporters it evokes Denmark. Mamdani's actual platform is closer to the latter. Five city-operated grocery stores competing alongside private supermarkets. A rent freeze on already-regulated apartments. The label consistently outpuns the policies.

"Rent freeze" vs. "rent control" — these are not the same thing. A freeze means 0% increases for one year. Hard rent control involves price ceilings that can fall far below market. De Blasio froze rents three consecutive years. Calling a one-year freeze "rent control" imports 40 years of criticism of a different, more radical policy.

On the incentives: Mamdani needs visible wins fast. Hochul is running for re-election and cannot afford to be nationalized as a tax-and-spend Democrat. Real estate interests have the resources to fight in court and in Albany. The City Council is now in open conflict with the mayor.`,
      poll: {
        question: "When evaluating a politician's policy, what matters most to you?",
        options: [
          "Whether the policy is fiscally sustainable",
          "Whether the policy addresses a real problem people are experiencing",
          "Whether the process used to enact it was legitimate",
          "Whether there is evidence it works somewhere else",
        ],
      },
      stats: null,
    },
    // Day 4 — The Record
    {
      section: "Day 4 · The Record",
      heading: "The Record",
      body: `The 95-day ledger is more complicated than either side wants to admit.

The wins: Mamdani and Hochul announced a $1.5B state investment over two years. The Rent Guidelines Board has been appointed with a new majority — a 0% vote is expected in June, covering one million stabilized apartments. The comptroller formally stated that Mamdani's inaugural budget is more transparent than anything produced under Adams.

The stalls: Free buses remain blocked. The state budget was extended through April 7 without resolving the tax question. Mamdani publicly attacked City Council Speaker Menin's budget response, calling it "unrealistic" — and some progressive council members said his attacks put them "in a difficult situation."

The unexpected: An ISIS-inspired attack outside Gracie Mansion in March. A 7-month-old killed by a stray bullet in Williamsburg in April. And a mayor who, 95 days in, has made more enemies inside his own party than outside it.`,
      poll: {
        question: "When a new leader inherits a fiscal crisis, what is the right first move?",
        options: [
          "Cut spending first to stabilize the budget, then pursue new programs",
          "Raise revenue first so you can fund priorities without cutting services",
          "Negotiate with all parties simultaneously and accept a compromise",
          "The fiscal crisis is secondary — governing vision should come first",
        ],
      },
      stats: null,
    },
    // Day 5 — The Verdict
    {
      section: "Day 5 · The Verdict",
      heading: "The Verdict",
      body: `Ninety-five days is not enough time to evaluate whether Mamdani's model works. It is enough time to identify what the model is actually being tested on.

Three distinct questions are embedded in this debate. The first is empirical: does direct government provision work better than market provision for housing, transit, and childcare? The evidence is genuinely mixed. The second is procedural: who gets to make these decisions? This is a story of democratic institutions functioning exactly as designed — competing power centers slowing radical change in both directions. The third is the one nobody wants to answer: what is New York City's acceptable failure rate? The status quo was producing a city where median rent consumed more than 30% of household income and childcare cost more than college tuition. That is also a kind of failure.

Mamdani has staked his term on a clear answer to the question of what cities are for. New York has four years to give one back.`,
      poll: {
        question: "When markets fail to make essential goods — housing, transit, childcare — affordable, what is the right response?",
        options: [
          "Government should step in and provide those goods directly",
          "Government should remove regulations that prevent markets from solving the problem",
          "Government should subsidize access without replacing the market",
          "There is no universal answer — it depends on the specific failure",
        ],
      },
      stats: null,
    },
  ];

  const c = content[day];
  if (!c) return null;

  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  return (
    <div>
      {/* Section marker */}
      <div style={{
        fontFamily: "var(--font-body)",
        fontSize: "0.6rem",
        fontWeight: 700,
        letterSpacing: "0.16em",
        textTransform: "uppercase",
        color: "var(--gold)",
        marginBottom: "0.5rem",
      }}>
        {c.section}
      </div>

      {/* Heading */}
      <h3 style={{
        fontFamily: "var(--font-display)",
        fontSize: "clamp(1.15rem, 2.5vw, 1.5rem)",
        fontWeight: 400,
        color: "var(--text)",
        lineHeight: 1.2,
        marginBottom: "1rem",
        paddingBottom: "0.85rem",
        borderBottom: "1px solid var(--border)",
      }}>
        {c.heading}
      </h3>

      {/* Stats grid */}
      {c.stats && (
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 2,
          margin: "0 0 1rem",
          background: "var(--border)",
        }}
        className="stat-grid"
        >
          {c.stats.map((s, i) => (
            <div key={i} style={{ background: "var(--bg3)", padding: "12px 14px" }}>
              <div style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.6rem",
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--text-faint)",
                marginBottom: 4,
              }}>
                {s.label}
              </div>
              <div style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.9rem",
                fontWeight: 600,
                color: "var(--text)",
                lineHeight: 1.3,
              }}>
                {s.value}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Body */}
      {c.body.split("\n\n").map((para, i) => (
        <p key={i} style={{
          fontFamily: "var(--font-body)",
          fontSize: "0.9rem",
          lineHeight: 1.75,
          color: "var(--text-dim)",
          marginBottom: "0.85rem",
        }}>
          {para}
        </p>
      ))}

      {/* Poll */}
      <div style={{
        marginTop: "1.25rem",
        paddingTop: "1.25rem",
        borderTop: "1px solid var(--border)",
      }}>
        <div style={{
          fontFamily: "var(--font-body)",
          fontSize: "0.6rem",
          fontWeight: 700,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "var(--gold)",
          marginBottom: "0.6rem",
        }}>
          The People's Verdict
        </div>
        <div style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(0.95rem, 2vw, 1.1rem)",
          fontWeight: 400,
          color: "var(--text)",
          lineHeight: 1.35,
          marginBottom: "0.85rem",
        }}>
          {c.poll.question}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {c.poll.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => { if (!submitted) setSelected(i); }}
              disabled={submitted}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.65rem",
                padding: "0.6rem 0.85rem",
                border: `1px solid ${selected === i ? "var(--gold)" : "var(--border-light)"}`,
                background: selected === i ? "var(--gold-dim)" : "var(--bg3)",
                cursor: submitted ? "default" : "pointer",
                borderRadius: 3,
                textAlign: "left",
                width: "100%",
                transition: "border-color 0.15s, background 0.15s",
              }}
            >
              <span style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.62rem",
                fontWeight: 700,
                letterSpacing: "0.08em",
                color: "var(--gold)",
                minWidth: 14,
              }}>
                {String.fromCharCode(65 + i)}
              </span>
              <span style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.85rem",
                color: selected === i ? "var(--text)" : "var(--text-dim)",
                lineHeight: 1.4,
              }}>
                {opt}
              </span>
            </button>
          ))}
        </div>
        {!submitted ? (
          <button
            onClick={() => { if (selected !== null) setSubmitted(true); }}
            disabled={selected === null}
            style={{
              marginTop: "0.65rem",
              background: selected !== null ? "var(--gold)" : "var(--bg3)",
              color: selected !== null ? "var(--bg)" : "var(--text-faint)",
              border: "none",
              padding: "0.6rem 1.1rem",
              fontFamily: "var(--font-body)",
              fontSize: "0.68rem",
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              cursor: selected !== null ? "pointer" : "not-allowed",
              borderRadius: 3,
              opacity: selected !== null ? 1 : 0.5,
              transition: "all 0.15s",
            }}
          >
            Submit
          </button>
        ) : (
          <p style={{
            marginTop: "0.65rem",
            fontFamily: "var(--font-body)",
            fontSize: "0.8rem",
            color: "var(--gold)",
            fontWeight: 500,
          }}>
            Answer recorded. Results appear as more readers weigh in.
          </p>
        )}
      </div>
    </div>
  );
}

// ── Small article card ─────────────────────────────────────────────
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
          fontSize: "clamp(1rem, 2vw, 1.15rem)",
          lineHeight: 1.25,
          color: "var(--text)",
          marginBottom: "0.5rem",
        }}>
          {title}
        </div>
        <div style={{
          fontFamily: "var(--font-body)",
          fontSize: "0.83rem",
          lineHeight: 1.65,
          color: "var(--text-faint)",
        }}>
          {desc}
        </div>
      </div>
    </Link>
  );
}

// ── Page ───────────────────────────────────────────────────────────
export default function HomePage({
  latestVerdicts,
  latestBriefings,
  latestDesk,
  latestBulletin,
}: {
  latestVerdicts: VerdictMeta[];
  latestBriefings: BriefingMeta[];
  latestDesk: DeskMeta[];
  latestBulletin: BulletinPreview;
}) {
  const communityCount = useCommunityCount();

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
  }));

  const deskPosts: Post[] = latestDesk.map((d) => ({
    type: "The Desk",
    slug: d.slug,
    title: d.title,
    date: d.date,
    summary: d.summary,
  }));

  const recentPosts = [...verdictPosts, ...briefingPosts, ...deskPosts]
    .sort((a, b) => parseMDY(b.date).getTime() - parseMDY(a.date).getTime())
    .slice(0, 3);

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
              TPV breaks every political issue into its real components — values, facts, and incentives — so you can form an opinion that's actually yours.
            </p>

            {communityCount !== null && (
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                marginBottom: "1.25rem",
              }}>
                <span style={{
                  width: 6, height: 6,
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

            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              flexWrap: "wrap",
            }}>
              {[
                { href: "/bulletin", label: "Today's Bulletin →" },
                { href: "/verdicts", label: "Read a Verdict" },
                { href: "/desk/ask", label: "Ask a Question" },
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

          {/* Format explainer */}
          <div style={{
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
                label: "The Bulletin",
                freq: "DAILY",
                desc: "Daily news glance to be caught up on the world's events. Ends with a longer read breaking down a complicated issue.",
                href: "/bulletin",
              },
              {
                label: "Verdict",
                freq: "WEEKLY",
                desc: "Polarizing issues broken down by values, facts, forecasts and incentives. Ends with a reader poll.",
                href: "/verdicts",
              },
              {
                label: "Briefing",
                freq: "WEEKLY",
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
                <div style={{
                  padding: "0.85rem 1rem",
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
                    marginBottom: "0.35rem",
                  }}>
                    <div style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "1rem",
                      color: "var(--text)",
                      fontWeight: 400,
                    }}>
                      {item.label}
                    </div>
                    <div style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "0.6rem",
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
                    fontSize: "0.8rem",
                    lineHeight: 1.6,
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

        {/* ── MAIN CONTENT GRID ── */}
        <div className="homegrid fade-up-delay-2" style={{
          display: "grid",
          gridTemplateColumns: "1.6fr 1fr",
          gap: "2rem",
          alignItems: "start",
        }}>
          {/* Left column — bulletin + verdict card */}
<div>
  <BulletinHero bulletin={latestBulletin} />
  {latestVerdicts.length > 0 && (() => {
    const v = latestVerdicts[0];
    return (
      <div style={{
        borderTop: "1px solid var(--border)",
        paddingTop: "1.25rem",
        marginBottom: "2.5rem",
      }}>
        <div style={{
          fontFamily: "var(--font-body)",
          fontSize: "0.62rem",
          fontWeight: 700,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "var(--gold)",
          marginBottom: "0.3rem",
        }}>
          This week's verdict
        </div>
        <h2 style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(1.5rem, 3.5vw, 2.25rem)",
          fontWeight: 400,
          lineHeight: 1.15,
          letterSpacing: "-0.02em",
          color: "var(--text)",
          marginBottom: "0.6rem",
        }}>
          {v.title}
        </h2>
        <p style={{
          fontFamily: "var(--font-body)",
          fontSize: "0.95rem",
          lineHeight: 1.65,
          color: "var(--text-faint)",
          marginBottom: "1.1rem",
          maxWidth: 540,
        }}>
          {v.summary}
        </p>
        <Link href={v.bulletinSlug ? `/bulletin/${v.bulletinSlug}` : `/verdicts/${v.slug}`} style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.4rem",
          fontFamily: "var(--font-body)",
          fontSize: "0.72rem",
          fontWeight: 700,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "var(--gold)",
          textDecoration: "none",
          borderBottom: "1px solid var(--gold-line)",
          paddingBottom: "2px",
        }}>
          {v.bulletinSlug ? "Read in today's bulletin →" : "Read the verdict →"}
        </Link>
      </div>
    );
  })()}
</div>

          {/* Right column — recent articles */}
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
                Recent
              </div>
              <div style={{ display: "flex", gap: "0.75rem" }}>
                {[
                  { href: "/verdicts", label: "Verdicts" },
                  { href: "/briefings", label: "Briefings" },
                  { href: "/desk", label: "The Desk" },
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

            {recentPosts.map((p) => (
              <SmallCard
                key={`${p.type}-${p.slug}`}
                kicker={`${p.date}${p.readTime ? ` · ${p.readTime}` : ""} · ${p.type}`}
                title={p.title}
                desc={p.summary}
                href={postHref(p)}
              />
            ))}
          </div>
        </div>

        <style jsx>{`
          .small-card:hover { opacity: 0.75; }
          .format-card:hover { border-color: var(--gold-line) !important; }
          @media (max-width: 900px) {
            .homegrid { grid-template-columns: 1fr !important; }
            .masthead { grid-template-columns: 1fr !important; gap: 1.5rem !important; margin-bottom: 1.75rem !important; }
            .format-grid { grid-template-columns: 1fr 1fr !important; border-left: none !important; padding-left: 0 !important; border-top: 1px solid var(--border) !important; padding-top: 1.5rem !important; }
            .recent-sidebar { border-top: 1px solid var(--border); padding-top: 1.5rem; margin-top: 0.25rem; }
          }
          @media (max-width: 600px) {
            main { padding-top: 1.5rem !important; padding-bottom: 4rem !important; }
            .format-grid { grid-template-columns: 1fr !important; }
            .stat-grid { grid-template-columns: 1fr !important; }
            .tab-label { display: none; }
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

  // Get latest bulletin
  let latestBulletin: BulletinPreview = null;
  try {
    const { getAllBulletinsMeta } = require("../lib/bulletin");
    const bulletins = getAllBulletinsMeta();
    if (bulletins.length > 0) {
      const b = bulletins[0];
      latestBulletin = {
        slug: b.slug,
        title: b.title,
        date: b.date,
        subhead: b.subhead,
      };
    }
  } catch { /* no bulletins yet */ }

  return {
    props: { latestVerdicts, latestBriefings, latestDesk, latestBulletin },
  };
};