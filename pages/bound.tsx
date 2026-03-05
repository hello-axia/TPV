// pages/bound.tsx
import { useEffect, useMemo, useRef, useState } from "react";

type TierEmoji = "🟦" | "🟨" | "🟧" | "🟥";
type TierName = "Common" | "Uncommon" | "Rare" | "Advanced";

const TIER_POINTS: Record<TierEmoji, number> = { "🟦": 1, "🟨": 2, "🟧": 3, "🟥": 4 };
const TIER_LABELS: Record<TierEmoji, TierName> = {
  "🟦": "Common",
  "🟨": "Uncommon",
  "🟧": "Rare",
  "🟥": "Advanced",
};

// Relative-per-puzzle percentile buckets (adjust anytime)
// 0..35 common, 35..50 uncommon, 50..80 rare, 80..100 advanced
const PCT_COMMON_MAX = 35;
const PCT_UNCOMMON_MAX = 50;
const PCT_RARE_MAX = 80;

// Time multiplier (minute buckets):
// - 0–60s: 2.0x (insanely fast)
// - 60–120s: 1.7x
// - 120–180s: 1.45x
// - 180–240s: 1.25x
// - 240s+: 1.0x (no boost)
function multiplierFromSeconds(timeSec: number) {
  const t = Math.max(0, timeSec);

  if (t < 60) return 2.0;
  if (t < 120) return 1.7;
  if (t < 180) return 1.45;
  if (t < 240) return 1.25;
  return 1.0;
}

function formatMult(mult: number) {
  // show 2.0x, 1.7x, 1.45x, etc.
  const s = String(Math.round(mult * 100) / 100);
  return `${s}x`;
}

function speedLabelFromSeconds(timeSec: number) {
  const t = Math.max(0, timeSec);
  if (t < 60) return "Insane speed bonus";
  if (t < 120) return "Fast speed bonus";
  if (t < 180) return "Quick speed bonus";
  if (t < 240) return "Speed bonus";
  return "No speed bonus";
}

function onlyLettersUpper(s: string) {
  return (s || "").replace(/[^a-zA-Z]/g, "").toUpperCase();
}

function candidateForms(rawWord: string): string[] {
  const W = onlyLettersUpper(rawWord);
  if (!W) return [];

  const forms: string[] = [];
  const add = (s: string) => {
    const k = onlyLettersUpper(s);
    if (!k) return;
    if (!forms.includes(k)) forms.push(k);
  };

  add(W);

  // plurals / nouns
  if (W.endsWith("IES") && W.length > 3) add(W.slice(0, -3) + "Y");
  if (W.endsWith("ES") && W.length > 2) add(W.slice(0, -2));
  if (W.endsWith("S") && W.length > 1) add(W.slice(0, -1));

  // -ING
  if (W.endsWith("ING") && W.length > 4) {
    const stem = W.slice(0, -3);
    add(stem);
    if (stem.length > 1) add(stem.slice(0, -1)); // doubled consonant
    add(stem + "E"); // silent-e
  }

  // -ED
  if (W.endsWith("ED") && W.length > 3) {
    const stem = W.slice(0, -2);
    add(stem);
    if (stem.endsWith("I") && stem.length > 1) add(stem.slice(0, -1) + "Y");
    if (stem.length > 1) add(stem.slice(0, -1)); // doubled consonant
    add(stem + "E"); // silent-e
  }

  // -ER / -EST
  if (W.endsWith("ER") && W.length > 3) {
    const stem = W.slice(0, -2);
    add(stem);
    if (stem.endsWith("I") && stem.length > 1) add(stem.slice(0, -1) + "Y");
    add(stem + "E");
  }

  if (W.endsWith("EST") && W.length > 4) {
    const stem = W.slice(0, -3);
    add(stem);
    if (stem.endsWith("I") && stem.length > 1) add(stem.slice(0, -1) + "Y");
    add(stem + "E");
  }

  return forms;
}

function zipfForWord(zipf: Record<string, number>, rawWord: string): number | undefined {
  const forms = candidateForms(rawWord);
  let best: number | undefined = undefined;

  for (const k of forms) {
    const v = zipf[k];
    if (!Number.isFinite(v)) continue;
    if (best == null || (v as number) > best) best = v as number; // MAX zipf = most common
  }

  return best;
}

