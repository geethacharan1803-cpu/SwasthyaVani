"""Build Index Module - Computes BM25 inverted index and exports compact static JSON."""

from __future__ import annotations

import json
import math
import re
import sys
from collections import Counter
from pathlib import Path
from typing import Any

# Ensure swasthyavani is importable when run directly
src_dir = Path(__file__).resolve().parents[1]
if str(src_dir) not in sys.path:
    sys.path.insert(0, str(src_dir))

from swasthyavani.chunk import build_chunks
from swasthyavani.escalation_rules import WORD_MAP


def tokenize(text: str) -> list[str]:
    """Tokenize text into lowercase alphanumeric words with multilingual synonym expansion."""
    toks = re.findall(r"[a-z0-9]+(?:\.[0-9]+)?", text.lower())
    expanded: list[str] = []
    for t in toks:
        expanded.append(t)
        if t in WORD_MAP:
            expanded.extend(WORD_MAP[t].split())
    return expanded


def build_bm25_index(
    chunks: list[dict[str, Any]],
    k1: float = 1.5,
    b: float = 0.75,
) -> dict[str, Any]:
    """Build an inverted index structure suitable for browser-side BM25 querying."""
    doc_count = len(chunks)
    doc_lengths: dict[str, int] = {}
    total_len = 0

    # Inverted index: { term: [ [section_id, tf], ... ] }
    inverted_index: dict[str, list[list[Any]]] = {}
    doc_freq: Counter = Counter()

    for c in chunks:
        sid = c["section_id"]
        # Index both title and clean body text
        full_text = f"{c['title']} {c['clean_text']}"
        tokens = tokenize(full_text)
        doc_len = len(tokens)
        doc_lengths[sid] = doc_len
        total_len += doc_len

        tf_map = Counter(tokens)
        for term, count in tf_map.items():
            doc_freq[term] += 1
            if term not in inverted_index:
                inverted_index[term] = []
            inverted_index[term].append([sid, count])

    avgdl = total_len / max(doc_count, 1)

    # Precalculate IDF for each indexed term
    idf_map: dict[str, float] = {}
    for term, df in doc_freq.items():
        # Standard Lucene / Okapi BM25 IDF with smoothing
        val = (doc_count - df + 0.5) / (df + 0.5)
        idf = math.log(1.0 + max(val, 0.001))
        idf_map[term] = round(idf, 4)

    return {
        "k1": k1,
        "b": b,
        "doc_count": doc_count,
        "avgdl": round(avgdl, 2),
        "doc_lengths": doc_lengths,
        "idf": idf_map,
        "inverted_index": inverted_index,
    }


def export_static_assets(
    protocols_dir: Path,
    output_dir: Path,
) -> None:
    """Generate and write sections.json, index.json, and lexicon.json to web public directory."""
    output_dir.mkdir(parents=True, exist_ok=True)
    chunks = build_chunks(protocols_dir)

    # 1. sections.json: compact map of sections for UI cards and answer text
    sections_map = {c["section_id"]: c for c in chunks}
    sections_file = output_dir / "sections.json"
    with open(sections_file, "w", encoding="utf-8") as f:
        json.dump(sections_map, f, ensure_ascii=False, indent=2)

    # 2. index.json: BM25 index parameters
    index_data = build_bm25_index(chunks)
    index_file = output_dir / "index.json"
    with open(index_file, "w", encoding="utf-8") as f:
        json.dump(index_data, f, ensure_ascii=False, separators=(",", ":"))

    # 3. lexicon.json: multilingual synonyms map
    lexicon_file = output_dir / "lexicon.json"
    with open(lexicon_file, "w", encoding="utf-8") as f:
        json.dump(WORD_MAP, f, ensure_ascii=False, indent=2)

    sz_sections = sections_file.stat().st_size / 1024
    sz_index = index_file.stat().st_size / 1024
    sz_lexicon = lexicon_file.stat().st_size / 1024

    print(f"Exported static data assets to {output_dir}:")
    print(f"  - sections.json: {sz_sections:.1f} KB ({len(chunks)} sections)")
    print(f"  - index.json:    {sz_index:.1f} KB ({len(index_data['idf'])} terms)")
    print(f"  - lexicon.json:  {sz_lexicon:.1f} KB ({len(WORD_MAP)} synonyms)")
    print(
        f"Total static data footprint: {sz_sections + sz_index + sz_lexicon:.1f} KB (< 500 KB target)"
    )


if __name__ == "__main__":
    project_root = Path(__file__).resolve().parents[3]
    p_dir = project_root / "data" / "protocols"
    if not p_dir.exists() or not any(p_dir.glob("*.md")):
        p_dir = project_root / "data" / "sample" / "protocols"
    out_dir = project_root / "web" / "public" / "data"
    export_static_assets(p_dir, out_dir)
