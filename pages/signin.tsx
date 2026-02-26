import { useState } from "react";
import { supabase } from "../lib/supabaseClients";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<string | null>(null);
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
    if (error) return setStatus(error.message);
    setStatus("Check your email for a sign-in link.");
  }

  async function signInWithGoogle() {
    setLoading(true);
    setStatus(null);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setLoading(false);
    if (error) setStatus(error.message);
  }

  return (
    <main style={{ maxWidth: 520, margin: "0 auto", padding: "42px 24px 72px" }}>
      <h1 style={{ fontSize: 42, fontWeight: 900, letterSpacing: -1.1, margin: 0 }}>
        Sign in
      </h1>

      <p style={{ marginTop: 10, color: "#6b7280", lineHeight: 1.6 }}>
        Sign in to vote and track your Bound progress.
      </p>

      <div style={{ marginTop: 22, display: "grid", gap: 12 }}>
        <button
          onClick={signInWithGoogle}
          disabled={loading}
          style={{
            border: "1px solid #e5e7eb",
            background: "#fff",
            borderRadius: 0,
            padding: "10px 12px",
            fontSize: 15,
            fontWeight: 700,
            cursor: "pointer",
            textAlign: "left",
          }}
        >
          Continue with Google
        </button>

        <div style={{ color: "#9ca3af", fontSize: 13, textAlign: "center" }}>or</div>

        <form onSubmit={signInWithEmail} style={{ display: "grid", gap: 10 }}>
          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ fontSize: 13, color: "#6b7280" }}>Email (magic link)</span>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
              placeholder="you@example.com"
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: 0,
                padding: "10px 12px",
                fontSize: 15,
                outline: "none",
              }}
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            style={{
              border: "1px solid #e5e7eb",
              background: "#f9fafb",
              borderRadius: 0,
              padding: "10px 12px",
              fontSize: 15,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Send magic link
          </button>
        </form>

        {status ? (
          <div style={{ marginTop: 6, color: "#6b7280", fontSize: 13, lineHeight: 1.5 }}>
            {status}
          </div>
        ) : null}
      </div>
    </main>
  );
}