import { describe, it, expect, beforeEach, beforeAll } from 'vitest';
import topologyRef from '../src/data/topology_reference.json';
import { syncQueue } from '../src/sync/syncQueue.js';

describe('Beneficiary Registration & Local Queue', () => {
  beforeAll(() => {
    const store = {};
    globalThis.localStorage = {
      getItem: (key) => store[key] || null,
      setItem: (key, val) => {
        store[key] = String(val);
      },
      clear: () => {
        for (const k in store) delete store[k];
      },
      removeItem: (key) => {
        delete store[key];
      },
    };
  });

  beforeEach(() => {
    localStorage.clear();
  });

  it('correctly loads topology reference with 5 ASHAs and 6 villages in Chandrapuri', () => {
    expect(topologyRef.district).toBe('Chandrapuri');
    expect(topologyRef.ashas).toHaveLength(5);
    expect(topologyRef.villages).toHaveLength(6);
    expect(topologyRef.village_to_asha['Amrapur'].asha_name).toBe('Sunaina Devi');
    expect(topologyRef.village_to_asha['Kesarganj'].asha_name).toBe('Rinku Devi');
    expect(topologyRef.village_to_asha['Navagaon Khurd'].asha_name).toBe('Malti Devi');
    expect(topologyRef.village_to_asha['Sitapahari'].asha_name).toBe('Malti Devi');
    expect(topologyRef.village_to_asha['Belwadi Tola'].asha_name).toBe('Kalavati Kumari');
    expect(topologyRef.village_to_asha['Dhanpura'].asha_name).toBe('Shabnam Khatoon');
    expect(topologyRef.anms[0].anm_name).toBe('ANM Nirmala (Chandrapuri Sub-Centre)');
  });

  it('correctly saves new synthetic beneficiary in localStorage with Chandrapuri demonstration topology', () => {
    const testBeneficiary = {
      member_id: 'M-REG-TEST01',
      household_id: 'HH-REG-TEST01',
      name: 'Rani Kumari',
      age_years: 26,
      sex: 'F',
      district: 'chandrapuri',
      village: 'Amrapur',
      asha_id: topologyRef.village_to_asha['Amrapur'].asha_id,
      asha_name: topologyRef.village_to_asha['Amrapur'].asha_name,
      anm_name: topologyRef.anms[0].anm_name,
      clinical_category: 'anc',
      is_synthetic: true,
      is_synthetic_ui_record: true,
      past_diseases: null,
      allergies: null,
    };

    const existing = JSON.parse(localStorage.getItem('swasthyavani_custom_beneficiaries') || '[]');
    existing.unshift(testBeneficiary);
    localStorage.setItem('swasthyavani_custom_beneficiaries', JSON.stringify(existing));

    const retrieved = JSON.parse(localStorage.getItem('swasthyavani_custom_beneficiaries') || '[]');
    expect(retrieved).toHaveLength(1);
    expect(retrieved[0].name).toBe('Rani Kumari');
    expect(retrieved[0].district).toBe('chandrapuri');
    expect(retrieved[0].asha_name).toBe('Sunaina Devi');
    expect(retrieved[0].anm_name).toContain('ANM Nirmala');
    expect(retrieved[0].allergies).toBeNull();
    expect(retrieved[0].is_synthetic_ui_record).toBe(true);
  });

  it('enqueues registration event to offline sync queue', () => {
    const testRecord = { member_id: 'M-REG-9999', name: 'Test Baby' };
    syncQueue.enqueue('REGISTER_BENEFICIARY', testRecord);

    const pending = syncQueue.getPending();
    expect(pending.length).toBeGreaterThanOrEqual(1);
    const lastItem = pending[pending.length - 1];
    expect(lastItem.type).toBe('REGISTER_BENEFICIARY');
    expect(lastItem.payload.name).toBe('Test Baby');
  });
});