function aoaForWord(aoa: Record<string, number>, rawWord: string): number | undefined {
  const forms = candidateForms(rawWord);
  let best: number | undefined = undefined;

  for (const k of forms) {
    const v = aoa[k];
    if (!Number.isFinite(v)) continue;
    if (best == null || (v as number) < best) best = v as number; // MIN aoa = simplest/earliest
  }

  return best;
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

type BoundPatternEntry =
  | { len: number; kind: "both"; start: string; end: string; count: number }
  | { len: number; kind: "start"; start: string; count: number }
  | { len: number; kind: "end"; end: string; count: number };

// CHANGE THIS if you want puzzle #1 to start on your actual launch date.
// Format: "YYYY-MM-DD" (local date)
const PUZZLE_START_LOCAL_DATE = "2026-03-04";

function localDateKey(d = new Date()) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function puzzleNumberFromLocalDate(todayKey: string) {
  const [y0, m0, d0] = PUZZLE_START_LOCAL_DATE.split("-").map(Number);
  const [y1, m1, d1] = todayKey.split("-").map(Number);

  const start = new Date(y0, (m0 || 1) - 1, d0 || 1);
  const today = new Date(y1, (m1 || 1) - 1, d1 || 1);

  const msPerDay = 24 * 60 * 60 * 1000;
  const diffDays = Math.floor((today.getTime() - start.getTime()) / msPerDay);

  return Math.max(0, diffDays);
}

function hashStringToInt(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function buildPatternFromEntry(p: BoundPatternEntry) {
  const L = Math.max(2, p.len);
  const tiles = Array.from({ length: L }, () => "_");

  if (p.kind === "both") {
    tiles[0] = p.start;
    tiles[L - 1] = p.end;
  } else if (p.kind === "start") {
    tiles[0] = p.start;
  } else {
    tiles[L - 1] = p.end;
  }

  return tiles.join(" ");
}

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
  tierEmoji: TierEmoji;
  tierName: TierName;
  points: number; // 1..4
  percentile: number; // 0..100

  aoaPct: number;   // 0..100
  zipfPct: number;  // 0..100
  blendPct: number; // 0..100

  bonusPoints: number; // 0..1
  timeSec: number;
  multiplier: number;
  finalScore: number; // rounded
  shareText: string;
};

type StoredSubmission = {
  v: 2;
  puzzleNumber: number;
  localDayKey: string;
  pattern: string;
  length: number;
  startedAtMs: number;
  submittedAt: string; // ISO
  word: string;
  scoreResult: ScoreResult;
};

function startedKey(puzzleNumber: number) {
  return `bound:v2:startedAt:${puzzleNumber}`;
}
function submissionKey(puzzleNumber: number) {
  return `bound:v2:submission:${puzzleNumber}`;
}

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

function tierFromPercentile(pct: number): TierEmoji {
  const p = clamp(pct, 0, 100);
  if (p < PCT_COMMON_MAX) return "🟦";
  if (p < PCT_UNCOMMON_MAX) return "🟨";
  if (p < PCT_RARE_MAX) return "🟧";
  return "🟥";
}


// Zipf scale (SUBTLEX) is usually ~1 (very rare) to ~7 (very common).
// Lower Zipf = rarer/harder. Higher AoA = learned later/harder.
function absoluteHardnessPct(aoaValue: number | undefined, zipfValue: number | undefined) {
  const aoa = Number.isFinite(aoaValue as number) ? (aoaValue as number) : 10;
  const zipf = Number.isFinite(zipfValue as number) ? (zipfValue as number) : 2.5;
  // Map Zipf to 0..100 hardness:
  // zipf 5.5+ => ~0 (super common)
  // zipf 4.5  => ~25
  // zipf 3.5  => ~60
  // zipf 3.0  => ~75
  // zipf 2.5- => ~90-100
// Smooth curve: still penalizes rare words, but avoids "everything near 2.2 = 100"
const k = 2.2;   // steepness (try 1.8–2.8)
const mid = 3.4; // midpoint where hardness ~50 (try 3.2–3.6)
const zipfHard = clamp(100 / (1 + Math.exp(k * (zipf - mid))), 0, 100);
  // Map AoA to 0..100 hardness:
  // aoa 6 => 0 (early)
  // aoa 9 => 40
  // aoa 11 => 70
  // aoa 13+ => 100
  let aoaHard = clamp(((aoa - 6) / (13 - 6)) * 100, 0, 100);
  // predicted AoA can be noisy; don't let it fully dominate
  aoaHard = Math.min(aoaHard, 85);
  // Combine: frequency usually tracks “feels hard” more than AoA, so weight Zipf a bit more
  return clamp(0.65 * zipfHard + 0.35 * aoaHard, 0, 100);
}

function aoaHardnessPct(aoaValue: number | undefined) {
  // "Lower AoA = easier". This returns 0..100 hardness.
  // Tune these two numbers to match your dataset’s scale.
  // Good defaults if your AoA values look like ~3–12:
  const EASY = 5.5;  // learned by ~K/1st
  const HARD = 10.5; // learned later

  const aoa = Number.isFinite(aoaValue as number) ? (aoaValue as number) : NaN;
  if (!Number.isFinite(aoa)) return 0;

  return clamp(((aoa - EASY) / (HARD - EASY)) * 100, 0, 100);
}

function percentileRank(values: number[], x: number) {
  // returns 0..100, where higher means "harder" (higher AoA)
  // uses rank among sorted values (ties handled by <=)
  if (!values.length) return 50;
  const sorted = values.slice().sort((a, b) => a - b);
  let count = 0;
  for (let i = 0; i < sorted.length; i++) {
    if (sorted[i] <= x) count++;
    else break;
  }
  const denom = Math.max(1, sorted.length - 1);
  const rank01 = (count - 1) / denom;
  return clamp(rank01 * 100, 0, 100);
}

function buildShareText(
  puzzleNumber: number,
  finalScore: number,
  tierEmoji: string,
  percentile: number
) {
  const pct = Math.round(percentile * 10) / 10;
  return (
    `Bounds #${puzzleNumber}\n` +
    `Score: ${finalScore}\n` +
    `Percentile: ${pct}\n` +
    `${tierEmoji}`
  );
}

function tierIndexFromEmoji(t: TierEmoji) {
  return t === "🟦" ? 0 : t === "🟨" ? 1 : t === "🟧" ? 2 : 3;
}
function tierEmojiFromIndex(i: number): TierEmoji {
  if (i <= 0) return "🟦";
  if (i === 1) return "🟨";
  if (i === 2) return "🟧";
  return "🟥";
}

function applyZipfCapsOnly(baseTier: TierEmoji, zipfValue: number | undefined) {
  if (!Number.isFinite(zipfValue as number)) return baseTier;
  const z = zipfValue as number;

  let capIdx: number | null = null;
  if (z >= 5.1) capIdx = 0;
  else if (z >= 4.7) capIdx = 1;
  else if (z >= 4.2) capIdx = 2;

  let idx = tierIndexFromEmoji(baseTier);
  if (capIdx != null) idx = Math.min(idx, capIdx);
  return tierEmojiFromIndex(idx);
}

function formatOrdinal(n: number) {
  const x = Math.round(n);
  const mod100 = x % 100;
  if (mod100 >= 11 && mod100 <= 13) return `${x}th`;
  switch (x % 10) {
    case 1: return `${x}st`;
    case 2: return `${x}nd`;
    case 3: return `${x}rd`;
    default: return `${x}th`;
  }
}


export default function BoundPage() {
  // daily puzzle (local midnight)
  const [localDayKeyState, setLocalDayKeyState] = useState(() => localDateKey());
  const puzzleNumber = useMemo(
    () => puzzleNumberFromLocalDate(localDayKeyState),
    [localDayKeyState]
  );

  // pattern bank
  const [patternBank, setPatternBank] = useState<BoundPatternEntry[] | null>(null);

  // NOTE: we keep this derived, and we only use the pattern once bank is ready
  const pattern = useMemo(() => {


    if (!patternBank?.length) return "_ _ _ _ _"; // safe 5-len placeholder
  
    const seed = hashStringToInt(`BOUND:${puzzleNumber}`);
    let idx = seed % patternBank.length;
  
    let p = patternBank[idx];
  
    // Prevent same length as yesterday
    if (puzzleNumber > 0) {
      const prevSeed = hashStringToInt(`BOUND:${puzzleNumber - 1}`);
      const prevIdx = prevSeed % patternBank.length;
      const prev = patternBank[prevIdx];
  
      if (prev && p.len === prev.len) {
        idx = (idx + 1) % patternBank.length;
        p = patternBank[idx];
      }
    }
  
    return buildPatternFromEntry(p);
  }, [patternBank, puzzleNumber]);

  const len = useMemo(() => patternLength(pattern), [pattern]);

  const puzzleReady = !!patternBank?.length;

  // gameplay state
  const [revealed, setRevealed] = useState(false);
  const [startedAtMs, setStartedAtMs] = useState<number | null>(null);
  const [nowMs, setNowMs] = useState<number>(() => Date.now());

  const [word, setWord] = useState("");
  const [locked, setLocked] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedAt, setSubmittedAt] = useState<string | null>(null);
  const [scoreResult, setScoreResult] = useState<ScoreResult | null>(null);
  const [showShare, setShowShare] = useState(false);

  const [error, setError] = useState<string | null>(null);

  // animation triggers (we bump these to re-run CSS keyframe pops)
  const [revealAnimKey, setRevealAnimKey] = useState(0);
  const [resultAnimKey, setResultAnimKey] = useState(0);

// caches
const wordbankCacheRef = useRef<Record<string, 1> | null>(null); // validity
const aoaCacheRef = useRef<Record<string, number> | null>(null); // AoA
const zipfCacheRef = useRef<Record<string, number> | null>(null); // SUBTLEX Zipf

const candidateCacheRef = useRef<{
  key: string;
  aoaValues: number[];
  zipfValues: number[];
} | null>(null);


  // load patterns once
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch("/bound-patterns.json?v=2026-03-04", { cache: "no-store" });
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

  // auto-rollover at local midnight
  useEffect(() => {
    const now = new Date();
    const nextMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const ms = nextMidnight.getTime() - now.getTime() + 50;

    const t = window.setTimeout(() => {
      setLocalDayKeyState(localDateKey());
    }, ms);

    return () => window.clearTimeout(t);
  }, [localDayKeyState]);

  // tick timer only when started + not locked
  useEffect(() => {
    if (!startedAtMs) return;
    if (locked) return;
    const t = window.setInterval(() => setNowMs(Date.now()), 200);
    return () => window.clearInterval(t);
  }, [startedAtMs, locked]);

  const elapsedSec = useMemo(() => {
    if (!startedAtMs) return 0;
    return Math.max(0, Math.floor((nowMs - startedAtMs) / 1000));
  }, [nowMs, startedAtMs]);

  const liveMultiplier = useMemo(() => {
    if (!revealed) return null;
    if (submitted) return null;
    return multiplierFromSeconds(elapsedSec);
  }, [revealed, submitted, elapsedSec]);

  const liveSpeedLabel = useMemo(() => {
    if (liveMultiplier == null) return null;
    return speedLabelFromSeconds(elapsedSec);
  }, [liveMultiplier, elapsedSec]);

  // reset for new puzzle + restore persisted state (safe, no flashing old state)
  useEffect(() => {
    // hard reset UI
    setRevealed(false);
    setStartedAtMs(null);
    setWord("");
    setError(null);
    setLocked(false);
    setSubmitted(false);
    setSubmittedAt(null);
    setScoreResult(null);
    setShowShare(false);
    if (typeof window === "undefined") return;

    // restore submission if already submitted
    try {
      const rawSub = localStorage.getItem(submissionKey(puzzleNumber));
      if (rawSub) {
        const parsed = JSON.parse(rawSub) as StoredSubmission;
        if (parsed && parsed.v === 2 && parsed.puzzleNumber === puzzleNumber) {
          setRevealed(true);
          setStartedAtMs(parsed.startedAtMs ?? null);
          setWord(parsed.word ?? "");
          setScoreResult(parsed.scoreResult ?? null);
          setSubmittedAt(parsed.submittedAt ?? null);
          setSubmitted(true);
          setLocked(true);
          return;
        }
      }

      // restore startedAt (timer resumes) if they revealed but didn’t submit
      const rawStarted = localStorage.getItem(startedKey(puzzleNumber));
      if (rawStarted) {
        const ms = Number(rawStarted);
        if (Number.isFinite(ms) && ms > 0) {
          setRevealed(true);
          setStartedAtMs(ms);
        }
      }
    } catch {
      // ignore
    }
  }, [puzzleNumber]);

  async function loadWordbank(): Promise<Record<string, 1> | null> {
    if (wordbankCacheRef.current) return wordbankCacheRef.current;
    try {
      const res = await fetch("/wordbank.json", { cache: "force-cache" });
      if (!res.ok) return null;
      const json = (await res.json()) as Record<string, unknown>;
      // normalize into a {WORD:1} map (wordbank.json is likely {word: something})
      const map: Record<string, 1> = {};
      for (const k of Object.keys(json)) map[onlyLettersUpper(k)] = 1;
      wordbankCacheRef.current = map;
      return map;
    } catch {
      return null;
    }
  }

  async function loadAoaPred(): Promise<Record<string, number> | null> {
    if (aoaCacheRef.current) return aoaCacheRef.current;
    try {
      const AOA_VERSION = "2026-03-04b";
      const res = await fetch(`/aoa_pred_full.json?v=${AOA_VERSION}`, { cache: "no-store" });
if (!res.ok) return null;
      const json = (await res.json()) as Record<string, number>;
      // keys are expected uppercase already, but normalize anyway
      const map: Record<string, number> = {};
      for (const [k, v] of Object.entries(json)) {
        const kk = onlyLettersUpper(k);
        if (!kk) continue;
        const vv = Number(v);
        if (!Number.isFinite(vv)) continue;
        map[kk] = vv;
      }
      aoaCacheRef.current = map;
      return map;
    } catch {
      return null;
    }
  }


  async function loadZipf(): Promise<Record<string, number> | null> {
    if (zipfCacheRef.current) return zipfCacheRef.current;
    try {
      // Expecting a map like { "THE": 6.17, "YOU": 6.33, ... }
      // If your file is shaped differently, tell me and I’ll adapt it.
      const res = await fetch("/subtlex-us-zipf.json", { cache: "force-cache" });
      if (!res.ok) return null;
  
      const json = (await res.json()) as Record<string, number>;
      const map: Record<string, number> = {};
  
      for (const [k, v] of Object.entries(json)) {
        const kk = onlyLettersUpper(k);
        const vv = Number(v);
        if (!kk) continue;
        if (!Number.isFinite(vv)) continue;
        map[kk] = vv;
      }
  
      zipfCacheRef.current = map;
      return map;
    } catch {
      return null;
    }
  }

  const BLEND_AOA_WEIGHT = 0.5; // 0..1 (0.5 = equal weight AoA + frequency)
  
  async function ensureCandidateValuesForPattern(): Promise<{
    aoaValues: number[];
    zipfValues: number[];
  } | null> {
    const key = `v4|${normalizePattern(pattern)}|${len}`;
    if (candidateCacheRef.current?.key === key) {
      return {
        aoaValues: candidateCacheRef.current.aoaValues,
        zipfValues: candidateCacheRef.current.zipfValues,
      };
    }

    const wb = await loadWordbank();
    const aoa = await loadAoaPred();
    const zipf = await loadZipf(); // optional backup
    
    if (!wb || !aoa) return null;
    
    const aoaValues: number[] = [];
    const zipfValues: number[] = [];
    
    const pCompact = normalizePattern(pattern).replace(/\s+/g, "");
    
    for (const w of Object.keys(wb)) {
      if (w.length !== pCompact.length) continue;
      if (!fitsPattern(w, pattern)) continue;
    
      const aRaw = aoaForWord(aoa, w);
      const a = Number.isFinite(aRaw) ? (aRaw as number) : NaN;
      if (Number.isFinite(a)) aoaValues.push(a);
    
      if (zipf) {
        const zRaw = zipfForWord(zipf, w);
        const z = Number.isFinite(zRaw) ? (zRaw as number) : NaN;
        if (Number.isFinite(z)) zipfValues.push(z);
      }
    }
    
    candidateCacheRef.current = { key, aoaValues, zipfValues };
return { aoaValues, zipfValues };
} // ✅ CLOSE ensureCandidateValuesForPattern

function validateInstant(raw: string) {
    const w = onlyLettersUpper(raw);

    if (!revealed) return { ok: false, word: w, msg: "Reveal to start." };
    if (!w) return { ok: false, word: w, msg: null }; // empty: no red error yet
    if (w.length !== len) return { ok: false, word: w, msg: `Must be ${len} letters.` };
    if (!fitsPattern(w, pattern)) return { ok: false, word: w, msg: "Doesn’t match the pattern." };
    return { ok: true, word: w, msg: null };
  }

  const instant = useMemo(() => validateInstant(word), [word, revealed, len, pattern]);

  useEffect(() => {
    // “instant red error” behavior
    setError(instant.msg);
  }, [instant.msg]);

  const canSubmit = useMemo(() => {
    if (!puzzleReady) return false;
    if (!revealed) return false;
    if (locked) return false;
    if (!instant.ok) return false;
    return true;
  }, [puzzleReady, revealed, locked, instant.ok]);

  function onReveal() {
    if (!puzzleReady) return;
    if (locked) return;

    // if already started, don’t overwrite
    if (startedAtMs) {
      setRevealed(true);
      return;
    }

    const ms = Date.now();
    setRevealed(true);
    setRevealAnimKey((k) => k + 1);
    setStartedAtMs(ms);
    setNowMs(ms);

    try {
      localStorage.setItem(startedKey(puzzleNumber), String(ms));
    } catch {
      // ignore
    }
  }

  async function onSubmit() {
    if (!canSubmit) return;

    setShowShare(false);

    const w = onlyLettersUpper(word);

    // server-ish safety: confirm it’s in wordbank + has AoA
    const wb = await loadWordbank();
    if (!wb) {
      setError("Word list not loaded. Refresh and try again.");
      return;
    }
    if (!(w in wb)) {
      setError("Not a valid word.");
      return;
    }

    const aoa = await loadAoaPred();
    const zipf = await loadZipf(); // optional backup
    
    if (!aoa) {
      setError("Difficulty data not loaded. Refresh and try again.");
      return;
    }
    
    const myAoaRaw = aoaForWord(aoa, w);
const hasAoa = Number.isFinite(myAoaRaw);
const myAoa: number = hasAoa ? (myAoaRaw as number) : NaN;

const myZipfRaw = zipf ? zipfForWord(zipf, w) : undefined;
let myZipf: number = Number.isFinite(myZipfRaw as number) ? (myZipfRaw as number) : 3.8; // fallback
myZipf = Math.max(2.0, Math.min(6.5, myZipf));

    
    // clamp unrealistic values
    myZipf = Math.max(2.0, Math.min(6.5, myZipf));
    console.log(
      "[BOUND DEBUG]",
      "word=", w,
      "aoa=", myAoa,
      "zipf=", myZipf,
      "zipfLooksLike=",
      typeof myZipf === "number"
        ? myZipf >= 0 && myZipf <= 8
          ? "ZIPF_OK"
          : "NOT_ZIPF_SCALE"
        : "MISSING"
    );

    // If missing, we still allow play, but treat as hardest/unknown
    const cand = await ensureCandidateValuesForPattern();
// never hard-fail; we can still score with sensible defaults
const aoaValues = cand?.aoaValues ?? [];
const zipfValues = cand?.zipfValues ?? [];

    const aoaPct =
    Number.isFinite(myAoa) && aoaValues.length
    ? percentileRank(aoaValues, myAoa)
      : 100;
  
  const zipfPct =
  Number.isFinite(myZipf) && zipfValues.length
    ? percentileRank(zipfValues, myZipf)
      : 50;

    // Higher = harder
    // AoA higher => harder
    // Zipf higher => easier, so invert with (100 - zipfPct)
// Zipf: higher zipf => easier, so invert percentile (100 - zipfPct) = harder
const zipfHardRel = clamp(100 - zipfPct, 0, 100);

// Absolute AoA hardness (what you actually care about for “should never be rare”)
const aoaHardAbs = aoaHardnessPct(myAoa);

// If AoA is available, let it dominate.
// If AoA missing, fall back to Zipf-relative only.


const pct = hasAoa
  ? clamp(0.85 * aoaHardAbs + 0.15 * zipfHardRel, 0, 100)
  : clamp(zipfHardRel, 0, 100);
    let tierEmoji = tierFromPercentile(pct);
    
    // SHIPPABLE SAFETY: clamp tier based on absolute frequency
    tierEmoji = applyZipfCapsOnly(tierEmoji, myZipf);    

// Hard cap: if learned early, never show as Rare/Advanced
if (hasAoa && myAoa <= 6.0) {
  if (tierEmoji === "🟧" || tierEmoji === "🟥") tierEmoji = "🟨";
}
if (hasAoa && myAoa <= 5.0) {
  tierEmoji = "🟦";
}
    const tierName = TIER_LABELS[tierEmoji];
    const points = TIER_POINTS[tierEmoji];

    const bonusPoints = 0;

    const tSec = elapsedSec;
    const mult = multiplierFromSeconds(tSec);

    const rawScore = (points + bonusPoints) * mult;
    const finalScore = Math.round(rawScore * 100) / 100;

    // share text: no spoilers (no pattern letters)
    const shareText = buildShareText(
      puzzleNumber,
      finalScore,
      tierEmoji,
      Math.round(pct * 10) / 10
    );

      const result: ScoreResult = {
        tierEmoji,
        tierName,
        points,
        percentile: Math.round(pct * 10) / 10,
      
        aoaPct: Math.round(aoaPct * 10) / 10,
        zipfPct: Math.round(zipfPct * 10) / 10,
        blendPct: Math.round(pct * 10) / 10,
      
        bonusPoints,
        timeSec: tSec,
        multiplier: Math.round(mult * 100) / 100,
        finalScore,
        shareText,
      };

    const submittedIso = new Date().toISOString();

    setSubmitted(true);
    setLocked(true);
    setScoreResult(result);
    setSubmittedAt(submittedIso);
    setResultAnimKey((k) => k + 1);

    // persist: one try per device
    try {
      const payload: StoredSubmission = {
        v: 2,
        puzzleNumber,
        localDayKey: localDayKeyState,
        pattern,
        length: len,
        startedAtMs: startedAtMs ?? Date.now(),
        submittedAt: submittedIso,
        word: w,
        scoreResult: result,
      };
      localStorage.setItem(submissionKey(puzzleNumber), JSON.stringify(payload));
      // timer resume key no longer needed after submit
      localStorage.removeItem(startedKey(puzzleNumber));
    } catch {
      // ignore
    }
  }

  async function onCopyShare() {
    if (!submitted || !scoreResult) return;
  
    const text = buildShareText(
      puzzleNumber,
      scoreResult.finalScore,
      scoreResult.tierEmoji,
      scoreResult.percentile
    );  
    try {
      await navigator.clipboard.writeText(text);
      setShowShare(true);
    } catch {
      setShowShare(false);
    }
  }

  // UI bits
  const patternTiles = useMemo(() => normalizePattern(pattern).split(" "), [pattern]);

  return (
    <main style={{ maxWidth: 1120, margin: "0 auto", padding: "28px 14px 64px" }}>
      <div style={{ display: "grid", gap: 10 }}>
        <MetaKicker>TPV Games</MetaKicker>

        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            gap: 14,
            flexWrap: "wrap",
          }}
        >
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

            <span
  style={{
    display: "inline-flex",
    alignItems: "center",
    gap: 10,
    padding: "6px 10px",
    border: "1px solid #e5e7eb",
    background: (liveMultiplier ?? 1) > 1 ? "#f9fafb" : "#fff",    
    color: "#374151",
    fontSize: 13,
    borderRadius: 999,
    whiteSpace: "nowrap",
    fontWeight: 800,
  }}
