import json
import math
import re
from pathlib import Path

import pandas as pd

SRC_XLSX = Path("data/aoa.xlsx")
SRC_CSV = Path("data/aoa.csv")
OUT_JSON = Path("public/bound-difficulty.json")

WORD_COL = "Word"
AOA_COL = "AoA_Kup_lem"   # age of acquisition (years)
LEN_COL = "Nletters"

MIN_LEN = 4
MAX_LEN = 10

# AoA thresholds (years)
# <= 8.5  => 1 (Elementary)
# <= 11.5 => 2 (Middle)
# <= 14.5 => 3 (High school)
# else    => 4 (University+)
def points_from_aoa(aoa: float) -> int:
    if aoa <= 8.5:
        return 1
    if aoa <= 11.5:
        return 2
    if aoa <= 14.5:
        return 3
    return 4

def load_df() -> pd.DataFrame:
    if SRC_XLSX.exists():
        return pd.read_excel(SRC_XLSX)
    if SRC_CSV.exists():
        return pd.read_csv(SRC_CSV)
    raise SystemExit("Put AoA file at data/aoa.xlsx or data/aoa.csv")

def clean_word(w: str) -> str:
    w = str(w or "").strip()
    # keep letters only; discard hyphens/apostrophes/etc for now
    if not re.fullmatch(r"[A-Za-z]+", w):
        return ""
    return w.upper()

def main():
    df = load_df()

    needed = {WORD_COL, AOA_COL, LEN_COL}
    missing_cols = needed - set(df.columns)
    if missing_cols:
        raise SystemExit(f"Missing columns: {missing_cols}")

    out: dict[str, int] = {}

    for _, row in df.iterrows():
        raw_word = row[WORD_COL]
        word = clean_word(raw_word)
        if not word:
            continue

        nletters = row[LEN_COL]
        if pd.isna(nletters):
            continue
        try:
            nletters = int(nletters)
        except Exception:
            continue

        if nletters < MIN_LEN or nletters > MAX_LEN:
            continue

        aoa = row[AOA_COL]
        if pd.isna(aoa):
            continue
        try:
            aoa = float(aoa)
        except Exception:
            continue
        if math.isnan(aoa):
            continue

        pts = points_from_aoa(aoa)

        # If duplicates appear, keep the "harder" value (higher points)
        if word in out:
            out[word] = max(out[word], pts)
        else:
            out[word] = pts

    OUT_JSON.parent.mkdir(parents=True, exist_ok=True)
    OUT_JSON.write_text(json.dumps(out, ensure_ascii=False), encoding="utf-8")

    print(f"Wrote {len(out):,} entries to {OUT_JSON}")

if __name__ == "__main__":
    main()