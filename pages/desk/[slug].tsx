import { GetStaticPaths, GetStaticProps } from "next";
import { useEffect, useState } from "react";
import { getAllDeskMeta, getDeskBySlug } from "../../lib/desk";
import { injectGlossarySpans } from "../../lib/injectGlossarySpans";
import GlobalQuestion from "../../components/GlobalQuestion";
import ArticleShell, { GlossaryEntry } from "../../components/ArticleShell";
import OgHead from "../../components/OgHead";

type DeskArticleMeta = {
  title: string;
  summary: string;
  date: string;
  question: string;
  questionId: string | null;
  readTime?: string | null;
  glossary?: GlossaryEntry[] | null;
};

const DESK_TOC = [
  { id: "what-the-question-is-really-asking", label: "What it's really asking" },
  { id: "the-long-answer",                    label: "The long answer" },
  { id: "the-honest-uncertainty",             label: "The honest uncertainty" },
  { id: "bottom-line",                        label: "Bottom line" },
];

function JumpTo({ hasGlossary, hasPoll }: { hasGlossary: boolean; hasPoll: boolean }) {
  return (
    <div style={{ paddingTop: "1.25rem" }}>
      <div className="eyebrow" style={{ marginBottom: "1rem" }}>Jump to</div>
      <div style={{
        border: "1px solid var(--border-light)", borderRadius: 4,
        padding: "0.75rem 0", background: "var(--bg2)",
      }}>
        {DESK_TOC.map((item) => (
          <a
            key={item.id}
            href={"#" + item.id}
            style={{
              textDecoration: "none", display: "flex", alignItems: "baseline",
              justifyContent: "space-between", gap: 10, padding: "0.5rem 1rem",
              fontFamily: "var(--font-body)", fontSize: "0.82rem", fontWeight: 400,
              color: "var(--text-dim)", lineHeight: 1.4,
              transition: "color 0.15s ease, background 0.15s ease",
            }}
          >
            <span>{item.label}</span>
            <span style={{ color: "var(--text-faint)", fontSize: "0.7rem" }}>&#8594;</span>
          </a>
        ))}
        {hasPoll && (
          <a href="#tpv-question" style={{
            textDecoration: "none", display: "flex", alignItems: "baseline",
            justifyContent: "space-between", gap: 10, padding: "0.6rem 1rem",
            marginTop: "0.25rem", borderTop: "1px solid var(--border)",
            fontFamily: "var(--font-body)", fontSize: "0.82rem", fontWeight: 500,
            color: "var(--gold)", lineHeight: 1.4,
          }}>
            <span>Question</span>
            <span style={{ fontSize: "0.7rem" }}>&#8594;</span>
          </a>
        )}
        {hasGlossary && (
          <a href="#tpv-glossary" style={{
            textDecoration: "none", display: "flex", alignItems: "baseline",
            justifyContent: "space-between", gap: 10, padding: "0.6rem 1rem",
            marginTop: "0.25rem", borderTop: "1px solid var(--border)",
            fontFamily: "var(--font-body)", fontSize: "0.82rem", fontWeight: 500,
            color: "var(--text-faint)", lineHeight: 1.4,
          }}>
            <span>Key terms</span>
            <span style={{ fontSize: "0.7rem" }}>&#8594;</span>
          </a>
        )}
      </div>
      <div style={{
        marginTop: "0.75rem", fontFamily: "var(--font-body)", fontSize: "0.72rem",
        lineHeight: 1.6, color: "var(--text-faint)", fontStyle: "italic",
      }}>
        Sections appear only if they exist in this article.
      </div>
      <style jsx>{`
        a:hover { color: var(--text) !important; background: var(--bg3); }
      `}</style>
    </div>
  );
}

function useReaderCount(questionId?: string | null): number | null {
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
      } catch { /* fail silently */ }
    })();
    return () => { alive = false; };
  }, [questionId]);
  return count;
}

export default function DeskArticlePage({
  meta, contentHtmlNoSources, sourcesHtml, slug,
}: {
  meta: DeskArticleMeta; contentHtmlNoSources: string; sourcesHtml: string | null; slug: string;
}) {
  const hasGlossary = !!(meta.glossary && meta.glossary.length > 0);
  const hasPoll = !!meta.questionId;
  const readerCount = useReaderCount(meta.questionId);

  return (
    <>
      <OgHead title={meta.title} date={meta.date} type="briefing" slug={`desk/${slug}`} />
      <ArticleShell
        slug={`desk/${slug}`}
        type="The Desk"
        readerCount={readerCount}
        title={meta.title}
        date={meta.date}
        readTime={meta.readTime ?? undefined}
        summary={meta.summary}
        backHref="/desk"
        showSummary={false}
        glossary={meta.glossary}
        rightRail={<JumpTo hasGlossary={hasGlossary} hasPoll={hasPoll} />}
      >
        <div style={{
          borderLeft: "2px solid var(--border-light)",
          paddingLeft: "1.25rem",
          marginBottom: "2rem",
          marginTop: "1.5rem",
        }}>
          <div style={{
            fontFamily: "var(--font-body)", fontSize: "0.62rem", fontWeight: 700,
            letterSpacing: "0.1em", textTransform: "uppercase",
            color: "var(--text-faint)", marginBottom: "0.5rem",
          }}>
            Reader question
          </div>
          <div style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(1rem, 2vw, 1.2rem)",
            fontStyle: "italic",
            color: "var(--text-dim)",
            lineHeight: 1.45,
          }}>
            &ldquo;{meta.question}&rdquo;
          </div>
        </div>

        <article className="tpv-prose" dangerouslySetInnerHTML={{ __html: contentHtmlNoSources }} />

        {hasPoll && (
          <div style={{ marginTop: 16 }}>
            <div id="tpv-question" style={{ height: 1, scrollMarginTop: 160 }} />
            <GlobalQuestion questionId={meta.questionId!} />
          </div>
        )}

        {sourcesHtml && (
          <div dangerouslySetInnerHTML={{ __html: sourcesHtml }} />
        )}
      </ArticleShell>
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

  let html = content;
  if (meta.glossary && meta.glossary.length > 0) {
    html = injectGlossarySpans(html, meta.glossary);
  }

  // Split sources block out of content so it renders after the poll
  const sourcesMatch = html.match(/<div class="tpv-sources">[\s\S]*<\/div>\s*$/);
  const sourcesHtml = sourcesMatch ? sourcesMatch[0] : null;
  const contentHtmlNoSources = sourcesHtml ? html.slice(0, html.lastIndexOf(sourcesHtml)) : html;

  return { props: { meta, contentHtmlNoSources, sourcesHtml, slug } };
};
