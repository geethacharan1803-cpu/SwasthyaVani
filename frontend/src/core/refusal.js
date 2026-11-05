/**
 * Scope & Refusal Engine (Layer 2) - Pure JavaScript
 * Refuses prescription, diagnostic, or out-of-scope queries and redirects to Doctor/PHC.
 * Trilingual support: English/Romanized, Hindi (Devanagari), and Telugu (తెలుగు).
 */

export const REFUSE_PATTERNS = [
  /\bparacetamol\b/i,
  /पैरासिटामोल|పారాసిటమాల్/i,
  /\bsyrup\b/i,
  /सिरप|సిరప్/i,
  /\bkitna\s*dena\b/i,
  /\bkitni\s*(?:dose|goli|tablet|dawai)\b/i,
  /कितनी\s*(?:गोली|खुराक|दवा)/i,
  /ఎంత\s*మోతాదు|ఎన్ని\s*మాత్ర/i,
  /\bwhat\s*dose\b/i,
  /\bmg\s*(?:dose|tablet)?\b/i,
  /\bantibiotic\b/i,
  /एंटीबायोटिक|యాంటీబయాటిక్/i,
  /\bamoxicillin\b/i,
  /अमोक्सीसिलीन|అమోక్సిసిలిన్/i,
  /\bcefixime\b/i,
  /\binsulin\s*kitni\b/i,
  /\bmetformin\b/i,
  /मेटफॉर्मिन|మెట్‌ఫార్మిన్/i,
  /\bamlodipine\b/i,
  /एमलोडिपाइन|ఆమ్లోడిపైన్/i,
  /\boxytocin\b/i,
  /ऑक्सीटोसिन|ఆక్సిటోసిన్/i,
  /\bdoxycycline\b/i,
  /डॉक्सीसाइक्लिन|డాక్సీసైక్లిన్/i,
  /\bsaline\b/i,
  /\bglucose\s*ki\s*botal\b/i,
  /सलाइन|ग्लूकोज\s*की\s*बोतल/i,
  /సెలైన్|గ్లూకోజ్\s*బాటిల్/i,
  /\binjection\b/i,
  /इंजेक्शन|ఇంజెక్షన్/i,
  /\bnaatu\s*marunthu\b/i,
  /जड़ी-बूटी|झाड़-फूंक/i,
  /నాటు\s*మందు/i,
  /\bprescription\b/i,
  /\bkoi\s*dawai\b/i,
  /\bdawai\s*ka\s*naam\b/i,
  /what\s*medicine/i,
  /kaunsi\s*dawai/i,
  /e\s*mandulu\s*vevali/i,
  /dosage\s*yentha/i,
  /\bu-win\b/i,
  /\blogin\b/i,
  /\botp\b/i,
  /\bapp\b/i,
  /\bsalary\b/i,
  /\bincentive\b/i,
  /\bhiv\b/i,
  /\btyphoid\s*(?:ka\s*)?(?:test|widal)\b/i,
  /\bwidal\b/i,
  /\bcovid\b/i,
  /\btb\b/i,
  /\bdengue\s*(?:ka\s*)?test\b/i,
  /\bplatelet\b/i,
  /\bration\b/i,
  /\bayushman\b/i,
  /\bcertificate\b/i,
  /\bpraman\b/i,
  /\bbistar\s*geela\b/i,
  /\benuresis\b/i,
  /\bultrasound\b/i,
  /\bx-ray\b/i,
  /\bgarbhpat\b/i,
  /\babortion\b/i,
];

/**
 * Check if inquiry is out-of-scope for frontline health workers.
 * @param {string} text
 * @returns {boolean}
 */
export function detectRefusal(text) {
  if (!text || typeof text !== 'string') return false;
  return REFUSE_PATTERNS.some((rx) => rx.test(text));
}
