// ClaimFight Deterministic Rule Engine
// Implements deterministic recomputations of dates, waiting periods, moratorium, and room rent proportionate deductions

export interface RuleValidationInput {
  policyStartDate?: string;
  admissionDate?: string;
  dischargeDate?: string;
  rejectionCategory: string;
  citedWaitingPeriodMonths?: number;
  continuousCoverageMonths?: number;
  roomRentEligibilityPerDay?: number;
  actualRoomRentPerDay?: number;
  isDaycareProcedure?: boolean;
  procedureName?: string;
  deductedMedicinesImplants?: boolean;
}

export interface RuleValidationResult {
  rule_code: string;
  rule_title: string;
  passed: boolean;
  explanation: string;
  authority: string;
  source_url: string;
}

export function validateDeterministicRules(input: RuleValidationInput): RuleValidationResult[] {
  const results: RuleValidationResult[] = [];

  // 1. Waiting Period Date Recomputation
  if (input.rejectionCategory === 'waiting_period' && input.policyStartDate && input.admissionDate) {
    const start = new Date(input.policyStartDate);
    const admission = new Date(input.admissionDate);
    
    // Calculate difference in months and days
    const diffTime = admission.getTime() - start.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffMonths = Math.floor(diffDays / 30.4375);

    const requiredMonths = input.citedWaitingPeriodMonths || 24;

    if (diffDays < 0) {
      results.push({
        rule_code: 'DATE_CONSISTENCY_CHECK',
        rule_title: 'Policy Inception vs Admission Date',
        passed: false,
        explanation: 'The admission date is prior to the policy start date.',
        authority: 'IRDAI Guidelines',
        source_url: 'https://irdai.gov.in'
      });
    } else if (diffMonths >= requiredMonths) {
      results.push({
        rule_code: 'WAITING_PERIOD_ELAPSED',
        rule_title: 'Specific Illness Waiting Period Deterministic Verification',
        passed: true,
        explanation: `The waiting period cited by insurer is ${requiredMonths} months (${requiredMonths * 30} days). However, your policy was continuously active for ${diffMonths} months (${diffDays} days) before hospitalisation. The waiting period had already elapsed.`,
        authority: 'IRDAI Health Insurance Portability & Waiting Period Guidelines',
        source_url: 'https://irdai.gov.in'
      });
    } else {
      results.push({
        rule_code: 'WAITING_PERIOD_ACTIVE',
        rule_title: 'Waiting Period Active Status',
        passed: false,
        explanation: `Your policy was active for ${diffMonths} months, which is less than the required ${requiredMonths} months waiting period.`,
        authority: 'IRDAI Waiting Period Standardisation',
        source_url: 'https://irdai.gov.in'
      });
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
        explanation: `Under the IRDAI Master Circular (2024), after 60 continuous months of coverage, no health insurance claim can be contested on grounds of non-disclosure or pre-existing diseases, unless deliberate fraud is proven.`,
        authority: 'IRDAI Master Circular on Protection of Policyholders Interests 2024',
        source_url: 'https://irdai.gov.in'
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
        explanation: `The insurer made proportionate deductions across medical bills. Under IRDAI Circular Ref: IRDAI/HLT/REG/CIR/194/07/2020, insurers cannot apply proportionate deductions to medicines, medical devices, implants, diagnostic investigations, or ICU charges even if a higher room category was chosen.`,
        authority: 'IRDAI Master Circular on Health Insurance Deductions',
        source_url: 'https://irdai.gov.in'
      });
    }
  }

  // 4. Daycare Procedure 24-Hour Stay Exemption
  if (input.rejectionCategory === 'hospitalisation_medical_necessity') {
    const commonDaycareProcedures = [
      'cataract', 'chemotherapy', 'radiotherapy', 'hemodialysis',
      'lithotripsy', 'tonsillectomy', 'arthroscopy', 'endoscopy',
      'coronary angiography', 'tympanoplasty', 'nasal surgery'
    ];
    
    const procLower = (input.procedureName || '').toLowerCase();
    const isStandardDaycare = input.isDaycareProcedure || commonDaycareProcedures.some(p => procLower.includes(p));

    if (isStandardDaycare) {
      results.push({
        rule_code: 'DAYCARE_PROCEDURE_EXEMPTION',
        rule_title: 'Day Care Procedure 24-Hour Stay Exemption',
        passed: true,
        explanation: `The rejection cites failure to complete 24 hours of hospitalisation. However, modern medical technology permits ${input.procedureName || 'this procedure'} to be performed in under 24 hours. IRDAI standard guidelines mandate coverage for listed Day Care procedures without requiring an overnight stay.`,
        authority: 'IRDAI Standardisation of Health Insurance Terms',
        source_url: 'https://irdai.gov.in'
      });
    }
  }

  return results;
}
