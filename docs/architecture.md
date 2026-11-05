# SwasthyaVani System Architecture

SwasthyaVani is engineered strictly as a **zero-server, offline-first progressive web application (PWA)** for community health workers (ASHAs and ANMs) in low-connectivity rural settings.

---

## 1. High-Level Architecture

The system decouples developer data preparation from client runtime execution:

```mermaid
flowchart TD
    subgraph Data_Tooling ["Developer Data Tooling (Offline Python Pipeline)"]
        RawProto["Clinical Guidelines (Markdown)"] --> ChunkEngine["Chunking Engine (chunk.py)"]
        RawRegister["Population Records (CSV)"] --> EnrichEngine["Enrichment Engine (enrich_ui_data.py)"]
        ChunkEngine --> Indexer["BM25 Indexer (build_index.py)"]
        EnrichEngine --> VisitScheduler["Visit Generator (visit_list.py)"]
        Indexer --> StaticJSON["Static JSON Files (sections.json, index.json, lexicon.json)"]
        VisitScheduler --> StaticJSON2["Static JSON Files (register_enriched.json, register_visits.json)"]
    end

    subgraph Static_Hosting ["Hosting Layer (Vercel / GitHub Pages)"]
        StaticJSON --> WebBuild["Vite Static Production Assets"]
        StaticJSON2 --> WebBuild
        WebBuild --> CDN["Global Edge CDN (HTML / CSS / JS / JSON)"]
    end

    subgraph Client_Browser ["Client Runtime (Chrome / Edge / Android WebView)"]
        CDN --> SW["Service Worker (swasthyavani-v5)"]
        SW --> CacheStorage["Browser Cache Storage (Offline Shell & Data)"]
        CacheStorage --> AppInit["Single Page App (main.js)"]
        
        subgraph Pure_Logic ["Pure Business Logic (core/)"]
            AppInit --> Escalation["Layer 1: Red-Flag Danger Signs (escalation.js)"]
            Escalation --> Refusal["Layer 2: Scope Guard & Refusal (refusal.js)"]
            Refusal --> BM25["Layer 3: Client-Side BM25 Retrieval (retrieval.js)"]
        end

        subgraph Local_Persistence ["Client Storage"]
            AppInit --> LocalStorage["localStorage (Settings, Visited Status, Notes, New Beneficiaries)"]
        end
    end
```

---

## 2. Clinical Question Flow & Multi-Layer Triage

When a frontline worker enters a query (via text or voice), it passes through a 3-layer deterministic decision pipeline:

```mermaid
sequenceDiagram
    autonumber
    actor ASHA as Frontline Health Worker
    actor UI as Query Interface (askView.js)
    actor L1 as Layer 1: Danger Sign Check (escalation.js)
    actor L2 as Layer 2: Scope Guard (refusal.js)
    actor L3 as Layer 3: Okapi BM25 Index (retrieval.js)
    actor Audio as Speech Synthesis (speaker.js)

    ASHA->>UI: Submit symptom query (Voice / Text in En, Te, or Hi)
    UI->>L1: Check query against emergency red-flag patterns
    alt Red Flag Detected (e.g. Convulsions, Heavy Bleeding, Shock)
        L1-->>UI: Immediate Ambulance (108/102) Transfer Guidance & Red Alert
    else No Emergency Danger Signs
        UI->>L2: Check if query asks for prescription dosages or invasive procedures
        alt Out of Scope (e.g. Antibiotic dose, injectables)
            L2-->>UI: Polite refusal with referral to PHC Medical Officer
        else In-Scope Clinical Question
            UI->>L3: Compute BM25 match scores across indexed protocol sections
            L3-->>UI: Best-matching clinical section with verified Section ID citation
        end
    end
    opt User clicks Listen
        UI->>Audio: Synthesize text in active language (en-IN, te-IN, hi-IN)
    end
```

---

## 3. Offline Caching Flow

```mermaid
flowchart LR
    Browser["Client Browser Request"] --> SW{"Service Worker Cache?"}
    SW -- "Cached (Hit)" --> Cache["Return Cached Asset / Data JSON"]
    SW -- "Not in Cache" --> Network{"Online?"}
    Network -- "Yes" --> Remote["Fetch from Edge CDN & Cache Asset"]
    Network -- "No" --> Fallback["Return Cached index.html / Graceful Offline Notice"]
```

---

## 4. Frontend Component Architecture

All UI components in `frontend/src/ui/` are stateless render functions driven by events and state passed from `frontend/src/main.js`:
- `header.js`: Top navigation, language selection toggle, high-contrast toggle, online/offline badge.
- `askView.js`: Voice and text search inputs, sample query chips by clinical program, trilingual audio narration controls.
- `registerView.js`: Beneficiary table, cascading filters (village, cohort, risk), beneficiary details modal.
- `registrationView.js`: Add Beneficiary modal form with client-side validation.
- `visitListView.js`: Scheduled visit cards grouped by priority (Urgent, Due today, Overdue, Upcoming), village route grouping, visit status toggle (`Done` / `Pending`), note entry modal.
- `dashboardView.js`: Pure SVG 30-day activity trend chart, program breakdown, village workload progress.
- `performanceView.js`: Client-side benchmark suite reporting live query latencies and offline status.

