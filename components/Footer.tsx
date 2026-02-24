import Link from "next/link";

export default function Footer() {
  return (
    <footer
      style={{
        borderTop: "1px solid #e5e7eb",
        background: "#fff",
        marginTop: 48,
      }}
    >
      <div
        style={{
          maxWidth: 1120,
          margin: "0 auto",
          padding: "28px 24px 32px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 24,
          flexWrap: "wrap",
        }}
      >
        {/* Left side */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <img
            src="/tpv.png"
            alt="TPV"
            style={{ height: 36, width: "auto", display: "block" }}
          />
          <div style={{ color: "#6b7280", fontSize: 13 }}>
            © {new Date().getFullYear()} The People’s Verdict
          </div>
        </div>

        {/* Right side (main links + Bound underneath) */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: 6,
          }}
        >
          {/* Main row */}
          <div style={{ display: "flex", gap: 18 }}>
            <Link
              href="/verdicts"
              style={{ textDecoration: "none", color: "#6b7280", fontSize: 13 }}
            >
              Verdicts
            </Link>
            <Link
              href="/briefings"
              style={{ textDecoration: "none", color: "#6b7280", fontSize: 13 }}
            >
              Briefings
            </Link>
            <Link
              href="/about"
              style={{ textDecoration: "none", color: "#6b7280", fontSize: 13 }}
            >
              About
            </Link>
            <Link
              href="/contact"
              style={{ textDecoration: "none", color: "#6b7280", fontSize: 13 }}
            >
              Contact
            </Link>
          </div>

          {/* Bound underneath */}
          <Link
            href="/bound"
            style={{
              textDecoration: "none",
              color: "#6b7280",
              fontSize: 13,
              fontStyle: "italic",
            }}
          >
            Bound
          </Link>
        </div>
      </div>
    </footer>
  );
}