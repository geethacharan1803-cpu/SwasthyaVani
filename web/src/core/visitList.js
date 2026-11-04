/**
 * Visit List Manager - Pure JavaScript
 * Prioritizes and filters household member visits according to 09_VIS guidelines.
 */

/**
 * Protocol guidance descriptions for clinical due items.
 */
const DUE_ITEM_PROTOCOLS = {
  'ANC-1': {
    title: 'First Antenatal Care Visit (ANC 1)',
    protocol: '01_ANC',
    citation: 'SEC-01-ANC-01',
    description: 'Registration, complete medical history, baseline BP, Hb screening, urine test for albumin, and first dose of Tetanus Toxoid (TT/Td).',
  },
  'ANC-2': {
    title: 'Second Antenatal Care Visit (ANC 2)',
    protocol: '01_ANC',
    citation: 'SEC-01-ANC-02',
    description: 'Gestational age assessment (14-26 weeks), BP check, abdominal palpation, Hb check, and start Iron Folic Acid (IFA) supplementation.',
  },
  'ANC-3': {
    title: 'Third Antenatal Care Visit (ANC 3)',
    protocol: '01_ANC',
    citation: 'SEC-01-ANC-03',
    description: 'Third-trimester check (28-34 weeks), fetal growth, fetal heart sounds, check for swelling/edema, maternal BP, second dose TT/Td booster.',
  },
  'ANC-4': {
    title: 'Fourth Antenatal Care Visit (ANC 4)',
    protocol: '01_ANC',
    citation: 'SEC-01-ANC-04',
    description: 'Pre-delivery check (36 weeks to term), birth preparedness, institutional delivery plan, identification of high-risk signs.',
  },
  'HRP-followup': {
    title: 'High-Risk Pregnancy (HRP) Follow-up',
    protocol: '01_ANC / 03_ESC',
    citation: 'SEC-03-ESC-01',
    description: 'Close monitoring for severe anemia (Hb < 7 g/dL), pre-eclampsia (BP >= 140/90), gestational diabetes, or previous obstetric complications. Facilitate Medical Officer consultation.',
  },
  'HBNC-1': {
    title: 'HBNC Day 1 Home Visit',
    protocol: '02_HBNC',
    citation: 'SEC-02-HBNC-01',
    description: 'Within 24 hours of home birth (or first day after institutional discharge): ensure skin-to-skin contact, check temperature, cord hygiene, and exclusive breastfeeding.',
  },
  'HBNC-2': {
    title: 'HBNC Day 3 Home Visit',
    protocol: '02_HBNC',
    citation: 'SEC-02-HBNC-02',
    description: 'Check for neonatal jaundice, umbilical infection, adequate sucking, weight loss monitoring, and maternal health.',
  },
  'HBNC-3': {
    title: 'HBNC Day 7 Home Visit',
    protocol: '02_HBNC',
    citation: 'SEC-02-HBNC-03',
    description: 'Inspect cord stump, evaluate baby activity and thermal regulation, assess maternal postpartum recovery and lactation support.',
  },
  'HBNC-4': {
    title: 'HBNC Day 14 Home Visit',
    protocol: '02_HBNC',
    citation: 'SEC-02-HBNC-04',
    description: 'Confirm cord stump has separated cleanly, monitor infant weight gain (>= 20-30 g/day), reinforce danger sign recognition.',
  },
  'HBNC-5': {
    title: 'HBNC Day 21 Home Visit',
    protocol: '02_HBNC',
    citation: 'SEC-02-HBNC-05',
    description: 'Growth monitoring, maternal mental health and postpartum recovery assessment, check for skin rashes, eye infections, or lethargy.',
  },
  'HBNC-6': {
    title: 'HBNC Day 28 Home Visit',
    protocol: '02_HBNC',
    citation: 'SEC-02-HBNC-06',
    description: 'Fourth week newborn milestone review, prepare family for 6-week immunization schedule, check nutrition and hygiene practices.',
  },
  'HBNC-7': {
    title: 'HBNC Day 42 Home Visit',
    protocol: '02_HBNC',
    citation: 'SEC-02-HBNC-07',
    description: 'End of 6-week neonatal period: verify completion of first primary immunization (Pentavalent-1, OPV-1, RVV-1, fIPV-1), maternal family planning counseling.',
  },
  'BP-followup': {
    title: 'Hypertension Clinical Follow-up',
    protocol: '05_NCD',
    citation: 'SEC-05-NCD-01',
    description: 'Monthly blood pressure measurement using validated digital sphygmomanometer. Verify compliance with prescribed anti-hypertensive medication. Advise low salt intake and physical activity.',
  },
  'Sugar-followup': {
    title: 'Diabetes Mellitus Blood Sugar Follow-up',
    protocol: '05_NCD',
    citation: 'SEC-05-NCD-02',
    description: 'Random Blood Sugar (RBS) monitoring via glucometer. Check adherence to oral hypoglycemic agents, foot care inspection, and symptom tracking.',
  },
  'MUAC-screening': {
    title: 'Child Nutrition & MUAC Screening',
    protocol: '07_NUT',
    citation: 'SEC-07-NUT-01',
    description: 'Screening 6-59 month children with color-banded MUAC tape. Check for bilateral pitting edema of feet. Red (<11.5 cm) indicates Severe Acute Malnutrition (SAM) needing NRC referral.',
  },
  'BCG': {
    title: 'BCG Vaccination at Birth',
    protocol: '04_IMM',
    citation: 'SEC-04-IMM-01',
    description: 'Tuberculosis protection: 0.05 ml intradermal at birth or up to 1 year of age.',
  },
  'OPV-0': {
    title: 'OPV Birth Dose',
    protocol: '04_IMM',
    citation: 'SEC-04-IMM-02',
    description: 'Oral Polio Vaccine: 2 drops orally within first 14 days of birth.',
  },
  'Pentavalent-1': {
    title: 'Pentavalent 1 (DPT + Hep B + Hib)',
    protocol: '04_IMM',
    citation: 'SEC-04-IMM-03',
    description: '6 weeks of age: 0.5 ml intramuscularly in anterolateral mid-thigh. Protection against Diphtheria, Pertussis, Tetanus, Hepatitis B, and Haemophilus influenzae b.',
  },
  'MR-1': {
    title: 'Measles & Rubella 1 (MR-1)',
    protocol: '04_IMM',
    citation: 'SEC-04-IMM-04',
    description: '9 completed months to 12 months: 0.5 ml subcutaneous injection in right upper arm plus Vitamin A (1 lakh IU).',
  },
};

