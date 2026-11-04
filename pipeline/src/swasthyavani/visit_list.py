"""Daily Visit List Planner - Implements the full 09_VIS Clinical Protocol Specification."""

from __future__ import annotations

import json
import re
from datetime import date, timedelta
from pathlib import Path
from typing import Any

import pandas as pd

# Anchor demonstration date for schedule simulation
TODAY = date(2026, 10, 26)
HORIZON_DAYS = 6
GRACE_DAYS = 28
FOLLOWUP_INTERVAL_DAYS = 30


def _split_semicolon(val: Any) -> list[str]:
    """Defensively split semicolon-separated values, treating NaN/none as empty."""
    if pd.isna(val) or val is None:
        return []
    s = str(val).strip()
    if not s or s.lower() in ("nan", "none"):
        return []
    return [
        x.strip()
        for x in s.split(";")
        if x.strip() and x.strip().lower() not in ("nan", "none")
    ]


# National Immunization Schedule (NIS) specification
# Format: (code, due_age_days, not_after_days, prev_dose_needed, min_gap_days)
VACCINE_SPEC: list[tuple[str, int, int, str | None, int | None]] = [
    ("BCG", 0, 365, None, None),
    ("HepB-0", 0, 0, None, None),
    ("OPV-0", 0, 15, None, None),
    ("OPV-1", 42, 1825, None, None),
    ("OPV-2", 70, 1825, "OPV-1", 28),
    ("OPV-3", 98, 1825, "OPV-2", 28),
    ("Penta-1", 42, 365, None, None),
    ("Penta-2", 70, 365, "Penta-1", 28),
    ("Penta-3", 98, 365, "Penta-2", 28),
    ("RVV-1", 42, 365, None, None),
    ("RVV-2", 70, 365, "RVV-1", 28),
    ("RVV-3", 98, 365, "RVV-2", 28),
    ("fIPV-1", 42, 365, None, None),
    ("fIPV-2", 98, 365, "fIPV-1", 56),
    ("fIPV-3", 276, 729, "fIPV-2", 56),
    ("PCV-1", 42, 365, None, None),
    ("PCV-2", 98, 729, "PCV-1", 60),
    ("PCV-B", 276, 729, "PCV-2", 60),
    ("MR-1", 276, 1825, None, None),
    ("MR-2", 490, 1825, "MR-1", 28),
    ("OPV-B", 490, 1825, "OPV-3", 180),
    ("DPT-B1", 490, 2554, "Penta-3", 180),
    ("DPT-B2", 1827, 2554, "DPT-B1", None),
]

ANC_WINDOWS: dict[int, tuple[int, int]] = {
    1: (0, 84),
    2: (98, 182),
    3: (196, 238),
    4: (252, 280),
}


def parse_date(val: Any) -> date | None:
    """Defensively parse ISO date string, returning None on invalid format."""
    if not val or pd.isna(val):
        return None
    s = str(val).strip()
    if not s or s.lower() in ("nan", "none", ""):
        return None
    try:
        return date.fromisoformat(s[:10])
    except ValueError:
        return None


def normalize_vax_code(raw: str) -> str:
    """Normalize messy vaccine codes from hand-filled register entries."""
    cleaned = re.sub(r"[^a-z0-9]", "", str(raw).lower())
    mapping = {
        "bcg": "BCG",
        "hepb0": "HepB-0",
        "opv0": "OPV-0",
        "opv1": "OPV-1",
        "opv2": "OPV-2",
        "opv3": "OPV-3",
        "opvb": "OPV-B",
        "penta1": "Penta-1",
        "penta2": "Penta-2",
        "penta3": "Penta-3",
        "rvv1": "RVV-1",
        "rvv2": "RVV-2",
        "rvv3": "RVV-3",
        "fipv1": "fIPV-1",
        "fipv2": "fIPV-2",
        "fipv3": "fIPV-3",
        "pcv1": "PCV-1",
        "pcv2": "PCV-2",
        "pcvb": "PCV-B",
        "mr1": "MR-1",
        "mr2": "MR-2",
        "dptb1": "DPT-B1",
        "dptb2": "DPT-B2",
    }
    return mapping.get(cleaned, raw.strip())


