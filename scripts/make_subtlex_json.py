import json
import re
from pathlib import Path

import pandas as pd

# -------- CONFIG --------
INPUT_PATH = Path("data/subtlex-us.xlsx")         # your file path
OUTPUT_PATH = Path("public/subtlex-us-zipf.json") # must match what your app fetches
MIN_LEN = 4
MAX_LEN = 10

WORD_COL = "Word"
FREQ_COL = "Lg10WF"  # using SUBTLEX's log10 frequency column as our "rarity score"

ALPHA_RE = re.compile(r"^[A-Za-z]+$")


def main():
    if not INPUT_PATH.exists():
        raise FileNotFoundError(f"Missing input file: {INPUT_PATH}")

    # Let pandas auto-pick engine; works for your current file with xlrd installed
    df = pd.read_excel(INPUT_PATH)

    if WORD_COL not in df.columns:
        raise RuntimeError(f"Missing column '{WORD_COL}'. Found: {list(df.columns)}")
    if FREQ_COL not in df.columns:
        raise RuntimeError(f"Missing column '{FREQ_COL}'. Found: {list(df.columns)}")

    out = {}

    # Keep only relevant columns; drop missing values
    for _, row in df[[WORD_COL, FREQ_COL]].dropna().iterrows():
        w = str(row[WORD_COL]).strip()
        if not ALPHA_RE.match(w):
            continue

        w = w.upper()
        if not (MIN_LEN <= len(w) <= MAX_LEN):
            continue

        try:
            score = float(row[FREQ_COL])
        except Exception:
            continue

        out[w] = score

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    with OUTPUT_PATH.open("w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, separators=(",", ":"))

    print(f"Wrote {len(out):,} entries to {OUTPUT_PATH}")


if __name__ == "__main__":
    main()