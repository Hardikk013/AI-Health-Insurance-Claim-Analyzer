import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Download, 
  Copy, 
  Check, 
  ArrowRight, 
  AlertCircle, 
  ShieldCheck, 
  ChevronRight
} from 'lucide-react';
import { useCaseStore } from '../store/useCaseStore';
import { exportLetterToPdf, exportLetterToDocx } from '../services/exportService';

export const AppealEditorPage: React.FC = () => {
  const { activeCase, updateLetterPlaceholder, updateLetterBody } = useCaseStore();

  const [copied, setCopied] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  if (!activeCase) {
    return (
      <main className="mx-auto w-full max-w-6xl px-4 py-16 text-center">
        <h2 className="text-xl font-semibold text-primary">No claim case loaded</h2>
        <Link to="/dashboard" className="text-xs text-accent underline mt-2 inline-block">Return to My cases</Link>
      </main>
    );
  }

  const appealLetter = activeCase.letters?.find(l => l.letter_type === 'grievance_appeal');

  if (!appealLetter) {
    return (
      <main className="mx-auto w-full max-w-6xl px-4 py-16 text-center space-y-4">
        <div className="rounded-xl border bg-card p-8 max-w-md mx-auto space-y-3">
          <AlertCircle className="size-8 text-muted-foreground mx-auto" />
          <h2 className="text-lg font-semibold text-primary">No appeal letter generated</h2>
          <p className="text-xs text-muted-foreground">
            The insurer's decision appears legally sound based on standard exclusions. To protect policyholders from futile costs and delays, ClaimFight only generates formal appeals where valid contestable grounds exist.
          </p>
          <Link
            to="/result"
            className="inline-flex min-h-11 items-center rounded-lg border bg-card px-4 text-xs font-medium text-primary hover:bg-muted/50"
          >
            Back to result
          </Link>
        </div>
      </main>
    );
  }

  const missingPlaceholders = appealLetter.placeholders.filter(p => p.is_missing || p.value.includes('['));
  const canDownload = missingPlaceholders.length === 0;

  const handlePlaceholderChange = (key: string, value: string) => {
    updateLetterPlaceholder(appealLetter.id, key, value);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(appealLetter.body);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleExportPdf = () => {
    exportLetterToPdf({
      title: 'Formal Grievance Redressal Appeal',
      recipientTitle: appealLetter.recipient_title,
      recipientOrg: appealLetter.recipient_organization,
      subject: appealLetter.subject,
      body: appealLetter.body,
      caseNumber: activeCase.case_number,
      patientName: activeCase.patient_name,
      policyNumber: activeCase.policy_number,
      claimNumber: activeCase.claim_number,
      hospitalName: activeCase.hospital_name,
      claimAmount: activeCase.claim_amount,
      deductedAmount: activeCase.deducted_amount,
    }, `ClaimFight_Grievance_Appeal_${activeCase.case_number}.pdf`);

    setDownloadSuccess('PDF generated successfully!');
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  const handleExportDocx = async () => {
    await exportLetterToDocx({
      title: 'Formal Grievance Redressal Appeal',
      recipientTitle: appealLetter.recipient_title,
      recipientOrg: appealLetter.recipient_organization,
      subject: appealLetter.subject,
      body: appealLetter.body,
      caseNumber: activeCase.case_number,
      patientName: activeCase.patient_name,
      policyNumber: activeCase.policy_number,
      claimNumber: activeCase.claim_number,
      hospitalName: activeCase.hospital_name,
      claimAmount: activeCase.claim_amount,
      deductedAmount: activeCase.deducted_amount,
    }, `ClaimFight_Grievance_Appeal_${activeCase.case_number}.docx`);

    setDownloadSuccess('Word (.docx) generated successfully!');
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 md:py-12 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-primary">
            Grievance appeal letter
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Addressed to the Insurer's Grievance Redressal Officer (GRO). Complete any highlighted blanks to enable export.
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
            disabled={!canDownload}
            className="inline-flex min-h-11 items-center rounded-lg bg-accent px-4 text-xs font-medium text-accent-foreground hover:opacity-90 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="size-3.5 mr-1.5" />
            <span>Download PDF</span>
          </button>

          <button
            type="button"
            onClick={handleExportDocx}
            disabled={!canDownload}
            className="inline-flex min-h-11 items-center rounded-lg bg-primary px-4 text-xs font-medium text-primary-foreground hover:opacity-90 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
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

      {/* Blank highlights notification */}
      {missingPlaceholders.length > 0 ? (
        <div className="rounded-xl border border-warning/40 bg-warning-soft p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-warning-foreground">
            <AlertCircle className="size-4" />
            <span>Complete {missingPlaceholders.length} highlighted field(s) before download is enabled:</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {missingPlaceholders.map((ph) => (
              <div key={ph.key} className="bg-card p-3 rounded-lg border border-border space-y-1">
                <label className="text-xs font-medium text-primary block">
                  {ph.label}
                </label>
                <input
                  type="text"
                  placeholder={ph.hint || `Enter ${ph.label}`}
                  value={ph.value.includes('[') ? '' : ph.value}
                  onChange={(e) => handlePlaceholderChange(ph.key, e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border rounded-lg focus:outline-none focus:border-accent bg-background"
                />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-3.5 bg-success-soft border border-success/30 rounded-lg flex items-center gap-2 text-xs text-success font-medium">
          <ShieldCheck className="size-4" />
          <span>All required fields completed. You can now download your representation.</span>
        </div>
      )}

      {/* Editable Letter Paper */}
      <div className="rounded-xl border bg-card p-6 sm:p-8 space-y-5 shadow-xs">
        {/* Recipient */}
        <div className="border-b pb-4 space-y-0.5 text-xs text-muted-foreground">
          <p className="font-semibold text-primary">TO:</p>
          <p className="font-medium text-foreground">{appealLetter.recipient_title}</p>
          <p>{appealLetter.recipient_organization}</p>
        </div>

        {/* Subject */}
        <div className="p-3 rounded-lg border bg-muted/30 text-xs sm:text-sm font-semibold text-primary">
          SUBJECT: {appealLetter.subject}
        </div>

        {/* Body Textarea */}
        <div className="space-y-1">
          <textarea
            rows={18}
            value={appealLetter.body}
            onChange={(e) => updateLetterBody(appealLetter.id, e.target.value)}
            className="w-full p-4 rounded-lg border focus:border-accent font-sans text-xs sm:text-sm text-foreground leading-relaxed shadow-xs"
          />
        </div>

        {/* Enclosures */}
        <div className="pt-4 border-t space-y-2 text-xs text-muted-foreground">
          <p className="font-semibold text-primary">Required Enclosures with Appeal:</p>
          <ul className="space-y-1 list-disc pl-5">
            <li>Copy of insurer rejection letter ({activeCase.claim_number})</li>
            <li>Copy of health insurance policy schedule ({activeCase.policy_number})</li>
            <li>Hospital final bill breakdown &amp; payment receipts</li>
            <li>Hospital discharge summary from {activeCase.hospital_name || 'hospital'}</li>
            <li>KYC document (Aadhaar or PAN of insured)</li>
          </ul>
        </div>
      </div>

      {/* Next Steps callout */}
      <div className="rounded-xl border bg-muted/40 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-semibold text-sm text-primary">What happens next?</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            The insurer must respond within 15–30 days. If rejected, escalate to IRDAI Bima Bharosa or the Ombudsman.
          </p>
        </div>
        <Link
          to="/next-steps"
          className="inline-flex min-h-11 items-center rounded-lg border bg-card px-4 text-xs font-medium text-primary hover:bg-muted/50 shrink-0"
        >
          <span>View escalation path</span>
          <ChevronRight className="size-3.5 ml-1" />
        </Link>
      </div>
    </main>
  );
};
