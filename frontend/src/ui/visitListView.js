/**
 * Visit Planner UI Component
 * Clean, text-only daily prioritized visit schedule for frontline workers with:
 * - Top-to-bottom layout: Title + one-line description -> Date selector -> Summary line -> Filters -> Priority grouped visit list -> Patient pop-up
 * - Multi-criteria filters: ASHA, Village, Category, and Search
 * - Priority grouped visits: Urgent, Due today, Overdue, Upcoming with plain-language labels
 * - Mark as visited and log note actions with offline sync
 * - Accessible patient pop-up modal with clinical profile & trilingual TTS
 */

import {
  filterVisits,
  getVisitStats,
  groupVisitsByVillage,
  getDueItemProtocolInfo,
} from '../core/visitList.js';
import { speechManager } from '../tts/speaker.js';
import { syncQueue } from '../sync/syncQueue.js';
import { deriveVisitsForDate } from '../core/history.js';
import { renderDateNavigator } from './dateNavigator.js';

export function renderVisitListView(state) {
  const t = state.translations;
  const container = document.createElement('div');
  container.className = 'view-container visit-view';

  // Component local state
  let currentPriorityFilter = 0; // 0 = All, 1 = P1, 2 = P2, 3 = P3
  let searchQuery = '';
  let groupByVillage = false;
  let selectedDate = state.selectedVisitDate || '2026-10-26';
  state.selectedVisitDate = null;
  let selectedAsha = 'all';
  let selectedVillage = 'all';
  let selectedCategory = 'all';

  // Load visited visits from localStorage: array of objects { key, date, memberId, dueItem, timestamp, note }
  function loadVisitedRecords() {
    try {
      return JSON.parse(localStorage.getItem('swasthyavani_visited_visits') || '[]');
    } catch {
      return [];
    }
  }

  function saveVisitedRecords(records) {
    try {
      localStorage.setItem('swasthyavani_visited_visits', JSON.stringify(records));
    } catch (err) {
      console.warn('[SwasthyaVani] Could not persist visited records:', err);
    }
  }

  let visitedRecords = loadVisitedRecords();
  let visitedKeys = new Set(visitedRecords.map((r) => r.key || `${r.memberId}_${r.dueItem}`));

  // Helper for localized village and district names
  function getLocalizedText(prefix, key) {
    if (!key) return '';
    const normKey = String(key).toLowerCase().replace(/[\s-]+/g, '_');
    if (t[prefix] && t[prefix][normKey]) {
      return t[prefix][normKey];
    }
    return key;
  }

  function toggleVisited(visit, optionalNote = '') {
    const key = `${visit.member_id}_${visit.due_item}`;
    if (visitedKeys.has(key)) {
      // Remove
      visitedRecords = visitedRecords.filter((r) => (r.key || `${r.memberId}_${r.dueItem}`) !== key);
      visitedKeys.delete(key);
    } else {
      // Add
      const entry = {
        key,
        date: selectedDate,
        memberId: visit.member_id,
        dueItem: visit.due_item,
        timestamp: new Date().toISOString(),
        note: optionalNote,
      };
      visitedRecords.push(entry);
      visitedKeys.add(key);
      syncQueue.enqueue({
        type: 'visit_completed',
        memberId: visit.member_id,
        dueItem: visit.due_item,
        date: selectedDate,
        note: optionalNote,
        timestamp: entry.timestamp,
      });
    }
    saveVisitedRecords(visitedRecords);
    render();
  }

  function render() {
    container.innerHTML = '';

    const activeVisits = deriveVisitsForDate(selectedDate, state.visits, state.enrichedRegister, visitedRecords)
      .filter((v) => (selectedAsha === 'all' || !selectedAsha ? true : v.asha_id === selectedAsha))
      .filter((v) => (selectedVillage === 'all' || !selectedVillage ? true : (v.village || '').toLowerCase() === selectedVillage.toLowerCase()))
      .filter((v) => {
        if (selectedCategory === 'all' || !selectedCategory) return true;
        const cat = (v.clinical_category || '').toLowerCase();
        const item = (v.due_item || '').toLowerCase();
        return cat.includes(selectedCategory) || item.includes(selectedCategory);
      });

    const stats = getVisitStats(activeVisits, visitedKeys);

    // 1. Title + one-line description
    const headerCard = document.createElement('div');
    headerCard.className = 'card visit-header-card';
    headerCard.style.padding = '14px 18px';
    headerCard.style.marginBottom = '12px';
    headerCard.innerHTML = `
      <div class="visit-title-row" style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:10px;">
        <div>
          <h2 class="section-title" style="margin-bottom:4px;">${t.visits ? t.visits.title : 'Visit Planner'}</h2>
          <p class="section-sub" style="margin-bottom:0;">${t.visits && t.visits.subtitle ? t.visits.subtitle : (t.visits ? t.visits.dateNotice : 'Schedule and prioritize frontline home visits.')}</p>
        </div>
        <div class="header-actions-row" style="display:flex;gap:8px;align-items:center;">
          <button type="button" id="btn-print-schedule" class="btn btn-sm btn-secondary">
            ${t.visits ? t.visits.btnPrint : 'Print Schedule'}
          </button>
          <div class="sync-status-badge">
            <span class="sync-count">${syncQueue.getPendingCount()}</span>
            <span>${t.visits ? t.visits.pendingSync : 'pending'}</span>
          </div>
        </div>
      </div>
    `;

    // 2. Date selector
    const dateNav = renderDateNavigator({
      selectedDate,
      onDateChange: (newDate) => {
        selectedDate = newDate;
        render();
      },
      state,
      visitsForDate: activeVisits,
    });

    // 3. Summary line (Total, Completed, Pending, Urgent)
    const summaryCard = document.createElement('div');
    summaryCard.className = 'card visit-summary-card';
    summaryCard.style.padding = '12px 16px';
    summaryCard.style.marginBottom = '12px';
    summaryCard.innerHTML = `
      <div class="stats-grid" style="display:grid;grid-template-columns:repeat(auto-fit, minmax(130px, 1fr));gap:10px;">
        <div class="stat-box" style="padding:8px 12px;border-radius:8px;border:1px solid var(--color-border);text-align:center;">
          <span class="stat-num" style="font-size:1.35rem;font-weight:700;display:block;">${stats.total}</span>
          <span class="stat-label" style="font-size:0.8rem;color:var(--color-muted);">${t.visits ? t.visits.statTotal : 'Total'}</span>
        </div>
        <div class="stat-box" style="padding:8px 12px;border-radius:8px;border:1px solid #a7f3d0;background:#ecfdf5;color:#065f46;text-align:center;">
          <span class="stat-num" style="font-size:1.35rem;font-weight:700;color:#059669;display:block;">${stats.completedCount}</span>
          <span class="stat-label" style="font-size:0.8rem;font-weight:600;">${t.dashboard && t.dashboard.completed ? t.dashboard.completed : 'Completed'}</span>
        </div>
        <div class="stat-box" style="padding:8px 12px;border-radius:8px;border:1px solid #cbd5e1;background:#f8fafc;color:#334155;text-align:center;">
          <span class="stat-num" style="font-size:1.35rem;font-weight:700;color:#475569;display:block;">${Math.max(stats.total - stats.completedCount, 0)}</span>
          <span class="stat-label" style="font-size:0.8rem;font-weight:600;">${t.dashboard && t.dashboard.pending ? t.dashboard.pending : 'Pending'}</span>
        </div>
        <div class="stat-box" style="padding:8px 12px;border-radius:8px;border:1px solid #fcd34d;background:#fffbeb;color:#92400e;text-align:center;">
          <span class="stat-num" style="font-size:1.35rem;font-weight:800;color:#b45309;display:block;">${stats.p1Count}</span>
          <span class="stat-label" style="font-size:0.8rem;font-weight:700;">${t.visits ? t.visits.statUrgent : 'Urgent'}</span>
        </div>
      </div>
    `;

    // 4. Filters (ASHA, Village, Category, Search)
    const filterCard = document.createElement('div');
    filterCard.className = 'card visit-filters-card';
    filterCard.style.padding = '14px 16px';
    filterCard.style.marginBottom = '12px';
    filterCard.innerHTML = `
      <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(160px, 1fr));gap:10px;margin-bottom:12px;">
        <div class="filter-group">
          <label for="visit-asha-select" class="filter-label" style="font-weight:600;font-size:0.82rem;display:block;margin-bottom:4px;">ASHA:</label>
          <select id="visit-asha-select" class="form-select" style="width:100%;padding:6px 8px;font-size:0.85rem;">
            <option value="all" ${selectedAsha === 'all' ? 'selected' : ''}>All ASHAs</option>
            <option value="ASHA-096P" ${selectedAsha === 'ASHA-096P' ? 'selected' : ''}>Sunaina Devi (Amrapur)</option>
            <option value="ASHA-RRR5" ${selectedAsha === 'ASHA-RRR5' ? 'selected' : ''}>Kalavati Kumari (Belwadi Tola)</option>
            <option value="ASHA-YFK5" ${selectedAsha === 'ASHA-YFK5' ? 'selected' : ''}>Rinku Devi (Kesarganj)</option>
            <option value="ASHA-L9R8" ${selectedAsha === 'ASHA-L9R8' ? 'selected' : ''}>Shabnam Khatoon (Dhanpura)</option>
            <option value="ASHA-KQXR" ${selectedAsha === 'ASHA-KQXR' ? 'selected' : ''}>Malti Devi (Navagaon/Sita)</option>
          </select>
        </div>

        <div class="filter-group">
          <label for="visit-village-select" class="filter-label" style="font-weight:600;font-size:0.82rem;display:block;margin-bottom:4px;">${t.filters ? t.filters.villageLabel : 'Village'}:</label>
          <select id="visit-village-select" class="form-select" style="width:100%;padding:6px 8px;font-size:0.85rem;">
            <option value="all" ${selectedVillage === 'all' ? 'selected' : ''}>${t.filters ? t.filters.allVillages : 'All Villages'}</option>
            ${['Amrapur', 'Belwadi Tola', 'Kesarganj', 'Dhanpura', 'Navagaon Khurd', 'Sitapahari']
              .map((v) => `<option value="${v}" ${selectedVillage === v ? 'selected' : ''}>${escapeHtml(getLocalizedText('village', v))}</option>`)
              .join('')}
          </select>
        </div>

        <div class="filter-group">
          <label for="visit-category-select" class="filter-label" style="font-weight:600;font-size:0.82rem;display:block;margin-bottom:4px;">${t.filters ? t.filters.categoryLabel : 'Category'}:</label>
          <select id="visit-category-select" class="form-select" style="width:100%;padding:6px 8px;font-size:0.85rem;">
            <option value="all" ${selectedCategory === 'all' ? 'selected' : ''}>${t.filters ? t.filters.allCategories : 'All Categories'}</option>
            <option value="anc" ${selectedCategory === 'anc' ? 'selected' : ''}>${t.categories ? t.categories.anc : 'ANC'}</option>
            <option value="hbnc" ${selectedCategory === 'hbnc' ? 'selected' : ''}>${t.categories ? t.categories.hbnc : 'HBNC'}</option>
            <option value="imm" ${selectedCategory === 'imm' ? 'selected' : ''}>${t.categories ? t.categories.imm : 'Immunization'}</option>
            <option value="nut" ${selectedCategory === 'nut' ? 'selected' : ''}>${t.categories ? t.categories.nut : 'Nutrition'}</option>
            <option value="ncd" ${selectedCategory === 'ncd' ? 'selected' : ''}>${t.categories ? t.categories.ncd : 'NCD'}</option>
          </select>
        </div>
      </div>

      <div class="search-row" style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
        <input
          type="text"
          id="visit-search-input"
          class="form-input"
          placeholder="${t.visits.searchPlaceholder}"
          value="${escapeHtml(searchQuery)}"
          style="flex:1;min-width:180px;"
        />
        <button type="button" id="btn-toggle-route" class="btn btn-sm ${groupByVillage ? 'btn-primary' : 'btn-secondary'}">
          ${groupByVillage ? (t.visits.allVillagesGroup || 'List View') : (t.visits.groupByVillage || 'Group by Village')}
        </button>
      </div>
    `;

    // 5. Visit list grouped by priority (Urgent, Due today, Overdue, Upcoming)
    const filtered = filterVisits(activeVisits, {
      priority: currentPriorityFilter === 0 ? undefined : currentPriorityFilter,
      searchQuery,
    });

    const listCard = document.createElement('div');
    listCard.className = 'card visit-items-card';

    if (!filtered.length) {
      listCard.innerHTML = `<p class="empty-notice" style="padding:20px;text-align:center;color:var(--color-muted);">${t.visits.emptyNotice}</p>`;
    } else if (groupByVillage) {
      // Group by village
      const villageGroups = groupVisitsByVillage(filtered);
      let groupsHtml = '';

      for (const group of villageGroups) {
        const localizedVil = getLocalizedText('village', group.village);
        const rowsHtml = group.visits.map((v) => renderVisitRowHtml(v)).join('');

        groupsHtml += `
          <div class="village-group-section" style="margin-bottom:16px;">
            <div class="village-section-header" style="display:flex;justify-content:space-between;padding:8px 12px;background:#f1f5f9;border-radius:6px;font-weight:700;margin-bottom:8px;">
              <span>${escapeHtml(localizedVil)}</span>
              <span class="badge-count">${group.count} ${t.visits.statTotal}</span>
            </div>
            <div class="visit-list-table">
              <div class="table-header">
                <span>${t.visits.colMember}</span>
                <span>${t.visits.colDue}</span>
                <span>${t.visits.colStatus}</span>
                <span>${t.visits.colPriority}</span>
                <span>Action</span>
              </div>
              ${rowsHtml}
            </div>
          </div>
        `;
      }
      listCard.innerHTML = groupsHtml;
    } else {
      // Group by priority: Urgent, Due today, Overdue, Upcoming
      const urgentGroup = [];
      const dueTodayGroup = [];
      const overdueGroup = [];
      const upcomingGroup = [];

      filtered.forEach((v) => {
        if (v.priority === 1) {
          urgentGroup.push(v);
        } else if (v.status === 'overdue' || v.status === 'missed') {
          overdueGroup.push(v);
        } else if (v.status === 'due_today' || v.status === 'due' || v.priority === 2) {
          dueTodayGroup.push(v);
        } else {
          upcomingGroup.push(v);
        }
      });

      const prioritySections = [
        {
          key: 'urgent',
          title: t.visits ? (t.visits.labelUrgent || 'Urgent') : 'Urgent',
          badgeStyle: 'background:#fffbeb;border:1px solid #fde68a;color:#92400e;',
          items: urgentGroup,
        },
        {
          key: 'dueToday',
          title: t.visits ? (t.visits.labelDueToday || 'Due today') : 'Due today',
          badgeStyle: 'background:#f0fdfa;border:1px solid #99f6e4;color:#0f766e;',
          items: dueTodayGroup,
        },
        {
          key: 'overdue',
          title: t.visits ? (t.visits.labelOverdue || 'Overdue') : 'Overdue',
          badgeStyle: 'background:#f8fafc;border:1px solid #cbd5e1;color:#475569;',
          items: overdueGroup,
        },
        {
          key: 'upcoming',
          title: t.visits ? (t.visits.labelUpcoming || 'Upcoming') : 'Upcoming',
          badgeStyle: 'background:#f0f9ff;border:1px solid #bae6fd;color:#0369a1;',
          items: upcomingGroup,
        },
      ];

      let sectionsHtml = '';
      prioritySections.forEach((sec) => {
        if (sec.items.length === 0) return;
        const rowsHtml = sec.items.slice(0, 100).map((v) => renderVisitRowHtml(v)).join('');
        sectionsHtml += `
          <div class="priority-group-section" style="margin-bottom:20px;">
            <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 12px;border-radius:6px;margin-bottom:8px;${sec.badgeStyle}">
              <span style="font-weight:700;font-size:0.95rem;">${escapeHtml(sec.title)}</span>
              <span style="font-size:0.8rem;font-weight:700;">${sec.items.length}</span>
            </div>
            <div class="visit-list-table">
              <div class="table-header">
                <span>${t.visits.colMember}</span>
                <span>${t.visits.colDue}</span>
                <span>${t.visits.colStatus}</span>
                <span>${t.visits.colPriority}</span>
                <span>Action</span>
              </div>
              ${rowsHtml}
            </div>
          </div>
        `;
      });

      listCard.innerHTML = sectionsHtml || `<p class="empty-notice" style="padding:20px;text-align:center;color:var(--color-muted);">${t.visits.emptyNotice}</p>`;
    }

    container.appendChild(headerCard);
    container.appendChild(dateNav);
    container.appendChild(summaryCard);
    container.appendChild(filterCard);
    container.appendChild(listCard);

    // Attach Event Listeners
    const printBtn = headerCard.querySelector('#btn-print-schedule');
    if (printBtn) {
      printBtn.addEventListener('click', () => window.print());
    }

    const searchInput = filterCard.querySelector('#visit-search-input');
    let debounceTimer;
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          searchQuery = e.target.value;
          render();
        }, 200);
      });
    }

    const routeToggleBtn = filterCard.querySelector('#btn-toggle-route');
    if (routeToggleBtn) {
      routeToggleBtn.addEventListener('click', () => {
        groupByVillage = !groupByVillage;
        render();
      });
    }

    const ashaSelect = filterCard.querySelector('#visit-asha-select');
    if (ashaSelect) {
      ashaSelect.addEventListener('change', (e) => {
        selectedAsha = e.target.value;
        render();
      });
    }

    const villageSelect = filterCard.querySelector('#visit-village-select');
    if (villageSelect) {
      villageSelect.addEventListener('change', (e) => {
        selectedVillage = e.target.value;
        render();
      });
    }

    const catSelect = filterCard.querySelector('#visit-category-select');
    if (catSelect) {
      catSelect.addEventListener('change', (e) => {
        selectedCategory = e.target.value;
        render();
      });
    }

    // Mark as Visited action buttons
    listCard.querySelectorAll('.btn-mark-visited').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const mid = btn.getAttribute('data-mid');
        const item = btn.getAttribute('data-item');
        const visit = activeVisits.find((v) => v.member_id === mid && v.due_item === item)
          || state.visits.find((v) => v.member_id === mid && v.due_item === item);
        if (visit) {
          toggleVisited(visit);
        }
      });
    });

    // Log Note action buttons
    listCard.querySelectorAll('.btn-log-note').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const mid = btn.getAttribute('data-mid');
        const item = btn.getAttribute('data-item');
        const visit = state.visits.find((v) => v.member_id === mid && v.due_item === item);
        const promptText = t.visits.notePrompt.replace('{name}', (visit && visit.name) || mid);
        const note = prompt(promptText);
        if (note && note.trim()) {
          toggleVisited(visit, note.trim());
          alert(t.visits.notesSaved);
        }
      });
    });

    // Click on visit row to open accessible modal
    listCard.querySelectorAll('.visit-row').forEach((row) => {
      row.addEventListener('click', () => {
        const mid = row.getAttribute('data-mid');
        const item = row.getAttribute('data-item');
        const visit = state.visits.find((v) => v.member_id === mid && v.due_item === item);
        if (visit) {
          openVisitDetailsModal(visit);
        }
      });
      row.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const mid = row.getAttribute('data-mid');
          const item = row.getAttribute('data-item');
          const visit = state.visits.find((v) => v.member_id === mid && v.due_item === item);
          if (visit) {
            openVisitDetailsModal(visit);
          }
        }
      });
    });
  }

  function renderVisitRowHtml(v) {
    const isDone = visitedKeys.has(`${v.member_id}_${v.due_item}`);
    const vilName = getLocalizedText('village', v.village || 'Chandrapuri');
    const statusText = t.status[v.status] || v.status || t.status.due;

    return `
      <div
        class="visit-row prio-${v.priority} ${isDone ? 'is-visited' : ''}"
        data-mid="${escapeHtml(v.member_id)}"
        data-item="${escapeHtml(v.due_item)}"
        tabindex="0"
        role="button"
        title="Click to view full clinical details"
      >
        <div class="visit-col col-main">
          <div style="display:flex;align-items:center;gap:6px;">
            <span class="member-name">${escapeHtml(v.name || v.member_id)}</span>
            ${isDone ? `<span class="badge-visited-pill">${t.visits.badgeVisited || 'Visited'}</span>` : ''}
          </div>
          <span class="member-meta">${escapeHtml(v.member_id)} · ${escapeHtml(vilName)} (${escapeHtml(v.household_id || '-')})</span>
        </div>
        <div class="visit-col col-item">
          <span class="due-item-tag">${escapeHtml(v.due_item)}</span>
        </div>
        <div class="visit-col col-status">
          <span class="status-tag status-${v.status}">${escapeHtml(statusText)}</span>
        </div>
        <div class="visit-col col-pri">
          <span class="pri-badge pri-${v.priority}">P${v.priority}</span>
        </div>
        <div class="visit-col col-action" style="display:flex;gap:4px;">
          <button
            type="button"
            class="btn btn-sm btn-mark-visited ${isDone ? 'btn-visited is-done' : 'btn-visited'}"
            data-mid="${escapeHtml(v.member_id)}"
            data-item="${escapeHtml(v.due_item)}"
            title="${t.visits.btnMarkVisited}"
            style="min-width:55px;"
          >
            ${isDone ? (t.visits.doneLabel || 'Done') : (t.visits.pendingLabel || 'Pending')}
          </button>
          <button
            type="button"
            class="btn btn-sm btn-log-note btn-secondary"
            data-mid="${escapeHtml(v.member_id)}"
            data-item="${escapeHtml(v.due_item)}"
            title="${t.visits.btnLogNote}"
          >
            ${t.visits.btnLogNote || 'Note'}
          </button>
        </div>
      </div>
    `;
  }

  // Accessible Pop-up Modal for Visit Details (Text-only, no emojis)
  function openVisitDetailsModal(visit) {
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay';
    modalOverlay.setAttribute('role', 'dialog');
    modalOverlay.setAttribute('aria-modal', 'true');
    modalOverlay.setAttribute('aria-labelledby', 'modal-visit-title');

    // Find enriched record if available
    const enriched = (state.enrichedRegister || []).find((r) => r.member_id === visit.member_id) || {};
    const custom = (JSON.parse(localStorage.getItem('swasthyavani_custom_beneficiaries') || '[]')).find(
      (r) => r.member_id === visit.member_id
    ) || {};
    const patient = { ...enriched, ...custom, ...visit };

    const notRec = t.profile.notRecorded || 'Not recorded';
    const distName = getLocalizedText('district', patient.district || 'chandrapuri');
    const vilName = getLocalizedText('village', patient.village || 'chandrapuri');
    const pastDisName = patient.past_diseases ? getLocalizedText('condition', patient.past_diseases) : notRec;
    const infName = patient.infection_history ? getLocalizedText('infection', patient.infection_history) : notRec;
    const algName = patient.allergies ? getLocalizedText('allergy', patient.allergies) : notRec;
    const immName = patient.immunisation_history ? getLocalizedText('immunization', patient.immunisation_history) : notRec;
    const vitalsDisplay = patient.last_recorded_vitals || notRec;

    const protocolInfo = getDueItemProtocolInfo(visit.due_item);
    const isDone = visitedKeys.has(`${visit.member_id}_${visit.due_item}`);

    // Build audio summary text in matching language
    const summaryText = [
      `${patient.name || patient.member_id}.`,
      `${t.profile.village}: ${vilName}, ${distName}.`,
      `${t.visits.colDue}: ${visit.due_item}.`,
      `${protocolInfo.title}: ${protocolInfo.description}.`,
      `${t.profile.currentVitals}: ${vitalsDisplay}.`,
      `${t.profile.medicationSection}: ${patient.allowed_medication_dosage || t.card.refusalAction}.`,
    ].join(' ');

    const modalContent = document.createElement('div');
    modalContent.className = 'modal-dialog';
    modalContent.innerHTML = `
      <div class="modal-header">
        <div>
          <h2 id="modal-visit-title" class="modal-title">${escapeHtml(patient.name || patient.member_id)}</h2>
          <span class="patient-id-badge">${escapeHtml(patient.member_id)} | ${escapeHtml(patient.household_id || '-')}</span>
        </div>
        <button type="button" class="modal-close-btn" aria-label="${t.profile.close}">×</button>
      </div>

      <div class="modal-body">
        <!-- Voice Audio Bar -->
        <div class="tts-player-bar">
          <button type="button" id="btn-modal-speak" class="btn btn-primary btn-tts">
            ${t.profile.btnListen}
          </button>
          <button type="button" id="btn-modal-pause" class="btn btn-secondary" style="display:none;">
            ${t.profile.btnPause}
          </button>
          <button type="button" id="btn-modal-stop" class="btn btn-secondary" style="display:none;">
            ${t.profile.btnStop}
          </button>
        </div>

        <!-- Today's Due Visit Protocol Focus -->
        <section class="modal-section" style="background:#f0fdfa;border:1px solid #99f6e4;padding:12px;border-radius:8px;">
          <h3 class="section-subtitle" style="color:#0f766e;margin-bottom:6px;">
            ${t.visits.colDue}: ${escapeHtml(visit.due_item)}
          </h3>
          <p style="font-weight:700;font-size:0.95rem;margin-bottom:4px;">${escapeHtml(protocolInfo.title)}</p>
          <p style="font-size:0.9rem;margin-bottom:8px;">${escapeHtml(protocolInfo.description)}</p>
          <div style="display:flex;gap:12px;font-size:0.8rem;color:#0f766e;">
            <span><strong>${t.profile.citationLabel}:</strong> ${escapeHtml(protocolInfo.citation)} (${escapeHtml(protocolInfo.protocol)})</span>
            <span><strong>${t.visits.colPriority}:</strong> P${visit.priority}</span>
            <span><strong>${t.visits.colStatus}:</strong> ${t.status[visit.status] || visit.status}</span>
          </div>
        </section>

        <!-- Demographics -->
        <section class="modal-section">
          <h3 class="section-subtitle">${t.profile.demographics}</h3>
          <div class="details-grid">
            <div><span class="lbl">${t.profile.gender}:</span> <strong>${patient.sex === 'F' ? t.profile.female : t.profile.male}</strong></div>
            <div><span class="lbl">${t.profile.houseNo}:</span> <strong>${escapeHtml(patient.house_no || '-')}</strong></div>
            <div><span class="lbl">${t.profile.village}:</span> <strong>${escapeHtml(vilName)}</strong></div>
            <div><span class="lbl">${t.profile.district}:</span> <strong>${escapeHtml(distName)}</strong></div>
            <div><span class="lbl">${t.profile.assignedAsha}:</span> <strong>${escapeHtml(patient.asha_name ? patient.asha_name + ' (' + (patient.asha_id || 'ASHA-01') + ')' : (patient.asha_id || '-'))}</strong></div>
            <div><span class="lbl">${t.profile.assignedAnm}:</span> <strong>${escapeHtml(patient.anm_name || (patient.district === 'chandrapuri' ? 'ANM Nirmala (Chandrapuri Sub-Centre)' : '-'))}</strong></div>
            <div><span class="lbl">${t.profile.nextDueDate}:</span> <strong>${escapeHtml(patient.next_due_date || selectedDate)}</strong></div>
          </div>
        </section>

        <!-- Recorded Vitals -->
        <section class="modal-section">
          <h3 class="section-subtitle">${t.profile.currentVitals}</h3>
          <div class="vitals-highlight-box">
            <strong>${escapeHtml(vitalsDisplay)}</strong>
          </div>
        </section>

        <!-- Medical History & Allergies -->
        <section class="modal-section">
          <h3 class="section-subtitle">${t.profile.pastHistory}</h3>
          <div class="history-grid">
            <div class="history-item">
              <span class="lbl">${t.profile.pastDiseases}:</span>
              <strong>${escapeHtml(pastDisName)}</strong>
            </div>
            <div class="history-item">
              <span class="lbl">${t.profile.infectionHistory}:</span>
              <strong>${escapeHtml(infName)}</strong>
            </div>
            <div class="history-item">
              <span class="lbl">${t.profile.allergies}:</span>
              <strong style="color:var(--color-danger);">${escapeHtml(algName)}</strong>
            </div>
            <div class="history-item">
              <span class="lbl">${t.profile.immunisationHistory}:</span>
              <strong>${escapeHtml(immName)}</strong>
            </div>
          </div>
        </section>

        <!-- Actions Bar -->
        <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:12px;padding-top:12px;border-top:1px solid var(--color-border);">
          <button type="button" id="btn-modal-mark-visited" class="btn ${isDone ? 'btn-secondary' : 'btn-primary'}">
            ${isDone ? (t.visits.badgeVisited || 'Visited') : t.visits.btnMarkVisited}
          </button>
          <button type="button" id="btn-modal-log-note" class="btn btn-secondary">
            ${t.visits.btnLogNote || 'Note'}
          </button>
          <button type="button" id="btn-modal-close-footer" class="btn btn-secondary">
            ${t.profile.close}
          </button>
        </div>
      </div>
    `;

    modalOverlay.appendChild(modalContent);
    document.body.appendChild(modalOverlay);

    // Audio controls
    const speakBtn = modalContent.querySelector('#btn-modal-speak');
    const pauseBtn = modalContent.querySelector('#btn-modal-pause');
    const stopBtn = modalContent.querySelector('#btn-modal-stop');

    function updateTtsButtons(status) {
      if (status === 'speaking') {
        speakBtn.style.display = 'none';
        pauseBtn.style.display = 'inline-block';
        stopBtn.style.display = 'inline-block';
      } else if (status === 'paused') {
        speakBtn.style.display = 'inline-block';
        speakBtn.textContent = t.card.btnResume || 'Resume';
        pauseBtn.style.display = 'none';
      } else {
        speakBtn.style.display = 'inline-block';
        speakBtn.textContent = t.profile.btnListen;
        pauseBtn.style.display = 'none';
        stopBtn.style.display = 'none';
      }
    }

    speakBtn.addEventListener('click', () => {
      speechManager.speak(summaryText, state.lang, updateTtsButtons);
    });

    pauseBtn.addEventListener('click', () => {
      speechManager.pause();
      updateTtsButtons('paused');
    });

    stopBtn.addEventListener('click', () => {
      speechManager.stop();
      updateTtsButtons('stopped');
    });

    // Mark visited inside modal
    const markVisitedBtn = modalContent.querySelector('#btn-modal-mark-visited');
    markVisitedBtn.addEventListener('click', () => {
      toggleVisited(visit);
      closeModal();
    });

    // Log note inside modal
    const logNoteBtn = modalContent.querySelector('#btn-modal-log-note');
    logNoteBtn.addEventListener('click', () => {
      const promptText = t.visits.notePrompt.replace('{name}', patient.name || visit.member_id);
      const note = prompt(promptText);
      if (note && note.trim()) {
        toggleVisited(visit, note.trim());
        alert(t.visits.notesSaved);
        closeModal();
      }
    });

    function closeModal() {
      speechManager.stop();
      if (modalOverlay.parentElement) {
        modalOverlay.parentElement.removeChild(modalOverlay);
      }
      document.removeEventListener('keydown', handleKeyDown);
    }

    const focusable = modalContent.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    const firstFocusable = focusable[0];
    const lastFocusable = focusable[focusable.length - 1];

    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        closeModal();
      } else if (e.key === 'Tab' && focusable.length > 0) {
        if (e.shiftKey) {
          if (document.activeElement === firstFocusable) {
            e.preventDefault();
            lastFocusable.focus();
          }
        } else {
          if (document.activeElement === lastFocusable) {
            e.preventDefault();
            firstFocusable.focus();
          }
        }
      }
    }

    modalContent.querySelector('.modal-close-btn').addEventListener('click', closeModal);
    modalContent.querySelector('#btn-modal-close-footer').addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeModal();
    });
    document.addEventListener('keydown', handleKeyDown);

    if (firstFocusable) firstFocusable.focus();
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
    .replace(/'/g, '&#39;');
}