>
  <span style={{ color: "#6b7280", fontWeight: 800 }}>Timer</span>

  <span style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", lineHeight: 1.05 }}>
    <span style={{ fontWeight: 900, color: "#111827" }}>
      {submitted && scoreResult
        ? `${scoreResult.timeSec}s`
        : revealed
          ? `${elapsedSec}s`
          : "—"}
    </span>

    {/* live “feel” line */}
    {revealed && !submitted && liveMultiplier != null ? (
      <span style={{ fontSize: 11, color: "#6b7280", fontWeight: 900, letterSpacing: 0.2 }}>
        {liveSpeedLabel} • {formatMult(liveMultiplier ?? 1)}
      </span>
    ) : null}
  </span>
</span>

            {submitted && scoreResult ? (
              <Pill>
                <span style={{ color: "#6b7280", fontWeight: 800 }}>Score</span>
                <span style={{ fontWeight: 900, color: "#111827" }}>{scoreResult.finalScore}</span>
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
  Reveal the puzzle, then submit <strong>one word</strong> that fits.
</p>

        <div style={{ borderTop: "1px solid #e5e7eb", margin: "12px 0 4px" }} />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.1fr 0.9fr",
          gap: 18,
          alignItems: "start",
        }}
        className="boundgrid"
      >
        {/* Left */}
        <section className="boundleft" style={{ borderTop: "1px solid #e5e7eb", paddingTop: 16 }}>
  <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div style={{ fontSize: 14, fontWeight: 900, color: "#111827" }}>
              {revealed ? "Today’s pattern" : "Today’s puzzle"}
            </div>
            <div style={{ fontSize: 13, color: "#6b7280", fontWeight: 800 }}>
            {revealed ? `${len} letters` : "Pattern hidden"}            
            </div>
          </div>

          {/* Pattern tiles (hidden until reveal; even the start/end letters) */}
          <div
  key={revealed ? `reveal-${revealAnimKey}` : "hidden"}
  className={revealed ? "pop" : undefined}
  style={{
    marginTop: 14,
    display: "flex",
    justifyContent: "flex-start",
    gap: 10,
    flexWrap: "wrap",
  }}
