import { useEffect, useMemo, useRef, useState } from "react";

type Tier = "🟦" | "🟨" | "🟧" | "🟥";
const TIER_POINTS: Record<Tier, number> = { "🟦": 1, "🟨": 2, "🟧": 3, "🟥": 4 };

const LG10WF_THRESHOLDS = {
  common: 4.8,   // 🟦
  uncommon: 4.0, // 🟨
  rare: 3.2,     // 🟧
  // else 🟥
};

function onlyLettersUpper(s: string) {
  return (s || "").replace(/[^a-zA-Z]/g, "").toUpperCase();
}

function normalizePattern(p: string) {
  const trimmed = (p || "").trim();
  const compact = trimmed.includes(" ") ? trimmed.split(/\s+/).join("") : trimmed;
  return compact.split("").join(" ");
}

function patternLength(p: string) {
  return normalizePattern(p).replace(/\s+/g, "").length;
}

function fitsPattern(word: string, pattern: string) {
  const w = onlyLettersUpper(word);
  const p = normalizePattern(pattern).replace(/\s+/g, "");
  if (w.length !== p.length) return false;
  for (let i = 0; i < p.length; i++) {
    const pc = p[i];
    const wc = w[i];
    if (pc === "_") continue;
    if (pc.toUpperCase() !== wc) return false;
  }
  return true;
}

function tierFromLg10WF(lg: number): Tier {
  if (lg >= LG10WF_THRESHOLDS.common) return "🟦";
  if (lg >= LG10WF_THRESHOLDS.uncommon) return "🟨";
  if (lg >= LG10WF_THRESHOLDS.rare) return "🟧";
  return "🟥";
}

function uniqueUpperWords(words: string[]) {
  const set = new Set(words);
  return set.size === words.length;
}

