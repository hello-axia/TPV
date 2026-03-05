# scripts/count_bound_patterns.py
import json
from pathlib import Path
from collections import defaultdict
import math

# ----------------------------
# Paths
# ----------------------------
WORD_BANK_PATH = Path("public/wordbank.json")
AOA_PATH = Path("public/aoa_pred_full.json")        # ~121k AoA file (primary)
ZIPF_PATH = Path("public/subtlex-us-zipf.json")     # Zipf backup
OUT_PATTERNS = Path("public/bound-patterns.json")

# ----------------------------
# Length range
# ----------------------------
MIN_LEN = 5
MAX_LEN = 10

# ----------------------------
# Thresholds (tune these)
# Total candidate thresholds: (AoA OR Zipf) candidates
# ----------------------------
MIN_CANDIDATES_BOTH = {
    5: 20,
    6: 25,
    7: 20,
    8: 30,
    9: 40,
    10: 50,
}

MIN_CANDIDATES_ONE = {
    5: 55,
    6: 57,
    7: 50,
    8: 75,
    9: 100,
    10: 100,
}

# ----------------------------
# AoA-coverage thresholds (safety)
# We require at least this many AoA-known candidates per pattern so Bound.tsx
# can compute AoA-relative difficulty without failing.
# ----------------------------
MIN_AOA_CANDIDATES_BOTH = {
    5: 12,
    6: 14,
    7: 14,
    8: 16,
    9: 18,
    10: 20,
}

MIN_AOA_CANDIDATES_ONE = {
    5: 25,
    6: 30,
    7: 35,
    8: 40,
    9: 45,
    10: 50,
}

# ----------------------------
# Helpers (mirror TS behavior)
# ----------------------------
def only_letters_upper(s: str) -> str:
    return "".join([c for c in (s or "").upper() if c.isalpha()])


def candidate_forms(raw_word: str):
    W = only_letters_upper(raw_word)
    if not W:
        return []

    forms = []

    def add(x: str):
        k = only_letters_upper(x)
        if k and k not in forms:
            forms.append(k)

    add(W)

    # plurals / nouns
    if W.endswith("IES") and len(W) > 3:
        add(W[:-3] + "Y")
    if W.endswith("ES") and len(W) > 2:
        add(W[:-2])
    if W.endswith("S") and len(W) > 1:
        add(W[:-1])

    # -ING
    if W.endswith("ING") and len(W) > 4:
        stem = W[:-3]
        add(stem)
        if len(stem) > 1:
            add(stem[:-1])   # doubled consonant
        add(stem + "E")      # silent-e

    # -ED
    if W.endswith("ED") and len(W) > 3:
        stem = W[:-2]
        add(stem)
        if stem.endswith("I") and len(stem) > 1:
            add(stem[:-1] + "Y")
        if len(stem) > 1:
            add(stem[:-1])   # doubled consonant
        add(stem + "E")      # silent-e

    # -ER / -EST
    if W.endswith("ER") and len(W) > 3:
        stem = W[:-2]
        add(stem)
        if stem.endswith("I") and len(stem) > 1:
            add(stem[:-1] + "Y")
        add(stem + "E")

    if W.endswith("EST") and len(W) > 4:
        stem = W[:-3]
        add(stem)
        if stem.endswith("I") and len(stem) > 1:
            add(stem[:-1] + "Y")
        add(stem + "E")

    return forms


def aoa_for_word(aoa_map: dict, raw_word: str):
    # MIN AoA = simplest/earliest
    best = None
    for k in candidate_forms(raw_word):
        v = aoa_map.get(k)
        if v is None:
            continue
        try:
            vv = float(v)
        except Exception:
            continue
        if not math.isfinite(vv):
            continue
        if best is None or vv < best:
            best = vv
    return best


def zipf_for_word(zipf_map: dict, raw_word: str):
    # MAX Zipf = most common
    best = None
    for k in candidate_forms(raw_word):
        v = zipf_map.get(k)
        if v is None:
            continue
        try:
            vv = float(v)
        except Exception:
            continue
        if not math.isfinite(vv):
            continue
        if best is None or vv > best:
            best = vv
    return best


