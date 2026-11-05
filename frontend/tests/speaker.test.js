import { describe, it, expect } from 'vitest';
import { speechManager } from '../src/tts/speaker.js';

describe('TTS SpeechManager Module', () => {
  it('correctly maps language codes to locale strings', () => {
    expect(speechManager.getLangCode('te')).toBe('te-IN');
    expect(speechManager.getLangCode('hi')).toBe('hi-IN');
    expect(speechManager.getLangCode('en')).toBe('en-IN');
  });

  it('chunks long text into coherent sentences without breaking small ones', () => {
    const text = 'First sentence. Second sentence! Third sentence? Fourth sentence.';
    const chunks = speechManager.chunkText(text);
    expect(chunks.length).toBeGreaterThan(0);
    expect(chunks.join(' ')).toContain('First sentence.');
  });

  it('safely handles empty or null strings', () => {
    expect(speechManager.chunkText('')).toEqual([]);
    expect(speechManager.chunkText(null)).toEqual([]);
  });
});
