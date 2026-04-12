import { GetStaticPaths, GetStaticProps } from "next";
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import { getAllVerdictsMeta, getVerdictBySlug } from "../../lib/verdicts";
import { injectGlossarySpans } from "../../lib/injectGlossarySpans";
import { useEffect, useState } from "react";
import GlobalQuestion from "../../components/GlobalQuestion";
import ArticleShell, { GlossaryEntry } from "../../components/ArticleShell";
import OgHead from "../../components/OgHead";

type VerdictMeta = {
  title: string;
  date: string;
  summary: string;
  readTime?: string;
  questionId?: string;
  tldr?: string[];
  keyTension?: string;
  glossary?: GlossaryEntry[] | null;
};

type HtmlParts = { before: string; after: string; hasMarker: boolean };
type TocItem = { id: string; label: string };

const VERDICT_TOC_ORDER: TocItem[] = [
  { id: "the-overview",         label: "The overview" },
  { id: "the-disagreement",     label: "The disagreement" },
  { id: "the-values",           label: "The values" },
  { id: "the-definitions",      label: "The definitions" },
  { id: "the-facts",            label: "The facts" },
  { id: "the-forecasts",        label: "The forecasts" },
  { id: "the-incentives",       label: "The incentives" },
  { id: "the-persuasion-point", label: "The persuasion point" },
  { id: "the-conclusion",       label: "The conclusion" },
  { id: "the-architecture",     label: "The architecture" },
  { id: "the-record",           label: "The record" },
  { id: "the-verdict",          label: "The verdict" },
];



function extractPresentHeadingIds(html: string): Set<string> {
  const ids = new Set<string>();
  const re = /<h[1-6][^>]*\sid="([^"]+)"[^>]*>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    if (m[1]) ids.add(m[1]);
  }
  return ids;
}

function TocLink({ id, label }: { id: string; label: string }) {
  return (
    <a
      href={"#" + id}
      className="toc-link"
      style={{
        textDecoration: "none", display: "flex", alignItems: "baseline",
        justifyContent: "space-between", gap: 10, padding: "0.5rem 1rem",
        fontFamily: "var(--font-body)", fontSize: "0.82rem", fontWeight: 400,
        color: "var(--text-dim)", lineHeight: 1.4,
        transition: "color 0.15s ease, background 0.15s ease",
      }}
    >
      <span>{label}</span>
      <span style={{ color: "var(--text-faint)", fontSize: "0.7rem" }}>&#8594;</span>
    </a>
  );
}

function JumpTo({ toc, hasPoll, hasGlossary }: {
  toc: TocItem[];
  hasPoll: boolean;
  hasGlossary: boolean;
}) {
  return (
    <div style={{ paddingTop: "1.25rem" }}>
      <div className="eyebrow" style={{ marginBottom: "1rem" }}>Jump to</div>
      <div style={{
        border: "1px solid var(--border-light)", borderRadius: 4,
        padding: "0.75rem 0", background: "var(--bg2)",
      }}>
        {toc.map((item) => (
          <TocLink key={item.id} id={item.id} label={item.label} />
        ))}
        {hasPoll && (
          <a href="#tpv-question" style={{
            textDecoration: "none", display: "flex", alignItems: "baseline",
            justifyContent: "space-between", gap: 10, padding: "0.6rem 1rem",
            marginTop: "0.25rem", borderTop: "1px solid var(--border)",
            fontFamily: "var(--font-body)", fontSize: "0.82rem", fontWeight: 500,
            color: "var(--gold)", lineHeight: 1.4, transition: "opacity 0.15s ease",
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
            color: "var(--text-faint)", lineHeight: 1.4, transition: "opacity 0.15s ease",
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
        .toc-link:hover { color: var(--text) !important; background: var(--bg3); }
      `}</style>
    </div>
  );
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
      } catch { /* fail silently */ }
    })();
    return () => { alive = false; };
  }, [questionId]);
  return count;
}

export default function VerdictPostPage({ meta, contentHtmlParts, toc, hasPoll, slug }: {
  meta: VerdictMeta; contentHtmlParts: HtmlParts; toc: TocItem[]; hasPoll: boolean; slug: string;

}) {
  const readerCount = useReaderCount(meta.questionId);
  const hasGlossary = !!(meta.glossary && meta.glossary.length > 0);

  return (
    <>
    <OgHead title={meta.title} date={meta.date} type="verdict" slug={`verdicts/${slug}`} />
    <ArticleShell
    slug={`verdicts/${slug}`}
      type="Verdict"
      readerCount={readerCount}
      title={meta.title}
      date={meta.date}
      readTime={meta.readTime}
      summary={meta.summary}
      backHref="/verdicts"
      tldr={meta.tldr}
      keyTension={meta.keyTension}
      showSummary={false}
      glossary={meta.glossary}
      rightRail={<JumpTo toc={toc} hasPoll={hasPoll} hasGlossary={hasGlossary} />}
    >
      <article className="tpv-prose" dangerouslySetInnerHTML={{ __html: contentHtmlParts.before }} />
      {hasPoll && (
        <div style={{ marginTop: 16 }}>
          <div id="tpv-question" style={{ height: 1, scrollMarginTop: 160 }} />
          <GlobalQuestion questionId={meta.questionId!} />
        </div>
      )}
      <article className="tpv-prose" dangerouslySetInnerHTML={{ __html: contentHtmlParts.after }} />
    </ArticleShell>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const items = getAllVerdictsMeta();
  return {
    paths: items.map((v) => ({ params: { slug: v.slug } })),
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const slug = String(params?.slug);
  const { meta, content, isHtml } = getVerdictBySlug(slug);
  const POLL_DIV = `<div data-tpv-poll="1"></div>`;

  let html: string;

  if (isHtml) {
    html = content.replace(
      /<div[^>]+id="tpv-poll-marker"[^>]*><\/div>/,
      POLL_DIV
    );
  } else {
    const MARKER_RE = /<!--\s*TPV_QUESTION:[\s\S]*?-->/;
    const contentNormalized = content.replace(/\bTPV_QUESTION_TOKEN\b/g, "<!-- TPV_QUESTION:ANY -->");
    const contentWithDiv = MARKER_RE.test(contentNormalized)
      ? contentNormalized.replace(MARKER_RE, POLL_DIV)
      : contentNormalized;
    const processed = await remark()
      .use(remarkGfm)
      .use(remarkRehype, { allowDangerousHtml: true })
      .use(rehypeSlug)
      .use(rehypeAutolinkHeadings, {
        behavior: "append",
        properties: { className: ["heading-anchor"] },
      })
      .use(rehypeStringify, { allowDangerousHtml: true })
      .process(contentWithDiv);
    html = processed.toString();
  }

  // Inject glossary spans at build time — before React ever touches the HTML.
  // This avoids dangerouslySetInnerHTML re-renders wiping client-side DOM mutations.
  if (!isHtml && meta.glossary && meta.glossary.length > 0) {
    html = injectGlossarySpans(html, meta.glossary);
  }

  const splitIndex = html.indexOf(POLL_DIV);
  const before = splitIndex >= 0 ? html.slice(0, splitIndex) : html;
  const after  = splitIndex >= 0 ? html.slice(splitIndex + POLL_DIV.length) : "";
  const presentIds = extractPresentHeadingIds(html);
  const toc = VERDICT_TOC_ORDER.filter((item) => presentIds.has(item.id));
  const hasPoll = splitIndex >= 0 && !!(meta as any).questionId;

  return { props: { meta, contentHtmlParts: { before, after, hasMarker: splitIndex >= 0 }, toc, hasPoll, slug }, };
};