>
{(revealed ? patternTiles : new Array(5).fill("?")).map((c, i) => {
              const shown = revealed ? c : "?";
              return (
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
                    color: revealed ? (shown === "_" ? "#9ca3af" : "#111827") : "#9ca3af",
                  }}
                >
                  {shown}
                </div>
              );
            })}
          </div>

          {/* Reveal button (starts timer) */}
          <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
            {!revealed ? (
              <button
                onClick={onReveal}
                disabled={!puzzleReady}
                style={{
                  border: "1px solid #111827",
                  background: "#111827",
                  color: "#fff",
                  padding: "10px 12px",
                  fontWeight: 900,
                  cursor: puzzleReady ? "pointer" : "not-allowed",
                  opacity: puzzleReady ? 1 : 0.6,
                }}
              >
                Reveal & start
              </button>
            ) : (
              <Pill>
                <span style={{ color: "#6b7280", fontWeight: 800 }}>Length</span>
                <span style={{ fontWeight: 900, color: "#111827" }}>{len}</span>
              </Pill>
            )}
          </div>

          {/* Legend */}
  
        </section>

        {/* Right */}
        <section className="boundright" style={{ borderTop: "1px solid #e5e7eb", paddingTop: 16 }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
            <div style={{ fontSize: 14, fontWeight: 900, color: "#111827" }}>Your word</div>
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

              <div style={{ marginTop: 10, display: "flex", justifyContent: "space-between", gap: 12 }}>
                <div style={{ color: "#6b7280", fontSize: 12, fontWeight: 900 }}>Word</div>
                <div style={{ flex: 1, textAlign: "right", fontWeight: 900, letterSpacing: 1.2, color: "#111827" }}>
                  {onlyLettersUpper(word)}
                </div>
              </div>

              <div style={{ marginTop: 12, borderTop: "1px solid #e5e7eb", paddingTop: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                  <div style={{ color: "#6b7280", fontSize: 12, fontWeight: 900, letterSpacing: 1.2, textTransform: "uppercase" }}>
                    Result
                  </div>
                  <div
  key={`result-${resultAnimKey}`}
  className="pop"
  style={{ fontWeight: 900, color: "#111827" }}
>
  {scoreResult.tierEmoji}
  <span style={{ color: "#6b7280", fontWeight: 800 }}> • </span>
  {scoreResult.finalScore}
</div>
                </div>

                <div style={{ marginTop: 6, color: "#6b7280", fontSize: 12, lineHeight: 1.6 }}>
                  Tier: <strong style={{ color: "#111827" }}>{scoreResult.tierName}</strong>{" "}
                  <span style={{ color: "#9ca3af" }}>({formatOrdinal(scoreResult.percentile)} percentile)</span>
                  <br />
                  Time: <strong style={{ color: "#111827" }}>{scoreResult.timeSec}s</strong>{" "}
                  • Score multiplier: <strong style={{ color: "#111827" }}>{scoreResult.multiplier}</strong>
                </div>
              </div>
            </div>
          ) : null}

          <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
            <WordInput
              label="1"
              value={word}
              onChange={(v) => {
                setWord(v);
                setShowShare(false);
              }}
              disabled={!revealed || locked}
              error={error}
              placeholder={revealed ? "TYPE WORD…" : "REVEAL TO START"}
            />
          </div>

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
{buildShareText(
  puzzleNumber,
  scoreResult.finalScore,
  scoreResult.tierEmoji,
  scoreResult.percentile
)}            
</pre>
            </div>
          ) : null}
        </section>
        {/* Legend */}
