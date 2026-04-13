import fs from "fs";
import path from "path";
import matter from "gray-matter";

export type GlossaryEntry = {
  term: string;
  definition: string;
};

export type VerdictMeta = {
  slug: string;
  title: string;
  date: string;
  summary: string;
  readTime?: string | null;
  questionId?: string | null;
  tldr?: string[] | null;
  keyTension?: string | null;
  glossary?: GlossaryEntry[] | null;
  publishAt?: string | null;
  bulletinSlug?: string | null;
};
const verdictsDir = path.join(process.cwd(), "content", "verdicts");

export function getAllVerdictsMeta(): VerdictMeta[] {
  const files = fs.readdirSync(verdictsDir).filter(
    (f) => f.endsWith(".md") || f.endsWith(".html")
  );

  const items = files.map((filename) => {
    const slug = filename.replace(/\.(md|html)$/, "");
    const fullPath = path.join(verdictsDir, filename);
    const raw = fs.readFileSync(fullPath, "utf8");

    if (filename.endsWith(".html")) {
      const metaMatch = raw.match(
        /<script[^>]+id="tpv-meta"[^>]*>([\s\S]*?)<\/script>/
      );
      const meta = metaMatch ? JSON.parse(metaMatch[1]) : {};
      return {
        slug,
        title: String(meta.title ?? slug),
        date: String(meta.date ?? ""),
        summary: String(meta.summary ?? ""),
        readTime: meta.readTime ? String(meta.readTime) : null,
        questionId: meta.questionId ? String(meta.questionId) : null,
        publishAt: meta.publishAt ? String(meta.publishAt) : null,
        bulletinSlug: meta.bulletinSlug ? String(meta.bulletinSlug) : null,
      };
    }

    const { data } = matter(raw);
    return {
      slug,
      title: String(data.title ?? slug),
      date: String(data.date ?? ""),
      summary: String(data.summary ?? ""),
      readTime: data.readTime ? String(data.readTime) : undefined,
      questionId: data.questionId ? String(data.questionId) : undefined,
      publishAt: data.publishAt ? String(data.publishAt) : null,
      bulletinSlug: data.bulletinSlug ? String(data.bulletinSlug) : null,
    };
  });

  const now = new Date();
  const filtered = items.filter((item: any) =>
    !item.publishAt || now >= new Date(item.publishAt)
  );
  filtered.sort((a, b) => (a.date < b.date ? 1 : -1));
  return filtered;
}

export function getVerdictBySlug(slug: string) {
  // Try .html first, then .md
  const htmlPath = path.join(verdictsDir, `${slug}.html`);
  const mdPath = path.join(verdictsDir, `${slug}.md`);
  const isHtml = fs.existsSync(htmlPath);
  const fullPath = isHtml ? htmlPath : mdPath;
  const raw = fs.readFileSync(fullPath, "utf8");

  if (isHtml) {
    const metaMatch = raw.match(
      /<script[^>]+id="tpv-meta"[^>]*>([\s\S]*?)<\/script>/
    );
    const meta = metaMatch ? JSON.parse(metaMatch[1]) : {};
    const content = raw
      .replace(/<script[^>]+id="tpv-meta"[^>]*>[\s\S]*?<\/script>/, "")
      .trim();

    const glossary: GlossaryEntry[] = Array.isArray(meta.glossary)
      ? meta.glossary.filter(
          (g: any) =>
            g && typeof g.term === "string" && typeof g.definition === "string"
        )
      : [];

    return {
      slug,
      isHtml: true,
      meta: {
        title: String(meta.title ?? slug),
        date: String(meta.date ?? ""),
        summary: String(meta.summary ?? ""),
        readTime: meta.readTime ? String(meta.readTime) : null,
        questionId: meta.questionId ? String(meta.questionId) : null,
        tldr: Array.isArray(meta.tldr) ? meta.tldr : null,
        keyTension: meta.keyTension ? String(meta.keyTension) : null,
        glossary: glossary.length > 0 ? glossary : null,
      },
      content,
    };
  }

  const { data, content } = matter(raw);
  const glossary: GlossaryEntry[] = Array.isArray(data.glossary)
    ? data.glossary.filter(
        (g: any) =>
          g && typeof g.term === "string" && typeof g.definition === "string"
      )
    : [];

  return {
    slug,
    isHtml: false,
    meta: {
      title: String(data.title ?? slug),
      date: String(data.date ?? ""),
      summary: String(data.summary ?? ""),
      readTime: data.readTime ? String(data.readTime) : undefined,
      questionId: data.questionId ? String(data.questionId) : undefined,
      tldr: Array.isArray(data.tldr) ? data.tldr : null,
      keyTension: data.keyTension ? String(data.keyTension) : null,
      glossary: glossary.length > 0 ? glossary : null,
    },
    content,
  };
}