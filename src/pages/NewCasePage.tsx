import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FilePlus, 
  Sparkles, 
  AlertCircle, 
  Lock, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { DropZone } from '../components/common/DropZone';
import { useCaseStore } from '../store/useCaseStore';
import { useAuthStore } from '../store/useAuthStore';
import { SAMPLE_CASES } from '../data/sampleCases';

export const NewCasePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, setConsent } = useAuthStore();
  const { setPendingFiles } = useCaseStore();

  const [rejectionFile, setRejectionFile] = useState<File | null>(null);
  const [policyFile, setPolicyFile] = useState<File | null>(null);
  const [dischargeFile, setDischargeFile] = useState<File | null>(null);

  const [consentChecked, setConsentChecked] = useState<boolean>(user?.consent_given || false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoadingSample, setIsLoadingSample] = useState<boolean>(false);

  const handleConsentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setConsentChecked(checked);
    setConsent(checked);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!rejectionFile || !policyFile || !dischargeFile) {
      setErrorMessage('Please upload all 3 required documents (rejection letter, policy document, discharge summary).');
      return;
    }

    if (!consentChecked) {
      setErrorMessage('You must acknowledge the data handling and disclaimer consent before proceeding.');
      return;
    }

    setPendingFiles({
      rejection: rejectionFile,
      policy: policyFile,
      discharge: dischargeFile
    });

    navigate('/processing');
  };

  const handleLoadSample = async (sampleId: string) => {
    setIsLoadingSample(true);
    setErrorMessage(null);
    try {
      const sample = SAMPLE_CASES.find(s => s.id === sampleId) || SAMPLE_CASES[0];
      const [rBlob, pBlob, dBlob] = await Promise.all([
        fetch(sample.files.rejection_letter.url).then(r => r.blob()),
        fetch(sample.files.policy_document.url).then(r => r.blob()),
        fetch(sample.files.discharge_summary.url).then(r => r.blob())
      ]);

      const realRej = new File([rBlob], sample.files.rejection_letter.name, { type: 'application/pdf' });
      const realPol = new File([pBlob], sample.files.policy_document.name, { type: 'application/pdf' });
      const realDis = new File([dBlob], sample.files.discharge_summary.name, { type: 'application/pdf' });

      setRejectionFile(realRej);
      setPolicyFile(realPol);
      setDischargeFile(realDis);
      setConsentChecked(true);
    } catch (err) {
      console.error('Failed to load sample documents:', err);
      setErrorMessage('Could not load sample PDF files. Please upload your own files.');
    } finally {
      setIsLoadingSample(false);
    }
  };

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 md:py-12 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-semibold tracking-tight text-primary">New case</h1>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-semibold">
            <Sparkles className="size-3 text-accent" />
            <span>Google Gemini Verification Active</span>
          </span>
        </div>
        <p className="max-w-2xl text-muted-foreground text-sm">
          Upload the rejection letter, policy document, and discharge summary. Google Gemini 2.0 Flash checks policy wordings and hospital dates to determine whether grounds to contest exist.
        </p>
      </div>

      {/* Sample Quick Fill */}
      <div className="rounded-xl border bg-muted/30 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-warning shrink-0" />
          <p className="text-xs text-muted-foreground">
            Want to test without uploading your own files? Auto-fill with a sample case:
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => handleLoadSample('case-waiting-period-cataract')}
            className="rounded-lg border bg-card px-3 py-1.5 text-xs font-medium text-primary hover:bg-muted/50 transition-colors"
          >
            Cataract (Waiting Period)
          </button>
          <button
            type="button"
            onClick={() => handleLoadSample('case-ped-hypertension-fracture')}
            className="rounded-lg border bg-card px-3 py-1.5 text-xs font-medium text-primary hover:bg-muted/50 transition-colors"
          >
            Accident / PED
          </button>
          <button
            type="button"
            onClick={() => handleLoadSample('case-sublimit-room-rent')}
            className="rounded-lg border bg-card px-3 py-1.5 text-xs font-medium text-primary hover:bg-muted/50 transition-colors"
          >
            Room Rent
          </button>
        </div>
      </div>

      {/* Upload Dropzones Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-4">
          <DropZone
            label="1. Insurer rejection letter"
            description="The letter or deduction breakdown from your insurer or TPA citing repudiation clauses"
            documentType="rejection_letter"
            selectedFile={rejectionFile}
            onFileSelect={setRejectionFile}
            required
          />

          <DropZone
            label="2. Policy document"
            description="The policy terms booklet, schedule, or prospectus stating waiting periods and exclusions"
            documentType="policy_document"
            selectedFile={policyFile}
            onFileSelect={setPolicyFile}
            required
          />

          <DropZone
            label="3. Hospital discharge summary"
            description="The hospital record stating diagnosis, procedure, admission date, and clinical history"
            documentType="discharge_summary"
            selectedFile={dischargeFile}
            onFileSelect={setDischargeFile}
            required
          />
        </div>

        {/* Mandatory DPDP Consent */}
        <div className="rounded-xl border bg-card p-5 space-y-3">
          <div className="flex items-start gap-3">
            <input
              id="mandatory-consent"
              type="checkbox"
              checked={consentChecked}
              onChange={handleConsentChange}
              className="mt-1 size-4 rounded border-border text-accent focus:ring-accent"
            />
            <label htmlFor="mandatory-consent" className="text-sm text-foreground cursor-pointer leading-relaxed">
              I understand my documents are processed by AI, automatically deleted after 24 hours, and this is general information, not legal advice.
            </label>
          </div>

          <div className="pl-7 text-xs text-muted-foreground flex items-center gap-1.5 border-t pt-2">
            <Lock className="size-3.5 text-accent" />
            <span>DPDP Act principles: 24h auto-purge • No model training • 15-minute signed URLs</span>
          </div>
        </div>

        {errorMessage && (
          <div className="rounded-xl border border-destructive/40 bg-danger-soft p-4 text-xs text-destructive flex items-center gap-2">
            <AlertCircle className="size-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="inline-flex min-h-12 items-center rounded-lg bg-accent px-6 font-medium text-accent-foreground hover:opacity-90 shadow-sm"
          >
            <span>Run analysis</span>
            <ArrowRight className="size-4 ml-2" />
          </button>
        </div>
      </form>
    </main>
  );
};
