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
    """
    Robustly extract ("WORD", float) pairs even if text is truncated JSON.
    """
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
    lines_with_any_pairs = 0
    lines_with_no_text = 0

    # diagnostics
    status_code_counts = {}
    incomplete_count = 0
    parseable_json_count = 0

    with BATCH_OUTPUT_JSONL.open("r", encoding="utf-8") as f:
        for line in f:
            lines += 1
            obj = json.loads(line)

            resp = obj.get("response") or {}
            status_code = resp.get("status_code")
            status_code_counts[status_code] = status_code_counts.get(status_code, 0) + 1

            body = resp.get("body") or {}
            if body.get("status") == "incomplete":
                incomplete_count += 1

            # Pull the assistant output text from the Responses API structure:
            # body.output[0].content[0].text
            text = None
            try:
                out = body.get("output") or []
                if out and isinstance(out, list):
                    content = out[0].get("content") or []
                    # sometimes multiple content items; join all output_text chunks
                    texts = []
                    for c in content:
                        if isinstance(c, dict) and c.get("type") == "output_text":
                            t = c.get("text")
                            if isinstance(t, str) and t.strip():
                                texts.append(t)
                    if texts:
                        text = "\n".join(texts)
            except Exception:
                text = None

            if not text:
                lines_with_no_text += 1
                continue

            # If it's fully valid JSON, great — but many will be truncated.
            # We still use regex extraction as the main path.
            try:
                _ = json.loads(text)
                parseable_json_count += 1
            except Exception:
                pass

            pairs = extract_pairs(text)
            pairs_total += len(pairs)
            if pairs:
                lines_with_any_pairs += 1

            for w, val in pairs:
                # sanity clamp
                if not (2.0 <= val <= 18.0):
                    continue
                if w not in merged:
                    merged[w] = val
                    pairs_kept += 1

    OUT_FULL.write_text(json.dumps(merged, sort_keys=True, separators=(",", ":")), encoding="utf-8")

    print("Lines:", lines)
    print("status_code counts:", status_code_counts)
    print("Responses marked incomplete:", incomplete_count)
    print("Output texts that were fully parseable JSON:", parseable_json_count)
    print("Lines with any extracted pairs:", lines_with_any_pairs)
    print("Lines with no output text:", lines_with_no_text)
    print("Pairs total extracted:", pairs_total)
    print("Pairs added (new keys only):", pairs_kept)
    print("Merged total entries:", len(merged))
    print("Wrote:", OUT_FULL)

if __name__ == "__main__":
    main()