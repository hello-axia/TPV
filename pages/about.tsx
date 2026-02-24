export default function AboutPage() {
  return (
    <main style={{ maxWidth: 880, margin: "0 auto", padding: "48px 24px 80px" }}>
      
      {/* Header */}
      <h1 style={{ fontSize: 48, fontWeight: 900, letterSpacing: -1.3, margin: 0 }}>
        The People's Verdict
      </h1>

      <p
        style={{
          marginTop: 8,
          fontSize: 20,
          color: "#6b7280",
          fontWeight: 500,
        }}
      >
        <em>News, Structured.</em>
      </p>

      <div
        style={{
          marginTop: 36,
          borderTop: "1px solid #e5e7eb",
          paddingTop: 32,
        }}
      >

        {/* What TPV Is */}
        <h2
          style={{
            fontSize: 28,
            fontWeight: 850,
            letterSpacing: -0.6,
            margin: 0,
          }}
        >
          What TPV Is
        </h2>

        <p style={{ marginTop: 16, lineHeight: 1.9, fontSize: 17 }}>
          <strong>TPV (The People’s Verdict)</strong> is a structured publication dedicated to bringing understanding of the news.
        </p>

        <p style={{ marginTop: 16, lineHeight: 1.9, fontSize: 17 }}>
          Most news sources tell you what happened. <em>Think: Journalism.</em>
          <br />
          Some commentaries tell you what to think.
        </p>

        <p style={{ marginTop: 16, lineHeight: 1.9, fontSize: 17 }}>
          TPV focuses on something different:
          <br />
          <strong>How can you interpret what has happened?</strong>
        </p>

        <p style={{ marginTop: 16, lineHeight: 1.9, fontSize: 17, color: "#6b7280" }}>
          Every article written on TPV uses a repeatable format designed to be understandable and scannable. It aims to be consistent across articles so that readers know what to expect, and can navigate directly to sections most relevant to them.
        </p>
      </div>

      <div
        style={{
          marginTop: 48,
          borderTop: "1px solid #e5e7eb",
          paddingTop: 32,
        }}
      >

        {/* Why TPV Exists */}
        <h2
          style={{
            fontSize: 28,
            fontWeight: 850,
            letterSpacing: -0.6,
            margin: 0,
          }}
        >
          Why TPV Exists
        </h2>

        <p style={{ marginTop: 16, lineHeight: 1.9, fontSize: 17 }}>
          News is complex. Explainers tend to be too biased or academic.
        </p>

        <p style={{ marginTop: 18, lineHeight: 1.9, fontSize: 17 }}>
          <strong>TPV exists to provide something in between:</strong>
        </p>

        <ul style={{ marginTop: 12, paddingLeft: 22, lineHeight: 1.95, fontSize: 17 }}>
          <li><strong>Structure</strong> without being dense</li>
          <li><strong>Depth</strong> without being pedantic</li>
          <li><strong>Nuanced</strong> without being partisan</li>
        </ul>
      </div>

      <div
        style={{
          marginTop: 48,
          borderTop: "1px solid #e5e7eb",
          paddingTop: 32,
        }}
      >

        {/* Two types of Coverage */}
        <h2
          style={{
            fontSize: 28,
            fontWeight: 850,
            letterSpacing: -0.6,
            margin: 0,
          }}
        >
          Two types of Coverage
        </h2>

        <h3 style={{ marginTop: 24, fontSize: 22, fontWeight: 800 }}>
          <strong>Verdicts</strong>
        </h3>

        <p style={{ marginTop: 10, lineHeight: 1.9, fontSize: 17 }}>
          Coverage on polarizing news
          <br />
          Used when disagreement is central to the story.
        </p>

        <p style={{ marginTop: 18, lineHeight: 1.9, fontSize: 17 }}>
          Each verdicts breaks an issue into six categories:
        </p>

        <ul style={{ marginTop: 12, paddingLeft: 22, lineHeight: 1.95, fontSize: 17 }}>
          <li><strong>Values</strong> (what values are important)</li>
          <li><strong>Definitions</strong> (what do the terms mean)</li>
          <li><strong>Facts</strong> (what claims about reality are disputed)</li>
          <li><strong>Forecasts</strong> (what do people think will happen next)</li>
          <li><strong>Incentives</strong> (what pressures shape behavior)</li>
        </ul>

        <p style={{ marginTop: 18, lineHeight: 1.9, fontSize: 17, color: "#374151" }}>
          At the conclusion of each Verdict, readers are invited to indicate which interpretation they find most persuasive. This is not a determination of truth, but a measure of current judgment among participants.
        </p>

        <h3 style={{ marginTop: 42, fontSize: 22, fontWeight: 800 }}>
          <strong>Briefings</strong>
        </h3>

        <p style={{ marginTop: 10, lineHeight: 1.9, fontSize: 17 }}>
          Coverage on complex news
          <br />
          Used when the story is primarily institutional or technical
        </p>

        <p style={{ marginTop: 18, lineHeight: 1.9, fontSize: 17 }}>
          Each briefing answers:
        </p>

        <ul style={{ marginTop: 12, paddingLeft: 22, lineHeight: 1.95, fontSize: 17 }}>
          <li><strong>What happened</strong></li>
          <li><strong>Why does it matter</strong></li>
          <li><strong>How does the mechanism work</strong></li>
          <li><strong>What changes in practice</strong></li>
          <li><strong>What should we watch next</strong></li>
        </ul>

        <p style={{ marginTop: 18, lineHeight: 1.9, fontSize: 17, color: "#374151" }}>
          At the conclusion of each briefing, readers are invited to give a self-diagnostic of priori understanding. The purpose is to show general knowledge before reading among participants.
        </p>

      </div>
    </main>
  );
}