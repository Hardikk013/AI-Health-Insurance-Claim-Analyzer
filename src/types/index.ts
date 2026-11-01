// ClaimFight TypeScript Definitions

export type VerdictType = 'grounds_to_contest' | 'insurer_appears_correct' | 'unclear' | 'not_supported';

export type RejectionCategory = 
  | 'waiting_period' 
  | 'ped_exclusion' 
  | 'sub_limit_room_rent' 
  | 'hospitalisation_medical_necessity'
  | 'unsupported';

export type CaseStatus = 
  | 'pending' 
  | 'extracting' 
  | 'analyzing' 
  | 'rules_engine' 
  | 'completed' 
  | 'failed';

export type DocumentType = 'rejection_letter' | 'policy_document' | 'discharge_summary';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone_number?: string;
  analyses_today: number;
  last_analysis_date: string;
  consent_given: boolean;
  consent_timestamp?: string;
  custom_daily_limit?: number;
  is_admin_mode?: boolean;
}

export interface CaseDocument {
  id: string;
  case_id: string;
  doc_type: DocumentType;
  file_name: string;
  storage_path: string;
  mime_type: string;
  file_size: number;
  ocr_confidence: number;
  expires_at: string;
  created_at: string;
  preview_url?: string;
}

export interface PolicyClause {
  id: string;
  case_id: string;
  clause_heading: string;
  page_number: number;
  quote: string; // Under 25 words
  category: RejectionCategory | 'other';
}

export interface StatedRejectionReason {
  id: string;
  case_id: string;
  stated_reason: string;
  cited_clause: string;
  quoted_text: string;
  deducted_sub_amount?: number;
  rejection_category: RejectionCategory;
}

export interface ComparisonItem {
  id: string;
  case_id: string;
  rejection_reason_id?: string;
  category: RejectionCategory;
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
  contest_reason_plain: string; // 10th-grade reading level explanation
  missing_info?: string[];
  rules_applied?: {
    rule_code: string;
    rule_title: string;
    passed: boolean;
    explanation: string;
  }[];
}

export interface LetterPlaceholder {
  key: string;
  label: string;
  value: string;
  is_missing: boolean;
  hint?: string;
}

export interface GeneratedLetter {
  id: string;
  case_id: string;
  letter_type: 'grievance_appeal' | 'ombudsman_complaint';
  recipient_title: string;
  recipient_organization: string;
  subject: string;
  body: string;
  placeholders: LetterPlaceholder[];
  created_at: string;
  updated_at: string;
}

export interface OfficialRule {
  id: string;
  rule_code: string;
  title: string;
  summary: string;
  authority: string;
  source_url: string;
  last_verified: string;
  details?: Record<string, any>;
}

export interface ClaimCase {
  id: string;
  user_id: string;
  case_number: string;
  patient_name: string;
  insurer_name: string;
  tpa_name?: string;
  policy_number: string;
  claim_number: string;
  hospital_name: string;
  admission_date?: string;
  discharge_date?: string;
  claim_amount: number;
  approved_amount: number;
  deducted_amount: number;
  status: CaseStatus;
  overall_verdict: VerdictType;
  summary_plain?: string;
  is_sample: boolean;
  expires_at: string;
  created_at: string;
  updated_at: string;
  documents?: CaseDocument[];
  clauses?: PolicyClause[];
  rejection_reasons?: StatedRejectionReason[];
  comparisons?: ComparisonItem[];
  letters?: GeneratedLetter[];
}

export interface SampleCaseDefinition {
  id: string;
  title: string;
  subtitle: string;
  category: RejectionCategory;
  verdict: VerdictType;
  claimAmount: number;
  deductedAmount: number;
  patientName: string;
  insurerName: string;
  policyNumber: string;
  claimNumber: string;
  hospitalName: string;
  summary: string;
  files: {
    rejection_letter: { name: string; url: string; size: string };
    policy_document: { name: string; url: string; size: string };
    discharge_summary: { name: string; url: string; size: string };
  };
  analysis: {
    rejectionReasons: StatedRejectionReason[];
    clauses: PolicyClause[];
    comparisons: ComparisonItem[];
    letters: {
      appeal: { subject: string; body: string; placeholders: LetterPlaceholder[] };
      ombudsman?: { subject: string; body: string; placeholders: LetterPlaceholder[] };
    };
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
