import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../lib/supabaseClients";
import type { User } from "@supabase/supabase-js";

type QuestionRow = {
  id: string;
  prompt: string;
  a_text: string;
  b_text: string;
  c_text: string;
  d_text: string;
  a_count: number;
  b_count: number;
  c_count: number;
  d_count: number;
};

type ApiResponse = {
  question: QuestionRow;
  voted: "A" | "B" | "C" | "D" | null;
};

const LETTERS = ["A", "B", "C", "D"] as const;
type Letter = typeof LETTERS[number];

export default function GlobalQuestion({ questionId }: { questionId: string }) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [data, setData] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mustSignIn, setMustSignIn] = useState(false);
  const [selected, setSelected] = useState<Letter | null>(null);
  const [phase, setPhase] = useState<"pre" | "voting" | "result">("pre");

  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const tokenRef = useRef<string | null>(null);
  const firstLoadDone = useRef(false);
  const [authReady, setAuthReady] = useState(false);

  function buildHeaders(extra?: Record<string, string>): Headers {
    const h = new Headers(extra);
    const t = tokenRef.current;
    if (t) h.set("Authorization", `Bearer ${t}`);
    return h;
  }

  async function load({ silent = false } = {}) {
    try {
      setError(null);
      if (silent) setRefreshing(true);
      else setLoading(true);

      const res = await fetch(`/api/question/${encodeURIComponent(questionId)}`, {
        method: "GET",
        headers: buildHeaders(),
        cache: "no-store",
        credentials: "same-origin",
      });

      const text = await res.text();
      if (text.trim().startsWith("<")) {
        throw new Error("Poll error: API returned HTML. Check /pages/api/question/[id].ts");
      }

      const json = JSON.parse(text) as ApiResponse;
      if (!res.ok) throw new Error((json as any)?.error || "Failed to load poll");

      setData(json);

      // If they already voted, jump straight to results
      if (json.voted) setPhase("result");

    } catch (e: any) {
      setError(e?.message || "Failed to load poll");
    } finally {
      firstLoadDone.current = true;
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    if (!authReady) return;
    if (user && !accessToken) return;
    firstLoadDone.current = false;
    load({ silent: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questionId, authReady, user, accessToken]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setUser(data.session?.user ?? null);
      const tok = data.session?.access_token ?? null;
      setAccessToken(tok);
      tokenRef.current = tok;
      setAuthReady(true);
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      const tok = session?.access_token ?? null;
      setAccessToken(tok);
      tokenRef.current = tok;
      setMustSignIn(false);
      setAuthReady(true);
    });

    return () => { mounted = false; sub.subscription.unsubscribe(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function vote(choice: Letter) {
    if (submitting || data?.voted) return;
    if (!user || !accessToken) {
      setMustSignIn(true);
      setError(null);
      return;
    }
    try {
      setSubmitting(true);
      setError(null);
      setMustSignIn(false);

      const res = await fetch(`/api/question/${encodeURIComponent(questionId)}`, {
        method: "POST",
        headers: buildHeaders({ "Content-Type": "application/json" }),
        cache: "no-store",
        credentials: "same-origin",
        body: JSON.stringify({ choice }),
      });

      const text = await res.text();
      if (text.trim().startsWith("<")) {
        throw new Error("Poll error: API returned HTML.");
      }

      const json = JSON.parse(text) as ApiResponse;

      if (res.status === 401) { setMustSignIn(true); setError(null); return; }
      if (!res.ok) throw new Error((json as any)?.error || "Vote failed");

      setData(json);
      setPhase("result");
    } catch (e: any) {
      setError(e?.message || "Vote failed");
    } finally {
      setSubmitting(false);
    }
  }

  const q = data?.question ?? null;
  const voted = data?.voted ?? null;

  const totals = useMemo(() => {
    if (!q) return { total: 0, A: 0, B: 0, C: 0, D: 0 };
    const A = q.a_count || 0;
    const B = q.b_count || 0;
    const C = q.c_count || 0;
    const D = q.d_count || 0;
    return { total: A + B + C + D, A, B, C, D };
  }, [q]);

  const pct = (n: number) =>
    totals.total ? Math.round((n / totals.total) * 100) : 0;

  const optionTexts: Record<Letter, string> = q
    ? { A: q.a_text, B: q.b_text, C: q.c_text, D: q.d_text }
    : { A: "", B: "", C: "", D: "" };

  const positionLabel = (letter: Letter) => {
    if (!totals.total) return "";
    const sorted = (["A", "B", "C", "D"] as Letter[])
      .sort((a, b) => totals[b] - totals[a]);
    const rank = sorted.indexOf(letter);
    if (rank === 0) return "the most common view";
    if (rank === 1) return "the second most common view";
    return "a less common view";
  };

  if (!authReady || (loading && !q) || !q) return null;

  return (
    <section>
      <style jsx>{`
        .poll-wrap {
          margin-top: 2.5rem;
          border-top: 2px solid var(--gold-line);
          padding-top: 2rem;
        }
        .option-btn {
          width: 100%;
          text-align: left;
          background: transparent;
          border: 1px solid var(--border-light);
          border-radius: 3px;
          padding: 0.9rem 1.1rem;
          cursor: pointer;
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          transition: border-color 0.15s ease, background 0.15s ease;
          margin-bottom: 0.5rem;
          position: relative;
          overflow: hidden;
        }
        .option-btn:hover {
          border-color: var(--gold-line);
          background: var(--gold-dim);
        }
        .option-btn.selected {
          border-color: var(--gold);
          background: var(--gold-dim);
        }
        .option-btn:disabled {
          cursor: default;
        }
        .letter {
          font-family: var(--font-body);
          font-size: 0.6rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          color: var(--gold);
          padding-top: 2px;
          min-width: 14px;
        }
        .opt-text {
          font-family: var(--font-body);
          font-size: 0.9rem;
          font-weight: 500;
          color: var(--text);
          line-height: 1.45;
        }
        .submit-btn {
          width: 100%;
          padding: 0.85rem;
          background: var(--gold);
          color: var(--bg);
          border: none;
          border-radius: 3px;
          font-family: var(--font-body);
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          cursor: pointer;
          transition: opacity 0.15s ease;
          margin-top: 0.25rem;
        }
        .submit-btn:disabled {
          opacity: 0.3;
          cursor: default;
        }
        .result-row {
          margin-bottom: 1rem;
        }
        .result-header {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: 0.35rem;
          gap: 0.5rem;
        }
        .result-label {
          font-family: var(--font-body);
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--text-dim);
          display: flex;
          align-items: center;
          gap: 0.4rem;
          flex-wrap: wrap;
        }
        .you-badge {
          font-size: 0.55rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--bg);
          background: var(--gold);
          padding: 1px 5px;
          border-radius: 2px;
        }
        .result-pct {
          font-family: var(--font-body);
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-faint);
          white-space: nowrap;
        }
        .result-pct.mine {
          color: var(--gold);
        }
        .bar-track {
          height: 3px;
          background: var(--border);
          border-radius: 2px;
          overflow: hidden;
        }
        .bar-fill {
          height: 100%;
          border-radius: 2px;
          background: var(--border-light);
          transition: width 0.7s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .bar-fill.mine {
          background: var(--gold);
        }
        .insight-box {
          margin-top: 1.5rem;
          padding: 1rem 1.25rem;
          border-left: 2px solid var(--gold);
          background: var(--gold-dim);
          border-radius: 0 3px 3px 0;
        }
        .insight-label {
          font-family: var(--font-body);
          font-size: 0.6rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--gold);
          margin-bottom: 0.4rem;
        }
        .insight-text {
          font-family: var(--font-body);
          font-size: 0.85rem;
          color: var(--text-dim);
          line-height: 1.6;
        }
        .vote-count {
          font-family: var(--font-body);
          font-size: 0.65rem;
          color: var(--text-faint);
          margin-top: 1rem;
          text-align: right;
          letter-spacing: 0.04em;
        }
        .signin-banner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          padding: 0.85rem 1.1rem;
          border: 1px solid var(--border-light);
          border-radius: 3px;
          background: var(--bg3);
          margin-bottom: 0.75rem;
        }
        .cta-start {
          width: 100%;
          padding: 0.85rem;
          background: transparent;
          color: var(--gold);
          border: 1px solid var(--gold-line);
          border-radius: 3px;
          font-family: var(--font-body);
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          cursor: pointer;
          transition: background 0.15s ease;
        }
        .cta-start:hover {
          background: var(--gold-dim);
        }
      `}</style>

      <div className="poll-wrap">

        {/* Eyebrow */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "0.6rem",
          marginBottom: "0.75rem",
        }}>
          <div className="eyebrow">The People's Verdict</div>
          {refreshing && (
            <span style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.6rem",
              color: "var(--text-faint)",
              letterSpacing: "0.08em",
            }}>
              Updating…
            </span>
          )}
        </div>

        {/* Question */}
        <h3 style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(1.1rem, 2.5vw, 1.35rem)",
          fontWeight: 400,
          color: "var(--text)",
          lineHeight: 1.3,
          marginBottom: "0.5rem",
        }}>
          {q.prompt}
        </h3>

        <div className="divider" style={{ marginBottom: "1.5rem" }} />

        {error && (
          <div style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.8rem",
            color: "#ef4444",
            marginBottom: "0.75rem",
          }}>
            {error}
          </div>
        )}

        {/* ── PRE STATE — teaser before engagement ── */}
        {phase === "pre" && (
          <>
            <p style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.88rem",
              color: "var(--text-faint)",
              lineHeight: 1.65,
              marginBottom: "1.25rem",
            }}>
              {totals.total > 0
                ? `${totals.total} readers have weighed in. Answer to see where you stand.`
                : "Be one of the first to weigh in."}
            </p>
            <button className="cta-start" onClick={() => setPhase("voting")}>
              Take the poll →
            </button>
          </>
        )}

        {/* ── VOTING STATE ── */}
        {phase === "voting" && (
          <>
            {mustSignIn && (
              <div className="signin-banner">
                <div>
                  <div style={{
                    fontFamily: "var(--font-body)",
                    fontWeight: 600,
                    fontSize: "0.88rem",
                    color: "var(--text)",
                    marginBottom: "0.2rem",
                  }}>
                    Sign in to vote and see results
                  </div>
                  <div style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "0.75rem",
                    color: "var(--text-faint)",
                  }}>
                    One vote per account.
                  </div>
                </div>
                <Link href="/signin" style={{
                  textDecoration: "none",
                  padding: "8px 14px",
                  background: "var(--gold)",
                  color: "var(--bg)",
                  borderRadius: 3,
                  fontFamily: "var(--font-body)",
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  whiteSpace: "nowrap",
                }}>
                  Sign in
                </Link>
              </div>
            )}

            {LETTERS.map((letter) => (
              <button
                key={letter}
                className={`option-btn ${selected === letter ? "selected" : ""}`}
                onClick={() => setSelected(letter)}
                disabled={submitting}
              >
                <span className="letter">{letter}</span>
                <span className="opt-text">{optionTexts[letter]}</span>
              </button>
            ))}

            <button
              className="submit-btn"
              onClick={() => selected && vote(selected)}
              disabled={!selected || submitting}
            >
              {submitting ? "Submitting…" : "Submit my answer"}
            </button>
          </>
        )}

        {/* ── RESULT STATE ── */}
        {phase === "result" && voted && (
          <>
            {LETTERS.map((letter) => {
              const count = totals[letter];
              const percent = pct(count);
              const isMine = voted === letter;

              return (
                <div className="result-row" key={letter}>
                  <div className="result-header">
                    <div className="result-label">
                      {optionTexts[letter]}
                      {isMine && <span className="you-badge">You</span>}
                    </div>
                    <div className={`result-pct ${isMine ? "mine" : ""}`}>
                      {percent}%
                    </div>
                  </div>
                  <div className="bar-track">
                    <div
                      className={`bar-fill ${isMine ? "mine" : ""}`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}

<div className="vote-count">{totals.total} readers responded</div>

{/* Insight */}
<div className="insight-box">
  <div className="insight-label">
    Your position — {positionLabel(voted)} ({pct(totals[voted])}% of readers)
  </div>
  <div className="insight-text">
    You chose: <strong style={{ color: "var(--text)", fontWeight: 500 }}>{optionTexts[voted]}</strong>.
    {" "}This is {positionLabel(voted)} among TPV readers.
  </div>
</div>

<div style={{
  marginTop: "1.25rem",
  paddingTop: "1.25rem",
  borderTop: "1px solid var(--border)",
  display: "flex",
  flexDirection: "column" as const,
  gap: "0.5rem",
}}>
  <div style={{
    fontFamily: "var(--font-body)",
    fontSize: "0.72rem",
    fontWeight: 700,
    letterSpacing: "0.1em",
    textTransform: "uppercase" as const,
    color: "var(--text-faint)",
    marginBottom: "0.25rem",
  }}>
    Understand the disagreement
  </div>
  <div style={{
    fontFamily: "var(--font-body)",
    fontSize: "0.85rem",
    color: "var(--text-dim)",
    lineHeight: 1.6,
  }}>
    The article above breaks down exactly why reasonable people land on different sides — values, facts, and incentives.
  </div>
  <a href="#the-overview" style={{
    fontFamily: "var(--font-body)",
    fontSize: "0.78rem",
    fontWeight: 600,
    color: "var(--gold)",
    textDecoration: "none",
    marginTop: "0.25rem",
  }}>
    Read the breakdown &#8594;
  </a>
</div>
          </>
        )}
      </div>
    </section>
  );
}