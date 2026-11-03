// Deterministic Date, Financial & Regulatory Rule Engine for ClaimFight Backend

export interface DateVerificationResult {
  policy_start_date: string | null;
  policy_end_date: string | null;
  hospitalization_date: string | null;
  active_policy_days: number | null;
  waiting_period_completed: boolean | null;
  calculation_explanation: string;
}

export interface FinancialVerificationResult {
  claimed_amount: number;
  approved_amount: number;
  deducted_amount: number;
  disputed_amount: number;
  is_math_consistent: boolean;
  notes: string[];
}

export interface RuleApplied {
  rule_code: string;
  rule_title: string;
  passed: boolean;
  explanation: string;
}

export function parseFlexibleDate(dateStr: string | null | undefined): Date | null {
  if (!dateStr) return null;
  const clean = dateStr.trim();
  
  // Try standard parse
  const direct = new Date(clean);
  if (!isNaN(direct.getTime()) && direct.getFullYear() > 1990) {
    return direct;
  }

  // Try DD-MM-YYYY or DD/MM/YYYY or DD-MMM-YYYY
  const parts = clean.split(/[-/.\s]+/);
  if (parts.length >= 3) {
    // If year is the first part (YYYY-MM-DD)
    if (parts[0].length === 4) {
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      const d = parseInt(parts[2], 10);
      const res = new Date(y, m, d);
      if (!isNaN(res.getTime())) return res;
    }
    
    // If year is the 3rd part (DD-MM-YYYY)
    if (parts[2].length === 4) {
      const d = parseInt(parts[0], 10);
      let m = parseInt(parts[1], 10) - 1;
      // Check named months
      const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
      const monthMatch = monthNames.findIndex(mn => parts[1].toLowerCase().startsWith(mn));
      if (monthMatch !== -1) {
        m = monthMatch;
      }
      const y = parseInt(parts[2], 10);
      const res = new Date(y, m, d);
      if (!isNaN(res.getTime())) return res;
    }
  }

  return null;
}

export function verifyDatesDeterministically(
  policyStartStr: string | null | undefined,
  hospitalizationStr: string | null | undefined,
  policyEndStr: string | null | undefined,
  waitingPeriodDays: number | null | undefined
): DateVerificationResult {
  const startDate = parseFlexibleDate(policyStartStr);
  const hospDate = parseFlexibleDate(hospitalizationStr);
  const endDate = parseFlexibleDate(policyEndStr);

  if (!startDate || !hospDate) {
    return {
      policy_start_date: policyStartStr || null,
      policy_end_date: policyEndStr || null,
      hospitalization_date: hospitalizationStr || null,
      active_policy_days: null,
      waiting_period_completed: null,
      calculation_explanation: 'Could not deterministically parse exact inception or admission timestamp from document text.'
    };
  }

  const diffTime = hospDate.getTime() - startDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const diffMonths = Math.floor(diffDays / 30.4375);

  const thresholdDays = waitingPeriodDays && waitingPeriodDays > 0 ? waitingPeriodDays : 730; // default 24 months = 730 days
  const thresholdMonths = Math.round(thresholdDays / 30.4375);

  let completed: boolean | null = null;
  let explanation = '';

  if (diffDays < 0) {
    completed = false;
    explanation = `Inconsistency detected: Admission date (${hospDate.toISOString().slice(0, 10)}) is prior to policy inception date (${startDate.toISOString().slice(0, 10)}).`;
  } else if (diffDays >= thresholdDays) {
    completed = true;
    explanation = `Policy was continuously active for ${diffDays} calendar days (~${diffMonths} months) between inception (${startDate.toISOString().slice(0, 10)}) and hospitalization (${hospDate.toISOString().slice(0, 10)}). This exceeds the stipulated ${thresholdDays}-day (~${thresholdMonths}-month) waiting period threshold. The waiting period had completely elapsed.`;
  } else {
    completed = false;
    explanation = `Policy was active for ${diffDays} calendar days (~${diffMonths} months) between inception (${startDate.toISOString().slice(0, 10)}) and hospitalization (${hospDate.toISOString().slice(0, 10)}), which is less than the ${thresholdDays}-day (~${thresholdMonths}-month) threshold.`;
  }

  return {
    policy_start_date: startDate.toISOString().slice(0, 10),
    policy_end_date: endDate ? endDate.toISOString().slice(0, 10) : null,
    hospitalization_date: hospDate.toISOString().slice(0, 10),
    active_policy_days: diffDays >= 0 ? diffDays : 0,
    waiting_period_completed: completed,
    calculation_explanation: explanation
  };
}

export function verifyFinancialsDeterministically(
  claimedAmount: number,
  approvedAmount: number,
  deductedAmount: number,
  disputedAmount?: number
): FinancialVerificationResult {
  const claimed = Number(claimedAmount) || 0;
  const approved = Number(approvedAmount) || 0;
  let deducted = Number(deductedAmount) || 0;

  const notes: string[] = [];

  // Recompute actual arithmetic difference
  const mathDeducted = Math.max(0, claimed - approved);
  if (deducted === 0 && mathDeducted > 0) {
    deducted = mathDeducted;
    notes.push(`Deducted amount calculated as Claimed (₹${claimed}) - Approved (₹${approved}) = ₹${deducted}`);
  } else if (Math.abs(mathDeducted - deducted) > 1) {
    notes.push(`Discrepancy in insurer numbers: Claimed (₹${claimed}) - Approved (₹${approved}) = ₹${mathDeducted}, but stated deduction was ₹${deducted}.`);
  }

  const finalDisputed = disputedAmount && disputedAmount > 0 ? disputedAmount : deducted;

  return {
    claimed_amount: claimed,
    approved_amount: approved,
    deducted_amount: deducted,
    disputed_amount: finalDisputed,
    is_math_consistent: Math.abs(claimed - (approved + deducted)) < 5,
    notes
  };
}

