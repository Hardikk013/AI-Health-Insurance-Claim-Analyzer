import { create } from 'zustand';
import { ClaimCase, AnalysisProgressStep, SampleCaseDefinition } from '../types';
import { getSavedCases, saveCase, deleteCaseById } from '../services/api';
import { SAMPLE_CASES } from '../data/sampleCases';
import { ANALYSIS_STEPS, executeAnalysisPipeline } from '../services/n8nService';

interface CaseState {
  cases: ClaimCase[];
  activeCase: ClaimCase | null;
  activeSample: SampleCaseDefinition | null;
  pendingFiles: {
    rejection: File;
    policy: File;
    discharge: File;
  } | null;
  analysisSteps: AnalysisProgressStep[];
  currentStepIndex: number;
  analysisProgress: number;
  isAnalyzing: boolean;
  analysisError: string | null;
  
  // Actions
  loadCases: () => void;
  setActiveCase: (claimCase: ClaimCase | null) => void;
  setPendingFiles: (files: { rejection: File; policy: File; discharge: File } | null) => void;
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
  pendingFiles: null,
  analysisSteps: ANALYSIS_STEPS,
  currentStepIndex: 0,
  analysisProgress: 0,
  isAnalyzing: false,
  analysisError: null,

  setPendingFiles: (files) => {
    set({ pendingFiles: files });
  },

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
      approved_amount: sample.approvedAmount ?? (sample.claimAmount - sample.deductedAmount),
      rejected_amount: sample.rejectedAmount ?? (sample.deductedAmount === sample.claimAmount ? sample.claimAmount : 0),
      deducted_amount: sample.deductedAmount,
      disputed_amount: sample.disputedAmount ?? sample.deductedAmount,
      date_verification: sample.id === 'case-waiting-period-cataract' ? {
        policy_start_date: '2025-01-01',
        policy_end_date: '2026-12-31',
        hospitalization_date: '2026-08-02',
        active_policy_days: 578,
        standard_waiting_period_days: 730,
        continuity_credit_months: 12,
        continuity_credit_days: 365,
        continuity_credit_verified: false,
        remaining_waiting_period_days: 365,
        waiting_period_completed: true,
        calculation_explanation: 'Current policy tenure is 578 active days (~19 months) from inception (01 January 2025) to admission (02 August 2026). Without continuity credit, 152 days would remain under the standard 24-month exclusion. However, with the recorded 12-month continuity credit, the required waiting period is reduced to 12 months (365 days). Because actual tenure of 578 days exceeds the remaining 365 days, the waiting period appears to have elapsed. NOTE: Continuity credit is not automatically valid without verification. The previous insurer\'s portability certificate or renewal schedule must be enclosed.',
        missing_portability_documents: [
          'Portability Certificate / Previous Policy Schedule confirming 12-month continuity credit (Required to substantiate continuity benefit under IRDAI Portability Guidelines)'
        ]
      } : undefined,
      ombudsman_verification: {
        relief_sought_amount: sample.disputedAmount ?? sample.deductedAmount,
        statutory_award_limit: 3000000,
        is_within_award_limit: (sample.disputedAmount ?? sample.deductedAmount) <= 3000000,
        gro_representation_required: true,
        thirty_day_wait_required: true,
        one_year_limitation_verified: true,
        no_concurrent_court_litigation: true,
        official_citation: 'Rule 17(1) & Rule 14(3), Insurance Ombudsman Rules, 2017 (Amended 2021)',
        last_verified: '2026-11-01',
        rule_explanation: 'The relief sought is within the Insurance Ombudsman\'s maximum statutory award limit of ₹30,00,000 under Rule 17(1).'
      },
      missing_information: sample.id === 'case-waiting-period-cataract' ? [
        'Portability Certificate / Previous Policy Schedule confirming 12-month continuity credit'
      ] : [],
      warnings: sample.id === 'case-waiting-period-cataract' ? [
        'Portability certificate missing: recorded continuity credit must be verified with prior policy schedule.'
      ] : [],
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
      const filesToAnalyze = get().pendingFiles || params.files;
      const completedCase = await executeAnalysisPipeline({
        caseId,
        files: filesToAnalyze,
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
        analysisProgress: 100,
        pendingFiles: null
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
