/**
 * SwasthyaVani Main Application Entry Point
 * Pure JavaScript, offline-first PWA for frontline health workers.
 */

import { CONFIG } from './config.js';
import { loadAppData } from './data/loader.js';
import { ClientBM25 } from './core/retrieval.js';
import { renderHeader } from './ui/header.js';
import { renderAskView } from './ui/askView.js';
import { renderRegisterView } from './ui/registerView.js';
import { renderVisitListView } from './ui/visitListView.js';
import { renderDashboardView } from './ui/dashboardView.js';
import { renderPerformanceView } from './ui/performanceView.js';

import en from './i18n/en.json';
import hi from './i18n/hi.json';
import te from './i18n/te.json';

const TRANSLATIONS = { en, hi, te };

// Central reactive UI state
const state = {
  lang: localStorage.getItem('swasthyavani_lang') || CONFIG.DEFAULT_LANGUAGE,
  currentTab: 'ask',
  translations: TRANSLATIONS[CONFIG.DEFAULT_LANGUAGE],
  sections: {},
  index: {},
  lexicon: {},
  visits: [],
  enrichedRegister: [],
  bm25: null,
  lastQuery: '',
  lastResult: null,
  selectedVisitDate: null,
};

state.translations = TRANSLATIONS[state.lang] || en;

/**
 * Re-render the application DOM based on current state.
 */
function renderApp() {
  const root = document.getElementById('app');
  if (!root) return;

  // Sync <html lang> attribute
  document.documentElement.lang = state.lang;

  root.innerHTML = '';

  // 1. Render Header
  const header = renderHeader(
    state,
    (newLang) => {
      state.lang = newLang;
      state.translations = TRANSLATIONS[newLang] || en;
      localStorage.setItem('swasthyavani_lang', newLang);
      renderApp();
    },
    (newTab) => {
      state.currentTab = newTab;
      renderApp();
    }
  );
  root.appendChild(header);

  // 2. Render Main View Body
  const main = document.createElement('main');
  main.className = 'app-main';

  if (state.currentTab === 'ask') {
    main.appendChild(renderAskView(state));
  } else if (state.currentTab === 'beneficiaries' || state.currentTab === 'register' || state.currentTab === 'registration') {
    main.appendChild(renderRegisterView(state));
  } else if (state.currentTab === 'visits') {
    main.appendChild(renderVisitListView(state));
  } else if (state.currentTab === 'dashboard') {
    main.appendChild(
      renderDashboardView(state, (targetDate) => {
        state.selectedVisitDate = targetDate;
        state.currentTab = 'visits';
        renderApp();
      })
    );
  } else if (state.currentTab === 'perf') {
    main.appendChild(renderPerformanceView(state));
  }

  root.appendChild(main);
}

/**
 * Initialize application assets, service worker, and BM25 index.
 */
async function init() {
  // Register Service Worker early for reliable offline caching
  if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
    navigator.serviceWorker
      .register('/sw.js')
      .catch((err) => console.warn('[SwasthyaVani] SW registration error:', err));
  }

  const root = document.getElementById('app');
  if (root) {
    root.innerHTML = `
      <div class="loading-screen">
        <div class="spinner"></div>
        <p>Loading SwasthyaVani Clinical Protocols...</p>
      </div>
    `;
  }

  try {
    const data = await loadAppData();
    state.sections = data.sections;
    state.index = data.index;
    state.lexicon = data.lexicon;
    state.visits = data.visits;
    state.enrichedRegister = data.enrichedRegister;
    state.seasonalPack = data.seasonalPack || [];

    // Initialize BM25 search index in memory
    state.bm25 = new ClientBM25(data.index, data.lexicon);

    renderApp();
  } catch (err) {
    console.error('[SwasthyaVani] Initialization error:', err);
    if (root) {
      root.innerHTML = `<div class="error-screen">Failed to initialize offline index: ${err.message}</div>`;
    }
  }
}

// Start application
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
