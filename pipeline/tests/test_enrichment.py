"""Unit tests for dataset enrichment and immutability guarantees."""

import hashlib
import json
import sys
from pathlib import Path

# Ensure swasthyavani is importable
src_path = Path(__file__).resolve().parents[1] / "src"
if str(src_path) not in sys.path:
    sys.path.insert(0, str(src_path))

from swasthyavani.enrich_ui_data import (
    DISTRICT_IDS,
    PROTOCOL_MEDICATIONS,
    build_enriched_dataset,
)
from swasthyavani.translate_check import check_translations


def test_translation_dictionaries_parity():
    """Verify that all i18n dictionaries match 100% with no missing keys."""
    base_dir = Path(__file__).resolve().parents[2]
    i18n_dir = base_dir / "frontend" / "src" / "i18n"
    assert check_translations(i18n_dir) is True


def test_original_dataset_immutability():
    """Verify that source datasets remain byte-identical and unmodified."""
    base_dir = Path(__file__).resolve().parents[2]
    d_dir = (
        base_dir / "data"
        if (base_dir / "data" / "household_register.csv").exists()
        else base_dir / "data" / "sample"
    )
    reg_path = d_dir / "household_register.csv"
    hh_path = d_dir / "households.csv"

    assert reg_path.exists(), "household_register.csv must exist"
    assert hh_path.exists(), "households.csv must exist"

    # Compute hash
    with open(reg_path, "rb") as f:
        hash_reg_1 = hashlib.sha256(f.read()).hexdigest()

    # Read and build enrichment
    records = build_enriched_dataset(reg_path, hh_path)
    assert len(records) > 0

    with open(reg_path, "rb") as f:
        hash_reg_2 = hashlib.sha256(f.read()).hexdigest()

    assert hash_reg_1 == hash_reg_2, "household_register.csv was modified!"


def test_enrichment_determinism():
    """Verify that multiple runs of enrichment produce byte-identical JSON records."""
    base_dir = Path(__file__).resolve().parents[2]
    d_dir = (
        base_dir / "data"
        if (base_dir / "data" / "household_register.csv").exists()
        else base_dir / "data" / "sample"
    )
    reg_path = d_dir / "household_register.csv"
    hh_path = d_dir / "households.csv"

    run1 = build_enriched_dataset(reg_path, hh_path)
    run2 = build_enriched_dataset(reg_path, hh_path)

    synthetic_count = sum(1 for r in run1 if r.get("is_synthetic_ui_record"))
    assert synthetic_count >= 300, (
        f"Expected >= 300 synthetic records, got {synthetic_count}"
    )

    json1 = json.dumps(run1, sort_keys=True)
    json2 = json.dumps(run2, sort_keys=True)

    assert json1 == json2, "Enrichment is not deterministic!"


def test_controlled_vocabulary_and_citations():
    """Verify all records conform to controlled vocabulary and protocol citations."""
    base_dir = Path(__file__).resolve().parents[2]
    d_dir = (
        base_dir / "data"
        if (base_dir / "data" / "household_register.csv").exists()
        else base_dir / "data" / "sample"
    )
    reg_path = d_dir / "household_register.csv"
    hh_path = d_dir / "households.csv"

    records = build_enriched_dataset(reg_path, hh_path)
    valid_citations = {m["citation"] for m in PROTOCOL_MEDICATIONS.values()}

    for r in records:
        assert r["district"] in DISTRICT_IDS, f"Invalid district ID: {r['district']}"
        assert "is_synthetic_ui_record" in r
        assert "allowed_medication_dosage" in r
        assert r["medication_citation"] in valid_citations, (
            f"Invalid citation: {r['medication_citation']}"
        )
