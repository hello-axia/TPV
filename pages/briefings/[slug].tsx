import { GetStaticPaths, GetStaticProps } from "next";
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import { getAllBriefingsMeta, getBriefingBySlug } from "../../lib/briefings";
import GlobalQuestion from "../../components/GlobalQuestion";
import ArticleShell from "../../components/ArticleShell";

type BriefingMeta = {
  title: string;
  date: string;
  summary: string;
  readTime?: string;
  questionId?: string;
};

type HtmlParts = { before: string; after: string; hasMarker: boolean };

type TocItem = { id: string; label: string };

const BRIEFING_TOC_ORDER: TocItem[] = [
  { id: "the-recap", label: "The recap" },
  { id: "the-significance", label: "The significance" },
  { id: "the-context", label: "The context" },
  { id: "the-stakes", label: "The stakes" },
  { id: "the-next-steps-to-watch-for", label: "The next steps to watch for" },
  { id: "the-takeaway", label: "The takeaway" },
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

export default function BriefingPostPage({
  meta,
  contentHtmlParts,
  toc,
  hasPoll,
}: {
  meta: BriefingMeta;
  contentHtmlParts: HtmlParts;
  toc: TocItem[];
  hasPoll: boolean;
}) {
  return (
    <ArticleShell
      type="Briefing"
      title={meta.title}
      date={meta.date}
      readTime={meta.readTime}
      summary={meta.summary}
      backHref="/briefings"
      rightRail={
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
            Jump to
          </div>

          <div
            style={{
              marginTop: 14,
              border: "1px solid #e5e7eb",
              borderRadius: 14,
              padding: 14,
              background: "#fff",
            }}
          >
            <div style={{ display: "grid", gap: 10 }}>
              {toc.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  style={{
                    textDecoration: "none",
                    color: "#111827",
                    fontWeight: 800,
                    fontSize: 13,
                    lineHeight: 1.4,
                    display: "flex",
                    alignItems: "baseline",
                    justifyContent: "space-between",
                    gap: 10,
                  }}
                >
                  <span style={{ color: "#111827" }}>{item.label}</span>
                  <span style={{ color: "#9ca3af", fontWeight: 900 }}>→</span>
                </a>
              ))}

              {hasPoll ? (
                <a
                  href="#tpv-question"
                  style={{
                    marginTop: 4,
                    paddingTop: 10,
                    borderTop: "1px solid #e5e7eb",
                    textDecoration: "none",
                    color: "#111827",
                    fontWeight: 900,
                    fontSize: 13,
                    display: "flex",
                    alignItems: "baseline",
                    justifyContent: "space-between",
                    gap: 10,
                  }}
                >
                  <span>Question</span>
                  <span style={{ color: "#9ca3af", fontWeight: 900 }}>→</span>
                </a>
              ) : null}
            </div>

            <div style={{ marginTop: 12, fontSize: 12, lineHeight: 1.6, color: "#6b7280" }}>
              Sections appear only if they exist in this article.
            </div>
          </div>
        </div>
      }
    >
      <article className="tpv-prose" dangerouslySetInnerHTML={{ __html: contentHtmlParts.before }} />

      {hasPoll ? (
        <div style={{ marginTop: 16 }}>
<div id="tpv-question" style={{ height: 1 }} />          <GlobalQuestion questionId={meta.questionId!} />
        </div>
      ) : null}

      <article className="tpv-prose" dangerouslySetInnerHTML={{ __html: contentHtmlParts.after }} />

      <style jsx>{`
        .tpv-prose :global(h1),
        .tpv-prose :global(h2),
        .tpv-prose :global(h3) {
          margin-top: 22px;
          margin-bottom: 8px;
          letter-spacing: -0.4px;
          color: #111827;
        
           scroll-margin-top: 120px;
           }

           :global(#tpv-question) {
  scroll-margin-top: 120px;
}

        .tpv-prose :global(h2) {
          font-size: 22px;
          line-height: 1.18;
          font-weight: 900;
          letter-spacing: -0.6px;
        }

        .tpv-prose :global(h2):not(#sources) {
          padding-top: 18px;
          border-top: 1px solid #e5e7eb;
        }

        .tpv-prose :global(p) {
          margin: 10px 0;
          font-size: 16px;
          line-height: 1.75;
          color: #374151;
        }

        .tpv-prose :global(ol),
        .tpv-prose :global(ul) {
          padding-left: 20px;
          margin: 10px 0;
          line-height: 1.85;
          font-size: 16px;
          color: #374151;
        }

        .tpv-prose :global(li) {
          margin: 6px 0;
        }

        .tpv-prose :global(a) {
          color: #1f4fbf;
          text-decoration: none;
          font-weight: 600;
        }
        .tpv-prose :global(a:hover) {
          text-decoration: underline;
        }

        article :global(h2#sources) {
          font-size: 16px;
          margin-top: 36px;
          margin-bottom: 12px;
          letter-spacing: -0.2px;
          color: #374151;
          padding-top: 16px;
          border-top: 1px solid #e5e7eb;
        }

        .tpv-prose :global(.footnotes) {
          margin-top: 0;
          padding-top: 0;
          border-top: none;
          font-size: 13px;
          line-height: 1.5;
          color: #6b7280;
        }

        .tpv-prose :global(.footnotes hr) {
          display: none !important;
        }

        .tpv-prose :global(.footnotes h2) {
          display: none !important;
        }

        .tpv-prose :global(.footnotes ol) {
          padding-left: 18px;
          margin: 0;
        }

        .tpv-prose :global(.footnotes li) {
          margin: 4px 0;
        }

        .tpv-prose :global(.footnotes a) {
          font-weight: 400;
          color: #4b5563;
          text-decoration: none;
        }

        .tpv-prose :global(.footnotes a:hover) {
          text-decoration: underline;
        }

        .tpv-prose :global(.footnotes a[aria-label="Back to content"]),
        .tpv-prose :global(.footnotes a.footnote-backref),
        .tpv-prose :global(.footnotes .footnote-backref),
        .tpv-prose :global(.footnotes a[data-footnote-backref]),
        .tpv-prose :global(.footnotes a[href^="#fnref"]) {
          display: none !important;
        }
      `}</style>
    </ArticleShell>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const items = getAllBriefingsMeta();
  return {
    paths: items.map((b) => ({ params: { slug: b.slug } })),
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const slug = String(params?.slug);
  const { meta, content } = getBriefingBySlug(slug);

  const MARKER_RE = /<!--\s*TPV_QUESTION:[\s\S]*?-->/;
  const POLL_DIV = `<div data-tpv-poll="1"></div>`;

  const contentNormalized = content.replace(/\bTPV_QUESTION_TOKEN\b/g, "<!-- TPV_QUESTION:ANY -->");
  const hasMarker = MARKER_RE.test(contentNormalized);

  const contentWithDiv = hasMarker ? contentNormalized.replace(MARKER_RE, POLL_DIV) : contentNormalized;

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

  const html = processed.toString();

  const splitIndex = html.indexOf(POLL_DIV);
  const before = splitIndex >= 0 ? html.slice(0, splitIndex) : html;
  const after = splitIndex >= 0 ? html.slice(splitIndex + POLL_DIV.length) : "";

  const presentIds = extractPresentHeadingIds(html);
  const toc = BRIEFING_TOC_ORDER.filter((item) => presentIds.has(item.id));

  const hasPoll2 = splitIndex >= 0 && !!(meta as any).questionId;

  return {
    props: {
      meta,
      contentHtmlParts: {
        before,
        after,
        hasMarker: splitIndex >= 0,
      },
      toc,
      hasPoll: hasPoll2,
    },
  };
};