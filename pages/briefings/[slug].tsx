import { GetStaticPaths, GetStaticProps } from "next";
import Link from "next/link";
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import { getAllBriefingsMeta, getBriefingBySlug } from "../../lib/briefings";
import GlobalQuestion from "../../components/GlobalQuestion";

type BriefingMeta = {
  title: string;
  date: string;
  summary: string;
  readTime?: string;
  questionId?: string;
};

type HtmlParts = { before: string; after: string; hasMarker: boolean };

export default function BriefingPostPage({
  meta,
  contentHtmlParts,
}: {
  meta: BriefingMeta;
  contentHtmlParts: HtmlParts;
}) {
  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: "42px 24px 72px" }}>
      <Link
        href="/briefings"
        style={{ textDecoration: "none", color: "#6b7280", fontSize: 14 }}
      >
        ← Back to Briefings
      </Link>

      <h1
        style={{
          marginTop: 14,
          fontSize: 44,
          fontWeight: 900,
          letterSpacing: -1.1,
          lineHeight: 1.05,
        }}
      >
        {meta.title}
      </h1>

      <div style={{ marginTop: 10, color: "#6b7280", fontSize: 14 }}>
        Briefing • {meta.date}
        {meta.readTime ? ` • ${meta.readTime}` : ""}
      </div>

      <p style={{ marginTop: 14, color: "#6b7280", lineHeight: 1.7, fontSize: 18 }}>
        {meta.summary}
      </p>

      {/* before marker */}
      <article
        style={{ marginTop: 26, lineHeight: 1.8, fontSize: 17 }}
        dangerouslySetInnerHTML={{ __html: contentHtmlParts.before }}
      />

      {/* inject poll at marker */}
      {contentHtmlParts.hasMarker && meta.questionId ? (
        <GlobalQuestion questionId={meta.questionId} />
      ) : null}

      {/* after marker (Sources) */}
      <article
        style={{ lineHeight: 1.8, fontSize: 17 }}
        dangerouslySetInnerHTML={{ __html: contentHtmlParts.after }}
      />

      <style jsx>{`
        article :global(h1),
        article :global(h2),
        article :global(h3) {
          margin-top: 22px;
          margin-bottom: 8px;
          letter-spacing: -0.4px;
        }

        article :global(h2) {
          font-size: 22px;
        }

        article :global(p) {
          margin: 10px 0;
        }

        article :global(ol),
        article :global(ul) {
          padding-left: 20px;
          margin: 10px 0;
        }

        article :global(li) {
          margin: 6px 0;
        }

        article :global(a) {
          color: #1f4fbf;
          text-decoration: none;
          font-weight: 600;
        }
        article :global(a:hover) {
          text-decoration: underline;
        }

        /* ===== Sources divider + appendix feel ===== */
        article :global(h2#sources) {
          font-size: 16px;
          margin-top: 36px;
          margin-bottom: 12px;
          letter-spacing: -0.2px;
          color: #374151;
          padding-top: 16px;
          border-top: 1px solid #e5e7eb; /* faint gray line ABOVE Sources */
        }

        /* ===== Footnotes / sources list (small + clean) ===== */
        article :global(.footnotes) {
          margin-top: 0;
          padding-top: 0;
          border-top: none;
          font-size: 13px;
          line-height: 1.5;
          color: #6b7280;
        }

        article :global(.footnotes hr) {
          display: none !important;
        }

        /* Hide auto "Footnotes" heading if it appears */
        article :global(.footnotes h2) {
          display: none !important;
        }

        article :global(.footnotes ol) {
          padding-left: 18px;
          margin: 0;
        }

        article :global(.footnotes li) {
          margin: 4px 0;
        }

        article :global(.footnotes a) {
          font-weight: 400;
          color: #4b5563;
          text-decoration: none;
        }

        article :global(.footnotes a:hover) {
          text-decoration: underline;
        }

        /* Kill backref/return-link icons (the ugly emojis) */
        article :global(.footnotes a[aria-label="Back to content"]),
        article :global(.footnotes a.footnote-backref),
        article :global(.footnotes .footnote-backref),
        article :global(.footnotes a[data-footnote-backref]),
        article :global(.footnotes a[href^="#fnref"]) {
          display: none !important;
        }
      `}</style>
    </main>
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

  // Match any TPV marker (whitespace tolerant)
  const MARKER_RE = /<!--\s*TPV_QUESTION:[\s\S]*?-->/;

  // A marker that WILL survive markdown -> html
  const POLL_DIV = `<div data-tpv-poll="1"></div>`;

  // Also tolerate the old accidental literal token
  const contentNormalized = content.replace(
    /\bTPV_QUESTION_TOKEN\b/g,
    "<!-- TPV_QUESTION:ANY -->"
  );

  const hasMarker = MARKER_RE.test(contentNormalized);

  const contentWithDiv = hasMarker ? contentNormalized.replace(MARKER_RE, POLL_DIV) : contentNormalized;

  const processed = await remark()
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true }) // keep raw HTML blocks
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings, {
      behavior: "append",
      properties: { className: ["heading-anchor"] },
    })
    .use(rehypeStringify, { allowDangerousHtml: true }) // keep raw HTML blocks
    .process(contentWithDiv);

  const html = processed.toString();

  // Split on the HTML div marker
  const splitIndex = html.indexOf(POLL_DIV);
  const before = splitIndex >= 0 ? html.slice(0, splitIndex) : html;
  const after = splitIndex >= 0 ? html.slice(splitIndex + POLL_DIV.length) : "";

  return {
    props: {
      meta,
      contentHtmlParts: {
        before,
        after,
        hasMarker: splitIndex >= 0,
      },
    },
  };
};