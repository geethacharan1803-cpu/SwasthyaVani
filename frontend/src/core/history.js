/**
 * History & Monthly Activity Aggregation Module for SwasthyaVani Visit Planner
 * Pure functions for date navigation, deterministic schedule derivation,
 * monthly statistics calculation, and emergency triage filtering.
 *
 * NOTE ON DATA SOURCE:
 * Based on registered population data (household register, visit list) and locally recorded visits.
 * For dates other than the demo date, visit schedules are derived deterministically
 * from the schedule data and locally recorded visits.
 */

export const DEMO_DATE = '2026-10-26';

/**
 * Generate an array of ISO date strings [YYYY-MM-DD] spanning from
 * daysBefore days before anchorDate to daysAfter days after anchorDate.
 * @param {string} [anchorDate='2026-10-26']
 * @param {number} [daysBefore=30]
 * @param {number} [daysAfter=30]
 * @returns {Array<string>}
 */
export function getDateRange(anchorDate = DEMO_DATE, daysBefore = 30, daysAfter = 30) {
  const dates = [];
  const anchor = new Date(`${anchorDate}T00:00:00Z`);
  if (isNaN(anchor.getTime())) {
    return [DEMO_DATE];
  }

  for (let i = -daysBefore; i <= daysAfter; i++) {
    const d = new Date(anchor.getTime() + i * 24 * 60 * 60 * 1000);
    dates.push(d.toISOString().slice(0, 10));
  }
  return dates;
}

/**
 * Deterministic string hash function.
 * @param {string} str
 * @returns {number}
 */
function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Format ISO date string into readable date.
 * @param {string} isoDate
 * @param {string} [lang='en']
 * @returns {string}
 */
export function formatDisplayDate(isoDate, lang = 'en') {
  if (!isoDate || typeof isoDate !== 'string') return '';
  try {
    const parts = isoDate.split('-');
    if (parts.length !== 3) return isoDate;
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);

    const monthNamesEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthNamesTe = ['జనవరి', 'ఫిబ్రవరి', 'మార్చి', 'ఏప్రిల్', 'మే', 'జూన్', 'జూలై', 'ఆగస్టు', 'సెప్టెంబరు', 'అక్టోబరు', 'నవంబరు', 'డిసెంబరు'];
    const monthNamesHi = ['जनवरी', 'फरवरी', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'];

    if (lang === 'te') {
      return `${day} ${monthNamesTe[month]} ${year}`;
    }
    if (lang === 'hi') {
      return `${day} ${monthNamesHi[month]} ${year}`;
    }
    return `${day} ${monthNamesEn[month]} ${year}`;
  } catch {
    return isoDate;
  }
}

/**
 * Derive visits for a specific date.
 * For DEMO_DATE ('2026-10-26'), returns the baseline scheduled visit list.
 * For other dates, returns deterministically scheduled visits based on member schedules.
 * Completed visits in visitedRecords take precedence and update status to 'completed'.
 *
 * @param {string} dateStr - Target date (YYYY-MM-DD)
 * @param {Array<Object>} baseVisits - Ground-truth visit list (346 visits)
 * @param {Array<Object>} [enrichedRegister=[]] - Enriched beneficiary register
 * @param {Array<Object>} [visitedRecords=[]] - Locally saved completed visit records
 * @returns {Array<Object>}
 */
