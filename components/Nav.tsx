import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const desktopLinkStyle = (active: boolean): React.CSSProperties => ({
    padding: "8px 10px",
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
    setOpen(false); // close menu on navigation
  }, [router.pathname]);

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        background: "rgba(255,255,255,0.9)",
        backdropFilter: "blur(10px)",
        borderBottom: "1px solid #e5e7eb",
        zIndex: 50,
        paddingBottom: 10,
      }}
    >
      <div
        style={{
          maxWidth: 1120,
          margin: "0 auto",
          height: 64,          // lock header height
          padding: "0 14px",   // no vertical padding
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
        }}
      >
        {/* Logo */}
        <Link
          href="/"
          style={{
            height: 64,
            display: "flex",
            alignItems: "center",
            textDecoration: "none",
          }}
        >
          <img
            src="/tpv.png"
            alt="TPV"
            style={{
              height: 150, // your preferred big logo
              width: "auto",
              display: "block",
              transform: "translateY(6px)",
            }}
          />
        </Link>

        {/* Desktop nav */}
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
          </div>
        </div>
      )}

      {/* CSS-only breakpoint to swap desktop links for hamburger */}
      <style jsx>{`
        @media (max-width: 768px) {
          .tpv-desktop-nav {
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