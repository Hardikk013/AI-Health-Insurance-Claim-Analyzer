// ClaimFight Backend Types & Response Contract

export type CaseStatus = 
  | 'pending' 
  | 'extracting' 
  | 'analyzing' 
  | 'rules_engine' 
  | 'completed' 
  | 'failed';

export type ContestabilityStatus = 
  | 'contestable' 
  | 'potentially_contestable' 
  | 'insufficient_evidence' 
  | 'not_contestable';

export type VerdictType = 
  | 'grounds_to_contest' 
  | 'insurer_appears_correct' 
  | 'unclear' 
  | 'not_supported';

export interface DocumentComparisonItem {
  category: string;
  insurer_statement: string;
  insurer_quote?: string;
  insurer_doc_page?: number;
  policy_clause_heading: string;
  policy_page: number;
  policy_quote: string;
  medical_fact: string;
  discharge_summary_quote?: string;
  discharge_page?: number;
  verdict: VerdictType;
  contest_reason_plain: string;
  rules_applied?: Array<{
    rule_code: string;
    rule_title: string;
    passed: boolean;
    explanation: string;
  }>;
}

export interface AnalysisResponseContract {
  case_status: ContestabilityStatus;
  confidence: number;
  case_summary: string;
  insurer: string;
  policy_number: string;
  claim_number: string;
  patient_name?: string;
  hospital_name?: string;
  claim: {
    claimed_amount: number;
    approved_amount: number;
    deducted_amount: number;
    disputed_amount: number;
  };
  rejection_analysis: {
    reason: string;
    quoted_clause: string;
    policy_clause: string;
    finding: string;
    contestable: boolean;
  };
  policy_analysis: {
    waiting_period_days: number | null;
    applicable_exclusions: string[];
    room_rent_limit: string | null;
    co_payment: string | null;
    relevant_clauses: Array<{
      clause_heading: string;
      page_number: number;
      quote: string;
      category?: string;
    }>;
  };
  medical_facts: {
    diagnosis: string;
    procedure: string;
    admission_date: string;
    discharge_date: string;
  };
  date_verification: {
    policy_start_date: string | null;
    policy_end_date: string | null;
    hospitalization_date: string | null;
    active_policy_days: number | null;
    waiting_period_completed: boolean | null;
    calculation_explanation: string;
  };
  document_comparison: DocumentComparisonItem[];
  supporting_evidence: string[];
  contradictions: string[];
  missing_information: string[];
  warnings: string[];
  appeal: {
    subject: string;
    body: string;
  };
  ombudsman_complaint: {
    subject: string;
    body: string;
  };
}

export interface AnalysisProgressStep {
  step: number;
  name: string;
  description: string;
  status: 'idle' | 'running' | 'completed' | 'failed';
  estimatedSeconds: number;
  detailMessage?: string;
}

export interface AnalysisJob {
  id: string;
  userId?: string;
  status: CaseStatus;
  progressPercent: number;
  currentStepIndex: number;
  steps: AnalysisProgressStep[];
  result?: AnalysisResponseContract;
  error?: string;
  files: {
    rejection: { originalName: string; size: number; path: string; mimeType: string };
    policy: { originalName: string; size: number; path: string; mimeType: string };
    discharge: { originalName: string; size: number; path: string; mimeType: string };
  };
  createdAt: number;
  expiresAt: number;
}
