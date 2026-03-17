import { GetStaticPaths, GetStaticProps } from "next";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getAllDeskMeta, getDeskBySlug } from "../../lib/desk";
import { injectGlossarySpans } from "../../lib/injectGlossarySpans";
import GlobalQuestion from "../../components/GlobalQuestion";
import OgHead from "../../components/OgHead";

function ReadingProgress() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    function update() {
      const el = document.documentElement;
      const scrolled = el.scrollTop || document.body.scrollTop;
      const total = el.scrollHeight - el.clientHeight;
      setProgress(total > 0 ? Math.min(100, (scrolled / total) * 100) : 0);
    }
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);
  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 2, zIndex: 100, background: "var(--border)" }}>
      <div style={{ height: "100%", width: `${progress}%`, background: "var(--gold)", transition: "width 0.1s linear" }} />
    </div>
  );
}

function formatDate(dateStr: string) {
  if (!dateStr) return "";
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

type DeskArticleMeta = {
  title: string;
  summary: string;
  date: string;
  question: string;
  questionId: string | null;
};

export default function DeskArticlePage({
  meta,
  contentHtml,
  slug,
}: {
  meta: DeskArticleMeta;
  contentHtml: string;
  slug: string;
}) {
  return (
    <>
      <OgHead title={meta.title} date={meta.date} type="briefing" slug={`desk/${slug}`} />
      <ReadingProgress />
      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "2.5rem 1.25rem 5rem" }}>

        {/* Back link */}
        <div style={{ marginBottom: "2rem" }}>
          <Link href="/desk" style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.65rem",
            fontWeight: 600,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--text-faint)",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.3rem",
            borderBottom: "1px solid var(--border)",
            paddingBottom: 1,
          }}>
            ← The Desk
          </Link>
        </div>

        {/* Article header */}
        <div style={{ maxWidth: 720, marginBottom: "2rem" }}>
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
            <span>{formatDate(meta.date)}</span>
            <span style={{ color: "var(--gold)" }}>· The Desk</span>
          </div>

          {/* Original question */}
          <div style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.72rem",
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--text-faint)",
            marginBottom: "0.5rem",
          }}>
            Reader question
          </div>
          <div style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(1rem, 2.5vw, 1.35rem)",
            fontStyle: "italic",
            color: "var(--text-dim)",
            lineHeight: 1.45,
            marginBottom: "1.5rem",
            paddingLeft: "1.25rem",
            borderLeft: "2px solid var(--border-light)",
          }}>
            "{meta.question}"
          </div>

          {/* Article title */}
          <h1 style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(1.9rem, 4.5vw, 3rem)",
            fontWeight: 400,
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            color: "var(--text)",
            marginBottom: "0.75rem",
          }}>
            {meta.title}
          </h1>

          <div style={{ width: 36, height: 2, background: "var(--gold)", margin: "1.25rem 0" }} />

          <p style={{
            fontFamily: "var(--font-body)",
            fontSize: "1.05rem",
            lineHeight: 1.75,
            color: "var(--text-dim)",
            fontStyle: "italic",
          }}>
            {meta.summary}
          </p>
        </div>

        <div style={{ borderTop: "1px solid var(--border)", margin: "2rem 0" }} />

        {/* Article content */}
        <div style={{ maxWidth: 720 }}>
          <article
            className="tpv-prose"
            dangerouslySetInnerHTML={{ __html: contentHtml }}
          />

          {/* Poll if present */}
          {meta.questionId && (
            <div style={{ marginTop: "2.5rem" }}>
              <div id="tpv-question" style={{ height: 1, scrollMarginTop: 120 }} />
              <GlobalQuestion questionId={meta.questionId} />
            </div>
          )}

          {/* Footer nav */}
          <div style={{
            marginTop: "3rem",
            paddingTop: "2rem",
            borderTop: "1px solid var(--border)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "1rem",
          }}>
            <Link href="/desk" style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.72rem",
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--text-faint)",
              textDecoration: "none",
            }}>
              ← Back to The Desk
            </Link>
            <Link href="/desk/ask" style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.72rem",
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--gold)",
              textDecoration: "none",
              border: "1px solid var(--gold-line)",
              padding: "8px 14px",
              borderRadius: 3,
            }}>
              Ask a question →
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const items = getAllDeskMeta();
  return {
    paths: items.map((item) => ({ params: { slug: item.slug } })),
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const slug = String(params?.slug);
  const { meta, content } = getDeskBySlug(slug);

  return {
    props: {
      meta,
      contentHtml: content,
      slug,
    },
  };
};