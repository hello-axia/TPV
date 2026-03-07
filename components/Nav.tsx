import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabaseClients";

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

const links = [
  { href: "/", label: "Home", sub: null },
  { href: "/verdicts", label: "Verdicts", sub: "Deep issue breakdowns" },
  { href: "/briefings", label: "Briefings", sub: "Quick context on what's trending" },
  { href: "/about", label: "About", sub: null },
  { href: "/contact", label: "Contact", sub: null },
];

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
    return () => { mounted = false; sub.subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    setDrawerOpen(false);
    setMobileOpen(false);
  }, [router.pathname]);

  const initial = useMemo(() => initialsFromUser(user), [user]);
  const name = useMemo(() => displayNameFromUser(user), [user]);

  async function signOut() {
    await supabase.auth.signOut();
    setDrawerOpen(false);
    router.push("/");
  }

  async function signInGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: typeof window !== "undefined"
          ? `${window.location.origin}/auth/callback`
          : undefined,
      },
    });
  }

  return (
    <>
      <header
        data-mobile-open={mobileOpen ? "1" : "0"}
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: "rgba(12,12,11,0.92)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        {/* TOP BAR */}
        <div style={{
          maxWidth: 1100,
          margin: "0 auto",
          height: 64,
          padding: "0 var(--space-lg)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}>
          {/* Logo */}
          <Link href="/" style={{
            height: 124,
            display: "flex",
            alignItems: "center",
            textDecoration: "none",
            overflow: "hidden",
            gap: 10,
          }}>
            <img
              src="/tpv.png"
              alt="TPV"
              style={{ height: 124, width: "auto", objectFit: "contain", display: "block" }}
            />
          </Link>

          {/* Right controls */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>

            {/* Mobile hamburger */}
            <button
              className="tpv-mobile-hamburger"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              style={{
                border: "1px solid var(--border-light)",
                background: "transparent",
                borderRadius: 3,
                padding: "8px 10px",
                fontSize: 16,
                lineHeight: 1,
                color: "var(--text-dim)",
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
                border: "1px solid var(--border-light)",
                background: "transparent",
                borderRadius: "50%",
                width: 34,
                height: 34,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "var(--font-body)",
                fontWeight: 600,
                fontSize: "0.8rem",
                color: "var(--text-dim)",
                cursor: "pointer",
                userSelect: "none",
                transition: "border-color 0.15s ease, color 0.15s ease",
              }}
            >
              {initial}
            </button>
          </div>
        </div>

        {/* CHIN — desktop nav */}
        <div className="tpv-chin" style={{
          borderTop: "1px solid var(--border)",
          background: "rgba(12,12,11,0.92)",
          backdropFilter: "blur(12px)",
        }}>
          <div style={{
            maxWidth: 1100,
            margin: "0 auto",
            padding: "0 var(--space-lg)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 4,
          }}>
            {links.map((l) => {
  const active = router.pathname === l.href;
  return (
    <Link
      key={l.href}
      href={l.href}
      title={l.sub ?? undefined}
      style={{
        padding: "10px 14px",
        textDecoration: "none",
        fontFamily: "var(--font-body)",
        fontSize: "0.8rem",
        fontWeight: active ? 600 : 400,
        letterSpacing: "0.04em",
        color: active ? "var(--gold)" : "var(--text-faint)",
        borderBottom: active ? "1px solid var(--gold)" : "1px solid transparent",
        transition: "color 0.15s ease, border-color 0.15s ease",
        whiteSpace: "nowrap",
      }}
    >
      {l.label}
    </Link>
  );
})}
<Link
  href="/bound"
  style={{
    padding: "10px 14px",
    textDecoration: "none",
    fontFamily: "var(--font-display)",
    fontStyle: "italic",
    fontSize: "0.9rem",
    color: router.pathname === "/bound" ? "var(--gold)" : "var(--text-faint)",
    borderBottom: router.pathname === "/bound" ? "1px solid var(--gold)" : "1px solid transparent",
    transition: "color 0.15s ease, border-color 0.15s ease",
    whiteSpace: "nowrap",
  }}
>
  Bound
</Link>
          </div>
        </div>

        {/* MOBILE MENU */}
        {mobileOpen && (
          <div className="tpv-mobile-menu" style={{
            borderTop: "1px solid var(--border)",
            background: "var(--bg2)",
          }}>
            <div style={{
              maxWidth: 1100,
              margin: "0 auto",
              padding: "1rem var(--space-lg) 1.25rem",
              display: "grid",
              gap: 2,
            }}>
              {links.map((l) => {
                const active = router.pathname === l.href;
                return (
                  <Link
                    key={l.href}
                    href={l.href}
                    style={{
                      padding: "10px 12px",
                      textDecoration: "none",
                      fontFamily: "var(--font-body)",
                      fontSize: "0.95rem",
                      fontWeight: active ? 600 : 400,
                      color: active ? "var(--gold)" : "var(--text-dim)",
                      borderRadius: 3,
                      background: active ? "var(--gold-dim)" : "transparent",
                      display: "flex",
                      flexDirection: "column",
                      gap: 2,
                    }}
                  >
                    {l.label}
                    {l.sub && (
                      <span style={{
                        fontSize: "0.7rem",
                        color: "var(--text-faint)",
                        fontWeight: 400,
                      }}>
                        {l.sub}
                      </span>
                    )}
                  </Link>
                );
              })}
              <Link
                href="/bound"
                style={{
                  padding: "10px 12px",
                  textDecoration: "none",
                  fontFamily: "var(--font-display)",
                  fontStyle: "italic",
                  fontSize: "1rem",
                  color: "var(--gold)",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                Bound
                <span style={{
                  fontFamily: "var(--font-body)",
                  fontStyle: "normal",
                  fontSize: "0.65rem",
                  fontWeight: 600,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "var(--text-faint)",
                }}>
                  Daily puzzle
                </span>
              </Link>
            </div>
          </div>
        )}

        <style jsx>{`
          @media (max-width: 768px) {
            .tpv-chin { display: none !important; }
            .tpv-mobile-hamburger { display: inline-flex !important; align-items: center; justify-content: center; }
          }
          header { --tpv-header-offset: 120px; }
          @media (max-width: 768px) {
            header[data-mobile-open="1"] { --tpv-header-offset: 220px; }
          }
        `}</style>
      </header>

      {/* DRAWER OVERLAY */}
      <div
        onClick={() => setDrawerOpen(false)}
        style={{
          position: "fixed",
          inset: 0,
          background: drawerOpen ? "rgba(0,0,0,0.6)" : "transparent",
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
          width: 340,
          maxWidth: "92vw",
          background: "var(--bg2)",
          borderLeft: "1px solid var(--border-light)",
          zIndex: 70,
          transform: drawerOpen ? "translateX(0)" : "translateX(102%)",
          transition: "transform 260ms var(--ease-out)",
          boxShadow: "-20px 0 60px rgba(0,0,0,0.4)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Drawer header */}
        <div style={{
          padding: "1rem 1.25rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid var(--border)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              border: "1px solid var(--border-light)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "var(--font-body)",
              fontWeight: 600,
              fontSize: "0.8rem",
              color: "var(--gold)",
            }}>
              {initial}
            </div>
            <div style={{
              fontFamily: "var(--font-body)",
              fontWeight: 500,
              fontSize: "0.9rem",
              color: "var(--text)",
            }}>
              {name}
            </div>
          </div>
          <button
            onClick={() => setDrawerOpen(false)}
            style={{
              border: "1px solid var(--border-light)",
              background: "transparent",
              borderRadius: 3,
              padding: "6px 10px",
              cursor: "pointer",
              color: "var(--text-faint)",
              fontSize: "0.8rem",
              lineHeight: 1,
            }}
          >
            ✕
          </button>
        </div>

        {/* Drawer content */}
        <div style={{ padding: "1.25rem", overflowY: "auto", flex: 1 }}>

          {/* Subscription */}
          <div className="eyebrow" style={{ marginBottom: "0.5rem" }}>Your Subscription</div>
          <div style={{
            fontFamily: "var(--font-display)",
            fontSize: "1.75rem",
            color: "var(--text)",
            marginBottom: "1.25rem",
          }}>
            Free
          </div>

          <div className="divider-full" />

          {/* For you */}
          <div className="eyebrow" style={{ marginBottom: "0.75rem", marginTop: "1rem" }}>For You</div>
          <div style={{ marginBottom: "0.4rem", fontFamily: "var(--font-body)", fontWeight: 500, color: "var(--text)", fontSize: "0.9rem" }}>
            Bookmarks
          </div>
          <div style={{ fontFamily: "var(--font-body)", fontSize: "0.8rem", color: "var(--text-faint)", lineHeight: 1.5 }}>
            Coming soon — saved articles and Bound progress.
          </div>

          <div className="divider-full" />

          {/* Actions */}
          <div style={{ display: "grid", gap: 8, marginTop: "1rem" }}>
            {user ? (
              <>
                <Link href="/account" style={{
                  textDecoration: "none",
                  color: "var(--text-dim)",
                  fontFamily: "var(--font-body)",
                  fontWeight: 500,
                  fontSize: "0.88rem",
                  padding: "10px 14px",
                  border: "1px solid var(--border-light)",
                  borderRadius: 3,
                  background: "transparent",
                  transition: "border-color 0.15s ease",
                }}>
                  Manage account
                </Link>
                <button onClick={signOut} style={{
                  textAlign: "left",
                  border: "1px solid var(--border-light)",
                  background: "transparent",
                  borderRadius: 3,
                  padding: "10px 14px",
                  fontFamily: "var(--font-body)",
                  fontWeight: 500,
                  fontSize: "0.88rem",
                  cursor: "pointer",
                  color: "var(--text-dim)",
                }}>
                  Log out
                </button>
              </>
            ) : (
              <>
                <button onClick={signInGoogle} style={{
                  border: "1px solid var(--gold-line)",
                  background: "var(--gold-dim)",
                  borderRadius: 3,
                  padding: "10px 14px",
                  fontFamily: "var(--font-body)",
                  fontWeight: 600,
                  fontSize: "0.8rem",
                  letterSpacing: "0.05em",
                  cursor: "pointer",
                  color: "var(--gold)",
                  textAlign: "left",
                }}>
                  Sign in with Google
                </button>
                <Link href="/signin" style={{
                  textDecoration: "none",
                  color: "var(--text-faint)",
                  fontFamily: "var(--font-body)",
                  fontSize: "0.8rem",
                  padding: "10px 14px",
                  border: "1px solid var(--border)",
                  borderRadius: 3,
                  background: "transparent",
                }}>
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