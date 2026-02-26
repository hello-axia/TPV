import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
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

export default function GlobalQuestion({ questionId }: { questionId: string }) {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [data, setData] = useState<ApiResponse | null>(null);

  // keep "real errors" separate from "needs auth"
  const [error, setError] = useState<string | null>(null);
  const [mustSignIn, setMustSignIn] = useState(false);

  // track auth state (so we can hide results + avoid hitting API)
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setUser(data.session?.user ?? null);
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      // when they sign in/out, clear the banner
      setMustSignIn(false);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  async function load() {
    try {
      setError(null);
      setLoading(true);

      const res = await fetch(`/api/question/${encodeURIComponent(questionId)}`);
      const json = (await res.json()) as ApiResponse;

      if (!res.ok) throw new Error((json as any)?.error || "Failed to load");
      setData(json);
    } catch (e: any) {
      setError(e?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questionId]);

  async function vote(choice: "A" | "B" | "C" | "D") {
    if (submitting) return;

    // Treat "not signed in" as normal UI state (no alert, no scary error)
    if (!user) {
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ choice }),
      });

      const json = (await res.json()) as ApiResponse;

      if (res.status === 401) {
        // in case server says they're signed out
        setMustSignIn(true);
        setError(null);
        return;
      }

      if (!res.ok) throw new Error((json as any)?.error || "Vote failed");

      setData(json);
    } catch (e: any) {
      setError(e?.message || "Vote failed");
    } finally {
      setSubmitting(false);
    }
  }

  const q = data?.question;
  const voted = data?.voted;

  const totals = useMemo(() => {
    if (!q) return { total: 0, A: 0, B: 0, C: 0, D: 0 };
    const A = q.a_count || 0;
    const B = q.b_count || 0;
    const C = q.c_count || 0;
    const D = q.d_count || 0;
    const total = A + B + C + D;
    return { total, A, B, C, D };
  }, [q]);

  const pct = (n: number) => (totals.total ? Math.round((n / totals.total) * 100) : 0);

  const SignInBanner = () => (
    <div
      style={{
        border: "1px solid #e5e7eb",
        background: "#fff",
        borderRadius: 12,
        padding: "12px 12px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
      }}
    >
      <div style={{ color: "#111827", fontWeight: 700 }}>
        Sign in to vote, and to see results!
        <div style={{ color: "#6b7280", fontWeight: 500, fontSize: 13, marginTop: 2 }}>
          One vote per account.
        </div>
      </div>

      <Link
        href="/signin"
        style={{
          textDecoration: "none",
          border: "1px solid #e5e7eb",
          background: "#111827",
          color: "#fff",
          borderRadius: 12,
          padding: "10px 12px",
          fontWeight: 800,
          whiteSpace: "nowrap",
        }}
      >
        Sign in
      </Link>
    </div>
  );

  const OptionRow = ({
    letter,
    text,
  }: {
    letter: "A" | "B" | "C" | "D";
    text: string;
  }) => (
    <button
      onClick={() => vote(letter)}
      disabled={submitting}
      style={{
        width: "100%",
        textAlign: "left",
        border: "1px solid #e5e7eb",
        background: "#fff",
        padding: "12px 12px",
        display: "flex",
        gap: 12,
        alignItems: "center",
        cursor: submitting ? "not-allowed" : "pointer",
      }}
    >
      <div
        style={{
          width: 24,
          fontSize: 12,
          fontWeight: 800,
          color: "#6b7280",
          letterSpacing: 1,
        }}
      >
        {letter}
      </div>
      <div style={{ fontSize: 14, color: "#111827" }}>{text}</div>
    </button>
  );

  const ResultRow = ({
    letter,
    text,
    count,
  }: {
    letter: "A" | "B" | "C" | "D";
    text: string;
    count: number;
  }) => {
    const percent = pct(count);
    const isMine = voted === letter;

    return (
      <div style={{ display: "grid", gap: 6 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
          <div style={{ fontSize: 14, color: "#111827" }}>
            <span style={{ fontWeight: 800 }}>{letter}</span>{" "}
            <span style={{ color: "#6b7280" }}>{text}</span>
            {isMine ? (
              <span style={{ marginLeft: 8, color: "#111827", fontWeight: 700 }}>
                • You
              </span>
            ) : null}
          </div>

          <div style={{ fontSize: 12, color: "#6b7280" }}>
            {percent}% • {count}
          </div>
        </div>

        <div style={{ height: 8, border: "1px solid #e5e7eb", background: "#fff" }}>
          <div
            style={{
              height: "100%",
              width: `${percent}%`,
              background: "#111827",
              transition: "width 600ms ease",
              opacity: isMine ? 1 : 0.25,
            }}
          />
        </div>
      </div>
    );
  };

  if (loading) return null;
  if (!q) return null;

  const canSeeResults = !!user && !!voted;

  return (
    <section style={{ marginTop: 14 }}>
      {/* thin line UNDER the article’s prompt */}
      <div style={{ borderTop: "1px solid #e5e7eb", marginBottom: 14 }} />

      {/* real errors only */}
      {error ? (
        <div style={{ color: "#b91c1c", fontSize: 14, marginBottom: 10 }}>
          {error}
        </div>
      ) : null}

      {/* inline sign-in prompt */}
      {(!user || mustSignIn) && (
        <div style={{ marginBottom: 10 }}>
          <SignInBanner />
        </div>
      )}

      {/* integrated block */}
      <div style={{ display: "grid", gap: 8 }}>
        {!canSeeResults ? (
          <>
            <OptionRow letter="A" text={q.a_text} />
            <OptionRow letter="B" text={q.b_text} />
            <OptionRow letter="C" text={q.c_text} />
            <OptionRow letter="D" text={q.d_text} />
          </>
        ) : (
          <>
            <ResultRow letter="A" text={q.a_text} count={totals.A} />
            <ResultRow letter="B" text={q.b_text} count={totals.B} />
            <ResultRow letter="C" text={q.c_text} count={totals.C} />
            <ResultRow letter="D" text={q.d_text} count={totals.D} />
          </>
        )}
      </div>
    </section>
  );
}