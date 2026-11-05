/**
 * SwasthyaVani Central Configuration
 * All clinical thresholds, limits, anchor dates, and feature flags in ONE place.
 */

export const CONFIG = {
  APP_NAME: 'SwasthyaVani',
  APP_SUBTITLE: 'Frontline Health-Worker Companion',
  VERSION: '1.0.0',
  APP_VERSION: '1.0.0',

  // Anchor demonstration date for scheduling
  TODAY: '2026-10-26',

  // BM25 Retrieval settings
  BM25: {
    k1: 1.5,
    b: 0.75,
    maxCitations: 2,
    maxAnswerChars: 400,
    confidenceThreshold: 1.0,
  },

  // Clinical visit horizons & grace windows (09_VIS)
  VISIT_RULES: {
    horizonDays: 6,
    graceDays: 28,
    followupIntervalDays: 30,
    lowBirthWeightCutoffKg: 2.0,
    dangerBirthWeightKg: 1.8,
    severeAnaemiaHbCutoff: 7.0,
    bpSystolicHigh: 140,
    bpDiastolicHigh: 90,
    muacSamCutoffCm: 11.5,
  },

  // Emergency contact lines
  EMERGENCY: {
    AMBULANCE: '108',
    PREGNANCY_HELPLINE: '102',
    CHILDLINE: '1098',
  },

  // Feature flags
  FEATURES: {
    ENABLE_VOICE: true,
    ENABLE_OFFLINE_SYNC: true,
    ENABLE_PERF_TELEMETRY: true,
  },

  // Supported languages
  LANGUAGES: [
    { code: 'en', label: 'English', native: 'English' },
    { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
    { code: 'te', label: 'Telugu', native: 'తెలుగు' },
  ],
  DEFAULT_LANGUAGE: 'en',
};

