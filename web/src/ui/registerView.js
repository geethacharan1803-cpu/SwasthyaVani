/**
 * Beneficiaries UI Component (Merged Register & Registration)
 * Clean, text-only interface for managing Chandrapuri Block beneficiaries.
 * Features:
 * - Multi-criteria filter bar (District, Village, Clinical Category)
 * - Debounced search input
 * - Paged beneficiary list with accessible details modal & trilingual TTS
 * - "Add new beneficiary" modal form that saves locally and updates the list immediately
 */

import { filterBeneficiaries, getFilterOptions } from '../core/filters.js';
import { speechManager } from '../tts/speaker.js';
import { renderRegistrationView } from './registrationView.js';

export function renderRegisterView(state, onOpenRegistration) {
  const t = state.translations;
  const container = document.createElement('div');
  container.className = 'view-container register-view beneficiaries-view';

  // Component local state
  const filterState = {
    districts: [],
    villages: [],
    category: '',
    searchQuery: '',
    page: 1,
    pageSize: 15,
  };

  let successBannerMsg = '';

  // Combine static enriched register with locally registered custom beneficiaries
  const customRecords = JSON.parse(localStorage.getItem('swasthyavani_custom_beneficiaries') || '[]');
  const records = [...customRecords, ...(state.enrichedRegister || [])];

  function getLocalizedText(prefix, key) {
    if (!key) return '';
    const normKey = String(key).toLowerCase().replace(/[\s-]+/g, '_');
    if (t[prefix] && t[prefix][normKey]) {
      return t[prefix][normKey];
    }
    return key;
  }

  function getCategoryBadge(cat, isHighRisk) {
    const label = getLocalizedText('categories', isHighRisk ? 'high_risk' : cat);
    const colorClass = isHighRisk ? 'badge-danger' : `badge-${cat || 'general'}`;
    return `<span class="cat-chip ${colorClass}">${escapeHtml(label)}</span>`;
  }

  function openAddBeneficiaryModal() {
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay';
    modalOverlay.setAttribute('role', 'dialog');
    modalOverlay.setAttribute('aria-modal', 'true');
    modalOverlay.setAttribute('aria-labelledby', 'modal-reg-title');

    const modalDialog = document.createElement('div');
    modalDialog.className = 'modal-dialog';
    modalDialog.style.maxWidth = '680px';

    const modalHeader = document.createElement('div');
    modalHeader.className = 'modal-header';
    modalHeader.innerHTML = `
      <div>
        <h2 id="modal-reg-title" class="modal-title">${t.registration ? t.registration.title : 'Add new beneficiary'}</h2>
        <span class="patient-id-badge">${t.registration ? t.registration.subtitle : 'Register beneficiary locally'}</span>
      </div>
      <button type="button" class="modal-close-btn" aria-label="${t.profile ? t.profile.close : 'Close'}">×</button>
    `;

    const regView = renderRegistrationView(state, (newRecord) => {
      records.unshift(newRecord);
      filterState.page = 1;
      successBannerMsg = `${t.registration ? t.registration.successMsg : 'Beneficiary registered successfully.'} ID: ${newRecord.member_id}`;
      modalOverlay.remove();
      render();
    });

    modalDialog.appendChild(modalHeader);
    modalDialog.appendChild(regView);
    modalOverlay.appendChild(modalDialog);
    document.body.appendChild(modalOverlay);

    modalHeader.querySelector('.modal-close-btn').addEventListener('click', () => modalOverlay.remove());
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) modalOverlay.remove();
    });
  }

  function render() {
    container.innerHTML = '';

    // Calculate options and filtered records
    const options = getFilterOptions(records, filterState.districts);
    const filtered = filterBeneficiaries(records, filterState);
    const totalCount = filtered.length;
    const totalPages = Math.ceil(totalCount / filterState.pageSize) || 1;
    if (filterState.page > totalPages) filterState.page = 1;

    const startIndex = (filterState.page - 1) * filterState.pageSize;
    const pagedRecords = filtered.slice(startIndex, startIndex + filterState.pageSize);

    // 1. Header & Filter Card
    const filterCard = document.createElement('div');
    filterCard.className = 'card filter-card';
    filterCard.innerHTML = `
      <div class="filter-header-row" style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:12px;margin-bottom:12px;">
        <div>
          <h2 class="section-title" style="margin-bottom:4px;">${t.beneficiaries ? t.beneficiaries.title : 'Beneficiaries'}</h2>
          <p class="section-sub" style="margin-bottom:6px;">${t.beneficiaries ? t.beneficiaries.subtitle : 'View and add beneficiaries'}</p>
          <span class="results-badge">${t.filters.resultsCount.replace('{count}', totalCount)}</span>
        </div>
        <button type="button" class="btn btn-primary" id="btn-open-register">
          ${t.registration ? t.registration.title : 'Add new beneficiary'}
        </button>
      </div>

      ${
        successBannerMsg
          ? `<div class="alert alert-success" style="background:#ecfdf5;border:1px solid #a7f3d0;color:#065f46;padding:10px 14px;border-radius:8px;font-size:0.88rem;margin-bottom:12px;font-weight:600;">
              ${escapeHtml(successBannerMsg)}
            </div>`
          : ''
      }

      <div class="filter-controls-grid">
        <div class="filter-group">
          <label class="filter-label" for="filter-district">${t.filters.districtLabel}</label>
          <select id="filter-district" class="form-select">
            <option value="all">${t.filters.allDistricts}</option>
            ${options.districts
              .map(
                (d) =>
                  `<option value="${d}" ${filterState.districts.includes(d) ? 'selected' : ''}>
                    ${escapeHtml(getLocalizedText('district', d))}
                  </option>`
              )
              .join('')}
          </select>
        </div>

        <div class="filter-group">
          <label class="filter-label" for="filter-village">${t.filters.villageLabel}</label>
          <select id="filter-village" class="form-select">
            <option value="all">${t.filters.allVillages}</option>
            ${options.villages
              .map(
                (v) =>
                  `<option value="${v}" ${filterState.villages.includes(v) ? 'selected' : ''}>
                    ${escapeHtml(getLocalizedText('village', v))}
                  </option>`
              )
              .join('')}
          </select>
        </div>

        <div class="filter-group">
          <label class="filter-label" for="filter-category">${t.filters.categoryLabel}</label>
          <select id="filter-category" class="form-select">
            <option value="all">${t.filters.allCategories}</option>
            <option value="high_risk" title="${t.categories.high_riskTooltip}" ${filterState.category === 'high_risk' ? 'selected' : ''}>${t.categories.high_risk}</option>
            <option value="anc" title="${t.categories.ancTooltip}" ${filterState.category === 'anc' ? 'selected' : ''}>${t.categories.anc}</option>
            <option value="hbnc" title="${t.categories.hbncTooltip}" ${filterState.category === 'hbnc' ? 'selected' : ''}>${t.categories.hbnc}</option>
            <option value="imm" title="${t.categories.immTooltip}" ${filterState.category === 'imm' ? 'selected' : ''}>${t.categories.imm}</option>
            <option value="nut" title="${t.categories.nutTooltip}" ${filterState.category === 'nut' ? 'selected' : ''}>${t.categories.nut}</option>
            <option value="ncd" title="${t.categories.ncdTooltip}" ${filterState.category === 'ncd' ? 'selected' : ''}>${t.categories.ncd}</option>
          </select>
        </div>
      </div>

      <div class="search-row">
        <div class="search-input-wrapper">
          <input
            type="text"
            id="filter-search"
            class="form-input"
            placeholder="${t.filters.searchPlaceholder}"
            value="${escapeHtml(filterState.searchQuery)}"
          />
        </div>
        <button type="button" id="btn-clear-filters" class="btn btn-secondary">
          ${t.filters.clearFilters}
        </button>
      </div>
    `;

    // 2. Beneficiary Cards List
    const listContainer = document.createElement('div');
    listContainer.className = 'beneficiary-list';

    if (pagedRecords.length === 0) {
      listContainer.innerHTML = `
        <div class="empty-state-card card">
          <p>${t.filters.emptyResults}</p>
        </div>
      `;
    } else {
      pagedRecords.forEach((rec) => {
        const itemCard = document.createElement('div');
        itemCard.className = `beneficiary-card ${rec.is_high_risk ? 'is-high-risk' : ''}`;
        itemCard.setAttribute('tabindex', '0');
        itemCard.setAttribute('role', 'button');

        const distName = getLocalizedText('district', rec.district);
        const vilName = getLocalizedText('village', rec.village);
        const badgeHtml = getCategoryBadge(rec.clinical_category, rec.is_high_risk);

        itemCard.innerHTML = `
          <div class="card-top-row">
            <div class="patient-primary-info">
              <h3 class="patient-name">${escapeHtml(rec.name || rec.member_id)}</h3>
              <span class="patient-id-chip">${escapeHtml(rec.member_id)} (${escapeHtml(rec.household_id)})</span>
            </div>
            ${badgeHtml}
          </div>
          <div class="patient-meta-grid">
            <div class="meta-item">
              <span class="meta-label">${t.profile.village}:</span>
              <strong>${escapeHtml(vilName)}, ${escapeHtml(distName)}</strong>
            </div>
            <div class="meta-item">
              <span class="meta-label">${t.profile.assignedAsha}:</span>
              <strong>${escapeHtml(rec.asha_name ? rec.asha_name + ' (' + (rec.asha_id || 'ASHA-01') + ')' : (rec.asha_id || 'ASHA-01'))}</strong>
            </div>
            <div class="meta-item">
              <span class="meta-label">${t.profile.vitals}:</span>
              <span class="vitals-snippet">${escapeHtml(rec.last_recorded_vitals || 'Stable')}</span>
            </div>
          </div>
          <div class="card-action-bar">
            <span class="view-details-hint">${t.profile.modalTitle}</span>
          </div>
        `;

        itemCard.addEventListener('click', () => openProfileModal(rec));
        itemCard.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openProfileModal(rec);
          }
        });

        listContainer.appendChild(itemCard);
      });
    }

    // 3. Pagination Controls
    const paginationRow = document.createElement('div');
    paginationRow.className = 'pagination-row';
    paginationRow.innerHTML = `
      <button type="button" class="btn btn-sm btn-secondary" id="btn-prev-page" ${filterState.page <= 1 ? 'disabled' : ''}>
        ${t.pagination.prev}
      </button>
      <span class="page-indicator">${t.pagination.pageIndicator.replace('{current}', filterState.page).replace('{total}', totalPages)}</span>
      <button type="button" class="btn btn-sm btn-secondary" id="btn-next-page" ${filterState.page >= totalPages ? 'disabled' : ''}>
        ${t.pagination.next}
      </button>
    `;

    container.appendChild(filterCard);
    container.appendChild(listContainer);
    if (totalPages > 1) {
      container.appendChild(paginationRow);
    }

    // Attach Filter Event Listeners
    const districtSelect = filterCard.querySelector('#filter-district');
    const villageSelect = filterCard.querySelector('#filter-village');
    const categorySelect = filterCard.querySelector('#filter-category');
    const searchInput = filterCard.querySelector('#filter-search');
    const clearBtn = filterCard.querySelector('#btn-clear-filters');
    const registerBtn = filterCard.querySelector('#btn-open-register');

    if (registerBtn) {
      registerBtn.addEventListener('click', () => {
        if (onOpenRegistration) {
          onOpenRegistration();
        } else {
          openAddBeneficiaryModal();
        }
      });
    }

    districtSelect.addEventListener('change', (e) => {
      const val = e.target.value;
      filterState.districts = (!val || val === 'all') ? [] : [val];
      filterState.villages = []; // reset village when district changes
      filterState.page = 1;
      render();
    });

    villageSelect.addEventListener('change', (e) => {
      const val = e.target.value;
      filterState.villages = (!val || val === 'all') ? [] : [val];
      filterState.page = 1;
      render();
    });

    categorySelect.addEventListener('change', (e) => {
      const val = e.target.value;
      filterState.category = (!val || val === 'all') ? '' : val;
      filterState.page = 1;
      render();
    });

    let debounceTimer;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        filterState.searchQuery = e.target.value;
        filterState.page = 1;
        render();
      }, 200);
    });

    clearBtn.addEventListener('click', () => {
      filterState.districts = [];
      filterState.villages = [];
      filterState.category = '';
      filterState.searchQuery = '';
      filterState.page = 1;
      render();
    });

    const prevBtn = paginationRow.querySelector('#btn-prev-page');
    const nextBtn = paginationRow.querySelector('#btn-next-page');
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        if (filterState.page > 1) {
          filterState.page--;
          render();
          container.scrollIntoView({ behavior: 'smooth' });
        }
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        if (filterState.page < totalPages) {
          filterState.page++;
          render();
          container.scrollIntoView({ behavior: 'smooth' });
        }
      });
    }
  }

  // Accessible Modal for Beneficiary Details
  function openProfileModal(rec) {
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay';
    modalOverlay.setAttribute('role', 'dialog');
    modalOverlay.setAttribute('aria-modal', 'true');
    modalOverlay.setAttribute('aria-labelledby', 'modal-patient-title');

    const notRec = t.profile.notRecorded || 'Not recorded';
    const distName = getLocalizedText('district', rec.district);
    const vilName = getLocalizedText('village', rec.village);
    const pastDisName = rec.past_diseases ? getLocalizedText('condition', rec.past_diseases) : notRec;
    const infName = rec.infection_history ? getLocalizedText('infection', rec.infection_history) : notRec;
    const fevName = rec.fever_cold_history ? getLocalizedText('fever', rec.fever_cold_history) : notRec;
    const algName = rec.allergies ? getLocalizedText('allergy', rec.allergies) : notRec;
    const immName = rec.immunisation_history ? getLocalizedText('immunization', rec.immunisation_history) : notRec;
    const vitalsDisplay = rec.last_recorded_vitals || notRec;

    // Build audio summary text in matching localized language
    const summaryParts = [
      `${rec.name || rec.member_id}.`,
      `${t.profile.village}: ${vilName}, ${distName}.`,
      rec.is_high_risk ? `${t.card.escalateTitle}.` : '',
      `${t.profile.currentVitals}: ${vitalsDisplay}.`,
      rec.past_diseases ? `${t.profile.pastDiseases}: ${pastDisName}.` : '',
      `${t.profile.medicationSection}: ${rec.allowed_medication_dosage || t.card.refusalAction}.`,
    ].filter(Boolean);

    const speechText = summaryParts.join(' ');

    const modalContent = document.createElement('div');
    modalContent.className = 'modal-dialog';
    modalContent.innerHTML = `
      <div class="modal-header">
        <div>
          <h2 id="modal-patient-title" class="modal-title">${escapeHtml(rec.name || rec.member_id)}</h2>
          <span class="patient-id-badge">${escapeHtml(rec.member_id)} | ${escapeHtml(rec.household_id)}</span>
        </div>
        <button type="button" class="modal-close-btn" aria-label="${t.profile.close}">×</button>
      </div>

      <div class="modal-body">
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

        <section class="modal-section">
          <h3 class="section-subtitle">${t.profile.demographics}</h3>
          <div class="details-grid">
            <div><span class="lbl">${t.profile.gender}:</span> <strong>${rec.sex === 'F' ? t.profile.female : t.profile.male}</strong></div>
            <div><span class="lbl">${t.profile.houseNo}:</span> <strong>${escapeHtml(rec.house_no || '-')}</strong></div>
            <div><span class="lbl">${t.profile.village}:</span> <strong>${escapeHtml(vilName)}</strong></div>
            <div><span class="lbl">${t.profile.district}:</span> <strong>${escapeHtml(distName)}</strong></div>
            <div><span class="lbl">${t.profile.assignedAsha}:</span> <strong>${escapeHtml(rec.asha_name ? rec.asha_name + ' (' + (rec.asha_id || 'ASHA-01') + ')' : (rec.asha_id || '-'))}</strong></div>
            <div><span class="lbl">${t.profile.assignedAnm}:</span> <strong>${escapeHtml(rec.anm_name || (rec.district === 'chandrapuri' ? 'ANM Nirmala (Chandrapuri Sub-Centre)' : '-'))}</strong></div>
          </div>
        </section>

        <section class="modal-section">
          <h3 class="section-subtitle">${t.profile.currentVitals}</h3>
          <div class="vitals-highlight-box">
            <strong>${escapeHtml(vitalsDisplay)}</strong>
          </div>
        </section>

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
              <span class="lbl">${t.profile.feverColdHistory}:</span>
              <strong>${escapeHtml(fevName)}</strong>
            </div>
            <div class="history-item">
              <span class="lbl">${t.profile.allergies}:</span>
              <strong>${escapeHtml(algName)}</strong>
            </div>
            <div class="history-item">
              <span class="lbl">${t.profile.immunisationHistory}:</span>
              <strong>${escapeHtml(immName)}</strong>
            </div>
            <div class="history-item">
              <span class="lbl">${t.profile.whyOnList}:</span>
              <strong>${escapeHtml(rec.due_reason || 'Routine Follow-up')}</strong>
            </div>
          </div>
        </section>

        <section class="modal-section medication-section">
          <h3 class="section-subtitle">${t.profile.medicationSection}</h3>
          <div class="guideline-card">
            <p class="guideline-text">${escapeHtml(rec.allowed_medication_dosage || t.card.refusalAction)}</p>
            <div class="citation-chip">
              <span class="citation-label">${t.profile.citationLabel}:</span>
              <strong>${escapeHtml(rec.medication_citation || 'SEC-01-ANC-03')}</strong>
            </div>
          </div>
        </section>

        <section class="modal-section">
          <h3 class="section-subtitle">${t.profile.pastNotes}</h3>
          <p class="visit-notes-text">${escapeHtml(rec.asha_visit_notes || 'Regular health monitoring visit completed.')}</p>
        </section>

        <p class="synthetic-notice">${t.profile.syntheticDisclaimer}</p>
      </div>
    `;

    modalOverlay.appendChild(modalContent);
    document.body.appendChild(modalOverlay);

    // Audio TTS Controls (Text-only, no emojis)
    const speakBtn = modalContent.querySelector('#btn-modal-speak');
    const pauseBtn = modalContent.querySelector('#btn-modal-pause');
    const stopBtn = modalContent.querySelector('#btn-modal-stop');

    function updateSpeechUI(status) {
      if (status === 'speaking') {
        speakBtn.textContent = t.card.playing || 'Playing...';
        pauseBtn.style.display = 'inline-block';
        stopBtn.style.display = 'inline-block';
      } else if (status === 'paused') {
        speakBtn.textContent = t.card.btnResume || 'Resume';
        pauseBtn.style.display = 'none';
        stopBtn.style.display = 'inline-block';
      } else {
        speakBtn.textContent = t.profile.btnListen;
        pauseBtn.style.display = 'none';
        stopBtn.style.display = 'none';
      }
    }

    speakBtn.addEventListener('click', () => {
      if (speechManager.isPaused()) {
        speechManager.resume();
      } else {
        const result = speechManager.speak(speechText, state.lang, (st) => updateSpeechUI(st));
        if (!result.success && result.reason === 'voice_unavailable') {
          alert(t.card.voiceUnavailable);
        }
      }
    });

    pauseBtn.addEventListener('click', () => speechManager.pause());
    stopBtn.addEventListener('click', () => speechManager.stop());

    // Modal Close handlers
    function closeModal() {
      speechManager.stop();
      modalOverlay.remove();
      document.removeEventListener('keydown', handleKeydown);
    }

    const closeBtn = modalContent.querySelector('.modal-close-btn');
    closeBtn.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeModal();
    });

    const focusable = modalContent.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    const firstFocusable = focusable[0];
    const lastFocusable = focusable[focusable.length - 1];

    function handleKeydown(e) {
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
    document.addEventListener('keydown', handleKeydown);

    if (closeBtn) closeBtn.focus();
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
