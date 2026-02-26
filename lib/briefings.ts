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

function normalizeDateForSort(date: string) {
  // Supports "YYYY-MM-DD" or "MM-DD-YYYY"
  const d = String(date || "").trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d; // already sortable
  if (/^\d{2}-\d{2}-\d{4}$/.test(d)) {
    const [mm, dd, yyyy] = d.split("-");
    return `${yyyy}-${mm}-${dd}`;
  }
  return d; // fallback
}

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

  // Newest first (handles both YYYY-MM-DD and MM-DD-YYYY)
  items.sort((a, b) => {
    const ad = normalizeDateForSort(a.date);
    const bd = normalizeDateForSort(b.date);
    return ad < bd ? 1 : -1;
  });

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