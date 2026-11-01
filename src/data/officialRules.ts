import { OfficialRule } from '../types';

export const OFFICIAL_RULES: OfficialRule[] = [
  {
    id: 'rule-ombudsman-eligibility',
    rule_code: 'OMBUDSMAN_ELIGIBILITY',
    title: 'Insurance Ombudsman Complaint Eligibility',
    summary: 'You can approach the Insurance Ombudsman only after first representing your grievance in writing to the insurer. You may lodge a complaint if the insurer rejects the grievance, does not reply within 30 days, or grants only partial relief. The complaint must be filed within 1 year from the date of the insurer’s rejection letter.',
    authority: 'Council for Insurance Ombudsmen (CIO) / IRDAI',
    source_url: 'https://www.cioins.co.in/HowToApproach',
    last_verified: '2026-03-01',
    details: {
      time_limit_months: 12,
      prerequisite_wait_days: 30,
      fee: 'Zero Fee (Completely Free of Cost)',
      legal_representation: 'No advocates or legal counsel allowed; policyholders represent themselves'
    }
  },
  {
    id: 'rule-ombudsman-financial-cap',
    rule_code: 'OMBUDSMAN_FINANCIAL_CAP',
    title: 'Financial Ceiling for Insurance Ombudsman',
    summary: 'The Insurance Ombudsman has statutory power to award compensation up to ₹30 Lakhs (including ex-gratia and expenses). Claims where the disputed relief exceeds ₹30 Lakhs fall outside Ombudsman jurisdiction and must be pursued before the Consumer Commission (NCDRC/State Commission).',
    authority: 'Insurance Ombudsman Rules 2017 (Amended 2021)',
    source_url: 'https://www.cioins.co.in',
    last_verified: '2026-03-01',
    details: {
      max_limit_inr: 3000000,
      currency: 'INR'
    }
  },
  {
    id: 'rule-bima-bharosa',
    rule_code: 'IRDAI_BIMA_BHAROSA',
    title: 'IRDAI Bima Bharosa Escalation Channel',
    summary: 'If the insurer does not resolve your written grievance within 15 days or gives an unsatisfactory reply, you can register a formal complaint on the IRDAI Bima Bharosa portal (formerly IGMS) or call the toll-free helpline at 155255 / 1800 4254 732.',
    authority: 'IRDAI Consumer Affairs Department',
    source_url: 'https://bimabharosa.irdai.gov.in',
    last_verified: '2026-03-01',
    details: {
      toll_free: ['155255', '1800 4254 732'],
      turnaround_time_days: 15
    }
  },
  {
    id: 'rule-room-rent-deduction',
    rule_code: 'ROOM_RENT_PROPORTIONATE_DEDUCTION',
    title: 'Proportionate Room Rent Deduction Restrictions',
    summary: 'Insurers may only apply proportionate deduction to expenses directly tied to room tariff (e.g., nursing or room service). Under IRDAI Master Circular Ref: IRDAI/HLT/REG/CIR/194/07/2020, insurers are strictly barred from applying proportionate deductions to pharmacy bills, surgical consumables, implants, medical devices, diagnostic tests, or ICU charges.',
    authority: 'IRDAI Master Circular on Health Insurance (2020 Revision)',
    source_url: 'https://irdai.gov.in',
    last_verified: '2026-03-01',
    details: {
      exempt_categories: [
        'Medicines & Pharmacy',
        'Implants & Stents',
        'Consumables & Medical Devices',
        'Diagnostic Investigations (CT/MRI/Blood)',
        'ICU & HDU Bed Charges'
      ]
    }
  },
  {
    id: 'rule-ped-moratorium',
    rule_code: 'PED_MORATORIUM_PERIOD',
    title: '60-Month Moratorium Period (Incontestability)',
    summary: 'Under the IRDAI Master Circular on Protection of Policyholders Interests (2024 revision), after 60 continuous months of coverage without break (reduced from 8 years), no health insurance policy or claim can be questioned on grounds of non-disclosure or pre-existing diseases, except in cases of proven deliberate fraud.',
    authority: 'IRDAI Master Circular 2024',
    source_url: 'https://irdai.gov.in',
    last_verified: '2026-03-01',
    details: {
      moratorium_months: 60,
      fraud_exception_standard: 'Strict burden of proof on insurer'
    }
  },
  {
    id: 'rule-daycare-exemption',
    rule_code: 'DAYCARE_PROCEDURE_EXEMPTION',
    title: 'Day Care Surgeries Exemption from 24-Hour Stay',
    summary: 'IRDAI standard health insurance guidelines mandate coverage for medical procedures carried out under general or local anesthesia in a hospital/day care centre in less than 24 hours due to advanced medical technology (e.g. cataract, chemotherapy, dialysis, lithotripsy, arthroscopy). Insurers cannot reject claims for such listed procedures for lack of overnight admission.',
    authority: 'IRDAI Standardization Guidelines in Health Insurance',
    source_url: 'https://irdai.gov.in',
    last_verified: '2026-03-01',
    details: {
      standard_daycare_list_includes: [
        'Cataract & Eye Surgeries',
        'Chemotherapy & Radiotherapy',
        'Hemodialysis',
        'Tonsillectomy',
        'Lithotripsy (Kidney Stone)',
        'Diagnostic Endoscopy / Colonoscopy with Biopsy'
      ]
    }
  }
];
