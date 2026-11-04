"""Dataset Enrichment for Frontline Health-Worker UI.

Reads household_register.csv and households.csv strictly READ-ONLY.
Generates deterministic synthetic enrichment with controlled vocabulary IDs
for multi-district filtering, past histories, vitals, and cited protocol medication rules.
Generates at least 350 additional synthetic patients across AP districts.

Outputs:
  - web/public/data/register_enriched.json (for browser runtime)
  - pipeline/out/register_enriched.csv (for offline inspection)
"""

from __future__ import annotations

import hashlib
import json
from datetime import date, timedelta
from pathlib import Path
from typing import Any

import pandas as pd

TODAY = date(2026, 10, 26)

# Controlled vocabulary ID constants
DISTRICT_IDS = [
    "chandrapuri",
    "kakinada",
    "east_godavari",
    "visakhapatnam",
    "guntur",
    "chittoor",
    "kurnool",
]

VILLAGE_TO_DISTRICT_ID: dict[str, str] = {
    # Sample Chandrapuri Block villages
    "Amrapur": "chandrapuri",
    "Belwadi Tola": "chandrapuri",
    "Kesarganj": "chandrapuri",
    "Dhanpura": "chandrapuri",
    "Navagaon Khurd": "chandrapuri",
    "Sitapahari": "chandrapuri",
    # Additional AP demonstration villages
    "Sarpavaram": "kakinada",
    "Peddapuram Rural": "kakinada",
    "Thimmapuram": "kakinada",
    "Rajahmundry Rural": "east_godavari",
    "Kadiyam": "east_godavari",
    "Dowleswaram": "east_godavari",
    "Bheemunipatnam": "visakhapatnam",
    "Anandapuram": "visakhapatnam",
    "Padmanabham": "visakhapatnam",
    "Mangalagiri Rural": "guntur",
    "Tadikonda": "guntur",
    "Tenali West": "guntur",
    "Chandragiri": "chittoor",
    "Palamaner": "chittoor",
    "Kuppam Rural": "chittoor",
    "Nandyal Rural": "kurnool",
    "Alur": "kurnool",
    "Dhone": "kurnool",
}

DISTRICT_VILLAGES: dict[str, list[str]] = {
    "chandrapuri": [
        "Amrapur",
        "Belwadi Tola",
        "Kesarganj",
        "Dhanpura",
        "Navagaon Khurd",
        "Sitapahari",
    ],
    "kakinada": ["Sarpavaram", "Peddapuram Rural", "Thimmapuram"],
    "east_godavari": ["Rajahmundry Rural", "Kadiyam", "Dowleswaram"],
    "visakhapatnam": ["Bheemunipatnam", "Anandapuram", "Padmanabham"],
    "guntur": ["Mangalagiri Rural", "Tadikonda", "Tenali West"],
    "chittoor": ["Chandragiri", "Palamaner", "Kuppam Rural"],
    "kurnool": ["Nandyal Rural", "Alur", "Dhone"],
}

DISTRICT_ASHAS: dict[str, list[tuple[str, str]]] = {
    "chandrapuri": [
        ("ASHA-096P", "Sunaina Devi"),
        ("ASHA-RRR5", "Kalavati Kumari"),
        ("ASHA-YFK5", "Rinku Devi"),
        ("ASHA-L9R8", "Shabnam Khatoon"),
        ("ASHA-KQXR", "Malti Devi"),
    ],
    "kakinada": [("ASHA-KKD01", "Sita Devi"), ("ASHA-KKD02", "Padma V")],
    "east_godavari": [("ASHA-EGD01", "Lakshmi K"), ("ASHA-EGD02", "Parvati R")],
    "visakhapatnam": [("ASHA-VSP01", "Anuradha B"), ("ASHA-VSP02", "Sandhya M")],
    "guntur": [("ASHA-GNT01", "Sujatha T"), ("ASHA-GNT02", "Radha P")],
    "chittoor": [("ASHA-CTR01", "Kavitha M"), ("ASHA-CTR02", "Lavanya S")],
    "kurnool": [("ASHA-KNL01", "Bharathi N"), ("ASHA-KNL02", "Renuka D")],
}

