import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabaseClients";
import type { User } from "@supabase/supabase-js";

type ProfileData = {
  username: string;
  birth_year: string;
  gender: string;
  race_ethnicity: string;
  education: string;
  income_range: string;
  political_affiliation: string;
  committed: boolean;
};

const EMPTY: ProfileData = {
  username: "",
  birth_year: "",
  gender: "",
  race_ethnicity: "",
  education: "",
  income_range: "",
  political_affiliation: "",
  committed: false,
};



const POLITICAL = [
  { value: "strong_dem", label: "Strong Democrat" },
  { value: "lean_dem", label: "Lean Democrat" },
  { value: "independent", label: "Independent" },
  { value: "lean_rep", label: "Lean Republican" },
  { value: "strong_rep", label: "Strong Republican" },
];

function Select({ label, value, onChange, options, placeholder }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div style={{ display: "grid", gap: "0.5rem" }}>
      <span style={{
        fontFamily: "var(--font-body)",
        fontSize: "0.65rem",
        fontWeight: 700,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        color: "var(--text-faint)",
      }}>
        {label}
      </span>

      <div ref={ref} style={{ position: "relative" }}>
        {/* Trigger */}
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
          <svg
            width="10"
            height="6"
            viewBox="0 0 10 6"
            fill="none"
            style={{
              flexShrink: 0,
              transform: open ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.2s ease",
              opacity: 0.5,
            }}
          >
            <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* Dropdown panel */}
        {open && (
          <div style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            right: 0,
            zIndex: 50,
            background: "var(--bg2)",
            border: "1px solid var(--border-light)",
            borderRadius: 3,
            overflow: "hidden",
            boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
          }}>
            {options.map((o, i) => (
              <button
                key={o.value}
                type="button"
                onClick={() => { onChange(o.value); setOpen(false); }}
                style={{
                  width: "100%",
                  textAlign: "left",
                  padding: "0.7rem 1rem",
                  fontSize: "0.88rem",
                  fontFamily: "var(--font-body)",
                  background: o.value === value ? "var(--gold-dim)" : "transparent",
                  color: o.value === value ? "var(--text)" : "var(--text-dim)",
                  border: "none",
                  borderTop: i > 0 ? "1px solid var(--border)" : "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  transition: "background 0.1s ease",
                }}
                onMouseEnter={(e) => {
                  if (o.value !== value) (e.currentTarget as HTMLButtonElement).style.background = "var(--bg3)";
                }}
                onMouseLeave={(e) => {
                  if (o.value !== value) (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                }}
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
    </div>
  );
}

function PoliticalScale({ value, onChange }: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <div style={{
        fontFamily: "var(--font-body)",
        fontSize: "0.65rem",
        fontWeight: 700,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        color: "var(--text-faint)",
        marginBottom: "0.75rem",
      }}>
        Where do you fall?
      </div>
      <div style={{ display: "grid", gap: "0.4rem" }}>
        {POLITICAL.map((p) => (
          <button
            key={p.value}
            type="button"
            onClick={() => onChange(p.value)}
            style={{
              width: "100%",
              textAlign: "left",
              padding: "0.85rem 1.1rem",
              border: `1px solid ${value === p.value ? "var(--gold)" : "var(--border-light)"}`,
              borderRadius: 3,
              background: value === p.value ? "var(--gold-dim)" : "transparent",
              color: value === p.value ? "var(--text)" : "var(--text-dim)",
              fontFamily: "var(--font-body)",
              fontSize: "0.9rem",
              fontWeight: value === p.value ? 500 : 400,
              cursor: "pointer",
              transition: "all 0.15s ease",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
            }}
          >
            <span style={{
              width: 14,
              height: 14,
              borderRadius: "50%",
              border: `2px solid ${value === p.value ? "var(--gold)" : "var(--border-light)"}`,
              background: value === p.value ? "var(--gold)" : "transparent",
              flexShrink: 0,
              transition: "all 0.15s ease",
            }} />
            {p.label}
          </button>
        ))}
      </div>
      <div style={{
        marginTop: "0.75rem",
        fontFamily: "var(--font-body)",
        fontSize: "0.75rem",
        color: "var(--text-faint)",
        fontStyle: "italic",
      }}>
        This helps us understand how our readership is distributed. It's never shown publicly.
      </div>
    </div>
  );
}

const STEPS = ["Username", "About you", "Background", "Politics", "Commitment"];

function StepIndicator({ current }: { current: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "2rem" }}>
      {STEPS.map((label, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <div style={{
            width: 24,
            height: 24,
            borderRadius: "50%",
            border: `1px solid ${i <= current ? "var(--gold)" : "var(--border-light)"}`,
            background: i < current ? "var(--gold)" : i === current ? "var(--gold-dim)" : "transparent",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            transition: "all 0.2s ease",
          }}>
            {i < current ? (
              <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                <path d="M1 4L3.5 6.5L9 1" stroke="var(--bg)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : (
              <span style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.55rem",
                fontWeight: 700,
                color: i === current ? "var(--gold)" : "var(--text-faint)",
              }}>
                {i + 1}
              </span>
            )}
          </div>
          {i < STEPS.length - 1 && (
            <div style={{
              width: 28,
              height: 1,
              background: i < current ? "var(--gold-line)" : "var(--border)",
              transition: "background 0.2s ease",
            }} />
          )}
        </div>
      ))}
      <span style={{
        marginLeft: "0.5rem",
        fontFamily: "var(--font-body)",
        fontSize: "0.65rem",
        fontWeight: 600,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color: "var(--text-faint)",
      }}>
        {STEPS[current]}
      </span>
    </div>
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [step, setStep] = useState(0);
  const [data, setData] = useState<ProfileData>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [ageError, setAgeError] = useState("");

  useEffect(() => {
    (async () => {
      const { data: s } = await supabase.auth.getSession();
      if (!s.session?.user) {
        router.replace("/signin");
        return;
      }
      // Check if they've already completed onboarding
      const { data: profile } = await supabase
        .from("profiles")
        .select("onboarding_complete")
        .eq("id", s.session.user.id)
        .single();
      if (profile?.onboarding_complete) {
        router.replace("/");
        return;
      }
      setUser(s.session.user);
      setAuthReady(true);
    })();
  }, [router]);

  function set<K extends keyof ProfileData>(key: K, val: ProfileData[K]) {
    setData((d) => ({ ...d, [key]: val }));
  }

  async function finish(committed: boolean) {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
    .from("profiles")
    .upsert({
      id: user.id,
      ...data,
      username: data.username.trim() || null,
      committed,
      onboarding_complete: true,
    });
  if (error) {
    console.error("finish upsert error:", error);
  }
    setSaving(false);
    router.replace("/");
  }
  
  async function skip() {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .upsert({ id: user.id, onboarding_complete: true, committed: false });
    if (error) {
      console.error("skip upsert error:", error);
    }
    setSaving(false);
    router.replace("/");
  }

  if (!authReady) return null;

  return (
    <main style={{ maxWidth: 560, margin: "0 auto", padding: "3rem 1.25rem 6rem" }}>

      {/* Header */}
      <div style={{ marginBottom: "2.5rem" }}>
        <div className="eyebrow" style={{ marginBottom: "1rem" }}>Welcome to TPV</div>
        <h1 style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(1.9rem, 4vw, 2.5rem)",
          fontWeight: 400,
          letterSpacing: "-0.02em",
          color: "var(--text)",
          lineHeight: 1.1,
          marginBottom: "0.75rem",
        }}>
          Tell us a little about yourself.
        </h1>
        <p style={{
          fontFamily: "var(--font-body)",
          fontSize: "0.95rem",
          lineHeight: 1.75,
          color: "var(--text-dim)",
        }}>
          This information is collected for research purposes and is never shown publicly or sold. It helps us understand who our readers are.
        </p>
      </div>

      <div style={{ borderTop: "1px solid var(--border)", margin: "0 0 2rem" }} />

      <StepIndicator current={step} />

      {/* ── STEP 0: Username ── */}
      {step === 0 && (
        <div style={{ display: "grid", gap: "1.25rem" }}>
          <label style={{ display: "grid", gap: "0.5rem" }}>
            <span style={{
              fontFamily: "var(--font-body)", fontSize: "0.65rem", fontWeight: 700,
              letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-faint)",
            }}>
              Display name
            </span>
            <input
              type="text"
              value={data.username}
              onChange={(e) => set("username", e.target.value.replace(/\s/g, ""))}
              placeholder="e.g. enoch"
              maxLength={24}
              style={{
                border: "1px solid var(--border-light)", borderRadius: 3,
                padding: "0.8rem 1rem", fontSize: "0.9rem",
                background: "var(--bg3)", color: "var(--text)",
                fontFamily: "var(--font-body)", outline: "none",
              }}
            />
            <span style={{
              fontFamily: "var(--font-body)", fontSize: "0.75rem",
              color: "var(--text-faint)", fontStyle: "italic",
            }}>
              This is shown on the Bound leaderboard. No spaces, max 24 characters. You can skip this.
            </span>
          </label>
        </div>
      )}

      {/* ── STEP 1: About you ── */}
      {step === 1 && (
        <div style={{ display: "grid", gap: "1.25rem" }}>
          <label style={{ display: "grid", gap: "0.5rem" }}>
            <span style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.65rem",
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--text-faint)",
            }}>
              Year of birth
            </span>
            <input
  type="number"
  min={1920}
  max={new Date().getFullYear()}
  value={data.birth_year}
  onChange={(e) => { set("birth_year", e.target.value); setAgeError(""); }}
  placeholder="e.g. 1995"
  style={{
    border: "1px solid var(--border-light)",
    borderRadius: 3,
    padding: "0.8rem 1rem",
    fontSize: "0.9rem",
    background: "var(--bg3)",
    color: "var(--text)",
    fontFamily: "var(--font-body)",
    outline: "none",
  }}
