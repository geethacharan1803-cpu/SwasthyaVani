/**
 * Text Normalization & Multilingual Tokenizer
 * Zero-dependency pure JavaScript string utility.
 */

/**
 * Tokenize input text into lowercase alphanumeric tokens with synonym expansion.
 * @param {string} text
 * @param {Record<string, string>} [lexicon]
 * @returns {string[]}
 */
export function tokenize(text, lexicon = {}) {
  if (!text || typeof text !== 'string') return [];

  // Match words, numbers, and dotted numbers
  const rawTokens = text.toLowerCase().match(/[a-z0-9]+(?:\.[0-9]+)?/g) || [];
  const expanded = [];

  for (const token of rawTokens) {
    expanded.push(token);
    if (lexicon && lexicon[token]) {
      const synonyms = lexicon[token].split(/\s+/);
      for (const syn of synonyms) {
        if (syn) expanded.push(syn);
      }
    }
  }

  return expanded;
}

/**
 * Clean and truncate text safely.
 * @param {string} text
 * @param {number} [maxChars=400]
 * @returns {string}
 */
export function sanitizeText(text, maxChars = 400) {
  if (!text) return '';
  return text.replace(/\s+/g, ' ').trim().slice(0, maxChars);
}

