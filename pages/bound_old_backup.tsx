// pages/bound.tsx
import { useEffect, useMemo, useRef, useState } from "react";

type Tier = "🟦" | "🟨" | "🟧" | "🟥";
const TIER_POINTS: Record<Tier, number> = { "🟦": 1, "🟨": 2, "🟧": 3, "🟥": 4 };

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

function uniqueUpperWords(words: string[]) {
  const set = new Set(words);
  return set.size === words.length;
}

function storageKey(puzzleNumber: number) {
  return `bound:submitted:${puzzleNumber}`;
}

function submissionKey(puzzleNumber: number) {
  return `bound:submission:${puzzleNumber}`;
}

type StoredSubmission = {
  puzzleNumber: number;
  pattern: string;
  words: [string, string, string];
  scoreResult: ScoreResult;
  submittedAt: string; // ISO
};

type BoundPatternEntry = {
  len: number;
  start: string; // "A".."Z"
  end: string;   // "A".."Z"
  count: number; // how many candidate words exist
};

// CHANGE THIS if you want puzzle #1 to start on your actual launch date.
// Format: "YYYY-MM-DD" (local date)
const PUZZLE_START_LOCAL_DATE = "2026-02-25";

// Returns local date string like "2026-02-25" in the user's local timezone
function localDateKey(d = new Date()) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

// Day index starting at 1, based on local timezone midnight boundaries
function puzzleNumberFromLocalDate(todayKey: string) {
  const [y0, m0, d0] = PUZZLE_START_LOCAL_DATE.split("-").map(Number);
  const [y1, m1, d1] = todayKey.split("-").map(Number);

  const start = new Date(y0, (m0 || 1) - 1, d0 || 1);
  const today = new Date(y1, (m1 || 1) - 1, d1 || 1);

  const msPerDay = 24 * 60 * 60 * 1000;
  const diffDays = Math.floor((today.getTime() - start.getTime()) / msPerDay);

  // If someone visits before start date, clamp to 1
  return Math.max(1, diffDays + 1);
}

// Simple deterministic hash for picking a pattern index
function hashStringToInt(s: string) {
  let h = 2166136261; // FNV-ish
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// Converts (len,start,end) into your displayed pattern like "S _ _ _ E"
function buildPattern(len: number, start: string, end: string) {
  if (len < 2) return start;
  const middle = Array.from({ length: len - 2 }, () => "_").join(" ");
  return `${start} ${middle} ${end}`.trim();
}

// Difficulty points (1..4) -> Tier emoji
function tierFromPoints(points: number): Tier {
  if (points <= 1) return "🟦";
  if (points === 2) return "🟨";
  if (points === 3) return "🟧";
  return "🟥";
}

/**
 * NEW: Hard bonus (not a mode)
 * Later you can compute this from puzzleNumber/date.
 */
function bonusLetterForDay(localDayKey: string) {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const idx = hashStringToInt(`BONUS:${localDayKey}`) % letters.length;
  return letters[idx];
}

function formatSubmittedAt(iso: string | null) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function MetaKicker({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: 12,
        fontWeight: 900,
        letterSpacing: 1.2,
        color: "#ef4444",
        textTransform: "uppercase",
      }}
    >
      {children}
    </div>
  );
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
        fontWeight: 800,
      }}
    >
      {children}
    </span>
  );
}

type ScoreResult = {
  tiers: Tier[];
  score: number;
  shareText: string;
  bonusPoints: number;
};

type BoundPattern = {
  id: number;          // 1-based puzzle number
  pattern: string;     // e.g. "S _ _ _ _ _ E"
  length: number;      // 5..10
  bonusLetter: string; // the bonus letter (+1 per word)
};

