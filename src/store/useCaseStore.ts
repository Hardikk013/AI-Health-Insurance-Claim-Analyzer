import { create } from 'zustand';
import { ClaimCase, AnalysisProgressStep, SampleCaseDefinition } from '../types';
import { getSavedCases, saveCase, deleteCaseById } from '../services/api';
import { SAMPLE_CASES } from '../data/sampleCases';
import { ANALYSIS_STEPS, executeAnalysisPipeline } from '../services/n8nService';

interface CaseState {
  cases: ClaimCase[];
  activeCase: ClaimCase | null;
  activeSample: SampleCaseDefinition | null;
  analysisSteps: AnalysisProgressStep[];
  currentStepIndex: number;
  analysisProgress: number;
  isAnalyzing: boolean;
  analysisError: string | null;
  
  // Actions
  loadCases: () => void;
  setActiveCase: (claimCase: ClaimCase | null) => void;
  loadSampleCase: (sampleId: string) => ClaimCase;
  runAnalysis: (params: {
    files: {
      rejection: File | { name: string; size: number };
      policy: File | { name: string; size: number };
      discharge: File | { name: string; size: number };
    };
    sampleId?: string;
  }) => Promise<ClaimCase>;
  deleteCase: (caseId: string) => void;
  updateLetterPlaceholder: (letterId: string, placeholderKey: string, newValue: string) => void;
  updateLetterBody: (letterId: string, newBody: string) => void;
}

export const useCaseStore = create<CaseState>((set, get) => ({
  cases: getSavedCases(),
  activeCase: getSavedCases()[0] || null,
  activeSample: SAMPLE_CASES[0],
  analysisSteps: ANALYSIS_STEPS,
  currentStepIndex: 0,
  analysisProgress: 0,
  isAnalyzing: false,
  analysisError: null,

  loadCases: () => {
    const list = getSavedCases();
    set({ cases: list });
    if (!get().activeCase && list.length > 0) {
      set({ activeCase: list[0] });
    }
  },

  setActiveCase: (claimCase) => {
    set({ activeCase: claimCase });
  },

  loadSampleCase: (sampleId: string): ClaimCase => {
    const sample = SAMPLE_CASES.find(s => s.id === sampleId) || SAMPLE_CASES[0];
    set({ activeSample: sample });

    // Convert sample to ClaimCase
    const claimCase: ClaimCase = {
      id: sample.id,
      user_id: 'user-demo',
      case_number: `CF-2026-${sample.id.substring(5, 11).toUpperCase()}`,
      patient_name: sample.patientName,
      insurer_name: sample.insurerName,
      policy_number: sample.policyNumber,
      claim_number: sample.claimNumber,
      hospital_name: sample.hospitalName,
      claim_amount: sample.claimAmount,
      approved_amount: sample.claimAmount - sample.deductedAmount,
      deducted_amount: sample.deductedAmount,
      status: 'completed',
      overall_verdict: sample.verdict,
      summary_plain: sample.summary,
      is_sample: true,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      documents: [
        {
          id: 'doc-s1',
          case_id: sample.id,
          doc_type: 'rejection_letter',
          file_name: sample.files.rejection_letter.name,
          storage_path: sample.files.rejection_letter.url,
          mime_type: 'application/pdf',
          file_size: 1100000,
          ocr_confidence: 98.8,
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          created_at: new Date().toISOString(),
          preview_url: sample.files.rejection_letter.url
        },
        {
          id: 'doc-s2',
          case_id: sample.id,
          doc_type: 'policy_document',
          file_name: sample.files.policy_document.name,
          storage_path: sample.files.policy_document.url,
          mime_type: 'application/pdf',
          file_size: 3200000,
          ocr_confidence: 99.1,
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          created_at: new Date().toISOString(),
          preview_url: sample.files.policy_document.url
        },
        {
          id: 'doc-s3',
          case_id: sample.id,
          doc_type: 'discharge_summary',
          file_name: sample.files.discharge_summary.name,
          storage_path: sample.files.discharge_summary.url,
          mime_type: 'application/pdf',
          file_size: 890000,
          ocr_confidence: 97.4,
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          created_at: new Date().toISOString(),
          preview_url: sample.files.discharge_summary.url
        }
      ],
      clauses: sample.analysis.clauses,
      rejection_reasons: sample.analysis.rejectionReasons,
      comparisons: sample.analysis.comparisons,
      letters: [
        {
          id: 'letter-appeal-' + sample.id,
          case_id: sample.id,
          letter_type: 'grievance_appeal',
          recipient_title: 'The Grievance Redressal Officer',
          recipient_organization: sample.insurerName,
          subject: sample.analysis.letters.appeal.subject,
          body: sample.analysis.letters.appeal.body,
          placeholders: sample.analysis.letters.appeal.placeholders,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        ...(sample.analysis.letters.ombudsman ? [{
          id: 'letter-ombudsman-' + sample.id,
          case_id: sample.id,
          letter_type: 'ombudsman_complaint' as const,
          recipient_title: 'The Hon\'ble Insurance Ombudsman',
          recipient_organization: 'Council for Insurance Ombudsmen',
          subject: sample.analysis.letters.ombudsman.subject,
          body: sample.analysis.letters.ombudsman.body,
          placeholders: sample.analysis.letters.ombudsman.placeholders || [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }] : [])
      ]
    };

    saveCase(claimCase);
    get().loadCases();
    set({ activeCase: claimCase });
    return claimCase;
  },

  runAnalysis: async (params) => {
    const caseId = 'case-' + Math.random().toString(36).substring(2, 9);
    set({
      isAnalyzing: true,
      analysisError: null,
      analysisProgress: 5,
      currentStepIndex: 0
    });

    try {
      const completedCase = await executeAnalysisPipeline({
        caseId,
        files: params.files,
        sampleId: params.sampleId,
        onStepUpdate: (steps, activeIdx, progress) => {
          set({
            analysisSteps: steps,
            currentStepIndex: activeIdx,
            analysisProgress: progress
          });
        }
      });

      get().loadCases();
      set({
        activeCase: completedCase,
        isAnalyzing: false,
        analysisProgress: 100
      });
      return completedCase;
    } catch (err: any) {
      set({
        isAnalyzing: false,
        analysisError: err?.message || 'Analysis encountered an error. Please retry.'
      });
      throw err;
    }
  },

  deleteCase: (caseId: string) => {
    deleteCaseById(caseId);
    get().loadCases();
    const remaining = get().cases;
    set({ activeCase: remaining[0] || null });
  },

  updateLetterPlaceholder: (letterId: string, placeholderKey: string, newValue: string) => {
    const activeCase = get().activeCase;
    if (!activeCase || !activeCase.letters) return;

    const letter = activeCase.letters.find(l => l.id === letterId);
    if (!letter) return;

    // Update placeholder
    const ph = letter.placeholders.find(p => p.key === placeholderKey);
    if (ph) {
      const oldValue = ph.value;
      ph.value = newValue;
      ph.is_missing = false;
      // Also replace in letter body
      if (letter.body.includes(oldValue)) {
        letter.body = letter.body.replace(new RegExp(oldValue, 'g'), newValue);
      }
    }

    saveCase(activeCase);
    set({ activeCase: { ...activeCase } });
  },

  updateLetterBody: (letterId: string, newBody: string) => {
    const activeCase = get().activeCase;
    if (!activeCase || !activeCase.letters) return;

    const letter = activeCase.letters.find(l => l.id === letterId);
    if (letter) {
      letter.body = newBody;
      letter.updated_at = new Date().toISOString();
      saveCase(activeCase);
      set({ activeCase: { ...activeCase } });
    }
  }
}));
