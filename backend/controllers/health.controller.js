// src/controllers/health.controller.js
import { extractText } from "../services/ocr.service.js";
import { extractParameters, paramsToList } from "../services/extractor.service.js";
import { analyzeRisk } from "../services/risk.service.js";
import { enrichWithAI, analyzeWithVision } from "../services/ai.service.js";
import { buildResponse } from "../services/response.service.js";

/**
 * POST /api/health/analyze-report
 *
 * Pipeline:
 *  1. OCR  → extract raw text from image/PDF (Tesseract.js)
 *  2. NLP  → regex extract medical parameters
 *  3. Rules → deterministic risk engine (score, oil limit, flags)
 *  4. AI   → Claude enriches narrative + diet suggestions
 *             (Vision fallback if OCR yields < 50 chars)
 *  5. Merge → unified response matching TypeScript MedicalReportAnalysis interface
 */
export async function analyzeReport(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded. Send a report image or PDF." });
    }

    const { buffer, mimetype, originalname } = req.file;
    const userId = req.body.userId || "anonymous";

    console.log(`[analyzeReport] user=${userId} file=${originalname} type=${mimetype} size=${(buffer.length / 1024).toFixed(1)}KB`);

    // ── Step 1: OCR ───────────────────────────────────────────────────────────
    let ocrText = "";
    let ocrFailed = false;

    try {
      ocrText = await extractText(buffer, mimetype);
      console.log(`[OCR] Extracted ${ocrText.length} characters`);
    } catch (err) {
      console.warn("[OCR] Failed, will use Vision fallback:", err.message);
      ocrFailed = true;
    }

    const ocrSufficient = ocrText.trim().length >= 50;

    // ── Step 2: Parameter extraction ─────────────────────────────────────────
    let medicalParams = null;
    let paramsList = [];

    if (ocrSufficient) {
      medicalParams = extractParameters(ocrText);
      paramsList = paramsToList(medicalParams);
      console.log(`[Extractor] Found ${paramsList.length} parameters`);
    }

    // ── Step 3: Rule-based risk engine ────────────────────────────────────────
    let ruleResult = null;
    if (medicalParams) {
      ruleResult = analyzeRisk(medicalParams);
      console.log(`[RiskEngine] score=${ruleResult.healthScore} risk=${ruleResult.riskLevel}`);
    }

    // ── Step 4: AI enrichment / Vision fallback ───────────────────────────────
    let aiResult = null;

    if (!ocrSufficient || ocrFailed) {
      // Image OCR failed or text too short → send image directly to Claude Vision
      if (mimetype.startsWith("image/")) {
        console.log("[AI] Using Claude Vision (OCR insufficient)");
        aiResult = await analyzeWithVision(buffer, mimetype, ruleResult);
      }
    } else if (ruleResult) {
      // Normal path: enrich rule-based results with Claude
      console.log("[AI] Enriching rule results with Claude");
      aiResult = await enrichWithAI(ocrText, ruleResult, paramsList);
    }

    // ── Step 5: Build unified response ────────────────────────────────────────
    const data = buildResponse(ruleResult, aiResult, paramsList);

    if (!data) {
      return res.status(422).json({
        success: false,
        message: "Could not analyze the report. Please ensure it contains readable medical data.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Report analyzed successfully",
      data,
    });

  } catch (err) {
    next(err);
  }
}
