// src/services/extractor.service.js
// Regex-based NLP extractor for medical report parameters.
// Covers 12 key parameters with status classification.

/**
 * @typedef {Object} MedicalParameters
 * @property {number|null} cholesterol   - mg/dL (normal < 200)
 * @property {number|null} ldl           - mg/dL (normal < 130)
 * @property {number|null} hdl           - mg/dL (normal > 40)
 * @property {number|null} triglycerides - mg/dL (normal < 150)
 * @property {number|null} bloodSugar    - mg/dL fasting (normal < 100)
 * @property {number|null} hba1c         - % (normal < 5.7)
 * @property {number|null} systolicBP    - mmHg (normal < 120)
 * @property {number|null} diastolicBP   - mmHg (normal < 80)
 * @property {number|null} hemoglobin    - g/dL
 * @property {number|null} creatinine    - mg/dL
 * @property {number|null} bmi
 * @property {number|null} uricAcid      - mg/dL
 * @property {number|null} tsh           - mIU/L
 */

// ── Regex patterns ────────────────────────────────────────────────────────────
// Each entry: [key, regex, valueGroupIndex]
// "bp" has special handling for systolic/diastolic split

const PATTERNS = [
  ["cholesterol",   /(?<![A-Za-z])(total\s+)?cholesterol[^\n]{0,30}?(\d{2,3}(?:\.\d+)?)/i,  2],
  ["ldl",           /ldl[\s\-\/]*(cholesterol)?[^\n]{0,20}?(\d{2,3}(?:\.\d+)?)/i,             2],
  ["hdl",           /hdl[\s\-\/]*(cholesterol)?[^\n]{0,20}?(\d{2,3}(?:\.\d+)?)/i,             2],
  ["triglycerides", /triglycerides?[^\n]{0,20}?(\d{2,3}(?:\.\d+)?)/i,                          1],
  ["bloodSugar",    /(?:fasting\s+)?(?:blood\s+(?:sugar|glucose)|glucose(?:\s+fasting)?)[^\n]{0,20}?(\d{2,3}(?:\.\d+)?)/i, 1],
  ["hba1c",         /hb\s*a1c[^\n]{0,20}?(\d{1,2}(?:\.\d+)?)/i,                               1],
  ["bp",            /(?:blood\s+pressure|b\.?p\.?)[^\n]{0,20}?(\d{2,3})\s*[/\\]\s*(\d{2,3})/i, null], // special
  ["hemoglobin",    /h(?:ae?)?moglobin[^\n]{0,20}?(\d{1,2}(?:\.\d+)?)/i,                       1],
  ["creatinine",    /creatinine[^\n]{0,20}?(\d{1,2}(?:\.\d+)?)/i,                              1],
  ["bmi",           /bmi[^\n]{0,20}?(\d{2}(?:\.\d+)?)/i,                                       1],
  ["uricAcid",      /uric\s+acid[^\n]{0,20}?(\d{1,2}(?:\.\d+)?)/i,                             1],
  ["tsh",           /tsh[^\n]{0,20}?(\d{1,3}(?:\.\d+)?)/i,                                     1],
];

/**
 * Extract medical parameters from OCR text.
 * @param {string} text
 * @returns {MedicalParameters}
 */
export function extractParameters(text) {
  const params = {
    cholesterol: null, ldl: null, hdl: null, triglycerides: null,
    bloodSugar: null, hba1c: null, systolicBP: null, diastolicBP: null,
    hemoglobin: null, creatinine: null, bmi: null, uricAcid: null, tsh: null,
  };

  for (const [key, regex, groupIdx] of PATTERNS) {
    const match = text.match(regex);
    if (!match) continue;

    try {
      if (key === "bp") {
        params.systolicBP  = parseFloat(match[1]);
        params.diastolicBP = parseFloat(match[2]);
      } else {
        params[key] = parseFloat(match[groupIdx]);
      }
    } catch {
      // skip unparseable values
    }
  }

  return params;
}

/**
 * Convert MedicalParameters to an array of display objects with status labels.
 * @param {MedicalParameters} params
 * @returns {Array<{name: string, value: string, unit: string, status: string}>}
 */
export function paramsToList(params) {
  const definitions = [
    ["Cholesterol",   params.cholesterol,   "mg/dL", cholesterolStatus],
    ["LDL",           params.ldl,           "mg/dL", ldlStatus],
    ["HDL",           params.hdl,           "mg/dL", hdlStatus],
    ["Triglycerides", params.triglycerides, "mg/dL", trigStatus],
    ["Blood Sugar",   params.bloodSugar,    "mg/dL", sugarStatus],
    ["HbA1c",         params.hba1c,         "%",     hba1cStatus],
    ["Systolic BP",   params.systolicBP,    "mmHg",  systolicStatus],
    ["Diastolic BP",  params.diastolicBP,   "mmHg",  diastolicStatus],
    ["Hemoglobin",    params.hemoglobin,    "g/dL",  hbStatus],
    ["BMI",           params.bmi,           "kg/m²", bmiStatus],
    ["Uric Acid",     params.uricAcid,      "mg/dL", uricStatus],
    ["TSH",           params.tsh,           "mIU/L", tshStatus],
  ];

  return definitions
    .filter(([, value]) => value !== null && value !== undefined)
    .map(([name, value, unit, statusFn]) => ({
      name,
      value: String(value),
      unit,
      status: statusFn(value),
    }));
}

// ── Status helpers ────────────────────────────────────────────────────────────

const cholesterolStatus = (v) => v < 200 ? "normal" : v < 240 ? "borderline" : "high";
const ldlStatus         = (v) => v < 100 ? "normal" : v < 130 ? "borderline" : "high";
const hdlStatus         = (v) => v >= 60 ? "normal" : v >= 40 ? "borderline" : "low";
const trigStatus        = (v) => v < 150 ? "normal" : v < 200 ? "borderline" : "high";
const sugarStatus       = (v) => v < 100 ? "normal" : v < 126 ? "borderline" : "high";
const hba1cStatus       = (v) => v < 5.7 ? "normal" : v < 6.5 ? "borderline" : "high";
const systolicStatus    = (v) => v < 120 ? "normal" : v < 130 ? "borderline" : "high";
const diastolicStatus   = (v) => v < 80  ? "normal" : v < 90  ? "borderline" : "high";
const hbStatus          = (v) => v >= 12 ? "normal" : "low";
const bmiStatus         = (v) => v < 18.5 ? "low" : v < 25 ? "normal" : v < 30 ? "borderline" : "high";
const uricStatus        = (v) => v <= 7.0 ? "normal" : "high";
const tshStatus         = (v) => v < 0.4 ? "low" : v <= 4.0 ? "normal" : "high";
