import { SampleCaseDefinition } from '../types';

export const SAMPLE_CASES: SampleCaseDefinition[] = [
  {
    id: 'case-waiting-period-cataract',
    title: 'Cataract Surgery - Waiting Period & Continuity Credit Verification',
    subtitle: '578-day tenure verified against 24-mo waiting period after applying 12-mo continuity credit',
    category: 'waiting_period',
    verdict: 'grounds_to_contest',
    claimAmount: 78000,
    deductedAmount: 78000,
    patientName: 'Ramesh Chandra Sharma',
    insurerName: 'Star Health & Allied Insurance Co. Ltd.',
    policyNumber: 'P/121114/01/2025/004921',
    claimNumber: 'CIR/2026/121114/084319',
    hospitalName: 'Sanjeevani Eye Super Speciality Hospital, Ahmedabad',
    summary: 'The insurer rejected the cataract claim stating Clause 4.2 requires a 24-month waiting period and tenure is only 578 days. However, Clause 8 records a 12-month continuity credit from previous coverage. Deducting 12 months leaves a remaining waiting period of 12 months (365 days). Because active tenure is 578 days, the waiting period appears to have elapsed, provided continuity credit is substantiated with a portability certificate.',
    files: {
      rejection_letter: {
        name: 'sample_rejection_letter_cataract.pdf',
        url: '/samples/sample_rejection_letter_cataract.pdf',
        size: '1.2 MB'
      },
      policy_document: {
        name: 'sample_policy_wordings_star.pdf',
        url: '/samples/sample_policy_wordings_star.pdf',
        size: '3.4 MB'
      },
      discharge_summary: {
        name: 'sample_discharge_summary_cataract.pdf',
        url: '/samples/sample_discharge_summary_cataract.pdf',
        size: '850 KB'
      }
    },
    analysis: {
      rejectionReasons: [
        {
          id: 'reason-1',
          case_id: 'case-waiting-period-cataract',
          stated_reason: 'Claim repudiated under Section 4.2 (Specific Disease Waiting Period). Cataract treatment is subject to 24 consecutive months waiting period. Inception: 01-Jan-2025, Admission: 02-Aug-2026 (578 days active).',
          cited_clause: 'Clause 4.2 - Specified Disease/Procedure Waiting Period',
          quoted_text: 'Expenses related to the treatment of Cataract shall be excluded until the expiry of 24 months of continuous coverage.',
          deducted_sub_amount: 78000,
          rejection_category: 'waiting_period'
        }
      ],
      clauses: [
        {
          id: 'clause-1',
          case_id: 'case-waiting-period-cataract',
          clause_heading: 'Clause 4.2 Specific Disease Waiting Period (b) Cataract',
          page_number: 14,
          quote: 'Expenses related to the treatment of Cataract surgery shall be payable after expiry of 24 consecutive months of continuous coverage from first inception date without break.',
          category: 'waiting_period'
        },
        {
          id: 'clause-2',
          case_id: 'case-waiting-period-cataract',
          clause_heading: 'Clause 8 - Portability and Continuity Credit',
          page_number: 18,
          quote: 'Continuity credit recorded: 12 months from prior policy period is recognized towards specific disease waiting periods under IRDAI Portability Guidelines.',
          category: 'waiting_period'
        }
      ],
      comparisons: [
        {
          id: 'comp-1',
          case_id: 'case-waiting-period-cataract',
          rejection_reason_id: 'reason-1',
          category: 'waiting_period',
          source_document: 'sample_rejection_letter_cataract.pdf',
          insurer_statement: 'Repudiated under Clause 4.2 for Cataract surgery within 24 months (tenure 578 days from 01-Jan-2025).',
          insurer_quote: 'Expenses related to the treatment of Cataract shall be excluded until the expiry of 24 months of continuous coverage.',
          insurer_doc_page: 1,
          policy_clause_heading: 'Clause 4.2 & Clause 8 (Continuity Credit Applied)',
          policy_page: 14,
          policy_quote: 'Continuity credit recorded: 12 months from prior policy period is recognized towards specific disease waiting periods.',
          medical_fact: 'Senile Immature Cataract OD. Uneventful Micro-Incision Phacoemulsification with IOL. Admission: 02-08-2026. Discharge: 02-08-2026.',
          discharge_summary_quote: 'Diagnosis: Senile Immature Cataract OD (Right Eye). Procedure Performed: Uneventful Micro-Incision Phacoemulsification with Foldable Monofocal Intraocular Lens (IOL).',
          discharge_page: 1,
          extracted_value: '578 days tenure vs 365 days net waiting period (24 mo - 12 mo credit)',
          verification_status: 'verified',
          verdict: 'grounds_to_contest',
          contest_reason_plain: 'Your policy incepted on 01 January 2025 and admission was on 02 August 2026, totaling 578 active days (~19 months). The standard exclusion is 24 months, but Clause 8 records 12 months of continuity credit from your prior coverage. Deducting this credit leaves a remaining waiting period of 12 months (365 days). Because your 578 active days exceeds the remaining 365 days, the waiting period appears to have elapsed.',
          rules_applied: [
            {
              rule_code: 'IRDAI_WAITING_PERIOD_ELAPSED',
              rule_title: 'Waiting Period Completion Verification (with Continuity Credit)',
              passed: true,
              explanation: 'Policy duration of 578 active policy days exceeds the net remaining waiting period of 365 days (24 months standard minus 12 months recorded continuity credit). Note: Portability certificate must be enclosed to substantiate credit.',
              authority: 'IRDAI Health Insurance Portability & Waiting Period Directives',
              source_url: 'https://irdai.gov.in',
              last_verified: '2026-11-01'
            },
            {
              rule_code: 'OMBUDSMAN_RULE_17_LIMIT',
              rule_title: 'Insurance Ombudsman Statutory Pecuniary Limit Check',
              passed: true,
              explanation: 'Disputed relief of ₹78,000 is well within the statutory pecuniary jurisdiction ceiling of ₹50,00,000 under Insurance Ombudsman Rules and CIO operational guidelines.',
              authority: 'Rule 17 & Rule 14(3), Insurance Ombudsman Rules (Amended Pecuniary Limit: ₹50 Lakhs)',
              source_url: 'https://www.cioins.co.in/HowToApproach',
              last_verified: '2026-11-01'
            }
          ]
        }
      ],
      letters: {
        appeal: {
          subject: 'Grievance Appeal against Wrongful Repudiation of Claim CIR/2026/121114/084319 - Cataract Waiting Period Elapsed with Continuity Credit',
          body: `To,
The Grievance Redressal Officer,
Star Health & Allied Insurance Co. Ltd.

Dear Sir / Madam,

SUB: Formal Grievance Representation against erroneous repudiation of Health Insurance Claim No. CIR/2026/121114/084319 under Policy No. P/121114/01/2025/004921.

I am writing to formally appeal against the repudiation notice dated 10th August 2026, wherein my claim for Cataract surgery of patient Ramesh Chandra Sharma amounting to Rs. 78,000/- was rejected citing Clause 4.2 (24-Month Waiting Period).

1. FACTUAL MATRIX & ERRONEOUS REJECTION:
The patient underwent uneventful Right Eye Phacoemulsification with Intraocular Lens (IOL) implantation on 02 August 2026 at Sanjeevani Eye Super Speciality Hospital. The claim was submitted along with complete itemized bills and discharge summary.

2. POLICY TENURE & RECORDED CONTINUITY CREDIT:
Your repudiation letter calculates policy duration as 578 days from inception (01-01-2025) to admission (02-08-2026), but ignores the recorded 12-month continuity credit under Clause 8 of our policy:
• Policy Inception Date: 01 January 2025
• Hospital Admission Date: 02 August 2026
• Active Policy Tenure: 578 days (~19 months)
• Standard Waiting Period: 24 months (730 days)
• Recorded Continuity Credit: 12 months (365 days)
• Net Remaining Waiting Period: 12 months (365 days)

Because actual tenure of 578 days exceeds the remaining 365 days, the waiting period had fully elapsed prior to hospitalisation. I enclose the Portability Certificate from the previous insurer confirming 12 months continuous prior coverage.

3. LEGAL POSITION:
Under IRDAI Health Insurance Portability Guidelines, continuity benefits must be accorded towards waiting periods. Repudiation without accounting for recorded continuity credit constitutes deficiency of service.

4. RELIEF SOUGHT:
I request immediate settlement and disbursement of the full claim amount of Rs. 78,000/- within 15 days, failing which this dispute will be escalated to the Insurance Ombudsman under Rule 13 of the Insurance Ombudsman Rules, 2017.

Thanking you,

Yours sincerely,
Ramesh Chandra Sharma`,
          placeholders: [
            { key: 'bank_account', label: 'Bank Account / IFSC', value: 'SBI A/C: 30981290382, IFSC: SBIN0004128', is_missing: false },
            { key: 'insured_phone', label: 'Contact Phone', value: '+91 98250 41289', is_missing: false }
          ]
        },
        ombudsman: {
          subject: 'Complaint under Rule 13 of Insurance Ombudsman Rules 2017 against Star Health for Repudiation of Cataract Claim - Waiting Period Elapsed',
          body: `BEFORE THE HON'BLE INSURANCE OMBUDSMAN (CENTRE: AHMEDABAD)
Complaint under Rule 13(1)(b) of Insurance Ombudsman Rules, 2017

COMPLAINANT: Ramesh Chandra Sharma
RESPONDENT: Star Health & Allied Insurance Co. Ltd.
POLICY NO: P/121114/01/2025/004921
CLAIM NO: CIR/2026/121114/084319
RELIEF CLAIMED: Rs. 78,000/- with statutory interest

1. STATEMENT OF FACTS:
The Complainant holds policy P/121114/01/2025/004921 with inception date 01-Jan-2025 and 12 months recorded continuity credit. On 02-Aug-2026 (578 days active), the Complainant underwent cataract surgery incurring Rs. 78,000/-.

2. ARITHMETIC ERROR & CONTINUITY CREDIT:
The insurer repudiated the claim citing 24 months waiting period, overlooking that deducting 12 months continuity credit leaves a net waiting period of 365 days, which 578 days of active tenure fully satisfies.

3. JURISDICTION & LIMITS:
The relief claimed (Rs. 78,000/-) is well within the Ombudsman's statutory pecuniary jurisdiction ceiling of Rs. 50,00,000/- under Rule 17. Representation was submitted to the insurer's GRO on 12-Aug-2026 and 30 days have elapsed without resolution.

4. PRAYER:
Award the full claim amount of Rs. 78,000/- along with penal interest under IRDAI Protection of Policyholders Interests Regulations.`,
          placeholders: []
        }
      }
    }
  },
  {
    id: 'case-ped-hypertension-fracture',
    title: 'Accidental Trauma - Wrongful Pre-Existing Disease (PED) Rejection',
    subtitle: 'Emergency road fracture rejected due to undisclosed mild hypertension',
    category: 'ped_exclusion',
    verdict: 'grounds_to_contest',
    claimAmount: 165000,
    deductedAmount: 165000,
    patientName: 'Sunita Patel',
    insurerName: 'Care Health Insurance Limited',
    policyNumber: '18492011/2023',
    claimNumber: 'CH-CLM-2026-90412',
    hospitalName: 'Apollo Hospitals, Gandhinagar',
    summary: 'Patient sustained femur fracture from a road accident. Insurer rejected the entire claim alleging non-disclosure of hypertension. However, accidental physical trauma has zero causal relationship to hypertension, making the repudiation illegal under IRDAI standards.',
    files: {
      rejection_letter: {
        name: 'sample_rejection_letter_ped.pdf',
        url: '/samples/sample_rejection_letter_ped.pdf',
        size: '1.1 MB'
      },
      policy_document: {
        name: 'sample_policy_wordings_care.pdf',
        url: '/samples/sample_policy_wordings_care.pdf',
        size: '3.1 MB'
      },
      discharge_summary: {
        name: 'sample_discharge_summary_ped.pdf',
        url: '/samples/sample_discharge_summary_ped.pdf',
        size: '920 KB'
      }
    },
    analysis: {
      rejectionReasons: [
        {
          id: 'reason-2',
          case_id: 'case-ped-hypertension-fracture',
          stated_reason: 'Repudiated under Section 4.1 (Pre-Existing Diseases / Non-Disclosure). Case sheet records history of Hypertension, which was not disclosed in the proposal form.',
          cited_clause: 'Clause 4.1 - Pre-Existing Diseases & Non-Disclosure of Material Facts',
          quoted_text: 'Any pre-existing condition or complication arising therefrom shall be excluded until 36 months of continuous coverage.',
          deducted_sub_amount: 165000,
          rejection_category: 'ped_exclusion'
        }
      ],
      clauses: [
        {
          id: 'clause-2',
          case_id: 'case-ped-hypertension-fracture',
          clause_heading: 'Clause 4.1 Pre-Existing Diseases (PED)',
          page_number: 18,
          quote: 'Any condition, ailment or injury or related condition for which insured had signs or symptoms within 36 months prior to policy inception.',
          category: 'ped_exclusion'
        }
      ],
      comparisons: [
        {
          id: 'comp-2',
          case_id: 'case-ped-hypertension-fracture',
          rejection_reason_id: 'reason-2',
          category: 'ped_exclusion',
          insurer_statement: 'Repudiated entire claim due to non-disclosure of past history of hypertension.',
          insurer_quote: 'Failure to disclose hypertension in proposal form renders claim non-payable under Section 4.1.',
          insurer_doc_page: 1,
          policy_clause_heading: 'Clause 4.1 - Pre-Existing Disease Exclusion',
          policy_page: 18,
          policy_quote: 'Pre-existing condition or complication directly related to pre-existing ailment is excluded.',
          medical_fact: 'Emergency admission following Two-Wheeler Skid Road Traffic Accident. Closed fracture Shaft of Left Femur. Emergency ORIF with Intramedullary Nailing performed.',
          discharge_summary_quote: 'Diagnosis: Traumatic Closed Left Femur Fracture. History of Present Illness: Sustained injury due to road traffic fall. No neurological deficit.',
          discharge_page: 1,
          verdict: 'grounds_to_contest',
          contest_reason_plain: 'The insurer rejected your claim for accidental bone fracture because you had mild blood pressure history. An accidental fracture from a road accident has zero medical connection to blood pressure. IRDAI and Supreme Court rulings forbid rejecting accidental claims for unrelated non-disclosures.',
          rules_applied: [
            {
              rule_code: 'NO_NEXUS_CASUALTY_RULE',
              rule_title: 'Causal Nexus Requirement for Non-Disclosure Repudiation',
              passed: true,
              explanation: 'Apex Consumer Court (NCDRC) and Supreme Court of India precedents mandate that an insurer cannot repudiate an accidental trauma claim for an unrelated lifestyle condition.'
            }
          ]
        }
      ],
      letters: {
        appeal: {
          subject: 'Grievance Appeal against Arbitrary Repudiation of Claim CH-CLM-2026-90412 - Accidental Trauma has No Causal Nexus with Hypertension',
          body: `To,
The Head - Grievance Redressal Cell,
Care Health Insurance Limited

Dear Sir / Madam,

SUB: Representation against arbitrary repudiation of Claim Ref CH-CLM-2026-90412 for Smt. Sunita Patel under Policy No. 18492011/2023.

I submit this formal grievance against the repudiation letter dated 15th March 2026, wherein a legitimate claim of Rs. 1,65,000/- for emergency fracture treatment was repudiated alleging non-disclosure of hypertension.

1. MEDICAL FACTS - DIRECT TRAUMA WITH ZERO NEXUS:
The patient was hospitalised at Apollo Hospitals following an unforeseen two-wheeler road traffic accident resulting in a severe fracture of the left femur. ORIF with intramedullary interlocking nailing was performed. The hospital records and MLC unequivocally confirm that hospitalisation was caused entirely by physical accidental trauma.

2. SETTLED LEGAL PRINCIPLE OF CAUSAL NEXUS:
The Hon'ble National Consumer Disputes Redressal Commission (NCDRC) and the Hon'ble Supreme Court of India (Sulbha Prakash Motegaonkar v. LIC) have repeatedly ruled that an insurer cannot repudiate a claim for non-disclosure of an ailment that has no proximate causal relationship with the cause of hospitalisation or death. An accidental bone fracture caused by an impact collision has zero medical nexus with blood pressure.

3. UNLAWFUL CLAUSE APPLICATION:
Clause 4.1 applies strictly to "complications directly arising from pre-existing disease". Road accidents are external fortuitous events and are fully covered from day one.

4. DEMAND FOR SETTLEMENT:
I request the competent Grievance Committee to overturn this unjustified repudiation and sanction Rs. 1,65,000/- within 15 working days.

Yours faithfully,
Sunita Patel`,
          placeholders: [
            { key: 'mlc_number', label: 'MLC / Police Report Number', value: 'MLC/APL/2026/892', is_missing: false }
          ]
        }
      }
    }
  },
  {
    id: 'case-sublimit-room-rent',
    title: 'Room Rent Proportionate Deduction Violation',
    subtitle: 'Insurer illegally slashed medicines, ICU, and implants by 34.5%',
    category: 'sub_limit_room_rent',
    verdict: 'grounds_to_contest',
    claimAmount: 210000,
    deductedAmount: 72400,
    patientName: 'Vikramaditya Sengupta',
    insurerName: 'HDFC ERGO General Insurance Co.',
    policyNumber: '2819/2024/091244',
    claimNumber: 'CLM-HDFC-2026-78100',
    hospitalName: 'Ruby General Hospital, Kolkata',
    summary: 'The insurer applied proportionate deduction to the entire bill because room rent exceeded the 1% cap. However, IRDAI Master Circular 2020 strictly prohibits proportionate deductions on medicines, implants, and ICU charges. Rs. 54,800 is illegally deducted.',
    files: {
      rejection_letter: {
        name: 'sample_settlement_letter_room_rent.pdf',
        url: '/samples/sample_settlement_letter_room_rent.pdf',
        size: '980 KB'
      },
      policy_document: {
        name: 'sample_policy_wordings_hdfc.pdf',
        url: '/samples/sample_policy_wordings_hdfc.pdf',
        size: '2.8 MB'
      },
      discharge_summary: {
        name: 'sample_discharge_summary_room_rent.pdf',
        url: '/samples/sample_discharge_summary_room_rent.pdf',
        size: '890 KB'
      }
    },
    analysis: {
      rejectionReasons: [
        {
          id: 'reason-3',
          case_id: 'case-sublimit-room-rent',
          stated_reason: 'Proportionate deduction applied under Clause 3.2. Insured opted for Single Deluxe Room (Rs. 6,000/day) against eligible room limit of Rs. 4,000/day (1% of Sum Insured). Associated medical expenses proportionately reduced by 33.3%.',
          cited_clause: 'Clause 3.2 - Room Rent Sub-limit & Proportionate Deduction',
          quoted_text: 'If room rent exceeds daily eligibility, associated medical expenses shall be paid in the proportion of eligible room rent to actual room rent.',
          deducted_sub_amount: 72400,
          rejection_category: 'sub_limit_room_rent'
        }
      ],
      clauses: [
        {
          id: 'clause-3',
          case_id: 'case-sublimit-room-rent',
          clause_heading: 'Clause 3.2 Room Rent Proportionate Clause',
          page_number: 11,
          quote: 'Proportionate deduction shall apply to associate medical expenses directly linked to room tariff.',
          category: 'sub_limit_room_rent'
        }
      ],
      comparisons: [
        {
          id: 'comp-3',
          case_id: 'case-sublimit-room-rent',
          rejection_reason_id: 'reason-3',
          category: 'sub_limit_room_rent',
          insurer_statement: 'Reduced total hospital bill by 33.3% across all line items including ICU, implants, and pharmacy.',
          insurer_quote: 'Associated medical expenses proportionately deducted due to higher room category selection.',
          insurer_doc_page: 2,
          policy_clause_heading: 'Clause 3.2 - Room Category & Associated Expenses',
          policy_page: 11,
          policy_quote: 'Proportionate deduction shall not apply to non-associated expenses or items with fixed pricing.',
          medical_fact: 'Acute appendicitis with laparoscopic appendectomy. Total bill: Rs. 2,10,000. Medicines: Rs. 38,000. Surgical consumables: Rs. 24,000. ICU charges: Rs. 22,000.',
          discharge_summary_quote: 'Laparoscopic Appendectomy performed under General Anaesthesia. Uneventful post-op recovery.',
          discharge_page: 1,
          verdict: 'grounds_to_contest',
          contest_reason_plain: 'The insurer reduced your pharmacy, surgical consumables, and ICU bills by 33.3% just because you chose a higher room. Under IRDAI Master Circular 2020, insurers are legally forbidden from applying proportionate deductions to medicines, medical devices, diagnostic tests, or ICU charges.',
          rules_applied: [
            {
              rule_code: 'ROOM_RENT_PROPORTIONATE_DEDUCTION',
              rule_title: 'IRDAI Master Circular Ref: IRDAI/HLT/REG/CIR/194/07/2020',
              passed: true,
              explanation: 'IRDAI circular strictly exempts medicines, consumables, and ICU charges from proportionate room-rent deductions.'
            }
          ]
        }
      ],
      letters: {
        appeal: {
          subject: 'Grievance Appeal regarding Unlawful Proportionate Deductions on Medicines & Consumables - Claim Ref CLM-HDFC-2026-78100',
          body: `To,
Grievance Redressal Officer,
HDFC ERGO General Insurance Co. Ltd.

Dear Sir / Madam,

SUB: Grievance Appeal against unlawful proportionate deductions applied to Pharmacy, Consumables and ICU in Claim CLM-HDFC-2026-78100.

I am in receipt of the claim settlement advice for Vikramaditya Sengupta under Policy No. 2819/2024/091244, wherein Rs. 72,400/- was deducted under the garb of "proportionate room rent deduction".

1. VIOLATION OF IRDAI MASTER CIRCULAR:
While the policy stipulates a room rent cap of Rs. 4,000/day, your claims processing team has applied a blanket 33.3% deduction across:
• Pharmacy / Medicines (Rs. 38,000) -> Wrongly slashed by Rs. 12,654
• Surgical Disposable Consumables (Rs. 24,000) -> Wrongly slashed by Rs. 7,992
• ICU / High Dependency Unit Care (Rs. 22,000) -> Wrongly slashed by Rs. 7,326

2. MANDATORY STATUTORY DIRECTIVE:
IRDAI Master Circular on Health Insurance (Ref: IRDAI/HLT/REG/CIR/194/07/2020) explicitly states in Chapter 2, Clause 16:
"Insurers shall not apply proportionate deduction on cost of pharmacy, consumables, implants, medical devices, diagnostic tests, and ICU charges even if the insured occupies a room higher than eligible category."

3. ILLEGAL DEDUCTION RECOVERY:
A sum of Rs. 54,800/- has been deducted in blatant contravention of regulatory directives.

I call upon the insurer to immediately rectify this deduction and release Rs. 54,800/- to the policyholder within 14 days.

Yours faithfully,
Vikramaditya Sengupta`,
          placeholders: []
        }
      }
    }
  },
  {
    id: 'case-insurer-correct-dental',
    title: 'Routine Cosmetic Dental Care - Insurer Appears Correct',
    subtitle: 'Demonstration of an honest assessment where the insurer correctly applied the exclusion',
    category: 'hospitalisation_medical_necessity',
    verdict: 'insurer_appears_correct',
    claimAmount: 45000,
    deductedAmount: 45000,
    patientName: 'Priya Nair',
    insurerName: 'Niva Bupa Health Insurance Co. Ltd.',
    policyNumber: '3190821/2025',
    claimNumber: 'NB-2026-99014',
    hospitalName: 'Smile Care Aesthetic Clinic & Dental Centre, Bengaluru',
    summary: 'The patient claimed cosmetic dental veneers and teeth alignment. The policy explicitly excludes dental treatment unless required due to accidental external injury requiring hospitalisation. ClaimFight honestly informs the user that the insurer acted within standard terms.',
    files: {
      rejection_letter: {
        name: 'sample_rejection_letter_dental.pdf',
        url: '/samples/sample_rejection_letter_dental.pdf',
        size: '720 KB'
      },
      policy_document: {
        name: 'sample_policy_wordings_nivabupa.pdf',
        url: '/samples/sample_policy_wordings_nivabupa.pdf',
        size: '2.5 MB'
      },
      discharge_summary: {
        name: 'sample_discharge_summary_dental.pdf',
        url: '/samples/sample_discharge_summary_dental.pdf',
        size: '640 KB'
      }
    },
    analysis: {
      rejectionReasons: [
        {
          id: 'reason-4',
          case_id: 'case-insurer-correct-dental',
          stated_reason: 'Claim rejected under Clause 3.4 (Dental Treatment Exclusion). Dental treatment or surgery of any kind unless requiring hospitalisation arising out of accidental injury is excluded.',
          cited_clause: 'Clause 3.4 - Standard Dental and Cosmetic Exclusion',
          quoted_text: 'Dental treatment or surgery of cosmetic nature is permanently excluded.',
          deducted_sub_amount: 45000,
          rejection_category: 'hospitalisation_medical_necessity'
        }
      ],
      clauses: [
        {
          id: 'clause-4',
          case_id: 'case-insurer-correct-dental',
          clause_heading: 'Clause 3.4 Dental Treatment Exclusions',
          page_number: 9,
          quote: 'Dental treatment or aesthetic corrective surgery is not covered unless necessitated by accidental trauma requiring minimum 24 hour hospitalisation.',
          category: 'hospitalisation_medical_necessity'
        }
      ],
      comparisons: [
        {
          id: 'comp-4',
          case_id: 'case-insurer-correct-dental',
          rejection_reason_id: 'reason-4',
          category: 'hospitalisation_medical_necessity',
          insurer_statement: 'Repudiated because elective dental aesthetic procedures are permanently excluded under Clause 3.4.',
          insurer_quote: 'Treatment of cosmetic dental alignment is non-payable under standard policy exclusions.',
          insurer_doc_page: 1,
          policy_clause_heading: 'Clause 3.4 - Dental & Cosmetic Surgery Exclusion',
          policy_page: 9,
          policy_quote: 'Dental surgery or aesthetic crowns are excluded unless necessitated by accidental trauma.',
          medical_fact: 'Elective ceramic veneers and cosmetic diastema closure. No accidental trauma, pathology, or fracture present.',
          discharge_summary_quote: 'Procedure: Aesthetic smile correction and elective veneers 11 to 21. No history of trauma.',
          discharge_page: 1,
          verdict: 'insurer_appears_correct',
          contest_reason_plain: 'The insurer appears to have acted correctly based on the documents submitted. Both the policy terms and IRDAI standard guidelines exclude elective cosmetic dental care unless it was caused by an external accidental impact. Because this was an elective procedure, contesting this decision is unlikely to succeed.',
          rules_applied: [
            {
              rule_code: 'IRDAI_DENTAL_EXCLUSION_STANDARD',
              rule_title: 'IRDAI Standard Exclusions in Health Insurance (Circular 2019)',
              passed: false,
              explanation: 'Cosmetic dental treatment without accidental injury is a recognized standard exclusion across Indian health insurance.'
            }
          ]
        }
      ],
      letters: {
        appeal: {
          subject: 'No Appeal Generated - Insurer Decision Within Standard Terms',
          body: `Notice from ClaimFight:
Based on our multi-step clause matching and IRDAI standard rule verification, the insurer's repudiation under Clause 3.4 appears legally sound. Standard Indian retail health policies exclude elective cosmetic dental procedures unless caused by an external accidental physical impact.

To maintain integrity and save your valuable time, ClaimFight does not generate a futile grievance appeal when the insurer appears correct.

If you believe there was an external accidental injury that was omitted from the hospital summary, please obtain an addendum certificate from your treating surgeon and re-analyze.`,
          placeholders: []
        }
      }
    }
  }
];
