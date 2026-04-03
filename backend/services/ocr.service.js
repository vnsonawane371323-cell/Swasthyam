// src/services/ocr.service.js
// Tesseract.js for image OCR, pdf-parse for text-based PDFs.
// Images are preprocessed with jimp (grayscale + contrast) before OCR.

import Tesseract from "tesseract.js";
import pdfParse from "pdf-parse/lib/pdf-parse.js";
import Jimp from "jimp";

/**
 * Preprocess image buffer for better OCR accuracy:
 * - Convert to grayscale
 * - Increase contrast
 * - Upscale if small
 */
async function preprocessImage(buffer) {
  const img = await Jimp.read(buffer);

  img.greyscale().contrast(0.4);

  // Upscale if the image is smaller than 1200px wide (common with phone photos)
  if (img.bitmap.width < 1200) {
    img.scale(2);
  }

  return img.getBufferAsync(Jimp.MIME_PNG);
}

/**
 * Extract text from an image buffer using Tesseract.js.
 * @param {Buffer} buffer
 * @returns {Promise<string>}
 */
async function extractTextFromImage(buffer) {
  const processedBuffer = await preprocessImage(buffer);

  const { data } = await Tesseract.recognize(processedBuffer, "eng", {
    logger: () => {}, // suppress noisy progress logs
    tessedit_pageseg_mode: "6", // assume uniform block of text
  });

  return data.text.trim();
}

/**
 * Extract text from a PDF buffer.
 * Tries direct text extraction (fast, works for text-based PDFs).
 * Returns empty string for scanned/image PDFs — caller handles Vision fallback.
 * @param {Buffer} buffer
 * @returns {Promise<string>}
 */
async function extractTextFromPDF(buffer) {
  const result = await pdfParse(buffer);
  return result.text.trim();
}

/**
 * Main entry — routes to correct extractor based on MIME type.
 * @param {Buffer} buffer
 * @param {string} mimetype
 * @returns {Promise<string>}
 */
export async function extractText(buffer, mimetype) {
  if (mimetype === "application/pdf") {
    return extractTextFromPDF(buffer);
  }
  if (mimetype.startsWith("image/")) {
    return extractTextFromImage(buffer);
  }
  throw new Error(`Unsupported MIME type for OCR: ${mimetype}`);
}
