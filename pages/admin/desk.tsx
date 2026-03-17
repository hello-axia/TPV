import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/router";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const ADMIN_EMAIL = "ello.axia@gmail.com";

type DeskQuestion = {
  id: string;
  question: string;
  email: string | null;
  user_id: string | null;
  username: string | null;
  status: "pending" | "answered" | "promoted";
  slug: string | null;
  promoted_slug: string | null;
  promoted_type: "verdict" | "briefing" | null;
  created_at: string;
  answered_at: string | null;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "numeric", minute: "2-digit",
  });
}

export default function AdminDeskPage() {
  const router = useRouter();
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [questions, setQuestions] = useState<DeskQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"pending" | "answered" | "promoted" | "all">("pending");

  // Per-question state for marking answered/promoted
  const [answerSlugs, setAnswerSlugs] = useState<Record<string, string>>({});
  const [promotedSlugs, setPromotedSlugs] = useState<Record<string, string>>({});
  const [promotedTypes, setPromotedTypes] = useState<Record<string, "verdict" | "briefing">>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState<Record<string, boolean>>({});

  // Auth check with retry
  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      const email = data.session?.user?.email;
      if (email === ADMIN_EMAIL) {
        setAuthed(true);
        setChecking(false);
        return;
      }
      await new Promise((r) => setTimeout(r, 800));
      const { data: data2 } = await supabase.auth.getSession();
      const email2 = data2.session?.user?.email;
      if (email2 === ADMIN_EMAIL) {
        setAuthed(true);
      } else {
        router.replace("/");
      }
      setChecking(false);
    })();
  }, []);

  useEffect(() => {
    if (!authed) return;
    loadQuestions();
  }, [authed, filter]);

  async function loadQuestions() {
    setLoading(true);
    let query = supabase
      .from("desk_questions_with_username")
      .select("*")
      .order("created_at", { ascending: false });
    if (filter !== "all") query = query.eq("status", filter);
    const { data } = await query;
    setQuestions((data as DeskQuestion[]) ?? []);
    setLoading(false);
  }

  async function handleMarkAnswered(q: DeskQuestion) {
    const slug = answerSlugs[q.id]?.trim();
    if (!slug) { alert("Enter the desk article slug first."); return; }
    setSaving((s) => ({ ...s, [q.id]: true }));
    await supabase.from("desk_questions").update({
      status: "answered",
      slug,
      answered_at: new Date().toISOString(),
    }).eq("id", q.id);
    setSaving((s) => ({ ...s, [q.id]: false }));
    setSaved((s) => ({ ...s, [q.id]: true }));
    setTimeout(() => { setSaved((s) => ({ ...s, [q.id]: false })); loadQuestions(); }, 1500);
  }

  async function handleMarkPromoted(q: DeskQuestion) {
    const promotedSlug = promotedSlugs[q.id]?.trim();
    const promotedType = promotedTypes[q.id] ?? "verdict";
    const answerSlug = answerSlugs[q.id]?.trim() || q.slug || "";
    if (!promotedSlug) { alert("Enter the verdict/briefing slug this was promoted to."); return; }
    setSaving((s) => ({ ...s, [q.id]: true }));
    await supabase.from("desk_questions").update({
      status: "promoted",
      slug: answerSlug || null,
      promoted_slug: promotedSlug,
      promoted_type: promotedType,
      answered_at: new Date().toISOString(),
    }).eq("id", q.id);
    setSaving((s) => ({ ...s, [q.id]: false }));
    setSaved((s) => ({ ...s, [q.id]: true }));
    setTimeout(() => { setSaved((s) => ({ ...s, [q.id]: false })); loadQuestions(); }, 1500);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this question? This cannot be undone.")) return;
    await supabase.from("desk_questions").delete().eq("id", id);
    loadQuestions();
  }

  if (checking) return null;
  if (!authed) return null;

  const pendingCount = questions.filter((q) => q.status === "pending").length;

  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: "2.5rem 1.25rem 6rem" }}>

      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <div style={{
          fontFamily: "var(--font-body)", fontSize: "0.65rem", fontWeight: 700,
          letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--gold)",
          marginBottom: "0.75rem",
        }}>
          Admin
        </div>
        <h1 style={{
          fontFamily: "var(--font-display)", fontSize: "2rem", fontWeight: 400,
          color: "var(--text)", marginBottom: "0.5rem",
        }}>
          The Desk
        </h1>
        <p style={{
          fontFamily: "var(--font-body)", fontSize: "0.88rem",
          color: "var(--text-faint)", margin: 0,
        }}>
          {pendingCount} question{pendingCount !== 1 ? "s" : ""} waiting.
        </p>
      </div>

      <div style={{ borderTop: "1px solid var(--border)", marginBottom: "2rem" }} />

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "2rem", flexWrap: "wrap" }}>
        {(["pending", "answered", "promoted", "all"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)} style={{
            fontFamily: "var(--font-body)", fontSize: "0.72rem", fontWeight: 700,
            letterSpacing: "0.1em", textTransform: "uppercase",
            padding: "7px 14px", borderRadius: 3, cursor: "pointer",
            border: filter === f ? "1px solid var(--gold)" : "1px solid var(--border-light)",
            background: filter === f ? "var(--gold-dim)" : "transparent",
            color: filter === f ? "var(--gold)" : "var(--text-faint)",
          }}>
            {f}
          </button>
        ))}
      </div>

      {/* Questions */}
      {loading ? (
        <p style={{ fontFamily: "var(--font-body)", fontSize: "0.9rem", color: "var(--text-faint)" }}>
          Loading...
        </p>
      ) : questions.length === 0 ? (
        <p style={{ fontFamily: "var(--font-body)", fontSize: "0.9rem", color: "var(--text-faint)" }}>
          No questions in this category.
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {questions.map((q) => (
            <div key={q.id} style={{
              border: "1px solid var(--border-light)",
              borderRadius: 4, background: "var(--bg2)", overflow: "hidden",
            }}>
              {/* Question */}
              <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--border)" }}>
                <div style={{
                  display: "flex", justifyContent: "space-between",
                  alignItems: "center", gap: 12, marginBottom: "0.85rem",
                  flexWrap: "wrap",
                }}>
                  {/* Status badge */}
                  <span style={{
                    fontFamily: "var(--font-body)", fontSize: "0.6rem", fontWeight: 700,
                    letterSpacing: "0.1em", textTransform: "uppercase",
                    padding: "2px 8px", borderRadius: 2,
                    background: q.status === "pending" ? "var(--gold-dim)" :
                                q.status === "promoted" ? "rgba(46,204,113,0.12)" :
                                "rgba(255,255,255,0.06)",
                    color: q.status === "pending" ? "var(--gold)" :
                           q.status === "promoted" ? "#2ecc71" : "var(--text-faint)",
                    border: `1px solid ${q.status === "pending" ? "var(--gold-line)" :
                             q.status === "promoted" ? "rgba(46,204,113,0.25)" :
                             "var(--border-light)"}`,
                  }}>
                    {q.status}
                  </span>
                  <span style={{
                    fontFamily: "var(--font-body)", fontSize: "0.68rem",
                    color: "var(--text-faint)",
                  }}>
                    {formatDate(q.created_at)}
                  </span>
                </div>

                {/* The question */}
                <div style={{
                  fontFamily: "var(--font-display)", fontSize: "1.2rem",
                  color: "var(--text)", lineHeight: 1.4, marginBottom: "0.75rem",
                }}>
                  "{q.question}"
                </div>

                {/* Submitter */}
                <div style={{
                  fontFamily: "var(--font-body)", fontSize: "0.75rem",
                  color: "var(--text-faint)",
                }}>
                  {q.username
                    ? `@${q.username}`
                    : q.email
                    ? q.email
                    : "Anonymous"}
                </div>

                {/* If already answered/promoted, show links */}
                {q.slug && (
                  <div style={{
                    marginTop: "0.5rem",
                    fontFamily: "var(--font-body)", fontSize: "0.72rem",
                    color: "var(--gold)",
                  }}>
                    Desk article: /desk/{q.slug}
                  </div>
                )}
                {q.promoted_slug && (
                  <div style={{
                    marginTop: "0.25rem",
                    fontFamily: "var(--font-body)", fontSize: "0.72rem",
                    color: "#2ecc71",
                  }}>
                    Promoted → /{q.promoted_type}s/{q.promoted_slug}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div style={{ padding: "1rem 1.5rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>

                {/* Mark as answered */}
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
                  <input
                    type="text"
                    value={answerSlugs[q.id] ?? q.slug ?? ""}
                    onChange={(e) => setAnswerSlugs((s) => ({ ...s, [q.id]: e.target.value }))}
                    placeholder="desk article slug"
                    style={{
                      background: "var(--bg)", border: "1px solid var(--border-light)",
                      borderRadius: 3, padding: "7px 10px",
                      fontFamily: "var(--font-body)", fontSize: "0.82rem",
                      color: "var(--text)", outline: "none", width: 200,
                    }}
                  />
                  <button
                    onClick={() => handleMarkAnswered(q)}
                    disabled={saving[q.id]}
                    style={{
                      background: "transparent",
                      color: "var(--text-dim)",
                      border: "1px solid var(--border-light)",
                      borderRadius: 3, padding: "7px 14px",
                      fontFamily: "var(--font-body)", fontSize: "0.72rem",
                      fontWeight: 700, letterSpacing: "0.1em",
                      textTransform: "uppercase", cursor: "pointer",
                    }}
                  >
                    {saved[q.id] ? "Saved ✓" : "Mark answered"}
                  </button>
                </div>

                {/* Mark as promoted */}
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
                  <select
                    value={promotedTypes[q.id] ?? "verdict"}
                    onChange={(e) => setPromotedTypes((t) => ({ ...t, [q.id]: e.target.value as "verdict" | "briefing" }))}
                    style={{
                      background: "var(--bg)", border: "1px solid var(--border-light)",
                      borderRadius: 3, padding: "7px 10px",
                      fontFamily: "var(--font-body)", fontSize: "0.82rem",
                      color: "var(--text)", outline: "none",
                    }}
                  >
                    <option value="verdict">Verdict</option>
                    <option value="briefing">Briefing</option>
                  </select>
                  <input
                    type="text"
                    value={promotedSlugs[q.id] ?? q.promoted_slug ?? ""}
                    onChange={(e) => setPromotedSlugs((s) => ({ ...s, [q.id]: e.target.value }))}
                    placeholder="verdict/briefing slug"
                    style={{
                      background: "var(--bg)", border: "1px solid var(--border-light)",
                      borderRadius: 3, padding: "7px 10px",
                      fontFamily: "var(--font-body)", fontSize: "0.82rem",
                      color: "var(--text)", outline: "none", width: 200,
                    }}
                  />
                  <button
                    onClick={() => handleMarkPromoted(q)}
                    disabled={saving[q.id]}
                    style={{
                      background: "var(--gold-dim)",
                      color: "var(--gold)",
                      border: "1px solid var(--gold-line)",
                      borderRadius: 3, padding: "7px 14px",
                      fontFamily: "var(--font-body)", fontSize: "0.72rem",
                      fontWeight: 700, letterSpacing: "0.1em",
                      textTransform: "uppercase", cursor: "pointer",
                    }}
                  >
                    {saved[q.id] ? "Saved ✓" : "Mark promoted"}
                  </button>
                </div>

                {/* Delete */}
                <div>
                  <button
                    onClick={() => handleDelete(q.id)}
                    style={{
                      background: "transparent", color: "#e74c3c",
                      border: "1px solid rgba(231,76,60,0.25)", borderRadius: 3,
                      padding: "7px 14px", fontFamily: "var(--font-body)",
                      fontSize: "0.72rem", fontWeight: 700,
                      letterSpacing: "0.1em", textTransform: "uppercase",
                      cursor: "pointer",
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        input:focus, select:focus { border-color: var(--gold-line) !important; outline: none; }
      `}</style>
    </main>
  );
}