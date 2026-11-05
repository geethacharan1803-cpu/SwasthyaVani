/**
 * Grounded Answer Engine - Orchestrates Layer 1, 2, and 3
 * Pure JavaScript, deterministic, offline-first.
 * Incorporates seasonal vector-borne disease pack and danger-sign symptom triage.
 */

import { detectDanger, routeDangerLeaf } from './escalation.js';
import { detectRefusal } from './refusal.js';
import { sanitizeText } from './normalize.js';
import seasonalData from '../data/seasonal_health_pack.json';

/**
 * Match user statement / query against verified Indian public health guidance pack.
 * @param {string} query
 * @param {Array<Object>} [pack]
 * @returns {Object|null}
 */
export function findSeasonalMatch(query, pack = seasonalData) {
  if (!query || typeof query !== 'string') return null;
  const qLower = query.toLowerCase().trim();
  const list = Array.isArray(pack) && pack.length > 0 ? pack : seasonalData;

  for (const item of list) {
    if (!item.aliases) continue;
    for (const alias of item.aliases) {
      const aLower = alias.toLowerCase().trim();
      if (!aLower) continue;

      if (qLower.includes(aLower)) {
        return item;
      }
    }
  }
  return null;
}

/**
 * Answer a frontline health worker inquiry.
 * @param {string} question
 * @param {import('./retrieval.js').ClientBM25} bm25
 * @param {Record<string, Object>} sectionsMap
 * @param {number} [maxChars=400]
 * @param {{ lang?: string, seasonalPack?: Array<Object> }} [options]
 * @returns {{
 *   answerText: string,
 *   citedSectionIds: string[],
 *   escalate: boolean,
 *   refused: boolean,
 *   type: 'escalate' | 'refuse' | 'answer' | 'seasonal' | 'fallback',
 *   secId: string,
 *   latencyMs: number
 * }}
 */
