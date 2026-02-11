import { GetStaticPaths, GetStaticProps } from "next";
import Link from "next/link";
import { remark } from "remark";
import html from "remark-html";
import { getAllVerdictsMeta, getVerdictBySlug } from "../../lib/verdicts";

export default function VerdictPostPage({
  meta,
  contentHtml,
}: {
  meta: { title: string; date: string; summary: string };
  contentHtml: string;
}) {
  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: "42px 24px 72px" }}>
      <Link href="/verdicts" style={{ textDecoration: "none", color: "#6b7280", fontSize: 14 }}>
        ← Back to Verdicts
      </Link>

      <h1 style={{ marginTop: 14, fontSize: 44, fontWeight: 900, letterSpacing: -1.1, lineHeight: 1.05 }}>
        {meta.title}
      </h1>

      <div style={{ marginTop: 10, color: "#6b7280", fontSize: 14 }}>
        Verdict • {meta.date}
      </div>

      <p style={{ marginTop: 14, color: "#6b7280", lineHeight: 1.7, fontSize: 18 }}>
        {meta.summary}
      </p>

      <article
        style={{
          marginTop: 26,
          lineHeight: 1.8,
          fontSize: 17,
        }}
        dangerouslySetInnerHTML={{ __html: contentHtml }}
      />

      {/* Lightweight “prose” styling */}
      <style jsx>{`
        article :global(h1),
        article :global(h2),
        article :global(h3) {
          margin-top: 28px;
          margin-bottom: 10px;
          letter-spacing: -0.4px;
        }
        article :global(h2) {
          font-size: 22px;
        }
        article :global(p) {
          margin: 12px 0;
        }
        article :global(ul) {
          padding-left: 20px;
          margin: 12px 0;
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
      `}</style>
    </main>
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
  const { meta, content } = getVerdictBySlug(slug);

  const processed = await remark().use(html).process(content);
  const contentHtml = processed.toString();

  return { props: { meta, contentHtml } };
};