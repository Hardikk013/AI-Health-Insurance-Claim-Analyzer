import { supabase, isSupabaseConfigured } from './supabase';
import { ClaimCase, CaseDocument, UserProfile, OfficialRule } from '../types';
import { OFFICIAL_RULES } from '../data/officialRules';
import { SAMPLE_CASES } from '../data/sampleCases';

const LOCAL_CASES_KEY = 'claimfight_saved_cases';
const LOCAL_USER_KEY = 'claimfight_user_profile';

export const getStoredUserProfile = (): UserProfile => {
  const stored = localStorage.getItem(LOCAL_USER_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      // Check if day changed to reset quota
      const today = new Date().toISOString().split('T')[0];
      if (parsed.last_analysis_date !== today) {
        parsed.analyses_today = 0;
        parsed.last_analysis_date = today;
        localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(parsed));
      }
      return parsed;
    } catch {
      // fallback
    }
  }

  const defaultProfile: UserProfile = {
    id: 'user-' + Math.random().toString(36).substring(2, 9),
    email: 'policyholder.demo@claimfight.in',
    full_name: 'Anil Kumar Sharma',
    phone_number: '+91 98765 43210',
    analyses_today: 0,
    last_analysis_date: new Date().toISOString().split('T')[0],
    consent_given: true,
    consent_timestamp: new Date().toISOString()
  };
  localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(defaultProfile));
  return defaultProfile;
};

export const updateUserProfile = (updates: Partial<UserProfile>): UserProfile => {
  const current = getStoredUserProfile();
  const updated = { ...current, ...updates };
  localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(updated));
  return updated;
};

export const fetchOfficialRules = async (): Promise<OfficialRule[]> => {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('official_rules')
        .select('*');
      if (!error && data && data.length > 0) {
        return data as OfficialRule[];
      }
    } catch (e) {
      console.warn('Supabase fetch failed, falling back to verified seed rules:', e);
    }
  }
  return OFFICIAL_RULES;
};

export const getSavedCases = (): ClaimCase[] => {
  const raw = localStorage.getItem(LOCAL_CASES_KEY);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch (e) {
      console.error('Failed to parse local cases:', e);
    }
  }

  // Pre-seed with one sample case so dashboard is never empty on first load!
  const firstSample = SAMPLE_CASES[0];
  const initialCase: ClaimCase = {
    id: firstSample.id,
    user_id: getStoredUserProfile().id,
    case_number: 'CF-2026-CAT89',
    patient_name: firstSample.patientName,
    insurer_name: firstSample.insurerName,
    policy_number: firstSample.policyNumber,
    claim_number: firstSample.claimNumber,
    hospital_name: firstSample.hospitalName,
    claim_amount: firstSample.claimAmount,
    approved_amount: 0,
    deducted_amount: firstSample.deductedAmount,
    status: 'completed',
    overall_verdict: firstSample.verdict,
    summary_plain: firstSample.summary,
    is_sample: true,
    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    documents: [
      {
        id: 'doc-1',
        case_id: firstSample.id,
        doc_type: 'rejection_letter',
        file_name: firstSample.files.rejection_letter.name,
        storage_path: firstSample.files.rejection_letter.url,
        mime_type: 'application/pdf',
        file_size: 1200000,
        ocr_confidence: 98.5,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString(),
        preview_url: firstSample.files.rejection_letter.url
      },
      {
        id: 'doc-2',
        case_id: firstSample.id,
        doc_type: 'policy_document',
        file_name: firstSample.files.policy_document.name,
        storage_path: firstSample.files.policy_document.url,
        mime_type: 'application/pdf',
        file_size: 3400000,
        ocr_confidence: 99.0,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString(),
        preview_url: firstSample.files.policy_document.url
      },
      {
        id: 'doc-3',
        case_id: firstSample.id,
        doc_type: 'discharge_summary',
        file_name: firstSample.files.discharge_summary.name,
        storage_path: firstSample.files.discharge_summary.url,
        mime_type: 'application/pdf',
        file_size: 850000,
        ocr_confidence: 96.0,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString(),
        preview_url: firstSample.files.discharge_summary.url
      }
    ],
    clauses: firstSample.analysis.clauses,
    rejection_reasons: firstSample.analysis.rejectionReasons,
    comparisons: firstSample.analysis.comparisons,
    letters: [
      {
        id: 'letter-appeal-1',
        case_id: firstSample.id,
        letter_type: 'grievance_appeal',
        recipient_title: 'The Grievance Redressal Officer',
        recipient_organization: firstSample.insurerName,
        subject: firstSample.analysis.letters.appeal.subject,
        body: firstSample.analysis.letters.appeal.body,
        placeholders: firstSample.analysis.letters.appeal.placeholders,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      ...(firstSample.analysis.letters.ombudsman ? [{
        id: 'letter-ombudsman-1',
        case_id: firstSample.id,
        letter_type: 'ombudsman_complaint' as const,
        recipient_title: 'The Insurance Ombudsman',
        recipient_organization: 'Council for Insurance Ombudsmen (Ahmedabad Centre)',
        subject: firstSample.analysis.letters.ombudsman.subject,
        body: firstSample.analysis.letters.ombudsman.body,
        placeholders: firstSample.analysis.letters.ombudsman.placeholders,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }] : [])
    ]
  };

  const initialList = [initialCase];
  localStorage.setItem(LOCAL_CASES_KEY, JSON.stringify(initialList));
  return initialList;
};

