import fs from "fs";
import path from "path";

export type DeskMeta = {
  slug: string;
  title: string;
  summary: string;
  date: string;
  questionId?: string | null;
  question: string; // the original submitted question
};

const deskDir = path.join(process.cwd(), "content", "desk");

export function getAllDeskMeta(): DeskMeta[] {
  if (!fs.existsSync(deskDir)) return [];

  const files = fs.readdirSync(deskDir).filter((f) => f.endsWith(".html"));

  const items = files.map((filename) => {
    const slug = filename.replace(/\.html$/, "");
    const fullPath = path.join(deskDir, filename);
    const raw = fs.readFileSync(fullPath, "utf8");

    const metaMatch = raw.match(
      /<script[^>]+id="tpv-desk-meta"[^>]*>([\s\S]*?)<\/script>/
    );
    const meta = metaMatch ? JSON.parse(metaMatch[1]) : {};

    return {
      slug,
      title: String(meta.title ?? slug),
      summary: String(meta.summary ?? ""),
      date: String(meta.date ?? ""),
      questionId: meta.questionId ? String(meta.questionId) : null,
      question: String(meta.question ?? ""),
    };
  });

  items.sort((a, b) => (a.date < b.date ? 1 : -1));
  return items;
}

export function getDeskBySlug(slug: string) {
  const fullPath = path.join(deskDir, `${slug}.html`);
  const raw = fs.readFileSync(fullPath, "utf8");

  const metaMatch = raw.match(
    /<script[^>]+id="tpv-desk-meta"[^>]*>([\s\S]*?)<\/script>/
  );
  const meta = metaMatch ? JSON.parse(metaMatch[1]) : {};
  const content = raw
    .replace(/<script[^>]+id="tpv-desk-meta"[^>]*>[\s\S]*?<\/script>/, "")
    .trim();

  return {
    slug,
    meta: {
      title: String(meta.title ?? slug),
      summary: String(meta.summary ?? ""),
      date: String(meta.date ?? ""),
      questionId: meta.questionId ? String(meta.questionId) : null,
      question: String(meta.question ?? ""),
    },
    content,
  };
}