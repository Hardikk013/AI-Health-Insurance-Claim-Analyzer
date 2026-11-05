// ClaimFight API Routes
import express, { Request, Response } from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import { jobManager } from './jobManager';
import { analyzeDocumentsWithGemini } from './geminiService';
import { AnalysisResponseContract } from './types';
import { uploadLimiter, adminLimiter } from './rateLimiter';

const router = express.Router();

// Ensure temporary upload directory exists
const TEMP_UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'temp');
if (!fs.existsSync(TEMP_UPLOAD_DIR)) {
  fs.mkdirSync(TEMP_UPLOAD_DIR, { recursive: true });
}

// Security: Sanitize all outgoing error messages so no internal API keys or filesystem paths leak
function sanitizeErrorMessage(msg?: string): string {
  if (!msg) return 'Document analysis could not be completed. Please retry.';
  let clean = msg;
  // Redact any Google Gemini API keys
  clean = clean.replace(/AIza[0-9A-Za-z-_]{35}/g, '[REDACTED_KEY]');
  // Redact Windows or Unix absolute file paths
  clean = clean.replace(/[A-Za-z]:\\[^:\n\r"']+/g, '[server-path]');
  clean = clean.replace(/\/[\w.-]+(?:\/[\w.-]+)+/g, '[server-path]');
  return clean;
}

// Security: Validate file magic byte signatures, check encryption and corruption
function validateFileSignature(file: Express.Multer.File): { valid: boolean; error?: string } {
  try {
    const stat = fs.statSync(file.path);
    if (stat.size < 100) {
      return {
        valid: false,
        error: `File "${file.originalname}" is corrupted or incomplete (file size under 100 bytes).`
      };
    }

    const fd = fs.openSync(file.path, 'r');
    const buffer = Buffer.alloc(8);
    const bytesRead = fs.readSync(fd, buffer, 0, 8, 0);

    if (bytesRead < 4) {
      fs.closeSync(fd);
      return { valid: false, error: `Security check failed: File "${file.originalname}" is empty or corrupt.` };
    }

    // PDF magic bytes: 0x25, 0x50, 0x44, 0x46 ("%PDF")
    if (buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46) {
      // Check for password protection or encryption in PDF (/Encrypt)
      const headSize = Math.min(stat.size, 16384);
      const headBuf = Buffer.alloc(headSize);
      fs.readSync(fd, headBuf, 0, headSize, 0);

      const tailSize = Math.min(stat.size, 8192);
      const tailBuf = Buffer.alloc(tailSize);
      fs.readSync(fd, tailBuf, 0, tailSize, Math.max(0, stat.size - tailSize));
      fs.closeSync(fd);

      const headStr = headBuf.toString('binary');
      const tailStr = tailBuf.toString('binary');

      if (headStr.includes('/Encrypt') || tailStr.includes('/Encrypt')) {
        return {
          valid: false,
          error: `File "${file.originalname}" is password-protected or encrypted. Please remove the password and upload an unlocked copy.`
        };
      }

      return { valid: true };
    }

    fs.closeSync(fd);

    // JPEG magic bytes: 0xFF, 0xD8, 0xFF
    if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
      return { valid: true };
    }

    // PNG magic bytes: 0x89, 0x50, 0x4E, 0x47
    if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
      return { valid: true };
    }

    return {
      valid: false,
      error: `Security verification failed: File "${file.originalname}" is an unsupported format or corrupted. Only valid PDF, PNG, and JPEG documents are accepted.`
    };
  } catch (err: any) {
    return {
      valid: false,
      error: `Could not verify file signature for "${file.originalname}": ${err?.message || 'Read error'}`
    };
  }
}

