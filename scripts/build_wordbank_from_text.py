import json
import re
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[1]
PUBLIC_DIR = PROJECT_ROOT / "public"

RAW_PATH = PROJECT_ROOT / "data" / "scowl_words_raw.txt"
OUT_PATH = PUBLIC_DIR / "wordbank.json"

LEN_MIN = 5
LEN_MAX = 12

token_re = re.compile(r"[A-Za-z]+")

def main():
    if not RAW_PATH.exists():
        raise FileNotFoundError(
            f"Missing raw wordlist: {RAW_PATH}"
        )

    words = set()

    for line in RAW_PATH.read_text(encoding="utf-8", errors="ignore").splitlines():
        for tok in token_re.findall(line):
            w = tok.upper()
            if LEN_MIN <= len(w) <= LEN_MAX:
                words.add(w)

    out = {w: 1 for w in sorted(words)}
    OUT_PATH.write_text(json.dumps(out))
    print(f"Wrote {len(out)} words -> {OUT_PATH}")

if __name__ == "__main__":
    main()