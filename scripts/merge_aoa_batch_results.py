import json
from pathlib import Path

AOA_KNOWN_PATH = Path("public/aoa_pred.json")
BATCH_OUTPUT_JSONL = Path("tmp/aoa_missing_results.jsonl")  # downloaded batch output
OUT_FULL = Path("public/aoa_full.json")

def only_letters_upper(s: str) -> str:
    return "".join([c for c in (s or "").upper() if c.isalpha()])

def extract_mapping(obj: dict) -> dict:
    """
    Returns {WORD: aoa_float} from one batch output line.
    For Responses API batch output, the model JSON string is at:
      obj["response"]["body"]["output"][0]["content"][0]["text"]
    """
    resp = obj.get("response") or {}
    if resp.get("status_code") != 200:
        return {}

    body = resp.get("body") or {}
    try:
        text = body["output"][0]["content"][0]["text"]
    except Exception:
        return {}

    try:
        data = json.loads(text)
    except Exception:
        return {}

    if not isinstance(data, dict):
        return {}

    out = {}
    for k, v in data.items():
        w = only_letters_upper(k)
        if not w:
            continue
        try:
            val = float(v)
        except Exception:
            continue
        out[w] = val
    return out

def main():
    base = json.loads(AOA_KNOWN_PATH.read_text())
    merged = {}
    for k, v in base.items():
        kk = only_letters_upper(k)
        if not kk:
            continue
        try:
            merged[kk] = float(v)
        except Exception:
            pass

    added = 0
    overwritten = 0
    bad_lines = 0
    total_pairs = 0
    kept_pairs = 0

    with BATCH_OUTPUT_JSONL.open("r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue

            try:
                obj = json.loads(line)
            except Exception:
                bad_lines += 1
                continue

            mapping = extract_mapping(obj)
            if not mapping:
                bad_lines += 1
                continue

            # validate + merge
            for w, val in mapping.items():
                total_pairs += 1

                # sanity range: keep it wide but avoid total garbage
                if not (2.0 <= val <= 18.0):
                    continue

                kept_pairs += 1
                if w in merged:
                    # count overwrite only if value actually changes meaningfully
                    if merged[w] != val:
                        overwritten += 1
                    merged[w] = val
                else:
                    merged[w] = val
                    added += 1

    OUT_FULL.write_text(json.dumps(merged, indent=0, sort_keys=True))
    print(f"Merged AoA size: {len(merged)}")
    print(f"Added: {added} | Overwritten: {overwritten}")
    print(f"Bad lines: {bad_lines}")
    print(f"Pairs total: {total_pairs} | kept (in range): {kept_pairs}")
    print(f"Wrote: {OUT_FULL}")

if __name__ == "__main__":
    main()