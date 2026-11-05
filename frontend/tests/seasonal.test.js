import { describe, it, expect } from 'vitest';
import { answerQuestion, findSeasonalMatch } from '../src/core/answer.js';
import seasonalData from '../src/data/seasonal_health_pack.json';
import symptomsReference from '../src/data/symptoms_reference.json';

describe('Comprehensive Symptom Taxonomy (Task E)', () => {
  it('defines 30+ comprehensive frontline symptoms with valid metadata', () => {
    expect(symptomsReference.length).toBeGreaterThanOrEqual(30);

    const ids = new Set();
    symptomsReference.forEach((sym) => {
      // Stable unique ID
      expect(sym.id).toMatch(/^SYM-[A-Z0-9-]+$/);
      expect(ids.has(sym.id)).toBe(false);
      ids.add(sym.id);

      // Trilingual labels
      expect(sym.nameEn).toBeTruthy();
      expect(sym.nameHi).toBeTruthy();
      expect(sym.nameTe).toBeTruthy();

      // Valid danger level
      expect(['emergency', 'urgent_referral', 'frontline_protocol']).toContain(sym.dangerLevel);

      // Spoken variants
      expect(Array.isArray(sym.spokenVariantsEn)).toBe(true);
      expect(sym.spokenVariantsEn.length).toBeGreaterThanOrEqual(2);
      expect(Array.isArray(sym.spokenVariantsHi)).toBe(true);
      expect(Array.isArray(sym.spokenVariantsTe)).toBe(true);

      // Protocol citation & frontline clinical action
      expect(sym.citation).toBeTruthy();
      expect(sym.actionEn).toBeTruthy();
      expect(sym.actionHi).toBeTruthy();
      expect(sym.actionTe).toBeTruthy();
    });
  });

  it('classifies red-flag emergency symptoms correctly with clinical citations and immediate action protocols', () => {
    const emergencies = symptomsReference.filter((s) => s.dangerLevel === 'emergency');
    expect(emergencies.length).toBeGreaterThanOrEqual(10);
    emergencies.forEach((sym) => {
      expect(sym.citation).toBeTruthy();
      const hasAction =
        sym.actionEn.includes('Refer') ||
        sym.actionEn.includes('108') ||
        sym.actionEn.includes('102') ||
        sym.actionEn.includes('DANGER SIGN');
      expect(hasAction).toBe(true);
    });
  });
});

describe('Seasonal Health Pack & Statement Understanding', () => {
  const mockBm25 = {
    search: () => [],
  };
  const mockSections = {
    'ESC-1.1': { section_id: 'ESC-1.1', clean_text: 'Refer immediately.' },
    'ESC-4.1': { section_id: 'ESC-4.1', clean_text: 'Obstetric hemorrhage: refer immediately.' },
    'ESC-6.3': { section_id: 'ESC-6.3', clean_text: 'Unconscious patient: call 108.' },
    'SCP-1.2': { section_id: 'SCP-1.2', clean_text: 'Consult doctor.' },
  };

  it('matches seasonal health conditions from aliases', () => {
    const dengueEn = findSeasonalMatch('I have dengue and fever');
    expect(dengueEn).not.toBeNull();
    expect(dengueEn.id).toBe('SEASONAL-DENGUE');

    const dengueHi = findSeasonalMatch('mujhe dengue bukhar ho gaya hai');
    expect(dengueHi).not.toBeNull();
    expect(dengueHi.id).toBe('SEASONAL-DENGUE');

    const dengueTe = findSeasonalMatch('naku dengu jwaram vachindi');
    expect(dengueTe).not.toBeNull();
    expect(dengueTe.id).toBe('SEASONAL-DENGUE');

    const heatStroke = findSeasonalMatch('bahut tez loo lag gayi hai');
    expect(heatStroke).not.toBeNull();
    expect(heatStroke.id).toBe('SEASONAL-HEAT-STROKE');

    const diarrhoeaTe = findSeasonalMatch('pillavanki neella virochanalu aytunnayi');
    expect(diarrhoeaTe).not.toBeNull();
    expect(diarrhoeaTe.id).toBe('SEASONAL-DIARRHOEA');
  });

  it('answers seasonal symptom reports with official public health citations', () => {
    const resEn = answerQuestion('I have dengue fever', mockBm25, mockSections, 400, {
      lang: 'en',
      seasonalPack: seasonalData,
    });
    expect(resEn.escalate).toBe(false);
    expect(resEn.type).toBe('seasonal');
    expect(resEn.citedSectionIds[0]).toBe('SEASONAL-DENGUE');
    expect(resEn.answerText).toContain('NCVBDC');
    expect(resEn.answerText).toContain('Paracetamol');

    const resHi = answerQuestion('mujhe dengue ho gaya hai', mockBm25, mockSections, 400, {
      lang: 'hi',
      seasonalPack: seasonalData,
    });
    expect(resHi.answerText).toContain('डेंगू');
    expect(resHi.answerText).toContain('पैरासिटामोल');

    const resTe = answerQuestion('naku dengue vachindi', mockBm25, mockSections, 400, {
      lang: 'te',
      seasonalPack: seasonalData,
    });
    expect(resTe.answerText).toContain('డెంగ్యూ');
    expect(resTe.answerText).toContain('పారాసిటమాల్');
  });

  it('maintains 100% recall for emergency danger signs inside statements', () => {
    // Statement with bleeding
    const resBleeding = answerQuestion(
      'I have dengue and bleeding from nose',
      mockBm25,
      mockSections
    );
    expect(resBleeding.escalate).toBe(true);
    expect(resBleeding.type).toBe('escalate');
    expect(resBleeding.answerText).toContain('DANGER SIGN — REFER IMMEDIATELY');

    // Statement with unconsciousness
    const resUnconscious = answerQuestion(
      'loose motions for 2 days and child is unconscious and limp',
      mockBm25,
      mockSections
    );
    expect(resUnconscious.escalate).toBe(true);
    expect(resUnconscious.type).toBe('escalate');

    // Telugu emergency
    const resTe = answerQuestion(
      'garbhini ki dengue undi mariyu raktham padutondi',
      mockBm25,
      mockSections
    );
    expect(resTe.escalate).toBe(true);
  });

  it('safely refuses prescription drug queries even for seasonal conditions', () => {
    const resRefusal = answerQuestion(
      'dengue me paracetamol syrup kitna dena hai 1 saal ke bachche ko?',
      mockBm25,
      mockSections
    );
    expect(resRefusal.refused).toBe(true);
    expect(resRefusal.type).toBe('refuse');
    expect(resRefusal.citedSectionIds).toContain('SCP-1.2');
  });

  it('provides safe danger-sign triage checklist for unlisted symptoms', () => {
    const resUnlisted = answerQuestion(
      'strange red rash on knee with mild itching',
      mockBm25,
      mockSections,
      400,
      { lang: 'en' }
    );
    expect(resUnlisted.type).toBe('fallback');
    expect(resUnlisted.answerText).toContain('danger signs');
    expect(resUnlisted.answerText).toContain('Medical Officer');
    expect(resUnlisted.citedSectionIds).toContain('SCP-1.2');
  });
});
