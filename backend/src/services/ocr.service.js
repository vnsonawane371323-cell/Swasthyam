const Tesseract = require('tesseract.js');
const pdfParse = require('pdf-parse');
const Jimp = require('jimp');

async function preprocessImage(buffer) {
  const image = await Jimp.read(buffer);

  image.greyscale().contrast(0.4);

  if (image.bitmap.width < 1200) {
    image.scale(2);
  }

  return image.getBufferAsync(Jimp.MIME_PNG);
}

async function extractTextFromImage(buffer) {
  const preprocessed = await preprocessImage(buffer);
  const { data } = await Tesseract.recognize(preprocessed, 'eng', {
    logger: () => {},
  });
  return (data?.text || '').trim();
}

async function extractTextFromPDF(buffer) {
  const result = await pdfParse(buffer);
  return (result?.text || '').trim();
}

async function extractText(buffer, mimetype) {
  if (mimetype === 'application/pdf') {
    return extractTextFromPDF(buffer);
  }

  if (mimetype.startsWith('image/')) {
    return extractTextFromImage(buffer);
  }

  throw new Error(`Unsupported MIME type for OCR: ${mimetype}`);
}

module.exports = {
  extractText,
};
