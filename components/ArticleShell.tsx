// components/ArticleShell.tsx
import Link from "next/link";
import { ReactNode, useEffect, useState } from "react";
import { addBookmark, removeBookmark, isBookmarked } from "../lib/bookmarks";
import { supabase } from "../lib/supabaseClients";

export type GlossaryEntry = {
  term: string;
  definition: string;
};

function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    function update() {
      const el = document.documentElement;
      const scrolled = el.scrollTop || document.body.scrollTop;
      const total = el.scrollHeight - el.clientHeight;
      setProgress(total > 0 ? Math.min(100, (scrolled / total) * 100) : 0);
    }
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0,
      height: 2, zIndex: 100, background: "var(--border)",
    }}>
      <div style={{
        height: "100%", width: `${progress}%`,
        background: "var(--gold)", transition: "width 0.1s linear",
      }} />
    </div>
  );
}

function GlossarySection({ entries }: { entries: GlossaryEntry[] }) {
  if (!entries || entries.length === 0) return null;
  return (
    <div className="tpv-glossary" id="tpv-glossary">
      <div className="tpv-glossary-title">Key Terms</div>
      <div className="tpv-glossary-list">
        {entries.map((entry) => (
          <div
            key={entry.term}
            id={`gloss-${entry.term.toLowerCase().replace(/\s+/g, "-")}`}
            className="tpv-glossary-item"
          >
            <div className="tpv-glossary-term">{entry.term}</div>
            <div className="tpv-glossary-def">{entry.definition}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ArticleShell({
  type,
  title,
  date,
  readTime,
  summary,
  backHref,
  children,
  rightRail,
  readerCount,
  tldr,
  keyTension,
  promotedFrom,
  showSummary = true,
  glossary,
  slug,
}: {
  type: "Verdict" | "Briefing" | "The Desk";
  title: string;
  date: string;
  readTime?: string;
  summary: string;
  backHref: string;
  children: ReactNode;
  rightRail?: ReactNode;
  readerCount?: number | null;
  tldr?: string[] | null;
  keyTension?: string | null;
  showSummary?: boolean;
  promotedFrom?: string | null;
  glossary?: GlossaryEntry[] | null;
  slug?: string;
}) {

  // Global click handler for glossary tooltips.
  // The spans are injected into HTML at build time (getStaticProps),
  // so we just need to manage the active state here.
  const [userId, setUserId] = useState<string | null>(null);
  const [bookmarked, setBookmarked] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const uid = data.session?.user?.id ?? null;
      setUserId(uid);
      if (uid && slug) {
        isBookmarked(uid, slug).then(setBookmarked);
      }
    });
  }, [slug]);

  async function toggleBookmark() {
    if (!userId || !slug) return;
    setBookmarkLoading(true);
    if (bookmarked) {
      await removeBookmark(userId, slug);
      setBookmarked(false);
    } else {
      await addBookmark(userId, slug, type.toLowerCase() as "verdict" | "briefing", title);
      setBookmarked(true);
    }
    setBookmarkLoading(false);
  }
  useEffect(() => {
    if (!glossary || glossary.length === 0) return;

    function handleClick(e: MouseEvent) {
      const target = e.target as HTMLElement;
      const term = target.closest(".tpv-gloss-term");

     // Close all open tooltips and reset any fixed positioning
     document.querySelectorAll(".tpv-gloss-active").forEach((el) => {
      el.classList.remove("tpv-gloss-active");
      const t = el.querySelector(".tpv-gloss-tooltip") as HTMLElement | null;
      if (t) {
        if (t.parentElement === document.body) {
          el.appendChild(t);
        }
        t.style.cssText = "";
      }
    });

      // If click was on a term, open it (unless we just closed it)
      if (term) {
        e.stopPropagation();
        const wasActive = term.getAttribute("data-was-active") === "1";
        if (!wasActive) {
          term.classList.add("tpv-gloss-active");

          // On mobile: nudge tooltip so it never bleeds off screen edges
          const tooltip = term.querySelector(".tpv-gloss-tooltip") as HTMLElement | null;
          if (tooltip) {
            const termRect = (term as HTMLElement).getBoundingClientRect();
            const spaceAbove = termRect.top;
          
            // Teleport to body to escape any CSS transform ancestors
            document.body.appendChild(tooltip);
          
            tooltip.style.cssText = `
    position: fixed;
    left: 50%;
    transform: translateX(-50%);
    width: min(280px, calc(100vw - 2rem));
    z-index: 9999;
    top: ${spaceAbove < 220 ? termRect.bottom + 8 : termRect.top - 168}px;
    bottom: auto;
    opacity: 1;
    pointer-events: auto;
  `;
  tooltip.onclick = (ev) => ev.stopPropagation();
          }
        }
      }
    }

    // Track which term was active before the click so we can toggle
    function handleMouseDown(e: MouseEvent) {
      const target = e.target as HTMLElement;
      const term = target.closest(".tpv-gloss-term");
      document.querySelectorAll(".tpv-gloss-term").forEach((el) =>
        el.removeAttribute("data-was-active")
      );
      if (term?.classList.contains("tpv-gloss-active")) {
        term.setAttribute("data-was-active", "1");
      }
    }

    function handleScroll() {
      document.querySelectorAll(".tpv-gloss-active").forEach((el) => {
        el.classList.remove("tpv-gloss-active");
        const t = el.querySelector(".tpv-gloss-tooltip") as HTMLElement | null;
        if (t) {
          if (t.parentElement === document.body) el.appendChild(t);
          t.style.cssText = "";
        }
      });
    }

    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("click", handleClick);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("click", handleClick);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [glossary]);

  return (
    <>
      <ReadingProgress />

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "2.5rem 1.25rem 5rem" }}>

        {/* ── ARTICLE HEADER ── */}
        <div className="article-header fade-up" style={{ marginBottom: "2rem", maxWidth: 720 }}>

          <div style={{
            display: "flex", alignItems: "center", gap: "0.75rem",
            marginBottom: "1.25rem", flexWrap: "wrap",
          }}>
            <Link href={backHref} style={{
              fontFamily: "var(--font-body)", fontSize: "0.65rem", fontWeight: 600,
              letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-faint)",
              textDecoration: "none", display: "flex", alignItems: "center", gap: "0.3rem",
              transition: "color 0.15s ease", borderBottom: "1px solid var(--border)", paddingBottom: "1px",
            }}>
              ← Back
            </Link>

            <span style={{ color: "var(--border-light)", fontSize: "0.6rem" }}>·</span>
            <span style={{
              fontFamily: "var(--font-body)", fontSize: "0.65rem", fontWeight: 600,
              letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-faint)",
            }}>
              {date}
            </span>

            {readTime && (
              <>
                <span style={{ color: "var(--border-light)", fontSize: "0.6rem" }}>·</span>
                <span style={{
                  fontFamily: "var(--font-body)", fontSize: "0.65rem", fontWeight: 600,
                  letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-faint)",
                }}>
                  {readTime}
                </span>
              </>
            )}

            <span style={{ color: "var(--border-light)", fontSize: "0.6rem" }}>·</span>
            <span style={{
              fontFamily: "var(--font-body)", fontSize: "0.6rem", fontWeight: 700,
              letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--gold)",
              background: "var(--gold-dim)", border: "1px solid var(--gold-line)",
              borderRadius: 2, padding: "2px 7px",
            }}>
              {type}
            </span>

            {readerCount != null && readerCount > 0 && (
              <>
                <span style={{ color: "var(--border-light)", fontSize: "0.6rem" }}>·</span>
                <span style={{
                  fontFamily: "var(--font-body)", fontSize: "0.65rem", fontWeight: 600,
                  letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-faint)",
                }}>
                  {readerCount} {readerCount === 1 ? "reader" : "readers"} weighed in
                </span>
              </>
            )}
          </div>

          <h1 style={{
            fontFamily: "var(--font-display)", fontSize: "clamp(1.9rem, 4.5vw, 3rem)",
            lineHeight: 1.1, fontWeight: 400, letterSpacing: "-0.02em",
            color: "var(--text)", marginBottom: "1rem",
          }}>
            {title}
          </h1>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
            <div className="divider" style={{ margin: 0 }} />
            {userId && slug && (
              <button
                onClick={toggleBookmark}
                disabled={bookmarkLoading}
                title={bookmarked ? "Remove bookmark" : "Bookmark this article"}
                style={{
                  border: `1px solid ${bookmarked ? "var(--gold-line)" : "var(--border-light)"}`,
                  background: bookmarked ? "var(--gold-dim)" : "transparent",
                  borderRadius: 3,
                  padding: "5px 10px",
                  cursor: bookmarkLoading ? "default" : "pointer",
                  display: "flex", alignItems: "center", gap: 6,
                  fontFamily: "var(--font-body)", fontSize: "0.65rem",
                  fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
                  color: bookmarked ? "var(--gold)" : "var(--text-faint)",
                  transition: "all 0.15s ease",
                  opacity: bookmarkLoading ? 0.5 : 1,
                }}
              >
                <svg width="11" height="14" viewBox="0 0 11 14" fill={bookmarked ? "var(--gold)" : "none"} stroke={bookmarked ? "var(--gold)" : "var(--text-faint)"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 1h9v12l-4.5-3L1 13V1z"/>
                </svg>
                {bookmarked ? "Saved" : "Save"}
              </button>
            )}
          </div>

          {showSummary && (
            <p style={{
              fontFamily: "var(--font-body)", fontSize: "1.05rem", lineHeight: 1.75,
              color: "var(--text-dim)", fontStyle: "italic", marginTop: "1rem",
            }}>
              {summary}
            </p>
          )}
        </div>

        {/* ── FULL DIVIDER ── */}
        <div style={{ borderTop: "1px solid var(--border)", margin: "2rem 0" }} />

        {/* ── TL;DR ── */}
        {tldr && tldr.length > 0 && (
          <div style={{
            maxWidth: 720, marginBottom: "1.5rem", padding: "1.25rem 1.5rem",
            background: "var(--bg2)", border: "1px solid var(--border-light)", borderRadius: 3,
          }}>
            <div className="eyebrow" style={{ marginBottom: "0.85rem" }}>30-second version</div>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {tldr.map((item: string, i: number) => (
                <li key={i} style={{
                  display: "flex", gap: "0.75rem", alignItems: "flex-start",
                  marginBottom: i < tldr.length - 1 ? "0.6rem" : 0,
                }}>
                  <span style={{
                    color: "var(--gold)", fontFamily: "var(--font-body)", fontSize: "0.75rem",
                    fontWeight: 700, paddingTop: "0.2rem", flexShrink: 0,
                  }}>—</span>
                  <span style={{
                    fontFamily: "var(--font-body)", fontSize: "0.92rem",
                    color: "var(--text-dim)", lineHeight: 1.65,
                  }}>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

{/* ── FROM THE DESK ── */}
{promotedFrom && (
          <div style={{
            maxWidth: 720, marginBottom: "1.5rem", padding: "0.85rem 1.25rem",
            borderLeft: "2px solid var(--border-light)",
            background: "var(--bg2)", borderRadius: "0 3px 3px 0",
          }}>
            <div className="eyebrow" style={{ marginBottom: "0.4rem" }}>From the Desk</div>
            <p style={{
              fontFamily: "var(--font-body)", fontSize: "0.88rem",
              color: "var(--text-faint)", fontStyle: "italic", margin: 0,
              lineHeight: 1.65,
            }}>
              "{promotedFrom}"
            </p>
          </div>
        )}

        {/* ── KEY TENSION ── */}
        {keyTension && (
          <div style={{
            maxWidth: 720, marginBottom: "2.5rem", padding: "1rem 1.25rem",
            borderLeft: "2px solid var(--gold)", background: "var(--gold-dim)",
            borderRadius: "0 3px 3px 0",
          }}>
            <div className="eyebrow" style={{ marginBottom: "0.5rem" }}>
              {type === "Briefing" ? "TL;DR" : "The core tension"}
            </div>
            <p style={{
              fontFamily: "var(--font-body)", fontSize: "0.95rem", color: "var(--text-dim)",
              lineHeight: 1.7, fontStyle: "italic", margin: 0,
            }}>{keyTension}</p>
          </div>
        )}

        {/* ── POLL TEASER ── */}
        {readerCount != null && readerCount > 0 && (
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            gap: "1rem", padding: "0.85rem 1.1rem", background: "var(--gold-dim)",
            border: "1px solid var(--gold-line)", borderRadius: 3,
            marginTop: "1.5rem", marginBottom: "0", maxWidth: 720, flexWrap: "wrap",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--gold)", flexShrink: 0 }} />
              <span style={{
                fontFamily: "var(--font-body)", fontSize: "0.82rem",
                color: "var(--text-dim)", fontWeight: 500,
              }}>
                {readerCount} {readerCount === 1 ? "reader has" : "readers have"} weighed in on this one.
              </span>
            </div>
            <a href="#tpv-question" style={{
              fontFamily: "var(--font-body)", fontSize: "0.72rem", fontWeight: 700,
              letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--gold)",
              textDecoration: "none", whiteSpace: "nowrap",
            }}>
              Where do you land? →
            </a>
          </div>
        )}

        {/* ── ARTICLE LAYOUT ── */}
        <div className="tpv-article">
          <section className="prose fade-up-delay-1" style={{ minWidth: 0 }}>
            {children}
            {glossary && glossary.length > 0 && (
              <GlossarySection entries={glossary} />
            )}
          </section>
          {rightRail && (
            <aside className="right-rail" style={{ minWidth: 0 }}>
              {rightRail}
            </aside>
          )}
        </div>

        <style jsx>{`
          .tpv-article {
            display: grid;
            grid-template-columns: 1fr;
            gap: 2rem;
          }
          @media (min-width: 980px) {
            .tpv-article {
              grid-template-columns: 1.35fr 0.65fr;
              gap: 3rem;
              align-items: start;
            }
          }
          @media (max-width: 979px) {
            .right-rail { order: -1; }
          }
          @media (max-width: 600px) {
            .article-header { margin-bottom: 1.5rem !important; }
          }
        `}</style>
      </main>
    </>
  );
}