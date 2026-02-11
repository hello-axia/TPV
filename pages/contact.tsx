export default function ContactPage() {
    return (
      <main style={{ maxWidth: 720, margin: "0 auto", padding: "42px 24px 72px" }}>
        <h1 style={{ fontSize: 46, fontWeight: 900, letterSpacing: -1.2, margin: 0 }}>
          Contact
        </h1>
  
        <p style={{ marginTop: 12, color: "#6b7280", fontSize: 18, lineHeight: 1.6 }}>
          Send a note. If it’s thoughtful, we’ll read it.
        </p>
  
        <div
          style={{
            marginTop: 24,
            border: "1px solid #e5e7eb",
            borderRadius: 0,
            background: "#fff",
            padding: 18,
          }}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              alert("Form UI only for now — we’ll wire sending next.");
            }}
            style={{ display: "grid", gap: 12 }}
          >
            <label style={{ display: "grid", gap: 6 }}>
              <span style={{ fontSize: 13, color: "#6b7280" }}>Your email</span>
              <input
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
  
            <label style={{ display: "grid", gap: 6 }}>
              <span style={{ fontSize: 13, color: "#6b7280" }}>Message</span>
              <textarea
                required
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
              style={{
                marginTop: 6,
                border: "1px solid #e5e7eb",
                background: "#f9fafb",
                borderRadius: 0,
                padding: "10px 12px",
                fontSize: 15,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Send
            </button>
          </form>
  
          <div style={{ marginTop: 12, color: "#6b7280", fontSize: 13, lineHeight: 1.5 }}>
            Prefer email?{" "}
            <span style={{ color: "#111827", fontWeight: 600 }}>hello@tpv.news</span>
          </div>
        </div>
      </main>
    );
  }