def percentile(sorted_vals, p):
    if not sorted_vals:
        return 0
    if p <= 0:
        return sorted_vals[0]
    if p >= 100:
        return sorted_vals[-1]
    k = (len(sorted_vals) - 1) * (p / 100)
    f = math.floor(k)
    c = math.ceil(k)
    if f == c:
        return sorted_vals[int(k)]
    return sorted_vals[f] + (sorted_vals[c] - sorted_vals[f]) * (k - f)


# ----------------------------
# Main
# ----------------------------
def main():
    if not WORD_BANK_PATH.exists():
        raise SystemExit(f"Missing {WORD_BANK_PATH}")
    if not AOA_PATH.exists():
        raise SystemExit(f"Missing {AOA_PATH}")
    if not ZIPF_PATH.exists():
        raise SystemExit(f"Missing {ZIPF_PATH}")

    wordbank_raw = json.loads(WORD_BANK_PATH.read_text(encoding="utf-8"))
    aoa_raw = json.loads(AOA_PATH.read_text(encoding="utf-8"))
    zipf_raw = json.loads(ZIPF_PATH.read_text(encoding="utf-8"))

    # Normalize AoA + Zipf maps
    aoa_map = {}
    for k, v in aoa_raw.items():
        kk = only_letters_upper(k)
        if not kk:
            continue
        try:
            vv = float(v)
        except Exception:
            continue
        if math.isfinite(vv):
            aoa_map[kk] = vv

    zipf_map = {}
    for k, v in zipf_raw.items():
        kk = only_letters_upper(k)
        if not kk:
            continue
        try:
            vv = float(v)
        except Exception:
            continue
        if math.isfinite(vv):
            zipf_map[kk] = vv

    # Build usable word list:
    # Keep if AoA exists OR Zipf exists (Zipf is backup for playability)
    usable_by_len_total = defaultdict(int)
    usable_by_len_aoa = defaultdict(int)

    # Dedup + preserve has_aoa=True if any entry has it
    dedup_has_aoa = {}

    for k in wordbank_raw.keys():
        w = only_letters_upper(k)
        if not w:
            continue

        L = len(w)
        if L < MIN_LEN or L > MAX_LEN:
            continue

        a = aoa_for_word(aoa_map, w)
        z = zipf_for_word(zipf_map, w)

        if a is None and z is None:
            continue

        has_aoa = a is not None
        prev = dedup_has_aoa.get(w, False)
        dedup_has_aoa[w] = prev or has_aoa

    usable_words = sorted(dedup_has_aoa.items())  # list[(word, has_aoa)]

    # Count length distribution
    for w, has_aoa in usable_words:
        L = len(w)
        usable_by_len_total[L] += 1
        if has_aoa:
            usable_by_len_aoa[L] += 1

    print(f"Usable words (len {MIN_LEN}-{MAX_LEN}) with AoA OR Zipf: {len(usable_words)}")
    print("Usable words by length (total / aoa):")
    for L in range(MIN_LEN, MAX_LEN + 1):
        print(f"  {L}: {usable_by_len_total[L]} / {usable_by_len_aoa[L]}")

    # Buckets: track total count + aoa-only count
    both_total = {L: [[0] * 26 for _ in range(26)] for L in range(MIN_LEN, MAX_LEN + 1)}
    both_aoa = {L: [[0] * 26 for _ in range(26)] for L in range(MIN_LEN, MAX_LEN + 1)}

    start_total = {L: [0] * 26 for L in range(MIN_LEN, MAX_LEN + 1)}
    start_aoa = {L: [0] * 26 for L in range(MIN_LEN, MAX_LEN + 1)}

    end_total = {L: [0] * 26 for L in range(MIN_LEN, MAX_LEN + 1)}
    end_aoa = {L: [0] * 26 for L in range(MIN_LEN, MAX_LEN + 1)}

    def idx(c: str) -> int:
        return ord(c) - ord("A")

    for w, has_aoa in usable_words:
        L = len(w)
        si = idx(w[0])
        ei = idx(w[-1])

        both_total[L][si][ei] += 1
        start_total[L][si] += 1
        end_total[L][ei] += 1

        if has_aoa:
            both_aoa[L][si][ei] += 1
            start_aoa[L][si] += 1
            end_aoa[L][ei] += 1

    patterns_out = []
    total_valid = 0

    print("\nPattern coverage by length:")
    for L in range(MIN_LEN, MAX_LEN + 1):
        both_min = MIN_CANDIDATES_BOTH.get(L, 0)
        both_aoa_min = MIN_AOA_CANDIDATES_BOTH.get(L, 0)

        one_min = MIN_CANDIDATES_ONE.get(L, 0)
        one_aoa_min = MIN_AOA_CANDIDATES_ONE.get(L, 0)

        # BOTH stats
        both_counts = []
        both_nonzero = 0
        both_valid = 0

        for si in range(26):
            for ei in range(26):
                cT = both_total[L][si][ei]
                cA = both_aoa[L][si][ei]

                if cT > 0:
                    both_nonzero += 1
                    both_counts.append(cT)

                if both_min > 0 and cT >= both_min and cA >= both_aoa_min:
                    both_valid += 1
                    patterns_out.append(
                        {
                            "len": L,
                            "kind": "both",
                            "start": chr(ord("A") + si),
                            "end": chr(ord("A") + ei),
                            "count": cT,
                            "aoa_count": cA,
                        }
                    )

        both_counts_sorted = sorted(both_counts)
        both_median = percentile(both_counts_sorted, 50)
        both_p90 = percentile(both_counts_sorted, 90)
        both_max = both_counts_sorted[-1] if both_counts_sorted else 0

        # ONE-bound stats (start + end)
        one_counts = []
        one_nonzero = 0
        one_valid = 0

        # start-only
        for si in range(26):
            cT = start_total[L][si]
            cA = start_aoa[L][si]

            if cT > 0:
                one_nonzero += 1
                one_counts.append(cT)

            if one_min > 0 and cT >= one_min and cA >= one_aoa_min:
                one_valid += 1
                patterns_out.append(
                    {
                        "len": L,
                        "kind": "start",
                        "start": chr(ord("A") + si),
                        "count": cT,
                        "aoa_count": cA,
                    }
                )

        # end-only
        for ei in range(26):
            cT = end_total[L][ei]
            cA = end_aoa[L][ei]

            if cT > 0:
                one_nonzero += 1
                one_counts.append(cT)

            if one_min > 0 and cT >= one_min and cA >= one_aoa_min:
                one_valid += 1
                patterns_out.append(
                    {
                        "len": L,
                        "kind": "end",
                        "end": chr(ord("A") + ei),
                        "count": cT,
                        "aoa_count": cA,
                    }
                )

        one_counts_sorted = sorted(one_counts)
        one_median = percentile(one_counts_sorted, 50)
        one_p90 = percentile(one_counts_sorted, 90)
        one_max = one_counts_sorted[-1] if one_counts_sorted else 0

        total_valid_L = both_valid + one_valid
        total_valid += total_valid_L

        print(
            f"  L={L}: "
            f"both nonzero={both_nonzero}/676 | both valid(>={both_min}, aoa>={both_aoa_min})={both_valid} "
            f"| both median={both_median:.0f} p90={both_p90:.0f} max={both_max}  ||  "
            f"one nonzero={one_nonzero}/52 | one valid(>={one_min}, aoa>={one_aoa_min})={one_valid} "
            f"| one median={one_median:.0f} p90={one_p90:.0f} max={one_max}"
        )

    # stable output for clean diffs
    patterns_out.sort(key=lambda x: (x["len"], x["kind"], x.get("start", ""), x.get("end", "")))

    OUT_PATTERNS.write_text(json.dumps(patterns_out, indent=2), encoding="utf-8")

    print("\nThresholds used:")
    for L in range(MIN_LEN, MAX_LEN + 1):
        print(
            f"  L={L}: "
            f"both>={MIN_CANDIDATES_BOTH.get(L,0)} + aoa>={MIN_AOA_CANDIDATES_BOTH.get(L,0)} | "
            f"one>={MIN_CANDIDATES_ONE.get(L,0)} + aoa>={MIN_AOA_CANDIDATES_ONE.get(L,0)}"
        )

    print(f"\nTOTAL valid patterns written: {total_valid}")
    print(f"Wrote: {OUT_PATTERNS}")
    print("\nNext: use these entries in your bound-patterns.json fetch.")


if __name__ == "__main__":
    main()