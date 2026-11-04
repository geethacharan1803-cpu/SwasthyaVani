"""Translation completeness and parity checker for SwasthyaVani i18n dictionaries.

Ensures that every key in en.json exists in te.json and hi.json, and that
translated strings in te.json and hi.json contain genuine localized script
rather than untranslated English text (except for allowlisted acronyms/proper nouns).
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path
from typing import Any

# Allowed tokens in non-English dictionaries (acronyms, proper nouns, numerals, units, symbols)
ALLOWLIST: set[str] = {
    "SwasthyaVani",
    "ANC",
    "HBNC",
    "IMM",
    "NUT",
    "NCD",
    "PHC",
    "IFA",
    "ORS",
    "SAM",
    "MAM",
    "KMC",
    "BP",
    "Hb",
    "MUAC",
    "HTN",
    "DM",
    "LMP",
    "EDD",
    "FRU",
    "PDF",
    "MR",
    "BM25",
    "RAM",
    "CPU",
    "MB",
    "ms",
    "kg",
    "g",
    "dL",
    "g/dL",
    "cm",
    "mmHg",
    "P1",
    "P2",
    "P3",
    "p",
    "p95",
    "108",
    "102",
    "2026-10-26",
    "100%",
    "360°",
    "ID",
    "TTS",
    "e.g.",
}


def _flatten_dict(d: dict[str, Any], prefix: str = "") -> dict[str, str]:
    items: dict[str, str] = {}
    for k, v in d.items():
        new_key = f"{prefix}.{k}" if prefix else k
        if isinstance(v, dict):
            items.update(_flatten_dict(v, new_key))
        else:
            items[new_key] = str(v)
    return items


def check_translations(web_i18n_dir: Path) -> bool:
    en_path = web_i18n_dir / "en.json"
    te_path = web_i18n_dir / "te.json"
    hi_path = web_i18n_dir / "hi.json"

    for p in (en_path, te_path, hi_path):
        if not p.exists():
            print(f"ERROR: Translation file not found: {p}", file=sys.stderr)
            return False

    with open(en_path, "r", encoding="utf-8") as f:
        en = json.load(f)
    with open(te_path, "r", encoding="utf-8") as f:
        te = json.load(f)
    with open(hi_path, "r", encoding="utf-8") as f:
        hi = json.load(f)

    flat_en = _flatten_dict(en)
    flat_te = _flatten_dict(te)
    flat_hi = _flatten_dict(hi)

    errors: list[str] = []

    # 1. Key Parity Check
    missing_te = set(flat_en.keys()) - set(flat_te.keys())
    missing_hi = set(flat_en.keys()) - set(flat_hi.keys())

    if missing_te:
        errors.append(
            f"Telugu (te.json) is missing {len(missing_te)} keys: {sorted(missing_te)[:5]}"
        )
    if missing_hi:
        errors.append(
            f"Hindi (hi.json) is missing {len(missing_hi)} keys: {sorted(missing_hi)[:5]}"
        )

    # 2. Telugu Script Check (must have Telugu Unicode range \u0C00-\u0C7F unless allowlisted)
    telugu_regex = re.compile(r"[\u0C00-\u0C7F]")
    for k, val in flat_te.items():
        en_val = flat_en.get(k, "")
        clean_val = re.sub(r"\{[a-zA-Z0-9_]+\}", "", val)
        if val == en_val and val not in ALLOWLIST:
            errors.append(f"Telugu key '{k}' has identical English text: '{val}'")
        elif (
            not telugu_regex.search(val)
            and val not in ALLOWLIST
            and not all(
                token in ALLOWLIST for token in re.findall(r"\b\w+\b", clean_val)
            )
        ):
            errors.append(f"Telugu key '{k}' lacks Telugu script characters: '{val}'")

    # 3. Hindi Script Check (must have Devanagari Unicode range \u0900-\u097F unless allowlisted)
    hindi_regex = re.compile(r"[\u0900-\u097F]")
    for k, val in flat_hi.items():
        en_val = flat_en.get(k, "")
        clean_val = re.sub(r"\{[a-zA-Z0-9_]+\}", "", val)
        if val == en_val and val not in ALLOWLIST:
            errors.append(f"Hindi key '{k}' has identical English text: '{val}'")
        elif (
            not hindi_regex.search(val)
            and val not in ALLOWLIST
            and not all(
                token in ALLOWLIST for token in re.findall(r"\b\w+\b", clean_val)
            )
        ):
            errors.append(
                f"Hindi key '{k}' lacks Devanagari script characters: '{val}'"
            )

    if errors:
        sys.stderr.write(
            f"\n[FAIL] Translation Verification FAILED ({len(errors)} issues):\n"
        )
        for e in errors:
            sys.stderr.write(f"  - {e}\n")
        return False

    sys.stdout.write("[PASS] Translation Verification PASSED:\n")
    sys.stdout.write(
        f"  - Key parity 100% matched across en, te, hi ({len(flat_en)} keys).\n"
    )
    sys.stdout.write(
        "  - 100% verified Telugu (te-IN) and Devanagari Hindi (hi-IN) script coverage.\n"
    )
    return True


if __name__ == "__main__":
    base_dir = Path(__file__).resolve().parents[3]
    i18n_dir = base_dir / "web" / "src" / "i18n"
    ok = check_translations(i18n_dir)
    sys.exit(0 if ok else 1)
