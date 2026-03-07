import { GetStaticPaths, GetStaticProps } from "next";
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import { getAllVerdictsMeta, getVerdictBySlug } from "../../lib/verdicts";
import GlobalQuestion from "../../components/GlobalQuestion";
import ArticleShell from "../../components/ArticleShell";

type VerdictMeta = {
  title: string;
  date: string;
  summary: string;
  readTime?: string;
  questionId?: string;
};

type HtmlParts = { before: string; after: string; hasMarker: boolean };
type TocItem = { id: string; label: string };

const VERDICT_TOC_ORDER: TocItem[] = [
  { id: "the-overview", label: "The overview" },
  { id: "the-disagreement", label: "The disagreement" },
  { id: "the-values", label: "The values" },
  { id: "the-definitions", label: "The definitions" },
  { id: "the-facts", label: "The facts" },
  { id: "the-forecasts", label: "The forecasts" },
  { id: "the-incentives", label: "The incentives" },
  { id: "the-persuasion-point", label: "The persuasion point" },
  { id: "the-conclusion", label: "The conclusion" },
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
        textDecoration: "none",
        display: "flex",
        alignItems: "baseline",
        justifyContent: "space-between",
        gap: 10,
        padding: "0.5rem 1rem",
        fontFamily: "var(--font-body)",
        fontSize: "0.82rem",
        fontWeight: 400,
        color: "var(--text-dim)",
        lineHeight: 1.4,
        transition: "color 0.15s ease, background 0.15s ease",
      }}
    >
      <span>{label}</span>
      <span style={{ color: "var(--text-faint)", fontSize: "0.7rem" }}>&#8594;</span>
    </a>
  );
}

function JumpTo({ toc, hasPoll }: { toc: TocItem[]; hasPoll: boolean }) {
  return (
    <div style={{ paddingTop: "1.25rem" }}>
      <div className="eyebrow" style={{ marginBottom: "1rem" }}>Jump to</div>
      <div style={{
        border: "1px solid var(--border-light)",
        borderRadius: 4,
        padding: "0.75rem 0",
        background: "var(--bg2)",
      }}>
        {toc.map((item) => (
          <TocLink key={item.id} id={item.id} label={item.label} />
        ))}
        {hasPoll && (
          <a
            href="#tpv-question"
            style={{
              textDecoration: "none",
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
              gap: 10,
              padding: "0.6rem 1rem",
              marginTop: "0.25rem",
              borderTop: "1px solid var(--border)",
              fontFamily: "var(--font-body)",
              fontSize: "0.82rem",
              fontWeight: 500,
              color: "var(--gold)",
              lineHeight: 1.4,
              transition: "opacity 0.15s ease",
            }}
          >
            <span>Question</span>
            <span style={{ fontSize: "0.7rem" }}>&#8594;</span>
          </a>
        )}
      </div>
      <div style={{
        marginTop: "0.75rem",
        fontFamily: "var(--font-body)",
        fontSize: "0.72rem",
        lineHeight: 1.6,
        color: "var(--text-faint)",
        fontStyle: "italic",
      }}>
        Sections appear only if they exist in this article.
      </div>
      <style jsx>{`
        .toc-link:hover {
          color: var(--text) !important;
          background: var(--bg3);
        }
      `}</style>
    </div>
  );
}

