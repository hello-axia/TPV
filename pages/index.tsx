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
        padding: 16,
      }}
    >
      <div
        style={{
          fontSize: 12,
          letterSpacing: 1,
          color: "#6b7280",
          textTransform: "uppercase",
        }}
      >
        {kicker}
      </div>

      <div
        style={{
          marginTop: 8,
          fontSize: 18,
          fontWeight: 800,
          letterSpacing: -0.3,
          lineHeight: 1.2,
        }}
      >
        {title}
      </div>

      <div style={{ marginTop: 8, color: "#6b7280", lineHeight: 1.65 }}>
        {desc}
      </div>
    </Link>
  );
}

function Hero({ post }: { post: Post | null }) {
  if (!post) {
    return (
      <div style={{ border: "1px solid #e5e7eb", background: "#f9fafb", padding: 18 }}>
        <div style={{ fontSize: 12, letterSpacing: 1, color: "#6b7280", textTransform: "uppercase" }}>
          Latest
        </div>
        <p style={{ marginTop: 10, color: "#6b7280", lineHeight: 1.7 }}>
          Add a Briefing or Verdict markdown file to see it here.
        </p>
      </div>
    );
  }

  const href =
    post.type === "Verdict"
      ? `/verdicts/${post.slug}`
      : `/briefings/${post.slug}`;

  return (
    <div style={{ border: "1px solid #e5e7eb", background: "#f9fafb", padding: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div style={{ fontSize: 12, letterSpacing: 1, color: "#6b7280", textTransform: "uppercase" }}>
          Latest {post.type}
        </div>
        <div style={{ fontSize: 12, color: "#6b7280" }}>
          {post.date}
          {post.readTime ? ` • ${post.readTime}` : ""}
        </div>
      </div>

      <h2 style={{ marginTop: 12, fontSize: 32, fontWeight: 900, letterSpacing: -0.9 }}>
        {post.title}
      </h2>

      <p style={{ marginTop: 12, color: "#6b7280", lineHeight: 1.75 }}>
        {post.summary}
      </p>

      <div style={{ marginTop: 14 }}>
        <Link
          href={href}
          style={{ color: "#1f4fbf", textDecoration: "none", fontWeight: 700 }}
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
    <main style={{ maxWidth: 1120, margin: "0 auto", padding: "32px 24px 72px" }}>
      
{/* Masthead */}
<div
  style={{
    display: "grid",
    gridTemplateColumns: "1fr 1.2fr",
    gap: 32,
    alignItems: "center", // 👈 THIS fixes the alignment
  }}
>
  {/* Left */}
  <div>
    <h1 style={{ fontSize: 48, fontWeight: 900, letterSpacing: -1.3, margin: 0 }}>
      TPV
    </h1>

    <p style={{ marginTop: 8, color: "#6b7280", fontSize: 20 }}>
      <em>News, Structured.</em>
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
        fontWeight: 800,
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

      {/* Hero + Below */}
      <div
        className="homegrid"
        style={{
          marginTop: 22,
          paddingTop: 18,
          borderTop: "1px solid #e5e7eb",
          display: "grid",
          gridTemplateColumns: "1.6fr 1fr",
          gap: 16,
          alignItems: "start",
        }}
      >
        <Hero post={hero} />

        <div style={{ display: "grid", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
            <div style={{ fontSize: 14, fontWeight: 800 }}>More recent</div>

            <div style={{ display: "flex", gap: 12 }}>
              <Link href="/briefings" style={{ color: "#6b7280", textDecoration: "none", fontSize: 13 }}>
                Briefings
              </Link>
              <Link href="/verdicts" style={{ color: "#6b7280", textDecoration: "none", fontSize: 13 }}>
                Verdicts
              </Link>
            </div>
          </div>

          {below.map((p) => (
            <Card
              key={`${p.type}-${p.slug}`}
              kicker={`${p.type} • ${p.date}${p.readTime ? ` • ${p.readTime}` : ""}`}
              title={p.title}
              desc={p.summary}
              href={p.type === "Verdict" ? `/verdicts/${p.slug}` : `/briefings/${p.slug}`}
            />
          ))}
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 980px) {
          .homegrid {
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