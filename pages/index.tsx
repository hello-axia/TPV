import Link from "next/link";
import { GetStaticProps } from "next";
import GlobalQuestion from "../components/GlobalQuestion";
import { getAllVerdictsMeta, VerdictMeta } from "../lib/verdicts";
import { getAllBriefingsMeta, BriefingMeta } from "../lib/briefings";

type Post = {
  type: "Verdict" | "Briefing";
  slug: string;
  title: string;
  date: string; // "MM-DD-YYYY"
  summary: string;
  readTime?: string;
  questionId?: string;
};

function parseMDY(dateStr: string) {
  const [mm, dd, yyyy] = dateStr.split("-").map((x) => Number(x));
  if (!mm || !dd || !yyyy) return new Date(0);
  return new Date(yyyy, mm - 1, dd);
}

function SmallCard({
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
        borderTop: "1px solid #e5e7eb",
        paddingTop: 16,
      }}
    >
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
        <span>{kicker}</span>
      </div>

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

      <div
        style={{
          marginTop: 10,
          fontSize: 15,
          lineHeight: 1.65,
          color: "#374151",
        }}
      >
        {desc}
      </div>
    </Link>
  );
}

function Hero({ post }: { post: Post | null }) {
  if (!post) {
    return (
      <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: 16 }}>
        <div
          style={{
            fontSize: 12,
            fontWeight: 900,
            letterSpacing: 1.2,
            color: "#ef4444",
            textTransform: "uppercase",
          }}
        >
          Latest
        </div>
        <p style={{ marginTop: 12, color: "#6b7280", lineHeight: 1.7 }}>
          Add a Briefing or Verdict markdown file to see it here.
        </p>
      </div>
    );
  }

  const href = post.type === "Verdict" ? `/verdicts/${post.slug}` : `/briefings/${post.slug}`;

  return (
    <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: 16 }}>
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
        <span>{post.date}</span>
        {post.readTime ? (
          <span style={{ color: "rgba(239, 68, 68, 0.65)", fontWeight: 700 }}>
            • {post.readTime}
          </span>
        ) : null}
        <span style={{ color: "#9ca3af", fontWeight: 700 }}>• {post.type}</span>
      </div>

      {/* title */}
      <h2
        style={{
          marginTop: 12,
          fontSize: 44,
          lineHeight: 1.02,
          fontWeight: 900,
          letterSpacing: -1.1,
          marginBottom: 0,
          color: "#111827",
        }}
      >
        {post.title}
      </h2>

      {/* summary */}
      <p
        style={{
          marginTop: 14,
          color: "#374151",
          fontSize: 18,
          lineHeight: 1.7,
          maxWidth: 900,
        }}
      >
        {post.summary}
      </p>

      <div style={{ marginTop: 14 }}>
        <Link
          href={href}
          style={{
            color: "#111827",
            textDecoration: "none",
            fontWeight: 900,
            letterSpacing: -0.2,
          }}
        >
          Read →
        </Link>
      </div>

      {post.questionId ? (
        <div style={{ marginTop: 16 }}>
          <GlobalQuestion questionId={post.questionId} />
        </div>
      ) : null}
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
    <main style={{ maxWidth: 1120, margin: "0 auto", padding: "28px 14px 64px" }}>
      {/* Masthead */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1.2fr",
          gap: 32,
          alignItems: "center",
        }}
      >
        {/* Left */}
        <div>
          <div
            style={{
              fontSize: 12,
              fontWeight: 900,
              letterSpacing: 1.2,
              color: "#ef4444",
              textTransform: "uppercase",
            }}
          >
            TPV
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
            News, structured
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

          </p>
        </div>

        {/* Right */}
        <div
          style={{
            borderLeft: "1px solid #e5e7eb",
            paddingLeft: 24,
            fontSize: 13,
            lineHeight: 1.7,
            color: "#4b5563",
          }}
        >
          <div
            style={{
              fontSize: 11,
              letterSpacing: 1.4,
              textTransform: "uppercase",
              color: "#6b7280",
              fontWeight: 900,
              marginBottom: 6,
            }}
          >
            Publishing Commitment
          </div>
          Two structured analyses weekly — <strong>Briefing</strong> (Tue) and{" "}
          <strong>Verdict</strong> (Fri). Coverage is limited to developments of
          structural or national significance; TPV is not a breaking-news service.
        </div>
      </div>

      <div style={{ borderTop: "1px solid #e5e7eb", margin: "18px 0 22px" }} />

      {/* Hero + Below (layout unchanged) */}
      <div
        className="homegrid"
        style={{
          display: "grid",
          gridTemplateColumns: "1.6fr 1fr",
          gap: 18,
          alignItems: "start",
        }}
      >
        <Hero post={hero} />

        <div style={{ display: "grid", gap: 16 }}>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 900, color: "#111827" }}>More recent</div>

            <div style={{ display: "flex", gap: 12 }}>
              <Link
                href="/briefings"
                style={{
                  color: "#6b7280",
                  textDecoration: "none",
                  fontSize: 13,
                  fontWeight: 800,
                }}
              >
                Briefings
              </Link>
              <Link
                href="/verdicts"
                style={{
                  color: "#6b7280",
                  textDecoration: "none",
                  fontSize: 13,
                  fontWeight: 800,
                }}
              >
                Verdicts
              </Link>
            </div>
          </div>

          {below.map((p) => {
            const kicker = `${p.date}${
              p.readTime ? ` • ${p.readTime}` : ""
            } • ${p.type}`;

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
        @media (max-width: 980px) {
          .homegrid {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 900px) {
          main {
            padding-left: 14px !important;
            padding-right: 14px !important;
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