// pages/bound.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import OgHead from "../components/OgHead";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type TierEmoji = "🟦" | "🟨" | "🟧" | "🟥";
type TierName = "Instant" | "Fast" | "Moderate" | "Slow";

const TIER_LABELS: Record<TierEmoji, TierName> = {
  "🟦": "Instant",
  "🟨": "Fast",
  "🟧": "Moderate",
  "🟥": "Slow",
};

const TIER_COLOR: Record<TierEmoji, string> = {
  "🟦": "#7aa8c7",
  "🟨": "#c9b87a",
  "🟧": "#c49060",
  "🟥": "#b06060",
};

function tierFromSeconds(timeSec: number): TierEmoji {
  if (timeSec < 30) return "🟦";
  if (timeSec < 90) return "🟨";
  if (timeSec < 180) return "🟧";
  return "🟥";
}

function speedLabelFromSeconds(timeSec: number) {
  const t = Math.max(0, timeSec);
  if (t < 30) return "Instant pace";
  if (t < 90) return "Fast pace";
  if (t < 180) return "Moderate pace";
  return "Slow pace";
}

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

type BoundPatternEntry =
  | { len: number; kind: "both"; start: string; end: string; count: number }
  | { len: number; kind: "start2_end1"; start: string; start2: string; end: string; count: number }
  | { len: number; kind: "start1_end2"; start: string; end2: string; end: string; count: number };

const PUZZLE_START_LOCAL_DATE = "2026-03-07";

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
  tiles[0] = p.start;
  tiles[L - 1] = p.end;
  if (p.kind === "start2_end1") {
    tiles[1] = p.start2;
  } else if (p.kind === "start1_end2") {
    tiles[L - 2] = p.end2;
  }
  return tiles.join(" ");
}

function formatSubmittedAt(iso: string | null) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleString(undefined, {
    month: "short", day: "numeric", year: "numeric",
    hour: "numeric", minute: "2-digit",
  });
}

function buildShareText(
  puzzleNumber: number,
  timeSec: number,
  tierEmoji: TierEmoji,
  percentile: number | null
) {
  const percentileLine = percentile !== null ? `\n${percentile}th percentile` : "";
  return `Bound #${puzzleNumber}\nTime: ${timeSec}s${percentileLine}\n${tierEmoji}`;
}

function MetaKicker({ children }: { children: React.ReactNode }) {
  return <div className="eyebrow">{children}</div>;
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 8,
      padding: "6px 10px", border: "1px solid var(--border-light)",
      background: "var(--bg2)", color: "var(--text-dim)", fontSize: 13,
      borderRadius: 999, whiteSpace: "nowrap", fontWeight: 700,
      fontFamily: "var(--font-body)",
    }}>
      {children}
    </span>
  );
}

type ScoreResult = {
  tierEmoji: TierEmoji;
  tierName: TierName;
  timeSec: number;
  shareText: string;
};

type StoredSubmission = {
  v: 3;
  puzzleNumber: number;
  localDayKey: string;
  pattern: string;
  length: number;
  startedAtMs: number;
  submittedAt: string;
  word: string;
  scoreResult: ScoreResult;
};

type LeaderboardEntry = {
  rank: number;
  username: string;
  seconds: number;
};

function startedKey(puzzleNumber: number) {
  return `bound:v3:startedAt:${puzzleNumber}`;
}

function submissionKey(puzzleNumber: number) {
  return `bound:v3:submission:${puzzleNumber}`;
}

function daysBetween(a: string, b: string): number {
  const da = new Date(a).getTime();
  const db = new Date(b).getTime();
  return Math.round(Math.abs(da - db) / (24 * 60 * 60 * 1000));
}

