/**
 * Ask Protocols Screen UI Component
 * Search query input, Web Speech voice input, and clean response cards with trilingual audio narration.
 * Includes localized sample query chips organized across clinical topics.
 */

import SAMPLE_QUERIES from '../data/sample_queries.json';
import { answerQuestion } from '../core/answer.js';
import { speechManager } from '../tts/speaker.js';

export function renderAskView(state, onResult) {
  const t = state.translations;
  const currentLang = state.lang || 'en';
  const container = document.createElement('div');
  container.className = 'view-container ask-view';

  let activeTopic = 'all';

  function getQueryText(item) {
    if (currentLang === 'te') return item.qTe || item.qEn;
    if (currentLang === 'hi') return item.qHi || item.qEn;
    return item.qEn;
  }

  function getLabelText(item) {
    if (currentLang === 'te') return item.labelTe || item.labelEn;
    if (currentLang === 'hi') return item.labelHi || item.labelEn;
    return item.labelEn;
  }

  const topicLabels = {
    all: currentLang === 'te' ? 'అన్నీ' : currentLang === 'hi' ? 'सभी' : 'All Topics',
    anc: currentLang === 'te' ? 'గర్భధారణ (ANC)' : currentLang === 'hi' ? 'गर्भावस्था (ANC)' : 'Maternal & ANC',
    hbnc: currentLang === 'te' ? 'నవజాత శిశువు (HBNC)' : currentLang === 'hi' ? 'नवजात शिशु (HBNC)' : 'Newborn & HBNC',
    chd: currentLang === 'te' ? 'పిల్లల అనారోగ్యాలు' : currentLang === 'hi' ? 'बाल रोग (CHD)' : 'Child Health (CHD)',
    nut: currentLang === 'te' ? 'పోషకాహారం & SAM' : currentLang === 'hi' ? 'पोषण एवं कुपोषण' : 'Nutrition & SAM',
    imm: currentLang === 'te' ? 'టీకాలు (IMM)' : currentLang === 'hi' ? 'टीकाकरण (IMM)' : 'Immunization',
    ncd: currentLang === 'te' ? 'బీపీ & షుగర్ (NCD)' : currentLang === 'hi' ? 'बीपी एवं शुगर (NCD)' : 'Chronic & NCD',
    esc: currentLang === 'te' ? 'అత్యవసర ప్రమాదాలు' : currentLang === 'hi' ? 'आपातकालीन खतरे' : 'Emergency Danger Signs',
    seasonal: currentLang === 'te' ? 'కాలానుగుణ వ్యాధులు' : currentLang === 'hi' ? 'मौसमी रोग' : 'Seasonal & Vector',
    refusal: currentLang === 'te' ? 'పరిధి పరిమితులు' : currentLang === 'hi' ? 'दवा सीमाएं' : 'Scope Refusals',
  };

  container.innerHTML = `
    <div class="card intro-card">
      <h2 class="section-title">${t.ask.title}</h2>
      <p class="section-sub">${t.ask.subtitle}</p>

      <form id="ask-form" class="query-form">
        <div class="input-wrapper">
          <textarea
            id="query-input"
            class="query-input"
            rows="3"
            placeholder="${t.ask.placeholder}"
            required
          >${state.lastQuery || ''}</textarea>
        </div>
        <div class="form-actions">
          <button type="submit" class="btn btn-primary" id="btn-search">
            ${t.ask.btnSubmit}
          </button>
          <button type="button" class="btn btn-secondary" id="btn-voice">
            ${t.ask.btnVoice}
          </button>
        </div>
        <div id="voice-status-msg" style="display:none;margin-top:8px;padding:8px 12px;border-radius:8px;font-size:0.85rem;background:#fef3c7;color:#92400e;border:1px solid #fde68a;"></div>
      </form>

      <!-- Topic Filter Tabs for Suggestion Chips -->
      <div class="samples-wrapper">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;flex-wrap:wrap;gap:6px;">
          <span class="samples-label" style="font-weight:700;">${t.ask.recentQueries} (${SAMPLE_QUERIES.length}):</span>
          <div class="topic-tabs-bar" style="display:flex;gap:4px;flex-wrap:wrap;">
            ${['all', 'anc', 'hbnc', 'chd', 'nut', 'imm', 'ncd', 'esc', 'seasonal', 'refusal']
              .map(
                (top) => `
              <button type="button" class="btn btn-sm btn-topic ${activeTopic === top ? 'btn-primary' : 'btn-secondary'}" data-topic="${top}" style="padding:2px 8px;font-size:0.75rem;">
                ${topicLabels[top]}
              </button>
            `
              )
              .join('')}
          </div>
        </div>

        <div id="chips-container" class="samples-chips">
          <!-- Rendered dynamically -->
        </div>
      </div>
    </div>

    <div id="result-area" class="result-area"></div>
  `;

  const form = container.querySelector('#ask-form');
  const input = container.querySelector('#query-input');
  const resultArea = container.querySelector('#result-area');
  const btnVoice = container.querySelector('#btn-voice');
  const chipsContainer = container.querySelector('#chips-container');

  function renderChips() {
    const filtered =
      activeTopic === 'all'
        ? SAMPLE_QUERIES
        : SAMPLE_QUERIES.filter((q) => q.topic === activeTopic);

    chipsContainer.innerHTML = filtered
      .map(
        (s) => `
        <button
          type="button"
          class="sample-chip"
          data-query="${escapeHtml(getQueryText(s))}"
          title="${escapeHtml(getQueryText(s))}"
        >
          ${escapeHtml(getLabelText(s))}
        </button>
      `
      )
      .join('');

    chipsContainer.querySelectorAll('.sample-chip').forEach((chip) => {
      chip.addEventListener('click', (e) => {
        const q = e.currentTarget.getAttribute('data-query');
        if (q) {
          input.value = q;
          executeQuery(q);
        }
      });
    });
  }

  container.querySelectorAll('.btn-topic').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      activeTopic = e.currentTarget.getAttribute('data-topic');
      container.querySelectorAll('.btn-topic').forEach((b) => {
        b.classList.remove('btn-primary');
        b.classList.add('btn-secondary');
      });
      e.currentTarget.classList.remove('btn-secondary');
      e.currentTarget.classList.add('btn-primary');
      renderChips();
    });
  });

  renderChips();

  function executeQuery(text) {
    if (!text || !text.trim()) return;
    const res = answerQuestion(text, state.bm25, state.sections, 400, {
      lang: state.lang,
      seasonalPack: state.seasonalPack,
    });
    state.lastQuery = text;
    state.lastResult = res;
    renderResultCard(res, resultArea, t, state);
    if (onResult) onResult(res);
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    executeQuery(input.value);
  });

  // Web Speech API Voice Input
  const voiceStatusMsg = container.querySelector('#voice-status-msg');

  function updateVoiceOnlineStatus() {
    if (!navigator.onLine) {
      btnVoice.classList.add('voice-offline');
      btnVoice.title = t.ask.voiceOfflineMsg;
    } else {
      btnVoice.classList.remove('voice-offline');
      btnVoice.title = t.ask.btnVoice;
    }
  }

  window.addEventListener('online', updateVoiceOnlineStatus);
  window.addEventListener('offline', updateVoiceOnlineStatus);
  updateVoiceOnlineStatus();

  if (
    typeof window !== 'undefined' &&
    ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)
  ) {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRec();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = state.lang === 'te' ? 'te-IN' : state.lang === 'hi' ? 'hi-IN' : 'en-IN';

    btnVoice.addEventListener('click', () => {
      if (!navigator.onLine) {
        if (voiceStatusMsg) {
          voiceStatusMsg.textContent = t.ask.voiceOfflineMsg;
          voiceStatusMsg.style.display = 'block';
          setTimeout(() => {
            voiceStatusMsg.style.display = 'none';
          }, 6000);
        }
        return;
      }
      btnVoice.classList.add('recording');
      btnVoice.textContent = t.ask.listening;
      if (voiceStatusMsg) voiceStatusMsg.style.display = 'none';
      try {
        recognition.start();
      } catch {
        btnVoice.classList.remove('recording');
        btnVoice.textContent = t.ask.btnVoice;
      }
    });

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      input.value = transcript;
      btnVoice.classList.remove('recording');
      btnVoice.textContent = t.ask.btnVoice;
      if (voiceStatusMsg) voiceStatusMsg.style.display = 'none';
      executeQuery(transcript);
    };

    recognition.onerror = (event) => {
      btnVoice.classList.remove('recording');
      btnVoice.textContent = t.ask.btnVoice;
      if (voiceStatusMsg) {
        if (event && event.error === 'network') {
          voiceStatusMsg.textContent = t.ask.voiceOfflineMsg;
        } else if (event && event.error === 'not-allowed') {
          voiceStatusMsg.textContent = t.ask.voicePermissionDenied;
        } else {
          voiceStatusMsg.textContent = t.ask.voiceNetError;
        }
        voiceStatusMsg.style.display = 'block';
        setTimeout(() => {
          voiceStatusMsg.style.display = 'none';
        }, 5000);
      }
    };

    recognition.onend = () => {
      btnVoice.classList.remove('recording');
      btnVoice.textContent = t.ask.btnVoice;
    };
  } else {
    btnVoice.addEventListener('click', () => {
      if (voiceStatusMsg) {
        voiceStatusMsg.textContent = t.card.voiceUnavailable;
        voiceStatusMsg.style.display = 'block';
      }
    });
  }

  // Restore previous result if exists
  if (state.lastResult) {
    renderResultCard(state.lastResult, resultArea, t, state);
  }

  return container;
}

