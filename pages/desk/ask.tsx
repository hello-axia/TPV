import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import OgHead from "../../components/OgHead";
import Link from "next/link";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const MAX_CHARS = 500;

export default function DeskAskPage() {
  const [question, setQuestion] = useState("");
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUserId(data.session?.user?.id ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUserId(session?.user?.id ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function handleSubmit() {
    const q = question.trim();
    if (!q) { setError("Please enter a question."); return; }
    if (q.length > MAX_CHARS) { setError(`Keep it under ${MAX_CHARS} characters.`); return; }
    if (!userId && !email.trim()) {
      setError("Please enter your email so we can notify you when it's answered.");
      return;
    }

    setSubmitting(true);
    setError(null);

    const { error: err } = await supabase.from("desk_questions").insert({
      question: q,
      user_id: userId ?? null,
      email: userId ? null : email.trim(),
    });

    setSubmitting(false);
    if (err) { setError("Something went wrong. Please try again."); return; }
    setSubmitted(true);
  }

  return (
    <>
      <OgHead title="Ask the Desk — The People's Verdict" type="default" />
      <main style={{ maxWidth: 680, margin: "0 auto", padding: "3rem 1.25rem 6rem" }}>

        {/* Back link */}
        <Link href="/desk" style={{
          fontFamily: "var(--font-body)",
          fontSize: "0.65rem",
          fontWeight: 600,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "var(--text-faint)",
          textDecoration: "none",
          display: "inline-flex",
          alignItems: "center",
          gap: "0.3rem",
          borderBottom: "1px solid var(--border)",
          paddingBottom: 1,
          marginBottom: "2.5rem",
        }}>
          ← The Desk
        </Link>

        {/* Header */}
        <div style={{ marginBottom: "2.5rem" }}>
          <div className="eyebrow" style={{ marginBottom: "1rem" }}>
            The People's Verdict
          </div>
          <h1 style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(2rem, 5vw, 3rem)",
            fontWeight: 400,
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
            color: "var(--text)",
            marginBottom: "1rem",
          }}>
            Ask the Desk
          </h1>
          <p style={{
            fontFamily: "var(--font-body)",
            fontSize: "1rem",
            lineHeight: 1.75,
            color: "var(--text-dim)",
          }}>
            Submit a question about any policy, law, or current event. Good questions get a full breakdown. Great ones become Verdicts or Briefings.
          </p>
        </div>

        <div style={{ borderTop: "1px solid var(--border)", marginBottom: "2.5rem" }} />

        {/* Form or success */}
        {submitted ? (
          <div style={{
            padding: "2rem",
            border: "1px solid var(--gold-line)",
            background: "var(--gold-dim)",
            borderRadius: 4,
          }}>
            <div style={{
              fontFamily: "var(--font-display)",
              fontSize: "1.4rem",
              color: "var(--text)",
              marginBottom: "0.75rem",
            }}>
              Question received.
            </div>
            <p style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.92rem",
              color: "var(--text-dim)",
              lineHeight: 1.7,
              margin: "0 0 1.5rem",
            }}>
              We read every question submitted to the desk. If yours gets answered, it'll appear on The Desk. Good ones get turned into full articles.
            </p>
            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
              <button
                onClick={() => { setSubmitted(false); setQuestion(""); setEmail(""); }}
                style={{
                  background: "transparent",
                  border: "1px solid var(--border-light)",
                  color: "var(--text-faint)",
                  fontFamily: "var(--font-body)",
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  padding: "9px 16px",
                  borderRadius: 3,
                  cursor: "pointer",
                }}
              >
                Ask another
              </button>
              <Link href="/desk" style={{
                display: "inline-flex",
                alignItems: "center",
                fontFamily: "var(--font-body)",
                fontSize: "0.72rem",
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--gold)",
                textDecoration: "none",
                padding: "9px 16px",
                border: "1px solid var(--gold-line)",
                borderRadius: 3,
              }}>
                Back to The Desk
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.65rem",
              fontWeight: 700,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--gold)",
              marginBottom: "1rem",
            }}>
              Your question
            </div>

            <textarea
              value={question}
              onChange={(e) => { setQuestion(e.target.value); setError(null); }}
              placeholder="What do you want to understand? Ask about any policy, law, current event, or political question."
              rows={6}
              maxLength={MAX_CHARS}
              style={{
                width: "100%",
                background: "var(--bg2)",
                border: `1px solid ${error && !question.trim() ? "#e74c3c" : "var(--border-light)"}`,
                borderRadius: 4,
                padding: "1rem",
                fontFamily: "var(--font-body)",
                fontSize: "0.95rem",
                lineHeight: 1.7,
                color: "var(--text)",
                resize: "vertical",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
            <div style={{
              display: "flex",
              justifyContent: "flex-end",
              marginTop: "0.35rem",
              marginBottom: "1.5rem",
              fontFamily: "var(--font-body)",
              fontSize: "0.72rem",
              color: question.length > MAX_CHARS * 0.9 ? "var(--gold)" : "var(--text-faint)",
            }}>
              {question.length} / {MAX_CHARS}
            </div>

            {!userId && (
              <div style={{ marginBottom: "1.5rem" }}>
                <label style={{
                  display: "block",
                  fontFamily: "var(--font-body)",
                  fontSize: "0.65rem",
                  fontWeight: 700,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "var(--text-faint)",
                  marginBottom: "0.6rem",
                }}>
                  Your email{" "}
                  <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>
                    — so we can notify you when it's answered
                  </span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(null); }}
                  placeholder="you@example.com"
                  style={{
                    width: "100%",
                    background: "var(--bg2)",
                    border: `1px solid ${error && !email.trim() ? "#e74c3c" : "var(--border-light)"}`,
                    borderRadius: 4,
                    padding: "0.85rem 1rem",
                    fontFamily: "var(--font-body)",
                    fontSize: "0.9rem",
                    color: "var(--text)",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
                <div style={{
                  marginTop: "0.5rem",
                  fontFamily: "var(--font-body)",
                  fontSize: "0.78rem",
                  color: "var(--text-faint)",
                }}>
                  Or{" "}
                  <Link href="/signin" style={{ color: "var(--gold)" }}>
                    sign in
                  </Link>{" "}
                  to submit without entering your email.
                </div>
              </div>
            )}

            {error && (
              <div style={{
                marginBottom: "1rem",
                fontFamily: "var(--font-body)",
                fontSize: "0.82rem",
                color: "#e74c3c",
              }}>
                {error}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={submitting || !question.trim()}
              style={{
                background: question.trim() ? "var(--gold)" : "var(--bg3)",
                color: question.trim() ? "var(--bg)" : "var(--text-faint)",
                border: "none",
                borderRadius: 3,
                padding: "12px 22px",
                fontFamily: "var(--font-body)",
                fontSize: "0.72rem",
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                cursor: question.trim() && !submitting ? "pointer" : "not-allowed",
                opacity: submitting ? 0.6 : 1,
                transition: "all 0.15s ease",
              }}
            >
              {submitting ? "Submitting..." : "Submit to the Desk →"}
            </button>
          </>
        )}

        <style jsx>{`
          textarea:focus { border-color: var(--gold-line) !important; }
          input:focus { border-color: var(--gold-line) !important; }
        `}</style>
      </main>
    </>
  );
}