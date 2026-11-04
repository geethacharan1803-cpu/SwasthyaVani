"""Chunking Module - Produces clean, leaf-level protocol chunks for retrieval and citations."""

from __future__ import annotations

import re
import sys
from pathlib import Path
from typing import Any

# Ensure swasthyavani is importable when run directly
src_dir = Path(__file__).resolve().parents[1]
if str(src_dir) not in sys.path:
    sys.path.insert(0, str(src_dir))

from swasthyavani.ingest import load_all_protocols


def clean_markdown_text(text: str) -> str:
    """Strip markdown formatting while preserving tables, lists, and clinical numbers."""
    # Convert markdown bullet points to clean lines
    t = re.sub(r"^\s*[-*+]\s+", "", text, flags=re.MULTILINE)
    # Convert bold / italics
    t = re.sub(r"\*\*([^*]+)\*\*", r"\1", t)
    t = re.sub(r"\*([^*]+)\*", r"\1", t)
    t = re.sub(r"`([^`]+)`", r"\1", t)
    # Remove table pipe dividers cleanly
    t = re.sub(r"\|", " ", t)
    # Remove repeated dashes / equals
    t = re.sub(r"^[-=]{3,}\s*$", "", t, flags=re.MULTILINE)
    # Normalize excessive spaces
    t = re.sub(r"[ \t]+", " ", t)
    t = re.sub(r"\n\s*\n+", "\n\n", t)
    return t.strip()


def build_chunks(protocols_dir: Path) -> list[dict[str, Any]]:
    """Ingest protocols and build leaf-level chunks for BM25 search and citations."""
    raw_sections = load_all_protocols(protocols_dir)
    chunks: list[dict[str, Any]] = []

    # Map section IDs to determine which ones are parent sections
    all_sec_ids = {s["section_id"] for s in raw_sections}
    parent_ids = set()
    for sid in all_sec_ids:
        # If sid is like ANC-1 and ANC-1.1 exists, ANC-1 is a parent
        for other in all_sec_ids:
            if other != sid and other.startswith(sid + "."):
                parent_ids.add(sid)

    for s in raw_sections:
        sid = s["section_id"]
        # Skip pure document headers like 'ANC', 'IMM' or high-level parent headers that have sub-sections
        if sid in parent_ids or not ("-" in sid):
            continue

        clean_text = clean_markdown_text(s["body"])
        if not clean_text:
            continue

        # Strip section ID prefix only if explicit ID pattern e.g. "ANC-1.1 Title"
        clean_title = re.sub(r"^[A-Z0-9]+[-.][A-Z0-9_.-]*\s*", "", s["title"]).strip()
        display_citation = f"{s['doc_prefix']}, Section {sid}"

        chunks.append(
            {
                "section_id": sid,
                "title": clean_title or s["title"],
                "full_title": s["title"],
                "doc_prefix": s["doc_prefix"],
                "doc_file": s["doc_file"],
                "citation": display_citation,
                "raw_text": s["body"],
                "clean_text": clean_text,
                "char_count": len(clean_text),
            }
        )

    return chunks


if __name__ == "__main__":
    p_dir = Path(__file__).resolve().parents[3] / "data" / "protocols"
    chunks = build_chunks(p_dir)
    print(f"Generated {len(chunks)} leaf-level protocol chunks.")
    for c in chunks[:5]:
        print(f"[{c['section_id']}] {c['title']} ({c['char_count']} chars)")