/**
 * Retrieve clinical protocol metadata for a given due item.
 * @param {string} dueItem
 * @returns {{ title: string, protocol: string, citation: string, description: string }}
 */
export function getDueItemProtocolInfo(dueItem) {
  if (!dueItem) {
    return {
      title: 'Routine Healthcare Follow-up',
      protocol: '09_VIS',
      citation: 'SEC-09-VIS-01',
      description: 'Frontline community healthcare visit for health promotion, screening, and maternal-child health monitoring.',
    };
  }

  // Exact match
  if (DUE_ITEM_PROTOCOLS[dueItem]) {
    return DUE_ITEM_PROTOCOLS[dueItem];
  }

  // Prefix/heuristic matches
  const norm = dueItem.toUpperCase();
  if (norm.includes('ANC')) {
    return DUE_ITEM_PROTOCOLS['ANC-1'];
  }
  if (norm.includes('HBNC')) {
    return DUE_ITEM_PROTOCOLS['HBNC-1'];
  }
  if (norm.includes('BP') || norm.includes('HYPERTENSION')) {
    return DUE_ITEM_PROTOCOLS['BP-followup'];
  }
  if (norm.includes('SUGAR') || norm.includes('DIABETES')) {
    return DUE_ITEM_PROTOCOLS['Sugar-followup'];
  }
  if (norm.includes('MUAC') || norm.includes('NUTRITION') || norm.includes('SAM')) {
    return DUE_ITEM_PROTOCOLS['MUAC-screening'];
  }
  if (norm.includes('PENTA') || norm.includes('VACCINE') || norm.includes('IMM') || norm.includes('MR')) {
    return DUE_ITEM_PROTOCOLS['Pentavalent-1'];
  }

  return {
    title: dueItem,
    protocol: '09_VIS',
    citation: 'SEC-09-VIS-01',
    description: `Community health follow-up for ${dueItem} as per frontline health worker protocol guidelines.`,
  };
}

