import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabaseClients";

const navLinkStyle = (active: boolean): React.CSSProperties => ({
  padding: "8px 10px",
  borderRadius: 10,
  textDecoration: "none",
  color: active ? "#111827" : "#6b7280",
  background: active ? "#f3f4f6" : "transparent",
  fontWeight: active ? 600 : 500,
  whiteSpace: "nowrap",
  fontSize: 14,
});

const mobileLinkStyle = (active: boolean): React.CSSProperties => ({
  padding: "9px 10px",
  borderRadius: 10,
  textDecoration: "none",
  color: active ? "#111827" : "#6b7280",
  background: active ? "#f3f4f6" : "transparent",
  fontWeight: active ? 700 : 600,
  fontSize: 15,
});

function initialsFromUser(u: User | null) {
  if (!u) return "•";
  const meta: any = u.user_metadata || {};
  const first = (meta.first_name || meta.name || "").trim();
  if (first) return first[0].toUpperCase();
  const email = (u.email || "").trim();
  return email ? email[0].toUpperCase() : "•";
}

function displayNameFromUser(u: User | null) {
  if (!u) return "Account";
  const meta: any = u.user_metadata || {};
  const first = (meta.first_name || meta.name || "").trim();
  if (first) return first;
  return u.email || "Account";
}

