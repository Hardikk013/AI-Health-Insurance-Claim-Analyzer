import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Scale, 
  Download, 
  Copy, 
  Check, 
  ExternalLink, 
  AlertCircle
} from 'lucide-react';
import { useCaseStore } from '../store/useCaseStore';
import { exportLetterToPdf, exportLetterToDocx } from '../services/exportService';

export const OmbudsmanComplaintPage: React.FC = () => {
  const { activeCase, updateLetterBody } = useCaseStore();
  const [copied, setCopied] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  if (!activeCase) {
    return (
      <main className="mx-auto w-full max-w-6xl px-4 py-16 text-center">
        <h2 className="text-xl font-semibold text-primary">No claim case loaded</h2>
        <Link to="/dashboard" className="text-xs text-accent underline mt-2 inline-block">Go to my cases</Link>
      </main>
    );
  }

  const ombudsmanLetter = activeCase.letters?.find(l => l.letter_type === 'ombudsman_complaint');

  if (!ombudsmanLetter) {
    return (
      <main className="mx-auto w-full max-w-6xl px-4 py-16 text-center">
        <div className="rounded-xl border bg-card p-8 max-w-md mx-auto space-y-3">
          <Scale className="size-8 text-muted-foreground mx-auto" />
          <h2 className="text-lg font-semibold text-primary">No Ombudsman draft needed</h2>
          <p className="text-xs text-muted-foreground">
            An Ombudsman complaint is drafted only when genuine grounds to contest exist and the insurer has repudiated unfairly.
          </p>
          <Link to="/result" className="text-xs text-accent font-medium inline-block mt-2">
            Return to results
          </Link>
        </div>
      </main>
    );
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(ombudsmanLetter.body);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleExportPdf = () => {
    exportLetterToPdf({
      title: 'Complaint to the Insurance Ombudsman (Under Rule 13)',
      recipientTitle: ombudsmanLetter.recipient_title,
      recipientOrg: ombudsmanLetter.recipient_organization,
      subject: ombudsmanLetter.subject,
      body: ombudsmanLetter.body,
      caseNumber: activeCase.case_number,
      patientName: activeCase.patient_name,
      policyNumber: activeCase.policy_number,
      claimNumber: activeCase.claim_number,
      hospitalName: activeCase.hospital_name,
      claimAmount: activeCase.claim_amount,
      deductedAmount: activeCase.deducted_amount,
    }, `ClaimFight_Ombudsman_Complaint_${activeCase.case_number}.pdf`);

    setDownloadSuccess('Ombudsman complaint PDF generated!');
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  const handleExportDocx = async () => {
    await exportLetterToDocx({
      title: 'Complaint to the Insurance Ombudsman (Under Rule 13)',
      recipientTitle: ombudsmanLetter.recipient_title,
      recipientOrg: ombudsmanLetter.recipient_organization,
      subject: ombudsmanLetter.subject,
      body: ombudsmanLetter.body,
      caseNumber: activeCase.case_number,
      patientName: activeCase.patient_name,
      policyNumber: activeCase.policy_number,
      claimNumber: activeCase.claim_number,
      hospitalName: activeCase.hospital_name,
      claimAmount: activeCase.claim_amount,
      deductedAmount: activeCase.deducted_amount,
    }, `ClaimFight_Ombudsman_Complaint_${activeCase.case_number}.docx`);

    setDownloadSuccess('Ombudsman complaint Word document generated!');
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 md:py-12 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-primary">
            Insurance Ombudsman complaint
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Formulated under Rule 13 of the Insurance Ombudsman Rules, 2017. Free of cost with no lawyer required.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex min-h-11 items-center rounded-lg border bg-card px-3 text-xs font-medium text-primary hover:bg-muted/50 shadow-xs"
          >
            {copied ? <Check className="size-3.5 text-success mr-1.5" /> : <Copy className="size-3.5 mr-1.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            type="button"
            onClick={handleExportPdf}
            className="inline-flex min-h-11 items-center rounded-lg bg-accent px-4 text-xs font-medium text-accent-foreground hover:opacity-90 shadow-sm"
          >
            <Download className="size-3.5 mr-1.5" />
            <span>Download PDF</span>
          </button>

          <button
            type="button"
            onClick={handleExportDocx}
            className="inline-flex min-h-11 items-center rounded-lg bg-primary px-4 text-xs font-medium text-primary-foreground hover:opacity-90 shadow-sm"
          >
            <Download className="size-3.5 mr-1.5" />
            <span>Download Word</span>
          </button>
        </div>
      </div>

      {downloadSuccess && (
        <div className="p-3 bg-success-soft border border-success/30 rounded-lg text-xs text-success font-medium flex items-center gap-2">
          <Check className="size-4" />
          <span>{downloadSuccess}</span>
        </div>
      )}

      {/* Rules Notice */}
      <div className="rounded-xl border bg-muted/40 p-4 space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-primary">
          <AlertCircle className="size-4 text-warning" />
          <span>Prerequisites under Insurance Ombudsman Rules:</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-muted-foreground">
          <div className="rounded-lg border bg-card p-3">
            <p className="font-semibold text-primary">1. Written representation</p>
            <p className="mt-0.5">Complaint can be filed only after making a formal grievance to insurer GRO.</p>
          </div>
          <div className="rounded-lg border bg-card p-3">
            <p className="font-semibold text-primary">2. 30-day waiting rule</p>
            <p className="mt-0.5">Approach the Ombudsman after rejection, partial reply, or 30 days of no reply.</p>
          </div>
          <div className="rounded-lg border bg-card p-3">
            <p className="font-semibold text-primary">3. Financial ceiling</p>
            <p className="mt-0.5">Disputed claim must not exceed ₹30 Lakhs (including compensation).</p>
          </div>
        </div>
      </div>

      {/* Complaint Body */}
      <div className="rounded-xl border bg-card p-6 sm:p-8 space-y-5 shadow-xs">
        <div className="p-3 rounded-lg border bg-muted/30 text-xs sm:text-sm font-semibold text-primary">
          SUBJECT: {ombudsmanLetter.subject}
        </div>

        <div className="space-y-1">
          <textarea
            rows={18}
            value={ombudsmanLetter.body}
            onChange={(e) => updateLetterBody(ombudsmanLetter.id, e.target.value)}
            className="w-full p-4 rounded-lg border focus:border-accent font-sans text-xs sm:text-sm text-foreground leading-relaxed shadow-xs"
          />
        </div>

        <div className="pt-3 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>File online or submit to your regional Insurance Ombudsman centre.</span>
          <a
            href="https://www.cioins.co.in"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 font-medium text-accent hover:underline"
          >
            <span>Visit Council for Insurance Ombudsmen Portal</span>
            <ExternalLink className="size-3" />
          </a>
        </div>
      </div>
    </main>
  );
};
