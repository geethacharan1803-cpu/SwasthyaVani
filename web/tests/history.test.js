import { describe, it, expect } from 'vitest';
import {
  DEMO_DATE,
  getDateRange,
  formatDisplayDate,
  deriveVisitsForDate,
  getDailySummary,
  getMonthlyDashboardStats,
} from '../src/core/history.js';

describe('History & Date Navigation Module', () => {
  const sampleBaseVisits = [
    {
      member_id: 'M-001',
      due_item: 'ANC-1',
      priority: 1,
      status: 'overdue',
      village: 'Amrapur',
      asha_id: 'ASHA-096P',
      name: 'Radha Devi',
    },
    {
      member_id: 'M-002',
      due_item: 'HBNC-1',
      priority: 1,
      status: 'due_today',
      village: 'Dhanpura',
      asha_id: 'ASHA-L9R8',
      name: 'Anita Bai',
    },
    {
      member_id: 'M-003',
      due_item: 'BP-followup',
      priority: 2,
      status: 'due_today',
      village: 'Belwadi Tola',
      asha_id: 'ASHA-RRR5',
      name: 'Suresh Kumar',
    },
    {
      member_id: 'M-004',
      due_item: 'BCG',
      priority: 3,
      status: 'due_today',
      village: 'Amrapur',
      asha_id: 'ASHA-096P',
      name: 'Baby of Radha',
    },
  ];

  it('generates correct date ranges', () => {
    const range = getDateRange('2026-10-26', 2, 2);
    expect(range).toEqual([
      '2026-10-24',
      '2026-10-25',
      '2026-10-26',
      '2026-10-27',
      '2026-10-28',
    ]);

    const defaultRange = getDateRange();
    expect(defaultRange.length).toBe(61);
    expect(defaultRange[30]).toBe(DEMO_DATE);

    // Defensive check
    const badRange = getDateRange('invalid-date');
    expect(badRange).toEqual([DEMO_DATE]);
  });

  it('formats display dates in English, Telugu, and Hindi', () => {
    expect(formatDisplayDate('2026-10-26', 'en')).toBe('26 Oct 2026');
    expect(formatDisplayDate('2026-10-26', 'te')).toContain('అక్టోబరు');
    expect(formatDisplayDate('2026-10-26', 'hi')).toContain('अक्टूबर');
    expect(formatDisplayDate(null)).toBe('');
  });

  it('returns canonical base visits for demo date 2026-10-26', () => {
    const visits = deriveVisitsForDate('2026-10-26', sampleBaseVisits, [], []);
    expect(visits.length).toBe(4);
    expect(visits[0].date).toBe('2026-10-26');
    expect(visits[0].priority).toBe(1);
  });

  it('updates visit status to completed when present in visitedRecords', () => {
    const visited = [
      {
        key: 'M-001_ANC-1',
        date: '2026-10-26',
        memberId: 'M-001',
        dueItem: 'ANC-1',
        timestamp: '2026-10-26T10:00:00Z',
        note: 'BP checked normal',
      },
    ];

    const visits = deriveVisitsForDate('2026-10-26', sampleBaseVisits, [], visited);
    const m1 = visits.find((v) => v.member_id === 'M-001');
    expect(m1.status).toBe('completed');
    expect(m1.completedNote).toBe('BP checked normal');
  });

  it('computes daily summary statistics accurately', () => {
    const visits = [
      { member_id: 'M-1', status: 'completed', priority: 1, village: 'Amrapur' },
      { member_id: 'M-2', status: 'missed', priority: 1, village: 'Amrapur' },
      { member_id: 'M-3', status: 'planned', priority: 2, village: 'Dhanpura' },
    ];

    const summary = getDailySummary(visits);
    expect(summary.total).toBe(3);
    expect(summary.completed).toBe(1);
    expect(summary.missed).toBe(1);
    expect(summary.planned).toBe(1);
    expect(summary.p1Count).toBe(2);
    expect(summary.p2Count).toBe(1);
    expect(summary.patientCount).toBe(3);
    expect(summary.villages['Amrapur']).toBe(2);
  });

  it('computes monthly dashboard totals with exact mathematical parity', () => {
    const dates = ['2026-10-24', '2026-10-25', '2026-10-26'];
    const visited = [
      {
        key: 'M-001_ANC-1',
        date: '2026-10-26',
        memberId: 'M-001',
        dueItem: 'ANC-1',
        timestamp: '2026-10-26T10:00:00Z',
      },
    ];

    const stats = getMonthlyDashboardStats(dates, sampleBaseVisits, [], visited);

    // Mathematical parity invariant:
    const sumDailyTotal = stats.dailyTrend.reduce((acc, d) => acc + d.total, 0);
    const sumDailyCompleted = stats.dailyTrend.reduce((acc, d) => acc + d.completed, 0);

    expect(stats.totalVisits).toBe(sumDailyTotal);
    expect(stats.completedVisits).toBe(sumDailyCompleted);
    expect(stats.completedVisits).toBeGreaterThanOrEqual(1);
    expect(stats.villageBreakdown.length).toBeGreaterThan(0);
    expect(stats.categoryBreakdown.length).toBe(6);
  });

  it('handles empty and null arguments defensively without throwing', () => {
    expect(getDailySummary(null).total).toBe(0);
    expect(getDailySummary([]).total).toBe(0);
    expect(deriveVisitsForDate(null, null).length).toBe(0);
    const stats = getMonthlyDashboardStats([], [], [], []);
    expect(stats.totalVisits).toBe(0);
    expect(stats.completionRate).toBe(0);
  });
});

