/**
 * Beneficiary Registration UI Component
 * Form to register a new family member locally for offline visit scheduling and tracking.
 * Demonstrates sub-centre population topology (Chandrapuri Block, 6 villages, 5 ASHAs, ANM Nirmala).
 * Saves in localStorage and enqueues into offline syncQueue.
 */

import topologyRef from '../data/topology_reference.json';
import { syncQueue } from '../sync/syncQueue.js';

export function renderRegistrationView(state, onComplete) {
  const t = state.translations;
  const container = document.createElement('div');
  container.className = 'view-container registration-view';

  const districts = ['chandrapuri', 'kakinada', 'east_godavari', 'visakhapatnam', 'guntur', 'chittoor', 'kurnool'];

  const districtVillages = {
    chandrapuri: topologyRef.villages,
    kakinada: ['Sarpavaram', 'Peddapuram Rural', 'Thimmapuram'],
    east_godavari: ['Rajahmundry Rural', 'Kadiyam', 'Dowleswaram'],
    visakhapatnam: ['Bheemunipatnam', 'Anandapuram', 'Padmanabham'],
    guntur: ['Mangalagiri Rural', 'Tadikonda', 'Tenali West'],
    chittoor: ['Chandragiri', 'Palamaner', 'Kuppam Rural'],
    kurnool: ['Nandyal Rural', 'Alur', 'Dhone'],
  };

  const districtAshas = {
    chandrapuri: topologyRef.ashas.map((a) => `${a.asha_id} (${a.asha_name})`),
    kakinada: ['ASHA-KKD01 (Sita Devi)', 'ASHA-KKD02 (Padma V)'],
    east_godavari: ['ASHA-EGD01 (Lakshmi K)', 'ASHA-EGD02 (Parvati R)'],
    visakhapatnam: ['ASHA-VSP01 (Anuradha B)', 'ASHA-VSP02 (Sandhya M)'],
    guntur: ['ASHA-GNT01 (Sujatha T)', 'ASHA-GNT02 (Radha P)'],
    chittoor: ['ASHA-CTR01 (Kavitha M)', 'ASHA-CTR02 (Lavanya S)'],
    kurnool: ['ASHA-KNL01 (Bharathi N)', 'ASHA-KNL02 (Renuka D)'],
  };

  let selectedDistrict = 'chandrapuri';

  function getVillageLabel(vil) {
    const key = vil.toLowerCase().replace(/ /g, '_');
    return (t.village && t.village[key]) || vil;
  }

  function getDistrictLabel(d) {
    return (t.district && t.district[d]) || d;
  }

  function renderForm() {
    const vils = districtVillages[selectedDistrict] || [];
    const ashas = districtAshas[selectedDistrict] || [];

    container.innerHTML = `
      <div class="card registration-card">
        <div class="reg-header-row">
          <div>
            <h2 class="section-title">${t.registration.title}</h2>
            <p class="section-sub">${t.registration.subtitle}</p>
          </div>
          <span class="simulated-badge">${t.registration.badgeSimulated}</span>
        </div>

        <div id="reg-alert" class="reg-alert" style="display:none;"></div>

        <form id="reg-form" class="reg-form">
          <div class="form-grid">
            <div class="form-group">
              <label for="reg-name" class="form-label">${t.registration.nameLabel} *</label>
              <input type="text" id="reg-name" class="form-input" placeholder="${t.registration.namePlaceholder}" required minlength="2" maxlength="60" />
            </div>

            <div class="form-group">
              <label for="reg-age" class="form-label">${t.registration.ageLabel} *</label>
              <input type="number" id="reg-age" class="form-input" placeholder="${t.registration.agePlaceholder}" required min="0" max="115" />
            </div>

            <div class="form-group">
              <label for="reg-gender" class="form-label">${t.registration.genderLabel} *</label>
              <select id="reg-gender" class="form-select">
                <option value="F">${t.registration.female}</option>
                <option value="M">${t.registration.male}</option>
              </select>
            </div>

            <div class="form-group">
              <label for="reg-district" class="form-label">${t.registration.districtLabel} *</label>
              <select id="reg-district" class="form-select">
                ${districts.map((d) => `<option value="${d}" ${d === selectedDistrict ? 'selected' : ''}>${getDistrictLabel(d)}</option>`).join('')}
              </select>
            </div>

            <div class="form-group">
              <label for="reg-village" class="form-label">${t.registration.villageLabel} *</label>
              <select id="reg-village" class="form-select">
                ${vils.map((v) => `<option value="${v}">${getVillageLabel(v)}</option>`).join('')}
              </select>
            </div>

            <div class="form-group">
              <label for="reg-asha" class="form-label">${t.registration.ashaLabel} *</label>
              <select id="reg-asha" class="form-select">
                ${ashas.map((a) => `<option value="${a}">${a}</option>`).join('')}
              </select>
            </div>

            <div class="form-group">
              <label for="reg-category" class="form-label">${t.registration.categoryLabel} *</label>
              <select id="reg-category" class="form-select">
                <option value="anc">${t.categories.anc}</option>
                <option value="hbnc">${t.categories.hbnc}</option>
                <option value="imm">${t.categories.imm}</option>
                <option value="nut">${t.categories.nut}</option>
                <option value="ncd">${t.categories.ncd}</option>
                <option value="high_risk">${t.categories.high_risk}</option>
                <option value="general">${t.categories.general}</option>
              </select>
            </div>

            <div class="form-group" id="group-lmp">
              <label for="reg-lmp" class="form-label">${t.registration.lmpLabel}</label>
              <input type="date" id="reg-lmp" class="form-input" />
            </div>

            <div class="form-group" id="group-dob">
              <label for="reg-dob" class="form-label">${t.registration.dobLabel}</label>
              <input type="date" id="reg-dob" class="form-input" />
            </div>
          </div>

          <div class="form-group" style="margin-top:12px;">
            <label for="reg-notes" class="form-label">${t.registration.notesLabel}</label>
            <textarea id="reg-notes" class="form-input" rows="3" placeholder="${t.registration.notesPlaceholder}"></textarea>
          </div>

          <div class="form-actions" style="margin-top:16px; display:flex; gap:10px;">
            <button type="submit" class="btn btn-primary" id="btn-save-beneficiary">
              ${t.registration.btnSubmit}
            </button>
          </div>
        </form>
      </div>
    `;

    const districtSelect = container.querySelector('#reg-district');
    const villageSelect = container.querySelector('#reg-village');
    const ashaSelect = container.querySelector('#reg-asha');
    const categorySelect = container.querySelector('#reg-category');
    const form = container.querySelector('#reg-form');
    const alertBox = container.querySelector('#reg-alert');

    function updateAshaForVillage(vil) {
      if (selectedDistrict === 'chandrapuri' && topologyRef.village_to_asha[vil]) {
        const assigned = topologyRef.village_to_asha[vil];
        Array.from(ashaSelect.options).forEach((opt) => {
          if (opt.value.includes(assigned.asha_id)) {
            opt.selected = true;
          }
        });
      }
    }

    // Set initial ASHA assignment for default village
    if (vils.length > 0) {
      updateAshaForVillage(vils[0]);
    }

    districtSelect.addEventListener('change', (e) => {
      selectedDistrict = e.target.value;
      const curVils = districtVillages[selectedDistrict] || [];
      villageSelect.innerHTML = curVils.map((v) => `<option value="${v}">${getVillageLabel(v)}</option>`).join('');

      const curAshas = districtAshas[selectedDistrict] || [];
      ashaSelect.innerHTML = curAshas.map((a) => `<option value="${a}">${a}</option>`).join('');

      if (curVils.length > 0) {
        updateAshaForVillage(curVils[0]);
      }
    });

    villageSelect.addEventListener('change', (e) => {
      updateAshaForVillage(e.target.value);
    });

    categorySelect.addEventListener('change', (e) => {
      const cat = e.target.value;
      const lmpGroup = container.querySelector('#group-lmp');
      const dobGroup = container.querySelector('#group-dob');
      if (cat === 'anc') {
        lmpGroup.style.display = 'block';
        dobGroup.style.display = 'none';
      } else if (cat === 'hbnc' || cat === 'imm' || cat === 'nut') {
        lmpGroup.style.display = 'none';
        dobGroup.style.display = 'block';
      } else {
        lmpGroup.style.display = 'none';
        dobGroup.style.display = 'none';
      }
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = container.querySelector('#reg-name').value.trim();
      const age = parseInt(container.querySelector('#reg-age').value, 10);
      const sex = container.querySelector('#reg-gender').value;
      const district = container.querySelector('#reg-district').value;
      const village = container.querySelector('#reg-village').value;
      const ashaFull = container.querySelector('#reg-asha').value;
      const category = container.querySelector('#reg-category').value;
      const lmp = container.querySelector('#reg-lmp').value || null;
      const dob = container.querySelector('#reg-dob').value || null;
      const notes = container.querySelector('#reg-notes').value.trim();

      if (!name || isNaN(age) || age < 0 || age > 115) {
        alertBox.className = 'reg-alert alert-error';
        alertBox.textContent = t.registration.errorMsg;
        alertBox.style.display = 'block';
        return;
      }

      // Generate non-colliding ID
      const uniqueSuffix = Date.now().toString(36).toUpperCase() + Math.floor(100 + Math.random() * 900);
      const newMid = `M-REG-${uniqueSuffix}`;
      const newHid = `HH-REG-${uniqueSuffix}`;

      const ashaId = ashaFull.split(' ')[0] || (district === 'chandrapuri' ? 'ASHA-096P' : 'ASHA-01');
      const ashaNameMatch = ashaFull.match(/\((.*?)\)/);
      const ashaName = ashaNameMatch ? ashaNameMatch[1] : ashaFull;

      const newRecord = {
        member_id: newMid,
        household_id: newHid,
        name: name,
        age_years: age,
        sex: sex,
        district: district,
        village: village,
        asha_id: ashaId,
        asha_name: ashaName,
        anm_name: district === 'chandrapuri' ? 'ANM Nirmala (Chandrapuri Sub-Centre)' : `ANM ${district.toUpperCase()} PHC`,
        house_no: `HN-REG-${uniqueSuffix}`,
        clinical_category: category,
        is_high_risk: category === 'high_risk',
        pregnant: category === 'anc' ? 'Y' : 'N',
        lmp_date: lmp,
        dob: dob || `${2026 - age}-01-01`,
        last_recorded_vitals: 'Baseline recorded at local registration',
        past_diseases: null,
        infection_history: null,
        fever_cold_history: null,
        allergies: null,
        immunisation_history: 'up_to_date',
        due_reason: `Initial ${category.toUpperCase()} health assessment`,
        next_due_date: '2026-10-27',
        allowed_medication_dosage: 'Consult Medical Officer at PHC. Frontline workers cannot prescribe.',
        medication_citation: 'SEC-08-SCP-01',
        asha_visit_notes: notes || 'New registration queued locally.',
        is_synthetic: true,
        is_synthetic_ui_record: true,
      };

      // Save to localStorage
      const existing = JSON.parse(localStorage.getItem('swasthyavani_custom_beneficiaries') || '[]');
      existing.unshift(newRecord);
      localStorage.setItem('swasthyavani_custom_beneficiaries', JSON.stringify(existing));

      // Enqueue to offline sync queue
      syncQueue.enqueue('REGISTER_BENEFICIARY', newRecord);

      alertBox.className = 'reg-alert alert-success';
      alertBox.innerHTML = `
        <strong>${t.registration.successMsg}</strong><br/>
        ID: <code>${newMid}</code> (${newHid})
      `;
      alertBox.style.display = 'block';

      form.reset();

      if (onComplete) {
        setTimeout(() => onComplete(newRecord), 1500);
      }
    });
  }

  renderForm();
  return container;
}