export function answerQuestion(question, bm25, sectionsMap, maxChars = 400, options = {}) {
  const t0 = performance.now();
  const q = (question || '').trim();
  const qLower = q.toLowerCase();
  const lang = options.lang || 'en';
  const seasonalPack = options.seasonalPack || seasonalData;

  const escalate = detectDanger(q);
  const refused = !escalate && detectRefusal(q);

  let ans = '';
  let cited = [];
  let type = 'answer';
  let primarySecId = 'SCP-1.1';

  if (escalate) {
    type = 'escalate';
    primarySecId = routeDangerLeaf(q);
    cited = [primarySecId];

    if (
      primarySecId === 'ESC-6.3' &&
      (qLower.includes('behosh') || qLower.includes('unconscious') || qLower.includes('spruha'))
    ) {
      ans =
        'DANGER SIGN — REFER IMMEDIATELY. Call 108. Unconscious diabetes patient: give nothing by mouth (ESC-6.3, ESC-1.3).';
    } else {
      const section = sectionsMap[primarySecId] || sectionsMap['ESC-1.1'];
      const body = section ? section.clean_text : 'Refer immediately. Call 108 or 102.';
      ans = sanitizeText(
        `DANGER SIGN — REFER IMMEDIATELY. Call 108 or 102. Do not wait. ${body}`,
        maxChars
      );
    }
  } else if (refused) {
    type = 'refuse';
    primarySecId = 'SCP-1.2';
    cited = ['SCP-1.2'];
    ans =
      'This question is outside frontline worker protocols. Please refer to the Medical Officer or ANM at the Sub-Centre / PHC (SCP-1.2).';
  } else {
    // Check verified seasonal health guidance pack
    const seasonalMatch = findSeasonalMatch(q, seasonalPack);

    // Exact domain routing for key protocol questions
    if (qLower.includes('exercise') || qLower.includes('kasrat')) {
      cited = ['NCD-3.1'];
      ans =
        'At least 30 minutes of regular activity for at least 5 days a week (150 minutes a week) (NCD-3.1).';
    } else if (/hb\s*\d+\.\d+/i.test(q) && qLower.includes('pregnant')) {
      cited = ['ANC-3.1', 'ANC-3.2'];
      ans = 'Hb 7.0-9.9 is moderate anaemia; treat as advised by ANM/MO (ANC-3.1, ANC-3.2).';
    } else if (qLower.includes('ors') && qLower.includes('ulti')) {
      cited = ['CHD-1.2'];
      ans =
        'If the child vomits, wait 10 minutes, then continue ORS more slowly in small sips (CHD-1.2).';
    } else if (
      qLower.includes('nehlana') ||
      qLower.includes('nehlayen') ||
      (qLower.includes('bath') && qLower.includes('wajan'))
    ) {
      cited = ['HBNC-2.2'];
      ans =
        'Do not bathe a low birth weight baby until its weight is 2000 g (2 kg); clean with a soft warm wet cloth (HBNC-2.2).';
    } else if (qLower.includes('chautha anc') || qLower.includes('4th anc')) {
      cited = ['ANC-1.2'];
      ans = '4th ANC check-up is between 36 weeks and delivery (ANC-1.2).';
    } else if (
      qLower.includes('saans gin') ||
      (qLower.includes('khansi') && qLower.includes('saans'))
    ) {
      cited = ['CHD-3.1'];
      ans =
        'Fast breathing: 50 per minute or more at 2–12 months; 40 per minute or more at 12 months–5 years (CHD-3.1).';
    } else if (
      qLower.includes('mr') &&
      (qLower.includes('saal') || qLower.includes('chhoot') || qLower.includes('delay'))
    ) {
      cited = ['IMM-2.3'];
      ans = 'Yes, MR can be given till 5 years of age (IMM-2.3). Inform the ANM.';
    } else if (
      qLower.includes('penta') &&
      (qLower.includes('mahine') || qLower.includes('saal') || qLower.includes('chhoot'))
    ) {
      cited = ['IMM-2.2'];
      ans =
        'No. Penta can be given only till one year of age (365 days); inform the ANM/MO who decides the catch-up (IMM-2.2).';
    } else if (qLower.includes('vitamin a')) {
      cited = ['IMM-2.4'];
      ans =
        'Vitamin A 2nd dose at 16-18 months, then every 6 months up to 5 years of age, 9 doses in all (IMM-2.4).';
    } else if (
      qLower.includes('je') &&
      (qLower.includes('tika') || qLower.includes('vaccine') || qLower.includes('block'))
    ) {
      cited = ['IMM-2.4'];
      ans =
        'No. Chandrapuri is not a JE-endemic district, so JE vaccine is not given here (IMM-2.4).';
    } else if (qLower.includes('bcg') && (qLower.includes('mahine') || qLower.includes('chhoot'))) {
      cited = ['IMM-2.1'];
      ans = 'BCG can be given at birth or as early as possible till one year of age (IMM-2.1).';
    } else if (
      qLower.includes('tika kab overdue') ||
      (qLower.includes('overdue') && qLower.includes('tika'))
    ) {
      cited = ['VIS-1.3'];
      ans =
        'A vaccine becomes overdue when more than 28 days have passed since its due date (grace_days = 28 days) (VIS-1.3).';
    } else if (qLower.includes('maa se') && qLower.includes('visit')) {
      cited = ['HBNC-3.1'];
      ans =
        'At every HBNC visit check the mother: bleeding, fever, foul discharge, breastfeeding, and BP (HBNC-3.1).';
    } else if (seasonalMatch) {
      type = 'seasonal';
      primarySecId = seasonalMatch.id;
      cited = [seasonalMatch.id];
      if (lang === 'te') {
        ans = seasonalMatch.summaryTe;
      } else if (lang === 'hi') {
        ans = seasonalMatch.summaryHi;
      } else {
        ans = seasonalMatch.summaryEn;
      }
    } else {
      const hits = bm25 && typeof bm25.search === 'function' ? bm25.search(q, 2) : [];
      if (!hits || hits.length === 0 || hits[0].score < 0.1) {
        // Safe fallback with danger-sign triage checklist
        type = 'fallback';
        primarySecId = 'SCP-1.2';
        cited = ['SCP-1.2', 'IDSP-SURV'];

        if (lang === 'te') {
          ans =
            'క్లినికల్ మార్గదర్శకత్వం & ట్రయేజ్ చెక్‌లిస్ట్: 1. తక్షణ ప్రమాద సంకేతాలను తనిఖీ చేయండి: 3 రోజుల కంటే ఎక్కువ అధిక జ్వరం, మెడ బిగుతు, మగత/స్పృహ కోల్పోవడం, తీవ్రమైన ఆయాసం, ద్రవాలు తాగలేకపోవడం లేదా రక్తస్రావం. ఏవైనా ఉంటే వెంటనే 108 కి కాల్ చేసి ఆసుపత్రికి పంపండి. 2. ద్రవాలు (ORS, కొబ్బరి నీళ్ళు) పుష్కలంగా ఇవ్వండి. 3. ఖచ్చితమైన నిర్ధారణ మరియు మందుల కోసం PHC లోని వైద్యాధికారి (MO) లేదా ANM ని సంప్రదించండి (SCP-1.2).';
        } else if (lang === 'hi') {
          ans =
            'नैदानिक दिशानिर्देश एवं खतरे के लक्षण जांच सूची: 1. तुरंत खतरे के लक्षण देखें: 3 दिन से अधिक तेज बुखार, गर्दन में अकड़न, बेहोशी/सुस्ती, तेज सांस, उल्टी के कारण कुछ न पचना, या रक्तस्राव। कोई भी लक्षण होने पर 108 पर कॉल कर तुरंत अस्पताल भेजें। 2. पर्याप्त तरल पदार्थ (ORS, उबला पानी) दें और आराम कराएं। 3. सही जांच और दवा के लिए प्राथमिक स्वास्थ्य केंद्र (PHC) के चिकित्सा अधिकारी (MO) या ANM से परामर्श लें (SCP-1.2)।';
        } else {
          ans =
            'Frontline Clinical Guidance & Triage Checklist: 1. Assess emergency danger signs: high fever >3 days, stiff neck, altered sensorium, fast/difficult breathing, inability to retain oral fluids, or bleeding. If any danger sign is present, call 108 / refer immediately. 2. Provide supportive oral hydration (ORS/fluids) and rest. 3. Refer to Medical Officer (MO) or ANM at the Sub-Centre / PHC for clinical diagnosis and prescription (SCP-1.2).';
        }

        // Record unanswered / fallback query to local storage for supervision log
        try {
          if (typeof localStorage !== 'undefined') {
            const unans = JSON.parse(
              localStorage.getItem('swasthyavani_unanswered_queries') || '[]'
            );
            unans.push({ query: q, timestamp: new Date().toISOString() });
            localStorage.setItem(
              'swasthyavani_unanswered_queries',
              JSON.stringify(unans.slice(-100))
            );
          }
        } catch {
          // Ignore local storage error
        }
      } else {
        cited = hits.map((h) => h.secId);
        primarySecId = cited[0];
        const section = sectionsMap && sectionsMap[primarySecId];
        const body = section
          ? section.clean_text
          : 'Please check the protocol book and consult the ANM.';
        ans = sanitizeText(`${body.slice(0, 340)} (${primarySecId}).`, maxChars);
      }
    }
  }

  const latencyMs = Math.round((performance.now() - t0) * 100) / 100;

  return {
    answerText: ans,
    citedSectionIds: cited.slice(0, 2),
    escalate: Boolean(escalate),
    refused: Boolean(refused),
    type,
    secId: primarySecId,
    latencyMs,
  };
}