export function deriveVisitsForDate(
  dateStr = DEMO_DATE,
  baseVisits = [],
  _enrichedRegister = [],
  visitedRecords = []
) {
  if (!Array.isArray(baseVisits)) return [];
  const safeDateStr = String(dateStr || DEMO_DATE);

  // Set of keys marked visited on this specific date
  const visitedOnDate = new Map();
  if (Array.isArray(visitedRecords)) {
    visitedRecords.forEach((r) => {
      if (r && r.date === safeDateStr) {
        const key = r.key || `${r.memberId}_${r.dueItem}`;
        visitedOnDate.set(key, r);
      }
    });
  }

  // Canonical demo date
  if (safeDateStr === DEMO_DATE) {
    return baseVisits.map((v) => {
      const key = `${v.member_id}_${v.due_item}`;
      const isVisited = visitedOnDate.has(key);
      let status = v.status || 'due_today';
      if (isVisited) {
        status = 'completed';
      } else if (v.priority === 1) {
        status = 'overdue';
      }
      return {
        ...v,
        date: safeDateStr,
        status,
        completedNote: isVisited ? (visitedOnDate.get(key).note || '') : '',
        completedAt: isVisited ? (visitedOnDate.get(key).timestamp || '') : '',
      };
    });
  }

  // Derive schedule for other dates
  const isPast = safeDateStr < DEMO_DATE;
  const isFuture = safeDateStr > DEMO_DATE;

  // Compute offset days relative to DEMO_DATE
  const anchorTime = new Date(`${DEMO_DATE}T00:00:00Z`).getTime();
  const targetTime = new Date(`${safeDateStr}T00:00:00Z`).getTime();
  const diffDays = Math.round((targetTime - anchorTime) / (24 * 60 * 60 * 1000));

  // Modulo slot to select a deterministic subset of 10 to 18 visits per day
  const slot = Math.abs(diffDays) % 21;

  const derived = [];
  baseVisits.forEach((v, index) => {
    // Deterministic distribution across dates
    const vHash = (simpleHash(v.member_id || '') + index) % 21;
    if (vHash === slot) {
      const key = `${v.member_id}_${v.due_item}`;
      const isVisited = visitedOnDate.has(key);
      let status = 'planned';
      if (isVisited) {
        status = 'completed';
      } else if (isPast) {
        status = v.priority === 1 ? 'missed' : 'missed';
      } else if (isFuture) {
        status = 'planned';
      }

      derived.push({
        ...v,
        date: safeDateStr,
        status,
        completedNote: isVisited ? (visitedOnDate.get(key).note || '') : '',
        completedAt: isVisited ? (visitedOnDate.get(key).timestamp || '') : '',
      });
    }
  });

  // Also include any locally recorded visits for this date that might not be in the derived subset
  if (Array.isArray(visitedRecords)) {
    visitedRecords.forEach((r) => {
      if (r && r.date === safeDateStr) {
        const key = r.key || `${r.memberId}_${r.dueItem}`;
        const alreadyIncluded = derived.some((d) => `${d.member_id}_${d.due_item}` === key);
        if (!alreadyIncluded) {
          // Find matching member details in baseVisits or enrichedRegister
          const existing = baseVisits.find((b) => b.member_id === r.memberId) || {};
          derived.push({
            member_id: r.memberId,
            due_item: r.dueItem,
            priority: existing.priority || 2,
            status: 'completed',
            household_id: existing.household_id || 'HH-LOCAL',
            village: existing.village || 'Amrapur',
            asha_id: existing.asha_id || 'ASHA-096P',
            name: existing.name || 'Local Record',
            sex: existing.sex || 'F',
            dob: existing.dob || '1995-01-01',
            date: safeDateStr,
            completedNote: r.note || '',
            completedAt: r.timestamp || '',
          });
        }
      }
    });
  }

  return derived;
}

/**
 * Compute daily summary statistics for a given list of visits.
 * @param {Array<Object>} visits
 * @returns {{
 *   total: number,
 *   completed: number,
 *   missed: number,
 *   planned: number,
 *   p1Count: number,
 *   p2Count: number,
 *   p3Count: number,
 *   villages: Record<string, number>,
 *   patientCount: number
 * }}
 */
export function getDailySummary(visits = []) {
  if (!Array.isArray(visits)) {
    return {
      total: 0,
      completed: 0,
      missed: 0,
      planned: 0,
      p1Count: 0,
      p2Count: 0,
      p3Count: 0,
      villages: {},
      patientCount: 0,
    };
  }

  let completed = 0;
  let missed = 0;
  let planned = 0;
  let p1Count = 0;
  let p2Count = 0;
  let p3Count = 0;
  const villageCounts = {};
  const patientSet = new Set();

  visits.forEach((v) => {
    if (!v) return;
    const st = String(v.status || '').toLowerCase();
    if (st === 'completed') {
      completed += 1;
    } else if (st === 'missed' || st === 'overdue') {
      missed += 1;
    } else {
      planned += 1;
    }

    const p = parseInt(v.priority, 10);
    if (p === 1) p1Count += 1;
    else if (p === 2) p2Count += 1;
    else if (p === 3) p3Count += 1;

    const vil = v.village ? v.village.trim() : 'Unknown';
    villageCounts[vil] = (villageCounts[vil] || 0) + 1;

    if (v.member_id) {
      patientSet.add(v.member_id);
    }
  });

  return {
    total: visits.length,
    completed,
    missed,
    planned,
    p1Count,
    p2Count,
    p3Count,
    villages: villageCounts,
    patientCount: patientSet.size,
  };
}