function storageKey(puzzleNumber: number) {
  return `bound:submitted:${puzzleNumber}`;
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "6px 10px",
        border: "1px solid #e5e7eb",
        background: "#fff",
        color: "#374151",
        fontSize: 13,
        borderRadius: 999,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

type ScoreResult = {
  tiers: (Tier | "⬜")[];
  score: number;
  shareText: string;
};

export default function BoundPage() {
  const [puzzleNumber] = useState(42);
  const [pattern] = useState("S _ _ _ _ _ E");
  const len = patternLength(pattern);

  const [w1, setW1] = useState("");
  const [w2, setW2] = useState("");
  const [w3, setW3] = useState("");

  const [hardMode, setHardMode] = useState(false);
  const [requiredLetter, setRequiredLetter] = useState("A");

  const [submitted, setSubmitted] = useState(false);
  const [locked, setLocked] = useState(false);

  const [scoreResult, setScoreResult] = useState<ScoreResult | null>(null);

  // only show share preview after copy
  const [showShare, setShowShare] = useState(false);

  // per-input + global errors
  const [errors, setErrors] = useState<{
    w1?: string;
    w2?: string;
    w3?: string;
    global?: string;
  }>({});

  // Cache SUBTLEX map in memory
  const subtlexCacheRef = useRef<Record<string, number> | null>(null);

  const words = useMemo(() => [w1, w2, w3].map(onlyLettersUpper), [w1, w2, w3]);

  useEffect(() => {
    try {
      const v = localStorage.getItem(storageKey(puzzleNumber));
      if (v) {
        setLocked(true);
        setSubmitted(true);
      }
    } catch {}
  }, [puzzleNumber]);

  async function loadSubtlex(): Promise<Record<string, number> | null> {
    if (subtlexCacheRef.current) return subtlexCacheRef.current;

    try {
      const res = await fetch("/subtlex-us-zipf.json", { cache: "force-cache" });
      if (!res.ok) return null;
      const json = (await res.json()) as Record<string, number>;
      subtlexCacheRef.current = json;
      return json;
    } catch {
      return null;
    }
  }

  async function validateWord(slot: "w1" | "w2" | "w3", raw: string) {
    const w = onlyLettersUpper(raw);
    const req = onlyLettersUpper(requiredLetter).slice(0, 1);

    setErrors((e) => ({ ...e, [slot]: undefined, global: undefined }));

    if (!w) {
      setErrors((e) => ({ ...e, [slot]: "Required" }));
      return false;
    }

    if (!fitsPattern(w, pattern)) {
      setErrors((e) => ({ ...e, [slot]: "Doesn’t match pattern" }));
      return false;
    }

    if (hardMode && req && !w.includes(req)) {
      setErrors((e) => ({ ...e, [slot]: `Must include "${req}"` }));
      return false;
    }

    const subtlex = await loadSubtlex();
    if (!subtlex) {
      setErrors((e) => ({ ...e, [slot]: "Dictionary not loaded" }));
      return false;
    }

    if (!(w in subtlex)) {
      setErrors((e) => ({ ...e, [slot]: "Not in dictionary" }));
      return false;
    }

    return true;
  }

  const canSubmit = useMemo(() => {
    if (locked) return false;
    if (words.some((w) => !w)) return false;
    if (errors.w1 || errors.w2 || errors.w3) return false;
    if (!uniqueUpperWords(words)) return false;
    return true;
  }, [locked, words, errors.w1, errors.w2, errors.w3]);

  async function onSubmit() {
    if (locked) return;
    setShowShare(false);
    setErrors((e) => ({ ...e, global: undefined }));

    // Ensure validations run even if user didn’t blur the last box
    const ok1 = await validateWord("w1", w1);
    const ok2 = await validateWord("w2", w2);
    const ok3 = await validateWord("w3", w3);
    if (!(ok1 && ok2 && ok3)) return;

    if (!uniqueUpperWords(words)) {
      setErrors((e) => ({ ...e, global: "Words must be unique." }));
      return;
    }

    const req = onlyLettersUpper(requiredLetter).slice(0, 1);

    const subtlex = await loadSubtlex();
    if (!subtlex) {
      setErrors((e) => ({ ...e, global: "Dictionary not loaded." }));
      return;
    }

    // Guaranteed present due to validation
    const lg10s = words.map((w) => subtlex[w]);
    const tiers = lg10s.map((lg) => tierFromLg10WF(lg));

    const base = tiers.reduce((acc, t) => acc + TIER_POINTS[t], 0);

    let bonus = 0;
    if (hardMode && req) {
      bonus = words.reduce((acc, w) => acc + (w.includes(req) ? 1 : 0), 0);
    }

    const score = base + bonus;
    const tierLine = tiers.join("");

    const shareText =
      `Bounds #${puzzleNumber}\n` +
      `${normalizePattern(pattern)} (${len})\n` +
      `Score: ${score}\n` +
      `${tierLine}`;

    setSubmitted(true);
    setScoreResult({ tiers, score, shareText });

    // One try per device
    try {
      localStorage.setItem(storageKey(puzzleNumber), "1");
    } catch {}
    setLocked(true);
  }

  async function onCopyShare() {
    if (!submitted || !scoreResult?.shareText) return;
    try {
      await navigator.clipboard.writeText(scoreResult.shareText);
    } catch {
      // ignore
    }
    setShowShare(true);
  }

  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: "42px 24px 72px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "baseline", flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: 12, letterSpacing: 1, color: "#6b7280", textTransform: "uppercase" }}>
            TPV Games
          </div>
          <h1 style={{ marginTop: 8, fontSize: 44, fontWeight: 900, letterSpacing: -1.1, lineHeight: 1.05 }}>
            Bound
          </h1>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "flex-end" }}>
          <Pill>
            <span style={{ color: "#6b7280" }}>Puzzle</span>
            <span style={{ fontWeight: 800, color: "#111827" }}>#{puzzleNumber}</span>
          </Pill>

          {submitted && scoreResult ? (
            <Pill>
              <span style={{ color: "#6b7280" }}>Score</span>
              <span style={{ fontWeight: 900, color: "#111827" }}>{scoreResult.score}</span>
            </Pill>
          ) : null}
        </div>
      </div>

      {locked && !scoreResult ? (
        <p style={{ marginTop: 10, color: "#6b7280", lineHeight: 1.7, fontSize: 16 }}>
          This puzzle has already been submitted on this device.
        </p>
      ) : (
        <p style={{ marginTop: 10, color: "#6b7280", lineHeight: 1.7, fontSize: 16 }}>
          Make <strong>3 unique words</strong> that fit the pattern. Rarer words score higher.
        </p>
      )}

      {/* Puzzle card */}
      <section style={{ marginTop: 18, border: "1px solid #e5e7eb", background: "#f9fafb", padding: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ fontSize: 12, letterSpacing: 1, color: "#6b7280", textTransform: "uppercase" }}>
            Today’s pattern
          </div>
          <div style={{ fontSize: 13, color: "#6b7280" }}>{len} letters</div>
        </div>

        <div style={{ marginTop: 14, display: "flex", justifyContent: "center", gap: 10, flexWrap: "wrap" }}>
          {normalizePattern(pattern).split(" ").map((c, i) => (
            <div
              key={i}
              style={{
                width: 42,
                height: 46,
                border: "1px solid #e5e7eb",
                background: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 900,
                fontSize: 18,
                color: c === "_" ? "#9ca3af" : "#111827",
              }}
            >
              {c}
            </div>
          ))}
        </div>
      </section>

      {/* Entry card */}
      <section style={{ marginTop: 14, border: "1px solid #e5e7eb", background: "#fff", padding: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ fontSize: 12, letterSpacing: 1, color: "#6b7280", textTransform: "uppercase" }}>
            Your words
          </div>

          <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: locked ? "not-allowed" : "pointer" }}>
            <input
              type="checkbox"
              checked={hardMode}
              onChange={(e) => {
                setHardMode(e.target.checked);
                setErrors({});
                setScoreResult(null);
                setSubmitted(false);
                setShowShare(false);
              }}
              disabled={locked}
            />
            <span style={{ fontWeight: 800 }}>Hard mode</span>
          </label>
        </div>

        {/* Hard mode row */}
        <div style={{ marginTop: 12, display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ color: "#6b7280", fontSize: 13 }}>Required letter</div>
          <input
            value={onlyLettersUpper(requiredLetter).slice(0, 1)}
            onChange={(e) => {
              setRequiredLetter(onlyLettersUpper(e.target.value).slice(0, 1));
              setErrors({});
              setScoreResult(null);
              setSubmitted(false);
              setShowShare(false);
            }}
            disabled={!hardMode || locked}
            style={{
              width: 52,
              height: 40,
              border: "1px solid #e5e7eb",
              padding: "0 12px",
              fontWeight: 900,
              fontSize: 16,
              textTransform: "uppercase",
              background: hardMode && !locked ? "#fff" : "#f9fafb",
              color: hardMode && !locked ? "#111827" : "#9ca3af",
            }}
          />
          <div style={{ color: "#6b7280", fontSize: 13 }}>
            If a word includes it: <strong>+1 point</strong>
          </div>
        </div>

        <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
          <WordInput
            label="Word 1"
            value={w1}
            onChange={(v) => {
              setW1(v);
              setErrors((e) => ({ ...e, w1: undefined, global: undefined }));
            }}
            onBlur={() => void validateWord("w1", w1)}
            disabled={locked}
            error={errors.w1}
          />

          <WordInput
            label="Word 2"
            value={w2}
            onChange={(v) => {
              setW2(v);
              setErrors((e) => ({ ...e, w2: undefined, global: undefined }));
            }}
            onBlur={() => void validateWord("w2", w2)}
            disabled={locked}
            error={errors.w2}
          />

          <WordInput
            label="Word 3"
            value={w3}
            onChange={(v) => {
              setW3(v);
              setErrors((e) => ({ ...e, w3: undefined, global: undefined }));
            }}
            onBlur={() => void validateWord("w3", w3)}
            disabled={locked}
            error={errors.w3}
          />
        </div>

        {/* Global error (uniqueness, etc.) */}
        {errors.global ? (
          <div style={{ marginTop: 10, color: "#b45309", fontSize: 13, lineHeight: 1.6 }}>
            {errors.global}
          </div>
        ) : null}

        {/* Submit result area */}
        {submitted && scoreResult ? (
          <div style={{ marginTop: 14 }}>
            <div style={{ marginTop: 10, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <div style={{ color: "#6b7280", fontSize: 13 }}>Tiers</div>
              <div style={{ fontSize: 18, letterSpacing: 2 }}>{scoreResult.tiers.join("")}</div>
            </div>

            <div style={{ marginTop: 10, color: "#6b7280", fontSize: 13, lineHeight: 1.65 }}>
              Scoring uses SUBTLEX-US frequency (Lg10WF). Rarer words score higher.
            </div>
          </div>
        ) : null}

        {/* Buttons */}
        <div style={{ marginTop: 14, display: "flex", justifyContent: "flex-end", gap: 10, flexWrap: "wrap" }}>
          {!submitted ? (
            <button
              onClick={onSubmit}
              disabled={!canSubmit}
              style={{
                border: "1px solid #111827",
                background: "#111827",
                color: "#fff",
                padding: "10px 12px",
                fontWeight: 900,
                cursor: canSubmit ? "pointer" : "not-allowed",
                opacity: canSubmit ? 1 : 0.5,
              }}
            >
              Submit
            </button>
          ) : (
            <button
              onClick={onCopyShare}
              disabled={!scoreResult?.shareText}
              style={{
                border: "1px solid #111827",
                background: "#111827",
                color: "#fff",
                padding: "10px 12px",
                fontWeight: 900,
                cursor: scoreResult?.shareText ? "pointer" : "not-allowed",
                opacity: scoreResult?.shareText ? 1 : 0.6,
              }}
            >
              Copy share
            </button>
          )}
        </div>
      </section>

      {/* Legend ALWAYS visible (before copy) */}
      <section style={{ marginTop: 14, border: "1px solid #e5e7eb", background: "#f9fafb", padding: 18 }}>
        <div style={{ fontSize: 12, letterSpacing: 1, color: "#6b7280", textTransform: "uppercase" }}>
          Legend
        </div>

        <div style={{ marginTop: 10, display: "grid", gap: 6, fontSize: 14 }}>
          <LegendRow emoji="🟦" label="Common" points={1} />
          <LegendRow emoji="🟨" label="Uncommon" points={2} />
          <LegendRow emoji="🟧" label="Rare" points={3} />
          <LegendRow emoji="🟥" label="Very rare" points={4} />
        </div>
      </section>

      {/* Share preview ONLY after Copy share */}
      {showShare && submitted && scoreResult?.shareText ? (
        <section style={{ marginTop: 14, border: "1px solid #e5e7eb", background: "#f9fafb", padding: 18 }}>
          <div style={{ fontSize: 12, letterSpacing: 1, color: "#6b7280", textTransform: "uppercase" }}>
            Copied to clipboard
          </div>
          <pre style={{ marginTop: 10, whiteSpace: "pre-wrap", fontSize: 14, lineHeight: 1.6, color: "#111827" }}>
{scoreResult.shareText}
          </pre>
        </section>
      ) : null}
    </main>
  );
}

