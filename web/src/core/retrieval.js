/**
 * Client-Side BM25 Retrieval Engine - Pure JavaScript
 * Queries inverted index in browser memory in under 5 ms with zero server roundtrips.
 */

import { tokenize } from './normalize.js';

export class ClientBM25 {
  /**
   * @param {Object} indexData
   * @param {Record<string, string>} [lexicon]
   */
  constructor(indexData, lexicon = {}) {
    this.k1 = indexData.k1 || 1.5;
    this.b = indexData.b || 0.75;
    this.docCount = indexData.doc_count || 1;
    this.avgdl = indexData.avgdl || 100;
    this.docLengths = indexData.doc_lengths || {};
    this.idf = indexData.idf || {};
    this.invertedIndex = indexData.inverted_index || {};
    this.lexicon = lexicon;
  }

  /**
   * Search top-k protocol sections matching query.
   * @param {string} query
   * @param {number} [topK=2]
   * @returns {Array<{ secId: string, score: number }>}
   */
  search(query, topK = 2) {
    const tokens = tokenize(query, this.lexicon);
    if (!tokens.length) return [];

    const scores = new Map();

    for (const term of tokens) {
      const postings = this.invertedIndex[term];
      if (!postings) continue;

      const idfScore = this.idf[term] || 0.5;

      for (const [secId, tf] of postings) {
        const docLen = this.docLengths[secId] || this.avgdl;
        const num = tf * (this.k1 + 1.0);
        const denom = tf + this.k1 * (1.0 - this.b + this.b * (docLen / this.avgdl));
        const score = idfScore * (num / denom);

        scores.set(secId, (scores.get(secId) || 0) + score);
      }
    }

    const sorted = Array.from(scores.entries())
      .map(([secId, score]) => ({ secId, score }))
      .sort((a, b) => b.score - a.score);

    return sorted.slice(0, topK);
  }
}

