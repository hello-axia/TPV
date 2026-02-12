import fs from "fs";
import path from "path";
import matter from "gray-matter";

export type VerdictMeta = {
  slug: string;
  title: string;
  date: string;
  summary: string;
  readTime?: string;
  questionId?: string;
};

const verdictsDir = path.join(process.cwd(), "content", "verdicts");

export function getAllVerdictsMeta(): VerdictMeta[] {
  const files = fs.readdirSync(verdictsDir).filter((f) => f.endsWith(".md"));

  const items = files.map((filename) => {
    const slug = filename.replace(/\.md$/, "");
    const fullPath = path.join(verdictsDir, filename);
    const raw = fs.readFileSync(fullPath, "utf8");
    const { data } = matter(raw);

    return {
      slug,
      title: String(data.title ?? slug),
      date: String(data.date ?? ""),
      summary: String(data.summary ?? ""),
      readTime: data.readTime ? String(data.readTime) : undefined,
      questionId: data.questionId ? String(data.questionId) : undefined,
    };
  });

  // WARNING: your date format is MM-DD-YYYY so string sort isn't "true chronological".
  // Keeping it as-is for now since your site already works this way.
  items.sort((a, b) => (a.date < b.date ? 1 : -1));

  return items;
}

export function getVerdictBySlug(slug: string) {
  const fullPath = path.join(verdictsDir, `${slug}.md`);
  const raw = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(raw);

  return {
    slug,
    meta: {
      title: String(data.title ?? slug),
      date: String(data.date ?? ""),
      summary: String(data.summary ?? ""),
      readTime: data.readTime ? String(data.readTime) : undefined,
      questionId: data.questionId ? String(data.questionId) : undefined,
    },
    content,
  };
}