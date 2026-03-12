// components/OgHead.tsx
import Head from "next/head";

type OgHeadProps = {
  title: string;
  description?: string;
  kicker?: string;
  date?: string;
  type?: "verdict" | "briefing" | "bound" | "default";
  slug?: string; // e.g. "verdicts/iran-war" or "bound"
};

const BASE_URL = "https://tpverdict.com";

export default function OgHead({
  title,
  description,
  kicker = "",
  date = "",
  type = "default",
  slug = "",
}: OgHeadProps) {
  const pageUrl = slug ? `${BASE_URL}/${slug}` : BASE_URL;

  const ogImageUrl = new URL(`${BASE_URL}/api/og`);
  ogImageUrl.searchParams.set("title", title);
  ogImageUrl.searchParams.set("type", type);
  if (kicker) ogImageUrl.searchParams.set("kicker", kicker);
  if (date) ogImageUrl.searchParams.set("date", date);

  const metaDescription =
    description ??
    (type === "verdict"
      ? "Read the full IDU breakdown and cast your vote on The People's Verdict."
      : type === "briefing"
      ? "Get the full institutional briefing on The People's Verdict."
      : type === "bound"
      ? "Reveal the pattern. Submit one word. Faster is better."
      : "Structured political analysis for the next generation.");

  const fullTitle = title === "The People's Verdict" ? title : `${title} — TPV`;

  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />

      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={ogImageUrl.toString()} />
      <meta property="og:url" content={pageUrl} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="The People's Verdict" />

      {/* Twitter/X */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={ogImageUrl.toString()} />
    </Head>
  );
}