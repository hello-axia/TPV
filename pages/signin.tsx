import { useState } from "react";
import { supabase } from "../lib/supabaseClients";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function signInWithEmail(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setLoading(false);
    if (error) {
      setIsSuccess(false);
      setStatus(error.message);
    } else {
      setIsSuccess(true);
      setStatus("Check your email — a sign-in link is on its way.");
    }
  }

  async function signInWithGoogle() {
    setLoading(true);
    setStatus(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    setLoading(false);
    if (error) {
      setIsSuccess(false);
      setStatus(error.message);
    }
  }

  return (
    <main style={{
      minHeight: "60vh",
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "center",
      padding: "72px 24px 96px",
    }}>
      <div style={{ width: "100%", maxWidth: 420 }}>

        {/* Eyebrow */}
        <div style={{
          fontFamily: "var(--font-body)",
          fontSize: "0.68rem",
          fontWeight: 600,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: "var(--gold)",
          marginBottom: "1rem",
        }}>
          The People's Verdict
        </div>

        {/* Heading */}
        <h1 style={{
          fontFamily: "var(--font-display)",
          fontSize: "2.25rem",
          fontWeight: 400,
          color: "var(--text)",
          lineHeight: 1.2,
          marginBottom: "0.75rem",
        }}>
          Sign in
        </h1>

        <p style={{
          fontFamily: "var(--font-body)",
          fontSize: "0.95rem",
          color: "var(--text-dim)",
          lineHeight: 1.65,
          marginBottom: "2rem",
          paddingBottom: "2rem",
          borderBottom: "1px solid var(--border)",
        }}>
          Sign in to vote on verdicts and track your Bound progress.
        </p>

        <div style={{ display: "grid", gap: 10 }}>

          {/* Google */}
          <button
            onClick={signInWithGoogle}
            disabled={loading}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              width: "100%",
              border: "1px solid var(--gold-line)",
              background: "var(--gold-dim)",
              borderRadius: 3,
              padding: "12px 16px",
              fontFamily: "var(--font-body)",
              fontSize: "0.88rem",
              fontWeight: 600,
              letterSpacing: "0.03em",
              color: "var(--gold)",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.6 : 1,
              transition: "background 0.15s ease",
              textAlign: "left",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#c8a96e"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#a08856"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#8a7048"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#b8964e"/>
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            margin: "4px 0",
          }}>
            <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
            <span style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.72rem",
              color: "var(--text-faint)",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}>or</span>
            <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
          </div>

          {/* Email form */}
          <div style={{ display: "grid", gap: 8 }}>
            <label style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.72rem",
              fontWeight: 600,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--text-faint)",
            }}>
              Email — magic link
            </label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
              placeholder="you@example.com"
              style={{
                background: "var(--bg2)",
                border: "1px solid var(--border-light)",
                borderRadius: 3,
                padding: "11px 14px",
                fontFamily: "var(--font-body)",
                fontSize: "0.95rem",
                color: "var(--text)",
                outline: "none",
                width: "100%",
                transition: "border-color 0.15s ease",
              }}
              onFocus={(e) => e.target.style.borderColor = "var(--gold-line)"}
              onBlur={(e) => e.target.style.borderColor = "var(--border-light)"}
            />
            <button
              onClick={(e) => { e.preventDefault(); signInWithEmail(e as any); }}
              disabled={loading || !email}
              style={{
                border: "1px solid var(--border-light)",
                background: "var(--bg2)",
                borderRadius: 3,
                padding: "11px 16px",
                fontFamily: "var(--font-body)",
                fontSize: "0.88rem",
                fontWeight: 600,
                letterSpacing: "0.04em",
                color: loading || !email ? "var(--text-faint)" : "var(--text-dim)",
                cursor: loading || !email ? "not-allowed" : "pointer",
                transition: "border-color 0.15s ease, color 0.15s ease",
                textAlign: "left",
              }}
            >
              {loading ? "Sending…" : "Send magic link →"}
            </button>
          </div>

          {/* Status message */}
          {status && (
            <div style={{
              marginTop: 4,
              padding: "12px 14px",
              borderRadius: 3,
              border: `1px solid ${isSuccess ? "rgba(46,204,113,0.25)" : "rgba(192,57,43,0.25)"}`,
              background: isSuccess ? "rgba(46,204,113,0.06)" : "rgba(192,57,43,0.06)",
              fontFamily: "var(--font-body)",
              fontSize: "0.85rem",
              lineHeight: 1.55,
              color: isSuccess ? "#2ecc71" : "#e74c3c",
            }}>
              {status}
            </div>
          )}
        </div>

        {/* Footer note */}
        <p style={{
          marginTop: "2rem",
          fontFamily: "var(--font-body)",
          fontSize: "0.75rem",
          color: "var(--text-faint)",
          lineHeight: 1.6,
        }}>
          By signing in, you agree to our{" "}
          <a href="/terms" style={{ color: "var(--gold)", textDecoration: "none", borderBottom: "1px solid var(--gold-line)" }}>Terms</a>
          {" "}and{" "}
          <a href="/privacy" style={{ color: "var(--gold)", textDecoration: "none", borderBottom: "1px solid var(--gold-line)" }}>Privacy Policy</a>.
        </p>
      </div>
    </main>
  );
}