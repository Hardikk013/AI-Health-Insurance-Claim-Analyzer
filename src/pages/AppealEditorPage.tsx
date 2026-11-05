import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { 
  FileText, 
  Download, 
  Copy, 
  Check, 
  ArrowRight, 
  AlertCircle, 
  ShieldCheck, 
  ChevronRight,
  ArrowLeft
} from 'lucide-react';
import { useCaseStore } from '../store/useCaseStore';
import { SAMPLE_CASES } from '../data/sampleCases';
import { exportLetterToPdf, exportLetterToDocx } from '../services/exportService';
import { Button } from '../components/common/Button';
import { Tag } from '../components/common/Tag';
import { PageTransition } from '../components/common/PageTransition';

export const AppealEditorPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { 
    activeCase, 
    cases, 
    loadCases, 
    setActiveCase, 
    loadSampleCase, 
    updateLetterPlaceholder, 
    updateLetterBody 
  } = useCaseStore();

  const [copied, setCopied] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadCases();
  }, [loadCases]);

  useEffect(() => {
    if (id) {
      const saved = cases.find(c => c.id === id);
      if (saved) {
        setActiveCase(saved);
      } else {
        const sample = SAMPLE_CASES.find(s => s.id === id);
        if (sample) {
          loadSampleCase(id);
        }
      }
    } else if (!activeCase) {
      if (cases.length > 0) {
        setActiveCase(cases[0]);
      } else {
        loadSampleCase('case-waiting-period-cataract');
      }
    }
  }, [id, cases, activeCase, setActiveCase, loadSampleCase]);

  if (!activeCase) {
    return (
      <main className="min-h-[calc(100vh-140px)] bg-cream py-16 px-4">
        <div className="mx-auto w-full max-w-md text-center space-y-4 rounded-2xl border border-line bg-surface p-8 shadow-soft">
          <AlertCircle className="size-10 text-muted mx-auto" />
          <h2 className="text-xl font-medium text-ink">No claim case loaded</h2>
          <p className="text-xs text-muted">Please create a case or select one from My cases.</p>
          <div className="pt-2">
            <Button
              variant="primary"
              size="md"
              className="w-full justify-center"
              onClick={() => navigate('/dashboard')}
            >
              <span>Go to My cases</span>
            </Button>
          </div>
        </div>
      </main>
    );
  }

  const appealLetter = activeCase.letters?.find(l => l.letter_type === 'grievance_appeal');

  if (!appealLetter) {
    return (
      <main className="min-h-[calc(100vh-140px)] bg-cream py-16 px-4">
        <div className="rounded-2xl border border-line bg-surface p-8 max-w-md mx-auto space-y-4 text-center shadow-soft">
          <AlertCircle className="size-10 text-muted mx-auto" />
          <h2 className="text-lg font-medium text-ink">No appeal letter generated</h2>
          <p className="text-xs text-muted leading-relaxed">
            The insurer's decision appears legally sound based on standard exclusions. To protect policyholders from futile costs and delays, ClaimFight only generates formal appeals where valid contestable grounds exist.
          </p>
          <Button
            variant="secondary"
            size="md"
            className="w-full justify-center"
            onClick={() => navigate('/result')}
          >
            <span>Back to result</span>
          </Button>
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
    <PageTransition>
      <main className="min-h-screen bg-cream py-8 md:py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-5xl space-y-8">
          
          {/* Top Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => navigate('/result')}
                className="inline-flex items-center gap-1 text-xs font-mono text-muted hover:text-ink transition-colors cursor-pointer mb-1"
              >
                <ArrowLeft className="size-3.5" />
                <span>Back to analysis</span>
              </button>
              <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-ink">
                Grievance appeal letter
              </h1>
              <p className="text-xs sm:text-sm text-muted">
                Addressed to the Insurer's Grievance Redressal Officer (GRO). Complete any highlighted blanks to enable export.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleCopy}
              >
                {copied ? <Check className="size-3.5 text-teal mr-1" /> : <Copy className="size-3.5 mr-1" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </Button>

              <Button
                variant="primary"
                size="md"
                onClick={handleExportPdf}
                disabled={!canDownload}
              >
                <Download className="size-3.5 mr-1.5" />
                <span>Download PDF</span>
              </Button>

              <Button
                variant="secondary"
                size="sm"
                onClick={handleExportDocx}
                disabled={!canDownload}
              >
                <Download className="size-3.5 mr-1" />
                <span>Word (.docx)</span>
              </Button>
            </div>
          </div>

          {downloadSuccess && (
            <div className="p-3 bg-mint border border-teal/30 rounded-xl text-xs text-[#085041] font-mono font-medium flex items-center gap-2">
              <Check className="size-4 text-teal" />
              <span>{downloadSuccess}</span>
            </div>
          )}

          {/* Blank highlights notification */}
          {missingPlaceholders.length > 0 ? (
            <div className="rounded-2xl border border-amber/40 bg-[#FAEEDA]/60 p-5 space-y-3 shadow-soft">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#633806]">
                <AlertCircle className="size-4 text-amber" />
                <span>Complete {missingPlaceholders.length} highlighted field(s) before download is enabled:</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {missingPlaceholders.map((ph) => (
                  <div key={ph.key} className="bg-surface p-3.5 rounded-xl border border-line space-y-1">
                    <label className="text-xs font-medium text-ink block">
                      {ph.label}
                    </label>
                    <input
                      type="text"
                      placeholder={ph.hint || `Enter ${ph.label}`}
                      value={ph.value.includes('[') ? '' : ph.value}
                      onChange={(e) => handlePlaceholderChange(ph.key, e.target.value)}
                      className="w-full px-3 py-1.5 text-xs border border-line rounded-lg focus:outline-none focus:border-teal bg-cream/50 text-ink"
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-4 bg-mint/40 border border-teal/30 rounded-2xl flex items-center gap-2 text-xs text-[#085041] font-mono">
              <ShieldCheck className="size-4 text-teal" />
              <span>All required placeholders completed. You can export your formal grievance appeal.</span>
            </div>
          )}

          {/* Editable Letter Paper */}
          <div className="rounded-2xl border border-line bg-surface p-6 sm:p-8 space-y-5 shadow-soft">
            {/* Recipient */}
            <div className="border-b border-line pb-4 space-y-1 text-xs text-muted">
              <p className="font-mono uppercase text-ink font-semibold">TO:</p>
              <p className="font-medium text-ink">{appealLetter.recipient_title}</p>
              <p>{appealLetter.recipient_organization}</p>
            </div>

            {/* Subject */}
            <div className="p-3.5 rounded-xl border border-line bg-cream text-xs sm:text-sm font-semibold text-ink">
              SUBJECT: {appealLetter.subject}
            </div>

            {/* Body Textarea */}
            <div className="space-y-1">
              <textarea
                rows={18}
                value={appealLetter.body}
                onChange={(e) => updateLetterBody(appealLetter.id, e.target.value)}
                className="w-full p-4 rounded-xl border border-line focus:border-teal bg-cream/30 font-mono text-xs sm:text-sm text-ink leading-relaxed shadow-soft outline-none"
              />
            </div>

            {/* Enclosures */}
            <div className="pt-4 border-t border-line space-y-2 text-xs text-muted">
              <p className="font-mono uppercase text-ink font-semibold">Required Enclosures with Appeal:</p>
              <ul className="space-y-1 list-disc pl-5">
                <li>Copy of insurer repudiation letter ({activeCase.claim_number})</li>
                <li>Copy of health insurance policy schedule ({activeCase.policy_number})</li>
                <li>Hospital final bill breakdown &amp; payment receipts</li>
                <li>Hospital discharge summary from {activeCase.hospital_name || 'hospital'}</li>
                <li>KYC document (Aadhaar or PAN of insured)</li>
              </ul>
            </div>
          </div>

          {/* Next Steps callout */}
          <div className="rounded-2xl border border-line bg-surface p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-soft">
            <div>
              <h3 className="font-medium text-sm text-ink">What happens after sending this?</h3>
              <p className="text-xs text-muted mt-0.5 leading-normal">
                Under IRDAI Protection of Policyholders' Interests Regulations, the insurer must resolve your grievance within 30 days.
              </p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate('/next-steps')}
              className="shrink-0"
            >
              <span>View escalation path</span>
              <ChevronRight className="size-3.5 ml-1" />
            </Button>
          </div>
        </div>
      </main>
    </PageTransition>
  );
};
