# Ingesting and Managing Clinical Protocols in SwasthyaVani

SwasthyaVani utilizes a deterministic, client-side Okapi BM25 retrieval engine to query clinical operating protocols. Because the application runs 100% offline in rural environments with zero server dependencies, all protocol guidelines are pre-indexed into lightweight static JSON artifacts during build time.

This guide explains how health administrators, clinical officers, and technical maintainers can format, ingest, and index official state or national health guidelines into SwasthyaVani.

---

## 1. Protocol Markdown Schema

All source protocol files are stored as plain Markdown (`.md`) documents. The ingestion pipeline (`pipeline/src/swasthyavani/chunk.py`) parses these files into searchable section chunks based on Markdown Level 2 Headings (`##`).

### File Naming Convention
Place markdown protocol files in `data/protocols/` (or your designated input directory). Recommended naming format:
```text
<number>_<program_code>_<description>.md
```
*Examples:*
- `01_ANC_antenatal_care.md`
- `02_IMM_immunisation_schedule.md`
- `03_ESC_danger_signs_referral.md`

### Required Section Header Format
Each actionable clinical guideline or topic **MUST** start with a level 2 header (`##`) adhering to the following structure:
```markdown
## <SECTION_ID>: <Descriptive Section Title>
```
- `<SECTION_ID>`: An uppercase, hyphenated identifier consisting of an alphabetic program tag (e.g., `ANC`, `HBNC`, `IMM`, `NUT`, `NCD`, `ESC`, `SCP`, `CHD`) followed by a numbered index (e.g., `ANC-1.1`, `HBNC-2.3`, `ESC-1.2`).
- `<Descriptive Section Title>`: A concise summary of the clinical action or topic in English (e.g. *Identification of Severe Anaemia*, *Management of Diarrhoea*).

### Example Protocol Content
```markdown
# Protocol: Maternal Health and Antenatal Care (Sample Only)

> NOTICE: This is an illustrative example written for format verification. It does not replace official clinical judgment.

## ANC-1.1: Antenatal Registration and Scheduling
Every pregnant woman should be registered within the first 12 weeks of pregnancy at the local Anganwadi Centre or Sub-Centre. A minimum of four antenatal care (ANC) check-ups are recommended:
1. First visit: Within 12 weeks (1st trimester) for registration, baseline vitals, and blood typing.
2. Second visit: Between 14 and 26 weeks (2nd trimester) for ultrasound screening and fetal movement assessment.
3. Third visit: Between 28 and 34 weeks (3rd trimester) for pre-eclampsia screening and fundal height measurement.
4. Fourth visit: Between 36 weeks and term to establish the delivery plan and identify malpresentation.

## ANC-1.2: Prophylaxis and Nutrition
Administer 180 tablets of Iron and Folic Acid (IFA) starting from the 14th week of gestation. In cases of diagnosed moderate anaemia (Hb 7.0–10.9 g/dL), double the dosage to two tablets daily as per national guidelines.
```

---

## 2. Ingesting and Building the Search Index

To compile your markdown protocols into client-side JSON files:

1. Place your protocol `.md` files into `data/protocols/` (or use the sample files in `data/sample/protocols/`).
2. Run the offline indexing script:
   ```bash
   python scripts/prepare_data.py
   ```
   *Or execute via the pipeline module directly:*
   ```bash
   python pipeline/src/swasthyavani/build_index.py --protocols-dir data/protocols --out-dir frontend/public/data
   ```

### Generated Artifacts
The pipeline outputs three static JSON files to `frontend/public/data/`:
1. `sections.json`: A dictionary mapping each `SECTION_ID` (e.g. `ANC-1.1`) to its title, full text, and parent protocol document.
2. `index.json`: An inverted index containing term frequencies, document lengths, and document frequencies for fast, sub-millisecond BM25 ranking on mobile browsers.
3. `lexicon.json`: A trilingual synonym map that expands English, Telugu, and Hindi clinical keywords to the primary index tokens.

---

## 3. How Answers Display Source Citations

Every clinical query processed by the SwasthyaVani interface displays:
- **Verified Section Citation**: The exact Section ID (e.g. `ANC-1.1`, `ESC-1.2`) linked directly to the guideline passage.
- **Protocol Title**: The official document name from which the advice was extracted.
- **Original Source Text**: The extractive paragraph, ensuring the frontline worker can verify the recommendation with zero hallucinations.

---

## 4. Graceful Degradation When Protocols Are Missing

If the web application is loaded in an environment where protocol files or `sections.json` have not yet been built:
- The user interface does **NOT** crash.
- The `Ask Protocols` screen displays a clear, localized notification:
  > *"Clinical protocols have not been loaded into the local index. Please refer to documentation to index official health guidelines."*
- Frontline workers can still use the **Beneficiaries Register** and **Visit Planner**, which operate autonomously using local storage.

