import { GetStaticPaths, GetStaticProps } from "next";
import { useEffect, useState } from "react";
import { injectGlossarySpans } from "../../lib/injectGlossarySpans";
import type { GlossaryEntry } from "../../lib/injectGlossarySpans";
import ArticleShell from "../../components/ArticleShell";

// ── Market ticker types ──
type MarketTicker = {
  symbol: string;
  label: string;
  price: string;
  change: string;
  changePercent: string;
  direction: "up" | "down" | "flat";
};

// ── Market ticker component ──
function MarketTickerRow() {
  const [tickers, setTickers] = useState<MarketTicker[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/market-data")
      .then((r) => r.json())
      .then((j) => { if (j.tickers) setTickers(j.tickers); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const skeletons = [...Array(6)];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(6, 1fr)",
        gap: 1,
        margin: "1.5rem 0 1.75rem",
        background: "var(--border)",
        border: "1px solid var(--border)",
      }}
      className="ticker-grid"
    >
      {loading
        ? skeletons.map((_, i) => (
            <div
              key={i}
              style={{
                background: "var(--bg2)",
                padding: "14px 16px",
                minHeight: 72,
              }}
            />
          ))
        : tickers.map((t) => (
            <div
              key={t.symbol}
              style={{ background: "var(--bg2)", padding: "14px 16px" }}
            >
              <div style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.6rem",
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--text-faint)",
                marginBottom: 5,
              }}>
                {t.label}
              </div>
              <div style={{
                fontFamily: "var(--font-body)",
                fontSize: "1.05rem",
                fontWeight: 700,
                color: "var(--text)",
                lineHeight: 1.1,
                marginBottom: 3,
              }}>
                {t.price}
              </div>
              <div style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.72rem",
                fontWeight: 600,
                color:
                  t.direction === "up"
                    ? "#2ecc71"
                    : t.direction === "down"
                    ? "#e74c3c"
                    : "var(--text-faint)",
              }}>
                {t.changePercent}
              </div>
            </div>
          ))}

      <style jsx>{`
        @media (max-width: 600px) {
          .ticker-grid { grid-template-columns: repeat(3, 1fr) !important; }
        }
        @media (max-width: 380px) {
          .ticker-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </div>
  );
}

// ── Bulletin content renderer ──
function BulletinContent({ html }: { html: string }) {
  return (
    <>
      <MarketTickerRow />
      <div
        className="bulletin-prose"
        dangerouslySetInnerHTML={{ __html: html }}
      />
      <style jsx global>{`
        .bulletin-prose .bulletin-item {
          display: grid;
          grid-template-columns: 120px 1fr;
          gap: 1.25rem;
          padding: 1.25rem 0;
          border-bottom: 1px solid var(--border);
          align-items: start;
        }
        .bulletin-prose .bulletin-item:last-child { border-bottom: none; }
        .bulletin-prose .bulletin-tag {
          font-family: var(--font-body);
          font-size: 0.6rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 2px 8px;
          border-radius: 2px;
          display: inline-block;
          border: 1px solid currentColor;
          margin-top: 0.15rem;
          opacity: 0.9;
        }
        .bulletin-prose .bulletin-headline {
          font-family: var(--font-display);
          font-size: clamp(1rem, 2vw, 1.2rem);
          font-weight: 400;
          color: var(--text);
          line-height: 1.25;
          margin-bottom: 0.5rem;
        }
        .bulletin-prose .bulletin-body {
          font-family: var(--font-body);
          font-size: 1rem;
          line-height: 1.75;
          color: var(--text);
          margin: 0;
        }
        @media (max-width: 600px) {
          .bulletin-prose .bulletin-item {
            grid-template-columns: 1fr;
            gap: 0.5rem;
          }
        }
      `}</style>
    </>
  );
}

// ── Page component ──
type Props = {
  slug: string;
  meta: {
    title: string;
    date: string;
    subhead: string;
    readTime?: string;
    glossary: GlossaryEntry[] | null;
  };
  content: string;
};

export default function BulletinPage({ slug, meta, content }: Props) {
  return (
    <ArticleShell
      type="The Bulletin"
      title={meta.title}
      date={meta.date}
      readTime={meta.readTime}
      summary={meta.subhead}
      backHref="/bulletin"
      showSummary={true}
      glossary={meta.glossary}
      slug={slug}
    >
      <BulletinContent html={content} />
    </ArticleShell>
  );
}

// ── Static generation ──
export const getStaticPaths: GetStaticPaths = async () => {
  const { getAllBulletinsMeta } = require("../../lib/bulletin");
  const bulletins = getAllBulletinsMeta();
  return {
    paths: bulletins.map((b: any) => ({ params: { slug: b.slug } })),
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { getBulletinBySlug, getAllBulletinsMeta } = require("../../lib/bulletin");
  const slug = params?.slug as string;
  const bulletin = getBulletinBySlug(slug);

  const injectedContent =
    bulletin.meta.glossary && bulletin.meta.glossary.length > 0
      ? injectGlossarySpans(bulletin.content, bulletin.meta.glossary)
      : bulletin.content;

  return {
    props: {
      slug,
      meta: bulletin.meta,
      content: injectedContent,
    },
  };
};