/**
 * Header & Navigation UI Component
 * Renders title, trilingual language switcher, online/offline status badge, and navigation tabs.
 */

export function renderHeader(state, onLangChange, onNavChange) {
  const t = state.translations;
  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

  const header = document.createElement('header');
  header.className = 'app-header';

  header.innerHTML = `
    <div class="header-top">
      <div class="brand">
        <div>
          <h1 class="brand-title">${t.appTitle}</h1>
          <p class="brand-sub">${t.tagline}</p>
        </div>
      </div>
      <div class="header-actions">
        <button type="button" class="btn btn-sm btn-contrast-toggle" id="btn-contrast-toggle" title="${t.header ? t.header.toggleContrast : 'Contrast'}" style="padding:4px 8px;font-size:0.75rem;background:#f1f5f9;border:1px solid #cbd5e1;border-radius:6px;cursor:pointer;">
          ${t.header ? t.header.toggleContrast : 'High Contrast'}
        </button>
        <div class="status-badge ${isOnline ? 'online' : 'offline'}" id="header-conn-status">
          <span class="status-dot"></span>
          <span class="status-text">${isOnline ? t.online : t.offline}</span>
        </div>
        <span class="sync-badge" id="header-sync-status" style="font-size:0.7rem;padding:2px 8px;border-radius:10px;background:#e2e8f0;color:#334155;font-weight:600;">
          0 ${t.header && t.header.pendingSync ? t.header.pendingSync : 'pending'}
        </span>
        <div class="lang-selector">
          <button class="lang-btn ${state.lang === 'en' ? 'active' : ''}" data-lang="en">EN</button>
          <button class="lang-btn ${state.lang === 'hi' ? 'active' : ''}" data-lang="hi">हिन्दी</button>
          <button class="lang-btn ${state.lang === 'te' ? 'active' : ''}" data-lang="te">తెలుగు</button>
        </div>
      </div>
    </div>
    <nav class="app-nav">
      <button class="nav-tab ${state.currentTab === 'ask' ? 'active' : ''}" data-tab="ask">
        ${t.nav.ask}
      </button>
      <button class="nav-tab ${state.currentTab === 'visits' ? 'active' : ''}" data-tab="visits">
        ${t.nav.visits}
      </button>
      <button class="nav-tab ${state.currentTab === 'beneficiaries' ? 'active' : ''}" data-tab="beneficiaries">
        ${t.nav.beneficiaries || 'Beneficiaries'}
      </button>
      <button class="nav-tab ${state.currentTab === 'dashboard' ? 'active' : ''}" data-tab="dashboard">
        ${t.nav.dashboard || 'Dashboard'}
      </button>
      <button class="nav-tab ${state.currentTab === 'perf' ? 'active' : ''}" data-tab="perf">
        ${t.nav.perf}
      </button>
    </nav>
  `;

  // Attach event listeners safely
  header.querySelectorAll('.lang-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const lang = e.currentTarget.getAttribute('data-lang');
      if (lang && lang !== state.lang) onLangChange(lang);
    });
  });

  header.querySelectorAll('.nav-tab').forEach((tab) => {
    tab.addEventListener('click', (e) => {
      const tabName = e.currentTarget.getAttribute('data-tab');
      if (tabName && tabName !== state.currentTab) onNavChange(tabName);
    });
  });

  // Live connectivity & sync counter
  const connStatus = header.querySelector('#header-conn-status');
  const syncStatus = header.querySelector('#header-sync-status');

  function updateHeaderStatus() {
    const online = typeof navigator !== 'undefined' ? navigator.onLine : true;
    if (connStatus) {
      connStatus.className = `status-badge ${online ? 'online' : 'offline'}`;
      const text = connStatus.querySelector('.status-text');
      if (text) text.textContent = online ? t.online : t.offline;
    }
    if (syncStatus) {
      try {
        const queue = JSON.parse(localStorage.getItem('swasthyavani_sync_queue') || '[]');
        syncStatus.textContent = `${queue.length} ${t.header && t.header.pendingSync ? t.header.pendingSync : 'pending'}`;
      } catch {
        syncStatus.textContent = '0 pending';
      }
    }
  }

  window.addEventListener('online', updateHeaderStatus);
  window.addEventListener('offline', updateHeaderStatus);
  updateHeaderStatus();

  // High Contrast / Large Text Mode Toggle
  const btnContrast = header.querySelector('#btn-contrast-toggle');
  if (btnContrast) {
    if (localStorage.getItem('swasthyavani_contrast') === 'true') {
      document.body.classList.add('high-contrast');
    }
    btnContrast.addEventListener('click', () => {
      const active = document.body.classList.toggle('high-contrast');
      localStorage.setItem('swasthyavani_contrast', active ? 'true' : 'false');
    });
  }

  return header;
}
