function extractParameters(text) {
  const source = text || '';

  const patterns = {
    cholesterol: /(?:total\s+)?cholesterol[^\n\r]{0,30}?(\d{2,3}(?:\.\d+)?)/i,
    ldl: /ldl[^\n\r]{0,25}?(\d{2,3}(?:\.\d+)?)/i,
    hdl: /hdl[^\n\r]{0,25}?(\d{2,3}(?:\.\d+)?)/i,
    triglycerides: /triglycerides?[^\n\r]{0,25}?(\d{2,3}(?:\.\d+)?)/i,
    bloodSugar: /(?:fasting\s+)?(?:blood\s*(?:sugar|glucose)|glucose)[^\n\r]{0,25}?(\d{2,3}(?:\.\d+)?)/i,
    hba1c: /hb\s*a1c[^\n\r]{0,25}?(\d{1,2}(?:\.\d+)?)/i,
    hemoglobin: /h(?:ae?)?moglobin[^\n\r]{0,25}?(\d{1,2}(?:\.\d+)?)/i,
    creatinine: /creatinine[^\n\r]{0,25}?(\d{1,2}(?:\.\d+)?)/i,
    bmi: /bmi[^\n\r]{0,25}?(\d{1,2}(?:\.\d+)?)/i,
    uricAcid: /uric\s+acid[^\n\r]{0,25}?(\d{1,2}(?:\.\d+)?)/i,
    tsh: /tsh[^\n\r]{0,25}?(\d{1,3}(?:\.\d+)?)/i,
    bp: /(?:blood\s+pressure|b\.?p\.?)\D{0,20}(\d{2,3})\s*[\/]\s*(\d{2,3})/i,
  };

  const params = {
    cholesterol: null,
    ldl: null,
    hdl: null,
    triglycerides: null,
    bloodSugar: null,
    hba1c: null,
    systolicBP: null,
    diastolicBP: null,
    hemoglobin: null,
    creatinine: null,
    bmi: null,
    uricAcid: null,
    tsh: null,
  };

  Object.keys(patterns).forEach((key) => {
    const match = source.match(patterns[key]);
    if (!match) {
      return;
    }

    if (key === 'bp') {
      params.systolicBP = parseFloat(match[1]);
      params.diastolicBP = parseFloat(match[2]);
      return;
    }

    params[key] = parseFloat(match[1]);
  });

  return params;
}

function paramsToList(params) {
  const items = [
    ['cholesterol', 'Cholesterol', params.cholesterol, 'mg/dL', cholesterolStatus],
    ['ldl', 'LDL', params.ldl, 'mg/dL', ldlStatus],
    ['hdl', 'HDL', params.hdl, 'mg/dL', hdlStatus],
    ['triglycerides', 'Triglycerides', params.triglycerides, 'mg/dL', triglyceridesStatus],
    ['bloodSugar', 'Blood Sugar', params.bloodSugar, 'mg/dL', bloodSugarStatus],
    ['hba1c', 'HbA1c', params.hba1c, '%', hba1cStatus],
    ['systolicBP', 'Systolic BP', params.systolicBP, 'mmHg', systolicStatus],
    ['diastolicBP', 'Diastolic BP', params.diastolicBP, 'mmHg', diastolicStatus],
    ['hemoglobin', 'Hemoglobin', params.hemoglobin, 'g/dL', () => 'info'],
    ['creatinine', 'Creatinine', params.creatinine, 'mg/dL', () => 'info'],
    ['bmi', 'BMI', params.bmi, 'kg/m2', () => 'info'],
    ['uricAcid', 'Uric Acid', params.uricAcid, 'mg/dL', () => 'info'],
    ['tsh', 'TSH', params.tsh, 'mIU/L', () => 'info'],
  ];

  return items
    .filter(([, , value]) => value !== null && value !== undefined && !Number.isNaN(value))
    .map(([, name, value, unit, statusFn]) => ({
      name,
      value: String(value),
      unit,
      status: statusFn(value),
    }));
}

function cholesterolStatus(v) {
  if (v < 200) return 'normal';
  if (v < 240) return 'borderline';
  return 'high';
}

function ldlStatus(v) {
  if (v < 100) return 'normal';
  if (v < 130) return 'borderline';
  return 'high';
}

function hdlStatus(v) {
  if (v >= 60) return 'normal';
  if (v >= 40) return 'borderline';
  return 'low';
}

function triglyceridesStatus(v) {
  if (v < 150) return 'normal';
  if (v < 200) return 'borderline';
  return 'high';
}

function bloodSugarStatus(v) {
  if (v < 100) return 'normal';
  if (v < 126) return 'borderline';
  return 'high';
}

function hba1cStatus(v) {
  if (v < 5.7) return 'normal';
  if (v < 6.5) return 'borderline';
  return 'high';
}

function systolicStatus(v) {
  if (v < 120) return 'normal';
  if (v < 130) return 'borderline';
  return 'high';
}

function diastolicStatus(v) {
  if (v < 80) return 'normal';
  if (v < 90) return 'borderline';
  return 'high';
}

module.exports = {
  extractParameters,
  paramsToList,
};
