# Multilingual Localization Guide (English, Telugu, Hindi)

SwasthyaVani provides complete trilingual localization across all user interfaces, clinical categories, danger alert escalations, and speech synthesis.

## 1. Supported Languages

| Code | Language | Script | Speech Locale | Coverage |
| :--- | :--- | :--- | :--- | :--- |
| `en` | English | Latin | `en-IN` | 100% UI & Clinical Lexicon |
| `te` | Telugu (తెలుగు) | Telugu | `te-IN` | 100% UI & Native Script |
| `hi` | Hindi (हिन्दी) | Devanagari | `hi-IN` | 100% UI & Native Script |

---

## 2. Localization Architecture

Language resources are maintained as key-value JSON dictionaries in `frontend/src/i18n/`:
- `en.json`: Canonical English strings.
- `te.json`: Natural colloquial Telugu phrasing tailored for ASHAs in Andhra Pradesh and Telangana.
- `hi.json`: Formal and colloquial Hindi phrasing tailored for rural health workers in central/northern states.

The application automatically persists the user's chosen language in `localStorage` under `swasthyavani_lang`.

---

## 3. How to Add a New Language

To add support for a new regional language (e.g. Odia, Bengali, Tamil, Kannada):

1. **Create the translation dictionary**:
   Copy `frontend/src/i18n/en.json` to `frontend/src/i18n/<lang_code>.json` (e.g. `ta.json` for Tamil).
2. **Translate all keys**:
   Translate every value, preserving all placeholder tokens (`{count}`, `{date}`, etc.).
3. **Register the language**:
   In `frontend/src/config.js`, add your new language to `SUPPORTED_LANGUAGES`:
   ```javascript
   export const SUPPORTED_LANGUAGES = [
     { code: 'en', label: 'English', speechLocale: 'en-IN' },
     { code: 'te', label: 'తెలుగు', speechLocale: 'te-IN' },
     { code: 'hi', label: 'हिन्दी', speechLocale: 'hi-IN' },
     { code: 'ta', label: 'தமிழ்', speechLocale: 'ta-IN' },
   ];
   ```
4. **Verify Key Parity**:
   Run the translation integrity tool to ensure 100% key match with zero missing translations:
   ```bash
   python pipeline/src/swasthyavani/translate_check.py
   ```
   *Or run the test suite:*
   ```bash
   npm test --prefix web
   pytest pipeline/tests
   ```

---

## 4. Important Clinical Disclaimer for Translators

> **CLINICAL REVIEW REQUIRED**: All medical terminology, danger-sign descriptions, and medication instructions must be reviewed and validated by licensed medical officers or public health nurse tutors before deployment in active community health programmes.

