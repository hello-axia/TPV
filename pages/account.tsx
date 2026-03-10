import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabaseClients";
import type { User } from "@supabase/supabase-js";

type Profile = {
  username: string;
  birth_year: string;
  gender: string;
  race_ethnicity: string;
  education: string;
  income_range: string;
  political_affiliation: string;
  committed: boolean;
};

const POLITICAL_LABELS: Record<string, string> = {
  strong_dem: "Strong Democrat",
  lean_dem: "Lean Democrat",
  independent: "Independent",
  lean_rep: "Lean Republican",
  strong_rep: "Strong Republican",
};

const POLITICAL = [
  { value: "strong_dem", label: "Strong Democrat" },
  { value: "lean_dem", label: "Lean Democrat" },
  { value: "independent", label: "Independent" },
  { value: "lean_rep", label: "Lean Republican" },
  { value: "strong_rep", label: "Strong Republican" },
];

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span style={{
      fontFamily: "var(--font-body)",
      fontSize: "0.65rem",
      fontWeight: 700,
      letterSpacing: "0.1em",
      textTransform: "uppercase",
      color: "var(--text-faint)",
    }}>
      {children}
    </span>
  );
}

function CustomSelect({ value, onChange, options, placeholder }: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "0.75rem",
          border: `1px solid ${open ? "var(--gold-line)" : "var(--border-light)"}`,
          borderRadius: 3,
          padding: "0.8rem 1rem",
          fontSize: "0.9rem",
          background: "var(--bg3)",
          color: selected ? "var(--text)" : "var(--text-faint)",
          fontFamily: "var(--font-body)",
          cursor: "pointer",
          textAlign: "left",
          transition: "border-color 0.15s ease",
        }}
      >
        <span>{selected ? selected.label : (placeholder || "Select...")}</span>
        <svg width="10" height="6" viewBox="0 0 10 6" fill="none"
          style={{ flexShrink: 0, transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s ease", opacity: 0.5 }}>
          <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, zIndex: 50,
          background: "var(--bg2)", border: "1px solid var(--border-light)", borderRadius: 3,
          overflow: "hidden", boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
        }}>
          {options.map((o, i) => (
            <button
              key={o.value}
              type="button"
              onClick={() => { onChange(o.value); setOpen(false); }}
              style={{
                width: "100%", textAlign: "left", padding: "0.7rem 1rem",
                fontSize: "0.88rem", fontFamily: "var(--font-body)",
                background: o.value === value ? "var(--gold-dim)" : "transparent",
                color: o.value === value ? "var(--text)" : "var(--text-dim)",
                border: "none", borderTop: i > 0 ? "1px solid var(--border)" : "none",
                cursor: "pointer", display: "flex", alignItems: "center",
                justifyContent: "space-between", transition: "background 0.1s ease",
              }}
              onMouseEnter={(e) => { if (o.value !== value) (e.currentTarget as HTMLButtonElement).style.background = "var(--bg3)"; }}
              onMouseLeave={(e) => { if (o.value !== value) (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
            >
              {o.label}
              {o.value === value && (
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                  <path d="M1 4L3.5 6.5L9 1" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "2.5rem" }}>
      <div style={{
        fontFamily: "var(--font-body)",
        fontSize: "0.65rem",
        fontWeight: 700,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        color: "var(--text-faint)",
        marginBottom: "1rem",
        paddingBottom: "0.75rem",
        borderBottom: "1px solid var(--border)",
      }}>
        {title}
      </div>
      <div style={{ display: "grid", gap: "1.25rem" }}>
        {children}
      </div>
    </div>
  );
}

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile>({
    username: "",
    birth_year: "",
    gender: "",
    race_ethnicity: "",
    education: "",
    income_range: "",
    political_affiliation: "",
    committed: false,
  });
  const [authChecked, setAuthChecked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [usernameError, setUsernameError] = useState("");

  useEffect(() => {
    (async () => {
      const { data: s } = await supabase.auth.getSession();
      setAuthChecked(true);
      if (!s.session?.user) { router.replace("/signin"); return; }
      setUser(s.session.user);

      const { data } = await supabase
        .from("profiles")
        .select("username, birth_year, gender, race_ethnicity, education, income_range, political_affiliation, committed")
        .eq("id", s.session.user.id)
        .single();

      if (data) {
        setProfile({
          username: data.username || "",
          birth_year: data.birth_year || "",
          gender: data.gender || "",
          race_ethnicity: data.race_ethnicity || "",
          education: data.education || "",
          income_range: data.income_range || "",
          political_affiliation: data.political_affiliation || "",
          committed: data.committed || false,
        });
      }
      setLoading(false);
    })();
  }, [router]);

  function set<K extends keyof Profile>(key: K, val: Profile[K]) {
    setProfile((p) => ({ ...p, [key]: val }));
    setSaved(false);
    if (key === "username") setUsernameError("");
  }

  async function save() {
    if (!user) return;
    setSaving(true);
    setUsernameError("");

    // Validate username if set
    if (profile.username) {
      const invalid = /[^a-zA-Z0-9_]/.test(profile.username);
      if (invalid) {
        setUsernameError("Username can only contain letters, numbers, and underscores.");
        setSaving(false);
        return;
      }
      if (profile.username.length < 3) {
        setUsernameError("Username must be at least 3 characters.");
        setSaving(false);
        return;
      }
    }

    const { error } = await supabase
      .from("profiles")
      .update({ ...profile })
      .eq("id", user.id);

    setSaving(false);
    if (error) {
      if (error.message.includes("unique") || error.message.includes("duplicate")) {
        setUsernameError("That username is already taken.");
      }
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  }

  async function deleteAccount() {
    if (!user) return;
    const confirmed = window.confirm("Are you sure? This will permanently delete your account and all data. This cannot be undone.");
    if (!confirmed) return;
    await supabase.from("profiles").delete().eq("id", user.id);
    await supabase.auth.signOut();
    router.replace("/");
  }

  if (!authChecked || loading) return null;

  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: "3rem 1.25rem 6rem" }}>

      {/* Header */}
      <div className="fade-up" style={{ marginBottom: "3rem" }}>
        <div className="eyebrow" style={{ marginBottom: "1rem" }}>Account</div>
        <h1 style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(2rem, 4vw, 3rem)",
          fontWeight: 400,
          letterSpacing: "-0.02em",
          color: "var(--text)",
          lineHeight: 1.05,
          marginBottom: "0.5rem",
        }}>
          {profile.username ? `@${profile.username}` : (user?.email || "Your account")}
        </h1>
        <p style={{
          fontFamily: "var(--font-body)",
          fontSize: "0.9rem",
          color: "var(--text-faint)",
        }}>
          {user?.email}
        </p>
      </div>

      <div style={{ borderTop: "1px solid var(--border)", margin: "0 0 3rem" }} />

      {/* Layout */}
      <div className="account-layout fade-up-delay-1">

        {/* Left: form */}
        <div style={{ minWidth: 0 }}>

          <Section title="Identity">
            <div>
              <FieldLabel>Username</FieldLabel>
              <div style={{ marginTop: "0.5rem" }}>
                <div style={{ position: "relative" }}>
                  <span style={{
                    position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)",
                    fontFamily: "var(--font-body)", fontSize: "0.9rem", color: "var(--text-faint)",
                    pointerEvents: "none",
                  }}>
                    @
                  </span>
                  <input
                    type="text"
                    value={profile.username}
                    onChange={(e) => set("username", e.target.value.toLowerCase())}
                    placeholder="yourhandle"
                    maxLength={30}
                    style={{
                      width: "100%",
                      border: `1px solid ${usernameError ? "#ef4444" : "var(--border-light)"}`,
                      borderRadius: 3,
                      padding: "0.8rem 1rem 0.8rem 1.75rem",
                      fontSize: "0.9rem",
                      background: "var(--bg3)",
                      color: "var(--text)",
                      fontFamily: "var(--font-body)",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
                {usernameError && (
                  <div style={{ marginTop: "0.4rem", fontFamily: "var(--font-body)", fontSize: "0.78rem", color: "#ef4444" }}>
                    {usernameError}
                  </div>
                )}
                <div style={{ marginTop: "0.4rem", fontFamily: "var(--font-body)", fontSize: "0.75rem", color: "var(--text-faint)" }}>
                  Letters, numbers, and underscores only. Optional but recommended.
                </div>
              </div>
            </div>
          </Section>

          <Section title="Demographics">
            <div style={{ display: "grid", gap: "0.5rem" }}>
              <FieldLabel>Year of birth</FieldLabel>
              <input
                type="number"
                min={1920}
                max={new Date().getFullYear()}
                value={profile.birth_year}
                onChange={(e) => set("birth_year", e.target.value)}
                placeholder="e.g. 1995"
                style={{
                  border: "1px solid var(--border-light)", borderRadius: 3,
                  padding: "0.8rem 1rem", fontSize: "0.9rem",
                  background: "var(--bg3)", color: "var(--text)",
                  fontFamily: "var(--font-body)", outline: "none",
                }}
              />
            </div>

            <div style={{ display: "grid", gap: "0.5rem" }}>
              <FieldLabel>Gender</FieldLabel>
              <CustomSelect
                value={profile.gender}
                onChange={(v) => set("gender", v)}
                options={[
                  { value: "man", label: "Man" },
                  { value: "woman", label: "Woman" },
                  { value: "other", label: "Other" },
                  { value: "prefer_not", label: "Prefer not to say" },
                ]}
              />
            </div>

            <div style={{ display: "grid", gap: "0.5rem" }}>
              <FieldLabel>Race / ethnicity</FieldLabel>
              <CustomSelect
                value={profile.race_ethnicity}
                onChange={(v) => set("race_ethnicity", v)}
                options={[
                  { value: "asian", label: "Asian or Asian American" },
                  { value: "black", label: "Black or African American" },
                  { value: "hispanic", label: "Hispanic or Latino" },
                  { value: "middle_eastern", label: "Middle Eastern or North African" },
                  { value: "native", label: "Native American or Alaska Native" },
                  { value: "pacific_islander", label: "Native Hawaiian or Pacific Islander" },
                  { value: "white", label: "White" },
                  { value: "multiracial", label: "Multiracial" },
                  { value: "other", label: "Other" },
                  { value: "prefer_not", label: "Prefer not to say" },
                ]}
              />
            </div>

            <div style={{ display: "grid", gap: "0.5rem" }}>
              <FieldLabel>Education</FieldLabel>
              <CustomSelect
                value={profile.education}
                onChange={(v) => set("education", v)}
                options={[
                  { value: "high_school", label: "High school or less" },
                  { value: "some_college", label: "Some college" },
                  { value: "associates", label: "Associate's degree" },
                  { value: "bachelors", label: "Bachelor's degree" },
                  { value: "graduate", label: "Graduate or professional degree" },
                ]}
              />
            </div>

            <div style={{ display: "grid", gap: "0.5rem" }}>
              <FieldLabel>Household income</FieldLabel>
              <CustomSelect
                value={profile.income_range}
                onChange={(v) => set("income_range", v)}
                options={[
                  { value: "under_30k", label: "Under $30,000" },
                  { value: "30_60k", label: "$30,000 to $60,000" },
                  { value: "60_100k", label: "$60,000 to $100,000" },
                  { value: "100_150k", label: "$100,000 to $150,000" },
                  { value: "over_150k", label: "Over $150,000" },
                  { value: "prefer_not", label: "Prefer not to say" },
                ]}
              />
            </div>
          </Section>

          <Section title="Politics">
            <div style={{ display: "grid", gap: "0.4rem" }}>
              {POLITICAL.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => set("political_affiliation", p.value)}
                  style={{
                    width: "100%", textAlign: "left",
                    padding: "0.85rem 1.1rem",
                    border: `1px solid ${profile.political_affiliation === p.value ? "var(--gold)" : "var(--border-light)"}`,
                    borderRadius: 3,
                    background: profile.political_affiliation === p.value ? "var(--gold-dim)" : "transparent",
                    color: profile.political_affiliation === p.value ? "var(--text)" : "var(--text-dim)",
                    fontFamily: "var(--font-body)", fontSize: "0.9rem",
                    fontWeight: profile.political_affiliation === p.value ? 500 : 400,
                    cursor: "pointer", transition: "all 0.15s ease",
                    display: "flex", alignItems: "center", gap: "0.75rem",
                  }}
                >
                  <span style={{
                    width: 14, height: 14, borderRadius: "50%", flexShrink: 0,
                    border: `2px solid ${profile.political_affiliation === p.value ? "var(--gold)" : "var(--border-light)"}`,
                    background: profile.political_affiliation === p.value ? "var(--gold)" : "transparent",
                    transition: "all 0.15s ease",
                  }} />
                  {p.label}
                </button>
              ))}
            </div>
          </Section>

          <Section title="Community">
            <button
              type="button"
              onClick={() => set("committed", !profile.committed)}
              style={{
                width: "100%", textAlign: "left",
                padding: "1.1rem 1.25rem",
                border: `1px solid ${profile.committed ? "var(--gold)" : "var(--border-light)"}`,
                borderRadius: 3,
                background: profile.committed ? "var(--gold-dim)" : "transparent",
                cursor: "pointer", transition: "all 0.15s ease",
                display: "flex", alignItems: "flex-start", gap: "1rem",
              }}
            >
              <span style={{
                width: 18, height: 18, borderRadius: 3, flexShrink: 0, marginTop: 2,
                border: `2px solid ${profile.committed ? "var(--gold)" : "var(--border-light)"}`,
                background: profile.committed ? "var(--gold)" : "transparent",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.15s ease",
              }}>
                {profile.committed && (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4L3.5 6.5L9 1" stroke="var(--bg)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </span>
              <div>
                <div style={{ fontFamily: "var(--font-body)", fontSize: "0.9rem", fontWeight: 500, color: "var(--text)", marginBottom: "0.25rem" }}>
                  "I'm here to think, not to perform."
                </div>
                <div style={{ fontFamily: "var(--font-body)", fontSize: "0.8rem", color: "var(--text-faint)", lineHeight: 1.6 }}>
                  Commit to reading before reacting. Your name is counted with others who've made the same call.
                </div>
              </div>
            </button>
          </Section>

          {/* Save */}
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <button
              type="button"
              onClick={save}
              disabled={saving}
              style={{
                padding: "0.9rem 2rem",
                background: saved ? "transparent" : "var(--gold)",
                color: saved ? "var(--gold)" : "var(--bg)",
                border: saved ? "1px solid var(--gold-line)" : "none",
                borderRadius: 3,
                fontFamily: "var(--font-body)",
                fontSize: "0.72rem",
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                cursor: saving ? "default" : "pointer",
                opacity: saving ? 0.5 : 1,
                transition: "all 0.2s ease",
              }}
            >
              {saving ? "Saving..." : saved ? "Saved" : "Save changes"}
            </button>
          </div>
        </div>

        {/* Right: sidebar info */}
        <aside style={{ minWidth: 0 }}>
          <div style={{ position: "sticky", top: "6rem", display: "grid", gap: "1.5rem" }}>

<div style={{ borderTop: "1px solid var(--border)", paddingTop: "1rem" }}>
  <div style={{ fontFamily: "var(--font-body)", fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-faint)", marginBottom: "0.5rem" }}>
    Your data
  </div>
  <p style={{ fontFamily: "var(--font-body)", fontSize: "0.82rem", lineHeight: 1.7, color: "var(--text-faint)" }}>
    This information helps us understand who our readers are. You can update or delete it at any time.
  </p>
</div>

            <div style={{ borderTop: "1px solid var(--border)", paddingTop: "1rem" }}>
              <div style={{ fontFamily: "var(--font-body)", fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-faint)", marginBottom: "0.75rem" }}>
                Danger zone
              </div>
              <button
                type="button"
                onClick={deleteAccount}
                style={{
                  padding: "0.7rem 1rem",
                  background: "transparent",
                  color: "#ef4444",
                  border: "1px solid rgba(239,68,68,0.3)",
                  borderRadius: 3,
                  fontFamily: "var(--font-body)",
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  transition: "border-color 0.15s ease",
                  width: "100%",
                  textAlign: "left",
                }}
              >
                Delete account
              </button>
            </div>
          </div>
        </aside>
      </div>

      <style jsx>{`
        .account-layout {
          display: grid;
          grid-template-columns: 1fr;
          gap: 2.5rem;
          align-items: start;
        }
        @media (min-width: 980px) {
          .account-layout {
            grid-template-columns: 1.35fr 0.65fr;
            gap: 3.5rem;
          }
        }
        input:focus { border-color: var(--gold-line) !important; }
      `}</style>
    </main>
  );
}