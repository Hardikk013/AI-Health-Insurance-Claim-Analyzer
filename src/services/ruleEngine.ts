// ClaimFight Deterministic Rule Engine
// Implements deterministic recomputations of dates, waiting periods, continuity credits, moratorium, and room rent proportionate deductions

export interface RuleValidationInput {
  policyStartDate?: string;
  admissionDate?: string;
  dischargeDate?: string;
  rejectionCategory: string;
  citedWaitingPeriodMonths?: number;
  continuityCreditMonths?: number;
  hasPortabilityProof?: boolean;
  continuousCoverageMonths?: number;
  roomRentEligibilityPerDay?: number;
  actualRoomRentPerDay?: number;
  isDaycareProcedure?: boolean;
  procedureName?: string;
  deductedMedicinesImplants?: boolean;
  disputedAmount?: number;
}

export interface RuleValidationResult {
  rule_code: string;
  rule_title: string;
  passed: boolean;
  explanation: string;
  authority: string;
  source_url: string;
  last_verified?: string;
}

export function parseFlexibleDate(dateStr: string | null | undefined): Date | null {
  if (!dateStr) return null;
  const clean = dateStr.trim();
  
  if (/^\d{4}-\d{2}-\d{2}/.test(clean)) {
    const direct = new Date(clean);
    if (!isNaN(direct.getTime())) return direct;
  }

  const parts = clean.split(/[-/.\s]+/);
  if (parts.length >= 3) {
    if (parts[0].length === 4) {
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      const d = parseInt(parts[2], 10);
      const res = new Date(y, m, d);
      if (!isNaN(res.getTime())) return res;
    }
    
    if (parts[2].length === 4) {
      const d = parseInt(parts[0], 10);
      let m = parseInt(parts[1], 10) - 1;
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

  const fallback = new Date(clean);
  if (!isNaN(fallback.getTime()) && fallback.getFullYear() > 1990) {
    return fallback;
  }

  return null;
}

export function validateDeterministicRules(input: RuleValidationInput): RuleValidationResult[] {
  const results: RuleValidationResult[] = [];

  // 1. Waiting Period Date Recomputation (with Continuity Credit)
  if (input.rejectionCategory === 'waiting_period' && input.policyStartDate && input.admissionDate) {
    const start = parseFlexibleDate(input.policyStartDate);
    const admission = parseFlexibleDate(input.admissionDate);
    
    if (start && admission) {
      // Calculate difference in months and days
      const diffTime = admission.getTime() - start.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      const diffMonths = Math.floor(diffDays / 30.4375);

    const standardMonths = input.citedWaitingPeriodMonths || 24;
    const standardDays = Math.round(standardMonths * 30.4375);
    const creditMonths = input.continuityCreditMonths || 0;
    const creditDays = Math.round(creditMonths * 30.4375);
    const remainingMonths = Math.max(0, standardMonths - creditMonths);
    const remainingDays = Math.max(0, standardDays - creditDays);

    if (diffDays < 0) {
      results.push({
        rule_code: 'DATE_CONSISTENCY_CHECK',
        rule_title: 'Policy Inception vs Admission Date',
        passed: false,
        explanation: 'The admission date is prior to the policy start date.',
        authority: 'IRDAI Guidelines',
        source_url: 'https://irdai.gov.in',
        last_verified: '2026-11-01'
      });
    } else if (creditMonths > 0) {
      if (diffDays >= remainingDays) {
        results.push({
          rule_code: 'WAITING_PERIOD_ELAPSED_WITH_CONTINUITY',
          rule_title: 'Waiting Period Verified Elapsed with Continuity Credit',
          passed: true,
          explanation: `Policy tenure is ${diffDays} active days (~${diffMonths} months) from inception to admission. Standard exclusion is ${standardMonths} months (${standardDays} days). Applying the recorded ${creditMonths}-month continuity credit reduces required waiting period to ${remainingMonths} months (${remainingDays} days). Because ${diffDays} days exceeds ${remainingDays} days, the waiting period appears to have elapsed. (Note: Portability certificate must be enclosed to confirm credit validity).`,
          authority: 'IRDAI Health Insurance Portability Guidelines & Clause 8',
          source_url: 'https://irdai.gov.in',
          last_verified: '2026-11-01'
        });
      } else {
        results.push({
          rule_code: 'WAITING_PERIOD_ACTIVE',
          rule_title: 'Waiting Period Active Status',
          passed: false,
          explanation: `Even after applying ${creditMonths} months continuity credit, remaining waiting period is ${remainingMonths} months (${remainingDays} days). Current policy active duration of ${diffDays} days is insufficient.`,
          authority: 'IRDAI Waiting Period Standardisation Regulations',
          source_url: 'https://irdai.gov.in',
          last_verified: '2026-11-01'
        });
      }
    } else if (diffMonths >= standardMonths) {
      results.push({
        rule_code: 'WAITING_PERIOD_ELAPSED',
        rule_title: 'Specific Illness Waiting Period Deterministic Verification',
        passed: true,
        explanation: `The waiting period cited by insurer is ${standardMonths} months (${standardDays} days). However, your policy was continuously active for ${diffMonths} months (${diffDays} days) before hospitalisation. The waiting period had already elapsed.`,
        authority: 'IRDAI Health Insurance Portability & Waiting Period Guidelines',
        source_url: 'https://irdai.gov.in',
        last_verified: '2026-11-01'
      });
    } else {
      results.push({
        rule_code: 'WAITING_PERIOD_ACTIVE',
        rule_title: 'Waiting Period Active Status',
        passed: false,
        explanation: `Your policy was active for ${diffMonths} months (${diffDays} days), which is less than the required ${standardMonths} months waiting period.`,
        authority: 'IRDAI Waiting Period Standardisation Regulations',
        source_url: 'https://irdai.gov.in',
        last_verified: '2026-11-01'
      });
    }
    }
  }

  // 2. Pre-Existing Disease Moratorium (60 Months / 5 Years)
  if (input.rejectionCategory === 'ped_exclusion') {
    const coverageMonths = input.continuousCoverageMonths || 0;
    if (coverageMonths >= 60) {
      results.push({
        rule_code: 'PED_MORATORIUM_PERIOD',
        rule_title: 'IRDAI 60-Month Moratorium Period Rule',
        passed: true,
        explanation: 'Under the IRDAI Master Circular (2024), after 60 continuous months of coverage, no health insurance claim can be contested on grounds of non-disclosure or pre-existing diseases, unless deliberate fraud is proven.',
        authority: 'IRDAI Master Circular on Protection of Policyholders Interests 2024',
        source_url: 'https://irdai.gov.in',
        last_verified: '2026-11-01'
      });
    }
  }

  // 3. Proportionate Room Rent Deduction Violations
  if (input.rejectionCategory === 'sub_limit_room_rent') {
    if (input.deductedMedicinesImplants) {
      results.push({
        rule_code: 'ROOM_RENT_PROPORTIONATE_DEDUCTION',
        rule_title: 'Proportionate Deduction Restriction on Non-Associated Medical Costs',
        passed: true,
        explanation: 'The insurer made proportionate deductions across medical bills. Under IRDAI Circular Ref: IRDAI/HLT/REG/CIR/194/07/2020, insurers cannot apply proportionate deductions to medicines, medical devices, implants, diagnostic investigations, or ICU charges even if a higher room category was chosen.',
        authority: 'IRDAI Master Circular Ref: IRDAI/HLT/REG/CIR/194/07/2020',
        source_url: 'https://irdai.gov.in',
        last_verified: '2026-11-01'
      });
    }
  }

  // 4. Insurance Ombudsman Statutory Pecuniary Limit Check (₹50 Lakhs under CIO/IRDAI guidelines)
  if (input.disputedAmount) {
    const isUnder50L = input.disputedAmount <= 5000000;
    results.push({
      rule_code: 'OMBUDSMAN_RULE_17_LIMIT',
      rule_title: 'Insurance Ombudsman Statutory Pecuniary Limit Verification',
      passed: isUnder50L,
      explanation: isUnder50L
        ? `Disputed relief of ₹${input.disputedAmount.toLocaleString('en-IN')} is within the Ombudsman's statutory compensation limit of ₹50,00,000 (Fifty Lakh Rupees) under Insurance Ombudsman Rules and CIO operational guidelines. You are eligible to file after representing to the insurer's GRO and waiting 30 days.`
        : `Disputed relief of ₹${input.disputedAmount.toLocaleString('en-IN')} exceeds the Ombudsman's ₹50 Lakh pecuniary ceiling. This dispute must be filed before the State/National Consumer Commission.`,
      authority: 'Rule 17 & Rule 14(3), Insurance Ombudsman Rules (Amended Pecuniary Limit: ₹50 Lakhs)',
      source_url: 'https://www.cioins.co.in/HowToApproach',
      last_verified: '2026-11-01'
    });
  }

  return results;
}
