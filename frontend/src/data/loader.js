/**
 * Data Loader Module
 * Loads pre-computed static JSON files with memory caching and error recovery.
 */

const cache = {
  sections: null,
  index: null,
  lexicon: null,
  visits: null,
  enrichedRegister: null,
  seasonalPack: null,
};

/**
 * Fetch static JSON with defensive fallback.
 * @param {string} url
 * @returns {Promise<any>}
 */
async function fetchJson(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${url}`);
    return await res.json();
  } catch (err) {
    console.warn(`[SwasthyaVani] Failed to fetch ${url}:`, err);
    return null;
  }
}

/**
 * Load all clinical data required for offline runtime.
 * @returns {Promise<{
 *   sections: Record<string, Object>,
 *   index: Object,
 *   lexicon: Record<string, string>,
 *   visits: Array<Object>,
 *   enrichedRegister: Array<Object>,
 *   seasonalPack: Array<Object>
 * }>}
 */
export async function loadAppData() {
  if (
    cache.sections &&
    cache.index &&
    cache.lexicon &&
    cache.visits &&
    cache.enrichedRegister &&
    cache.seasonalPack
  ) {
    return cache;
  }

  const [sections, index, lexicon, visits, enriched, seasonal] = await Promise.all([
    fetchJson('/data/sections.json'),
    fetchJson('/data/index.json'),
    fetchJson('/data/lexicon.json'),
    fetchJson('/data/register_visits.json'),
    fetchJson('/data/register_enriched.json'),
    fetchJson('/data/seasonal_health_pack.json'),
  ]);

  cache.sections = sections || {};
  cache.index = index || {};
  cache.lexicon = lexicon || {};
  cache.visits = visits || [];
  cache.enrichedRegister = enriched || [];
  cache.seasonalPack = seasonal || [];

  return cache;
}
