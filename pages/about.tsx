export default function AboutPage() {
  return (
    <main style={{
      maxWidth: 1120,
      margin: "0 auto",
      padding: "2.5rem 1.25rem 5rem",
    }}>

      <div style={{ marginBottom: "1.5rem" }}>
        <div className="eyebrow">About</div>
        <h1 style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(2.2rem, 6vw, 3.5rem)",
          fontWeight: 400,
          letterSpacing: "-0.03em",
          color: "var(--text)",
          lineHeight: 1.05,
          margin: "0.5rem 0 0",
        }}>
          The People's Verdict
        </h1>
        <p style={{
          marginTop: "0.75rem",
          color: "var(--text-dim)",
          fontSize: "1.05rem",
          lineHeight: 1.6,
          fontStyle: "italic",
          maxWidth: 640,
          fontFamily: "var(--font-body)",
        }}>
          News, structured — built for interpretation, not outrage.
        </p>
      </div>

      <div style={{ borderTop: "1px solid var(--border)", margin: "1.5rem 0 2rem" }} />

      <div className="tpv-about">

        <section style={{ minWidth: 0 }}>
          <div style={{ paddingTop: "0.25rem" }}>
            <h2 style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1.2rem, 2.5vw, 1.5rem)",
              fontWeight: 400,
              color: "var(--text)",
              margin: 0,
              letterSpacing: "-0.02em",
            }}>
              What TPV is
            </h2>
            <p style={{ marginTop: "0.75rem", fontSize: "1rem", lineHeight: 1.8, color: "#d4cec8", fontFamily: "var(--font-body)" }}>
              <strong style={{ color: "var(--text)" }}>TPV</strong> is a structured publication designed to make the news easier to interpret.
            </p>
            <p style={{ marginTop: "0.75rem", fontSize: "1rem", lineHeight: 1.8, color: "#d4cec8", fontFamily: "var(--font-body)" }}>
              Most news tells you what happened. Some commentary tells you what to think.
            </p>
            <p style={{ marginTop: "0.75rem", fontSize: "1rem", lineHeight: 1.8, color: "#d4cec8", fontFamily: "var(--font-body)" }}>
              TPV focuses on a different question:<br />
              <strong style={{ color: "var(--text)" }}>How should this be interpreted?</strong>
            </p>
            <p style={{ marginTop: "0.75rem", fontSize: "0.95rem", lineHeight: 1.8, color: "var(--text-dim)", fontFamily: "var(--font-body)" }}>
              Every article uses the same repeatable format — so readers know what to expect and can scan directly to the sections that matter to them.
            </p>
          </div>

          <div style={{ borderTop: "1px solid var(--border)", margin: "1.75rem 0" }} />

          <div>
            <h2 style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1.2rem, 2.5vw, 1.5rem)",
              fontWeight: 400,
              color: "var(--text)",
              margin: 0,
              letterSpacing: "-0.02em",
            }}>
              Why TPV exists
            </h2>
            <p style={{ marginTop: "0.75rem", fontSize: "1rem", lineHeight: 1.8, color: "#d4cec8", fontFamily: "var(--font-body)" }}>
              News is complex. Explainers can be biased, oversimplified, or too academic.
            </p>
            <p style={{ marginTop: "0.75rem", fontSize: "1rem", lineHeight: 1.8, color: "#d4cec8", fontFamily: "var(--font-body)" }}>
              <strong style={{ color: "var(--text)" }}>TPV aims for the middle:</strong>
            </p>
            <ul style={{ marginTop: "0.5rem", paddingLeft: "1.25rem", lineHeight: 1.85, fontSize: "1rem", color: "#d4cec8", fontFamily: "var(--font-body)" }}>
              <li><strong style={{ color: "var(--text)" }}>Structure</strong> without being dense</li>
              <li><strong style={{ color: "var(--text)" }}>Depth</strong> without being pedantic</li>
              <li><strong style={{ color: "var(--text)" }}>Nuance</strong> without being partisan</li>
            </ul>
          </div>
        </section>

        <aside style={{ minWidth: 0 }}>
          <div style={{ paddingTop: "0.25rem" }}>
            <div className="eyebrow" style={{ marginBottom: "1rem" }}>Formats</div>

            <div style={{
              border: "1px solid var(--border-light)",
              borderRadius: 4,
              padding: "1.25rem",
              background: "var(--bg2)",
              marginBottom: "1rem",
            }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: "1.15rem", fontWeight: 400, color: "var(--text)" }}>Verdicts</div>
              <div style={{ marginTop: "0.4rem", fontSize: "0.875rem", lineHeight: 1.65, color: "var(--text-dim)", fontFamily: "var(--font-body)" }}>
                For polarizing stories where disagreement is central.
              </div>
              <div style={{ marginTop: "0.85rem", fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", color: "var(--text-faint)", textTransform: "uppercase", fontFamily: "var(--font-body)" }}>
                Decomposes into
              </div>
              <ul style={{ marginTop: "0.5rem", paddingLeft: "1.1rem", lineHeight: 1.85, fontSize: "0.875rem", color: "#d4cec8", fontFamily: "var(--font-body)" }}>
                <li><strong style={{ color: "var(--text)" }}>Values</strong></li>
                <li><strong style={{ color: "var(--text)" }}>Definitions</strong></li>
                <li><strong style={{ color: "var(--text)" }}>Facts</strong></li>
                <li><strong style={{ color: "var(--text)" }}>Forecasts</strong></li>
                <li><strong style={{ color: "var(--text)" }}>Incentives</strong></li>
              </ul>
              <div style={{ marginTop: "0.75rem", fontSize: "0.8rem", lineHeight: 1.65, color: "var(--text-faint)", fontFamily: "var(--font-body)" }}>
                Readers vote on which interpretation they find most persuasive — measuring current judgment, not truth.
              </div>
            </div>

            <div style={{
              border: "1px solid var(--border-light)",
              borderRadius: 4,
              padding: "1.25rem",
              background: "var(--bg2)",
            }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: "1.15rem", fontWeight: 400, color: "var(--text)" }}>Briefings</div>
              <div style={{ marginTop: "0.4rem", fontSize: "0.875rem", lineHeight: 1.65, color: "var(--text-dim)", fontFamily: "var(--font-body)" }}>
                For institutional or technical stories where mechanism matters.
              </div>
              <div style={{ marginTop: "0.85rem", fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", color: "var(--text-faint)", textTransform: "uppercase", fontFamily: "var(--font-body)" }}>
                Answers
              </div>
              <ul style={{ marginTop: "0.5rem", paddingLeft: "1.1rem", lineHeight: 1.85, fontSize: "0.875rem", color: "#d4cec8", fontFamily: "var(--font-body)" }}>
                <li><strong style={{ color: "var(--text)" }}>What happened</strong></li>
                <li><strong style={{ color: "var(--text)" }}>Why it matters</strong></li>
                <li><strong style={{ color: "var(--text)" }}>How it works</strong></li>
                <li><strong style={{ color: "var(--text)" }}>What changes</strong></li>
                <li><strong style={{ color: "var(--text)" }}>What to watch next</strong></li>
              </ul>
              <div style={{ marginTop: "0.75rem", fontSize: "0.8rem", lineHeight: 1.65, color: "var(--text-faint)", fontFamily: "var(--font-body)" }}>
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
          gap: 2rem;
        }
        @media (min-width: 980px) {
          .tpv-about {
            grid-template-columns: 1.25fr 0.75fr;
            gap: 3rem;
            align-items: start;
          }
        }
      `}</style>
    </main>
  );
}