function renderResultCard(res, container, t, state) {
  container.innerHTML = '';
  const card = document.createElement('div');

  // Spoken text formatted for TTS
  let spokenText = '';
  if (res.type === 'escalate') {
    spokenText = `${t.card.escalateTitle}. ${res.answerText}. ${t.card.escalateAction}`;
  } else if (res.type === 'refuse') {
    spokenText = `${t.card.refusalTitle}. ${res.answerText}. ${t.card.refusalAction}`;
  } else if (res.type === 'seasonal') {
    spokenText = `${t.card.seasonalTitle}. ${res.answerText}`;
  } else if (res.type === 'fallback') {
    spokenText = `${t.card.fallbackTitle}. ${res.answerText}`;
  } else {
    spokenText = `${t.card.answerTitle}. ${res.answerText}`;
  }

  if (res.type === 'escalate') {
    // CHANGE 2b: Plain text answer area, no separate red emergency panel or dialing buttons
    card.className = 'result-card card-answer';
    card.innerHTML = `
      <div class="card-badge answer-badge">
        ${escapeHtml(t.card.escalateTitle)}
      </div>
      <div class="card-content">
        <p class="answer-main">${escapeHtml(res.answerText)}</p>
        <p class="escalate-instruction" style="margin-top:10px;font-weight:600;color:var(--color-text);">
          ${escapeHtml(t.card.escalateAction)}
        </p>
        <div class="tts-player-bar" style="margin: 12px 0;">
          <button type="button" class="btn btn-sm btn-tts btn-speak">
            ${t.card.btnListen}
          </button>
          <button type="button" class="btn btn-sm btn-secondary btn-pause" style="display:none;">
            ${t.card.btnPause}
          </button>
          <button type="button" class="btn btn-sm btn-secondary btn-stop" style="display:none;">
            ${t.card.btnStop}
          </button>
        </div>
      </div>
      <div class="card-footer">
        <div class="citation-chip">
          <span class="citation-label">${t.card.citation}:</span>
          <strong>${res.citedSectionIds.join(', ')}</strong>
        </div>
        <span class="latency-chip">${t.card.latency}: ${res.latencyMs} ms</span>
      </div>
    `;
  } else if (res.type === 'refuse') {
    card.className = 'result-card card-refuse';
    card.innerHTML = `
      <div class="card-badge refuse-badge">
        ${t.card.refusalTitle}
      </div>
      <div class="card-content">
        <p class="answer-main">${escapeHtml(res.answerText)}</p>
        <div class="tts-player-bar" style="margin: 12px 0;">
          <button type="button" class="btn btn-sm btn-tts btn-speak">
            ${t.card.btnListen}
          </button>
          <button type="button" class="btn btn-sm btn-secondary btn-pause" style="display:none;">
            ${t.card.btnPause}
          </button>
          <button type="button" class="btn btn-sm btn-secondary btn-stop" style="display:none;">
            ${t.card.btnStop}
          </button>
        </div>
        <p class="refuse-notice">${t.card.refusalAction}</p>
      </div>
      <div class="card-footer">
        <div class="citation-chip">
          <span class="citation-label">${t.card.citation}:</span>
          <strong>${res.citedSectionIds.join(', ')}</strong>
        </div>
        <span class="latency-chip">${t.card.latency}: ${res.latencyMs} ms</span>
      </div>
    `;
  } else if (res.type === 'seasonal') {
    card.className = 'result-card card-answer';
    card.innerHTML = `
      <div class="card-badge answer-badge">
        ${t.card.seasonalTitle}
      </div>
      <div class="card-content">
        <p class="answer-main">${escapeHtml(res.answerText)}</p>
        <div class="tts-player-bar" style="margin: 12px 0;">
          <button type="button" class="btn btn-sm btn-tts btn-speak">
            ${t.card.btnListen}
          </button>
          <button type="button" class="btn btn-sm btn-secondary btn-pause" style="display:none;">
            ${t.card.btnPause}
          </button>
          <button type="button" class="btn btn-sm btn-secondary btn-stop" style="display:none;">
            ${t.card.btnStop}
          </button>
        </div>
      </div>
      <div class="card-footer">
        <div class="citation-chip">
          <span class="citation-label">${t.card.citation}:</span>
          <strong>${res.citedSectionIds.join(', ')}</strong>
        </div>
        <span class="latency-chip">${t.card.latency}: ${res.latencyMs} ms</span>
      </div>
    `;
  } else {
    card.className = 'result-card card-answer';
    card.innerHTML = `
      <div class="card-badge answer-badge">
        ${t.card.answerTitle}
      </div>
      <div class="card-content">
        <p class="answer-main">${escapeHtml(res.answerText)}</p>
        <div class="tts-player-bar" style="margin: 12px 0;">
          <button type="button" class="btn btn-sm btn-tts btn-speak">
            ${t.card.btnListen}
          </button>
          <button type="button" class="btn btn-sm btn-secondary btn-pause" style="display:none;">
            ${t.card.btnPause}
          </button>
          <button type="button" class="btn btn-sm btn-secondary btn-stop" style="display:none;">
            ${t.card.btnStop}
          </button>
        </div>
      </div>
      <div class="card-footer">
        <div class="citation-chip">
          <span class="citation-label">${t.card.citation}:</span>
          <strong>${res.citedSectionIds.join(', ')}</strong>
        </div>
        <span class="latency-chip">${t.card.latency}: ${res.latencyMs} ms</span>
      </div>
    `;
  }

  // Hook TTS event listeners
  const btnSpeak = card.querySelector('.btn-speak');
  const btnPause = card.querySelector('.btn-pause');
  const btnStop = card.querySelector('.btn-stop');

  function updateTtsControls(status) {
    if (status === 'speaking') {
      btnSpeak.textContent = t.card.playing || 'Playing...';
      btnPause.style.display = 'inline-block';
      btnStop.style.display = 'inline-block';
    } else if (status === 'paused') {
      btnSpeak.textContent = t.card.btnResume || 'Resume';
      btnPause.style.display = 'none';
      btnStop.style.display = 'inline-block';
    } else {
      btnSpeak.textContent = t.card.btnListen;
      btnPause.style.display = 'none';
      btnStop.style.display = 'none';
    }
  }

  btnSpeak.addEventListener('click', () => {
    if (speechManager.isPaused()) {
      speechManager.resume();
      updateTtsControls('speaking');
    } else {
      const currentLang = state && state.lang ? state.lang : 'en';
      speechManager.speak(spokenText, currentLang, (st) => updateTtsControls(st));
    }
  });

  btnPause.addEventListener('click', () => {
    speechManager.pause();
    updateTtsControls('paused');
  });

  btnStop.addEventListener('click', () => {
    speechManager.stop();
    updateTtsControls('stopped');
  });

  container.appendChild(card);
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
