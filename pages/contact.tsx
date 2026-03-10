import { useState } from "react";

export default function ContactPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  return (
    <main style={{
      maxWidth: 1100,
      margin: "0 auto",
      padding: "3rem 1.25rem 6rem",
    }}>

      {/* ── HEADER ── */}
      <div className="fade-up" style={{ marginBottom: "3rem", maxWidth: 700 }}>
        <div className="eyebrow" style={{ marginBottom: "1rem" }}>Contact</div>
        <h1 style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(2.2rem, 5vw, 3.5rem)",
          fontWeight: 400,
          letterSpacing: "-0.02em",
          color: "var(--text)",
          lineHeight: 1.05,
          marginBottom: "1.25rem",
        }}>
          We read everything.
        </h1>
        <div className="divider" />
        <p style={{
          marginTop: "1.25rem",
          color: "var(--text-dim)",
          fontSize: "1.05rem",
          lineHeight: 1.8,
          fontFamily: "var(--font-body)",
          maxWidth: 520,
        }}>
          Corrections, story pitches, feedback on the format, or just a reaction to something we published. All of it is useful.
        </p>
      </div>

      <div style={{ borderTop: "1px solid var(--border)", margin: "0 0 3rem" }} />

      {/* ── LAYOUT ── */}
      <div className="contact-layout fade-up-delay-1">

        {/* Form */}
        <div style={{ minWidth: 0 }}>
          <div style={{
            border: "1px solid var(--border-light)",
            borderRadius: 4,
            background: "var(--bg2)",
            padding: "2rem",
          }}>
            {status === "sent" ? (
              <div style={{ padding: "1rem 0" }}>
                <div style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "1.5rem",
                  fontWeight: 400,
                  color: "var(--text)",
                  marginBottom: "0.75rem",
                }}>
                  Got it. Thank you.
                </div>
                <p style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "0.95rem",
                  color: "var(--text-dim)",
                  lineHeight: 1.7,
                }}>
                  We'll get back to you if a response makes sense.
                </p>
                <button
                  onClick={() => setStatus("idle")}
                  style={{
                    marginTop: "1.5rem",
                    padding: "0.75rem 1.25rem",
                    background: "transparent",
                    color: "var(--gold)",
                    border: "1px solid var(--gold-line)",
                    borderRadius: 3,
                    fontFamily: "var(--font-body)",
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    cursor: "pointer",
                  }}
                >
                  Send another
                </button>
              </div>
            ) : (
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
                style={{ display: "grid", gap: "1.25rem" }}
              >
                <label style={{ display: "grid", gap: "0.5rem" }}>
                  <span style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "0.65rem",
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
                      padding: "0.8rem 1rem",
                      fontSize: "0.95rem",
                      outline: "none",
                      background: "var(--bg3)",
                      color: "var(--text)",
                      fontFamily: "var(--font-body)",
                      transition: "border-color 0.15s ease",
                    }}
                  />
                </label>

                <label style={{ display: "grid", gap: "0.5rem" }}>
                  <span style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "0.65rem",
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
                      padding: "0.8rem 1rem",
                      fontSize: "0.95rem",
                      outline: "none",
                      resize: "vertical",
                      lineHeight: 1.7,
                      background: "var(--bg3)",
                      color: "var(--text)",
                      fontFamily: "var(--font-body)",
                      transition: "border-color 0.15s ease",
                    }}
                  />
                </label>

                {status === "error" && (
                  <div style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "0.82rem",
                    color: "#ef4444",
                    padding: "0.65rem 0.9rem",
                    border: "1px solid rgba(239,68,68,0.25)",
                    borderRadius: 3,
                    background: "rgba(239,68,68,0.05)",
                  }}>
                    Something went wrong. Try again.
                  </div>
                )}

                <button
                  type="submit"
                  disabled={status === "sending"}
                  style={{
                    padding: "0.9rem",
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
                    marginTop: "0.25rem",
                  }}
                >
                  {status === "sending" ? "Sending..." : "Send message"}
                </button>
              </form>
            )}
          </div>

          <div style={{
            marginTop: "1rem",
            fontFamily: "var(--font-body)",
            fontSize: "0.8rem",
            color: "var(--text-faint)",
          }}>
            Prefer email?{" "}
            <a href="mailto:ello.axia@gmail.com" style={{
              color: "var(--gold)",
              textDecoration: "none",
              fontWeight: 500,
              borderBottom: "1px solid var(--gold-line)",
              paddingBottom: "1px",
            }}>
              ello.axia@gmail.com
            </a>
          </div>
        </div>

        {/* Sidebar */}
        <aside style={{ minWidth: 0 }}>
          <div style={{ position: "sticky", top: "6rem", display: "grid", gap: "1.5rem" }}>

            {[
              {
                label: "Story pitch",
                desc: "Covering a political issue we haven't touched yet? Tell us what it is and why it's worth the format.",
              },
              {
                label: "Correction",
                desc: "We take accuracy seriously. If something is wrong, we want to know immediately.",
              },
              {
                label: "Format feedback",
                desc: "The structure is the whole point. If a section isn't working or something is confusing, that's useful.",
              },
              {
                label: "Everything else",
                desc: "Reactions, disagreements, general thoughts. We read it all.",
              },
            ].map((item) => (
              <div key={item.label} style={{
                borderTop: "1px solid var(--border)",
                paddingTop: "1rem",
              }}>
                <div style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "0.65rem",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "var(--gold)",
                  marginBottom: "0.4rem",
                }}>
                  {item.label}
                </div>
                <div style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "0.85rem",
                  lineHeight: 1.65,
                  color: "var(--text-faint)",
                }}>
                  {item.desc}
                </div>
              </div>
            ))}
          </div>
        </aside>

      </div>

      <style jsx>{`
        .contact-layout {
          display: grid;
          grid-template-columns: 1fr;
          gap: 2.5rem;
          align-items: start;
        }
        @media (min-width: 980px) {
          .contact-layout {
            grid-template-columns: 1.35fr 0.65fr;
            gap: 3.5rem;
          }
        }
        input:focus, textarea:focus {
          border-color: var(--gold-line) !important;
        }
      `}</style>
    </main>
  );
}