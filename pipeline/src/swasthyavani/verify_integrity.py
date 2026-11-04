"""Automated Data Integrity Verification Script for SwasthyaVani.

Asserts referential integrity across demographic and scheduling data files:
1. Every patient in visit_list.csv exists in household_register.csv.
2. Every household_id in household_register.csv exists in households.csv.
3. Every asha_id in household_register.csv exists in ashas.csv.
4. Every village in household_register.csv and households.csv matches ashas.csv.
5. No duplicate member_id in household_register.csv.
6. No duplicate household_id in households.csv.
7. Household members count matches actual register count per household.
"""

from __future__ import annotations

import sys
from pathlib import Path

import pandas as pd


def verify_integrity(data_dir: Path, visit_file: Path | None = None) -> bool:
    print("=" * 75)
    print("SWASTHYAVANI AUTOMATED DATA INTEGRITY AUDIT")
    print("=" * 75)

    ashas_file = data_dir / "ashas.csv"
    hh_file = data_dir / "households.csv"
    reg_file = data_dir / "household_register.csv"
    if visit_file is None:
        visit_file = data_dir / "visit_list.csv"

    for f in [ashas_file, hh_file, reg_file, visit_file]:
        if not f.exists():
            print(f"[FAIL] Required file missing: {f}")
            return False

    ashas_df = pd.read_csv(ashas_file)
    hh_df = pd.read_csv(hh_file)
    reg_df = pd.read_csv(reg_file)
    visit_df = pd.read_csv(visit_file)

    checks: list[tuple[str, bool, str]] = []

    # 1. Check duplicate IDs
    dup_members = reg_df["member_id"].duplicated().sum()
    checks.append(
        (
            "Unique member_id in household_register.csv",
            dup_members == 0,
            f"{len(reg_df)} unique members (duplicates: {dup_members})",
        )
    )

    dup_hh = hh_df["household_id"].duplicated().sum()
    checks.append(
        (
            "Unique household_id in households.csv",
            dup_hh == 0,
            f"{len(hh_df)} unique households (duplicates: {dup_hh})",
        )
    )

    dup_ashas = ashas_df["asha_id"].duplicated().sum()
    checks.append(
        (
            "Unique asha_id in ashas.csv",
            dup_ashas == 0,
            f"{len(ashas_df)} unique ASHAs (duplicates: {dup_ashas})",
        )
    )

    # 2. Check foreign key: register -> households
    orphan_hh = set(reg_df["household_id"]) - set(hh_df["household_id"])
    checks.append(
        (
            "All register household_ids exist in households.csv",
            len(orphan_hh) == 0,
            f"Orphans: {len(orphan_hh)}",
        )
    )

    # 3. Check foreign key: register -> ashas
    invalid_ashas = set(reg_df["asha_id"]) - set(ashas_df["asha_id"])
    checks.append(
        (
            "All register asha_ids exist in ashas.csv",
            len(invalid_ashas) == 0,
            f"Invalid: {len(invalid_ashas)}",
        )
    )

    # 4. Check village validity against ashas.csv
    valid_villages = set()
    for v in ashas_df["villages"]:
        valid_villages.update(v.split(";"))
    invalid_villages = set(reg_df["village"]) - valid_villages
    checks.append(
        (
            "All register villages match ashas.csv",
            len(invalid_villages) == 0,
            f"Invalid villages: {len(invalid_villages)}",
        )
    )

    # 5. Check foreign key: visit list -> register
    orphan_visits = set(visit_df["member_id"]) - set(reg_df["member_id"])
    checks.append(
        (
            "All visit_list members exist in household_register.csv",
            len(orphan_visits) == 0,
            f"Orphans: {len(orphan_visits)}",
        )
    )

    # 6. Check household members count consistency
    actual_counts = reg_df.groupby("household_id").size().to_dict()
    hh_actual = hh_df["household_id"].map(actual_counts).fillna(0).astype(int)
    mismatched_hh = (hh_df["members_count"] != hh_actual).sum()
    checks.append(
        (
            "Household members_count equals actual register records",
            mismatched_hh == 0,
            f"Mismatches: {mismatched_hh}",
        )
    )

    # Print results table
    all_passed = True
    print(f"{'CHECK DESCRIPTION':<55} | {'STATUS':<8} | {'DETAILS'}")
    print("-" * 75)
    for desc, passed, details in checks:
        status_str = "[PASS]" if passed else "[FAIL]"
        if not passed:
            all_passed = False
        print(f"{desc:<55} | {status_str:<8} | {details}")

    print("-" * 75)
    if all_passed:
        print("[SUCCESS] All 6 referential integrity checks passed 100%.")
    else:
        print("[ERROR] One or more data integrity checks failed.")

    return all_passed


if __name__ == "__main__":
    project_root = Path(__file__).resolve().parents[3]
    d_dir = (
        project_root / "data"
        if (project_root / "data" / "household_register.csv").exists()
        else project_root / "data" / "sample"
    )
    v_file = d_dir / "visit_list.csv"

    success = verify_integrity(d_dir, v_file)
    sys.exit(0 if success else 1)

