#!/usr/bin/env python3
import sqlite3
import json
import random
import re
from collections import defaultdict
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[1]
DB_PATH = PROJECT_ROOT / "data/scowl/scowl.db"
OUTPUT_PATH = PROJECT_ROOT / "public/bound-patterns.json"
MIN_WORD_LENGTH = 5
MAX_WORD_LENGTH = 8
MIN_VALID_WORDS = 20

def load_words():
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("SELECT DISTINCT word FROM words")
    rows = cur.fetchall()
    conn.close()
    words = set()
    for (w,) in rows:
        w = w.strip()
        if not re.match(r'^[a-zA-Z]+$', w):
            continue
        if w[0].isupper() and w[1:].islower():
            continue
        w = w.upper()
        if MIN_WORD_LENGTH <= len(w) <= MAX_WORD_LENGTH:
            words.add(w)
    print(f"Loaded {len(words)} valid words (5-8 letters, alpha only)")
    return sorted(words)

def build_pattern_key(pattern):
    return "".join(c if c is not None else "_" for c in pattern)

def generate_patterns(words):
    by_length = defaultdict(list)
    for w in words:
        by_length[len(w)].append(w)

    patterns = []
    seen_keys = set()

    for length in range(MIN_WORD_LENGTH, MAX_WORD_LENGTH + 1):
        wlist = by_length[length]
        if not wlist:
            continue

        # Group by first + last
        fl_groups = defaultdict(list)
        for w in wlist:
            fl_groups[(w[0], w[-1])].append(w)

        for (first, last), matching in fl_groups.items():
            if len(matching) < MIN_VALID_WORDS:
                continue

            # Pattern type 1: first + last only
            p1 = [None] * length
            p1[0] = first
            p1[-1] = last
            key1 = build_pattern_key(p1)
            if key1 not in seen_keys:
                seen_keys.add(key1)
                patterns.append({
                    "len": length,
                    "kind": "both",
                    "start": first,
                    "end": last,
                    "count": len(matching)
                })

            # Pattern type 2: first two + last (XX___X)
            # Group matching words by second letter
            second_groups = defaultdict(list)
            for w in matching:
                second_groups[w[1]].append(w)

            for second, second_matching in second_groups.items():
                if len(second_matching) < MIN_VALID_WORDS:
                    continue
                p2 = [None] * length
                p2[0] = first
                p2[1] = second
                p2[-1] = last
                key2 = build_pattern_key(p2)
                if key2 not in seen_keys:
                    seen_keys.add(key2)
                    patterns.append({
                        "len": length,
                        "kind": "start2_end1",
                        "start": first,
                        "start2": second,
                        "end": last,
                        "count": len(second_matching)
                    })

            # Pattern type 3: first + last two (X___XX)
            # Group matching words by second-to-last letter
            secondlast_groups = defaultdict(list)
            for w in matching:
                secondlast_groups[w[-2]].append(w)

            for secondlast, secondlast_matching in secondlast_groups.items():
                if len(secondlast_matching) < MIN_VALID_WORDS:
                    continue
                p3 = [None] * length
                p3[0] = first
                p3[-2] = secondlast
                p3[-1] = last
                key3 = build_pattern_key(p3)
                if key3 not in seen_keys:
                    seen_keys.add(key3)
                    patterns.append({
                        "len": length,
                        "kind": "start1_end2",
                        "start": first,
                        "end2": secondlast,
                        "end": last,
                        "count": len(secondlast_matching)
                    })

    return patterns

def main():
    print("Loading words from SCOWL...")
    words = load_words()

    print("Generating patterns...")
    patterns = generate_patterns(words)

    random.seed(42)
    random.shuffle(patterns)

    with open(OUTPUT_PATH, "w") as f:
        json.dump(patterns, f)

    lengths = defaultdict(int)
    kinds = defaultdict(int)
    for p in patterns:
        lengths[p["len"]] += 1
        kinds[p["kind"]] += 1

    print(f"\nTotal patterns: {len(patterns)}")
    print("\nBreakdown by length:")
    for l in sorted(lengths):
        print(f"  {l} letters: {lengths[l]}")
    print("\nBreakdown by kind:")
    for k, v in kinds.items():
        print(f"  {k}: {v}")
    print(f"\nWritten to {OUTPUT_PATH}")

if __name__ == "__main__":
    main()