function WordInput({
  label,
  value,
  onChange,
  onBlur,
  disabled,
  error,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onBlur: () => void;
  disabled: boolean;
  error?: string;
}) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "80px 1fr", gap: 12, alignItems: "start" }}>
      <div style={{ color: "#6b7280", fontSize: 13, paddingTop: 10 }}>{label}</div>

      <div style={{ display: "grid", gap: 6 }}>
        <input
          value={value}
          onChange={(e) => onChange(onlyLettersUpper(e.target.value))}
          onBlur={onBlur}
          placeholder="TYPE WORD…"
          disabled={disabled}
          style={{
            height: 44,
            border: `1px solid ${error ? "#f59e0b" : "#e5e7eb"}`,
            padding: "0 12px",
            fontSize: 16,
            fontWeight: 900,
            letterSpacing: 1.2,
            textTransform: "uppercase",
            background: disabled ? "#f9fafb" : "#fff",
            color: disabled ? "#9ca3af" : "#111827",
            outline: "none",
          }}
        />
        <div style={{ minHeight: 16, fontSize: 12, color: error ? "#b45309" : "#9ca3af" }}>
          {error || " "}
        </div>
      </div>
    </div>
  );
}

function LegendRow({ emoji, label, points }: { emoji: "🟦" | "🟨" | "🟧" | "🟥"; label: string; points: number }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <span style={{ fontSize: 16 }}>{emoji}</span>
        <span style={{ color: "#111827", fontWeight: 700 }}>{label}</span>
      </div>
      <div style={{ color: "#6b7280" }}>{points}</div>
    </div>
  );
}