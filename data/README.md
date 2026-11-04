# SwasthyaVani Datasets and Data Architecture

This directory houses documentation and synthetic demonstration data for the SwasthyaVani offline frontline healthcare companion.

## 1. What is included here: `data/sample/`
All datasets located in `data/sample/` are **100% synthetic, deterministic demonstration records** generated for pipeline validation and developer onboarding.
- **No Real Patient Records**: Contains zero Protected Health Information (PHI), zero real patient names, zero 12-digit Aadhaar-like numbers, zero PAN numbers, and zero real phone numbers. All phone numbers use reserved sample ranges (`9000000001` - `9111000025`).
- **Sample Topology**:
  - `ashas.csv`: 3 fictional community health workers (Sunaina Devi, Kalavati Kumari, Shabnam Khatoon) across 3 sample rural habitations (Amrapur, Belwadi Tola, Dhanpura) under a demonstration primary health sub-centre.
  - `households.csv`: 10 synthetic household structures with synthetic geographical coordinates.
  - `household_register.csv`: 25 synthetic individuals spanning routine demographic cohorts (Antenatal Care / `ANC`, Home-Based Newborn Care / `HBNC`, Immunisation / `IMM`, Nutrition / `NUT`, Non-Communicable Diseases / `NCD`, and General population).
  - `protocols/`: 3 sample protocol documents (`01_sample_maternal_care.md`, `02_sample_child_health.md`, `03_sample_emergency_referral.md`) demonstrating valid markdown schema and section header structures (`ANC-1.1`, `IMM-1.1`, `ESC-1.1`). These are placeholder test documents and do NOT constitute clinical medical guidelines.

## 2. What is NOT included here
To protect privacy and respect intellectual property:
- **No Private or Proprietary Health Records**: No proprietary district truth tables, survey data, or restricted health datasets are included in this open-source repository.
- **No Unlicensed Clinical Texts**: Official clinical operating procedures published by state or national health departments should be ingested locally according to the instructions in `docs/adding-protocols.md`.

## 3. How to Ingest Your Own Official Clinical Guidelines
To ingest official Ministry of Health / National Health Mission protocols for your state or district:
1. Place your markdown or text protocol guidelines into a local directory (e.g. `data/protocols/`).
2. Follow the formatting and sectioning conventions detailed in [Adding Protocols Guide](../docs/adding-protocols.md).
3. Run the indexing pipeline script:
   ```bash
   python scripts/prepare_data.py
   ```
   This automatically builds the tokenized inverted index (`index.json`), extracted section snippets (`sections.json`), and the trilingual search lexicon (`lexicon.json`) inside `web/public/data/`.

