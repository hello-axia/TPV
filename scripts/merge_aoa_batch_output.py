import json
import re
from pathlib import Path

AOA_KNOWN_PATH = Path("public/aoa_pred.json")
BATCH_OUTPUT_JSONL = Path("tmp/aoa_missing_results.jsonl")
OUT_FULL = Path("public/aoa_pred_full.json")

PAIR_RE = re.compile(r'"([A-Za-z]+)"\s*:\s*(-?\d+(?:\.\d+)?)')

def only_letters_upper(s: str) -> str:
    return "".join([c for c in s.upper() if c.isalpha()])

def extract_pairs(text: str):
    out = []
    for w, v in PAIR_RE.findall(text or ""):
        ww = only_letters_upper(w)
        if not ww:
            continue
        try:
            val = float(v)
        except Exception:
            continue
        out.append((ww, val))
    return out

def main():
    base = json.loads(AOA_KNOWN_PATH.read_text(encoding="utf-8"))
    merged = {only_letters_upper(k): float(v) for k, v in base.items() if only_letters_upper(k)}

    lines = 0
    pairs_total = 0
    pairs_kept = 0

    with BATCH_OUTPUT_JSONL.open("r", encoding="utf-8") as f:
        for line in f:
            lines += 1
            obj = json.loads(line)

            body = obj["response"]["body"]

            try:
                text = body["output"][0]["content"][0]["text"]
            except Exception:
                continue

            pairs = extract_pairs(text)
            pairs_total += len(pairs)

            for w, val in pairs:
                if 2.0 <= val <= 18.0:
                    if w not in merged:
                        merged[w] = val
                        pairs_kept += 1

    OUT_FULL.write_text(json.dumps(merged, sort_keys=True))
    print("Lines:", lines)
    print("Pairs extracted:", pairs_total)
    print("Pairs added:", pairs_kept)
    print("Merged size:", len(merged))
    print("Wrote:", OUT_FULL)

if __name__ == "__main__":
    main()