export function applyStatutoryRules(params: {
  category: string;
  activePolicyDays: number | null;
  waitingPeriodCompleted: boolean | null;
  claimedAmount: number;
  deductedAmount: number;
  diagnosis?: string;
  procedure?: string;
  rejectionReason?: string;
}): RuleApplied[] {
  const rules: RuleApplied[] = [];

  // 1. Waiting period deterministic check
  if (params.category === 'waiting_period' && params.activePolicyDays !== null) {
    if (params.waitingPeriodCompleted === true) {
      rules.push({
        rule_code: 'IRDAI_WAITING_PERIOD_ELAPSED',
        rule_title: 'Waiting Period Completion Verification',
        passed: true,
        explanation: `Deterministic date calculation confirms coverage duration of ${params.activePolicyDays} continuous active days prior to admission. The statutory/policy exclusion window has fully expired.`
      });
    } else {
      rules.push({
        rule_code: 'IRDAI_WAITING_PERIOD_ACTIVE',
        rule_title: 'Waiting Period Active Status',
        passed: false,
        explanation: `Deterministic date calculation confirms policy was active for only ${params.activePolicyDays} days, which is within the unexpired exclusion window.`
      });
    }
  }

  // 2. 60-month Moratorium Rule (IRDAI Master Circular 2024)
  if (params.activePolicyDays !== null && params.activePolicyDays >= 1825) { // 5 years = 1825 days
    rules.push({
      rule_code: 'IRDAI_MORATORIUM_60_MONTHS',
      rule_title: 'IRDAI 60-Month Moratorium Period Rule',
      passed: true,
      explanation: 'Under the IRDAI Master Circular (2024), after 60 continuous months of coverage, no health insurance policy or claim can be questioned or repudiated on grounds of non-disclosure or pre-existing condition, except in cases of proven deliberate fraud.'
    });
  }

  // 3. Room Rent Proportionate Deductions (IRDAI Circular 2020)
  if (params.category === 'sub_limit_room_rent') {
    rules.push({
      rule_code: 'IRDAI_CIRCULAR_194_2020',
      rule_title: 'IRDAI Prohibition on Proportionate Deductions for Medical Expenses',
      passed: true,
      explanation: 'Under IRDAI Master Circular Ref: IRDAI/HLT/REG/CIR/194/07/2020, insurers are strictly forbidden from applying proportionate deductions to medicines, consumables, medical devices, implants, diagnostic tests, or ICU charges, even if the insured opted for an upgraded room category.'
    });
  }

  // 4. Accidental Trauma vs Pre-Existing Disease Nexus
  const diagLower = (params.diagnosis || '').toLowerCase();
  const procLower = (params.procedure || '').toLowerCase();
  const isAccident = diagLower.includes('fracture') || diagLower.includes('trauma') || diagLower.includes('accident') || diagLower.includes('fall') || procLower.includes('orif') || procLower.includes('reduction');
  
  if (isAccident && params.category === 'ped_exclusion') {
    rules.push({
      rule_code: 'LEGAL_CAUSAL_NEXUS_ACCIDENT',
      rule_title: 'Lack of Causal Nexus in Accidental Injury Repudiation',
      passed: true,
      explanation: 'Under established Indian Supreme Court and Insurance Ombudsman precedents (Manmohan Nanda v. United India Insurance; Sulbha Prakash Motegaonkar), an acute accidental bodily injury has no medical or causal nexus to pre-existing chronic conditions (e.g. hypertension/diabetes), making repudiation on non-disclosure legally unsustainable.'
    });
  }

  // 5. Daycare vs 24h hospitalization (IRDAI Standardisation)
  if (params.category === 'hospitalisation_medical_necessity') {
    const isDaycare = diagLower.includes('cataract') || diagLower.includes('dialysis') || diagLower.includes('chemo') || procLower.includes('phaco') || procLower.includes('cataract');
    if (isDaycare) {
      rules.push({
        rule_code: 'IRDAI_DAYCARE_TREATMENT_MANDATE',
        rule_title: 'IRDAI Day-Care Procedure Protection',
        passed: true,
        explanation: 'Under IRDAI standardized policy terms, advanced technological medical treatments and day-care surgeries (including cataract phacoemulsification, dialysis, and chemotherapy) that require less than 24 hours of hospitalization due to medical technology cannot be denied for "lack of 24-hour indoor admission".'
      });
    }
  }

  // 6. Ombudsman ₹30 Lakh Cap Check
  if (params.deductedAmount <= 3000000) {
    rules.push({
      rule_code: 'OMBUDSMAN_RULE_17_ELIGIBLE',
      rule_title: 'Insurance Ombudsman Rule 17 Financial Ceiling',
      passed: true,
      explanation: `Disputed amount of ₹${params.deductedAmount.toLocaleString('en-IN')} falls comfortably within the statutory ₹30,00,000 (Thirty Lakh Rupees) pecuniary jurisdiction of the Insurance Ombudsman under Insurance Ombudsman Rules, 2017.`
    });
  }

  return rules;
}
