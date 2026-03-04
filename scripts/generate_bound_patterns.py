# scripts/generate_bound_patterns.py
import json
import re
from collections import defaultdict
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[1]
PUBLIC_DIR = PROJECT_ROOT / "public"

# ✅ Use your actual playable list (same thing the game validates against)
WORDBANK_PATH = PUBLIC_DIR / "wordbank.json"
OUT_PATH = PUBLIC_DIR / "bound-patterns.json"

# Match your game constraints
LEN_MIN = 5
LEN_MAX = 12

def only_letters_upper(s: str) -> str:
    return re.sub(r"[^A-Za-z]", "", s or "").upper()

def load_wordbank_keys(path: Path) -> list[str]:
    """
    Supports any JSON object shaped like:
      { "WORD": 1, ... } or { "WORD": true, ... } or { "WORD": {...}, ... }
    We just take keys as the playable words.
    """
    data = json.loads(path.read_text())
    if not isinstance(data, dict):
        raise ValueError("wordbank.json must be a JSON object whose keys are words.")
    out: list[str] = []
    for k in data.keys():
        w = only_letters_upper(k)
        if w:
            out.append(w)
    return out

# Per-length fairness thresholds (longer words naturally have fewer candidates)
MIN_BY_LEN = {
    5: 40,
    6: 35,
    7: 30,
    8: 20,
    9: 14,
    10: 10,
    11: 7,
    12: 5,
}

def main() -> None:
    if not WORDBANK_PATH.exists():
        raise FileNotFoundError(f"Missing {WORDBANK_PATH} (expected in /public)")

    words = load_wordbank_keys(WORDBANK_PATH)

    # Filter to alpha-only + length window
    words = [w for w in words if w.isalpha() and LEN_MIN <= len(w) <= LEN_MAX]

    # Count candidates for each (len, start, end)
    counts: dict[tuple[int, str, str], int] = defaultdict(int)
    for w in words:
        counts[(len(w), w[0], w[-1])] += 1

    # Keep patterns that meet candidate threshold (by length)
    kept: list[dict] = []
    for (L, start, end), c in counts.items():
        min_needed = MIN_BY_LEN.get(L, 10)
        if c < min_needed:
            continue
        kept.append({"len": L, "start": start, "end": end, "count": c})

    kept.sort(key=lambda x: (x["len"], x["start"], x["end"]))
    import random
    random.shuffle(kept)
    OUT_PATH.write_text(json.dumps(kept, indent=2))

    # ✅ diagnostics (INSIDE main)
    print(f"Wrote {len(kept)} patterns to {OUT_PATH}")
    print("Total combos seen:", len(counts))
    print("Kept patterns:", len(kept))
    if kept:
        minc = min(x["count"] for x in kept)
        maxc = max(x["count"] for x in kept)
        print("Candidate counts range:", minc, "to", maxc)
        print(f"LEN {LEN_MIN}-{LEN_MAX} | MIN_BY_LEN={MIN_BY_LEN}")

if __name__ == "__main__":
    main()