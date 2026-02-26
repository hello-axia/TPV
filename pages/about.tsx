export default function AboutPage() {
  return (
    <main
      style={{
        maxWidth: 1280,
        margin: "0 auto",
        padding: "28px 14px 64px",
      }}
    >
      {/* header */}
      <div style={{ marginBottom: 18 }}>
        <div
          style={{
            fontSize: 12,
            fontWeight: 900,
            letterSpacing: 1.2,
            color: "#ef4444",
            textTransform: "uppercase",
          }}
        >
          About
        </div>

        <h1
          style={{
            fontSize: 56,
            lineHeight: 1.02,
            fontWeight: 900,
            letterSpacing: -1.2,
            margin: "10px 0 0",
          }}
        >
          The People’s Verdict
        </h1>

        <p
          style={{
            marginTop: 12,
            color: "#374151",
            fontSize: 18,
            lineHeight: 1.6,
            fontStyle: "italic",
            maxWidth: 900,
          }}
        >
          News, structured — built for interpretation, not outrage.
        </p>
      </div>

      <div style={{ borderTop: "1px solid #e5e7eb", margin: "18px 0 22px" }} />

      {/* layout */}
      <div className="tpv-about">
        {/* LEFT: main copy */}
        <section style={{ minWidth: 0 }}>
          {/* What it is */}
          <div style={{ paddingTop: 6 }}>
            <h2
              style={{
                fontSize: 22,
                lineHeight: 1.18,
                fontWeight: 900,
                letterSpacing: -0.6,
                margin: 0,
                color: "#111827",
              }}
            >
              What TPV is
            </h2>

            <p style={{ marginTop: 12, fontSize: 16, lineHeight: 1.75, color: "#374151" }}>
              <strong>TPV</strong> is a structured publication designed to make the news easier to interpret.
            </p>

            <p style={{ marginTop: 12, fontSize: 16, lineHeight: 1.75, color: "#374151" }}>
              Most news tells you what happened. Some commentary tells you what to think.
            </p>

            <p style={{ marginTop: 12, fontSize: 16, lineHeight: 1.75, color: "#374151" }}>
              TPV focuses on a different question:
              <br />
              <span style={{ fontWeight: 900, color: "#111827" }}>
                How should this be interpreted?
              </span>
            </p>

            <p style={{ marginTop: 12, fontSize: 15, lineHeight: 1.75, color: "#6b7280" }}>
              Every article uses the same repeatable format—so readers know what to expect and can scan directly
              to the sections that matter to them.
            </p>
          </div>

          <div style={{ borderTop: "1px solid #e5e7eb", margin: "22px 0" }} />

          {/* Why it exists */}
          <div>
            <h2
              style={{
                fontSize: 22,
                lineHeight: 1.18,
                fontWeight: 900,
                letterSpacing: -0.6,
                margin: 0,
                color: "#111827",
              }}
            >
              Why TPV exists
            </h2>

            <p style={{ marginTop: 12, fontSize: 16, lineHeight: 1.75, color: "#374151" }}>
              News is complex. Explainers can be either biased, oversimplified, or too academic.
            </p>

            <p style={{ marginTop: 12, fontSize: 16, lineHeight: 1.75, color: "#374151" }}>
              <strong>TPV aims for the middle:</strong>
            </p>

            <ul style={{ marginTop: 10, paddingLeft: 18, lineHeight: 1.85, fontSize: 16, color: "#374151" }}>
              <li>
                <strong>Structure</strong> without being dense
              </li>
              <li>
                <strong>Depth</strong> without being pedantic
              </li>
              <li>
                <strong>Nuance</strong> without being partisan
              </li>
            </ul>
          </div>
        </section>

        {/* RIGHT: formats card(s) */}
        <aside style={{ minWidth: 0 }}>
          <div
            style={{
              borderTop: "1px solid #e5e7eb",
              paddingTop: 16,
            }}
          >
            <div
              style={{
                fontSize: 12,
                fontWeight: 900,
                letterSpacing: 1.2,
                color: "#ef4444",
                textTransform: "uppercase",
              }}
            >
              Formats
            </div>

            {/* Verdicts card */}
            <div
              style={{
                marginTop: 14,
                border: "1px solid #e5e7eb",
                borderRadius: 14,
                padding: 16,
                background: "#fff",
              }}
            >
              <div style={{ fontSize: 18, fontWeight: 900, letterSpacing: -0.4, color: "#111827" }}>
                Verdicts
              </div>
              <div style={{ marginTop: 6, fontSize: 14, lineHeight: 1.65, color: "#374151" }}>
                For polarizing stories where disagreement is central.
              </div>

              <div style={{ marginTop: 12, fontSize: 12, fontWeight: 900, letterSpacing: 1.1, color: "#6b7280", textTransform: "uppercase" }}>
                Decomposes into
              </div>

              <ul style={{ marginTop: 10, paddingLeft: 18, lineHeight: 1.85, fontSize: 14, color: "#374151" }}>
                <li><strong>Values</strong></li>
                <li><strong>Definitions</strong></li>
                <li><strong>Facts</strong></li>
                <li><strong>Forecasts</strong></li>
                <li><strong>Incentives</strong></li>
              </ul>

              <div style={{ marginTop: 12, fontSize: 13, lineHeight: 1.65, color: "#6b7280" }}>
                Readers can vote on which interpretation they find most persuasive—measuring current judgment, not “truth.”
              </div>
            </div>

            {/* Briefings card */}
            <div
              style={{
                marginTop: 16,
                border: "1px solid #e5e7eb",
                borderRadius: 14,
                padding: 16,
                background: "#fff",
              }}
            >
              <div style={{ fontSize: 18, fontWeight: 900, letterSpacing: -0.4, color: "#111827" }}>
                Briefings
              </div>
              <div style={{ marginTop: 6, fontSize: 14, lineHeight: 1.65, color: "#374151" }}>
                For institutional or technical stories where mechanism matters.
              </div>

              <div style={{ marginTop: 12, fontSize: 12, fontWeight: 900, letterSpacing: 1.1, color: "#6b7280", textTransform: "uppercase" }}>
                Answers
              </div>

              <ul style={{ marginTop: 10, paddingLeft: 18, lineHeight: 1.85, fontSize: 14, color: "#374151" }}>
                <li><strong>What happened</strong></li>
                <li><strong>Why it matters</strong></li>
                <li><strong>How it works</strong></li>
                <li><strong>What changes</strong></li>
                <li><strong>What to watch next</strong></li>
              </ul>

              <div style={{ marginTop: 12, fontSize: 13, lineHeight: 1.65, color: "#6b7280" }}>
                Ends with a quick self-diagnostic so readers can calibrate what they knew before reading.
              </div>
            </div>
          </div>
        </aside>
      </div>

      <style jsx>{`
        .tpv-about {
          display: grid;
          grid-template-columns: 1fr;
          gap: 26px;
        }

        @media (min-width: 980px) {
          .tpv-about {
            grid-template-columns: 1.25fr 0.75fr;
            gap: 36px;
            align-items: start;
          }
        }
      `}</style>
    </main>
  );
}