# Medication dosage text grounded strictly in protocol corpus
PROTOCOL_MEDICATIONS: dict[str, dict[str, str]] = {
    "ors_zinc": {
        "id": "ors_zinc",
        "citation": "SEC-04-NUT-02",
        "guideline": "ORS 1 packet in 1L clean water after each loose stool + Zinc 20mg (10mg for <6mo) once daily x 14 days",
    },
    "ifa_anc": {
        "id": "ifa_anc",
        "citation": "SEC-01-ANC-03",
        "guideline": "Iron Folic Acid (IFA) 1 tablet daily (100mg elemental iron + 500mcg folic acid) starting from 2nd trimester",
    },
    "ifa_therapeutic": {
        "id": "ifa_therapeutic",
        "citation": "SEC-01-ANC-03",
        "guideline": "Therapeutic IFA: 2 tablets daily under Medical Officer supervision for mild-moderate anaemia",
    },
    "paracetamol_pediatric": {
        "id": "paracetamol_pediatric",
        "citation": "SEC-02-HBNC-04",
        "guideline": "Paracetamol 10-15 mg/kg per dose for axillary temperature > 101°F",
    },
    "kmc_care": {
        "id": "kmc_care",
        "citation": "SEC-02-HBNC-02",
        "guideline": "Continuous Kangaroo Mother Care (KMC) skin-to-skin contact + frequent spoon feeds of expressed breast milk",
    },
    "doctor_referral": {
        "id": "doctor_referral",
        "citation": "SEC-08-SCP-01",
        "guideline": "Consult Medical Officer for prescription. Frontline health workers cannot prescribe or modify prescription drugs.",
    },
}


def _hash_seed(seed_str: str, max_val: int) -> int:
    h = hashlib.sha256(seed_str.encode("utf-8")).hexdigest()
    return int(h[:8], 16) % max_val


def _parse_date(val: Any) -> date | None:
    if not val or pd.isna(val):
        return None
    s = str(val).strip()
    if not s or s.lower() in ("nan", "none", ""):
        return None
    try:
        return date.fromisoformat(s[:10])
    except ValueError:
        return None


