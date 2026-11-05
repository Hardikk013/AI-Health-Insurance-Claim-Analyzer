import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { 
  Scale, 
  Download, 
  Copy, 
  Check, 
  ExternalLink, 
  AlertCircle,
  ArrowLeft
} from 'lucide-react';
import { useCaseStore } from '../store/useCaseStore';
import { SAMPLE_CASES } from '../data/sampleCases';
import { exportLetterToPdf, exportLetterToDocx } from '../services/exportService';
import { Button } from '../components/common/Button';
import { Tag } from '../components/common/Tag';
import { PageTransition } from '../components/common/PageTransition';

export const OmbudsmanComplaintPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { 
    activeCase, 
    cases, 
    loadCases, 
    setActiveCase, 
    loadSampleCase, 
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
          <p className="text-xs text-muted">Please select a case from My cases.</p>
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

  const ombudsmanLetter = activeCase.letters?.find(l => l.letter_type === 'ombudsman_complaint');

  if (!ombudsmanLetter) {
    return (
      <main className="min-h-[calc(100vh-140px)] bg-cream py-16 px-4">
        <div className="rounded-2xl border border-line bg-surface p-8 max-w-md mx-auto space-y-4 text-center shadow-soft">
          <Scale className="size-8 text-muted mx-auto" />
          <h2 className="text-lg font-medium text-ink">No Ombudsman draft needed</h2>
          <p className="text-xs text-muted leading-relaxed">
            An Ombudsman complaint is drafted only when genuine grounds to contest exist and the insurer has repudiated unfairly.
          </p>
          <Button
            variant="secondary"
            size="md"
            className="w-full justify-center"
            onClick={() => navigate('/result')}
          >
            <span>Return to results</span>
          </Button>
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
                Insurance Ombudsman complaint
              </h1>
              <p className="text-xs sm:text-sm text-muted">
                Formulated under Rule 13 & 14 of the Insurance Ombudsman Rules, 2017. Zero court fees and no lawyer required.
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
              >
                <Download className="size-3.5 mr-1.5" />
                <span>Download PDF</span>
              </Button>

              <Button
                variant="secondary"
                size="sm"
                onClick={handleExportDocx}
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

          {/* Rules Notice */}
          <div className="rounded-2xl border border-line bg-surface p-5 space-y-3 shadow-soft">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wide text-ink font-semibold">
              <Scale className="size-4 text-teal" />
              <span>Prerequisites under Insurance Ombudsman Rules:</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-muted">
              <div className="rounded-xl border border-line bg-cream p-3.5 space-y-1">
                <p className="font-semibold text-ink">1. Prior written appeal</p>
                <p className="leading-relaxed">Must first submit written grievance representation to insurer's GRO.</p>
              </div>
              <div className="rounded-xl border border-line bg-cream p-3.5 space-y-1">
                <p className="font-semibold text-ink">2. 30-day waiting rule</p>
                <p className="leading-relaxed">Eligible after 30 days of no reply or after receiving repudiation letter.</p>
              </div>
              <div className="rounded-xl border border-line bg-cream p-3.5 space-y-1">
                <p className="font-semibold text-ink">3. Statutory award limit</p>
                <p className="leading-relaxed">Ombudsman jurisdiction applies up to ₹50,00,000 compensation ceiling.</p>
              </div>
            </div>
          </div>

          {/* Complaint Body */}
          <div className="rounded-2xl border border-line bg-surface p-6 sm:p-8 space-y-5 shadow-soft">
            <div className="p-3.5 rounded-xl border border-line bg-cream text-xs sm:text-sm font-semibold text-ink">
              SUBJECT: {ombudsmanLetter.subject}
            </div>

            <div className="space-y-1">
              <textarea
                rows={18}
                value={ombudsmanLetter.body}
                onChange={(e) => updateLetterBody(ombudsmanLetter.id, e.target.value)}
                className="w-full p-4 rounded-xl border border-line focus:border-teal bg-cream/30 font-mono text-xs sm:text-sm text-ink leading-relaxed shadow-soft outline-none"
              />
            </div>

            <div className="pt-3 border-t border-line flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-muted">
              <span>File online or submit to your regional Insurance Ombudsman office.</span>
              <a
                href="https://www.cioins.co.in"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 font-mono text-xs text-teal hover:underline"
              >
                <span>Visit Council for Insurance Ombudsmen Portal</span>
                <ExternalLink className="size-3" />
              </a>
            </div>
          </div>
        </div>
      </main>
    </PageTransition>
  );
};
