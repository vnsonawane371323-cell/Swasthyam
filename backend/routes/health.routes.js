// src/routes/health.routes.js
import { Router } from "express";
import multer from "multer";
import { analyzeReport } from "../controllers/health.controller.js";

const router = Router();

// Store upload in memory — we process it immediately, never write to disk
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp", "application/pdf"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(Object.assign(new Error("Unsupported file type. Upload a JPG, PNG, or PDF."), { status: 400 }));
    }
  },
});

// POST /api/health/analyze-report
router.post("/analyze-report", upload.single("report"), analyzeReport);

export default router;

