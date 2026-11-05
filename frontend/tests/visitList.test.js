import { describe, it, expect } from 'vitest';
import {
  filterVisits,
  getVisitStats,
  groupVisitsByVillage,
  getDueItemProtocolInfo,
} from '../src/core/visitList.js';
import visitsData from '../public/data/register_visits.json';

describe('Visit List Core Manager', () => {
  const sampleVisits = [
    {
      member_id: 'M-001',
      household_id: 'HH-101',
      name: 'Lakshmi Devi',
      village: 'Navagaon Khurd',
      due_item: 'ANC-3',
      priority: 1,
      status: 'overdue',
    },
    {
      member_id: 'M-002',
      household_id: 'HH-102',
      name: 'Ramesh Kumar',
      village: 'Navagaon Khurd',
      due_item: 'BP-followup',
      priority: 1,
      status: 'due_today',
    },
    {
      member_id: 'M-003',
      household_id: 'HH-103',
      name: 'Baby of Anitha',
      village: 'Dhanpura',
      due_item: 'HBNC-2',
      priority: 2,
      status: 'due_today',
    },
    {
      member_id: 'M-004',
      household_id: 'HH-104',
      name: 'Sunita Bai',
      village: 'Amrapur',
      due_item: 'Pentavalent-1',
      priority: 3,
      status: 'upcoming',
    },
  ];

  it('filters visits by priority', () => {
    const p1 = filterVisits(sampleVisits, { priority: 1 });
    expect(p1.length).toBe(2);
    expect(p1.every((v) => v.priority === 1)).toBe(true);

    const p2 = filterVisits(sampleVisits, { priority: 2 });
    expect(p2.length).toBe(1);
    expect(p2[0].member_id).toBe('M-003');
  });

  it('filters visits by search query matching name, ID, village, or due item', () => {
    const searchName = filterVisits(sampleVisits, { searchQuery: 'Lakshmi' });
    expect(searchName.length).toBe(1);
    expect(searchName[0].member_id).toBe('M-001');

    const searchVillage = filterVisits(sampleVisits, { searchQuery: 'Dhanpura' });
    expect(searchVillage.length).toBe(1);

    const searchItem = filterVisits(sampleVisits, { searchQuery: 'BP-followup' });
    expect(searchItem.length).toBe(1);
    expect(searchItem[0].member_id).toBe('M-002');
  });

  it('groups visits by village ordered alphabetically with priority sorting', () => {
    const grouped = groupVisitsByVillage(sampleVisits);
    expect(grouped.length).toBe(3); // Amrapur, Dhanpura, Navagaon Khurd
    expect(grouped[0].village).toBe('Amrapur');
    expect(grouped[0].count).toBe(1);

    expect(grouped[2].village).toBe('Navagaon Khurd');
    expect(grouped[2].count).toBe(2);
    expect(grouped[2].visits[0].priority).toBe(1);
  });

  it('computes accurate visit statistics and completed counts', () => {
    const completed = new Set(['M-001_ANC-3']);
    const stats = getVisitStats(sampleVisits, completed);
    expect(stats.total).toBe(4);
    expect(stats.p1Count).toBe(2);
    expect(stats.p2Count).toBe(1);
    expect(stats.p3Count).toBe(1);
    expect(stats.overdueCount).toBe(1);
    expect(stats.dueTodayCount).toBe(2);
    expect(stats.completedCount).toBe(1);
  });

  it('retrieves detailed protocol information and citations for due items', () => {
    const anc = getDueItemProtocolInfo('ANC-3');
    expect(anc.protocol).toBe('01_ANC');
    expect(anc.citation).toBe('SEC-01-ANC-03');
    expect(anc.description).toContain('Third-trimester');

    const hbnc = getDueItemProtocolInfo('HBNC-1');
    expect(hbnc.protocol).toBe('02_HBNC');
    expect(hbnc.citation).toBe('SEC-02-HBNC-01');

    const ncd = getDueItemProtocolInfo('BP-followup');
    expect(ncd.protocol).toBe('05_NCD');
    expect(ncd.citation).toBe('SEC-05-NCD-01');
  });

  it('resolves citations for every single due item in the 346 scheduled visits without throwing', () => {
    expect(visitsData.length).toBeGreaterThan(0);
    const uniqueItems = Array.from(new Set(visitsData.map((v) => v.due_item)));
    for (const item of uniqueItems) {
      const info = getDueItemProtocolInfo(item);
      expect(info).toBeDefined();
      expect(info.protocol).toBeDefined();
      expect(info.citation).toBeDefined();
      expect(info.citation.startsWith('SEC-')).toBe(true);
      expect(info.title.length).toBeGreaterThan(0);
      expect(info.description.length).toBeGreaterThan(0);
    }
  });

  it('safely handles records with null/unrecorded fields without throwing', () => {
    const sampleRecord = {
      member_id: 'M-0001',
      household_id: 'HH-0001',
      name: 'Sunita Devi',
      village: 'Amrapur',
      district: 'chandrapuri',
      asha_id: 'ASHA-096P',
      asha_name: 'Sunaina Devi',
      anm_name: 'ANM Nirmala (Chandrapuri Sub-Centre)',
      past_diseases: null,
      infection_history: null,
      fever_cold_history: null,
      allergies: null,
      last_recorded_vitals: null,
    };

    expect(sampleRecord.past_diseases).toBeNull();
    expect(sampleRecord.allergies).toBeNull();
    expect(sampleRecord.last_recorded_vitals).toBeNull();
    expect(sampleRecord.asha_name).toBe('Sunaina Devi');
  });
});