export default function Nav() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    let mounted = true;

    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setUser(data.session?.user ?? null);
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    setDrawerOpen(false);
    setMobileOpen(false);
  }, [router.pathname]);

  const initial = useMemo(() => initialsFromUser(user), [user]);
  const name = useMemo(() => displayNameFromUser(user), [user]);

  const links = [
    { href: "/", label: "Home" },
    { href: "/verdicts", label: "Verdicts" },
    { href: "/briefings", label: "Briefings" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ];

  async function signOut() {
    await supabase.auth.signOut();
    setDrawerOpen(false);
    router.push("/");
  }

  async function signInGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo:
          typeof window !== "undefined"
            ? `${window.location.origin}/auth/callback`
            : undefined,
      },
    });
  }

  return (
    <>
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        {/* TOP BAR */}
        <div
          style={{
            maxWidth: 1120,
            margin: "0 auto",
            height: 64, // lock height so logo can be bigger without growing header
            padding: "0 14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          {/* Logo */}
          <Link
  href="/"
  style={{
    height: 124,
    display: "flex",
    alignItems: "center",
    textDecoration: "none",
    overflow: "hidden", // 👈 prevents header expansion
  }}
>
  <img
    src="/tpv.png"
    alt="TPV"
    style={{
      height: "100%",      // 👈 fills the 64px container
      width: "auto",
      objectFit: "contain",
      display: "block",
    }}
  />
</Link>

          {/* Right controls */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* Mobile hamburger (only shows on mobile via CSS) */}
            <button
              className="tpv-mobile-hamburger"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              style={{
                border: "1px solid #e5e7eb",
                background: "#fff",
                borderRadius: 12,
                padding: "8px 10px",
                fontSize: 18,
                lineHeight: 1,
                color: "#111827",
                cursor: "pointer",
                display: "none",
              }}
            >
              {mobileOpen ? "✕" : "☰"}
            </button>

            {/* Profile circle */}
            <button
              onClick={() => setDrawerOpen(true)}
              aria-label="Open account"
              style={{
                border: "1px solid #e5e7eb",
                background: "#fff",
                borderRadius: 999,
                width: 34,
                height: 34,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                color: "#111827",
                cursor: "pointer",
                userSelect: "none",
              }}
            >
              {initial}
            </button>
          </div>
        </div>

        {/* CHIN (desktop only) */}
        <div
          className="tpv-chin"
          style={{
            borderTop: "1px solid #e5e7eb",
            background: "rgba(255,255,255,0.92)",
            backdropFilter: "blur(10px)",
          }}
        >
          <div
            style={{
              maxWidth: 1120,
              margin: "0 auto",
              padding: "8px 14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            {links.map((l) => (
              <Link key={l.href} href={l.href} style={navLinkStyle(router.pathname === l.href)}>
                {l.label}
              </Link>
            ))}

            <Link
              href="/bound"
              style={{
                ...navLinkStyle(router.pathname === "/bound"),
                fontStyle: "italic",
              }}
            >
              Bound
            </Link>
          </div>
        </div>

        {/* MOBILE MENU (only on mobile) */}
        {mobileOpen && (
          <div
            className="tpv-mobile-menu"
            style={{
              borderTop: "1px solid #e5e7eb",
              background: "rgba(255,255,255,0.96)",
              backdropFilter: "blur(10px)",
            }}
          >
            <div
              style={{
                maxWidth: 1120,
                margin: "0 auto",
                padding: "10px 14px 12px",
                display: "grid",
                gap: 8,
              }}
            >
              {links.map((l) => (
                <Link key={l.href} href={l.href} style={mobileLinkStyle(router.pathname === l.href)}>
                  {l.label}
                </Link>
              ))}
              <Link
                href="/bound"
                style={{
                  ...mobileLinkStyle(router.pathname === "/bound"),
                  fontStyle: "italic",
                }}
              >
                Bound
              </Link>
            </div>
          </div>
        )}

        <style jsx>{`
          @media (max-width: 768px) {
            .tpv-chin {
              display: none !important;
            }
            .tpv-mobile-hamburger {
              display: inline-flex !important;
              align-items: center;
              justify-content: center;
            }
          }
        `}</style>
      </header>

      {/* DRAWER OVERLAY */}
      <div
        onClick={() => setDrawerOpen(false)}
        style={{
          position: "fixed",
          inset: 0,
          background: drawerOpen ? "rgba(17,24,39,0.25)" : "transparent",
          pointerEvents: drawerOpen ? "auto" : "none",
          transition: "background 220ms ease",
          zIndex: 60,
        }}
      />

      {/* DRAWER */}
      <aside
        aria-hidden={!drawerOpen}
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          height: "100vh",
          width: 360,
          maxWidth: "92vw",
          background: "#fff",
          borderLeft: "1px solid #e5e7eb",
          zIndex: 70,
          transform: drawerOpen ? "translateX(0)" : "translateX(102%)",
          transition: "transform 260ms ease",
          boxShadow: "0 20px 50px rgba(0,0,0,0.12)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Drawer header */}
        <div
          style={{
            padding: "14px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            borderBottom: "1px solid #e5e7eb",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: 999,
                border: "1px solid #e5e7eb",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
              }}
            >
              {initial}
            </div>
            <div style={{ fontWeight: 800, color: "#111827" }}>{name}</div>
          </div>

          <button
            onClick={() => setDrawerOpen(false)}
            aria-label="Close"
            style={{
              border: "1px solid #e5e7eb",
              background: "#fff",
              borderRadius: 10,
              padding: "8px 10px",
              cursor: "pointer",
              color: "#111827",
              fontWeight: 800,
              lineHeight: 1,
            }}
          >
            ✕
          </button>
        </div>

        {/* Drawer content */}
        <div style={{ padding: "16px", overflowY: "auto" }}>
          {/* Subscription */}
          <div style={{ fontSize: 11, letterSpacing: 1.2, color: "#ef4444", fontWeight: 900 }}>
            YOUR SUBSCRIPTION
          </div>
          <div
            style={{
              marginTop: 8,
              fontSize: 28,
              fontWeight: 900,
              letterSpacing: -0.8,
              color: "#111827",
            }}
          >
            Free
          </div>

          <div style={{ marginTop: 16, borderTop: "1px solid #e5e7eb" }} />

          {/* For you */}
          <div style={{ marginTop: 16, fontSize: 11, letterSpacing: 1.2, color: "#ef4444", fontWeight: 900 }}>
            FOR YOU
          </div>
          <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
            <div style={{ color: "#111827", fontWeight: 700 }}>Bookmarks</div>
            <div style={{ color: "#6b7280", fontSize: 13 }}>
              Coming soon — saved articles and Bound progress.
            </div>
          </div>

          <div style={{ marginTop: 16, borderTop: "1px solid #e5e7eb" }} />

          {/* Actions */}
          <div style={{ marginTop: 16, display: "grid", gap: 10 }}>
            {user ? (
              <>
                <Link
                  href="/account"
                  style={{
                    textDecoration: "none",
                    color: "#111827",
                    fontWeight: 800, // match Log out
                    padding: "10px 12px",
                    border: "1px solid #e5e7eb",
                    borderRadius: 12,
                    background: "#fff",
                  }}
                >
                  Manage account
                </Link>

                <button
                  onClick={signOut}
                  style={{
                    textAlign: "left",
                    border: "1px solid #e5e7eb",
                    background: "#fff",
                    borderRadius: 12,
                    padding: "10px 12px",
                    fontWeight: 800,
                    cursor: "pointer",
                    color: "#111827",
                  }}
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={signInGoogle}
                  style={{
                    border: "1px solid #e5e7eb",
                    background: "#fff",
                    borderRadius: 12,
                    padding: "10px 12px",
                    fontWeight: 800,
                    cursor: "pointer",
                    color: "#111827",
                  }}
                >
                  Sign in with Google
                </button>

                <Link
                  href="/signin"
                  style={{
                    textDecoration: "none",
                    color: "#6b7280",
                    fontWeight: 700,
                    padding: "10px 12px",
                    border: "1px solid #e5e7eb",
                    borderRadius: 12,
                    background: "#fafafa",
                  }}
                >
                  More sign-in options
                </Link>
              </>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}