/>
{ageError && (
  <div style={{
    marginTop: "0.5rem",
    fontFamily: "var(--font-body)",
    fontSize: "0.78rem",
    color: "#ef4444",
    padding: "0.65rem 0.9rem",
    border: "1px solid rgba(239,68,68,0.25)",
    borderRadius: 3,
    background: "rgba(239,68,68,0.05)",
  }}>
    {ageError}
  </div>
)}
          </label>
          <Select
            label="Gender"
            value={data.gender}
            onChange={(v) => set("gender", v)}
            options={[
              { value: "man", label: "Man" },
              { value: "woman", label: "Woman" },
              { value: "other", label: "Other" },
              { value: "prefer_not", label: "Prefer not to say" },
            ]}
          />
        </div>
      )}

      {/* ── STEP 2: Background ── */}
      {step === 2 && (
        <div style={{ display: "grid", gap: "1.25rem" }}>
          <Select
            label="Race / ethnicity"
            value={data.race_ethnicity}
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
          <Select
            label="Education level"
            value={data.education}
            onChange={(v) => set("education", v)}
            options={[
              { value: "high_school", label: "High school or less" },
              { value: "some_college", label: "Some college" },
              { value: "associates", label: "Associate's degree" },
              { value: "bachelors", label: "Bachelor's degree" },
              { value: "graduate", label: "Graduate or professional degree" },
            ]}
          />
          <Select
            label="Household income"
            value={data.income_range}
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
      )}

      {/* ── STEP 3: Politics ── */}
      {step === 3 && (
        <PoliticalScale
          value={data.political_affiliation}
          onChange={(v) => set("political_affiliation", v)}
        />
      )}

      {/* ── STEP 4: Commitment ── */}
      {step === 4 && (
        <div>
          <div style={{
            padding: "2rem",
            border: "1px solid var(--border-light)",
            borderRadius: 4,
            background: "var(--bg2)",
            marginBottom: "1.5rem",
          }}>
            <div style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1.2rem, 2.5vw, 1.5rem)",
              fontWeight: 400,
              color: "var(--text)",
              lineHeight: 1.25,
              marginBottom: "1rem",
            }}>
              "I'm here to think, not to perform."
            </div>
            <p style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.9rem",
              lineHeight: 1.75,
              color: "var(--text-dim)",
              marginBottom: "1.5rem",
            }}>
              TPV exists for people who are willing to sit with a hard question before they decide what they think about it. Not every reader is here for that. If you are, say so.
            </p>
            <p style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.85rem",
              lineHeight: 1.7,
              color: "var(--text-faint)",
              marginBottom: "1.75rem",
            }}>
              Committing doesn't change what you can do on the site. It's a signal to yourself and to us that you take independent thinking seriously.
            </p>

            <button
              type="button"
              onClick={() => finish(true)}
              disabled={saving}
              style={{
                width: "100%",
                padding: "1rem",
                background: "var(--gold)",
                color: "var(--bg)",
                border: "none",
                borderRadius: 3,
                fontFamily: "var(--font-body)",
                fontSize: "0.75rem",
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                cursor: saving ? "default" : "pointer",
                opacity: saving ? 0.5 : 1,
                transition: "opacity 0.15s ease",
                marginBottom: "0.75rem",
              }}
            >
              {saving ? "Saving..." : "I'm in. Take me to TPV."}
            </button>

            <button
              type="button"
              onClick={() => finish(false)}
              disabled={saving}
              style={{
                width: "100%",
                padding: "0.85rem",
                background: "transparent",
                color: "var(--text-faint)",
                border: "1px solid var(--border)",
                borderRadius: 3,
                fontFamily: "var(--font-body)",
                fontSize: "0.72rem",
                fontWeight: 600,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                cursor: saving ? "default" : "pointer",
                transition: "border-color 0.15s ease",
              }}
            >
              Skip for now
            </button>
          </div>

          <div style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.75rem",
            color: "var(--text-faint)",
            lineHeight: 1.6,
            textAlign: "center",
          }}>
            You can change this any time in your account settings.
          </div>
        </div>
      )}

      {/* ── NAV ── */}
      {step < 4 && (
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: "2rem",
          paddingTop: "1.5rem",
          borderTop: "1px solid var(--border)",
        }}>
          <button
            type="button"
            onClick={step === 0 ? skip : () => setStep((s) => s - 1)}
            disabled={saving}
            style={{
              padding: "0.75rem 1.25rem",
              background: "transparent",
              color: "var(--text-faint)",
              border: "1px solid var(--border)",
              borderRadius: 3,
              fontFamily: "var(--font-body)",
              fontSize: "0.7rem",
              fontWeight: 600,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              cursor: "pointer",
            }}
          >
            {step === 0 ? "Skip all" : "Back"}
          </button>

          <button
            type="button"
            onClick={() => {
              if (step === 1 && data.birth_year) {
                  const age = new Date().getFullYear() - parseInt(data.birth_year);
                  if (age < 13) {
                    setAgeError("You must be 13 or older to create a TPV account.");
                    return;
                  }
                }
                setAgeError("");
                setStep((s) => s + 1);
              }}
            style={{
              padding: "0.75rem 1.5rem",
              background: "var(--gold)",
              color: "var(--bg)",
              border: "none",
              borderRadius: 3,
              fontFamily: "var(--font-body)",
              fontSize: "0.7rem",
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              cursor: "pointer",
              transition: "opacity 0.15s ease",
            }}
          >
            Continue
          </button>
        </div>
      )}

      <style jsx>{`
        select option { background: #1a1a1a; color: #f0ebe4; }
      `}</style>
    </main>
  );
}