export default function VerdictPostPage({
  meta,
  contentHtmlParts,
  toc,
  hasPoll,
}: {
  meta: VerdictMeta;
  contentHtmlParts: HtmlParts;
  toc: TocItem[];
  hasPoll: boolean;
}) {
  return (
    <ArticleShell
      type="Verdict"
      title={meta.title}
      date={meta.date}
      readTime={meta.readTime}
      summary={meta.summary}
      backHref="/verdicts"
      rightRail={<JumpTo toc={toc} hasPoll={hasPoll} />}
    >
      <article className="tpv-prose" dangerouslySetInnerHTML={{ __html: contentHtmlParts.before }} />
      {hasPoll && (
        <div style={{ marginTop: 16 }}>
          <div id="tpv-question" style={{ height: 1 }} />
          <GlobalQuestion questionId={meta.questionId!} />
        </div>
      )}
      <article className="tpv-prose" dangerouslySetInnerHTML={{ __html: contentHtmlParts.after }} />
      <style jsx>{`
        .tpv-prose :global(h1),
        .tpv-prose :global(h2),
        .tpv-prose :global(h3) {
          margin-top: 2rem;
          margin-bottom: 0.5rem;
          font-family: var(--font-display);
          font-weight: 400;
          color: var(--text);
          scroll-margin-top: 120px;
        }
        :global(#tpv-question) { scroll-margin-top: 120px; }
        .tpv-prose :global(h2) {
          font-size: clamp(1.1rem, 2.5vw, 1.4rem);
          line-height: 1.25;
          letter-spacing: -0.02em;
          padding-top: 1.5rem;
          border-top: 1px solid var(--border);
        }
        .tpv-prose :global(h3) {
          font-size: 1rem;
          font-family: var(--font-body);
          font-weight: 600;
          color: var(--text-dim);
          letter-spacing: 0.02em;
        }
        .tpv-prose :global(p) {
          margin: 0.75rem 0;
          font-family: var(--font-body);
          font-size: 1rem;
          line-height: 1.8;
          color: #d4cec8;
        }
        .tpv-prose :global(ol),
        .tpv-prose :global(ul) {
          padding-left: 1.25rem;
          margin: 0.75rem 0;
          line-height: 1.8;
          font-size: 1rem;
          color: #d4cec8;
          font-family: var(--font-body);
        }
        .tpv-prose :global(li) { margin: 0.4rem 0; }
        .tpv-prose :global(strong) { color: var(--text); font-weight: 600; }
        .tpv-prose :global(em) { color: var(--text-dim); }
        .tpv-prose :global(a) {
          color: var(--gold);
          text-decoration: none;
          border-bottom: 1px solid var(--gold-line);
          transition: border-color 0.15s ease;
        }
        .tpv-prose :global(a:hover) { border-color: var(--gold); }
        .tpv-prose :global(h2#sources) {
          font-size: 0.9rem;
          font-family: var(--font-body);
          font-weight: 600;
          margin-top: 2.5rem;
          margin-bottom: 0.75rem;
          color: var(--text-faint);
          padding-top: 1rem;
          border-top: 1px solid var(--border);
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }
        .tpv-prose :global(.footnotes) {
          margin-top: 1.5rem;
          font-size: 0.78rem;
          line-height: 1.6;
          color: var(--text-faint);
          font-family: var(--font-body);
        }
        .tpv-prose :global(.footnotes hr) { display: none !important; }
        .tpv-prose :global(.footnotes h2) { display: none !important; }
        .tpv-prose :global(.footnotes ol) { padding-left: 1.1rem; margin: 0; }
        .tpv-prose :global(.footnotes li) { margin: 0.3rem 0; }
        .tpv-prose :global(.footnotes a) {
          font-weight: 400;
          color: var(--text-faint);
          text-decoration: none;
          border-bottom: none;
        }
        .tpv-prose :global(.footnotes a:hover) { color: var(--text-dim); }
        .tpv-prose :global(.footnotes a[aria-label="Back to content"]),
        .tpv-prose :global(.footnotes a.footnote-backref),
        .tpv-prose :global(.footnotes .footnote-backref),
        .tpv-prose :global(.footnotes a[data-footnote-backref]),
        .tpv-prose :global(.footnotes a[href^="#fnref"]) { display: none !important; }
        .tpv-prose :global(.heading-anchor) { display: none; }
      `}</style>
    </ArticleShell>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const items = getAllVerdictsMeta();
  return { paths: items.map((v) => ({ params: { slug: v.slug } })), fallback: false };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const slug = String(params?.slug);
  const { meta, content } = getVerdictBySlug(slug);
  const MARKER_RE = /<!--\s*TPV_QUESTION:[\s\S]*?-->/;
  const POLL_DIV = `<div data-tpv-poll="1"></div>`;
  const contentNormalized = content.replace(/\bTPV_QUESTION_TOKEN\b/g, "<!-- TPV_QUESTION:ANY -->");
  const hasMarker = MARKER_RE.test(contentNormalized);
  const contentWithDiv = hasMarker ? contentNormalized.replace(MARKER_RE, POLL_DIV) : contentNormalized;
  const processed = await remark()
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings, { behavior: "append", properties: { className: ["heading-anchor"] } })
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(contentWithDiv);
  const html = processed.toString();
  const splitIndex = html.indexOf(POLL_DIV);
  const before = splitIndex >= 0 ? html.slice(0, splitIndex) : html;
  const after = splitIndex >= 0 ? html.slice(splitIndex + POLL_DIV.length) : "";
  const presentIds = extractPresentHeadingIds(html);
  const toc = VERDICT_TOC_ORDER.filter((item) => presentIds.has(item.id));
  const hasPoll = splitIndex >= 0 && !!(meta as any).questionId;
  return {
    props: {
      meta,
      contentHtmlParts: { before, after, hasMarker: splitIndex >= 0 },
      toc,
      hasPoll,
    },
  };
};