async function saveSubmissionAndUpdateStreak(
  userId: string,
  puzzleNumber: number,
  word: string,
  seconds: number,
  tier: TierEmoji,
  localDayKey: string
): Promise<void> {
  await supabase.from("bound_submissions").upsert(
    { puzzle_id: puzzleNumber, user_id: userId, word, score: 0, seconds, local_day_key: localDayKey },
    { onConflict: "puzzle_id,user_id", ignoreDuplicates: true }
  );

  const { data: progress } = await supabase
    .from("bound_progress")
    .select("streak, last_played_day, games_played, best_score")
    .eq("user_id", userId)
    .single();

  const prevPlayed = progress?.last_played_day ?? null;
  const currentStreak = progress?.streak ?? 0;
  const gamesPlayed = progress?.games_played ?? 0;
  const bestScore = progress?.best_score ?? null;

  let newStreak: number;
  if (!prevPlayed) {
    newStreak = 1;
  } else if (prevPlayed === localDayKey) {
    newStreak = currentStreak;
  } else if (daysBetween(prevPlayed, localDayKey) === 1) {
    newStreak = currentStreak + 1;
  } else {
    newStreak = 1;
  }

  await supabase.from("bound_progress").upsert(
    {
      user_id: userId,
      streak: newStreak,
      last_played_day: localDayKey,
      games_played: gamesPlayed + (prevPlayed === localDayKey ? 0 : 1),
      best_score: bestScore === null ? seconds : Math.min(bestScore, seconds),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );
}

// ── Main page ───────────────────────────────────────────────────────

export default function BoundPage() {
  const [localDayKeyState, setLocalDayKeyState] = useState(() => localDateKey());
  const puzzleNumber = useMemo(
    () => puzzleNumberFromLocalDate(localDayKeyState),
    [localDayKeyState]
  );

  const [patternBank, setPatternBank] = useState<BoundPatternEntry[] | null>(null);
  const [patternLoadError, setPatternLoadError] = useState(false);

  const [userId, setUserId] = useState<string | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [percentile, setPercentile] = useState<number | null>(null);
  const [percentileTotal, setPercentileTotal] = useState<number>(0);

  const pattern = useMemo(() => {
    if (!patternBank?.length) return "_ _ _ _ _";
    const seed = hashStringToInt(`BOUND:${puzzleNumber}`);
    let idx = seed % patternBank.length;
    let p = patternBank[idx];
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
  const [revealAnimKey, setRevealAnimKey] = useState(0);
  const [resultAnimKey, setResultAnimKey] = useState(0);
  const wordbankCacheRef = useRef<Record<string, 1> | null>(null);
  const autoFocusRef = useRef<(() => void) | undefined>(undefined);

  async function fetchLeaderboardAndPercentile(sec?: number) {
    try {
      const lb = await fetch(`/api/bound/leaderboard?day=${localDayKeyState}`);
      if (lb.ok) {
        const j = await lb.json();
        setLeaderboard(j.leaderboard ?? []);
      }
    } catch { /* ignore */ }

    if (sec !== undefined) {
      try {
        const pc = await fetch(`/api/bound/percentile?day=${localDayKeyState}&seconds=${sec}`);
        if (pc.ok) {
          const j = await pc.json();
          setPercentile(j.percentile ?? null);
          setPercentileTotal(j.total ?? 0);
        }
      } catch { /* ignore */ }
    }
  }

  // ── Load auth session on mount ──
  useEffect(() => {
    let alive = true;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!alive) return;
      if (session?.user) setUserId(session.user.id);
    })();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!alive) return;
        setUserId(session?.user?.id ?? null);
      }
    );

    return () => { alive = false; subscription.unsubscribe(); };
  }, []);

  // ── Load pattern bank + initial leaderboard ──
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch("/bound-patterns.json?v=2026-03-08", { cache: "force-cache" });
        if (!res.ok) return;
        const json = (await res.json()) as BoundPatternEntry[];
        if (alive) setPatternBank(json);
      } catch {
        if (alive) setPatternLoadError(true);
      }
    })();
    fetchLeaderboardAndPercentile();
    return () => { alive = false; };
  }, []);

  // ── Midnight rollover ──
  useEffect(() => {
    const now = new Date();
    const nextMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const ms = nextMidnight.getTime() - now.getTime() + 50;
    const t = window.setTimeout(() => { setLocalDayKeyState(localDateKey()); }, ms);
    return () => window.clearTimeout(t);
  }, [localDayKeyState]);

  // ── Live timer ──
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

  const liveSpeedLabel = useMemo(() => {
    if (!revealed || submitted) return null;
    return speedLabelFromSeconds(elapsedSec);
  }, [revealed, submitted, elapsedSec]);

  // ── Restore local state on puzzle change ──
  useEffect(() => {
    setRevealed(false);
    setStartedAtMs(null);
    setWord("");
    setError(null);
    setLocked(false);
    setSubmitted(false);
    setSubmittedAt(null);
    setScoreResult(null);
    setShowShare(false);
    setPercentile(null);
    setPercentileTotal(0);
    if (typeof window === "undefined") return;
    try {
      for (let i = 0; i < puzzleNumber; i++) {
        localStorage.removeItem(startedKey(i));
      }
    } catch { /* ignore */ }
    try {
      const rawSub = localStorage.getItem(submissionKey(puzzleNumber));
      if (rawSub) {
        const parsed = JSON.parse(rawSub) as StoredSubmission;
        if (
          parsed && parsed.v === 3 &&
          parsed.puzzleNumber === puzzleNumber &&
          parsed.localDayKey === localDayKeyState
        ) {
          setRevealed(true);
          setStartedAtMs(parsed.startedAtMs ?? null);
          setWord(parsed.word ?? "");
          setScoreResult(parsed.scoreResult ?? null);
          setSubmittedAt(parsed.submittedAt ?? null);
          setSubmitted(true);
          setLocked(true);
          fetchLeaderboardAndPercentile(parsed.scoreResult?.timeSec);
          return;
        }
      }
      const rawStarted = localStorage.getItem(startedKey(puzzleNumber));
      if (rawStarted) {
        const ms = Number(rawStarted);
        if (Number.isFinite(ms) && ms > 0) {
          setRevealed(true);
          setStartedAtMs(ms);
        }
      }
    } catch { /* ignore */ }
  }, [puzzleNumber]);

  async function loadWordbank(): Promise<Record<string, 1> | null> {
    if (wordbankCacheRef.current) return wordbankCacheRef.current;
    try {
      const res = await fetch("/wordbank.json", { cache: "force-cache" });
      if (!res.ok) return null;
      const json = (await res.json()) as Record<string, unknown>;
      const map: Record<string, 1> = {};
      for (const k of Object.keys(json)) map[onlyLettersUpper(k)] = 1;
      wordbankCacheRef.current = map;
      return map;
    } catch {
      return null;
    }
  }

  function validateInstant(raw: string) {
    const w = onlyLettersUpper(raw);
    if (!revealed) return { ok: false, word: w, msg: "Reveal to start." };
    if (!w) return { ok: false, word: w, msg: null };
    if (w.length !== len) return { ok: false, word: w, msg: null };
    if (!fitsPattern(w, pattern)) return { ok: false, word: w, msg: "Doesn't match the pattern." };
    return { ok: true, word: w, msg: null };
  }

  const instant = useMemo(
    () => validateInstant(word),
    [word, revealed, len, pattern]
  );

  useEffect(() => { setError(instant.msg); }, [instant.msg]);

  const canSubmit = useMemo(() => {
    if (!puzzleReady) return false;
    if (!revealed) return false;
    if (locked) return false;
    if (!instant.ok) return false;
    if (onlyLettersUpper(word).length !== len) return false;
    return true;
  }, [puzzleReady, revealed, locked, instant.ok, word, len]);

  function onReveal() {
    if (!puzzleReady) return;
    if (locked) return;
    if (startedAtMs) { setRevealed(true); return; }
    const ms = Date.now();
    setRevealed(true);
    setRevealAnimKey((k) => k + 1);
    setStartedAtMs(ms);
    setNowMs(ms);
    try { localStorage.setItem(startedKey(puzzleNumber), String(ms)); } catch { /* ignore */ }
    setTimeout(() => { autoFocusRef.current?.(); }, 100);
  }

  async function onSubmit() {
    if (!canSubmit) return;
    setShowShare(false);
    const w = onlyLettersUpper(word);
    if (w.length !== len) { setError("Word length doesn't match the pattern."); return; }
    const wb = await loadWordbank();
    if (!wb) { setError("Word list not loaded. Refresh and try again."); return; }
    if (!(w in wb)) { setError("I don't think that one's in the dictionary..."); return; }

    const tSec = elapsedSec;
    const tierEmoji = tierFromSeconds(tSec);
    const tierName = TIER_LABELS[tierEmoji];

    if (userId) {
      await saveSubmissionAndUpdateStreak(userId, puzzleNumber, w, tSec, tierEmoji, localDayKeyState);
    }

    const shareText = buildShareText(puzzleNumber, tSec, tierEmoji, null);
    const result: ScoreResult = { tierEmoji, tierName, timeSec: tSec, shareText };
    const submittedIso = new Date().toISOString();

    setSubmitted(true);
    setLocked(true);
    setScoreResult(result);
    setSubmittedAt(submittedIso);
    setResultAnimKey((k) => k + 1);

    fetchLeaderboardAndPercentile(tSec);

    try {
      const payload: StoredSubmission = {
        v: 3, puzzleNumber, localDayKey: localDayKeyState,
        pattern, length: len,
        startedAtMs: startedAtMs ?? Date.now(),
        submittedAt: submittedIso, word: w,
        scoreResult: result,
      };
      localStorage.setItem(submissionKey(puzzleNumber), JSON.stringify(payload));
      localStorage.removeItem(startedKey(puzzleNumber));
    } catch { /* ignore */ }
  }

  async function onCopyShare() {
    if (!submitted || !scoreResult) return;
    const text = buildShareText(puzzleNumber, scoreResult.timeSec, scoreResult.tierEmoji, percentile);
    try {
      await navigator.clipboard.writeText(text);
      setShowShare(true);
    } catch {
      setShowShare(false);
    }
  }

  return (
    <>
      <OgHead title="Bound" type="bound" slug="bound" />
      <main style={{ maxWidth: 1120, margin: "0 auto", padding: "2.5rem 1.25rem 5rem" }}>
        <div style={{ display: "grid", gap: 10 }}>
          <MetaKicker>TPV Games</MetaKicker>
          <div style={{
            display: "flex", alignItems: "baseline",
            justifyContent: "space-between", gap: 14, flexWrap: "wrap",
          }}>
            <h1 style={{
              margin: 0, fontFamily: "var(--font-display)",
              fontSize: "clamp(2.2rem, 6vw, 3.5rem)", fontWeight: 400,
              letterSpacing: "-0.03em", color: "var(--text)", lineHeight: 1.05,
            }}>
              Bound
            </h1>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "flex-end" }}>
              <Pill>
                <span style={{ color: "var(--text-faint)", fontWeight: 700 }}>Puzzle</span>
                <span style={{ fontWeight: 700, color: "var(--text)" }}>#{puzzleNumber}</span>
              </Pill>

              <span style={{
                display: "inline-flex", alignItems: "center", gap: 10,
                padding: "6px 10px", border: "1px solid var(--border-light)",
                background: "var(--bg2)", color: "var(--text-dim)", fontSize: 13,
                borderRadius: 999, whiteSpace: "nowrap", fontWeight: 700,
                fontFamily: "var(--font-body)",
              }}>
                <span style={{ color: "var(--text-faint)", fontWeight: 700 }}>Timer</span>
                <span style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", lineHeight: 1.05 }}>
                  <span style={{ fontWeight: 700, color: "var(--text)" }}>
                    {submitted && scoreResult
                      ? `${scoreResult.timeSec}s`
                      : revealed ? `${elapsedSec}s` : "—"}
                  </span>
                  {revealed && !submitted && liveSpeedLabel ? (
                    <span style={{ fontSize: 11, color: "var(--gold)", fontWeight: 700, letterSpacing: 0.2 }}>
                      {liveSpeedLabel}
                    </span>
                  ) : null}
                </span>
              </span>
            </div>
          </div>
          <p style={{
            margin: "2px 0 0", color: "var(--text-dim)", fontSize: "1rem",
            lineHeight: 1.7, maxWidth: 900, fontFamily: "var(--font-body)",
          }}>
            Reveal the puzzle, then submit{" "}
            <strong style={{ color: "var(--text)" }}>one word</strong> that fits. Any word that fits works. Faster is better.
          </p>
          <div style={{ borderTop: "1px solid var(--border)", margin: "12px 0 4px" }} />
        </div>

        <div
          style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 18, alignItems: "start" }}
          className="boundgrid"
        >
          {/* Left */}
          <section className="boundleft" style={{ borderTop: "1px solid var(--border)", paddingTop: 16 }}>
            <div style={{
              display: "flex", alignItems: "baseline",
              justifyContent: "space-between", gap: 12, flexWrap: "wrap",
            }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", fontFamily: "var(--font-body)" }}>
                {revealed ? "Today's pattern" : "Today's puzzle"}
              </div>
              <div style={{ fontSize: 13, color: "var(--text-faint)", fontWeight: 700, fontFamily: "var(--font-body)" }}>
                {revealed ? `${len} letters` : "Pattern hidden"}
              </div>
            </div>
            <div
              key={revealed ? `reveal-${revealAnimKey}` : "hidden"}
              className={revealed ? "pop" : undefined}
              style={{ marginTop: 14 }}
            >
              {revealed ? (
                <WordInput
                  label="1"
                  value={word}
                  onChange={(v) => { setWord(v); setShowShare(false); setError(null); }}
                  disabled={locked}
                  error={error}
                  placeholder="TYPE WORD…"
                  pattern={pattern}
                  autoFocusRef={autoFocusRef}
                />
              ) : (
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {new Array(5).fill("?").map((_, i) => (
                    <div key={i} style={{
                      width: 46, height: 50, border: "1px solid var(--border-light)",
                      background: "var(--bg2)", display: "flex", alignItems: "center",
                      justifyContent: "center", fontWeight: 700, fontSize: 18,
                      color: "var(--text-faint)", fontFamily: "var(--font-body)",
                    }}>?</div>
                  ))}
                </div>
              )}
            </div>
            <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
              {!revealed ? (
                <button
                  onClick={onReveal}
                  disabled={!puzzleReady}
                  style={{
                    border: "none", background: "var(--gold)", color: "var(--bg)",
                    padding: "10px 16px", fontFamily: "var(--font-body)", fontSize: "0.72rem",
                    fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase",
                    cursor: puzzleReady ? "pointer" : "not-allowed",
                    opacity: puzzleReady ? 1 : 0.5, borderRadius: 3, transition: "opacity 0.15s ease",
                  }}
                >
                  Reveal &amp; start
                </button>
              ) : (
                <Pill>
                  <span style={{ color: "var(--text-faint)", fontWeight: 700 }}>Length</span>
                  <span style={{ fontWeight: 700, color: "var(--text)" }}>{len}</span>
                </Pill>
              )}
            </div>
            {patternLoadError && (
              <div style={{ color: "#ef4444", fontSize: 13, fontWeight: 700, marginTop: 8, fontFamily: "var(--font-body)" }}>
                Failed to load puzzle. Please refresh.
              </div>
            )}
          </section>

          {/* Right */}
          <section className="boundright" style={{ borderTop: "1px solid var(--border)", paddingTop: 16 }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "flex-end", gap: 12 }}>
              <div style={{ fontSize: 13, color: "var(--text-faint)", fontWeight: 700, fontFamily: "var(--font-body)" }}>
                {locked ? "Locked" : submitted ? "Submitted" : "One try"}
              </div>
            </div>

            {submitted && scoreResult ? (
              <div style={{
                marginTop: 14, border: "1px solid var(--border-light)",
                background: "var(--bg2)", padding: 14, borderRadius: 4,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                  <div style={{
                    fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em",
                    color: "var(--text-faint)", textTransform: "uppercase", fontFamily: "var(--font-body)",
                  }}>
                    Your submission
                  </div>
                  {formatSubmittedAt(submittedAt) && (
                    <div style={{ fontSize: 12, color: "var(--text-faint)", fontWeight: 700, fontFamily: "var(--font-body)" }}>
                      {formatSubmittedAt(submittedAt)}
                    </div>
                  )}
                </div>
                <div style={{ marginTop: 10, display: "flex", justifyContent: "space-between", gap: 12 }}>
                  <div style={{ color: "var(--text-faint)", fontSize: 12, fontWeight: 700, fontFamily: "var(--font-body)" }}>Word</div>
                  <div style={{ flex: 1, textAlign: "right", fontWeight: 700, letterSpacing: "0.1em", color: "var(--text)", fontFamily: "var(--font-body)" }}>
                    {onlyLettersUpper(word)}
                  </div>
                </div>
                <div style={{ marginTop: 12, borderTop: "1px solid var(--border)", paddingTop: 12, display: "flex", flexDirection: "column", gap: 6 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ color: "var(--text-faint)", fontSize: 12, fontWeight: 700, fontFamily: "var(--font-body)" }}>Time</span>
                    <span style={{ fontWeight: 700, color: "var(--text)", fontFamily: "var(--font-body)" }}>{scoreResult.timeSec}s</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ color: "var(--text-faint)", fontSize: 12, fontWeight: 700, fontFamily: "var(--font-body)" }}>Tier</span>
                    <div
                      key={`result-${resultAnimKey}`}
                      className="pop"
                      style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 700, fontFamily: "var(--font-body)" }}
                    >
                      <span style={{ display: "inline-block", width: 12, height: 12, borderRadius: 2, background: TIER_COLOR[scoreResult.tierEmoji] }} />
                      <span style={{ color: "var(--text)" }}>{scoreResult.tierName}</span>
                    </div>
                  </div>
                  {percentile !== null && (
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ color: "var(--text-faint)", fontSize: 12, fontWeight: 700, fontFamily: "var(--font-body)" }}>Percentile</span>
                      <span style={{ fontWeight: 700, color: "var(--gold)", fontFamily: "var(--font-body)" }}>
                      {percentile}th percentile
                      </span>
                    </div>
                  )}
                  {percentile === null && submitted && (
                    <div style={{ fontSize: 12, color: "var(--text-faint)", fontFamily: "var(--font-body)" }}>
                      Percentile updates as more people play today.
                    </div>
                  )}
                </div>
              </div>
            ) : null}

            <div style={{ marginTop: 14, display: "flex", justifyContent: "flex-end", gap: 10, flexWrap: "wrap" }}>
              {!submitted ? (
                <button
                  onClick={onSubmit}
                  disabled={!canSubmit}
                  style={{
                    border: "none",
                    background: canSubmit ? "var(--gold)" : "var(--bg3)",
                    color: canSubmit ? "var(--bg)" : "var(--text-faint)",
                    padding: "10px 16px", fontFamily: "var(--font-body)", fontSize: "0.72rem",
                    fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase",
                    cursor: canSubmit ? "pointer" : "not-allowed",
                    opacity: canSubmit ? 1 : 0.5, borderRadius: 3, transition: "opacity 0.15s ease",
                  }}
                >
                  Submit
                </button>
              ) : (
                <button
                  onClick={onCopyShare}
                  style={{
                    border: "1px solid var(--border-light)", background: "var(--bg2)",
                    color: "var(--gold)", padding: "10px 16px", fontFamily: "var(--font-body)",
                    fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.12em",
                    textTransform: "uppercase", cursor: "pointer", borderRadius: 3,
                  }}
                >
                  Copy share
                </button>
              )}
            </div>

            {showShare && submitted && scoreResult ? (
              <div style={{ marginTop: 14, borderTop: "1px solid var(--border)", paddingTop: 14 }}>
                <div style={{
                  fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em",
                  color: "var(--text-faint)", textTransform: "uppercase", fontFamily: "var(--font-body)",
                }}>
                  Copied to clipboard
                </div>
                <pre style={{
                  marginTop: 10, whiteSpace: "pre-wrap", fontSize: 14, lineHeight: 1.6,
                  color: "var(--text)", border: "1px solid var(--border-light)",
                  background: "var(--bg3)", padding: 12, fontFamily: "var(--font-body)", borderRadius: 3,
                }}>
                  {buildShareText(puzzleNumber, scoreResult.timeSec, scoreResult.tierEmoji, percentile)}
                </pre>
              </div>
            ) : null}
          </section>

         {/* Leaderboard */}
         <section className="boundleaderboard" style={{ borderTop: "1px solid var(--border)", paddingTop: 16 }}>
            <div style={{
              fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em",
              color: "var(--gold)", textTransform: "uppercase", fontFamily: "var(--font-body)", marginBottom: 12,
            }}>
              Today's leaderboard
            </div>
            {leaderboard.length === 0 ? (
              <div style={{ fontSize: 13, color: "var(--text-faint)", fontFamily: "var(--font-body)" }}>
                No submissions yet — be the first!
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {leaderboard.map((entry, i) => (
                  <div key={entry.rank} style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "10px 14px",
                    background: entry.rank === 1 ? "var(--gold-dim)" : "var(--bg2)",
                    border: `1px solid ${entry.rank === 1 ? "var(--gold-line)" : "var(--border-light)"}`,
                    borderRadius: 4,
                    fontFamily: "var(--font-body)",
                  }}>
                    <span style={{
                      fontSize: 11, fontWeight: 700, minWidth: 20, textAlign: "center",
                      color: entry.rank === 1 ? "var(--gold)" : "var(--text-faint)",
                      fontFamily: "var(--font-body)",
                    }}>
                      #{entry.rank}
                    </span>
                    <span style={{
                      flex: 1, fontSize: 13, fontWeight: 700,
                      color: entry.rank === 1 ? "var(--text)" : "var(--text-dim)",
                    }}>
                      {entry.username}
                    </span>
                    <span style={{
                      fontSize: 13, fontWeight: 700,
                      color: entry.rank === 1 ? "var(--gold)" : "var(--text-faint)",
                    }}>
                      {entry.seconds}s
                    </span>
                    <span style={{
                      width: 10, height: 10, borderRadius: 2, flexShrink: 0,
                      background: TIER_COLOR[tierFromSeconds(entry.seconds)],
                      display: "inline-block",
                    }} />
                  </div>
                ))}
              </div>
            )}
            {!userId && (
              <div style={{ marginTop: 10, fontSize: 12, color: "var(--text-faint)", fontFamily: "var(--font-body)" }}>
                <a href="/signin" style={{ color: "var(--gold)" }}>Sign in</a> to appear on the leaderboard.
              </div>
            )}
          </section>

          {/* Legend */}
          <section className="boundlegend" style={{ borderTop: "1px solid var(--border)", paddingTop: 16 }}>
            <div style={{
              fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em",
              color: "var(--text-faint)", textTransform: "uppercase", fontFamily: "var(--font-body)",
            }}>
              Legend
            </div>
            <div style={{ marginTop: 10, display: "grid", gap: 8, fontSize: 14 }}>
              <LegendRow emoji="🟦" label="Instant" time="under 30s" />
              <LegendRow emoji="🟨" label="Fast" time="30–90s" />
              <LegendRow emoji="🟧" label="Moderate" time="90–180s" />
              <LegendRow emoji="🟥" label="Slow" time="180s+" />
            </div>
            <div style={{ marginTop: 12, color: "var(--text-faint)", fontSize: 13, lineHeight: 1.65, fontFamily: "var(--font-body)" }}>
              The faster you find a word,{" "}
              <strong style={{ color: "var(--text-dim)" }}>the better.</strong> No second chances.
            </div>
          </section>
        </div>

        <style jsx>{`
          .pop {
            animation: pop 220ms ease-out both;
          }
          @keyframes pop {
            0%   { transform: scale(0.97); opacity: 0.7; }
            60%  { transform: scale(1.02); opacity: 1;   }
            100% { transform: scale(1);    }
          }
          .boundlegend {
            grid-column: 1 / 2;
            margin-top: 18px;
          }
          @media (max-width: 980px) {
            .boundgrid { grid-template-columns: 1fr !important; }
            .boundright { order: 1; }
            .boundleft  { order: 0; }
            .boundleaderboard { order: 2; margin-top: 22px !important; }
            .boundlegend { order: 3; margin-top: 22px !important; }
          }
        `}</style>
      </main>
    </>
  );
}