export const saveCase = (newCase: ClaimCase): void => {
  const cases = getSavedCases();
  const existingIdx = cases.findIndex(c => c.id === newCase.id);
  if (existingIdx >= 0) {
    cases[existingIdx] = newCase;
  } else {
    cases.unshift(newCase);
  }
  localStorage.setItem(LOCAL_CASES_KEY, JSON.stringify(cases));
};

export const deleteCaseById = (caseId: string): void => {
  const cases = getSavedCases().filter(c => c.id !== caseId);
  localStorage.setItem(LOCAL_CASES_KEY, JSON.stringify(cases));
};

export const purgeAllUserData = (): void => {
  localStorage.removeItem(LOCAL_CASES_KEY);
  const profile = getStoredUserProfile();
  profile.analyses_today = 0;
  localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(profile));
};

// ==============================================================================
// Admin Panel Management & Quota Overrides
// ==============================================================================
const ADMIN_AUTH_KEY = 'claimfight_admin_auth';
const ADMIN_MODE_KEY = 'claimfight_admin_unlimited_mode';
export const VALID_ADMIN_PINS = ['admin2026', 'admin', 'claimfight2026'];

export const isAdminAuthenticated = (): boolean => {
  return localStorage.getItem(ADMIN_AUTH_KEY) === 'true';
};

export const authenticateAdmin = (passcode: string): boolean => {
  if (VALID_ADMIN_PINS.includes(passcode.trim().toLowerCase())) {
    localStorage.setItem(ADMIN_AUTH_KEY, 'true');
    return true;
  }
  return false;
};

export const logoutAdmin = (): void => {
  localStorage.removeItem(ADMIN_AUTH_KEY);
};

export const isAdminMode = (): boolean => {
  return localStorage.getItem(ADMIN_MODE_KEY) === 'true' || getStoredUserProfile().is_admin_mode === true;
};

export const setAdminMode = (enabled: boolean): void => {
  localStorage.setItem(ADMIN_MODE_KEY, String(enabled));
  updateUserProfile({ is_admin_mode: enabled });
};

export const resetUserQuota = (): void => {
  const profile = getStoredUserProfile();
  profile.analyses_today = 0;
  localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(profile));
};

export const setUserQuotaLimit = (limit: number): void => {
  updateUserProfile({ custom_daily_limit: limit });
};

