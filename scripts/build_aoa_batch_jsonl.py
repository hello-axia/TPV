import json
from pathlib import Path

WORD_BANK_PATH = Path("public/wordbank.json")
AOA_KNOWN_PATH = Path("public/aoa_pred.json")
OUT_JSONL = Path("tmp/aoa_missing_requests.jsonl")

BATCH_SIZE = 25  # words per request

SYSTEM = (
    "You estimate Age of Acquisition (AoA) in YEARS for English words.\n"
    "Return ONE valid JSON OBJECT that maps each input word to a number (float).\n"
    "Typical AoA range is 3.0–13.0.\n"
    "No markdown. No extra keys. No commentary. JSON only."
)

def chunks(lst, n):
    for i in range(0, len(lst), n):
        yield lst[i:i + n]

def only_letters_upper(s: str) -> str:
    return "".join([c for c in (s or "").upper() if c.isalpha()])

def main():
    wordbank = json.loads(WORD_BANK_PATH.read_text(encoding="utf-8"))
    aoa_known = json.loads(AOA_KNOWN_PATH.read_text(encoding="utf-8"))

    allowed = sorted({only_letters_upper(w) for w in wordbank.keys() if only_letters_upper(w)})
    known = {only_letters_upper(k) for k in aoa_known.keys() if only_letters_upper(k)}

    missing_words = [w for w in allowed if w not in known]
    print("Missing words:", len(missing_words))

    OUT_JSONL.parent.mkdir(parents=True, exist_ok=True)

    idx = 0
    with OUT_JSONL.open("w", encoding="utf-8") as f:
        for idx, group in enumerate(chunks(missing_words, BATCH_SIZE), start=1):

            body = {
                "model": "gpt-4.1-mini",
                "temperature": 0,
                # keep output tight; 100 words => JSON ~ 1–2KB
                "max_output_tokens": 650,
                "input": [
                    {"role": "system", "content": SYSTEM},
                    {"role": "user", "content": json.dumps({"words": group})},
                ],
                # ✅ IMPORTANT: Responses API uses text.format (not response_format)
                # ✅ And type must be json_object / text / json_schema
                "text": {
                    "format": {"type": "json_object"}
                },
            }

            line = {
                "custom_id": f"aoa_{idx:06d}",
                "method": "POST",
                "url": "/v1/responses",
                "body": body,
            }

            f.write(json.dumps(line) + "\n")

    print("Requests written:", idx)
    print("Output file:", OUT_JSONL)

if __name__ == "__main__":
    main()