function WordInput({
  value, onChange, disabled, error, pattern, autoFocusRef,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  disabled: boolean;
  error?: string | null;
  placeholder: string;
  pattern: string;
  autoFocusRef?: React.MutableRefObject<(() => void) | undefined>;
}) {
  const hiddenInputRef = useRef<HTMLInputElement | null>(null);
  const pc = (pattern || "").replace(/\s/g, "").toUpperCase();
  const totalLen = pc.length;
  const fixedAt = (i: number) => pc[i] !== "_";
  const freeIdxs: number[] = [];
  for (let i = 0; i < totalLen; i++) {
    if (!fixedAt(i)) freeIdxs.push(i);
  }

  useEffect(() => {
    if (autoFocusRef) {
      autoFocusRef.current = () => { hiddenInputRef.current?.focus(); };
    }
  });

  function handleHiddenKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (disabled) return;
    if (e.key === "Backspace") {
      e.preventDefault();
      const v = (value || "").padEnd(totalLen, " ");
      for (let i = freeIdxs.length - 1; i >= 0; i--) {
        const idx = freeIdxs[i];
        if (/[A-Z]/i.test(v[idx] ?? " ")) {
          const chars = Array.from({ length: totalLen }, (_, j) => {
            if (fixedAt(j)) return pc[j];
            if (j === idx) return " ";
            const existing = v[j] ?? " ";
            return /[A-Z]/i.test(existing) ? existing.toUpperCase() : " ";
          });
          onChange(chars.join(""));
          return;
        }
      }
      return;
    }
    if (e.key.length === 1 && /[a-zA-Z]/.test(e.key)) {
      e.preventDefault();
      const ch = e.key.toUpperCase();
      const v = (value || "").padEnd(totalLen, " ");
      for (let i = 0; i < freeIdxs.length; i++) {
        const idx = freeIdxs[i];
        if (!/[A-Z]/i.test(v[idx] ?? " ")) {
          const chars = Array.from({ length: totalLen }, (_, j) => {
            if (fixedAt(j)) return pc[j];
            if (j === idx) return ch;
            const existing = v[j] ?? " ";
            return /[A-Z]/i.test(existing) ? existing.toUpperCase() : " ";
          });
          onChange(chars.join(""));
          return;
        }
      }
      return;
    }
  }

  function getDisplay(): string[] {
    const d: string[] = [];
    for (let i = 0; i < totalLen; i++) {
      if (fixedAt(i)) {
        d.push(pc[i]);
      } else {
        const v = (value || "").padEnd(totalLen, " ");
        const ch = v[i] ?? " ";
        d.push(/[A-Z]/i.test(ch) ? ch.toUpperCase() : "");
      }
    }
    return d;
  }

  const display = getDisplay();
  const v = (value || "").padEnd(totalLen, " ");
  const hasError = !!error && freeIdxs.some(i => /[A-Z]/i.test(v[i] ?? " "));

  return (
    <div onClick={() => hiddenInputRef.current?.focus()} style={{ cursor: "text" }}>
      <input
        ref={hiddenInputRef}
        onKeyDown={handleHiddenKeyDown}
        onChange={() => {}}
        value=""
        style={{ position: "fixed", opacity: 0, pointerEvents: "none", width: 0, height: 0, top: 0, left: 0 }}
        inputMode="text"
        autoCapitalize="characters"
        autoCorrect="off"
        autoComplete="off"
      />
      <div style={{ display: "flex", gap: 8, flexWrap: totalLen > 10 ? "wrap" : "nowrap" }}>
        {Array.from({ length: totalLen }, (_, i) => {
          const fixed = fixedAt(i);
          const letter = display[i];
          const borderColor = hasError ? "#ef4444" : fixed ? "var(--border-light)" : "var(--gold)";
          return (
            <div key={i} style={{
              width: `min(46px, calc((100vw - 28px - ${(totalLen - 1) * 8}px) / ${totalLen}))`,
              height: `min(50px, calc((100vw - 28px - ${(totalLen - 1) * 8}px) / ${totalLen} * 1.09))`,
              border: `1.5px solid ${borderColor}`,
              background: fixed ? "var(--bg3)" : "var(--bg2)",
              color: fixed ? "var(--gold)" : "var(--text)",
              fontSize: `min(20px, calc((100vw - 28px - ${(totalLen - 1) * 8}px) / ${totalLen} * 0.43))`,
              fontWeight: 700, fontFamily: "var(--font-body)", textAlign: "center",
              textTransform: "uppercase", display: "flex", alignItems: "center",
              justifyContent: "center", userSelect: "none",
            }}>
              {letter}
            </div>
          );
        })}
      </div>
      <div style={{
        minHeight: 16, fontSize: 12, marginTop: 6,
        color: hasError ? "#ef4444" : "var(--text-faint)", fontFamily: "var(--font-body)",
      }}>
        {hasError ? error : " "}
      </div>
    </div>
  );
}

function LegendRow({ emoji, label, time }: { emoji: TierEmoji; label: string; time: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14 }}>
      <span style={{
        display: "inline-block", width: 14, height: 14, borderRadius: 3,
        background: TIER_COLOR[emoji], flexShrink: 0,
      }} />
      <span style={{ color: "var(--text)", fontWeight: 700, fontFamily: "var(--font-body)" }}>{label}</span>
      <span style={{ color: "var(--text-faint)", fontWeight: 700, fontFamily: "var(--font-body)" }}>
        — {time}
      </span>
    </div>
  );
}