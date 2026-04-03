const express = require('express');
const multer = require('multer');
const { analyzeReport } = require('../controllers/health.controller.js');

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'application/pdf',
    ];

    if (allowed.includes(file.mimetype)) {
      cb(null, true);
      return;
    }

    cb(new Error('Unsupported file type. Only JPG, PNG, WEBP, and PDF are allowed.'));
  },
});

router.post('/analyze-report', upload.single('report'), analyzeReport);

module.exports = router;
