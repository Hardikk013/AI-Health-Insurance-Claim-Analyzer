// ClaimFight API Routes
import express, { Request, Response } from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { jobManager } from './jobManager';
import { analyzeDocumentsWithGemini } from './geminiService';

const router = express.Router();

// Ensure temporary upload directory exists
const TEMP_UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'temp');
if (!fs.existsSync(TEMP_UPLOAD_DIR)) {
  fs.mkdirSync(TEMP_UPLOAD_DIR, { recursive: true });
}

// Multer storage configuration with 15MB file size limit
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, TEMP_UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase() || '.bin';
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 15 * 1024 * 1024 // 15 MB
  },
  fileFilter: (_req, file, cb) => {
    const allowedMimes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    const allowedExts = ['.pdf', '.jpg', '.jpeg', '.png'];
    const ext = path.extname(file.originalname).toLowerCase();

    if (allowedMimes.includes(file.mimetype) || allowedExts.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.originalname}. Only PDF, JPG, and PNG are accepted.`));
    }
  }
});

/**
 * Health check endpoint
 * GET /api/health
 */
router.get('/health', (_req: Request, res: Response) => {
  const apiKey = process.env.GEMINI_API_KEY || '';
  const isConfigured = Boolean(apiKey && apiKey.trim().length > 10 && !apiKey.includes('your-gemini'));
  
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    gemini_configured: isConfigured,
    model: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
    version: '1.0.0'
  });
});

/**
 * Analyze 3 documents
 * POST /api/cases/analyze
 */
router.post(
  '/cases/analyze',
  (req: Request, res: Response, next: express.NextFunction) => {
    upload.fields([
      { name: 'rejection', maxCount: 1 },
      { name: 'policy', maxCount: 1 },
      { name: 'discharge', maxCount: 1 }
    ])(req, res, (err) => {
      if (err) {
        res.status(400).json({ error: err.message || 'File upload error' });
        return;
      }
      next();
    });
  },
  async (req: Request, res: Response): Promise<void> => {
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;

      if (!files || !files.rejection?.[0] || !files.policy?.[0] || !files.discharge?.[0]) {
        res.status(400).json({
          error: 'Please upload all three required documents: rejection letter, policy document, and hospital discharge summary.'
        });
        return;
      }

      const rejectionFile = files.rejection[0];
      const policyFile = files.policy[0];
      const dischargeFile = files.discharge[0];

      const jobId = 'case-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 7);

      const job = jobManager.createJob({
        id: jobId,
        userId: (req.body.user_id as string) || 'user-anonymous',
        files: {
          rejection: {
            originalName: rejectionFile.originalname,
            size: rejectionFile.size,
            path: rejectionFile.path,
            mimeType: rejectionFile.mimetype || 'application/pdf'
          },
          policy: {
            originalName: policyFile.originalname,
            size: policyFile.size,
            path: policyFile.path,
            mimeType: policyFile.mimetype || 'application/pdf'
          },
          discharge: {
            originalName: dischargeFile.originalname,
            size: dischargeFile.size,
            path: dischargeFile.path,
            mimeType: dischargeFile.mimetype || 'application/pdf'
          }
        }
      });

      // Start asynchronous analysis pipeline
      (async () => {
        try {
          const result = await analyzeDocumentsWithGemini({
            rejectionFile: job.files.rejection,
            policyFile: job.files.policy,
            dischargeFile: job.files.discharge,
            onStepProgress: (stepNumber, message) => {
              jobManager.updateJobStep(jobId, stepNumber - 1, message);
            }
          });

          jobManager.completeJob(jobId, result);
        } catch (pipelineErr: any) {
          console.error(`Analysis failed for job ${jobId}:`, pipelineErr);
          jobManager.failJob(jobId, pipelineErr?.message || 'Gemini document analysis failed.');
        }
      })();

      res.status(202).json({
        jobId,
        status: job.status,
        message: 'Analysis started successfully.'
      });
    } catch (err: any) {
      console.error('Error starting analysis:', err);
      res.status(500).json({
        error: err?.message || 'Server error starting analysis.'
      });
    }
  }
);

/**
 * Check analysis progress status
 * GET /api/cases/:id/status
 */
router.get('/cases/:id/status', (req: Request, res: Response): void => {
  const jobId = req.params.id;
  const job = jobManager.getJob(jobId);

  if (!job) {
    res.status(404).json({ error: `Job with ID ${jobId} not found or expired.` });
    return;
  }

  res.json({
    id: job.id,
    status: job.status,
    progressPercent: job.progressPercent,
    currentStepIndex: job.currentStepIndex,
    steps: job.steps,
    error: job.error || null,
    expiresAt: new Date(job.expiresAt).toISOString()
  });
});

/**
 * Get analysis result
 * GET /api/cases/:id/result
 */
router.get('/cases/:id/result', (req: Request, res: Response): void => {
  const jobId = req.params.id;
  const job = jobManager.getJob(jobId);

  if (!job) {
    res.status(404).json({ error: `Job with ID ${jobId} not found or expired.` });
    return;
  }

  if (job.status === 'failed') {
    res.status(500).json({
      id: job.id,
      status: job.status,
      error: job.error || 'Analysis failed. Please check Gemini API configuration and retry.'
    });
    return;
  }

  if (job.status !== 'completed' || !job.result) {
    res.status(202).json({
      id: job.id,
      status: job.status,
      progressPercent: job.progressPercent,
      message: 'Analysis is still in progress.'
    });
    return;
  }

  res.json({
    id: job.id,
    status: job.status,
    result: job.result
  });
});

/**
 * Refine Grievance Appeal Letter
 * POST /api/cases/:id/appeal
 */
router.post('/cases/:id/appeal', (req: Request, res: Response): void => {
  const jobId = req.params.id;
  const job = jobManager.getJob(jobId);

  if (!job || !job.result) {
    res.status(404).json({ error: 'Case analysis not found.' });
    return;
  }

  const { customNotes, customSubject } = req.body;
  if (customSubject) {
    job.result.appeal.subject = customSubject;
  }
  if (customNotes) {
    job.result.appeal.body += `\n\nADDITIONAL POLICYHOLDER SUBMISSIONS:\n${customNotes}`;
  }

  res.json({
    appeal: job.result.appeal
  });
});

/**
 * Refine Ombudsman Complaint Letter
 * POST /api/cases/:id/ombudsman
 */
router.post('/cases/:id/ombudsman', (req: Request, res: Response): void => {
  const jobId = req.params.id;
  const job = jobManager.getJob(jobId);

  if (!job || !job.result) {
    res.status(404).json({ error: 'Case analysis not found.' });
    return;
  }

  const { customFacts, customRelief } = req.body;
  if (customRelief) {
    job.result.ombudsman_complaint.body += `\n\nRELIEF SOUGHT BY COMPLAINANT:\n${customRelief}`;
  }
  if (customFacts) {
    job.result.ombudsman_complaint.body += `\n\nFURTHER FACTUAL CLARIFICATIONS:\n${customFacts}`;
  }

  res.json({
    ombudsman_complaint: job.result.ombudsman_complaint
  });
});

/**
 * Admin API Key & Model Configuration
 * POST /api/admin/config
 */
router.post('/admin/config', (req: Request, res: Response): void => {
  const { apiKey, model } = req.body;

  if (apiKey && typeof apiKey === 'string') {
    process.env.GEMINI_API_KEY = apiKey.trim();
  }
  if (model && typeof model === 'string') {
    process.env.GEMINI_MODEL = model.trim();
  }

  res.json({
    success: true,
    message: 'Backend Gemini configuration updated successfully.',
    model: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
    gemini_configured: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.length > 10)
  });
});

export default router;
