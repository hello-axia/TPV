import fs from "fs";
import path from "path";

export type GlossaryEntry = {
  term: string;
  definition: string;
};

export type BulletinMeta = {
  slug: string;
  title: string;
  date: string;
  subhead: string;
  readTime?: string;
  publishAt?: string | null;
};

const bulletinDir = path.join(process.cwd(), "content", "bulletin");

function normalizeDateForSort(date: string) {
  const d = String(date || "").trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
  if (/^\d{2}-\d{2}-\d{4}$/.test(d)) {
    const [mm, dd, yyyy] = d.split("-");
    return `${yyyy}-${mm}-${dd}`;
  }
  return d;
}

export function getAllBulletinsMeta(): BulletinMeta[] {
  if (!fs.existsSync(bulletinDir)) return [];

  const files = fs
    .readdirSync(bulletinDir)
    .filter((f) => f.endsWith(".html"));

  const items = files.map((filename) => {
    const slug = filename.replace(/\.html$/, "");
    const fullPath = path.join(bulletinDir, filename);
    const raw = fs.readFileSync(fullPath, "utf8");

    const metaMatch = raw.match(
      /<script[^>]+id="tpv-bulletin-meta"[^>]*>([\s\S]*?)<\/script>/
    );
    const meta = metaMatch ? JSON.parse(metaMatch[1]) : {};

    return {
      slug,
      title: String(meta.title ?? slug),
      date: String(meta.date ?? ""),
      subhead: String(meta.subhead ?? ""),
      readTime: meta.readTime ? String(meta.readTime) : undefined,
      publishAt: meta.publishAt ? String(meta.publishAt) : null,
    };
  });

  const now = new Date();
  const filtered = items.filter(
    (item) => !item.publishAt || now >= new Date(item.publishAt)
  );

  filtered.sort((a, b) => {
    const ad = normalizeDateForSort(a.date);
    const bd = normalizeDateForSort(b.date);
    return ad < bd ? 1 : -1;
  });

  return filtered;
}

export function getBulletinBySlug(slug: string): {
  slug: string;
  meta: {
    title: string;
    date: string;
    subhead: string;
    readTime?: string;
    publishAt?: string | null;
    glossary: GlossaryEntry[] | null;
  };
  content: string;
} {
  const fullPath = path.join(bulletinDir, `${slug}.html`);
  const raw = fs.readFileSync(fullPath, "utf8");

  const metaMatch = raw.match(
    /<script[^>]+id="tpv-bulletin-meta"[^>]*>([\s\S]*?)<\/script>/
  );
  const meta = metaMatch ? JSON.parse(metaMatch[1]) : {};

  // Strip meta block — remaining HTML is the bulletin content
  const content = raw
    .replace(/<script[^>]+id="tpv-bulletin-meta"[^>]*>[\s\S]*?<\/script>/, "")
    .trim();

  const glossary: GlossaryEntry[] = Array.isArray(meta.glossary)
    ? meta.glossary.filter(
        (g: any) =>
          g && typeof g.term === "string" && typeof g.definition === "string"
      )
    : [];

  return {
    slug,
    meta: {
      title: String(meta.title ?? slug),
      date: String(meta.date ?? ""),
      subhead: String(meta.subhead ?? ""),
      readTime: meta.readTime ? String(meta.readTime) : undefined,
      publishAt: meta.publishAt ? String(meta.publishAt) : null,
      glossary: glossary.length > 0 ? glossary : null,
    },
    content,
  };
}