/**
 * Monthly Dashboard UI Component for SwasthyaVani
 * Clean, text-only operational overview without red colors (Change 5) or emojis/icons (Change 1).
 *
 * NOTE ON DATA SOURCE:
 * Based on registered population data and locally recorded visits (derived from schedule data).
 */

import { DEMO_DATE, getDateRange, formatDisplayDate, getMonthlyDashboardStats } from '../core/history.js';
import { getDueItemProtocolInfo } from '../core/visitList.js';

export function renderDashboardView(state, onNavigateToVisitDate) {
  const t = state.translations || {};
  const currentLang = state.lang || 'en';
  const container = document.createElement('div');
  container.className = 'view-container dashboard-view';

  // Component state
  let selectedAsha = 'all';

  function loadVisitedRecords() {
    try {
      return JSON.parse(localStorage.getItem('swasthyavani_visited_visits') || '[]');
    } catch {
      return [];
    }
  }

  function getLocalizedText(prefix, key) {
    if (!key) return '';
    const normKey = String(key).toLowerCase().replace(/[\s-]+/g, '_');
    if (t[prefix] && t[prefix][normKey]) {
      return t[prefix][normKey];
    }
    return key;
  }

  function render() {
    container.innerHTML = '';
    const visitedRecords = loadVisitedRecords();

    // 30 days up to demo date
    const dates = getDateRange(DEMO_DATE, 30, 0);
    const stats = getMonthlyDashboardStats(
      dates,
      state.visits,
      state.enrichedRegister,
      visitedRecords,
      selectedAsha
    );

    // 1. Header Card with Title, ASHA Worker Filter, and Data Basis Notice
    const headerCard = document.createElement('div');
    headerCard.className = 'card dashboard-header-card';
    headerCard.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:10px;margin-bottom:12px;">
        <div>
          <h2 class="section-title">${t.dashboard ? t.dashboard.title : 'Monthly Activity Dashboard'}</h2>
          <p class="section-sub">${t.dashboard ? t.dashboard.subtitle : 'Chandrapuri Block frontline performance overview across past 30 days.'}</p>
        </div>
        <div style="display:flex;align-items:center;gap:6px;">
          <label for="dash-asha-select" class="meta-label">ASHA:</label>
          <select id="dash-asha-select" class="form-select" style="width:auto;padding:6px 10px;font-size:0.85rem;">
            <option value="all" ${selectedAsha === 'all' ? 'selected' : ''}>${t.filters ? t.filters.allDistricts.replace('Districts', 'ASHAs') : 'All ASHAs'}</option>
            <option value="ASHA-096P" ${selectedAsha === 'ASHA-096P' ? 'selected' : ''}>Sunaina Devi (Amrapur)</option>
            <option value="ASHA-RRR5" ${selectedAsha === 'ASHA-RRR5' ? 'selected' : ''}>Kalavati Kumari (Belwadi Tola)</option>
            <option value="ASHA-YFK5" ${selectedAsha === 'ASHA-YFK5' ? 'selected' : ''}>Rinku Devi (Kesarganj)</option>
            <option value="ASHA-L9R8" ${selectedAsha === 'ASHA-L9R8' ? 'selected' : ''}>Shabnam Khatoon (Dhanpura)</option>
            <option value="ASHA-KQXR" ${selectedAsha === 'ASHA-KQXR' ? 'selected' : ''}>Malti Devi (Navagaon/Sita)</option>
          </select>
        </div>
      </div>

      <!-- Data Basis Note -->
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;color:#166534;padding:8px 12px;border-radius:8px;font-size:0.8rem;margin-bottom:14px;">
        <span>${t.dashboard ? t.dashboard.dataBasisNote : 'Based on registered population data and locally recorded visits (derived from schedule data).'}</span>
      </div>

      <!-- KPI Summary Cards Grid (No Red) -->
      <div class="stats-grid" style="grid-template-columns:repeat(auto-fit, minmax(130px, 1fr));gap:10px;">
        <div class="stat-box">
          <span class="stat-num">${stats.totalVisits}</span>
          <span class="stat-label">${t.dashboard ? t.dashboard.totalScheduled : 'Total Scheduled'}</span>
        </div>
        <div class="stat-box" style="background:#ecfdf5;border-color:#a7f3d0;color:#065f46;">
          <span class="stat-num" style="color:#059669;">${stats.completedVisits}</span>
          <span class="stat-label">${t.dashboard ? t.dashboard.completed : 'Completed'}</span>
        </div>
        <div class="stat-box" style="background:#f8fafc;border-color:#cbd5e1;color:#334155;">
          <span class="stat-num" style="color:#475569;">${stats.pendingVisits}</span>
          <span class="stat-label">${t.dashboard ? t.dashboard.pendingMissed : 'Pending / Missed'}</span>
        </div>
        <div class="stat-box" style="background:#fffbeb;border-color:#fcd34d;color:#92400e;">
          <span class="stat-num" style="color:#b45309;font-weight:800;">${stats.urgentVisits}</span>
          <span class="stat-label" style="font-weight:700;">${t.visits ? t.visits.statUrgent : 'Priority 1 (Urgent)'}</span>
        </div>
        <div class="stat-box" style="background:#f0f9ff;border-color:#bae6fd;color:#0369a1;">
          <span class="stat-num" style="color:#0284c7;">${stats.completionRate}%</span>
          <span class="stat-label">${t.dashboard ? t.dashboard.completionRate : 'Completion Rate'}</span>
        </div>
      </div>
    `;

    container.appendChild(headerCard);

    // 2. Today's Urgent Triage Panel (Top Priority, Calm Amber/Blue Palette, No Red)
    const todayPanel = document.createElement('div');
    todayPanel.className = 'card dashboard-today-card';
    todayPanel.style.marginTop = '12px';

    const emergencyItems = stats.urgentList.slice(0, 8);
    const emergencyCardsHtml = emergencyItems.length > 0
      ? emergencyItems
          .map((v) => {
            const vilName = getLocalizedText('village', v.village || 'Chandrapuri');
            const protoInfo = getDueItemProtocolInfo(v.due_item);
            return `
              <div
                class="emergency-item-row"
                data-mid="${escapeHtml(v.member_id)}"
                data-item="${escapeHtml(v.due_item)}"
                style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;padding:10px 12px;background:#fffbeb;border:1px solid #fde68a;border-radius:8px;margin-bottom:8px;cursor:pointer;"
              >
                <div>
                  <div style="display:flex;align-items:center;gap:6px;">
                    <span style="font-weight:700;color:#0f172a;font-size:0.95rem;">${escapeHtml(v.name || v.member_id)}</span>
                    <span style="background:#f59e0b;color:#ffffff;font-size:0.7rem;font-weight:700;padding:2px 6px;border-radius:4px;">Urgent</span>
                  </div>
                  <div style="font-size:0.78rem;color:#78350f;margin-top:2px;">
                    ${escapeHtml(vilName)} · <strong>${escapeHtml(v.due_item)}</strong> (${escapeHtml(protoInfo.title)})
                  </div>
                </div>
                <div style="display:flex;align-items:center;gap:6px;">
                  <span style="font-size:0.75rem;background:#fef3c7;color:#92400e;padding:3px 8px;border-radius:4px;font-weight:600;">
                    ${escapeHtml(protoInfo.citation)}
                  </span>
                  <a href="tel:108" class="btn btn-sm btn-secondary" style="text-decoration:none;padding:2px 8px;font-size:0.75rem;">108</a>
                </div>
              </div>
            `;
          })
          .join('')
      : `<p style="font-size:0.85rem;color:var(--color-muted);">${t.dashboard ? t.dashboard.noUrgentToday : 'No urgent alerts flagged today.'}</p>`;

    todayPanel.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;flex-wrap:wrap;gap:6px;">
        <h3 style="font-size:1.05rem;font-weight:700;color:#92400e;">
          ${t.dashboard ? t.dashboard.todayUrgentTitle : "Today's Clinical Triage"} (${DEMO_DATE})
        </h3>
        <span style="font-size:0.75rem;color:var(--color-muted);">
          ${emergencyItems.length} ${t.dashboard ? t.dashboard.flaggedPatients : 'flagged beneficiaries'}
        </span>
      </div>
      <div class="emergency-list-wrap">
        ${emergencyCardsHtml}
      </div>
    `;

    container.appendChild(todayPanel);

    // 3. 30-Day Activity SVG Trend Chart (No Red, Calm Blue/Teal)
    const trendCard = document.createElement('div');
    trendCard.className = 'card dashboard-trend-card';
    trendCard.style.marginTop = '12px';

    const maxDayTotal = Math.max(...stats.dailyTrend.map((d) => d.total), 1);
    const chartHeight = 100;
    const barWidth = 14;
    const gap = 5;
    const totalSvgWidth = stats.dailyTrend.length * (barWidth + gap);

    const svgBarsHtml = stats.dailyTrend
      .map((d, i) => {
        const h = Math.max(Math.round((d.total / maxDayTotal) * (chartHeight - 25)), 4);
        const y = chartHeight - h - 18;
        const x = i * (barWidth + gap);
        const isDemo = d.date === DEMO_DATE;
        const color = isDemo ? '#d97706' : (d.completed > 0 ? '#10b981' : '#0d9488');
        return `
          <g class="chart-bar-group" data-date="${d.date}" style="cursor:pointer;">
            <title>${d.date}: ${d.total} total, ${d.completed} completed, ${d.p1} urgent (Click to jump)</title>
            <rect x="${x}" y="${y}" width="${barWidth}" height="${h}" rx="3" fill="${color}" opacity="${isDemo ? '1' : '0.85'}" />
            ${i % 6 === 0 ? `<text x="${x + barWidth / 2}" y="${chartHeight - 4}" font-size="7" text-anchor="middle" fill="#64748b">${d.date.slice(5)}</text>` : ''}
          </g>
        `;
      })
      .join('');

    trendCard.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;flex-wrap:wrap;gap:6px;">
        <h3 style="font-size:1.05rem;font-weight:700;color:var(--color-teal-dark);">
          ${t.dashboard ? t.dashboard.trendTitle : '30-Day Daily Activity & Workload Trend'}
        </h3>
        <span style="font-size:0.75rem;color:var(--color-muted);">
          ${t.dashboard ? t.dashboard.clickBarHint : 'Click bar to jump to date'}
        </span>
      </div>
      <div style="overflow-x:auto;padding-bottom:6px;">
        <svg viewBox="0 0 ${totalSvgWidth} ${chartHeight}" style="width:100%;min-width:480px;height:${chartHeight}px;display:block;">
          ${svgBarsHtml}
        </svg>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:0.75rem;color:var(--color-muted);margin-top:6px;border-top:1px dashed var(--color-border);padding-top:6px;">
        <span>${formatDisplayDate(dates[0], currentLang)}</span>
        <span>${t.visits ? t.visits.title : 'Demo Date'}: ${formatDisplayDate(DEMO_DATE, currentLang)}</span>
        <span>${formatDisplayDate(dates[dates.length - 1], currentLang)}</span>
      </div>
    `;

    trendCard.querySelectorAll('.chart-bar-group').forEach((g) => {
      g.addEventListener('click', (e) => {
        const d = e.currentTarget.getAttribute('data-date');
        if (d && onNavigateToVisitDate) {
          onNavigateToVisitDate(d);
        }
      });
    });

    container.appendChild(trendCard);

    // 4. Village Breakdown Table (No Red)
    const villageCard = document.createElement('div');
    villageCard.className = 'card dashboard-village-card';
    villageCard.style.marginTop = '12px';

    const villageRowsHtml = stats.villageBreakdown
      .map((vil) => {
        const locVil = getLocalizedText('village', vil.village);
        const percent = vil.total > 0 ? Math.round((vil.completed / vil.total) * 100) : 0;
        return `
          <tr style="border-bottom:1px solid var(--color-border);">
            <td style="padding:8px 6px;font-weight:700;">${escapeHtml(locVil)}</td>
            <td style="padding:8px 6px;text-align:center;">${vil.total}</td>
            <td style="padding:8px 6px;text-align:center;color:#16a34a;font-weight:600;">${vil.completed}</td>
            <td style="padding:8px 6px;text-align:center;color:#b45309;font-weight:700;">${vil.p1}</td>
            <td style="padding:8px 6px;">
              <div style="display:flex;align-items:center;gap:6px;">
                <div style="flex:1;height:6px;background:#e2e8f0;border-radius:3px;overflow:hidden;">
                  <div style="width:${percent}%;height:100%;background:#0d9488;"></div>
                </div>
                <span style="font-size:0.75rem;font-weight:600;min-width:30px;">${percent}%</span>
              </div>
            </td>
          </tr>
        `;
      })
      .join('');

    villageCard.innerHTML = `
      <h3 style="font-size:1.05rem;font-weight:700;color:var(--color-text);margin-bottom:10px;">
        ${t.dashboard ? t.dashboard.villageBreakdownTitle : 'Village Performance Breakdown (Past 30 Days)'}
      </h3>
      <div style="overflow-x:auto;">
        <table style="width:100%;border-collapse:collapse;font-size:0.85rem;">
          <thead>
            <tr style="background:#f1f5f9;border-bottom:2px solid var(--color-border);text-align:left;">
              <th style="padding:8px 6px;">${t.filters ? t.filters.villageLabel : 'Village'}</th>
              <th style="padding:8px 6px;text-align:center;">${t.visits ? t.visits.statTotal : 'Total'}</th>
              <th style="padding:8px 6px;text-align:center;">${t.dashboard ? t.dashboard.completed : 'Done'}</th>
              <th style="padding:8px 6px;text-align:center;">${t.visits ? t.visits.statUrgent : 'Urgent'}</th>
              <th style="padding:8px 6px;min-width:110px;">${t.dashboard ? t.dashboard.progress : 'Progress'}</th>
            </tr>
          </thead>
          <tbody>
            ${villageRowsHtml}
          </tbody>
        </table>
      </div>
    `;

    container.appendChild(villageCard);

    // 5. Clinical Category Split (No Red)
    const catCard = document.createElement('div');
    catCard.className = 'card dashboard-cat-card';
    catCard.style.marginTop = '12px';

    const catRowsHtml = stats.categoryBreakdown
      .map((c) => {
        const catName = getLocalizedText('categories', c.category);
        return `
          <div style="padding:10px;background:#f8fafc;border:1px solid var(--color-border);border-radius:8px;font-size:0.85rem;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
              <span style="font-weight:700;color:var(--color-teal-dark);">${escapeHtml(catName)} (${c.code})</span>
              <span style="font-weight:700;">${c.total}</span>
            </div>
            <div style="display:flex;gap:10px;font-size:0.75rem;color:var(--color-muted);">
              <span>${t.dashboard ? t.dashboard.completed : 'Done'}: <strong>${c.completed}</strong></span>
              <span>${t.dashboard ? t.dashboard.pending : 'Pending'}: <strong>${c.pending}</strong></span>
            </div>
          </div>
        `;
      })
      .join('');

    catCard.innerHTML = `
      <h3 style="font-size:1.05rem;font-weight:700;color:var(--color-text);margin-bottom:10px;">
        ${t.dashboard ? t.dashboard.categorySplitTitle : 'Clinical Program Categories'}
      </h3>
      <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(180px, 1fr));gap:8px;">
        ${catRowsHtml}
      </div>
    `;

    container.appendChild(catCard);

    // Attach Event Listeners
    const ashaSelect = headerCard.querySelector('#dash-asha-select');
    if (ashaSelect) {
      ashaSelect.addEventListener('change', (e) => {
        selectedAsha = e.target.value;
        render();
      });
    }

    // Modal popup on emergency patient click
    todayPanel.querySelectorAll('.emergency-item-row').forEach((row) => {
      row.addEventListener('click', (e) => {
        if (e.target && e.target.tagName === 'A') return;
        const mid = row.getAttribute('data-mid');
        const item = row.getAttribute('data-item');
        const visit = state.visits.find((v) => v.member_id === mid && v.due_item === item)
          || { member_id: mid, due_item: item, priority: 1, name: mid };
        openEmergencyModal(visit);
      });
    });
  }

  function openEmergencyModal(visit) {
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay';
    const enriched = (state.enrichedRegister || []).find((r) => r.member_id === visit.member_id) || {};
    const patient = { ...enriched, ...visit };
    const protoInfo = getDueItemProtocolInfo(visit.due_item);

    modalOverlay.innerHTML = `
      <div class="modal-dialog" style="max-width:500px;">
        <div class="modal-header" style="background:#fffbeb;border-bottom:1px solid #fde68a;">
          <div>
            <h3 style="color:#92400e;margin:0;">${escapeHtml(patient.name || patient.member_id)}</h3>
            <span style="font-size:0.75rem;color:#78350f;">${escapeHtml(patient.member_id)} · ${escapeHtml(patient.village || 'Chandrapuri')}</span>
          </div>
          <button type="button" class="modal-close-btn" style="color:#92400e;">×</button>
        </div>
        <div class="modal-body" style="padding:16px;">
          <div style="margin-bottom:12px;">
            <strong>${t.visits ? t.visits.colDue : 'Due Clinical Item'}:</strong>
            <div style="color:#92400e;font-weight:700;font-size:1rem;margin-top:2px;">
              ${escapeHtml(visit.due_item)} — ${escapeHtml(protoInfo.title)}
            </div>
            <p style="font-size:0.85rem;color:#334155;margin-top:4px;">${escapeHtml(protoInfo.description)}</p>
          </div>
          <div style="background:#fffbeb;border:1px solid #fde68a;padding:10px;border-radius:6px;font-size:0.82rem;margin-bottom:14px;">
            <strong>${t.card ? t.card.escalateAction : 'Immediate Action'}:</strong>
            <div>High urgency danger sign flagged. Refer immediately to Medical Officer at Chandrapuri Sub-Centre / FRU.</div>
            <div style="margin-top:4px;font-weight:700;color:#92400e;">Protocol Citation: ${escapeHtml(protoInfo.citation)}</div>
          </div>
          <div style="display:flex;gap:8px;">
            <a href="tel:108" class="btn btn-primary" style="flex:1;text-decoration:none;text-align:center;">Call 108</a>
            <a href="tel:102" class="btn btn-secondary" style="flex:1;text-decoration:none;text-align:center;">Call 102</a>
          </div>
        </div>
      </div>
    `;

    modalOverlay.querySelector('.modal-close-btn').addEventListener('click', () => modalOverlay.remove());
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) modalOverlay.remove();
    });
    document.body.appendChild(modalOverlay);
  }

  render();
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
