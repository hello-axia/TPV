import Link from "next/link";

const mainLinks = [
  { href: "/verdicts", label: "Verdicts" },
  { href: "/briefings", label: "Briefings" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];

export default function Footer() {
  return (
    <footer style={{
      borderTop: "1px solid var(--border)",
      background: "var(--bg2)",
      marginTop: "4rem",
    }}>
      <div style={{
        maxWidth: 1100,
        margin: "0 auto",
        padding: "1.5rem 1.25rem 1.75rem",
      }}>

        {/* Top row — logo + tagline + Bound CTA */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "2rem",
          flexWrap: "wrap",
          marginBottom: "1.25rem",
          paddingBottom: "1.25rem",
          borderBottom: "1px solid var(--border)",
        }}>
          {/* Brand */}
          <div>
          <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 0, overflow: "hidden" }}>            
            <img src="/tpv.png" alt="TPV" style={{ height: 124, width: "auto", display: "block", margin: 0, padding: 0 }} />
            </div>
            <p style={{
  fontFamily: "var(--font-body)",
  fontSize: "0.82rem",
  lineHeight: 1.65,
  color: "var(--text-faint)",
  maxWidth: 280,
  margin: 0,
}}>
              The political noise, decoded. Structured analysis for people who care about politics but don't know where to start.
            </p>
          </div>

          {/* Bound callout */}
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: "0.5rem",
          }}>
            <div style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.6rem",
              fontWeight: 600,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--text-faint)",
              marginBottom: "0.25rem",
            }}>
              Daily puzzle
            </div>
            <Link href="/bound" style={{
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.6rem 1.1rem",
              border: "1px solid var(--gold-line)",
              background: "var(--gold-dim)",
              borderRadius: 3,
              transition: "background 0.15s ease",
            }}>
              <span style={{
                fontFamily: "var(--font-display)",
                fontStyle: "italic",
                fontSize: "1.1rem",
                color: "var(--gold)",
              }}>
                Bound
              </span>
              <span style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.65rem",
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--text-faint)",
              }}>
                Play today →
              </span>
            </Link>
          </div>
        </div>

        {/* Bottom row — links + copyright */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "1.5rem",
          flexWrap: "wrap",
        }}>
          {/* Nav links */}
          <div style={{ display: "flex", gap: "1.25rem", flexWrap: "wrap" }}>
            {mainLinks.map((l) => (
              <Link key={l.href} href={l.href} style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.75rem",
                fontWeight: 400,
                letterSpacing: "0.04em",
                color: "var(--text-faint)",
                textDecoration: "none",
                transition: "color 0.15s ease",
              }}>
                {l.label}
              </Link>
            ))}
          </div>

          {/* Copyright */}
          <div style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.72rem",
            color: "var(--text-faint)",
            letterSpacing: "0.04em",
          }}>
            © {new Date().getFullYear()} The People's Verdict
          </div>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 600px) {
          footer > div > div:first-child {
            flex-direction: column !important;
          }
          footer > div > div:first-child > div:last-child {
            align-items: flex-start !important;
          }
          footer > div > div:last-child {
            flex-direction: column !important;
            gap: 1rem !important;
          }
        }
      `}</style>
    </footer>
  );
}