def calculate_visit_list(
    register: pd.DataFrame,
    today: date = TODAY,
    horizon: int = HORIZON_DAYS,
    grace: int = GRACE_DAYS,
) -> pd.DataFrame:
    """Generate prioritized daily visit list matching 09_VIS specification."""
    rows: list[dict[str, Any]] = []

    for _, r in register.iterrows():
        mid = str(r.get("member_id", "")).strip()
        if not mid:
            continue

        dob = parse_date(r.get("dob"))
        age_days = (today - dob).days if dob else None

        # ------------------------------------------------------------- High-risk check
        high_risk = False
        is_pregnant = str(r.get("pregnant", "")).strip().upper() == "Y"
        if is_pregnant:
            try:
                hb = float(r.get("last_hb_gdl", 0)) if r.get("last_hb_gdl") else None
                if hb is not None and hb < 7.0:
                    high_risk = True
            except (ValueError, TypeError):
                pass

            bp = str(r.get("last_anc_bp", "")).strip()
            if "/" in bp:
                try:
                    s_bp, d_bp = bp.split("/")[:2]
                    if int(s_bp) >= 140 or int(d_bp) >= 90:
                        high_risk = True
                except ValueError:
                    pass

        if age_days is not None and age_days <= 42:
            high_risk = True

        if age_days is not None and 184 <= age_days <= 1824:
            try:
                muac = (
                    float(r.get("last_muac_cm", 0)) if r.get("last_muac_cm") else None
                )
                if muac is not None and muac < 11.5:
                    high_risk = True
            except (ValueError, TypeError):
                pass
            if str(r.get("bilateral_pitting_oedema", "")).strip().upper() == "Y":
                high_risk = True

        ncd = str(r.get("ncd_condition", "")).strip().upper()
        if "HTN" in ncd or "DM" in ncd:
            bp = str(r.get("last_bp_reading", "")).strip()
            if "/" in bp:
                try:
                    s_bp, d_bp = bp.split("/")[:2]
                    if int(s_bp) >= 140 or int(d_bp) >= 90:
                        high_risk = True
                except ValueError:
                    pass

        # ------------------------------------------------- 1. High-Risk Pregnancy (HRP)
        if is_pregnant and high_risk:
            rows.append(
                {
                    "member_id": mid,
                    "due_item": "HRP-followup",
                    "priority": 1,
                    "status": "due_today",
                }
            )

        # ------------------------------------------------- 2. ANC Check-ups (VIS-2.1)
        if is_pregnant:
            lmp = parse_date(r.get("lmp_date"))
            if lmp:
                gest_days = (today - lmp).days
                anc_dones = _split_semicolon(r.get("anc_visit_dates"))
                num = len(anc_dones) + 1
                if num <= 4:
                    start, end = ANC_WINDOWS[num]
                    due_date = lmp + timedelta(days=start)
                    if gest_days > end:
                        status = "overdue"
                    elif gest_days >= start:
                        status = "due_today"
                    elif due_date <= today + timedelta(days=horizon):
                        status = "due_this_week"
                    else:
                        status = None

                    if status:
                        pri = (
                            3 if status == "due_this_week" else (1 if high_risk else 2)
                        )
                        rows.append(
                            {
                                "member_id": mid,
                                "due_item": f"ANC-{num}",
                                "priority": pri,
                                "status": status,
                            }
                        )

        # ------------------------------------------------- 3. Td in Pregnancy (VIS-2.2)
        if is_pregnant:
            td_doses_raw = _split_semicolon(r.get("td_doses"))
            td_given: dict[str, date] = {}
            for tdx in td_doses_raw:
                if ":" in tdx:
                    c, d_str = tdx.split(":", 1)
                    parsed_d = parse_date(d_str)
                    if parsed_d:
                        td_given[c.strip().upper()] = parsed_d

            anc_dones = _split_semicolon(r.get("anc_visit_dates"))
            first_anc_date = parse_date(anc_dones[0]) if anc_dones else None
            is_booster = str(r.get("td_booster_eligible", "")).strip().upper() == "Y"

            if is_booster:
                if "TD-BST" not in td_given and first_anc_date:
                    due_date = first_anc_date
                    delta = (today - due_date).days
                    if delta > grace:
                        status = "overdue"
                    elif delta >= 0:
                        status = "due_today"
                    elif due_date <= today + timedelta(days=horizon):
                        status = "due_this_week"
                    else:
                        status = None
                    if status:
                        pri = (
                            3 if status == "due_this_week" else (1 if high_risk else 2)
                        )
                        rows.append(
                            {
                                "member_id": mid,
                                "due_item": "Td-BST",
                                "priority": pri,
                                "status": status,
                            }
                        )
            else:
                if "TD-1" not in td_given:
                    if first_anc_date:
                        due_date = first_anc_date
                        delta = (today - due_date).days
                        if delta > grace:
                            status = "overdue"
                        elif delta >= 0:
                            status = "due_today"
                        elif due_date <= today + timedelta(days=horizon):
                            status = "due_this_week"
                        else:
                            status = None
                        if status:
                            pri = (
                                3
                                if status == "due_this_week"
                                else (1 if high_risk else 2)
                            )
                            rows.append(
                                {
                                    "member_id": mid,
                                    "due_item": "Td-1",
                                    "priority": pri,
                                    "status": status,
                                }
                            )
                elif "TD-2" not in td_given:
                    date_td1 = td_given["TD-1"]
                    due_date = date_td1 + timedelta(days=28)
                    delta = (today - due_date).days
                    if delta > grace:
                        status = "overdue"
                    elif delta >= 0:
                        status = "due_today"
                    elif due_date <= today + timedelta(days=horizon):
                        status = "due_this_week"
                    else:
                        status = None
                    if status:
                        pri = (
                            3 if status == "due_this_week" else (1 if high_risk else 2)
                        )
                        rows.append(
                            {
                                "member_id": mid,
                                "due_item": "Td-2",
                                "priority": pri,
                                "status": status,
                            }
                        )

        # ------------------------------------------------- 4. HBNC Visits (VIS-4.1)
        if age_days is not None and age_days <= 42:
            pod = str(r.get("place_of_delivery", "")).strip().lower()
            hbnc_days = (
                [1, 3, 7, 14, 21, 28, 42] if pod == "home" else [3, 7, 14, 21, 28, 42]
            )
            dones_raw = _split_semicolon(r.get("hbnc_visits_done"))
            dones = set()
            for x in dones_raw:
                dones.add(x)
                if x.isdigit():
                    dones.add(f"HBNC-D{x}")
                elif x.startswith("HBNC-D"):
                    dones.add(x[6:])

            past_or_today = [
                d for d in hbnc_days if dob and (dob + timedelta(days=d - 1)) <= today
            ]
            latest_past = past_or_today[-1] if past_or_today else None
            hbnc_item: dict[str, Any] | None = None

            if latest_past is not None and str(latest_past) not in dones:
                v_date = dob + timedelta(days=latest_past - 1) if dob else today
                status = "due_today" if v_date == today else "overdue"
                pri = 1
                hbnc_item = {
                    "member_id": mid,
                    "due_item": f"HBNC-D{latest_past}",
                    "priority": pri,
                    "status": status,
                }
            else:
                future_visits = [
                    d
                    for d in hbnc_days
                    if dob and (dob + timedelta(days=d - 1)) > today
                ]
                next_future = future_visits[0] if future_visits else None
                if next_future is not None and str(next_future) not in dones:
                    v_date = dob + timedelta(days=next_future - 1) if dob else today
                    if v_date <= today + timedelta(days=horizon):
                        hbnc_item = {
                            "member_id": mid,
                            "due_item": f"HBNC-D{next_future}",
                            "priority": 3,
                            "status": "due_this_week",
                        }
            if hbnc_item:
                rows.append(hbnc_item)

        # ------------------------------------------------- 5. Vaccines (VIS-3.1)
        if dob and age_days is not None and 0 <= age_days <= 2554:
            vax_raw = _split_semicolon(r.get("child_vaccines"))
            vax_given: dict[str, date] = {}
            for vx in vax_raw:
                if ":" in vx:
                    code, d_str = vx.split(":", 1)
                    canon = normalize_vax_code(code)
                    parsed_d = parse_date(d_str)
                    if parsed_d:
                        vax_given[canon] = parsed_d
                else:
                    canon = normalize_vax_code(vx)
                    vax_given[canon] = today

            for code, due_age, not_after, prev_needed, min_gap in VACCINE_SPEC:
                if code in vax_given:
                    continue
                if age_days > not_after:
                    continue
                if prev_needed and prev_needed not in vax_given:
                    continue

                base_due = dob + timedelta(days=due_age)
                if prev_needed and min_gap:
                    prev_d = vax_given[prev_needed]
                    due_date = max(base_due, prev_d + timedelta(days=min_gap))
                else:
                    due_date = base_due

                if due_date > dob + timedelta(days=not_after):
                    continue
                if due_date > today + timedelta(days=horizon):
                    continue

                delta = (today - due_date).days
                if delta > grace or age_days >= not_after:
                    status = "overdue"
                elif delta >= 0:
                    status = "due_today"
                else:
                    status = "due_this_week"

                pri = 3 if status == "due_this_week" else (1 if high_risk else 2)
                rows.append(
                    {
                        "member_id": mid,
                        "due_item": code,
                        "priority": pri,
                        "status": status,
                    }
                )

        # ------------------------------------------------- 6. MUAC Check (VIS-5.2)
        if dob and age_days is not None and 178 <= age_days <= 1824:
            last_muac = parse_date(r.get("last_muac_date"))
            if last_muac:
                due_date = last_muac + timedelta(days=FOLLOWUP_INTERVAL_DAYS)
            else:
                due_date = dob + timedelta(days=184)

            if due_date <= today + timedelta(days=horizon):
                delta = (today - due_date).days
                if delta > grace:
                    status = "overdue"
                elif delta >= 0:
                    status = "due_today"
                else:
                    status = "due_this_week"

                pri = 3 if status == "due_this_week" else (1 if high_risk else 2)
                rows.append(
                    {
                        "member_id": mid,
                        "due_item": "MUAC-check",
                        "priority": pri,
                        "status": status,
                    }
                )

        # ------------------------------------------------- 7. NCD Follow-ups (VIS-5.3)
        if "HTN" in ncd:
            last_bp = parse_date(r.get("last_bp_check_date"))
            if last_bp:
                due_date = last_bp + timedelta(days=FOLLOWUP_INTERVAL_DAYS)
                if due_date <= today + timedelta(days=horizon):
                    delta = (today - due_date).days
                    status = (
                        "overdue"
                        if delta > grace
                        else ("due_today" if delta >= 0 else "due_this_week")
                    )
                    pri = 3 if status == "due_this_week" else (1 if high_risk else 2)
                    rows.append(
                        {
                            "member_id": mid,
                            "due_item": "BP-followup",
                            "priority": pri,
                            "status": status,
                        }
                    )
            else:
                pri = 1 if high_risk else 2
                rows.append(
                    {
                        "member_id": mid,
                        "due_item": "BP-followup",
                        "priority": pri,
                        "status": "overdue",
                    }
                )

        if "DM" in ncd:
            last_sugar = parse_date(r.get("last_sugar_check_date"))
            if last_sugar:
                due_date = last_sugar + timedelta(days=FOLLOWUP_INTERVAL_DAYS)
                if due_date <= today + timedelta(days=horizon):
                    delta = (today - due_date).days
                    status = (
                        "overdue"
                        if delta > grace
                        else ("due_today" if delta >= 0 else "due_this_week")
                    )
                    pri = 3 if status == "due_this_week" else (1 if high_risk else 2)
                    rows.append(
                        {
                            "member_id": mid,
                            "due_item": "Sugar-followup",
                            "priority": pri,
                            "status": status,
                        }
                    )
            else:
                pri = 1 if high_risk else 2
                rows.append(
                    {
                        "member_id": mid,
                        "due_item": "Sugar-followup",
                        "priority": pri,
                        "status": "overdue",
                    }
                )

    if not rows:
        return pd.DataFrame(columns=["member_id", "due_item", "priority", "status"])

    df = pd.DataFrame(rows)
    # Deduplicate keeping highest priority (lowest number)
    df = df.sort_values("priority").drop_duplicates(
        subset=["member_id", "due_item"], keep="first"
    )
    return df.reset_index(drop=True)