export default function BoundPage() {
  // Daily puzzle (local-midnight)
  const [localDayKeyState, setLocalDayKeyState] = useState(() => localDateKey());
  const [daily, setDaily] = useState<BoundPattern | null>(null);
  const [patternBank, setPatternBank] = useState<BoundPatternEntry[] | null>(null);
  const bonusLetter = useMemo(() => bonusLetterForDay(localDayKeyState), [localDayKeyState]);

  // Starts at 1 on PUZZLE_START_LOCAL_DATE (local time)
  const puzzleNumber = useMemo(() => puzzleNumberFromLocalDate(localDayKeyState), [localDayKeyState]);

  // Load the allowed pattern bank
  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const res = await fetch("/bound-patterns.json", { cache: "force-cache" });
        if (!res.ok) return;
        const json = (await res.json()) as BoundPatternEntry[];
        if (alive) setPatternBank(json);
      } catch {
        // ignore
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  // Compute today's pattern deterministically (cycles through bank)
  const pattern = useMemo(() => {
    if (!patternBank?.length) return "A _ A"; // temporary placeholder while loading
    const idx = (puzzleNumber - 1) % patternBank.length;
    const p = patternBank[idx];
    return buildPattern(p.len, p.start, p.end);
  }, [patternBank, puzzleNumber]);

  const len = patternLength(pattern);
  useEffect(() => {
    if (!patternBank?.length) return;
  
    const idx = (puzzleNumber - 1) % patternBank.length;
    const p = patternBank[idx];
  
    const computed: BoundPattern = {
      id: puzzleNumber,
      pattern: buildPattern(p.len, p.start, p.end),
      length: p.len,
      bonusLetter: bonusLetter,
    };
  
    setDaily(computed);
  }, [patternBank, puzzleNumber, bonusLetter]);

  // Auto-rollover at local midnight
  useEffect(() => {
    const now = new Date();
    const nextMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const ms = nextMidnight.getTime() - now.getTime() + 50;

    const t = window.setTimeout(() => {
      setLocalDayKeyState(localDateKey());
    }, ms);

    return () => window.clearTimeout(t);
  }, [localDayKeyState]);

  const [w1, setW1] = useState("");
  const [w2, setW2] = useState("");
  const [w3, setW3] = useState("");

  const [submitted, setSubmitted] = useState(false);
  const [locked, setLocked] = useState(false);

  const [scoreResult, setScoreResult] = useState<ScoreResult | null>(null);
  const [submittedAt, setSubmittedAt] = useState<string | null>(null);
  const [showShare, setShowShare] = useState(false);

  // per-input + global errors
  const [errors, setErrors] = useState<{
    w1?: string;
    w2?: string;
    w3?: string;
    global?: string;
  }>({});

  // Cache "dictionary" + difficulty map in memory
  // dictionary map is used ONLY for validity (fast for now)
  const dictCacheRef = useRef<Record<string, number> | null>(null);
  const difficultyCacheRef = useRef<Record<string, number> | null>(null);

  const words = useMemo(() => [w1, w2, w3].map(onlyLettersUpper), [w1, w2, w3]);
 

  const puzzleReady = !!patternBank?.length;

  useEffect(() => {
    // 1) Immediately reset UI for the new puzzle so nothing old flashes
    setW1("");
    setW2("");
    setW3("");
    setErrors({});
    setSubmitted(false);
    setLocked(false);
    setScoreResult(null);
    setSubmittedAt(null);
    setShowShare(false);
  
    // 2) Then restore from storage if this device already submitted this puzzle
    try {
      const raw = localStorage.getItem(submissionKey(puzzleNumber));
      if (raw) {
        const parsed = JSON.parse(raw) as StoredSubmission;
  
        setW1(parsed.words[0] || "");
        setW2(parsed.words[1] || "");
        setW3(parsed.words[2] || "");
  
        setScoreResult(parsed.scoreResult);
        setSubmittedAt(parsed.submittedAt || null);
        setSubmitted(true);
        setLocked(true);
        return;
      }
  
      // Back-compat cleanup (old flag-only lock)
      const old = localStorage.getItem(storageKey(puzzleNumber));
      if (old) localStorage.removeItem(storageKey(puzzleNumber));
    } catch {
      // ignore
    }
  }, [puzzleNumber]);

  async function loadDictionary(): Promise<Record<string, number> | null> {
    if (dictCacheRef.current) return dictCacheRef.current;

    try {
      // still using this as your "valid word list" for now
      const res = await fetch("/subtlex-us-zipf.json", { cache: "force-cache" });
      if (!res.ok) return null;
      const json = (await res.json()) as Record<string, number>;
      dictCacheRef.current = json;
      return json;
    } catch {
      return null;
    }
  }

  async function loadDifficulty(): Promise<Record<string, number> | null> {
    if (difficultyCacheRef.current) return difficultyCacheRef.current;

    try {
      const res = await fetch("/bound-difficulty.json", { cache: "force-cache" });
      if (!res.ok) return null;
      const json = (await res.json()) as Record<string, number>;
      difficultyCacheRef.current = json;
      return json;
    } catch {
      return null;
    }
  }

  async function validateWord(slot: "w1" | "w2" | "w3", raw: string) {
    const w = onlyLettersUpper(raw);

    setErrors((e) => ({ ...e, [slot]: undefined, global: undefined }));

    if (!w) {
      setErrors((e) => ({ ...e, [slot]: "Required" }));
      return false;
    }

    if (!fitsPattern(w, pattern)) {
      setErrors((e) => ({ ...e, [slot]: "Doesn’t match pattern" }));
      return false;
    }

    const dict = await loadDictionary();
    if (!dict) {
      setErrors((e) => ({ ...e, [slot]: "Dictionary not loaded" }));
      return false;
    }

    if (!(w in dict)) {
      setErrors((e) => ({ ...e, [slot]: "Not in dictionary" }));
      return false;
    }

    return true;
  }

  const canSubmit = useMemo(() => {
    if (!puzzleReady) return false;
    if (locked) return false;
    if (words.some((w) => !w)) return false;
    if (errors.w1 || errors.w2 || errors.w3) return false;
    if (!uniqueUpperWords(words)) return false;
    return true;
  }, [puzzleReady, locked, words, errors.w1, errors.w2, errors.w3]);

  async function onSubmit() {
    if (!puzzleReady) return;
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

    const difficulty = await loadDifficulty();
    if (!difficulty) {
      setErrors((e) => ({ ...e, global: "Difficulty map not loaded." }));
      return;
    }

    // Difficulty points: 1..4, default to 4 if missing
    const points = words.map((w) => difficulty[w] ?? 4);
    const tiers = points.map((p) => tierFromPoints(p));
    const base = points.reduce((acc, p) => acc + p, 0);

    // Hard bonus (not a mode): +1 per word that includes the bonus letter
    const bonus = onlyLettersUpper(bonusLetter).slice(0, 1);
    const bonusPoints = words.reduce(
      (acc, w) => acc + (bonus && w.includes(bonus) ? 1 : 0),
      0
    );

    const score = base + bonusPoints;

    const shareText =
      `Bounds #${puzzleNumber}\n` +
      `${normalizePattern(pattern)} (${len})\n` +
      `Score: ${score}\n` +
      `${tiers.join("")}`;

      const result: ScoreResult = { tiers, score, shareText, bonusPoints };

      setSubmitted(true);
      setScoreResult(result);
      
      // One try per device — store full submission so we can show it later
      try {
        const submittedIso = new Date().toISOString();
      
        const payload: StoredSubmission = {
          puzzleNumber,
          pattern,
          words: [words[0], words[1], words[2]],
          scoreResult: result,
          submittedAt: submittedIso,
        };
      
        localStorage.setItem(submissionKey(puzzleNumber), JSON.stringify(payload));
      
        // set React state immediately (so UI updates without refresh)
        setSubmittedAt(submittedIso);
      
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
    <main style={{ maxWidth: 1120, margin: "0 auto", padding: "28px 14px 64px" }}>
      {/* Top header (TPV vibe) */}
      <div style={{ display: "grid", gap: 10 }}>
        <MetaKicker>TPV Games</MetaKicker>

        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
          <h1
            style={{
              margin: 0,
              fontSize: 56,
              lineHeight: 1.02,
              fontWeight: 900,
              letterSpacing: -1.2,
              color: "#111827",
            }}
          >
            Bound
          </h1>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "flex-end" }}>
            <Pill>
              <span style={{ color: "#6b7280", fontWeight: 800 }}>Puzzle</span>
              <span style={{ fontWeight: 900, color: "#111827" }}>#{puzzleNumber}</span>
            </Pill>

            {submitted && scoreResult ? (
              <Pill>
                <span style={{ color: "#6b7280", fontWeight: 800 }}>Score</span>
                <span style={{ fontWeight: 900, color: "#111827" }}>{scoreResult.score}</span>
              </Pill>
            ) : null}
          </div>
        </div>

        <p
          style={{
            margin: "2px 0 0",
            color: "#374151",
            fontSize: 18,
            lineHeight: 1.7,
            maxWidth: 900,
          }}
        >
          Make <strong>3 unique words</strong> that fit the pattern. Harder words score higher.
          <span style={{ color: "#6b7280" }}>
            {" "}
            Bonus letter: <strong style={{ color: "#111827" }}>{bonusLetter}</strong> (+1 per word)
          </span>
        </p>

        {locked && !scoreResult ? (
          <div style={{ color: "#6b7280", fontSize: 15, lineHeight: 1.7 }}>
            This puzzle has already been submitted on this device.
          </div>
        ) : null}

        <div style={{ borderTop: "1px solid #e5e7eb", margin: "12px 0 4px" }} />
      </div>

      {/* Layout: puzzle + entry */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.1fr 0.9fr",
          gap: 18,
          alignItems: "start",
        }}
        className="boundgrid"
      >
        {/* Left: pattern + legend */}
        <section style={{ borderTop: "1px solid #e5e7eb", paddingTop: 16 }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div style={{ fontSize: 14, fontWeight: 900, color: "#111827" }}>Today’s pattern</div>
            <div style={{ fontSize: 13, color: "#6b7280", fontWeight: 800 }}>{len} letters</div>
          </div>

          {/* Pattern tiles */}
          <div
            style={{
              marginTop: 14,
              display: "flex",
              justifyContent: "flex-start",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            {normalizePattern(pattern).split(" ").map((c, i) => (
              <div
                key={i}
                style={{
                  width: 46,
                  height: 50,
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

{/* Bonus Letter */}
<div
  style={{
    marginTop: 14,
    padding: "8px 12px",
    border: "1px solid #e5e7eb",
    background: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    fontSize: 13,
  }}
>
  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
    <span
      style={{
        fontWeight: 900,
        letterSpacing: 1.2,
        textTransform: "uppercase",
        color: "#6b7280",
        fontSize: 11,
      }}
    >
      Bonus
    </span>

    <span
      style={{
        fontWeight: 900,
        color: "#111827",
      }}
    >
      {bonusLetter}
    </span>
  </div>

  <span style={{ color: "#6b7280", fontWeight: 700 }}>
    +1 pt / word
  </span>
</div>

          {/* Legend (always visible) */}
          <div style={{ marginTop: 18, borderTop: "1px solid #e5e7eb", paddingTop: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 900, letterSpacing: 1.2, color: "#6b7280", textTransform: "uppercase" }}>
              Legend
            </div>

            <div style={{ marginTop: 10, display: "grid", gap: 8, fontSize: 14 }}>
              <LegendRow emoji="🟦" label="Common" points={1} />
              <LegendRow emoji="🟨" label="Uncommon" points={2} />
              <LegendRow emoji="🟧" label="Rare" points={3} />
              <LegendRow emoji="🟥" label="Elite" points={4} />
            </div>

            <div style={{ marginTop: 12, color: "#6b7280", fontSize: 13, lineHeight: 1.65 }}>
              Difficulty is based on age-of-acquisition (grade-level tiers). Bonus letter adds +1 per word.
            </div>
          </div>
        </section>

        {/* Right: inputs + actions */}
        <section style={{ borderTop: "1px solid #e5e7eb", paddingTop: 16 }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
            <div style={{ fontSize: 14, fontWeight: 900, color: "#111827" }}>Your words</div>
            <div style={{ fontSize: 13, color: "#6b7280", fontWeight: 800 }}>
              {locked ? "Locked" : submitted ? "Submitted" : "One try"}
            </div>
          </div>

          {submitted && scoreResult ? (
  <div
    style={{
      marginTop: 14,
      border: "1px solid #e5e7eb",
      background: "#fff",
      padding: 14,
    }}
  >
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
      <div style={{ fontSize: 12, fontWeight: 900, letterSpacing: 1.2, color: "#6b7280", textTransform: "uppercase" }}>
        Your submission
      </div>

      {formatSubmittedAt(submittedAt) ? (
        <div style={{ fontSize: 12, color: "#6b7280", fontWeight: 800 }}>
          {formatSubmittedAt(submittedAt)}
        </div>
      ) : null}
    </div>

    {/* Words */}
    <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
        <div style={{ color: "#6b7280", fontSize: 12, fontWeight: 900 }}>1</div>
        <div style={{ flex: 1, textAlign: "right", fontWeight: 900, letterSpacing: 1.2, color: "#111827" }}>{words[0]}</div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
        <div style={{ color: "#6b7280", fontSize: 12, fontWeight: 900 }}>2</div>
        <div style={{ flex: 1, textAlign: "right", fontWeight: 900, letterSpacing: 1.2, color: "#111827" }}>{words[1]}</div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
        <div style={{ color: "#6b7280", fontSize: 12, fontWeight: 900 }}>3</div>
        <div style={{ flex: 1, textAlign: "right", fontWeight: 900, letterSpacing: 1.2, color: "#111827" }}>{words[2]}</div>
      </div>
    </div>

    {/* Score line */}
    <div style={{ marginTop: 12, borderTop: "1px solid #e5e7eb", paddingTop: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ color: "#6b7280", fontSize: 12, fontWeight: 900, letterSpacing: 1.2, textTransform: "uppercase" }}>
          Result
        </div>
        <div style={{ fontWeight: 900, color: "#111827" }}>
          {scoreResult.tiers.join("")}
          <span style={{ color: "#6b7280", fontWeight: 800 }}> • </span>
          {scoreResult.score}
        </div>
      </div>

      <div style={{ marginTop: 6, color: "#6b7280", fontSize: 12, lineHeight: 1.6 }}>
        Bonus points: <strong style={{ color: "#111827" }}>{scoreResult.bonusPoints}</strong>
      </div>
    </div>
  </div>
) : null}

          <div style={{ marginTop: 14, display: "grid", gap: 12 }}>
            <WordInput
              label="1"
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
              label="2"
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
              label="3"
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

          {/* Global error */}
          {errors.global ? (
            <div style={{ marginTop: 10, color: "#b45309", fontSize: 13, lineHeight: 1.6 }}>
              {errors.global}
            </div>
          ) : null}

          {/* Results */}
          {submitted && scoreResult ? (
            <div style={{ marginTop: 14, borderTop: "1px solid #e5e7eb", paddingTop: 14 }}>
              <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                <div style={{ color: "#6b7280", fontSize: 13, fontWeight: 800 }}>Tiers</div>
                <div style={{ fontSize: 18, letterSpacing: 2, fontWeight: 900, color: "#111827" }}>
                  {scoreResult.tiers.join("")}
                </div>
              </div>

              <div style={{ marginTop: 10, color: "#6b7280", fontSize: 13, lineHeight: 1.65 }}>
                Bonus points: <strong style={{ color: "#111827" }}>{scoreResult.bonusPoints}</strong>
              </div>
            </div>
          ) : null}

          {/* Actions */}
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

          {/* Share preview ONLY after Copy share */}
          {showShare && submitted && scoreResult?.shareText ? (
            <div style={{ marginTop: 14, borderTop: "1px solid #e5e7eb", paddingTop: 14 }}>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 900,
                  letterSpacing: 1.2,
                  color: "#6b7280",
                  textTransform: "uppercase",
                }}
              >
                Copied to clipboard
              </div>
              <pre
                style={{
                  marginTop: 10,
                  whiteSpace: "pre-wrap",
                  fontSize: 14,
                  lineHeight: 1.6,
                  color: "#111827",
                  border: "1px solid #e5e7eb",
                  background: "#fff",
                  padding: 12,
                }}
              >
                {scoreResult.shareText}
              </pre>
            </div>
          ) : null}
        </section>
      </div>

      <style jsx>{`
        @media (max-width: 980px) {
          .boundgrid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
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
    <div style={{ display: "grid", gridTemplateColumns: "28px 1fr", gap: 12, alignItems: "start" }}>
      <div style={{ color: "#9ca3af", fontSize: 13, paddingTop: 12, fontWeight: 900 }}>{label}</div>

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

function LegendRow({
  emoji,
  label,
  points,
}: {
  emoji: "🟦" | "🟨" | "🟧" | "🟥";
  label: string;
  points: number;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        fontSize: 14,
      }}
    >
      <span style={{ fontSize: 16 }}>{emoji}</span>

      <span style={{ color: "#111827", fontWeight: 800 }}>
        {label}
      </span>

      <span style={{ color: "#6b7280", fontWeight: 800 }}>
        — {points} {points === 1 ? "pt" : "pts"}
      </span>
    </div>
  );
}