<section
  className="boundlegend"
  style={{ borderTop: "1px solid #e5e7eb", paddingTop: 16 }}
>
  <div style={{ fontSize: 12, fontWeight: 900, letterSpacing: 1.2, color: "#6b7280", textTransform: "uppercase" }}>
    Legend
  </div>

  <div style={{ marginTop: 10, display: "grid", gap: 8, fontSize: 14 }}>
    <LegendRow emoji="🟦" label="Common" points={1} />
    <LegendRow emoji="🟨" label="Uncommon" points={2} />
    <LegendRow emoji="🟧" label="Rare" points={3} />
    <LegendRow emoji="🟥" label="Advanced" points={4} />
  </div>

  <div style={{ marginTop: 12, color: "#6b7280", fontSize: 13, lineHeight: 1.65 }}>
    Tiers are computed <strong>relative to today’s puzzle</strong> (percentiles). Score is tier points (+bonus) times a decaying time multiplier.
  </div>
</section>
      </div>

      <style jsx>{`
  .pop {
    animation: pop 220ms ease-out both;
  }

  @keyframes pop {
    0% {
      transform: scale(0.97);
      opacity: 0.7;
    }
    60% {
      transform: scale(1.02);
      opacity: 1;
    }
    100% {
      transform: scale(1);
    }
  }

.boundlegend {
  grid-column: 1 / 2; /* keep it under the left column on desktop */
  margin-top: 18px;
}

  @media (max-width: 980px) {
  .boundgrid {
    grid-template-columns: 1fr !important;
  }

  /* Put Right column before Legend on mobile */
  .boundright {
    order: 1;
  }

  /* Keep left content first, but Legend last */
  .boundleft {
    order: 0;
  }

  .boundlegend {
    order: 2;
    margin-top: 22px !important;
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
  disabled,
  error,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  disabled: boolean;
  error?: string | null;
  placeholder: string;
}) {
  const hasError = !!error && onlyLettersUpper(value).length > 0;
  return (
    <div style={{ display: "grid", gridTemplateColumns: "28px 1fr", gap: 12, alignItems: "start" }}>
      <div style={{ color: "#9ca3af", fontSize: 13, paddingTop: 12, fontWeight: 900 }}>{label}</div>

      <div style={{ display: "grid", gap: 6 }}>
        <input
          value={value}
          onChange={(e) => onChange(onlyLettersUpper(e.target.value))}
          placeholder={placeholder}
          disabled={disabled}
          style={{
            height: 44,
            border: `1px solid ${hasError ? "#ef4444" : "#e5e7eb"}`,
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
        <div style={{ minHeight: 16, fontSize: 12, color: hasError ? "#ef4444" : "#9ca3af" }}>
          {hasError ? error : " "}
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
  emoji: TierEmoji;
  label: string;
  points: number;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14 }}>
      <span style={{ fontSize: 16 }}>{emoji}</span>
      <span style={{ color: "#111827", fontWeight: 800 }}>{label}</span>
      <span style={{ color: "#6b7280", fontWeight: 800 }}>
        — {points} {points === 1 ? "pt" : "pts"}
      </span>
    </div>
  );
}