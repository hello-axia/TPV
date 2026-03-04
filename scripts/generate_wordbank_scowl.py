import json
import re
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[1]
PUBLIC_DIR = PROJECT_ROOT / "public"

SCOWL_FILE = PROJECT_ROOT / "data" / "wordlist.txt"
OUT_PATH = PUBLIC_DIR / "wordbank.json"

LEN_MIN = 5
LEN_MAX = 12

# If True, drop very short / super common “function words” etc (optional)
DROP_ALLCAPS_ABBREV = True

alpha_re = re.compile(r"^[A-Za-z]+$")

def normalize(w: str) -> str:
    return w.strip()

def main():
    if not SCOWL_FILE.exists():
        raise FileNotFoundError(f"Missing SCOWL file: {SCOWL_FILE}")

    words = set()

    with SCOWL_FILE.open("r", encoding="utf-8", errors="ignore") as f:
        for line in f:
            w = normalize(line)
            if not w:
                continue

            # reject apostrophes/hyphens, etc
            if not alpha_re.match(w):
                continue

            # SCOWL includes capitalization variants; we standardize to UPPER
            W = w.upper()

            # optional: drop weird all-caps abbreviations (rare in SCOWL, but safe)
            if DROP_ALLCAPS_ABBREV and w.isupper() and len(w) <= 6:
                continue

            L = len(W)
            if LEN_MIN <= L <= LEN_MAX:
                words.add(W)

    # Output as map for ultra-fast membership tests
    out = {w: 1 for w in sorted(words)}
    OUT_PATH.write_text(json.dumps(out))
    print(f"Wrote {len(out)} words -> {OUT_PATH}")

if __name__ == "__main__":
    main()