/**
 * Compute comprehensive monthly dashboard statistics over an array of dates.
 * Mathematical invariants:
 * totalVisits === sum(dailyTrend.total)
 * completedVisits === sum(dailyTrend.completed)
 *
 * @param {Array<string>} dates - Array of date strings
 * @param {Array<Object>} baseVisits - Ground truth visit list
 * @param {Array<Object>} [enrichedRegister=[]] - Beneficiary register
 * @param {Array<Object>} [visitedRecords=[]] - Completed records
 * @param {string|null} [selectedAsha=null] - Optional ASHA worker filter
 * @returns {Object}
 */
export function getMonthlyDashboardStats(
  dates = [],
  baseVisits = [],
  enrichedRegister = [],
  visitedRecords = [],
  selectedAsha = null
) {
  if (!Array.isArray(dates) || dates.length === 0) {
    dates = getDateRange(DEMO_DATE, 30, 0); // past 30 days
  }

  // Filter baseVisits by ASHA if selected
  const activeBaseVisits = selectedAsha && selectedAsha !== 'all'
    ? baseVisits.filter((v) => v.asha_id === selectedAsha)
    : baseVisits;

  let totalVisits = 0;
  let completedVisits = 0;
  let pendingVisits = 0;
  let urgentVisits = 0;

  const villageMap = {};
  const categoryMap = {
    anc: { code: 'ANC', total: 0, completed: 0, pending: 0 },
    hbnc: { code: 'HBNC', total: 0, completed: 0, pending: 0 },
    imm: { code: 'IMM', total: 0, completed: 0, pending: 0 },
    nut: { code: 'NUT', total: 0, completed: 0, pending: 0 },
    ncd: { code: 'NCD', total: 0, completed: 0, pending: 0 },
    high_risk: { code: 'HRP', total: 0, completed: 0, pending: 0 },
  };

  const dailyTrend = [];
  let todayVisits = [];

  dates.forEach((dateStr) => {
    const dayVisits = deriveVisitsForDate(dateStr, activeBaseVisits, enrichedRegister, visitedRecords);
    if (dateStr === DEMO_DATE) {
      todayVisits = dayVisits;
    }

    let dayCompleted = 0;
    let dayPending = 0;
    let dayUrgent = 0;

    dayVisits.forEach((v) => {
      totalVisits += 1;
      const isDone = v.status === 'completed';
      if (isDone) {
        completedVisits += 1;
        dayCompleted += 1;
      } else {
        pendingVisits += 1;
        dayPending += 1;
      }

      if (v.priority === 1) {
        urgentVisits += 1;
        dayUrgent += 1;
      }

      // Village breakdown
      const vil = v.village || 'Unknown';
      if (!villageMap[vil]) {
        villageMap[vil] = { village: vil, total: 0, completed: 0, pending: 0, p1: 0 };
      }
      villageMap[vil].total += 1;
      if (isDone) villageMap[vil].completed += 1;
      else villageMap[vil].pending += 1;
      if (v.priority === 1) villageMap[vil].p1 += 1;

      // Category breakdown
      const item = String(v.due_item || '').toLowerCase();
      let cat = 'high_risk';
      if (item.startsWith('anc')) cat = 'anc';
      else if (item.startsWith('hbnc')) cat = 'hbnc';
      else if (item.includes('bp') || item.includes('sugar') || item.includes('ncd')) cat = 'ncd';
      else if (item.includes('muac') || item.includes('nut')) cat = 'nut';
      else if (item.includes('hrp')) cat = 'high_risk';
      else cat = 'imm';

      if (categoryMap[cat]) {
        categoryMap[cat].total += 1;
        if (isDone) categoryMap[cat].completed += 1;
        else categoryMap[cat].pending += 1;
      }
    });

    dailyTrend.push({
      date: dateStr,
      total: dayVisits.length,
      completed: dayCompleted,
      pending: dayPending,
      p1: dayUrgent,
    });
  });

  const completionRate = totalVisits > 0 ? Math.round((completedVisits / totalVisits) * 100) : 0;

  // Emergency / Urgent items sorted by priority and urgency
  const urgentList = todayVisits
    .filter((v) => v.priority === 1 || v.status === 'overdue' || v.status === 'missed')
    .sort((a, b) => a.priority - b.priority);

  return {
    totalVisits,
    completedVisits,
    pendingVisits,
    urgentVisits,
    completionRate,
    todayVisits,
    urgentList,
    dailyTrend,
    villageBreakdown: Object.values(villageMap).sort((a, b) => b.total - a.total),
    categoryBreakdown: Object.entries(categoryMap).map(([key, val]) => ({
      category: key,
      ...val,
    })),
  };
}

