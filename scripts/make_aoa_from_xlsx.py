import json
import pandas as pd
from pathlib import Path

XLSX_PATH = Path("AoA_51715_words.xlsx")  # put the xlsx in repo root OR change this path
OUT_PATH = Path("public/aoa_pred.json")   # overwrite what the site loads

# Choose which AoA column you want to use:
AOA_COL = "AoA_Kup_lem"   # best default
WORD_COL = "Word"

df = pd.read_excel(XLSX_PATH)

keep = df[[WORD_COL, AOA_COL]].dropna()

aoa_map = {}
for _, row in keep.iterrows():
    w = str(row[WORD_COL]).strip().upper()
    try:
        v = float(row[AOA_COL])
    except:
        continue
    if not w:
        continue
    aoa_map[w] = v

OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
OUT_PATH.write_text(json.dumps(aoa_map, ensure_ascii=False), encoding="utf-8")

print("Wrote", len(aoa_map), "AoA entries to", OUT_PATH)
print("DOG =", aoa_map.get("DOG"))
print("INSECT =", aoa_map.get("INSECT"))