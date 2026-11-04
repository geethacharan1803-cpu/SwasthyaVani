"""Protocol Ingestion Module - Parses protocol markdown documents into structured sections."""

from __future__ import annotations

import re
from pathlib import Path
from typing import Any


def parse_protocol_file(file_path: Path) -> list[dict[str, Any]]:
    """Parse a single protocol markdown file into structured sections with IDs.

    Extracts leaf sections identified by patterns like ANC-1.1, IMM-2.3, ESC-4.2, etc.
    """
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    filename = file_path.name
    doc_match = re.match(r"^(\d+)_([A-Z]+)_(.+)\.md$", filename)
    doc_prefix = doc_match.group(2) if doc_match else filename.split(".")[0]

    lines = content.splitlines()
    sections: list[dict[str, Any]] = []

    current_sec_id = None
    current_title = ""
    current_level = 0
    current_body_lines: list[str] = []

    # Pattern for section headers: e.g. "### ANC-1.1 Early registration and EDD"
    header_pattern = re.compile(r"^(#{1,4})\s+(?:([A-Z0-9_\-\.]+)\s+)?(.*)$")

    for line in lines:
        m = header_pattern.match(line)
        if m:
            level_str, explicit_id, title_text = m.groups()
            level = len(level_str)
            title_text = title_text.strip() if title_text else ""

            # If there's an ID embedded in the title text e.g. "ANC-1.1 Something"
            embedded_id_match = re.match(r"^([A-Z0-9]+-[0-9\.]+)\s*(.*)", title_text)
            if not explicit_id and embedded_id_match:
                sec_id = embedded_id_match.group(1)
                title = embedded_id_match.group(2).strip()
            elif explicit_id:
                sec_id = explicit_id
                title = title_text
            else:
                sec_id = None
                title = title_text

            if sec_id:
                # Flush previous section if it has content
                if current_sec_id and current_body_lines:
                    body = "\n".join(current_body_lines).strip()
                    if body:
                        sections.append(
                            {
                                "section_id": current_sec_id,
                                "title": current_title,
                                "doc_prefix": doc_prefix,
                                "doc_file": filename,
                                "level": current_level,
                                "body": body,
                            }
                        )
                current_sec_id = sec_id
                current_title = title or sec_id
                current_level = level
                current_body_lines = []
            else:
                if current_sec_id:
                    current_body_lines.append(line)
        else:
            if current_sec_id:
                current_body_lines.append(line)

    # Flush final section
    if current_sec_id and current_body_lines:
        body = "\n".join(current_body_lines).strip()
        if body:
            sections.append(
                {
                    "section_id": current_sec_id,
                    "title": current_title,
                    "doc_prefix": doc_prefix,
                    "doc_file": filename,
                    "level": current_level,
                    "body": body,
                }
            )

    return sections


def load_all_protocols(protocols_dir: Path) -> list[dict[str, Any]]:
    """Parse and collect all protocol sections from the directory."""
    all_sections: list[dict[str, Any]] = []
    for md_file in sorted(protocols_dir.glob("*.md")):
        sections = parse_protocol_file(md_file)
        all_sections.extend(sections)
    return all_sections


if __name__ == "__main__":
    p_dir = Path(__file__).resolve().parents[3] / "data" / "protocols"
    secs = load_all_protocols(p_dir)
    print(f"Loaded {len(secs)} total sections from {p_dir}")
    for s in secs[:10]:
        print(f"[{s['section_id']}] {s['title']} ({len(s['body'])} chars)")
