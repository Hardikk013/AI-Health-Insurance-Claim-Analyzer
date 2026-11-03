// Job Manager with Step Progression and 24-Hour Auto-Purge
import fs from 'fs';
import { AnalysisJob, AnalysisProgressStep, AnalysisResponseContract } from './types';

const INITIAL_STEPS: AnalysisProgressStep[] = [
  {
    step: 1,
    name: 'Gemini Multimodal Vision & OCR',
    description: 'Scanning uploaded documents with Gemini Multimodal Vision for text, page numbers, and clinical stamps',
    status: 'idle',
    estimatedSeconds: 12
  },
  {
    step: 2,
    name: 'Gemini Policy Clause Isolation',
    description: 'Extracting waiting periods, exclusions, sub-limits, and room rent terms under strict IRDAI guidelines',
    status: 'idle',
    estimatedSeconds: 15
  },
  {
    step: 3,
    name: 'Insurer Stated Grounds & Deductions',
    description: 'Extracting quoted lines, cited sections, and repudiated financial amounts from rejection letter',
    status: 'idle',
    estimatedSeconds: 14
  },
  {
    step: 4,
    name: 'Multi-Document Fact Correlation',
    description: 'Cross-referencing stated rejection reason with policy clauses and hospital discharge summary',
    status: 'idle',
    estimatedSeconds: 16
  },
  {
    step: 5,
    name: 'Deterministic Date & Rule Engine',
    description: 'Recomputing exact policy days active, waiting period thresholds, and IRDAI 2020 room-rent circulars',
    status: 'idle',
    estimatedSeconds: 8
  },
  {
    step: 6,
    name: 'Grievance Appeal & Ombudsman Drafting',
    description: 'Generating formal appellate representations with verified citations and highlighted blanks',
    status: 'idle',
    estimatedSeconds: 15
  }
];

class JobManager {
  private jobs: Map<string, AnalysisJob> = new Map();
  private purgeInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Run hourly auto-purge for 24-hour cleanup
    this.purgeInterval = setInterval(() => {
      this.purgeExpiredJobs();
    }, 60 * 60 * 1000);
  }

  public createJob(params: {
    id: string;
    userId?: string;
    files: {
      rejection: { originalName: string; size: number; path: string; mimeType: string };
      policy: { originalName: string; size: number; path: string; mimeType: string };
      discharge: { originalName: string; size: number; path: string; mimeType: string };
    };
  }): AnalysisJob {
    const now = Date.now();
    const job: AnalysisJob = {
      id: params.id,
      userId: params.userId,
      status: 'pending',
      progressPercent: 5,
      currentStepIndex: 0,
      steps: JSON.parse(JSON.stringify(INITIAL_STEPS)),
      files: params.files,
      createdAt: now,
      expiresAt: now + 24 * 60 * 60 * 1000 // 24 hours retention
    };

    this.jobs.set(params.id, job);
    return job;
  }

  public getJob(id: string): AnalysisJob | undefined {
    return this.jobs.get(id);
  }

  public updateJobStep(id: string, stepIndex: number, detailMessage: string): void {
    const job = this.jobs.get(id);
    if (!job) return;

    job.status = 'analyzing';
    job.currentStepIndex = stepIndex;

    // Mark previous steps as completed
    for (let i = 0; i < stepIndex; i++) {
      if (job.steps[i]) {
        job.steps[i].status = 'completed';
      }
    }

    if (job.steps[stepIndex]) {
      job.steps[stepIndex].status = 'running';
      job.steps[stepIndex].detailMessage = detailMessage;
    }

    job.progressPercent = Math.min(95, Math.round(((stepIndex + 0.5) / job.steps.length) * 100));
  }

  public completeJob(id: string, result: AnalysisResponseContract): void {
    const job = this.jobs.get(id);
    if (!job) return;

    job.status = 'completed';
    job.progressPercent = 100;
    job.currentStepIndex = job.steps.length - 1;

    for (const step of job.steps) {
      step.status = 'completed';
    }

    job.result = result;

    // Safely delete uploaded temporary files immediately after processing
    // while keeping the JSON analysis and draft letters
    this.cleanupJobFiles(job);
  }

  public failJob(id: string, errorMessage: string): void {
    const job = this.jobs.get(id);
    if (!job) return;

    job.status = 'failed';
    job.error = errorMessage;

    if (job.steps[job.currentStepIndex]) {
      job.steps[job.currentStepIndex].status = 'failed';
      job.steps[job.currentStepIndex].detailMessage = errorMessage;
    }

    this.cleanupJobFiles(job);
  }

  public deleteJob(id: string): boolean {
    const job = this.jobs.get(id);
    if (job) {
      this.cleanupJobFiles(job);
      return this.jobs.delete(id);
    }
    return false;
  }

  private cleanupJobFiles(job: AnalysisJob): void {
    const filePaths = [
      job.files.rejection?.path,
      job.files.policy?.path,
      job.files.discharge?.path
    ];

    for (const filePath of filePaths) {
      if (filePath && fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (err) {
          console.warn(`Could not delete temp file ${filePath}:`, err);
        }
      }
    }
  }

  public purgeExpiredJobs(): void {
    const now = Date.now();
    for (const [id, job] of this.jobs.entries()) {
      if (now > job.expiresAt) {
        this.cleanupJobFiles(job);
        this.jobs.delete(id);
      }
    }
  }
}

export const jobManager = new JobManager();
