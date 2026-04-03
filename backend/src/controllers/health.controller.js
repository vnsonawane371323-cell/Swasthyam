const { extractText } = require('../services/ocr.service.js');
const { extractParameters, paramsToList } = require('../services/extractor.service.js');
const { analyzeRisk } = require('../services/risk.service.js');
const { enrichWithAI, analyzeWithVision } = require('../services/ai.service.js');
const { buildResponse } = require('../services/response.service.js');

async function analyzeReport(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded. Send a report image or PDF.',
      });
    }

    const { buffer, mimetype } = req.file;

    let ocrText = '';
    let ocrFailed = false;

    try {
      ocrText = await extractText(buffer, mimetype);
    } catch (_err) {
      ocrFailed = true;
    }

    const hasEnoughText = (ocrText || '').trim().length >= 50;

    let ruleResult = null;
    let paramsList = [];

    if (hasEnoughText) {
      const params = extractParameters(ocrText);
      paramsList = paramsToList(params);
      ruleResult = analyzeRisk(params);
    }

    let aiResult = null;

    if ((!hasEnoughText || ocrFailed) && mimetype.startsWith('image/')) {
      aiResult = await analyzeWithVision(buffer, mimetype, ruleResult);
    } else if (ruleResult) {
      aiResult = await enrichWithAI(ocrText, ruleResult, paramsList);
    }

    const data = buildResponse(ruleResult, aiResult, paramsList);

    if (!data) {
      return res.status(422).json({
        success: false,
        message: 'Could not analyze the report. Please ensure it contains readable medical data.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Report analyzed successfully',
      data,
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = { analyzeReport };
