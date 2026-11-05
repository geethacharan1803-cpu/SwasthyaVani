import { describe, it, expect } from 'vitest';
import sampleQueries from '../src/data/sample_queries.json';
import { detectDanger } from '../src/core/escalation.js';
import { detectRefusal } from '../src/core/refusal.js';
import { answerQuestion } from '../src/core/answer.js';
import seasonalData from '../src/data/seasonal_health_pack.json';

describe('Table-Driven Benchmark of Sample Clinical Queries', () => {
  const mockBm25 = {
    search: (q) => {
      const qLower = String(q).toLowerCase();
      if (qLower.includes('bcg')) return [{ secId: 'IMM-2.1', score: 5.0 }];
      if (qLower.includes('penta')) return [{ secId: 'IMM-2.2', score: 5.0 }];
      if (qLower.includes('mr') || qLower.includes('measles')) return [{ secId: 'IMM-2.3', score: 5.0 }];
      if (qLower.includes('anc') || qLower.includes('chautha')) return [{ secId: 'ANC-1.2', score: 5.0 }];
      if (qLower.includes('td')) return [{ secId: 'ANC-5.1', score: 5.0 }];
      if (qLower.includes('ifa')) return [{ secId: 'ANC-3.1', score: 5.0 }];
      if (qLower.includes('hbnc')) return [{ secId: 'HBNC-1.1', score: 5.0 }];
      if (qLower.includes('kmc') || qLower.includes('kangaroo')) return [{ secId: 'HBNC-1.2', score: 5.0 }];
      if (qLower.includes('ors')) return [{ secId: 'CHD-1.2', score: 5.0 }];
      if (qLower.includes('zinc')) return [{ secId: 'CHD-1.3', score: 5.0 }];
      if (qLower.includes('saans') || qLower.includes('breathing')) return [{ secId: 'CHD-3.1', score: 5.0 }];
      if (qLower.includes('muac')) return [{ secId: 'NUT-1.2', score: 5.0 }];
      if (qLower.includes('stanpan') || qLower.includes('breastfeeding')) return [{ secId: 'NUT-2.1', score: 5.0 }];
      if (qLower.includes('aahar') || qLower.includes('feeding')) return [{ secId: 'NUT-2.2', score: 5.0 }];
      if (qLower.includes('blood pressure') || qLower.includes('hypertension')) return [{ secId: 'NCD-1.1', score: 5.0 }];
      if (qLower.includes('sugar') || qLower.includes('diabetes')) return [{ secId: 'NCD-1.2', score: 5.0 }];
      if (qLower.includes('namak') || qLower.includes('salt')) return [{ secId: 'NCD-2.1', score: 5.0 }];
      if (qLower.includes('kasrat') || qLower.includes('exercise')) return [{ secId: 'NCD-3.1', score: 5.0 }];
      return [{ secId: 'ANC-1.1', score: 2.0 }];
    },
  };

  const mockSections = {
    'ANC-1.1': { section_id: 'ANC-1.1', clean_text: 'ANC registration within 12 weeks.' },
    'ANC-1.2': { section_id: 'ANC-1.2', clean_text: '4th ANC check-up between 36 weeks and delivery.' },
    'ANC-3.1': { section_id: 'ANC-3.1', clean_text: 'IFA 1 tablet daily for 180 days; therapeutic 2 tablets daily for Hb < 11.' },
    'ANC-5.1': { section_id: 'ANC-5.1', clean_text: 'Td booster if two Td doses received in pregnancy within last 3 years.' },
    'HBNC-1.1': { section_id: 'HBNC-1.1', clean_text: 'HBNC home visits on days 1, 3, 7, 14, 21, 28, 42. Do not bathe low birth weight babies before 7 days.' },
    'HBNC-1.2': { section_id: 'HBNC-1.2', clean_text: 'Kangaroo Mother Care continuous skin-to-skin contact for babies < 2.0 kg.' },
    'CHD-1.2': { section_id: 'CHD-1.2', clean_text: 'ORS 1 packet in 1L clean water. Give frequent sips after each loose stool.' },
    'CHD-1.3': { section_id: 'CHD-1.3', clean_text: 'Zinc 20 mg dispersible tablet daily for 14 continuous days.' },
    'CHD-3.1': { section_id: 'CHD-3.1', clean_text: 'Fast breathing: >=50/min (2-12 mo), >=40/min (12 mo-5 yr). Cough > 2 weeks: refer for sputum test.' },
    'NUT-1.2': { section_id: 'NUT-1.2', clean_text: 'MUAC < 11.5 cm or bilateral pitting edema indicates SAM: refer urgently to NRC.' },
    'NUT-2.1': { section_id: 'NUT-2.1', clean_text: 'Exclusive breastfeeding for first 6 completed months.' },
    'NUT-2.2': { section_id: 'NUT-2.2', clean_text: 'Introduce complementary feeding at completed 6 months.' },
    'IMM-1.1': { section_id: 'IMM-1.1', clean_text: 'Vaccine is overdue when scheduled age has passed.' },
    'IMM-2.1': { section_id: 'IMM-2.1', clean_text: 'BCG up to 1 year; OPV-0 within 15 days of birth.' },
    'IMM-2.2': { section_id: 'IMM-2.2', clean_text: 'Pentavalent given only up to 1 year of age (365 days).' },
    'IMM-2.3': { section_id: 'IMM-2.3', clean_text: 'MR-1 at 9-12 months, catch-up up to 5 years.' },
    'IMM-2.4': { section_id: 'IMM-2.4', clean_text: 'Vitamin A: 9 doses total up to 5 years. JE in endemic districts only.' },
    'NCD-1.1': { section_id: 'NCD-1.1', clean_text: 'BP >= 140/90 mmHg: confirm on two occasions and refer to Medical Officer.' },
    'NCD-1.2': { section_id: 'NCD-1.2', clean_text: 'Fasting blood sugar >= 126 mg/dL indicates diabetes.' },
    'NCD-2.1': { section_id: 'NCD-2.1', clean_text: 'Restrict salt to less than 5 g (1 teaspoon) daily.' },
    'NCD-3.1': { section_id: 'NCD-3.1', clean_text: '150 minutes of moderate physical activity weekly.' },
    'NCD-4.1': { section_id: 'NCD-4.1', clean_text: 'Diabetic foot ulcer: inspect daily, keep clean and dry, refer to PHC.' },
    'ESC-1.1': { section_id: 'ESC-1.1', clean_text: 'DANGER SIGN — REFER IMMEDIATELY. Call 108 or 102.' },
    'ESC-1.2': { section_id: 'ESC-1.2', clean_text: 'DANGER SIGN — REFER IMMEDIATELY. Cold clammy extremities and shock.' },
    'ESC-2.1': { section_id: 'ESC-2.1', clean_text: 'DANGER SIGN — REFER IMMEDIATELY. Vaginal bleeding during pregnancy.' },
    'ESC-2.3': { section_id: 'ESC-2.3', clean_text: 'DANGER SIGN — REFER IMMEDIATELY. Severe headache, blurred vision, preeclampsia, convulsions.' },
    'ESC-2.4': { section_id: 'ESC-2.4', clean_text: 'DANGER SIGN — REFER IMMEDIATELY. Premature rupture of membranes with foul smelling fluid.' },
    'ESC-3.1': { section_id: 'ESC-3.1', clean_text: 'DANGER SIGN — REFER IMMEDIATELY. Severe postpartum hemorrhage.' },
    'ESC-3.2': { section_id: 'ESC-3.2', clean_text: 'DANGER SIGN — REFER IMMEDIATELY. Postpartum high fever > 38 C within 1 month.' },
    'ESC-4.1': { section_id: 'ESC-4.1', clean_text: 'DANGER SIGN — REFER IMMEDIATELY. Hypothermia or limp baby.' },
    'ESC-4.2': { section_id: 'ESC-4.2', clean_text: 'DANGER SIGN — REFER IMMEDIATELY. Umbilical cord redness or pus.' },
    'ESC-4.4': { section_id: 'ESC-4.4', clean_text: 'DANGER SIGN — REFER IMMEDIATELY. Newborn jaundice within 24 hours of birth.' },
    'ESC-5.1': { section_id: 'ESC-5.1', clean_text: 'DANGER SIGN — REFER IMMEDIATELY. Unable to drink or breastfeed, vomiting everything, convulsions, lethargic or unconscious.' },
    'ESC-5.2': { section_id: 'ESC-5.2', clean_text: 'DANGER SIGN — REFER IMMEDIATELY. Fast breathing with chest indrawing or stridor.' },
    'ESC-5.3': { section_id: 'ESC-5.3', clean_text: 'DANGER SIGN — REFER IMMEDIATELY. Severe dehydration with sunken eyes.' },
    'ESC-6.1': { section_id: 'ESC-6.1', clean_text: 'DANGER SIGN — REFER IMMEDIATELY. Sudden one-sided weakness or facial droop (stroke).' },
    'ESC-6.2': { section_id: 'ESC-6.2', clean_text: 'DANGER SIGN — REFER IMMEDIATELY. Crushing chest pain radiating to left arm (heart attack).' },
    'ESC-6.3': { section_id: 'ESC-6.3', clean_text: 'DANGER SIGN — REFER IMMEDIATELY. Diabetic coma or unconscious patient.' },
    'SCP-1.1': { section_id: 'SCP-1.1', clean_text: 'Outside frontline scope. Frontline workers cannot perform home deliveries or administer IV fluids.' },
    'SCP-1.2': { section_id: 'SCP-1.2', clean_text: 'Outside frontline worker protocols. Please refer to Medical Officer or ANM at PHC.' },
  };

  it('contains at least 60 sample queries spanning all 9 clinical topics', () => {
    expect(sampleQueries.length).toBeGreaterThanOrEqual(60);
    expect(sampleQueries.length).toBe(71);

    const topics = new Set(sampleQueries.map((q) => q.topic));
    const expectedTopics = ['anc', 'hbnc', 'chd', 'nut', 'imm', 'ncd', 'esc', 'seasonal', 'refusal'];
    for (const exp of expectedTopics) {
      expect(topics.has(exp)).toBe(true);
      const count = sampleQueries.filter((q) => q.topic === exp).length;
      expect(count).toBeGreaterThanOrEqual(7);
    }
  });

  it('guarantees complete trilingual script purity with zero missing translations', () => {
    const teluguRegex = /[\u0C00-\u0C7F]/;
    const devanagariRegex = /[\u0900-\u097F]/;

    sampleQueries.forEach((q, idx) => {
      expect(q.labelEn).toBeDefined();
      expect(q.labelEn.trim().length).toBeGreaterThan(0);

      expect(q.labelHi).toBeDefined();
      expect(q.labelHi.trim().length).toBeGreaterThan(0);
      expect(devanagariRegex.test(q.labelHi)).toBe(true);

      expect(q.labelTe).toBeDefined();
      expect(q.labelTe.trim().length).toBeGreaterThan(0);
      expect(teluguRegex.test(q.labelTe)).toBe(true);

      expect(q.qEn.trim().length).toBeGreaterThan(0);
      expect(q.qHi.trim().length).toBeGreaterThan(0);
      expect(q.qTe.trim().length).toBeGreaterThan(0);
      expect(devanagariRegex.test(q.qHi)).toBe(true);
      expect(teluguRegex.test(q.qTe)).toBe(true);
    });
  });

  it('correctly classifies emergency danger signs with 100% recall across languages', () => {
    const escQueries = sampleQueries.filter((q) => q.topic === 'esc');
    expect(escQueries.length).toBe(8);

    escQueries.forEach((item) => {
      // Test English/Romanized
      const resEn = answerQuestion(item.qEn, mockBm25, mockSections, 400, {
        lang: 'en',
        seasonalPack: seasonalData,
      });
      expect(resEn.escalate).toBe(true);
      expect(resEn.citedSectionIds.some((s) => s.startsWith('ESC-'))).toBe(true);
      expect(resEn.answerText).toContain('DANGER SIGN — REFER IMMEDIATELY');

      // Test Hindi
      const resHi = answerQuestion(item.qHi, mockBm25, mockSections, 400, {
        lang: 'hi',
        seasonalPack: seasonalData,
      });
      expect(resHi.escalate).toBe(true);
      expect(resHi.citedSectionIds.some((s) => s.startsWith('ESC-'))).toBe(true);

      // Test Telugu
      const resTe = answerQuestion(item.qTe, mockBm25, mockSections, 400, {
        lang: 'te',
        seasonalPack: seasonalData,
      });
      expect(resTe.escalate).toBe(true);
      expect(resTe.citedSectionIds.some((s) => s.startsWith('ESC-'))).toBe(true);
    });
  });

  it('correctly refuses out-of-scope prescription and clinical medication queries with SCP citations', () => {
    const refusalQueries = sampleQueries.filter((q) => q.topic === 'refusal');
    expect(refusalQueries.length).toBe(8);

    refusalQueries.forEach((item) => {
      const resEn = answerQuestion(item.qEn, mockBm25, mockSections, 400, {
        lang: 'en',
        seasonalPack: seasonalData,
      });
      expect(resEn.refused).toBe(true);
      expect(resEn.citedSectionIds.some((s) => s.startsWith('SCP-'))).toBe(true);

      const resHi = answerQuestion(item.qHi, mockBm25, mockSections, 400, {
        lang: 'hi',
        seasonalPack: seasonalData,
      });
      expect(resHi.refused).toBe(true);
      expect(resHi.citedSectionIds.some((s) => s.startsWith('SCP-'))).toBe(true);

      const resTe = answerQuestion(item.qTe, mockBm25, mockSections, 400, {
        lang: 'te',
        seasonalPack: seasonalData,
      });
      expect(resTe.refused).toBe(true);
      expect(resTe.citedSectionIds.some((s) => s.startsWith('SCP-'))).toBe(true);
    });
  });

  it('always produces cited responses for every routine inquiry across topics without missing citations', () => {
    const routineQueries = sampleQueries.filter((q) => q.topic !== 'esc' && q.topic !== 'refusal');
    routineQueries.forEach((item) => {
      const resEn = answerQuestion(item.qEn, mockBm25, mockSections, 400, {
        lang: 'en',
        seasonalPack: seasonalData,
      });
      expect(resEn.citedSectionIds.length).toBeGreaterThanOrEqual(1);
      expect(resEn.answerText.length).toBeGreaterThan(10);
    });
  });
});

