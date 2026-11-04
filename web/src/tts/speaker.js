/**
 * SwasthyaVani Offline Web Speech Synthesis Manager.
 * Uses native window.speechSynthesis with voice detection, sentence chunking,
 * and controls (speak, pause, resume, stop).
 */

class SpeechManager {
  constructor() {
    this.synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.voices = [];
    this.currentChunks = [];
    this.currentChunkIndex = 0;
    this.activeLang = 'en-IN';
    this.activeVoice = null;
    this.onStatusChange = null;
    this.isPausedState = false;

    if (this.synth) {
      this.loadVoices();
      if (typeof this.synth.onvoiceschanged !== 'undefined') {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  loadVoices() {
    if (!this.synth) return [];
    this.voices = this.synth.getVoices() || [];
    return this.voices;
  }

  getLangCode(lang) {
    if (lang === 'te') return 'te-IN';
    if (lang === 'hi') return 'hi-IN';
    return 'en-IN';
  }

  findBestVoice(langCode) {
    if (!this.voices || this.voices.length === 0) {
      this.loadVoices();
    }
    const prefix = langCode.slice(0, 2).toLowerCase();

    // 1. Exact match e.g. te-IN
    let voice = this.voices.find(
      (v) => v.lang && v.lang.replace('_', '-').toLowerCase() === langCode.toLowerCase()
    );
    if (voice) return voice;

    // 2. Language prefix match e.g. te
    voice = this.voices.find(
      (v) => v.lang && v.lang.toLowerCase().startsWith(prefix)
    );
    if (voice) return voice;

    // 3. Fallback to default or any installed voice
    return null;
  }

  /**
   * Split long text into sentence chunks to prevent speech synthesis timeout on mobile.
   * @param {string} text
   * @returns {Array<string>}
   */
  chunkText(text) {
    if (!text) return [];
    // Split by sentence terminators: periods, exclamation marks, question marks, danda (।), semicolons, newlines
    const rawChunks = text
      .split(/(?<=[.?!।;\n])\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const result = [];
    let buffer = '';

    for (const chunk of rawChunks) {
      if ((buffer + ' ' + chunk).length > 180) {
        if (buffer) result.push(buffer);
        buffer = chunk;
      } else {
        buffer = buffer ? buffer + ' ' + chunk : chunk;
      }
    }
    if (buffer) result.push(buffer);
    return result.length > 0 ? result : [text];
  }

  /**
   * Speak a given text in the requested language.
   * @param {string} text
   * @param {string} lang - 'en' | 'te' | 'hi'
   * @param {Function} [statusCallback] - Receives ('speaking' | 'paused' | 'stopped' | 'error')
   * @returns {{ success: boolean, reason?: string }}
   */
  speak(text, lang, statusCallback = null) {
    if (!this.synth) {
      return { success: false, reason: 'speech_not_supported' };
    }

    this.stop();
    this.onStatusChange = statusCallback;
    this.activeLang = this.getLangCode(lang);
    this.activeVoice = this.findBestVoice(this.activeLang);

    // Honest check: If user requested Telugu or Hindi and device has no matching voice
    if ((lang === 'te' || lang === 'hi') && !this.activeVoice) {
      // Check if browser allows fallback utterance
      console.warn(`[SpeechManager] No specific voice found for ${this.activeLang}. Trying device default.`);
    }

    this.currentChunks = this.chunkText(text);
    this.currentChunkIndex = 0;
    this.isPausedState = false;

    if (this.currentChunks.length === 0) {
      return { success: false, reason: 'empty_text' };
    }

    this.speakNextChunk();
    return { success: true };
  }

  speakNextChunk() {
    if (this.currentChunkIndex >= this.currentChunks.length) {
      this.stop();
      return;
    }

    const chunk = this.currentChunks[this.currentChunkIndex];
    const utterance = new SpeechSynthesisUtterance(chunk);
    utterance.lang = this.activeLang;
    if (this.activeVoice) {
      utterance.voice = this.activeVoice;
    }
    utterance.rate = 0.92; // Slightly measured pace for healthcare clarity

    utterance.onstart = () => {
      if (this.onStatusChange) this.onStatusChange('speaking');
    };

    utterance.onend = () => {
      this.currentChunkIndex++;
      this.speakNextChunk();
    };

    utterance.onerror = (e) => {
      console.warn('[SpeechManager] Utterance error:', e);
      this.currentChunkIndex++;
      if (this.currentChunkIndex < this.currentChunks.length) {
        this.speakNextChunk();
      } else {
        this.stop();
      }
    };

    this.synth.speak(utterance);
  }

  pause() {
    if (!this.synth) return;
    if (this.synth.speaking && !this.synth.paused) {
      this.synth.pause();
      this.isPausedState = true;
      if (this.onStatusChange) this.onStatusChange('paused');
    }
  }

  resume() {
    if (!this.synth) return;
    if (this.synth.paused) {
      this.synth.resume();
      this.isPausedState = false;
      if (this.onStatusChange) this.onStatusChange('speaking');
    }
  }

  stop() {
    if (!this.synth) return;
    this.synth.cancel();
    this.currentChunks = [];
    this.currentChunkIndex = 0;
    this.isPausedState = false;
    if (this.onStatusChange) {
      this.onStatusChange('stopped');
      this.onStatusChange = null;
    }
  }

  isSpeaking() {
    return Boolean(this.synth && this.synth.speaking && !this.synth.paused);
  }

  isPaused() {
    return Boolean(this.synth && this.synth.paused);
  }
}

export const speechManager = new SpeechManager();
