import { useState } from "react";

export default function ContactPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: "42px 24px 72px" }}>
      <h1 style={{ fontSize: 46, fontWeight: 900, letterSpacing: -1.2, margin: 0 }}>
        Contact
      </h1>

      <p style={{ marginTop: 12, color: "#6b7280", fontSize: 18, lineHeight: 1.6 }}>
        Send a note. We’ll read it.
      </p>

      <div style={{ marginTop: 24, border: "1px solid #e5e7eb", borderRadius: 0, background: "#fff", padding: 18 }}>
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
          style={{ display: "grid", gap: 12 }}
        >
          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ fontSize: 13, color: "#6b7280" }}>Your email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={{ border: "1px solid #e5e7eb", borderRadius: 0, padding: "10px 12px", fontSize: 15, outline: "none" }}
            />
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ fontSize: 13, color: "#6b7280" }}>Message</span>
            <textarea
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="What’s on your mind?"
              rows={6}
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: 0,
                padding: "10px 12px",
                fontSize: 15,
                outline: "none",
                resize: "vertical",
                lineHeight: 1.6,
              }}
            />
          </label>

          <button
            type="submit"
            disabled={status === "sending"}
            style={{
              marginTop: 6,
              border: "1px solid #e5e7eb",
              background: status === "sending" ? "#f3f4f6" : "#f9fafb",
              borderRadius: 0,
              padding: "10px 12px",
              fontSize: 15,
              fontWeight: 700,
              cursor: status === "sending" ? "default" : "pointer",
            }}
          >
            {status === "sending" ? "Sending..." : "Send"}
          </button>

          {status === "sent" ? <div style={{ marginTop: 6, color: "#065f46", fontSize: 13 }}>Sent. Thank you.</div> : null}
          {status === "error" ? <div style={{ marginTop: 6, color: "#991b1b", fontSize: 13 }}>Something went wrong. Try again.</div> : null}
        </form>

        <div style={{ marginTop: 12, color: "#6b7280", fontSize: 13, lineHeight: 1.5 }}>
          Prefer email? <span style={{ color: "#111827", fontWeight: 600 }}>ello.axia@gmail.com</span>
        </div>
      </div>
    </main>
  );
}