export default function AboutPage() {
  return (
    <main style={{
      maxWidth: 1100,
      margin: "0 auto",
      padding: "3rem 1.25rem 6rem",
    }}>

      {/* ── HEADER ── */}
      <div className="fade-up" style={{ marginBottom: "3rem", maxWidth: 700 }}>
        <div className="eyebrow" style={{ marginBottom: "1rem" }}>About</div>
        <h1 style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(2.2rem, 5vw, 3.5rem)",
          fontWeight: 400,
          letterSpacing: "-0.02em",
          color: "var(--text)",
          lineHeight: 1.05,
          marginBottom: "1.25rem",
        }}>
          Politics is complicated.<br />Most coverage makes it worse.
        </h1>
        <div className="divider" />
        <p style={{
          marginTop: "1.25rem",
          color: "var(--text-dim)",
          fontSize: "1.05rem",
          lineHeight: 1.8,
          fontFamily: "var(--font-body)",
          maxWidth: 580,
        }}>
          TPV is a structured political analysis publication for people who want to actually understand what's happening — not just have their existing views reinforced.
        </p>
      </div>

      <div style={{ borderTop: "1px solid var(--border)", margin: "0 0 3rem" }} />

      {/* ── MAIN LAYOUT ── */}
      <div className="tpv-about fade-up-delay-1">

        {/* LEFT: Main content */}
        <section style={{ minWidth: 0 }}>

          {/* Why text-only */}
          <div style={{ marginBottom: "2.5rem" }}>
            <div className="eyebrow" style={{ marginBottom: "1rem" }}>Why we're text-only</div>
            <h2 style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1.3rem, 2.5vw, 1.65rem)",
              fontWeight: 400,
              color: "var(--text)",
              letterSpacing: "-0.02em",
              lineHeight: 1.2,
              marginBottom: "1rem",
            }}>
              A community built on writing.
            </h2>
            <p style={{ fontSize: "1rem", lineHeight: 1.8, color: "var(--text-dim)", fontFamily: "var(--font-body)", marginBottom: "0.85rem" }}>
              TPV is text-only by design. Video and short form content is optimized for dopamine rushes — it can make a bad argument sound compelling and a good one seem boring. Writing can't hide behind delivery. Every claim has to stand on its own, every argument has to be precise enough to put into words, and every reader has to slow down enough to actually follow it. That's not a limitation. That's the point. The people who read TPV are here because they chose depth, and that shared choice is what makes this a community worth being part of.
            </p>
          </div>

          <div style={{ borderTop: "1px solid var(--border)", margin: "0 0 2.5rem" }} />

          {/* The friend framing */}
          <div style={{ marginBottom: "2.5rem" }}>
            <div className="eyebrow" style={{ marginBottom: "1rem" }}>What we're trying to be</div>
            <h2 style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1.3rem, 2.5vw, 1.65rem)",
              fontWeight: 400,
              color: "var(--text)",
              letterSpacing: "-0.02em",
              lineHeight: 1.2,
              marginBottom: "1rem",
            }}>
              Your most politically informed friend, on paper.
            </h2>
            <p style={{ fontSize: "1rem", lineHeight: 1.8, color: "var(--text-dim)", fontFamily: "var(--font-body)", marginBottom: "0.85rem" }}>
              Think about the most politically aware person you know. Not the loudest one. The one who, when something big happens, you actually want to talk to because they help you understand why people are fighting about it instead of just picking a side.
            </p>
            <p style={{ fontSize: "1rem", lineHeight: 1.8, color: "var(--text-dim)", fontFamily: "var(--font-body)" }}>
              That's what TPV is trying to be. Sharp enough to cut through the noise, structured enough to actually be useful. Every piece maps out the real components of a disagreement: the values underneath it, the facts that matter, the incentives driving the loudest voices, and what a reasonable person might actually conclude.
            </p>
          </div>

          <div style={{ borderTop: "1px solid var(--border)", margin: "0 0 2.5rem" }} />

          {/* The problem */}
          <div style={{ marginBottom: "2.5rem" }}>
            <div className="eyebrow" style={{ marginBottom: "1rem" }}>Why this exists</div>
            <h2 style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1.3rem, 2.5vw, 1.65rem)",
              fontWeight: 400,
              color: "var(--text)",
              letterSpacing: "-0.02em",
              lineHeight: 1.2,
              marginBottom: "1rem",
            }}>
              Most news tells you what happened. Almost none of it helps you think.
            </h2>
            <p style={{ fontSize: "1rem", lineHeight: 1.8, color: "var(--text-dim)", fontFamily: "var(--font-body)", marginBottom: "0.85rem" }}>
              Breaking news gives you facts without context. Opinion gives you conclusions without reasoning. Social media gives you takes designed to make you angry, not informed.
            </p>
            <p style={{ fontSize: "1rem", lineHeight: 1.8, color: "var(--text-dim)", fontFamily: "var(--font-body)" }}>
              TPV focuses on a different question: how should this actually be interpreted? Every article uses the same repeatable structure so you know what to expect, you can go straight to the sections that matter to you, and you walk away with a real sense of where you land and why.
            </p>
          </div>

          <div style={{ borderTop: "1px solid var(--border)", margin: "0 0 2.5rem" }} />

          {/* The poll */}
          <div>
            <div className="eyebrow" style={{ marginBottom: "1rem" }}>The people's verdict</div>
            <h2 style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1.3rem, 2.5vw, 1.65rem)",
              fontWeight: 400,
              color: "var(--text)",
              letterSpacing: "-0.02em",
              lineHeight: 1.2,
              marginBottom: "1rem",
            }}>
              We end every Verdict with a question.
            </h2>
            <p style={{ fontSize: "1rem", lineHeight: 1.8, color: "var(--text-dim)", fontFamily: "var(--font-body)", marginBottom: "0.85rem" }}>
              After breaking down the issue, we ask readers where they land. Not because we think votes settle anything, but because seeing how a politically diverse readership splits on a question is itself useful information.
            </p>
            <p style={{ fontSize: "1rem", lineHeight: 1.8, color: "var(--text-dim)", fontFamily: "var(--font-body)" }}>
              You can see if you're in the majority, which camp you're closest to, and whether reading the breakdown changed anything. It turns a passive article into an actual conversation.
            </p>
          </div>
        </section>

        {/* RIGHT: Formats sidebar */}
        <aside style={{ minWidth: 0 }}>
          <div style={{ position: "sticky", top: "6rem" }}>

            <div className="eyebrow" style={{ marginBottom: "1rem" }}>Two formats</div>

            {/* Verdict card */}
            <div style={{
              border: "1px solid var(--border-light)",
              borderRadius: 4,
              padding: "1.4rem",
              background: "var(--bg2)",
              marginBottom: "1rem",
            }}>
              <div style={{
                display: "flex",
                alignItems: "baseline",
                justifyContent: "space-between",
                marginBottom: "0.5rem",
                gap: 8,
              }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", fontWeight: 400, color: "var(--text)" }}>Verdict</div>
                <div style={{ fontFamily: "var(--font-body)", fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--gold)" }}>Every Friday</div>
              </div>
              <p style={{ fontSize: "0.875rem", lineHeight: 1.65, color: "var(--text-dim)", fontFamily: "var(--font-body)", marginBottom: "1rem" }}>
                For polarizing issues where the real disagreement is about values, not facts. We break it down and let readers weigh in.
              </p>
              <div style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.1em", color: "var(--text-faint)", textTransform: "uppercase", fontFamily: "var(--font-body)", marginBottom: "0.6rem" }}>
                Structure
              </div>
              <div style={{ display: "grid", gap: "0.3rem" }}>
                {["The overview", "The disagreement", "The values", "The facts", "The forecasts", "The incentives", "The verdict"].map((item) => (
                  <div key={item} style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    fontFamily: "var(--font-body)",
                    fontSize: "0.82rem",
                    color: "var(--text-dim)",
                  }}>
                    <span style={{ color: "var(--gold)", fontSize: "0.55rem" }}>▸</span>
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Briefing card */}
            <div style={{
              border: "1px solid var(--border-light)",
              borderRadius: 4,
              padding: "1.4rem",
              background: "var(--bg2)",
            }}>
              <div style={{
                display: "flex",
                alignItems: "baseline",
                justifyContent: "space-between",
                marginBottom: "0.5rem",
                gap: 8,
              }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", fontWeight: 400, color: "var(--text)" }}>Briefing</div>
                <div style={{ fontFamily: "var(--font-body)", fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--gold)" }}>Every Tuesday</div>
              </div>
              <p style={{ fontSize: "0.875rem", lineHeight: 1.65, color: "var(--text-dim)", fontFamily: "var(--font-body)", marginBottom: "1rem" }}>
                For institutional and policy stories where understanding the mechanism matters more than picking a side.
              </p>
              <div style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.1em", color: "var(--text-faint)", textTransform: "uppercase", fontFamily: "var(--font-body)", marginBottom: "0.6rem" }}>
                Structure
              </div>
              <div style={{ display: "grid", gap: "0.3rem" }}>
                {["What happened", "Why it matters", "How it works", "What changes", "What to watch next"].map((item) => (
                  <div key={item} style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    fontFamily: "var(--font-body)",
                    fontSize: "0.82rem",
                    color: "var(--text-dim)"
                  }}>
                    <span style={{ color: "var(--gold)", fontSize: "0.55rem" }}>▸</span>
                    {item}
                  </div>
                ))}
              </div>
            </div>

          </div>
        </aside>
      </div>

      <style jsx>{`
        .tpv-about {
          display: grid;
          grid-template-columns: 1fr;
          gap: 2.5rem;
          align-items: start;
        }
        @media (min-width: 980px) {
          .tpv-about {
            grid-template-columns: 1.35fr 0.65fr;
            gap: 3.5rem;
          }
        }
      `}</style>
    </main>
  );
}