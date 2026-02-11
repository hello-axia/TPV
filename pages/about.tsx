export default function AboutPage() {
    return (
      <main style={{ maxWidth: 960, margin: "0 auto", padding: "42px 24px 72px" }}>
        <h1 style={{ fontSize: 46, fontWeight: 900, letterSpacing: -1.2, margin: 0 }}>
          About
        </h1>
  
        <p style={{ marginTop: 12, color: "#6b7280", fontSize: 18, lineHeight: 1.6 }}>
          TPV is a publication for understanding political disagreement—without the heat.
        </p>
  
        {/* Section 1 */}
        <h2 style={{ marginTop: 34, fontSize: 26, fontWeight: 850, letterSpacing: -0.6 }}>
          How it works
        </h2>
  
        <p style={{ marginTop: 12, lineHeight: 1.75 }}>
          TPV breaks political conflict into repeatable sources: values, facts, forecasts,
          trust, definitions, identity, and incentives. Most “debates” go nowhere because
          people argue as if they disagree about the same thing—when they don’t.
        </p>
  
        <p style={{ marginTop: 12, lineHeight: 1.75 }}>
          We publish two types of writing:
        </p>
  
        <ul style={{ marginTop: 10, paddingLeft: 22, lineHeight: 1.8 }}>
          <li>
            <strong>Verdicts</strong> — short, structured maps of a disagreement, written so
            both sides feel accurately represented.
          </li>
          <li>
            <strong>Briefings</strong> — reusable frameworks and explainers that make future
            disagreements easier to interpret.
          </li>
        </ul>
  
        {/* Section 2 */}
        <h2 style={{ marginTop: 34, fontSize: 26, fontWeight: 850, letterSpacing: -0.6 }}>
          Why this exists
        </h2>
  
        <p style={{ marginTop: 12, lineHeight: 1.75 }}>
          Political disagreement is normal. What’s broken is how we interpret it.
        </p>
  
        <p style={{ marginTop: 12, lineHeight: 1.75 }}>
          Most platforms reward heat: dunking, moral posturing, and winning. TPV is trying
          to build something different—interpretive infrastructure. A place where people
          can actually locate the real source of conflict, and stop arguing past each other.
        </p>
  
        <p style={{ marginTop: 12, color: "#6b7280", lineHeight: 1.75 }}>
          If you’ve ever felt like politics is driving you insane, TPV is for you.
        </p>
      </main>
    );
  }