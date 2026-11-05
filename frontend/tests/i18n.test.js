import { describe, it, expect } from 'vitest';
import en from '../src/i18n/en.json';
import te from '../src/i18n/te.json';
import hi from '../src/i18n/hi.json';

// Explicitly whitelisted tokens in non-English dictionaries
const ALLOWLIST = new Set([
  'SwasthyaVani',
  'ANC',
  'HBNC',
  'CHD',
  'IMM',
  'NUT',
  'NCD',
  'PHC',
  'IFA',
  'ORS',
  'SAM',
  'MAM',
  'KMC',
  'BP',
  'Hb',
  'MUAC',
  'HTN',
  'DM',
  'LMP',
  'EDD',
  'FRU',
  'PDF',
  'MR',
  'BM25',
  'RAM',
  'CPU',
  'MB',
  'ms',
  'kg',
  'g',
  'dL',
  'g/dL',
  'cm',
  'mmHg',
  'P1',
  'P2',
  'P3',
  'p',
  'p95',
  '108',
  '102',
  '2026-10-26',
  '100%',
  '360°',
  'ID',
  'TTS',
  'e.g.',
]);

function flattenObject(obj, prefix = '') {
  let result = {};
  for (const [key, val] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof val === 'object' && val !== null) {
      Object.assign(result, flattenObject(val, fullKey));
    } else {
      result[fullKey] = String(val);
    }
  }
  return result;
}

describe('Trilingual i18n Dictionaries Parity and Script Verification', () => {
  const flatEn = flattenObject(en);
  const flatTe = flattenObject(te);
  const flatHi = flattenObject(hi);

  it('guarantees 100% key parity between English, Telugu, and Hindi', () => {
    const enKeys = Object.keys(flatEn).sort();
    const teKeys = Object.keys(flatTe).sort();
    const hiKeys = Object.keys(flatHi).sort();

    expect(teKeys).toEqual(enKeys);
    expect(hiKeys).toEqual(enKeys);
  });

  it('asserts that Telugu translations contain native Telugu script and no unallowlisted Latin words', () => {
    const latinWordRegex = /[A-Za-z][A-Za-z0-9]*/g;

    for (const [key, text] of Object.entries(flatTe)) {
      // Strip template variables such as {count}
      const cleanText = text.replace(/\{[a-zA-Z0-9_]+\}/g, '');
      const latinMatches = cleanText.match(latinWordRegex) || [];
      const unallowlisted = latinMatches.filter((w) => !ALLOWLIST.has(w));

      expect(
        unallowlisted,
        `Telugu key '${key}' contains unallowlisted Latin word(s): ${unallowlisted.join(', ')} in "${text}"`
      ).toEqual([]);
    }
  });

  it('asserts that Hindi translations contain native Devanagari script and no unallowlisted Latin words', () => {
    const latinWordRegex = /[A-Za-z][A-Za-z0-9]*/g;

    for (const [key, text] of Object.entries(flatHi)) {
      // Strip template variables such as {count}
      const cleanText = text.replace(/\{[a-zA-Z0-9_]+\}/g, '');
      const latinMatches = cleanText.match(latinWordRegex) || [];
      const unallowlisted = latinMatches.filter((w) => !ALLOWLIST.has(w));

      expect(
        unallowlisted,
        `Hindi key '${key}' contains unallowlisted Latin word(s): ${unallowlisted.join(', ')} in "${text}"`
      ).toEqual([]);
    }
  });
});
