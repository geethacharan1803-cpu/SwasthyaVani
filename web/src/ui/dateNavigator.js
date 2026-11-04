/**
 * Date Navigator UI Component for SwasthyaVani Visit Planner
 * Clean text-only navigation controls, day step buttons, and daily village workload summary.
 */

import { DEMO_DATE, formatDisplayDate, getDailySummary } from '../core/history.js';

export function renderDateNavigator({
  selectedDate,
  onDateChange,
  state,
  visitsForDate = [],
}) {
  const t = state.translations || {};
  const currentLang = state.lang || 'en';
  const container = document.createElement('div');
  container.className = 'date-navigator-container';
  container.style.marginBottom = '14px';

  const minDate = '2026-09-26';
  const maxDate = '2026-11-25';

  const anchor = new Date(`${selectedDate}T00:00:00Z`);
  const prevDate = new Date(anchor.getTime() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const nextDate = new Date(anchor.getTime() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const canPrev = prevDate >= minDate;
  const canNext = nextDate <= maxDate;

  const summary = getDailySummary(visitsForDate);
  const isDemoDate = selectedDate === DEMO_DATE;

  const displayDateStr = formatDisplayDate(selectedDate, currentLang);

  // Villages with counts
  const villagePillsHtml = Object.entries(summary.villages || {})
    .slice(0, 4)
    .map(([vil, count]) => {
      const normVil = vil.toLowerCase().replace(/[\s-]+/g, '_');
      const locVil = t.village && t.village[normVil] ? t.village[normVil] : vil;
      return `<span style="background:var(--color-surface);border:1px solid var(--color-border);padding:2px 8px;border-radius:6px;font-size:0.75rem;">${escapeHtml(locVil)}: <strong>${count}</strong></span>`;
    })
    .join(' ');

  container.innerHTML = `
    <div class="card date-navigator-card" style="padding:14px;background:var(--color-surface);border:1px solid var(--color-border);border-radius:10px;">
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;border-bottom:1px solid var(--color-border);padding-bottom:10px;margin-bottom:10px;">
        <div style="display:flex;align-items:center;gap:6px;">
          <button type="button" class="btn btn-sm btn-secondary btn-nav-prev" ${canPrev ? '' : 'disabled'} title="Previous Day" style="min-height:36px;padding:4px 10px;">
            ${t.pagination ? t.pagination.prev : 'Previous'}
          </button>
          <div style="text-align:center;">
            <div style="font-size:1.05rem;font-weight:700;color:var(--color-teal-dark);">
              ${displayDateStr}
            </div>
            <div style="font-size:0.75rem;color:var(--color-muted);">
              ${isDemoDate ? `(${t.visits ? t.visits.title : 'Demo Date'})` : '(Schedule View)'}
            </div>
          </div>
          <button type="button" class="btn btn-sm btn-secondary btn-nav-next" ${canNext ? '' : 'disabled'} title="Next Day" style="min-height:36px;padding:4px 10px;">
            ${t.pagination ? t.pagination.next : 'Next'}
          </button>
        </div>

        <div style="display:flex;align-items:center;gap:8px;">
          <button type="button" class="btn btn-sm ${isDemoDate ? 'btn-primary' : 'btn-secondary'} btn-nav-today" style="font-size:0.8rem;min-height:36px;padding:4px 10px;">
            ${t.dateNav ? t.dateNav.btnToday : 'Today'}
          </button>
          <input
            type="date"
            class="form-input date-input-picker"
            min="${minDate}"
            max="${maxDate}"
            value="${selectedDate}"
            style="width:auto;padding:4px 8px;font-size:0.85rem;min-height:36px;"
          />
        </div>
      </div>

      <!-- Quick Day Strip of Nearby 5 Days -->
      <div class="quick-days-strip" style="display:flex;gap:6px;overflow-x:auto;padding-bottom:8px;margin-bottom:8px;">
        ${[-2, -1, 0, 1, 2]
          .map((offset) => {
            const targetD = new Date(anchor.getTime() + offset * 24 * 60 * 60 * 1000)
              .toISOString()
              .slice(0, 10);
            if (targetD < minDate || targetD > maxDate) return '';
            const isSel = targetD === selectedDate;
            const shortStr = formatDisplayDate(targetD, currentLang).slice(0, 6);
            return `
              <button
                type="button"
                class="btn btn-sm ${isSel ? 'btn-primary' : 'btn-secondary'} btn-strip-day"
                data-date="${targetD}"
                style="flex:1;min-width:65px;padding:4px 6px;font-size:0.75rem;display:flex;flex-direction:column;align-items:center;"
              >
                <span>${shortStr}</span>
              </button>
            `;
          })
          .join('')}
      </div>

      <!-- Workload Summary Chips -->
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;font-size:0.82rem;background:#f8fafc;padding:8px 10px;border-radius:8px;">
        <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
          <span>${t.visits ? t.visits.statTotal : 'Total'}: <strong>${summary.total}</strong></span>
          <span style="color:#16a34a;">${t.dateNav ? t.dateNav.completed : 'Done'}: <strong>${summary.completed}</strong></span>
          <span style="color:#d97706;">${t.dateNav ? t.dateNav.missed : 'Missed'}: <strong>${summary.missed}</strong></span>
          <span style="color:#0284c7;">${t.dateNav ? t.dateNav.planned : 'Planned'}: <strong>${summary.planned}</strong></span>
        </div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;">
          ${villagePillsHtml}
        </div>
      </div>

      ${
        !isDemoDate
          ? `<div style="font-size:0.72rem;color:var(--color-muted);margin-top:6px;font-style:italic;text-align:right;">
              ${t.dashboard ? t.dashboard.derivedNote : 'Derived from schedule data and locally recorded visits'}
            </div>`
          : ''
      }
    </div>
  `;

  // Attach event handlers
  const prevBtn = container.querySelector('.btn-nav-prev');
  const nextBtn = container.querySelector('.btn-nav-next');
  const todayBtn = container.querySelector('.btn-nav-today');
  const pickerInput = container.querySelector('.date-input-picker');

  if (prevBtn && canPrev) {
    prevBtn.addEventListener('click', () => onDateChange(prevDate));
  }
  if (nextBtn && canNext) {
    nextBtn.addEventListener('click', () => onDateChange(nextDate));
  }
  if (todayBtn) {
    todayBtn.addEventListener('click', () => onDateChange(DEMO_DATE));
  }
  if (pickerInput) {
    pickerInput.addEventListener('change', (e) => {
      const val = e.target.value;
      if (val && val >= minDate && val <= maxDate) {
        onDateChange(val);
      }
    });
  }

  container.querySelectorAll('.btn-strip-day').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const d = e.currentTarget.getAttribute('data-date');
      if (d) onDateChange(d);
    });
  });

  return container;
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
