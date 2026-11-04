from __future__ import annotations

import sys
from pathlib import Path

# Add pipeline/src to sys.path
root_dir = Path(__file__).resolve().parents[1]
pipe_src = root_dir / "pipeline" / "src"
if str(pipe_src) not in sys.path:
    sys.path.insert(0, str(pipe_src))

from swasthyavani.build_index import export_static_assets
from swasthyavani.enrich_ui_data import run_enrichment
from swasthyavani.visit_list import export_visit_list


def main() -> None:
    print("=" * 60)
    print("SwasthyaVani: Data Preparation & Search Indexing Pipeline")
    print("=" * 60)

    # 1. Determine paths
    data_dir = root_dir / "data"
    sample_dir = data_dir / "sample"
    web_public_data = root_dir / "web" / "public" / "data"
    web_public_data.mkdir(parents=True, exist_ok=True)

    # Protocol source
    proto_dir = data_dir / "protocols"
    if not proto_dir.exists() or not any(proto_dir.glob("*.md")):
        proto_dir = sample_dir / "protocols"
    print(f"[1/3] Building search index from protocols: {proto_dir}")
    export_static_assets(proto_dir, web_public_data)

    # Demographic data source
    input_data_dir = data_dir if (data_dir / "household_register.csv").exists() else sample_dir
    reg_csv = input_data_dir / "household_register.csv"
    enriched_json = web_public_data / "register_enriched.json"
    enriched_csv = sample_dir / "register_enriched.csv"
    print(f"\n[2/3] Enriching population records from: {input_data_dir}")
    run_enrichment(input_data_dir, enriched_json, enriched_csv)

    # Visit schedule generation
    visits_json = web_public_data / "register_visits.json"
    visits_csv = sample_dir / "visit_list.csv"
    print(f"\n[3/3] Generating scheduled visit lists from: {reg_csv}")
    export_visit_list(reg_csv, visits_csv, visits_json)

    print("\n[SUCCESS] All static data assets prepared successfully in web/public/data/")


if __name__ == "__main__":
    main()
