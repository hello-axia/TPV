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

export default function GlobalQuestion({ questionId }: { questionId: string }) {
  const [loading, setLoading] = useState(true); // first load only
  const [refreshing, setRefreshing] = useState(false); // silent reloads
  const [submitting, setSubmitting] = useState(false);

  const [data, setData] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mustSignIn, setMustSignIn] = useState(false);

  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
const tokenRef = useRef<string | null>(null); // ✅ always-current token (no stale state)
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

      // Helps debug when Next returns an HTML error page
      if (text.trim().startsWith("<")) {
        throw new Error(
          "Poll error: API returned HTML (not JSON). Check /pages/api/question/[id].ts default export."
        );
      }

      const json = JSON.parse(text) as ApiResponse;

      if (!res.ok) throw new Error((json as any)?.error || "Failed to load poll");

      setData(json);
    } catch (e: any) {
      setError(e?.message || "Failed to load poll");
    } finally {
      firstLoadDone.current = true;
      setLoading(false);
      setRefreshing(false);
    }
  }

// Load AFTER auth is known (even if signed out)
useEffect(() => {
  if (!authReady) return;

  // If signed in, wait until we actually have a token before loading,
  // otherwise the GET will return voted:null and you'll show buttons incorrectly.
  if (user && !accessToken) return;

  firstLoadDone.current = false;
  load({ silent: false });
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [questionId, authReady, user, accessToken]);

// auth tracking + refresh after auth is ready
useEffect(() => {
  let mounted = true;

  (async () => {
    const { data } = await supabase.auth.getSession();
    if (!mounted) return;

    setUser(data.session?.user ?? null);

    const tok = data.session?.access_token ?? null;
    setAccessToken(tok);
    tokenRef.current = tok; // ✅ sync
    
    setAuthReady(true);
  })();

  const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
    setUser(session?.user ?? null);

    const tok = session?.access_token ?? null;
    setAccessToken(tok);
    tokenRef.current = tok; // ✅ sync (so load uses it immediately)
    
    setMustSignIn(false);
    setAuthReady(true);
    
    // ✅ now this GET will include Authorization (if signed in)
    load({ silent: true });
  });

  return () => {
    mounted = false;
    sub.subscription.unsubscribe();
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

async function vote(choice: "A" | "B" | "C" | "D") {
  if (submitting) return;

  // ✅ if we already know they voted, don't even POST
if (data?.voted) return;

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
        throw new Error(
          "Poll error: API returned HTML (not JSON). Check /pages/api/question/[id].ts default export."
        );
      }

      const json = JSON.parse(text) as ApiResponse;

      if (res.status === 401) {
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

  const q = data?.question ?? null;
  const voted = data?.voted ?? null;

  const totals = useMemo(() => {
    if (!q) return { total: 0, A: 0, B: 0, C: 0, D: 0 };
    const A = q.a_count || 0;
    const B = q.b_count || 0;
    const C = q.c_count || 0;
    const D = q.d_count || 0;
    const total = A + B + C + D;
    return { total, A, B, C, D };
  }, [q]);

  const pct = (n: number) =>
    totals.total ? Math.round((n / totals.total) * 100) : 0;

  // results visible after a user has voted (and is signed in)
  const canSeeResults = !!user && !!voted;
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
        <div
          style={{
            color: "#6b7280",
            fontWeight: 500,
            fontSize: 13,
            marginTop: 2,
          }}
        >
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
      disabled={submitting || !!voted}
      style={{
        width: "100%",
        textAlign: "left",
        border: "1px solid #e5e7eb",
        background: "#fff",
        borderRadius: 12,
        padding: "12px 12px",
        display: "flex",
        gap: 12,
        alignItems: "center",
        cursor: submitting ? "not-allowed" : "pointer",
        opacity: submitting ? 0.7 : 1,
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
      <div style={{ fontSize: 14, color: "#111827", fontWeight: 700 }}>
        {text}
      </div>
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
        <div
          style={{ display: "flex", justifyContent: "space-between", gap: 12 }}
        >
          <div style={{ fontSize: 14, color: "#111827" }}>
            <span style={{ fontWeight: 900 }}>{letter}</span>{" "}
            <span style={{ color: "#6b7280", fontWeight: 600 }}>{text}</span>
            {isMine ? (
              <span style={{ marginLeft: 8, color: "#111827", fontWeight: 800 }}>
                • You
              </span>
            ) : null}
          </div>

          <div style={{ fontSize: 12, color: "#6b7280", fontWeight: 700 }}>
            {percent}% • {count}
          </div>
        </div>

        <div
          style={{
            height: 8,
            borderRadius: 999,
            border: "1px solid #e5e7eb",
            background: "#fff",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${percent}%`,
              background: "#111827",
              transition: "width 600ms ease",
              opacity: isMine ? 1 : 0.25,
              borderRadius: 999,
            }}
          />
        </div>
      </div>
    );
  };

// Don't render until auth is known. Otherwise you can briefly show vote buttons
// before we learn voted status.
if (!authReady) return null;

if (loading && !q) return null;
if (!q) return null;

  return (
    <section style={{ marginTop: 14 }}>
      <div style={{ borderTop: "1px solid #e5e7eb", marginBottom: 14 }} />

      {error ? (
        <div
          style={{
            color: "#b91c1c",
            fontSize: 14,
            marginBottom: 10,
            fontWeight: 700,
          }}
        >
          {error}
        </div>
      ) : null}

{(!user && !voted) && (
  <div style={{ marginBottom: 10 }}>
    <SignInBanner />
  </div>
)}

      {refreshing ? (
        <div
          style={{
            fontSize: 12,
            color: "#9ca3af",
            marginBottom: 8,
            fontWeight: 700,
          }}
        >
          Updating…
        </div>
      ) : null}

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