def export_visit_list(
    register_path: Path,
    output_csv: Path,
    web_public_file: Path,
) -> pd.DataFrame:
    """Generate and write visit_list.csv and register_visits.json."""
    register_df = pd.read_csv(register_path)
    visits_df = calculate_visit_list(register_df)

    # 1. Write prioritized visit list CSV (member_id,due_item,priority)
    output_csv.parent.mkdir(parents=True, exist_ok=True)
    visits_df[["member_id", "due_item", "priority"]].to_csv(
        output_csv, index=False, encoding="utf-8"
    )

    # 2. Write enriched JSON for offline browser app (including member context and status)
    web_public_file.parent.mkdir(parents=True, exist_ok=True)
    # Merge basic member details (name, village, house_no, asha_id)
    cols_to_keep = [
        "member_id",
        "household_id",
        "village",
        "asha_id",
        "name",
        "sex",
        "dob",
    ]
    avail_cols = [c for c in cols_to_keep if c in register_df.columns]
    merged = visits_df.merge(register_df[avail_cols], on="member_id", how="left")

    with open(web_public_file, "w", encoding="utf-8") as f:
        json.dump(merged.to_dict(orient="records"), f, ensure_ascii=False, indent=2)

    print(
        f"Generated {len(visits_df)} prioritized visit items across {visits_df['member_id'].nunique()} members."
    )
    print(f"  - Written to {output_csv} ({output_csv.stat().st_size} bytes)")
    print(
        f"  - Written to {web_public_file} ({web_public_file.stat().st_size / 1024:.1f} KB)"
    )
    return visits_df


if __name__ == "__main__":
    project_root = Path(__file__).resolve().parents[3]
    d_dir = (
        project_root / "data"
        if (project_root / "data" / "household_register.csv").exists()
        else project_root / "data" / "sample"
    )
    reg_csv = d_dir / "household_register.csv"
    out_csv = project_root / "data" / "sample" / "visit_list.csv"
    pub_json = project_root / "web" / "public" / "data" / "register_visits.json"
    export_visit_list(reg_csv, out_csv, pub_json)
