import { jsPDF } from 'jspdf';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outputDir = path.resolve(__dirname, '../public/samples');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

function createSamplePdf({ filename, title, subtitle, organization, sections }) {
  const doc = new jsPDF({
    unit: 'pt',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 50;
  const contentWidth = pageWidth - margin * 2;
  let cursorY = margin;

  // Draw Watermark
  doc.saveGraphicsState();
  doc.setTextColor(220, 225, 230);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(36);
  // Rotate around center
  doc.text('SAMPLE - NOT A REAL CLAIM', pageWidth / 2, pageHeight / 2, {
    align: 'center',
    angle: 45
  });
  doc.restoreGraphicsState();

  // Top header bar
  doc.setFillColor(18, 38, 63); // Navy
  doc.rect(margin, cursorY, contentWidth, 36, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(organization.toUpperCase(), margin + 12, cursorY + 22);

  cursorY += 50;

  // Title
  doc.setTextColor(18, 38, 63);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(title, margin, cursorY);
  cursorY += 18;

  // Subtitle
  doc.setTextColor(91, 107, 122);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(subtitle, margin, cursorY);
  cursorY += 16;

  // Divider
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(1);
  doc.line(margin, cursorY, pageWidth - margin, cursorY);
  cursorY += 20;

  // Sections
  for (const sec of sections) {
    if (cursorY > pageHeight - 100) {
      doc.addPage();
      cursorY = margin;
      // Re-draw watermark on next page
      doc.saveGraphicsState();
      doc.setTextColor(220, 225, 230);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(36);
      doc.text('SAMPLE - NOT A REAL CLAIM', pageWidth / 2, pageHeight / 2, {
        align: 'center',
        angle: 45
      });
      doc.restoreGraphicsState();
    }

    doc.setTextColor(31, 138, 138); // Teal
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(sec.heading.toUpperCase(), margin, cursorY);
    cursorY += 16;

    doc.setTextColor(27, 39, 51);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);

    const lines = doc.splitTextToSize(sec.content, contentWidth);
    doc.text(lines, margin, cursorY);
    cursorY += lines.length * 13 + 14;
  }

  // Footer
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(150, 160, 170);
  doc.text('ClaimFight Hackathon Sample Document • Watermark: SAMPLE - NOT A REAL CLAIM • Generated for Verification Demo', margin, pageHeight - 25);

  const pdfOutput = doc.output('arraybuffer');
  fs.writeFileSync(path.join(outputDir, filename), Buffer.from(pdfOutput));
  console.log(`Generated: ${filename}`);
}

const samples = [
  // Case 1: Cataract Waiting Period
  {
    filename: 'sample_rejection_letter_cataract.pdf',
    title: 'Claim Repudiation Notice - CIR/2026/121114/084319',
    subtitle: 'Date of Letter: 10-08-2026 | Insured: Ramesh Chandra Sharma',
    organization: 'Star Health & Allied Insurance Co. Ltd.',
    sections: [
      {
        heading: 'Repudiation Decision',
        content: 'We regret to inform you that upon scrutinising claim CIR/2026/121114/084319 for Cataract surgery of Right Eye under Policy P/121114/01/2025/004921, the competent authority has repudiated the claim under Section 4.2.'
      },
      {
        heading: 'Grounds Cited by Insurer',
        content: 'Clause 4.2 specifies that expenses related to the treatment of Cataract shall be excluded until the expiry of 24 months of continuous coverage. Policy inception date is 01 January 2025 and admission date is 02 August 2026, representing policy tenure of 578 days. Based on our adjudication record, the 24-month waiting period has not elapsed. Hence claim of Rs. 78,000/- stands repudiated in full.'
      },
      {
        heading: 'Appellate Channel & Ombudsman',
        content: 'If not satisfied, you may represent your grievance to the Grievance Redressal Officer at gro@starhealth.in within 30 days. Under Rule 17(1) of Insurance Ombudsman Rules 2017, the Ombudsman may entertain complaints up to an award ceiling of Rs. 30 Lakhs.'
      }
    ]
  },
  {
    filename: 'sample_policy_wordings_star.pdf',
    title: 'Health Insurance Policy Terms & Schedule (Excerpts)',
    subtitle: 'Policy No: P/121114/01/2025/004921 | Inception Date: 01-01-2025',
    organization: 'Star Health & Allied Insurance Co. Ltd.',
    sections: [
      {
        heading: 'Clause 1 - Policy Inception and Continuous Coverage',
        content: 'This policy commenced on 01 January 2025. Renewal without interruption carries continuity benefits for all waiting periods served.'
      },
      {
        heading: 'Clause 4.2 - Specific Disease / Procedure Waiting Period',
        content: 'Expenses related to the treatment of Cataract surgery shall be payable after expiry of 24 consecutive months of continuous coverage from first inception date without break.'
      },
      {
        heading: 'Clause 8 - Portability and Continuity Credit',
        content: 'Continuity credit recorded: 12 months from prior policy period is recognized towards specific disease waiting periods under IRDAI Portability Guidelines, subject to submission of prior insurer portability certificate.'
      }
    ]
  },
  {
    filename: 'sample_discharge_summary_cataract.pdf',
    title: 'Hospital Discharge Summary - Department of Ophthalmology',
    subtitle: 'IPD No: SANJ-2026-8812 | Admission & Discharge Date: 02-08-2026',
    organization: 'Sanjeevani Eye Super Speciality Hospital, Ahmedabad',
    sections: [
      {
        heading: 'Patient Particulars',
        content: 'Patient Name: Mr. Ramesh Chandra Sharma | Age: 54 Years | Gender: Male | Admission: 02-08-2026 08:30 AM | Discharge: 02-08-2026 05:00 PM (Day Care Surgery).'
      },
      {
        heading: 'Clinical Diagnosis & Operative Note',
        content: 'Diagnosis: Senile Immature Cataract OD (Right Eye). Procedure Performed: Uneventful Micro-Incision Phacoemulsification with Foldable Monofocal Intraocular Lens (IOL) implantation under Topical Anesthesia. Post-op condition satisfactory.'
      },
      {
        heading: 'Total Hospitalization Expenses',
        content: 'Phacoemulsification Surgery Package: Rs. 48,000 | Hydrophobic Monofocal IOL: Rs. 24,000 | Pharmacy & Consumables: Rs. 6,000 | Total Billed Amount: Rs. 78,000/-.'
      }
    ]
  },

  // Case 2: PED / Trauma
  {
    filename: 'sample_rejection_letter_ped.pdf',
    title: 'Claim Repudiation Advice - Ref CH-CLM-2026-90412',
    subtitle: 'Date of Letter: 15-03-2026 | Insured: Sunita Patel',
    organization: 'Care Health Insurance Limited',
    sections: [
      {
        heading: 'Repudiation Reason',
        content: 'Upon review of hospital records for claim CH-CLM-2026-90412, the inpatient papers record past history of Hypertension. The same was not disclosed in the proposal form dated 14-04-2023. As per Section 4.1, claims related to undisclosed pre-existing ailments are not payable.'
      },
      {
        heading: 'Clause Cited',
        content: 'Clause 4.1: Any pre-existing condition or complication arising therefrom shall be excluded until 36 months of continuous coverage. Hence, claim of Rs. 1,65,000/- is rejected in full.'
      }
    ]
  },
  {
    filename: 'sample_policy_wordings_care.pdf',
    title: 'Care Health Classic Wordings - Section 4 Exclusions',
    subtitle: 'Policy No: 18492011/2023 | Exclusions & Terms',
    organization: 'Care Health Insurance Limited',
    sections: [
      {
        heading: 'Clause 4.1 - Pre-Existing Diseases (PED)',
        content: 'Pre-existing condition or complication directly related to pre-existing ailment is excluded until expiry of 36 months from inception date.'
      },
      {
        heading: 'Clause 2.4 - Accidental Injuries Coverage',
        content: 'Hospitalisation expenses directly arising out of accidental physical bodily injury caused solely by external, violent and visible means are covered from Day 1 of the policy.'
      }
    ]
  },
  {
    filename: 'sample_discharge_summary_ped.pdf',
    title: 'Trauma & Orthopaedic Discharge Summary',
    subtitle: 'IPD: APL-99042 | Admission: 02-03-2026 | Discharge: 06-03-2026',
    organization: 'Apollo Hospitals, Gandhinagar',
    sections: [
      {
        heading: 'History of Present Illness',
        content: 'Patient Smt. Sunita Patel brought to emergency casualty following a two-wheeler skid fall caused by roadside oil spill. Severe pain and deformity in left thigh. MLC registered: MLC/APL/2026/892.'
      },
      {
        heading: 'Final Diagnosis & Surgery',
        content: 'Diagnosis: Traumatic Closed Fracture Shaft of Left Femur. Surgery: Emergency Open Reduction and Internal Fixation (ORIF) with Intramedullary Interlocking Nail under spinal anaesthesia.'
      },
      {
        heading: 'Total Expenditure',
        content: 'Surgical Package, Implant (Titanium Intramedullary Nail), OT & Inpatient Ward Charges: Rs. 1,65,000/-.'
      }
    ]
  },

  // Case 3: Room Rent Proportionate Deduction
  {
    filename: 'sample_settlement_letter_room_rent.pdf',
    title: 'Claim Settlement Advice & Deduction Voucher',
    subtitle: 'Claim No: CLM-HDFC-2026-78100 | Insured: Vikramaditya Sengupta',
    organization: 'HDFC ERGO General Insurance Co. Ltd.',
    sections: [
      {
        heading: 'Claim Calculation & Deductions',
        content: 'Total Claimed: Rs. 2,10,000/-. Approved Amount: Rs. 1,37,600/-. Disallowed / Deducted: Rs. 72,400/-.'
      },
      {
        heading: 'Stated Grounds for Deduction',
        content: 'Proportionate deduction applied under Clause 3.2. Daily room rent eligibility is 1% of Sum Insured (Rs. 4,000/day). Insured opted for Deluxe Room at Rs. 6,000/day. Consequently, associated expenses including pharmacy, investigations, OT and ICU have been proportionately deducted by 33.3%.'
      }
    ]
  },
  {
    filename: 'sample_policy_wordings_hdfc.pdf',
    title: 'HDFC ERGO Health Policy Schedule & Terms',
    subtitle: 'Policy No: 2819/2024/091244 | Sum Insured: Rs. 4,00,000',
    organization: 'HDFC ERGO General Insurance Co. Ltd.',
    sections: [
      {
        heading: 'Clause 3.2 - Room Category Sub-limit',
        content: 'Room rent is capped at 1% of Sum Insured per day. Proportionate deduction shall apply to associate medical expenses directly linked to room tariff.'
      },
      {
        heading: 'Clause 3.2(a) - Regulatory Safe Harbor',
        content: 'In accordance with IRDAI directives, proportionate deduction shall not apply to non-associated expenses or items with standard MRP such as medicines and implants.'
      }
    ]
  },
  {
    filename: 'sample_discharge_summary_room_rent.pdf',
    title: 'Surgical Discharge Summary - Ruby Hospital',
    subtitle: 'Admission: 12-02-2026 | Discharge: 15-02-2026',
    organization: 'Ruby General Hospital, Kolkata',
    sections: [
      {
        heading: 'Diagnosis & Treatment',
        content: 'Acute Suppurative Appendicitis. Procedure: Emergency Laparoscopic Appendectomy under General Anaesthesia. Uneventful recovery.'
      },
      {
        heading: 'Itemized Hospital Bill Breakdown',
        content: 'Room Rent (3 days @ Rs 6,000): Rs. 18,000 | ICU / HDU Care: Rs. 22,000 | Pharmacy & Medicines: Rs. 38,000 | Disposable Trocar & Laparoscopic Consumables: Rs. 24,000 | Surgeon & OT Charges: Rs. 1,08,000 | Total: Rs. 2,10,000.'
      }
    ]
  },

  // Case 4: Insurer Correct (Dental)
  {
    filename: 'sample_rejection_letter_dental.pdf',
    title: 'Claim Repudiation Notice - NB-2026-99014',
    subtitle: 'Claim No: NB-2026-99014 | Insured: Priya Nair',
    organization: 'Niva Bupa Health Insurance Co. Ltd.',
    sections: [
      {
        heading: 'Repudiation Decision',
        content: 'Claim for dental ceramic veneers amounting to Rs. 45,000/- under Policy 3190821/2025 is repudiated under standard policy exclusion Clause 3.4.'
      },
      {
        heading: 'Reason Cited',
        content: 'Dental treatment or surgery of cosmetic nature is permanently excluded unless requiring hospitalisation arising directly out of accidental injury.'
      }
    ]
  },
  {
    filename: 'sample_policy_wordings_nivabupa.pdf',
    title: 'Niva Bupa Health Companion Policy Terms',
    subtitle: 'Policy No: 3190821/2025 | Standard Exclusions',
    organization: 'Niva Bupa Health Insurance Co. Ltd.',
    sections: [
      {
        heading: 'Clause 3.4 - Dental & Aesthetic Exclusion',
        content: 'Dental treatment or aesthetic corrective surgery is not covered unless necessitated by accidental trauma requiring minimum 24 hour hospitalisation.'
      }
    ]
  },
  {
    filename: 'sample_discharge_summary_dental.pdf',
    title: 'Clinic Treatment Summary - Smile Care Centre',
    subtitle: 'Date of Procedure: 20-02-2026 | Patient: Priya Nair',
    organization: 'Smile Care Aesthetic Clinic & Dental Centre, Bengaluru',
    sections: [
      {
        heading: 'Treatment Details',
        content: 'Elective cosmetic smile designing and ceramic veneers placed on teeth 11, 12, 21, 22. No history of physical trauma, fracture or underlying pathology. Purely elective aesthetic procedure.'
      }
    ]
  }
];

console.log('Generating sample PDFs with SAMPLE watermarks...');
for (const sample of samples) {
  createSamplePdf(sample);
}
console.log('All sample PDFs successfully generated in public/samples!');
