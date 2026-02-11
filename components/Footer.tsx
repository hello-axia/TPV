import Link from "next/link";

export default function Footer() {
  return (
    <footer
      style={{
        borderTop: "1px solid #e5e7eb",
        background: "#fff",
        marginTop: 40,
      }}
    >
      <div
        style={{
          maxWidth: 1120,
          margin: "0 auto",
          padding: "22px 24px 28px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <img
            src="/tpv.png"
            alt="TPV"
            style={{ height: 34, width: "auto", display: "block" }}
          />
          <div style={{ color: "#6b7280", fontSize: 13 }}>
            © {new Date().getFullYear()} The People’s Verdict
          </div>
        </div>

        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          <Link href="/verdicts" style={{ textDecoration: "none", color: "#6b7280", fontSize: 13 }}>
            Verdicts
          </Link>
          <Link href="/briefings" style={{ textDecoration: "none", color: "#6b7280", fontSize: 13 }}>
            Briefings
          </Link>
          <Link href="/about" style={{ textDecoration: "none", color: "#6b7280", fontSize: 13 }}>
            About
          </Link>
          <Link href="/contact" style={{ textDecoration: "none", color: "#6b7280", fontSize: 13 }}>
            Contact
          </Link>
        </div>
      </div>
    </footer>
  );
}