def generate_synthetic_patients(count: int = 360) -> list[dict[str, Any]]:
    """Generates deterministic synthetic demo patients across AP districts."""
    first_names_f = [
        "Lakshmi",
        "Bhavani",
        "Ananya",
        "Saraswathi",
        "Sunita",
        "Padmavathi",
        "Kavitha",
        "Swathi",
        "Divya",
        "Gayatri",
        "Sandhya",
        "Renuka",
        "Lavanya",
        "Haritha",
        "Geetha",
        "Sravani",
        "Deepika",
        "Manjula",
    ]
    first_names_m = [
        "Venkata",
        "Srinivas",
        "Satyanarayana",
        "Ramesh",
        "Suresh",
        "Nagaraju",
        "Appa Rao",
        "Kishore",
        "Chandra Sekhar",
        "Mahesh",
        "Krishna Murthy",
        "Rajesh",
        "Pavan Kumar",
        "Gopal",
        "Naresh",
        "Prasad",
        "Sudhakar",
    ]
    surnames = [
        "Peddireddy",
        "Vangaveeti",
        "Kandula",
        "Chalasani",
        "Rayapati",
        "Galla",
        "Magunta",
        "Konidela",
        "Nandamuri",
        "Daggubati",
        "Bollineni",
        "Mekapati",
    ]

    categories = ["anc", "hbnc", "imm", "nut", "ncd", "high_risk"]
    past_diseases_pool = [
        "hypertension",
        "type2_diabetes",
        "moderate_anaemia",
        "none_known",
        "asthma_mild",
    ]
    infections_pool = [
        "none_known",
        "seasonal_viral_fever",
        "acute_watery_diarrhoea",
        "urti",
        "uti_history",
    ]
    fevers_pool = [
        "no_fever",
        "mild_cold_cough",
        "intermittent_fever",
        "fever_with_chills",
        "fever_with_diarrhoea",
    ]
    allergies_pool = [
        "none_known",
        "none_known",
        "sulfa_drugs",
        "dust_allergy",
        "penicillin_allergy",
    ]
    immunization_pool = [
        "up_to_date",
        "due_for_booster",
        "delayed_pentavalent",
        "due_for_mr1",
        "fully_immunized",
    ]

    # Non-Chandrapuri demonstration districts
    demo_districts = [
        "kakinada",
        "east_godavari",
        "visakhapatnam",
        "guntur",
        "chittoor",
        "kurnool",
    ]

    synthetic_records: list[dict[str, Any]] = []

    for i in range(1, count + 1):
        mid = f"M-SYN-{i:04d}"
        hid = f"HH-SYN-{((i - 1) // 3) + 1:04d}"
        house_no = f"AP-{100 + (i % 800)}"

        # Deterministic selections based on index
        dist_idx = (i - 1) % len(demo_districts)
        district_id = demo_districts[dist_idx]
        villages = DISTRICT_VILLAGES[district_id]
        village = villages[(i // 2) % len(villages)]

        ashas = DISTRICT_ASHAS[district_id]
        asha_id, asha_name = ashas[i % len(ashas)]

        cat = categories[i % len(categories)]
        is_high_risk = cat == "high_risk" or (i % 7 == 0)

        # Gender, Name, Age, and Clinical specifics
        if cat in ("anc", "high_risk") and (i % 2 == 0):
            sex = "F"
            name = f"{first_names_f[i % len(first_names_f)]} {surnames[(i * 3) % len(surnames)]}"
            age_years = 20 + (i % 15)
            dob = TODAY - timedelta(days=age_years * 365 + (i * 17) % 300)
            is_pregnant = "Y"
            weeks_gest = 12 + (i % 28)
            lmp_date = (TODAY - timedelta(days=weeks_gest * 7)).isoformat()
            bp_sys = 145 if is_high_risk else (110 + (i % 20))
            bp_dia = 95 if is_high_risk else (70 + (i % 15))
            hb_val = 6.4 if is_high_risk else (10.5 + (i % 3))
            vitals = f"BP: {bp_sys}/{bp_dia} mmHg | Hb: {hb_val} g/dL | Gestation: {weeks_gest} wks"
            med_info = PROTOCOL_MEDICATIONS[
                "ifa_therapeutic" if is_high_risk else "ifa_anc"
            ]
            past_dis = "severe_anaemia" if is_high_risk else "none_known"
            due_reason = "ANC Checkup & IFA distribution"
        elif cat == "hbnc":
            sex = "F" if (i % 2 == 0) else "M"
            first_n = "Baby " + (
                first_names_f[i % len(first_names_f)]
                if sex == "F"
                else first_names_m[i % len(first_names_m)]
            )
            name = f"{first_n} {surnames[i % len(surnames)]}"
            age_days = 1 + (i % 42)
            dob = TODAY - timedelta(days=age_days)
            age_years = 0
            is_pregnant = "N"
            lmp_date = None
            birth_wt = 1.7 if is_high_risk else round(2.5 + (i % 15) * 0.1, 1)
            vitals = (
                f"Birth Weight: {birth_wt} kg | Age: {age_days} days | Temp: 98.2°F"
            )
            med_info = PROTOCOL_MEDICATIONS[
                "kmc_care" if birth_wt < 2.0 else "paracetamol_pediatric"
            ]
            past_dis = "low_birth_weight" if birth_wt < 2.0 else "none_known"
            due_reason = f"HBNC Home Visit Day {age_days}"
        elif cat in ("imm", "nut"):
            sex = "F" if (i % 2 == 0) else "M"
            first_n = (
                first_names_f[i % len(first_names_f)]
                if sex == "F"
                else first_names_m[i % len(first_names_m)]
            )
            name = f"{first_n} {surnames[i % len(surnames)]}"
            age_months = 2 + (i % 58)
            dob = TODAY - timedelta(days=age_months * 30)
            age_years = age_months // 12
            is_pregnant = "N"
            lmp_date = None
            muac = 11.2 if is_high_risk else round(12.5 + (i % 30) * 0.1, 1)
            edema = "Y" if (is_high_risk and i % 2 == 0) else "N"
            vitals = f"MUAC: {muac} cm | Weight: {round(4.0 + age_months * 0.4, 1)} kg | Bilateral Edema: {edema}"
            med_info = PROTOCOL_MEDICATIONS[
                "ors_zinc" if is_high_risk else "paracetamol_pediatric"
            ]
            past_dis = "severe_acute_malnutrition" if is_high_risk else "none_known"
            due_reason = (
                "Nutrition Screening & Growth Monitoring"
                if cat == "nut"
                else "Immunization Follow-up"
            )
        else:  # ncd or general adult
            sex = "M" if (i % 2 == 0) else "F"
            first_n = (
                first_names_m[i % len(first_names_m)]
                if sex == "M"
                else first_names_f[i % len(first_names_f)]
            )
            name = f"{first_n} {surnames[i % len(surnames)]}"
            age_years = 35 + (i % 45)
            dob = TODAY - timedelta(days=age_years * 365)
            is_pregnant = "N"
            lmp_date = None
            bp_sys = 158 if is_high_risk else (126 + (i % 20))
            bp_dia = 98 if is_high_risk else (80 + (i % 12))
            rbs = 210 if is_high_risk else (110 + (i % 50))
            vitals = f"BP: {bp_sys}/{bp_dia} mmHg | Random Blood Sugar: {rbs} mg/dL"
            med_info = PROTOCOL_MEDICATIONS["doctor_referral"]
            past_dis = (
                "htn_and_dm"
                if is_high_risk
                else past_diseases_pool[i % len(past_diseases_pool)]
            )
            due_reason = "NCD Chronic Care Follow-up"

        inf_id = infections_pool[(i * 2) % len(infections_pool)]
        fev_id = fevers_pool[(i * 3) % len(fevers_pool)]
        alg_id = allergies_pool[(i * 5) % len(allergies_pool)]
        imm_id = immunization_pool[i % len(immunization_pool)]

        next_due = (TODAY + timedelta(days=1 + (i % 20))).isoformat()

        rec = {
            "member_id": mid,
            "household_id": hid,
            "name": name,
            "relation": "head"
            if age_years >= 25 and sex == "M"
            else ("wife" if age_years >= 20 and sex == "F" else "child"),
            "sex": sex,
            "dob": dob.isoformat(),
            "age_years": age_years,
            "village": village,
            "district": district_id,
            "asha_id": asha_id,
            "asha_name": asha_name,
            "anm_name": f"ANM {district_id.title()} PHC",
            "house_no": house_no,
            "pregnant": is_pregnant,
            "lmp_date": lmp_date,
            "clinical_category": cat,
            "is_high_risk": is_high_risk,
            "past_diseases": past_dis,
            "infection_history": inf_id,
            "fever_cold_history": fev_id,
            "allergies": alg_id,
            "immunisation_history": imm_id,
            "allowed_medication_dosage": med_info["guideline"],
            "medication_citation": med_info["citation"],
            "last_recorded_vitals": vitals,
            "due_reason": due_reason,
            "next_due_date": next_due,
            "asha_visit_notes": f"Routine checkup performed by {asha_name}. Beneficiary advised on diet, hygiene, and danger signs.",
            "is_synthetic": True,
            "is_synthetic_ui_record": True,
        }
        synthetic_records.append(rec)

    return synthetic_records


def build_enriched_dataset(
    reg_path: Path,
    hh_path: Path,
    ashas_path: Path | None = None,
) -> list[dict[str, Any]]:
    """Builds enriched dataset deterministically while keeping original records intact."""
    if not reg_path.exists():
        raise FileNotFoundError(f"Register file not found: {reg_path}")

    # Read strictly read-only
    with open(reg_path, encoding="utf-8") as f:
        reg_df = pd.read_csv(f)

    hh_map: dict[str, str] = {}
    if hh_path.exists():
        with open(hh_path, encoding="utf-8") as f:
            hh_df = pd.read_csv(f)
            hh_map = dict(
                zip(
                    hh_df["household_id"].astype(str),
                    hh_df["house_no"].astype(str),
                    strict=False,
                )
            )

    # Read ashas.csv if provided or adjacent to reg_path
    if ashas_path is None:
        cand = reg_path.parent / "ashas.csv"
        if cand.exists():
            ashas_path = cand

    asha_name_map: dict[str, str] = {}
    if ashas_path and ashas_path.exists():
        with open(ashas_path, encoding="utf-8") as f:
            ashas_df = pd.read_csv(f)
            for _, a_row in ashas_df.iterrows():
                aid = str(a_row.get("asha_id", "")).strip()
                aname = str(a_row.get("asha_name", "")).strip()
                if aid and aname:
                    asha_name_map[aid] = aname

    enriched_records: list[dict[str, Any]] = []

    # Sort deterministically by member_id
    sorted_df = reg_df.sort_values(by="member_id").reset_index(drop=True)

    for _, row in sorted_df.iterrows():
        hid = str(row.get("household_id", "")).strip()
        district_id = "chandrapuri"
        house_no = hh_map.get(hid, "HN-" + (hid[-4:] if len(hid) >= 4 else "001"))

        dob = _parse_date(row.get("dob"))
        age_days = ((TODAY - dob).days) if dob else 10000

        is_pregnant = str(row.get("pregnant", "")).strip().upper() == "Y"
        ncd_str = str(row.get("ncd_condition", "")).strip()
        if ncd_str.lower() in ("nan", "none", ""):
            ncd_str = ""
        has_htn = "HTN" in ncd_str.upper()
        has_dm = "DM" in ncd_str.upper()

        # Determine clinical category & risk
        is_high_risk = False

        try:
            hb_val = (
                float(row.get("last_hb_gdl", 0))
                if pd.notna(row.get("last_hb_gdl"))
                else None
            )
        except (ValueError, TypeError):
            hb_val = None

        try:
            muac_val = (
                float(row.get("last_muac_cm", 0))
                if pd.notna(row.get("last_muac_cm"))
                else None
            )
        except (ValueError, TypeError):
            muac_val = None

        has_edema = str(row.get("bilateral_pitting_oedema", "")).strip().upper() == "Y"
        bp_raw = (
            str(row.get("last_anc_bp", "")).strip()
            or str(row.get("last_bp_reading", "")).strip()
        )
        bp_val = "" if bp_raw.lower() in ("nan", "none") else bp_raw

        # Clinical Category Classification
        if is_pregnant:
            clinical_cat = "anc"
            if (hb_val and hb_val < 7.0) or (
                "/" in bp_val
                and bp_val.split("/")[0].isdigit()
                and int(bp_val.split("/")[0]) >= 140
            ):
                is_high_risk = True
                clinical_cat = "high_risk"
        elif age_days <= 42:
            clinical_cat = "hbnc"
            if str(row.get("place_of_delivery", "")).lower() == "home":
                is_high_risk = True
        elif age_days <= 1825:
            if (muac_val and muac_val < 11.5) or has_edema:
                clinical_cat = "nut"
                is_high_risk = True
            else:
                clinical_cat = "imm"
        elif has_htn or has_dm:
            clinical_cat = "ncd"
            if has_htn and has_dm:
                is_high_risk = True
        else:
            clinical_cat = "general"

        # Past diseases: reflect recorded data if present, or None
        past_disease = ncd_str if ncd_str else None

        # Allowed medication dosage strictly from protocol corpus
        if is_pregnant:
            if hb_val and hb_val < 10.0:
                med_info = PROTOCOL_MEDICATIONS["ifa_therapeutic"]
            else:
                med_info = PROTOCOL_MEDICATIONS["ifa_anc"]
        elif muac_val and muac_val < 11.5:
            med_info = PROTOCOL_MEDICATIONS["ors_zinc"]
        elif (
            age_days <= 42
            and pd.notna(row.get("birth_weight_kg"))
            and float(row.get("birth_weight_kg", 2.5)) < 2.0
        ):
            med_info = PROTOCOL_MEDICATIONS["kmc_care"]
        else:
            med_info = PROTOCOL_MEDICATIONS["doctor_referral"]

        # Vitals display: format real vitals or None (never "BP: nan mmHg")
        vitals_parts = []
        if bp_val:
            vitals_parts.append(f"BP: {bp_val} mmHg")
        if hb_val is not None and not pd.isna(hb_val):
            vitals_parts.append(f"Hb: {hb_val} g/dL")
        if muac_val is not None and not pd.isna(muac_val):
            vitals_parts.append(f"MUAC: {muac_val} cm")
        bw = row.get("birth_weight_kg")
        if pd.notna(bw) and str(bw).strip().lower() not in ("nan", "none", ""):
            vitals_parts.append(f"Birth Wt: {bw} kg")

        vitals_str = " | ".join(vitals_parts) if vitals_parts else None

        # ASHA real name from ashas.csv
        raw_asha_id = str(row.get("asha_id", "")).strip()
        asha_name = asha_name_map.get(raw_asha_id, raw_asha_id or "Sunaina Devi")

        imm_status = str(row.get("immunisation_status", "")).strip()
        if imm_status.lower() in ("nan", "none", ""):
            imm_status = None

        # Clean all row values to convert float NaN to None for JSON compliance
        rec: dict[str, Any] = {}
        for k, v in dict(row).items():
            if pd.isna(v):
                rec[k] = None
            else:
                rec[k] = v

        rec["district"] = district_id
        rec["house_no"] = house_no
        rec["clinical_category"] = clinical_cat
        rec["is_high_risk"] = is_high_risk
        rec["past_diseases"] = past_disease
        rec["infection_history"] = None
        rec["fever_cold_history"] = None
        rec["allergies"] = None
        rec["immunisation_history"] = imm_status
        rec["allowed_medication_dosage"] = med_info["guideline"]
        rec["medication_citation"] = med_info["citation"]
        rec["last_recorded_vitals"] = vitals_str
        rec["asha_id"] = raw_asha_id
        rec["asha_name"] = asha_name
        rec["anm_name"] = "ANM Nirmala (Chandrapuri Sub-Centre)"
        rec["due_reason"] = "Routine frontline healthcare monitoring"
        rec["next_due_date"] = (TODAY + timedelta(days=7)).isoformat()
        rec["asha_visit_notes"] = (
            f"Household visit mapped to {asha_name}. Routine frontline monitoring."
        )
        rec["is_synthetic"] = False
        rec["is_synthetic_ui_record"] = False
        enriched_records.append(rec)

    # Add 360 additional synthetic demonstration records across AP districts
    synthetic_demo = generate_synthetic_patients(count=360)
    enriched_records.extend(synthetic_demo)

    return enriched_records


def run_enrichment(
    data_dir: Path,
    json_out_path: Path,
    csv_out_path: Path,
) -> None:
    """Executes enrichment generation and saves output JSON and CSV."""
    reg_path = data_dir / "household_register.csv"
    hh_path = data_dir / "households.csv"
    ashas_path = data_dir / "ashas.csv"

    records = build_enriched_dataset(reg_path, hh_path, ashas_path)

    json_out_path.parent.mkdir(parents=True, exist_ok=True)
    csv_out_path.parent.mkdir(parents=True, exist_ok=True)

    # Save JSON with clean formatting
    with open(json_out_path, "w", encoding="utf-8") as f:
        json.dump(records, f, indent=2, ensure_ascii=False)

    # Save CSV
    df = pd.DataFrame(records)
    df.to_csv(csv_out_path, index=False, encoding="utf-8")

    print(f"Generated {len(records)} enriched records.")
    print(f"  - Written to {json_out_path}")
    print(f"  - Written to {csv_out_path}")


if __name__ == "__main__":
    project_root = Path(__file__).resolve().parents[3]
    d_dir = (
        project_root / "data"
        if (project_root / "data" / "household_register.csv").exists()
        else project_root / "data" / "sample"
    )
    j_out = project_root / "web" / "public" / "data" / "register_enriched.json"
    c_out = project_root / "data" / "sample" / "register_enriched.csv"

    run_enrichment(d_dir, j_out, c_out)