/**
 * Filter visits by priority, village, status, or search query.
 * @param {Array<Object>} visits
 * @param {{ priority?: number, village?: string, status?: string, searchQuery?: string }} [filters]
 * @returns {Array<Object>}
 */
export function filterVisits(visits, filters = {}) {
  if (!Array.isArray(visits)) return [];

  const query = (filters.searchQuery || '').trim().toLowerCase();

  return visits.filter((v) => {
    if (filters.priority && v.priority !== filters.priority) return false;
    if (filters.village && v.village !== filters.village) return false;
    if (filters.status && v.status !== filters.status) return false;

    if (query) {
      const matchName = v.name && v.name.toLowerCase().includes(query);
      const matchMid = v.member_id && v.member_id.toLowerCase().includes(query);
      const matchHhid = v.household_id && v.household_id.toLowerCase().includes(query);
      const matchVil = v.village && v.village.toLowerCase().includes(query);
      const matchItem = v.due_item && v.due_item.toLowerCase().includes(query);
      if (!matchName && !matchMid && !matchHhid && !matchVil && !matchItem) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Group visits by village for organized walking route execution.
 * @param {Array<Object>} visits
 * @returns {Array<{ village: string, count: number, visits: Array<Object> }>}
 */
export function groupVisitsByVillage(visits) {
  if (!Array.isArray(visits) || visits.length === 0) return [];

  const groups = new Map();

  for (const v of visits) {
    const vil = v.village || 'Other';
    if (!groups.has(vil)) {
      groups.set(vil, []);
    }
    groups.get(vil).push(v);
  }

  // Convert to structured list, sorted by village name
  const result = [];
  for (const [village, items] of groups.entries()) {
    // Within each village, sort priority 1 first, then 2, then 3
    items.sort((a, b) => (a.priority || 3) - (b.priority || 3));
    result.push({
      village,
      count: items.length,
      visits: items,
    });
  }

  result.sort((a, b) => a.village.localeCompare(b.village));
  return result;
}

/**
 * Compute summary statistics from visit list including completed visits.
 * @param {Array<Object>} visits
 * @param {Set<string>|Array<string>} [completedKeys]
 * @returns {{
 *   total: number,
 *   p1Count: number,
 *   p2Count: number,
 *   p3Count: number,
 *   overdueCount: number,
 *   dueTodayCount: number,
 *   completedCount: number
 * }}
 */
export function getVisitStats(visits, completedKeys = new Set()) {
  if (!Array.isArray(visits)) {
    return {
      total: 0,
      p1Count: 0,
      p2Count: 0,
      p3Count: 0,
      overdueCount: 0,
      dueTodayCount: 0,
      completedCount: 0,
    };
  }

  const compSet = completedKeys instanceof Set ? completedKeys : new Set(completedKeys || []);

  let p1 = 0;
  let p2 = 0;
  let p3 = 0;
  let overdue = 0;
  let today = 0;
  let completed = 0;

  for (const v of visits) {
    if (v.priority === 1) p1++;
    else if (v.priority === 2) p2++;
    else if (v.priority === 3) p3++;

    if (v.status === 'overdue') overdue++;
    else if (v.status === 'due_today') today++;

    const key = `${v.member_id}_${v.due_item}`;
    if (compSet.has(key)) {
      completed++;
    }
  }

  return {
    total: visits.length,
    p1Count: p1,
    p2Count: p2,
    p3Count: p3,
    overdueCount: overdue,
    dueTodayCount: today,
    completedCount: completed,
  };
}