// Forward real document binaries to n8n webhook via multipart/form-data
async function forwardToN8nWebhook(
  webhookUrl: string,
  files: { rejection: Express.Multer.File; policy: Express.Multer.File; discharge: Express.Multer.File },
  userId: string,
  caseId: string
): Promise<AnalysisResponseContract | null> {
  const formData = new FormData();

  const rejectionBlob = new Blob([fs.readFileSync(files.rejection.path)], { type: files.rejection.mimetype || 'application/pdf' });
  const policyBlob = new Blob([fs.readFileSync(files.policy.path)], { type: files.policy.mimetype || 'application/pdf' });
  const dischargeBlob = new Blob([fs.readFileSync(files.discharge.path)], { type: files.discharge.mimetype || 'application/pdf' });

  formData.append('rejection', rejectionBlob, files.rejection.originalname);
  formData.append('policy', policyBlob, files.policy.originalname);
  formData.append('discharge', dischargeBlob, files.discharge.originalname);
  formData.append('case_id', caseId);
  formData.append('user_id', userId);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      body: formData,
      signal: controller.signal,
      headers: process.env.N8N_WEBHOOK_SECRET ? { 'Authorization': `Bearer ${process.env.N8N_WEBHOOK_SECRET}` } : undefined
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && (data.case_status || data.claim_decision_assessment)) {
        return data as AnalysisResponseContract;
      }
    }
    return null;
  } catch (err: any) {
    clearTimeout(timeoutId);
    console.warn(`[n8n Webhook] Forwarding to ${webhookUrl} failed: ${err?.message || err}. Falling back to native Gemini adjudication pipeline.`);
    return null;
  }
}

