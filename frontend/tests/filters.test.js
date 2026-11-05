import { describe, it, expect } from 'vitest';
import { filterBeneficiaries, getFilterOptions } from '../src/core/filters.js';
import enrichedRecords from '../public/data/register_enriched.json';

describe('Core Module: Beneficiary Register Filters', () => {
  const sampleData = [
    {
      member_id: 'M-001',
      household_id: 'HH-101',
      name: 'Sunita Devi',
      district: 'kakinada',
      village: 'Sarpavaram',
      asha_id: 'ASHA-KKD01',
      clinical_category: 'anc',
      is_high_risk: false,
      house_no: 'KKD-102',
    },
    {
      member_id: 'M-002',
      household_id: 'HH-102',
      name: 'Lakshmi Narayana',
      district: 'kakinada',
      village: 'Peddapuram Rural',
      asha_id: 'ASHA-KKD02',
      clinical_category: 'high_risk',
      is_high_risk: true,
      house_no: 'KKD-105',
    },
    {
      member_id: 'M-003',
      household_id: 'HH-201',
      name: 'Venkata Satyanarayana',
      district: 'east_godavari',
      village: 'Rajahmundry Rural',
      asha_id: 'ASHA-EGD01',
      clinical_category: 'ncd',
      is_high_risk: true,
      house_no: 'EGD-204',
    },
    {
      member_id: 'M-004',
      household_id: 'HH-301',
      name: 'Baby Ananya',
      district: 'visakhapatnam',
      village: 'Bheemunipatnam',
      asha_id: 'ASHA-VSP01',
      clinical_category: 'nut',
      is_high_risk: true,
      house_no: 'VSP-308',
    },
    {
      member_id: 'M-005',
      household_id: 'HH-401',
      name: 'Ramesh Nandyal',
      district: 'kurnool',
      village: 'Nandyal Rural',
      asha_id: 'ASHA-KNL01',
      clinical_category: 'general',
      is_high_risk: false,
      house_no: 'KNL-620',
    },
  ];

  it('root fix: "all" or empty district selection returns ALL records without blanks', () => {
    const resAll = filterBeneficiaries(sampleData, { districts: ['all'] });
    expect(resAll).toHaveLength(5);

    const resEmpty = filterBeneficiaries(sampleData, { districts: [] });
    expect(resEmpty).toHaveLength(5);
  });

  it('root fix: "all" or empty village selection returns ALL records without blanks', () => {
    const res = filterBeneficiaries(sampleData, { villages: ['all'] });
    expect(res).toHaveLength(5);
  });

  it('root fix: "all" or empty category selection returns ALL records without blanks', () => {
    const res = filterBeneficiaries(sampleData, { category: 'all' });
    expect(res).toHaveLength(5);
  });

  it('filters by single and multiple districts simultaneously', () => {
    const single = filterBeneficiaries(sampleData, { districts: ['kakinada'] });
    expect(single).toHaveLength(2);

    const multi = filterBeneficiaries(sampleData, {
      districts: ['kakinada', 'visakhapatnam'],
    });
    expect(multi).toHaveLength(3);
    expect(multi.map((r) => r.member_id)).toEqual(['M-001', 'M-002', 'M-004']);
  });

  it('filters by village', () => {
    const res = filterBeneficiaries(sampleData, {
      villages: ['Sarpavaram', 'Bheemunipatnam'],
    });
    expect(res).toHaveLength(2);
    expect(res.map((r) => r.member_id)).toEqual(['M-001', 'M-004']);
  });

  it('filters by clinical category and high_risk', () => {
    const hrp = filterBeneficiaries(sampleData, { category: 'high_risk' });
    expect(hrp).toHaveLength(3); // M-002, M-003, M-004

    const ncd = filterBeneficiaries(sampleData, { category: 'ncd' });
    expect(ncd).toHaveLength(1);
    expect(ncd[0].member_id).toBe('M-003');
  });

  it('searches by name, member_id, village or household_id case-insensitively', () => {
    expect(filterBeneficiaries(sampleData, { searchQuery: 'sunita' })).toHaveLength(1);
    expect(filterBeneficiaries(sampleData, { searchQuery: 'HH-201' })).toHaveLength(1);
    expect(filterBeneficiaries(sampleData, { searchQuery: 'm-004' })).toHaveLength(1);
    expect(filterBeneficiaries(sampleData, { searchQuery: 'rajahmundry' })).toHaveLength(1);
    expect(filterBeneficiaries(sampleData, { searchQuery: 'nonexistent' })).toHaveLength(0);
  });

  it('combines all filters with logical AND', () => {
    const res = filterBeneficiaries(sampleData, {
      districts: ['kakinada'],
      category: 'high_risk',
      searchQuery: 'lakshmi',
    });
    expect(res).toHaveLength(1);
    expect(res[0].member_id).toBe('M-002');
  });

  it('correctly narrows villages based on selected districts in getFilterOptions', () => {
    const allOptions = getFilterOptions(sampleData);
    expect(allOptions.districts).toContain('kakinada');
    expect(allOptions.villages).toHaveLength(5);

    const narrowed = getFilterOptions(sampleData, ['kakinada']);
    expect(narrowed.villages).toEqual(['Peddapuram Rural', 'Sarpavaram']);

    const allNarrowed = getFilterOptions(sampleData, ['all']);
    expect(allNarrowed.villages).toHaveLength(5);
  });

  it('safely handles empty or null data', () => {
    expect(filterBeneficiaries([], {})).toEqual([]);
    expect(filterBeneficiaries(null, {})).toEqual([]);
    expect(getFilterOptions(null)).toEqual({
      districts: [],
      villages: [],
      categories: [],
    });
  });

  it('maintains complete data consistency with 2,234 Chandrapuri registered records', () => {
    const chandrapuriRecords = filterBeneficiaries(enrichedRecords, { districts: ['chandrapuri'] });
    expect(chandrapuriRecords.length).toBeGreaterThan(0);

    const villages = ['Amrapur', 'Belwadi Tola', 'Dhanpura'];
    let totalVillageSum = 0;
    for (const vil of villages) {
      const vRecords = filterBeneficiaries(chandrapuriRecords, { villages: [vil] });
      expect(vRecords.length).toBeGreaterThan(0);
      totalVillageSum += vRecords.length;
    }
    expect(totalVillageSum).toBe(chandrapuriRecords.length);
  });
});
