import { useEffect, useMemo, useState } from "react";

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

function OptionRow({
  letter,
  text,
  disabled,
  onVote,
}: {
  letter: "A" | "B" | "C" | "D";
  text: string;
  disabled: boolean;
  onVote: (choice: "A" | "B" | "C" | "D") => void;
}) {
  return (
    <button
      onClick={() => onVote(letter)}
      disabled={disabled}
      style={{
        width: "100%",
        textAlign: "left",
        border: "1px solid #e5e7eb",
        background: "#fff",
        padding: "12px 12px",
        display: "flex",
        gap: 12,
        alignItems: "center",
        cursor: disabled ? "not-allowed" : "pointer",
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
}

function ResultRow({
  letter,
  text,
  count,
  total,
  isMine,
}: {
  letter: "A" | "B" | "C" | "D";
  text: string;
  count: number;
  total: number;
  isMine: boolean;
}) {
  const percent = total ? Math.round((count / total) * 100) : 0;

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

      <div
        style={{
          height: 8,
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
          }}
        />
      </div>
    </div>
  );
}

export default function GlobalQuestion({ questionId }: { questionId: string }) {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [data, setData] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

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

    try {
      setSubmitting(true);
      setError(null);

      const res = await fetch(`/api/question/${encodeURIComponent(questionId)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ choice }),
      });

      const json = (await res.json()) as ApiResponse;
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

  if (loading) return null;

  return (
    <section style={{ marginTop: 26, borderTop: "1px solid #e5e7eb", paddingTop: 18 }}>
      {error ? <div style={{ color: "#b91c1c", fontSize: 14 }}>{error}</div> : null}

      {q ? (
        <div style={{ display: "grid", gap: 10 }}>
          <div
            style={{
              fontSize: 12,
              color: "#6b7280",
              letterSpacing: 1,
              textTransform: "uppercase",
            }}
          >
            The Question
          </div>

          <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: -0.6, lineHeight: 1.15 }}>
            {q.prompt}
          </div>

          <div style={{ marginTop: 8, display: "grid", gap: 8 }}>
            {!voted ? (
              <>
                <OptionRow letter="A" text={q.a_text} disabled={submitting} onVote={vote} />
                <OptionRow letter="B" text={q.b_text} disabled={submitting} onVote={vote} />
                <OptionRow letter="C" text={q.c_text} disabled={submitting} onVote={vote} />
                <OptionRow letter="D" text={q.d_text} disabled={submitting} onVote={vote} />
              </>
            ) : (
              <>
                <div
                  style={{
                    fontSize: 12,
                    color: "#6b7280",
                    letterSpacing: 1,
                    textTransform: "uppercase",
                    marginTop: 6,
                  }}
                >
                  Results
                </div>

                <ResultRow letter="A" text={q.a_text} count={totals.A} total={totals.total} isMine={voted === "A"} />
                <ResultRow letter="B" text={q.b_text} count={totals.B} total={totals.total} isMine={voted === "B"} />
                <ResultRow letter="C" text={q.c_text} count={totals.C} total={totals.total} isMine={voted === "C"} />
                <ResultRow letter="D" text={q.d_text} count={totals.D} total={totals.total} isMine={voted === "D"} />
              </>
            )}
          </div>
        </div>
      ) : null}
    </section>
  );
}