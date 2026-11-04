"""Pytest suite for SwasthyaVani Python offline pipeline and clinical rules."""

from __future__ import annotations

import sys
from pathlib import Path

import pandas as pd
import pytest

# Ensure swasthyavani is importable
src_path = Path(__file__).resolve().parents[1] / "src"
if str(src_path) not in sys.path:
    sys.path.insert(0, str(src_path))

from swasthyavani.chunk import build_chunks
from swasthyavani.escalation_rules import (
    is_danger_sign,
    is_out_of_scope,
    route_danger_section,
)
from swasthyavani.visit_list import TODAY, calculate_visit_list


@pytest.fixture
def protocols_dir() -> Path:
    project_root = Path(__file__).resolve().parents[2]
    proto = project_root / "data" / "protocols"
    if not proto.exists() or not any(proto.glob("*.md")):
        proto = project_root / "data" / "sample" / "protocols"
    return proto


def test_protocol_ingestion_and_chunking(protocols_dir: Path):
    """Assert sample protocols are ingested into valid leaf sections."""
    chunks = build_chunks(protocols_dir)
    assert len(chunks) > 0, "Expected at least one protocol section chunk"

    # Assert every chunk has mandatory citation structure
    for c in chunks:
        assert c["section_id"], "Missing section_id"
        assert c["title"], f"Missing title for {c['section_id']}"
        assert c["citation"].startswith(c["doc_prefix"]), (
            f"Malformed citation in {c['section_id']}"
        )
        assert len(c["clean_text"]) > 20, f"Chunk {c['section_id']} text too short"


def test_danger_sign_detection_maternal():
    """Assert positive detection of obstetric danger signs (bleeding, fits, blurred vision)."""
    assert is_danger_sign("pregnant woman with bleeding per vaginum")
    assert is_danger_sign("garbhvati mahila ko khoon aa raha hai")
    assert is_danger_sign("8 mahine pregnant, jhatke aa rahe hai aur chehra suja hai")
    assert is_danger_sign("thaili phat gayi hai, badbu wala paani nikal raha hai")


def test_danger_sign_detection_newborn():
    """Assert positive detection of neonatal danger signs (hypothermia, chest indrawing)."""
    assert is_danger_sign("navjaat bachcha doodh nahi pee raha, sust pada hai")
    assert is_danger_sign("bachche ki pasli andar dhans rahi hai aur saans tez hai")
    assert is_danger_sign("baby cold to touch, below 95.9 temperature")
    assert is_danger_sign("birth weight is 1.6 kg, bahut kamzor hai")


def test_danger_sign_detection_telugu():
    """Assert positive detection of Telugu code-mixed danger signs."""
    assert is_danger_sign("garbhini ki raktham padutondi")
    assert is_danger_sign("paapa paalu tagatledu, challaga aypoyindi")
    assert is_danger_sign("gunde noppi vastondi ekkuva ga")


def test_danger_leaf_routing():
    """Assert accurate leaf section routing for danger signs."""
    assert route_danger_section("cold to touch, shivering") == "ESC-4.3"
    assert route_danger_section("birth weight 1.5 kg") == "ESC-4.4"
    assert route_danger_section("chest indrawing fast breathing") == "ESC-5.2"
    assert route_danger_section("unconscious diabetes patient with fits") == "ESC-6.3"


def test_out_of_scope_refusal():
    """Assert out-of-scope clinical and administrative questions are refused."""
    assert is_out_of_scope("paracetamol syrup kitna dena hai 1 saal ke bachche ko?")
    assert is_out_of_scope("amoxicillin 500mg dose kya hai?")
    assert is_out_of_scope("u-win portal login OTP nahi aa raha")
    assert is_out_of_scope("ayushman card certificate kaise banega?")


def test_safe_non_escalation():
    """Assert routine health queries are NOT falsely escalated."""
    assert not is_danger_sign("3rd ANC check-up kab karwana hota hai?")
    assert not is_danger_sign("BCG ka teeka kab tak lag sakta hai?")
    assert not is_danger_sign("ORS ka ghol kaise banate hai?")
    assert not is_danger_sign("sugar aur BP ke marij ko exercise kitna karna chahiye?")


def test_visit_planner_sample():
    """Assert visit planner computes scheduled visits and prioritizes high-risk."""
    sample_data = pd.DataFrame(
        [
            {
                "member_id": "M-TEST-1",
                "name": "Sita Devi",
                "dob": "2000-01-01",
                "pregnant": "Y",
                "lmp_date": "2026-08-01",
                "last_hb_gdl": "6.5",  # Severe anaemia (< 7.0) -> High risk
                "last_anc_bp": "110/70",
                "anc_visit_dates": "",
            },
            {
                "member_id": "M-TEST-2",
                "name": "Chhotu",
                "dob": "2026-10-10",  # 16 days old
                "place_of_delivery": "home",
                "hbnc_visits_done": "1;3;7;14",
            },
        ]
    )
    visits = calculate_visit_list(sample_data, today=TODAY)
    assert len(visits) >= 1
    # Check that high-risk pregnant woman receives Priority 1
    hrp_visit = visits[visits["member_id"] == "M-TEST-1"]
    assert any(hrp_visit["priority"] == 1)
