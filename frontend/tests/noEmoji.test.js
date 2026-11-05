import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

/**
 * Unicode emoji regex checking for all pictographs, emoticons, transport, and misc symbols.
 */
const EMOJI_REGEX = /[\u{1F300}-\u{1F5FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;

function checkObjectForEmojis(obj, breadcrumb = '') {
  const violations = [];
  for (const [k, v] of Object.entries(obj)) {
    const currentPath = breadcrumb ? `${breadcrumb}.${k}` : k;
    if (typeof v === 'string') {
      if (EMOJI_REGEX.test(v)) {
        violations.push(`${currentPath}: "${v}"`);
      }
    } else if (typeof v === 'object' && v !== null) {
      violations.push(...checkObjectForEmojis(v, currentPath));
    }
  }
  return violations;
}

describe('No Emoji Verification Test (Strict Plain Text Policy)', () => {
  const i18nDir = path.resolve(__dirname, '../src/i18n');

  it('asserts en.json contains zero emojis', () => {
    const content = JSON.parse(fs.readFileSync(path.join(i18nDir, 'en.json'), 'utf-8'));
    const violations = checkObjectForEmojis(content);
    expect(violations).toEqual([]);
  });

  it('asserts te.json contains zero emojis', () => {
    const content = JSON.parse(fs.readFileSync(path.join(i18nDir, 'te.json'), 'utf-8'));
    const violations = checkObjectForEmojis(content);
    expect(violations).toEqual([]);
  });

  it('asserts hi.json contains zero emojis', () => {
    const content = JSON.parse(fs.readFileSync(path.join(i18nDir, 'hi.json'), 'utf-8'));
    const violations = checkObjectForEmojis(content);
    expect(violations).toEqual([]);
  });

  it('asserts index.html contains zero visible emojis', () => {
    const htmlPath = path.resolve(__dirname, '../index.html');
    const content = fs.readFileSync(htmlPath, 'utf-8');
    // Exclude head meta/favicon if any
    const bodyMatch = content.match(/<body[\s\S]*<\/body>/i);
    const bodyContent = bodyMatch ? bodyMatch[0] : content;
    const match = bodyContent.match(EMOJI_REGEX);
    expect(match).toBeNull();
  });

  it('asserts all UI component source files contain zero emojis in UI strings', () => {
    const uiDir = path.resolve(__dirname, '../src/ui');
    const files = fs.readdirSync(uiDir).filter((f) => f.endsWith('.js'));

    const violations = [];
    for (const file of files) {
      const code = fs.readFileSync(path.join(uiDir, file), 'utf-8');
      const lines = code.split('\n');
      lines.forEach((line, idx) => {
        // Exclude comments
        const cleanLine = line.replace(/\/\/.*$/, '').replace(/\/\*[\s\S]*?\*\//, '');
        if (EMOJI_REGEX.test(cleanLine)) {
          violations.push(`${file}:${idx + 1}: ${line.trim()}`);
        }
      });
    }
    expect(violations).toEqual([]);
  });
});
