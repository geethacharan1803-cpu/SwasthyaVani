import { describe, it, expect, beforeAll } from 'vitest';
import { detectDanger, routeDangerLeaf } from '../src/core/escalation.js';
import { detectRefusal } from '../src/core/refusal.js';
import { ClientBM25 } from '../src/core/retrieval.js';
import { answerQuestion } from '../src/core/answer.js';
import { filterVisits, getVisitStats } from '../src/core/visitList.js';
import { tokenize } from '../src/core/normalize.js';

describe('Layer 1: Escalation & Danger Sign Engine', () => {
  it('detects maternal obstetric emergencies', () => {
    expect(detectDanger('pregnant woman bleeding per vaginum')).toBe(true);
    expect(detectDanger('garbhvati mahila ko khoon aa raha hai')).toBe(true);
    expect(detectDanger('thaili phat gayi hai, badbu wala paani')).toBe(true);
    expect(detectDanger('chehra suja hai aur sir dard ho raha')).toBe(true);
  });

  it('detects neonatal emergencies', () => {
    expect(detectDanger('navjaat bachcha doodh nahi pee raha')).toBe(true);
    expect(detectDanger('baby cold to touch, below 95.9 temperature')).toBe(true);
    expect(detectDanger('bachche ki pasli andar chal rahi hai')).toBe(true);
    expect(detectDanger('birth weight 1.5 kg')).toBe(true);
  });

  it('detects Telugu code-mixed emergencies', () => {
    expect(detectDanger('garbhini ki raktham vastondi')).toBe(true);
    expect(detectDanger('paapa paalu tagatledu')).toBe(true);
    expect(detectDanger('gunde noppi vastondi ekkuva ga')).toBe(true);
  });

  it('routes to exact protocol leaf sections', () => {
    expect(routeDangerLeaf('cold to touch baby')).toBe('ESC-4.3');
    expect(routeDangerLeaf('weight less than 1.8 kg')).toBe('ESC-4.4');
    expect(routeDangerLeaf('unconscious sugar patient with fits')).toBe('ESC-6.3');
    expect(routeDangerLeaf('chest indrawing fast breathing')).toBe('ESC-5.2');
  });

  it('does not falsely escalate non-emergencies', () => {
    expect(detectDanger('3rd ANC checkup kab hota hai?')).toBe(false);
    expect(detectDanger('BCG ka tika kab lagta hai?')).toBe(false);
    expect(detectDanger('ORS ghol kaise banaye?')).toBe(false);
  });

  it('safely handles empty, nonsense, and long text inputs', () => {
    expect(detectDanger('')).toBe(false);
    expect(detectDanger(null)).toBe(false);
    expect(detectDanger('asdfghjkl qwertyuiop 1234567890')).toBe(false);
    expect(detectDanger('A'.repeat(5000))).toBe(false);
  });
});

describe('Layer 2: Scope & Refusal Engine', () => {
  it('detects prescription and medication inquiries', () => {
    expect(detectRefusal('1 saal ke bachche ko paracetamol syrup kitna dena hai?')).toBe(true);
    expect(detectRefusal('amoxicillin antibiotic dosage kya hai?')).toBe(true);
    expect(detectRefusal('insulin kitni unit lagaye?')).toBe(true);
    expect(detectRefusal('u-win portal login OTP problem')).toBe(true);
  });

  it('does not refuse covered protocol advice', () => {
    expect(detectRefusal('IFA tablets kitni leni hai pregnancy me?')).toBe(false);
    expect(detectRefusal('ORS kitna pilana hai dast me?')).toBe(false);
  });
});

describe('Layer 3: Retrieval & Grounded Answers', () => {
  const mockIndex = {
    k1: 1.5,
    b: 0.75,
    doc_count: 2,
    avgdl: 10,
    doc_lengths: { 'ANC-1.1': 10, 'IMM-2.1': 10 },
    idf: { anc: 1.0, bcg: 1.0, vaccine: 0.8 },
    inverted_index: {
      anc: [['ANC-1.1', 2]],
      bcg: [['IMM-2.1', 2]],
      vaccine: [['IMM-2.1', 1]],
    },
  };
  const mockSections = {
    'ANC-1.1': { section_id: 'ANC-1.1', title: 'Early Registration', clean_text: 'ANC registration within 12 weeks.' },
    'IMM-2.1': { section_id: 'IMM-2.1', title: 'BCG Vaccine', clean_text: 'BCG at birth till 1 year.' },
    'ESC-1.1': { section_id: 'ESC-1.1', title: 'Danger Signs', clean_text: 'Refer immediately.' },
    'ESC-4.3': { section_id: 'ESC-4.3', title: 'Hypothermia', clean_text: 'Wrap warmly and refer.' },
    'SCP-1.2': { section_id: 'SCP-1.2', title: 'Outside Scope', clean_text: 'Consult doctor.' },
  };

  const bm25 = new ClientBM25(mockIndex, { tika: 'vaccine' });

  it('retrieves relevant sections for clinical queries', () => {
    const hits = bm25.search('bcg tika');
    expect(hits.length).toBeGreaterThan(0);
    expect(hits[0].secId).toBe('IMM-2.1');
  });

  it('always produces an answer with a valid citation', () => {
    const res = answerQuestion('pregnant woman with bleeding', bm25, mockSections);
    expect(res.escalate).toBe(true);
    expect(res.citedSectionIds.length).toBeGreaterThan(0);
    expect(res.citedSectionIds.length).toBeLessThanOrEqual(2);
  });

  it('refuses dose queries with SCP-1.2 citation', () => {
    const res = answerQuestion('paracetamol syrup kitna dena hai?', bm25, mockSections);
    expect(res.refused).toBe(true);
    expect(res.citedSectionIds).toContain('SCP-1.2');
  });
});

describe('Visit List Utilities', () => {
  const sampleVisits = [
    { member_id: 'M-1', priority: 1, status: 'overdue', village: 'Amrapur' },
    { member_id: 'M-2', priority: 2, status: 'due_today', village: 'Amrapur' },
    { member_id: 'M-3', priority: 3, status: 'due_this_week', village: 'Kesarganj' },
  ];

  it('filters by priority correctly', () => {
    const p1 = filterVisits(sampleVisits, { priority: 1 });
    expect(p1.length).toBe(1);
    expect(p1[0].member_id).toBe('M-1');
  });

  it('computes visit stats accurately', () => {
    const stats = getVisitStats(sampleVisits);
    expect(stats.total).toBe(3);
    expect(stats.p1Count).toBe(1);
    expect(stats.p2Count).toBe(1);
    expect(stats.p3Count).toBe(1);
    expect(stats.overdueCount).toBe(1);
    expect(stats.dueTodayCount).toBe(1);
  });
});

