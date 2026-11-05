# Contributing to SwasthyaVani

Thank you for your interest in contributing to SwasthyaVani! This project is an open-source, zero-server clinical decision support companion and visit planner built for frontline community health workers (ASHAs and ANMs).

---

## 1. Core Architectural Tenets
1. **Zero-Server & Offline-First**: All application screens, clinical guidance, population registers, and visit planners must function 100% offline in browser storage.
2. **Deterministic & Grounded**: We do not use non-deterministic generative models for frontline medical advice. All answers must be grounded in pre-indexed protocol sections with verifiable section citations.
3. **Cognitive Clarity (Strictly No Emojis / Icons)**: The user interface avoids all emojis and pictograms to maintain unambiguous clinical legibility on low-cost devices.
4. **Trilingual Parity**: All interface strings and clinical advice support English, Telugu, and Hindi.

---

## 2. Development Setup

### Prerequisites
- Node.js 20+ and npm
- Python 3.9+

### Frontend Web Setup (`web/`)
1. Install dependencies:
   ```bash
   cd web
   npm install
   ```
2. Start the local development server:
   ```bash
   npm run dev
   ```
3. Run the test suite and linter:
   ```bash
   npm test
   npm run lint
   ```
4. Build the production bundle:
   ```bash
   npm run build
   ```

### Data Pipeline Setup (`pipeline/`)
1. Create and activate a virtual environment:
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```
2. Install package in editable mode:
   ```bash
   pip install -e pipeline/
   pip install pytest ruff
   ```
3. Run unit tests and linter:
   ```bash
   pytest pipeline/tests/ -v
   ruff check pipeline/
   ```
4. Prepare synthetic data and build search indices:
   ```bash
   python scripts/prepare_data.py
   ```
5. Run the referential integrity audit:
   ```bash
   python pipeline/src/swasthyavani/verify_integrity.py
   ```

---

## 3. Pull Request Guidelines
1. Fork the repository and create your branch from `main`.
2. Ensure all web and python test suites pass.
3. Ensure no personal data, secrets, or emojis are introduced.
4. Submit your pull request with a clear description of the frontline benefit.

