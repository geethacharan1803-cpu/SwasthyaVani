# Changelog

All notable changes to the SwasthyaVani project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-11-04

### Added
- **Trilingual Clinical Decision Support**: Client-side Okapi BM25 search engine querying pre-indexed protocol guidelines with sub-millisecond response times.
- **Deterministic 3-Layer Clinical Triage**:
  - Layer 1: Universal red-flag emergency detection (convulsions, obstetric hemorrhage, neonatal hypothermia, sepsis) with immediate 108/102 referral guidance.
  - Layer 2: Scope-guard refusal for prescription dosages and invasive procedures, redirecting patients to the PHC Medical Officer.
  - Layer 3: Extractive clinical protocol matching with verified Section ID citations (`ANC-1.1`, etc.).
- **Beneficiaries Register**: Client-side population register with cascading village/cohort filters, real-time search, and validated Add Beneficiary modal.
- **Daily Visit Planner**: Date navigator, priority categorization (Urgent, Due today, Overdue, Upcoming), village walking route sorting, and visit completion logging.
- **Monthly Activity Dashboard**: Accessible SVG 30-day visit trend chart and village workload progress summaries.
- **Offline PWA Architecture**: `swasthyavani-v5` Service Worker providing 100% offline access to all app screens and static clinical JSON indices.
- **Trilingual Speech & Audio**: Native Web Speech API audio narration and online voice input for English, Telugu, and Hindi.
- **Offline Data Tooling (`pipeline/`)**: Python data preparation scripts to chunk markdown protocols, compile inverted BM25 indices, enrich population records, and verify referential data integrity.
- **Automated CI/CD**: GitHub Actions workflow (`ci.yml`) matrix-testing Web (Node 20, 22) and Python (3.10, 3.11, 3.12).

