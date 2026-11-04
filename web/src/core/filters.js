/**
 * Pure functional filtering module for SwasthyaVani Beneficiary Register.
 * Handles multi-district, village narrowing, clinical category, and multi-field search.
 * Root bugfix: "All" or empty means "no filter" (shows every record), never a blank list.
 */

/**
 * Filter beneficiary records using combined AND criteria.
 * @param {Array<Object>} records - Raw or enriched beneficiary records.
 * @param {Object} filters - Filter criteria.
 * @param {Array<string>} [filters.districts] - Selected district IDs ('all' or empty means all).
 * @param {Array<string>} [filters.villages] - Selected village names ('all' or empty means all).
 * @param {string} [filters.category] - Selected clinical category ('all' or empty means all).
 * @param {string} [filters.searchQuery] - Search query across patient ID, household ID, name, village.
 * @returns {Array<Object>} Filtered list of records.
 */
export function filterBeneficiaries(records, filters = {}) {
  if (!Array.isArray(records)) return [];

  const {
    districts = [],
    villages = [],
    category = '',
    searchQuery = '',
  } = filters;

  // Root fix: filter out 'all' and empty strings so 'all' means NO filter
  const normalizedDistricts = (Array.isArray(districts) ? districts : [districts])
    .map((d) => String(d || '').toLowerCase().trim())
    .filter((d) => Boolean(d) && d !== 'all');

  const normalizedVillages = (Array.isArray(villages) ? villages : [villages])
    .map((v) => String(v || '').toLowerCase().trim())
    .filter((v) => Boolean(v) && v !== 'all');

  const normalizedCat = String(category || '').toLowerCase().trim();
  const searchTerms = String(searchQuery || '').toLowerCase().trim();

  return records.filter((rec) => {
    // 1. District filter (multi-select): 'all' or empty means show all
    if (normalizedDistricts.length > 0) {
      const recDistrict = String(rec.district || '').toLowerCase().trim();
      if (!normalizedDistricts.includes(recDistrict)) {
        return false;
      }
    }

    // 2. Village filter (multi-select): 'all' or empty means show all
    if (normalizedVillages.length > 0) {
      const recVillage = String(rec.village || '').toLowerCase().trim();
      if (!normalizedVillages.includes(recVillage)) {
        return false;
      }
    }

    // 3. Clinical Category filter: 'all' or empty means show all
    if (normalizedCat && normalizedCat !== 'all') {
      const recCat = String(rec.clinical_category || '').toLowerCase().trim();
      const isHighRisk = Boolean(rec.is_high_risk);

      if (normalizedCat === 'high_risk') {
        if (!isHighRisk && recCat !== 'high_risk') return false;
      } else if (recCat !== normalizedCat) {
        return false;
      }
    }

    // 4. Search box (Patient ID, Household ID, Name, Village, House No)
    if (searchTerms) {
      const mid = String(rec.member_id || '').toLowerCase();
      const hid = String(rec.household_id || '').toLowerCase();
      const name = String(rec.name || '').toLowerCase();
      const vil = String(rec.village || '').toLowerCase();
      const dist = String(rec.district || '').toLowerCase();
      const houseNo = String(rec.house_no || '').toLowerCase();

      const matches =
        mid.includes(searchTerms) ||
        hid.includes(searchTerms) ||
        name.includes(searchTerms) ||
        vil.includes(searchTerms) ||
        dist.includes(searchTerms) ||
        houseNo.includes(searchTerms);

      if (!matches) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Extract available filter option sets dynamically based on records and current district selection.
 * @param {Array<Object>} records
 * @param {Array<string>} [selectedDistricts]
 * @returns {{
 *   districts: Array<string>,
 *   villages: Array<string>,
 *   categories: Array<string>
 * }}
 */
export function getFilterOptions(records = [], selectedDistricts = []) {
  if (!Array.isArray(records)) {
    return { districts: [], villages: [], categories: [] };
  }

  const districtSet = new Set();
  const categorySet = new Set(['anc', 'hbnc', 'imm', 'nut', 'ncd', 'high_risk']);

  records.forEach((r) => {
    if (r.district) districtSet.add(String(r.district).toLowerCase().trim());
  });

  const normDistricts = (Array.isArray(selectedDistricts) ? selectedDistricts : [selectedDistricts])
    .map((d) => String(d || '').toLowerCase().trim())
    .filter((d) => Boolean(d) && d !== 'all');

  // Villages narrow to selected districts (if no district selected or 'all', return all villages)
  const villageSet = new Set();
  records.forEach((r) => {
    const d = String(r.district || '').toLowerCase().trim();
    if (normDistricts.length === 0 || normDistricts.includes(d)) {
      if (r.village) villageSet.add(String(r.village).trim());
    }
  });

  return {
    districts: Array.from(districtSet).sort(),
    villages: Array.from(villageSet).sort(),
    categories: Array.from(categorySet),
  };
}
