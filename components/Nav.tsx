import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const desktopLinkStyle = (active: boolean): React.CSSProperties => ({
  padding: "6px 10px",
  borderRadius: 10,
  textDecoration: "none",
  color: active ? "#111827" : "#6b7280",
  background: active ? "#f3f4f6" : "transparent",
  fontWeight: active ? 600 : 500,
  whiteSpace: "nowrap",
});

const mobileLinkStyle = (active: boolean): React.CSSProperties => ({
  padding: "7px 10px",
  borderRadius: 9,
  fontSize: 15,
  textDecoration: "none",
  color: active ? "#111827" : "#6b7280",
  background: active ? "#f3f4f6" : "transparent",
  fontWeight: active ? 600 : 500,
});

export default function Nav() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [router.pathname]);

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        background: "rgba(255,255,255,0.92)",
        backdropFilter: "blur(10px)",
        borderBottom: "1px solid #e5e7eb",
        zIndex: 50,
      }}
    >
      <div
        style={{
          maxWidth: 1120,
          margin: "0 auto",
          height: 72, // ✅ compact header height
          padding: "4px 14px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
        }}
      >
        {/* Logo (visually large, but does NOT make header tall) */}
        <Link
          href="/"
          style={{
            height: 64,
            display: "flex",
            alignItems: "center",
            textDecoration: "none",
            overflow: "visible",
          }}
        >
          <img
            src="/tpv.png"
            alt="TPV"
            style={{
              height: 125, // ✅ still big visually
              width: "auto",
              display: "block",
              position: "relative",
              top: 6, // ✅ slight drop without forcing header height
            }}
          />
        </Link>

        {/* Desktop nav (main row + Bound underneath, right-aligned) */}
        <div
          className="tpv-desktop-wrap"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            justifyContent: "center",
            gap: 0, // ✅ no extra whitespace
            lineHeight: 1.1,
          }}
        >
          <nav
            className="tpv-desktop-nav"
            style={{ display: "flex", gap: 6, alignItems: "center" }}
          >
            <Link href="/verdicts" style={desktopLinkStyle(router.pathname === "/verdicts")}>
              Verdicts
            </Link>
            <Link href="/briefings" style={desktopLinkStyle(router.pathname === "/briefings")}>
              Briefings
            </Link>
            <Link href="/about" style={desktopLinkStyle(router.pathname === "/about")}>
              About
            </Link>
            <Link href="/contact" style={desktopLinkStyle(router.pathname === "/contact")}>
              Contact
            </Link>
          </nav>

          <Link
            href="/bound"
            style={{
              ...desktopLinkStyle(router.pathname === "/bound"),
              fontStyle: "italic",
              paddingTop: 4,
              paddingBottom: 4,
            }}
          >
            Bound
          </Link>
        </div>

        {/* Mobile button */}
        <button
          className="tpv-mobile-btn"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          style={{
            display: "none",
            border: "1px solid #e5e7eb",
            background: "#fff",
            borderRadius: 12,
            padding: "8px 10px",
            fontSize: 18,
            lineHeight: 1,
            color: "#111827",
          }}
        >
          {open ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div
          className="tpv-mobile-menu"
          style={{
            borderTop: "1px solid #e5e7eb",
            background: "rgba(255,255,255,0.96)",
            backdropFilter: "blur(10px)",
            padding: "10px 14px 12px",
          }}
        >
          <div style={{ maxWidth: 1120, margin: "0 auto", display: "grid", gap: 8 }}>
            <Link href="/verdicts" style={mobileLinkStyle(router.pathname === "/verdicts")}>
              Verdicts
            </Link>
            <Link href="/briefings" style={mobileLinkStyle(router.pathname === "/briefings")}>
              Briefings
            </Link>
            <Link href="/about" style={mobileLinkStyle(router.pathname === "/about")}>
              About
            </Link>
            <Link href="/contact" style={mobileLinkStyle(router.pathname === "/contact")}>
              Contact
            </Link>

            <Link
              href="/bound"
              style={{
                ...mobileLinkStyle(router.pathname === "/bound"),
                fontStyle: "italic",
                marginTop: 6,
              }}
            >
              Bound
            </Link>
          </div>
        </div>
      )}

      <style jsx>{`
        @media (max-width: 768px) {
          .tpv-desktop-wrap {
            display: none !important;
          }
          .tpv-mobile-btn {
            display: inline-flex !important;
            align-items: center;
            justify-content: center;
          }
        }
      `}</style>
    </header>
  );
}