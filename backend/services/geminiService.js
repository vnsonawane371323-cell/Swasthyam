const axios = require('axios');
const fs = require('fs');
const path = require('path');

/**
 * Gemini AI Service
 * Handles integration with Google Gemini API for medical report analysis
 */

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

const MEDICAL_ANALYSIS_PROMPT = `You are an expert medical report analyzer with deep knowledge of laboratory tests, pathology, and clinical diagnosis.

Analyze the uploaded medical report image/document and extract ALL available health parameters into a structured JSON format.

CRITICAL RULES:
1. Extract ONLY numeric values - no units or text
2. Convert all measurements to standard international units (e.g., mg/dL for glucose)
3. If a parameter is not found or not visible, set it to null (NOT 0)
4. Return ONLY valid JSON, no markdown, no explanations
5. Do NOT include any text outside the JSON

STANDARD REFERENCE RANGES (for context):
- Cholesterol: <200 mg/dL (normal)
- HDL: >40 mg/dL (good)
- LDL: <130 mg/dL (normal)
- Triglycerides: <150 mg/dL (normal)
- Fasting Glucose: <100 mg/dL (normal)
- HbA1c: <5.7% (normal)
- ALT/AST: 7-56 U/L (normal)
- Hemoglobin: 12-16 g/dL (female), 13.5-17.5 g/dL (male)
- BMI: 18.5-24.9 (normal weight)

Return this exact JSON structure (fill with null if not found):

{
  "lipid_profile": {
    "total_cholesterol": null,
    "hdl": null,
    "ldl": null,
    "triglycerides": null
  },
  "diabetes": {
    "fasting_glucose": null,
    "postprandial_glucose": null,
    "hba1c": null
  },
  "liver_function": {
    "alt_sgpt": null,
    "ast_sgot": null,
    "bilirubin": null
  },
  "kidney_function": {
    "creatinine": null,
    "urea": null,
    "uric_acid": null
  },
  "nutrition": {
    "protein": null,
    "albumin": null
  },
  "cbc": {
    "hemoglobin": null,
    "rbc": null,
    "wbc": null,
    "platelets": null
  },
  "thyroid": {
    "t3": null,
    "t4": null,
    "tsh": null
  },
  "vitamins": {
    "vitamin_d": null,
    "vitamin_b12": null
  },
  "electrolytes": {
    "sodium": null,
    "potassium": null
  },
  "vitals": {
    "bmi": null,
    "weight": null
  }
}`;

/**
 * Convert file to base64
 */
const fileToBase64 = (filePath) => {
  const file = fs.readFileSync(filePath);
  return file.toString('base64');
};

/**
 * Determine media type from file extension
 */
const getMediaType = (fileName) => {
  const ext = path.extname(fileName).toLowerCase();
  if (['.jpg', '.jpeg'].includes(ext)) return 'image/jpeg';
  if (['.png'].includes(ext)) return 'image/png';
  if (['.gif'].includes(ext)) return 'image/gif';
  if (['.webp'].includes(ext)) return 'image/webp';
  if (['.pdf'].includes(ext)) return 'application/pdf';
  return 'image/jpeg'; // default
};

/**
 * Call Gemini API with image
 */
const analyzeReportWithGemini = async (filePath, fileName) => {
  try {
    const base64Data = fileToBase64(filePath);
    const mediaType = getMediaType(fileName);

    const payload = {
      contents: [
        {
          parts: [
            {
              text: MEDICAL_ANALYSIS_PROMPT,
            },
            {
              inline_data: {
                mime_type: mediaType,
                data: base64Data,
              },
            },
          ],
        },
      ],
    };

    const response = await axios.post(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });

    if (
      !response.data ||
      !response.data.candidates ||
      response.data.candidates.length === 0
    ) {
      throw new Error('No response from Gemini API');
    }

    let responseText = response.data.candidates[0].content.parts[0].text;

    // Clean up response - remove markdown code blocks if present
    responseText = responseText
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    // Parse JSON
    const extractedMetrics = JSON.parse(responseText);

    return extractedMetrics;
  } catch (error) {
    console.error('Gemini API Error:', error.message);
    throw new Error(`Failed to analyze report: ${error.message}`);
  }
};

module.exports = {
  analyzeReportWithGemini,
  fileToBase64,
  getMediaType,
};
