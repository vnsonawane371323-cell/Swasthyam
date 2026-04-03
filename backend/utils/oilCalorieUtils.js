/**
 * Round any numeric value to 2 decimals using the project standard.
 * @param {number} value
 * @returns {number}
 */
function round2(value) {
  return parseFloat((Number(value) || 0).toFixed(2));
}

/**
 * Daily oil calorie budget.
 * Formula: allowedOilKcal = bmr * activityFactor * 0.07
 * Shorthand sometimes referenced: (bmr * activityFactor) / 16 (approximation)
 * @param {number} bmr
 * @param {number} activityFactor
 * @returns {number}
 */
function getAllowedOilKcal(bmr, activityFactor) {
  return round2((Number(bmr) || 0) * (Number(activityFactor) || 0) * 0.07);
}

/**
 * Raw calories from consumed oil.
 * Formula: rawKcal = oilAmountGrams * 9
 * @param {number} oilAmountGrams
 * @returns {number}
 */
function getRawOilKcal(oilAmountGrams) {
  return round2((Number(oilAmountGrams) || 0) * 9);
}

/**
 * Quality adjustment multiplier from fatty-acid composition.
 * Formulas:
 * harmScore   = 0.35*sfa + 0.40*tfa + 0.25*pufa
 * swasthIndex = 100 - harmScore
 * multiplier  = 1 + k*(harmScore/100)
 * @param {number} sfaPercent
 * @param {number} tfaPercent
 * @param {number} pufaPercent
 * @param {number} [k=0.2]
 * @returns {{harmScore:number,swasthIndex:number,multiplier:number}}
 */
function getMultiplier(sfaPercent, tfaPercent, pufaPercent, k = 0.2) {
  const sfa = Number(sfaPercent) || 0;
  const tfa = Number(tfaPercent) || 0;
  const pufa = Number(pufaPercent) || 0;
  const harmScore = 0.35 * sfa + 0.40 * tfa + 0.25 * pufa;
  const swasthIndex = 100 - harmScore;
  const multiplier = 1 + (Number(k) || 0.2) * (harmScore / 100);

  return {
    harmScore: round2(harmScore),
    swasthIndex: round2(swasthIndex),
    multiplier: round2(multiplier)
  };
}

/**
 * Quality-adjusted oil calories.
 * Formula: effectiveKcal = rawKcal * multiplier
 * @param {number} rawKcal
 * @param {number} multiplier
 * @returns {number}
 */
function getEffectiveKcal(rawKcal, multiplier) {
  return round2((Number(rawKcal) || 0) * (Number(multiplier) || 0));
}

module.exports = {
  getAllowedOilKcal,
  getRawOilKcal,
  getMultiplier,
  getEffectiveKcal
};