import fs from "fs";
import path from "path";
import matter from "gray-matter";

export type BriefingMeta = {
  slug: string;
  title: string;
  date: string;
  summary: string;
  readTime?: string;
  questionId?: string;
};

const briefingsDir = path.join(process.cwd(), "content", "briefings");

export function getAllBriefingsMeta(): BriefingMeta[] {
  const files = fs.readdirSync(briefingsDir).filter((f) => f.endsWith(".md"));

  const items = files.map((filename) => {
    const slug = filename.replace(/\.md$/, "");
    const fullPath = path.join(briefingsDir, filename);
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

  items.sort((a, b) => (a.date < b.date ? 1 : -1));
  return items;
}

export function getBriefingBySlug(slug: string) {
  const fullPath = path.join(briefingsDir, `${slug}.md`);
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