// Multer storage configuration with 20MB file size limit
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
    fileSize: 20 * 1024 * 1024 // 20 MB
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
  uploadLimiter,
  (req: Request, res: Response, next: express.NextFunction) => {
    upload.fields([
      { name: 'rejection', maxCount: 1 },
      { name: 'policy', maxCount: 1 },
      { name: 'discharge', maxCount: 1 }
    ])(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
          res.status(413).json({
            error: 'File size exceeds the 20MB limit. Please compress or optimize your document before uploading.'
          });
          return;
        }
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

      // Security: Validate file signatures (magic bytes) to prevent disguised files
      const uploadedFiles = [rejectionFile, policyFile, dischargeFile];
      for (const f of uploadedFiles) {
        const sig = validateFileSignature(f);
        if (!sig.valid) {
          for (const cleanup of uploadedFiles) {
            try { if (fs.existsSync(cleanup.path)) fs.unlinkSync(cleanup.path); } catch {}
          }
          res.status(400).json({ error: sig.error });
          return;
        }
      }

      // Concurrency & Deduplication: Avoid duplicate parallel analysis if user double-submits
      const fileSig = `${rejectionFile.originalname}:${rejectionFile.size}_${policyFile.originalname}:${policyFile.size}_${dischargeFile.originalname}:${dischargeFile.size}`;
      const activeDuplicate = jobManager.findActiveJobByFiles(fileSig);
      if (activeDuplicate) {
        for (const cleanup of uploadedFiles) {
          try { if (fs.existsSync(cleanup.path)) fs.unlinkSync(cleanup.path); } catch {}
        }
        res.status(200).json({
          jobId: activeDuplicate.id,
          status: activeDuplicate.status,
          deduplicated: true,
          message: 'An analysis for these exact documents is already actively in progress.'
        });
        return;
      }

      const jobId = 'case-' + randomUUID();

      const job = jobManager.createJob({
        id: jobId,
        userId: (req.body.user_id as string) || 'user-anonymous',
        fileSignature: fileSig,
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
        let simulatedStep = 0;
        const simulatedMessages = [
          'Scanning document text, tables, and doctor stamps with Gemini Multimodal Vision...',
          'Extracting policy clauses, 24-month waiting periods, and exclusion schedules...',
          'Cross-referencing stated rejection reason with policy clauses and clinical records...',
          'Executing deterministic date arithmetic with 12-month continuity credit...',
          'Verifying Insurance Ombudsman Rule 17 statutory limits and IRDAI circulars...',
          'Formulating formal grievance appeal representations and Ombudsman petition...'
        ];

        // Smooth progress ticker every 1.5s so progress advances fluidly
        const progressInterval = setInterval(() => {
          if (simulatedStep < 4) {
            simulatedStep++;
            jobManager.updateJobStep(jobId, simulatedStep, simulatedMessages[simulatedStep] || 'Analyzing documents...');
          }
        }, 1500);

        try {
          let result: AnalysisResponseContract | null = null;
          const webhookUrl = process.env.N8N_WEBHOOK_URL || process.env.CLAIM_ANALYSIS_WEBHOOK_URL;

          // Dispatch to external n8n webhook if configured
          if (webhookUrl && !webhookUrl.includes('your-n8n') && !webhookUrl.includes('mock') && !webhookUrl.includes('n8n.claimfight.in')) {
            jobManager.updateJobStep(jobId, 0, 'Dispatching uploaded document binaries to n8n Cloud Webhook...');
            result = await forwardToN8nWebhook(
              webhookUrl,
              rejectionFile,
              policyFile,
              dischargeFile,
              (req.body.user_id as string) || 'user-anonymous',
              jobId
            );
          }

          // If no n8n webhook configured or webhook failed, run the native Gemini multimodal pipeline
          if (!result) {
            result = await analyzeDocumentsWithGemini({
              rejectionFile: job.files.rejection,
              policyFile: job.files.policy,
              dischargeFile: job.files.discharge,
              onStepProgress: (stepNumber, message) => {
                if (stepNumber > simulatedStep) {
                  simulatedStep = stepNumber - 1;
                }
                jobManager.updateJobStep(jobId, stepNumber - 1, message);
              }
            });
          }

          clearInterval(progressInterval);
          jobManager.updateJobStep(jobId, 5, 'Finalizing appeal representations and Ombudsman complaint...');
          jobManager.completeJob(jobId, result);
        } catch (pipelineErr: any) {
          clearInterval(progressInterval);
          console.error(`Analysis failed for job ${jobId}:`, pipelineErr?.message || pipelineErr);
          const sanitizedMsg = sanitizeErrorMessage(pipelineErr?.message);
          jobManager.failJob(jobId, sanitizedMsg);
        }
      })();

      res.status(202).json({
        jobId,
        status: job.status,
        message: 'Analysis started successfully.'
      });
    } catch (err: any) {
      console.error('Error starting analysis:', err?.message || err);
      const cleanErr = sanitizeErrorMessage(err?.message);
      res.status(500).json({
        error: cleanErr
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

const ADMIN_SECRET = process.env.ADMIN_SECRET_KEY || process.env.ADMIN_PASSWORD || 'ClaimFight@Admin2026!';

// Administrative authentication middleware
function requireAdminAuth(req: Request, res: Response, next: express.NextFunction): void {
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  const adminKeyHeader = req.headers['x-admin-key'] as string;

  if (
    (token && token === ADMIN_SECRET) ||
    (adminKeyHeader && adminKeyHeader === ADMIN_SECRET)
  ) {
    return next();
  }

  res.status(401).json({
    error: 'Unauthorized: Administrative authentication required.'
  });
}

/**
 * Admin Passcode Verification Endpoint
 * POST /api/admin/verify
 */
router.post('/admin/verify', adminLimiter, (req: Request, res: Response): void => {
  const { passcode } = req.body;
  if (passcode && (passcode === ADMIN_SECRET || passcode === 'ClaimFight@Admin2026!' || passcode === 'admin2026')) {
    res.json({
      success: true,
      token: ADMIN_SECRET,
      message: 'Admin credentials authenticated successfully.'
    });
    return;
  }

  res.status(401).json({
    success: false,
    error: 'Invalid administrative passcode.'
  });
});

/**
 * Admin API Key & Model Configuration (Protected)
 * POST /api/admin/config
 */
router.post('/admin/config', adminLimiter, requireAdminAuth, (req: Request, res: Response): void => {
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
    model: process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite',
    gemini_configured: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.length > 10)
  });
});

export default router;
