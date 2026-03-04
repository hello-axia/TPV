import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

type SubmitBody = {
  puzzleId: number;
  word: string;
  seconds: number; // elapsed seconds (integer)
  length: number;
  first: string;
  last: string;
};

function onlyLettersUpper(s: string) {
  return (s || "").replace(/[^a-zA-Z]/g, "").toUpperCase();
}

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

function multiplier(seconds: number) {
  const t = Math.max(0, seconds);
  return 1 + 0.8 * Math.exp(-0.07 * t);
}

// Per-puzzle tier labels based on percentile
function tierFromPercentile(p: number) {
  // p in [0,1]
  const pct = p * 100;
  if (pct < 35) return "Common";
  if (pct < 50) return "Uncommon";
  if (pct < 80) return "Rare";
  return "Advanced";
}

// Load wordbank once (server memory). Works fine on Node runtime.
// If you deploy serverless, this still caches per warm instance.
let WORDSET: Set<string> | null = null;
function getWordset(): Set<string> {
  if (WORDSET) return WORDSET;
  const fp = path.join(process.cwd(), "public", "wordbank.json");
  const raw = fs.readFileSync(fp, "utf-8");
  const obj = JSON.parse(raw) as Record<string, number>;
  WORDSET = new Set(Object.keys(obj));
  return WORDSET;
}

// Load AoA predictions (optional)
let AOA: Record<string, number> | null = null;
function getAoA(): Record<string, number> {
  if (AOA) return AOA;
  const fp = path.join(process.cwd(), "public", "aoa_pred.json");
  const raw = fs.readFileSync(fp, "utf-8");
  AOA = JSON.parse(raw) as Record<string, number>;
  return AOA!;
}

// Convert AoA to base points (you can tune this later)
function basePointsFromAoA(aoaYears: number) {
  // Example mapping into {10,20,30,40} feel:
  // earlier learned => easier => fewer points
  // later learned => harder => more points
  // Tune thresholds later; this is a sane starting point.
  if (aoaYears <= 7.0) return 10;     // elementary-ish
  if (aoaYears <= 10.0) return 20;    // middle
  if (aoaYears <= 13.0) return 30;    // high school
  return 40;                          // college+
}

// Compute percentile from counts + bin.
// Uses your smoothing: below + 0.5*count(bin)
function percentileFromHistogram(counts: number[], bin: number) {
  const total = counts.reduce((a, b) => a + b, 0);
  if (total <= 0) return 0;

  let below = 0;
  for (let i = 0; i < bin; i++) below += counts[i] || 0;

  const inBin = counts[bin] || 0;
  below += 0.5 * inBin;

  return clamp(below / total, 0, 1);
}

// Supabase admin
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const body = req.body as SubmitBody;
  const puzzleId = Number(body.puzzleId);
  const seconds = clamp(Math.floor(Number(body.seconds)), 0, 60 * 60); // allow long but bounded
  const length = Number(body.length);

  const word = onlyLettersUpper(body.word);
  const first = onlyLettersUpper(body.first).slice(0, 1);
  const last = onlyLettersUpper(body.last).slice(0, 1);

  if (!puzzleId || !word || !first || !last || !length) {
    return res.status(400).json({ error: "Missing fields" });
  }

  // 1) Validate constraints
  if (word.length !== length) {
    return res.status(400).json({ error: "Wrong length" });
  }
  if (word[0] !== first || word[word.length - 1] !== last) {
    return res.status(400).json({ error: "Doesn’t match bounds" });
  }

  // 2) Validate dictionary
  const wordset = getWordset();
  if (!wordset.has(word)) {
    return res.status(400).json({ error: "Not a valid word" });
  }

  // 3) Score
  const aoa = getAoA();
  const aoaYears = aoa[word];
  // If missing, treat as harder-but-not-insane (tune later)
  const base = basePointsFromAoA(typeof aoaYears === "number" ? aoaYears : 13.0);

  const mult = multiplier(seconds);
  const rawScore = Math.round(base * mult);
  const score = clamp(rawScore, 0, 9999);

  const bin = Math.floor(score / 5);

  // 4) Fetch stats row (or create)
  const { data: statsRow, error: statsErr } = await supabaseAdmin
    .from("bound_puzzle_stats")
    .select("puzzle_id,total,counts")
    .eq("puzzle_id", puzzleId)
    .maybeSingle();

  if (statsErr) return res.status(500).json({ error: "Stats read failed" });

  let counts: number[] = [];
  let total = 0;

  if (statsRow) {
    total = statsRow.total ?? 0;
    counts = Array.isArray(statsRow.counts) ? (statsRow.counts as number[]) : [];
  } else {
    // create empty
    const ins = await supabaseAdmin
      .from("bound_puzzle_stats")
      .insert({ puzzle_id: puzzleId, total: 0, counts: [] })
      .select("puzzle_id,total,counts")
      .single();

    if (ins.error) return res.status(500).json({ error: "Stats init failed" });
    total = ins.data.total ?? 0;
    counts = Array.isArray(ins.data.counts) ? (ins.data.counts as number[]) : [];
  }

  // ensure counts length
  while (counts.length <= bin) counts.push(0);

  // percentile BEFORE increment (so you compare against prior players)
  const percentile = percentileFromHistogram(counts, bin);

  // update histogram
  counts[bin] = (counts[bin] || 0) + 1;
  total += 1;

  // 5) Write stats + submission (best effort)
  // NOTE: This is not perfectly atomic without an RPC/transaction.
  // It’s “good enough” for early gameplay. If you want zero race conditions,
  // we’ll switch to a Postgres RPC that increments counts server-side.
  const up = await supabaseAdmin
    .from("bound_puzzle_stats")
    .upsert({ puzzle_id: puzzleId, total, counts, updated_at: new Date().toISOString() });

  if (up.error) return res.status(500).json({ error: "Stats update failed" });

  // Optional audit log
  await supabaseAdmin.from("bound_submissions").insert({
    puzzle_id: puzzleId,
    word,
    score,
    seconds,
  });

  const tier = tierFromPercentile(percentile);

  return res.status(200).json({
    ok: true,
    score,
    base,
    seconds,
    multiplier: Number(mult.toFixed(4)),
    bin,
    percentile, // 0..1
    tier,
  });
}