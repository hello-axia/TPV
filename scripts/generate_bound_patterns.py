# scripts/generate_bound_patterns.py
import json
import os
import re
from collections import Counter
from datetime import datetime
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[1]
PUBLIC_DIR = PROJECT_ROOT / "public"

SUBTLEX_PATH = PUBLIC_DIR / "subtlex-us-zipf.json"          # validity wordlist (keys)
OUT_PATH = PUBLIC_DIR / "bound-patterns.json"

LEN_MIN = 5
LEN_MAX = 10

MIN_CANDIDATES = 60     # required-letter candidates
MIN_BONUS = 1           # at least this many candidates contain the bonus letter

A2Z = [chr(i) for i in range(ord("A"), ord("Z") + 1)]

def only_letters_upper(s: str) -> str:
    return re.sub(r"[^A-Za-z]", "", s or "").upper()

def load_wordlist_from_subtlex(path: Path) -> list[str]:
    data = json.loads(path.read_text())
    # keys are already uppercase words in your current pipeline, but we sanitize anyway
    words = []
    for k in data.keys():
        w = only_letters_upper(k)
        if w:
            words.append(w)
    return words

def main():
    if not SUBTLEX_PATH.exists():
        raise FileNotFoundError(f"Missing {SUBTLEX_PATH} (expected in /public)")

    words = load_wordlist_from_subtlex(SUBTLEX_PATH)

    # Filter: alpha-only + length window
    words = [w for w in words if w.isalpha() and LEN_MIN <= len(w) <= LEN_MAX]

    # Index words by (len, startLetter) and (len, endLetter)
    start_index: dict[tuple[int, str], list[str]] = {}
    end_index: dict[tuple[int, str], list[str]] = {}

    for w in words:
        L = len(w)
        start_index.setdefault((L, w[0]), []).append(w)
        end_index.setdefault((L, w[-1]), []).append(w)

    total_possible = 0
    kept = []

    # For stats
    candidate_counts_all = []
    candidate_counts_kept = []

    for L in range(LEN_MIN, LEN_MAX + 1):
        for side in ["start", "end"]:
            for bound in A2Z:
                base = start_index.get((L, bound), []) if side == "start" else end_index.get((L, bound), [])
                if not base:
                    # still counts as a possible pattern type even if empty
                    for required in A2Z:
                        total_possible += 1
                        candidate_counts_all.append(0)
                    continue

                # Precompute for speed: for each required letter, candidates list
                for required in A2Z:
                    total_possible += 1
                    candidates = [w for w in base if required in w]
                    ccount = len(candidates)
                    candidate_counts_all.append(ccount)

                    if ccount < MIN_CANDIDATES:
                        continue

                    # Choose a bonus letter that actually appears in candidates.
                    # We prefer a bonus letter != required so it’s not trivial.
                    # We also prefer a bonus letter that appears in the MOST candidates.
                    counter = Counter()
                    for w in candidates:
                        for ch in set(w):  # set to avoid double-counting repeats in one word
                            counter[ch] += 1

                    # Build ranked list of usable bonus letters
                    ranked = sorted(
                        [ch for ch in A2Z if ch != required],
                        key=lambda ch: counter.get(ch, 0),
                        reverse=True,
                    )

                    bonus = None
                    bonus_count = 0
                    for ch in ranked:
                        if counter.get(ch, 0) >= MIN_BONUS:
                            bonus = ch
                            bonus_count = counter.get(ch, 0)
                            break

                    if not bonus:
                        continue

                    kept.append({
                        "len": L,
                        "side": side,          # "start" or "end"
                        "bound": bound,        # fixed letter at that side
                        "required": required,  # must appear anywhere
                        "bonus": bonus,        # optional (+1 per word)
                        "candidates": ccount,
                        "bonusCandidates": bonus_count,
                    })
                    candidate_counts_kept.append(ccount)

    # Sort so output is stable (makes debugging easier)
    kept.sort(key=lambda x: (x["len"], x["side"], x["bound"], x["required"], x["bonus"]))

    OUT_PATH.write_text(json.dumps(kept, indent=2))
    print(f"Total possible pattern types (len {LEN_MIN}-{LEN_MAX}, side*bound*required): {total_possible}")

    if candidate_counts_all:
        candidate_counts_all_sorted = sorted(candidate_counts_all)
        mid = candidate_counts_all_sorted[len(candidate_counts_all_sorted) // 2]
        print(
            f"CandidateCount (all) — min={candidate_counts_all_sorted[0]}, "
            f"median={mid}, max={candidate_counts_all_sorted[-1]}"
        )

    if candidate_counts_kept:
        candidate_counts_kept_sorted = sorted(candidate_counts_kept)
        midk = candidate_counts_kept_sorted[len(candidate_counts_kept_sorted) // 2]
        print(f"Kept patterns (minCandidates={MIN_CANDIDATES}, minBonus={MIN_BONUS}): {len(kept)}")
        print(
            f"CandidateCount (kept) — min={candidate_counts_kept_sorted[0]}, "
            f"median={midk}, max={candidate_counts_kept_sorted[-1]}"
        )
    else:
        print("Kept patterns: 0 (try lowering MIN_CANDIDATES)")

    print(f"Wrote {len(kept)} patterns to {OUT_PATH}")


if __name__ == "__main__":
    main()