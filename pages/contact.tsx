import { useState } from "react";

export default function ContactPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  return (
    <main style={{
      maxWidth: 720,
      margin: "0 auto",
      padding: "2.5rem 1.25rem 5rem",
    }}>
      <div className="eyebrow" style={{ marginBottom: "0.75rem" }}>Contact</div>
      <h1 style={{
        fontFamily: "var(--font-display)",
        fontSize: "clamp(2rem, 5vw, 3rem)",
        fontWeight: 400,
        letterSpacing: "-0.03em",
        color: "var(--text)",
        lineHeight: 1.05,
        margin: 0,
      }}>
        Get in touch
      </h1>
      <p style={{
        marginTop: "0.75rem",
        color: "var(--text-dim)",
        fontSize: "1rem",
        lineHeight: 1.6,
        fontFamily: "var(--font-body)",
      }}>
        Send a note. We'll read it.
      </p>

      <div style={{ borderTop: "1px solid var(--border)", margin: "1.5rem 0 2rem" }} />

      <div style={{
        border: "1px solid var(--border-light)",
        borderRadius: 4,
        background: "var(--bg2)",
        padding: "1.5rem",
      }}>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setStatus("sending");
            try {
              const r = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, message }),
              });
              if (!r.ok) throw new Error("Bad response");
              setStatus("sent");
              setEmail("");
              setMessage("");
            } catch {
              setStatus("error");
            }
          }}
          style={{ display: "grid", gap: "1rem" }}
        >
          <label style={{ display: "grid", gap: "0.4rem" }}>
            <span style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.72rem",
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--text-faint)",
            }}>
              Your email
            </span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={{
                border: "1px solid var(--border-light)",
                borderRadius: 3,
                padding: "0.7rem 0.9rem",
                fontSize: "0.95rem",
                outline: "none",
                background: "var(--bg3)",
                color: "var(--text)",
                fontFamily: "var(--font-body)",
              }}
            />
          </label>

          <label style={{ display: "grid", gap: "0.4rem" }}>
            <span style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.72rem",
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--text-faint)",
            }}>
              Message
            </span>
            <textarea
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="What's on your mind?"
              rows={6}
              style={{
                border: "1px solid var(--border-light)",
                borderRadius: 3,
                padding: "0.7rem 0.9rem",
                fontSize: "0.95rem",
                outline: "none",
                resize: "vertical",
                lineHeight: 1.6,
                background: "var(--bg3)",
                color: "var(--text)",
                fontFamily: "var(--font-body)",
              }}
            />
          </label>

          <button
            type="submit"
            disabled={status === "sending"}
            style={{
              marginTop: "0.25rem",
              padding: "0.85rem",
              background: status === "sending" ? "var(--bg3)" : "var(--gold)",
              color: status === "sending" ? "var(--text-faint)" : "var(--bg)",
              border: "none",
              borderRadius: 3,
              fontFamily: "var(--font-body)",
              fontSize: "0.72rem",
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              cursor: status === "sending" ? "default" : "pointer",
              transition: "opacity 0.15s ease",
            }}
          >
            {status === "sending" ? "Sending…" : "Send message"}
          </button>

          {status === "sent" && (
            <div style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem", color: "var(--gold)" }}>
              Sent. Thank you.
            </div>
          )}
          {status === "error" && (
            <div style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem", color: "#ef4444" }}>
              Something went wrong. Try again.
            </div>
          )}
        </form>

        <div style={{
          marginTop: "1.25rem",
          paddingTop: "1rem",
          borderTop: "1px solid var(--border)",
          fontFamily: "var(--font-body)",
          fontSize: "0.82rem",
          color: "var(--text-faint)",
          lineHeight: 1.5,
        }}>
          Prefer email?{" "}
          <a href="mailto:ello.axia@gmail.com" style={{
            color: "var(--gold)",
            textDecoration: "none",
            fontWeight: 500,
          }}>
            ello.axia@gmail.com
          </a>
        </div>
      </div>
    </main>
  );
}