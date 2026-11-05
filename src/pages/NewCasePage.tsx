import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  ArrowRight,
  X, 
  Sparkles, 
  ShieldCheck, 
  AlertCircle, 
  Check, 
  ChevronRight, 
  Lock, 
  RefreshCw,
  Clock,
  Calendar,
  Building2,
  FileText
} from 'lucide-react';
import { useCaseStore } from '../store/useCaseStore';
import { useAuthStore } from '../store/useAuthStore';
import { SAMPLE_CASES } from '../data/sampleCases';
import { Mascot } from '../components/common/Mascot';
import { Button } from '../components/common/Button';
import { FileSlot } from '../components/common/FileSlot';
import { FloatingInput } from '../components/common/FloatingInput';
import { stepTransitionVariants, MOTION } from '../config/motion';

const STORAGE_KEY = 'claimfight_new_case_draft';

const COMMON_INSURERS = [
  'Star Health and Allied Insurance',
  'HDFC ERGO General Insurance',
  'Care Health Insurance',
  'Niva Bupa Health Insurance',
  'ICICI Lombard General Insurance',
  'Bajaj Allianz General Insurance',
  'New India Assurance',
  'United India Insurance',
  'National Insurance Company',
  'Oriental Insurance Company',
  'Aditya Birla Health Insurance',
  'ManipalCigna Health Insurance',
  'Tata AIG General Insurance',
  'SBI General Insurance',
];

interface RejectionOption {
  id: string;
  title: string;
  description: string;
  clauseTag: string;
}

const REJECTION_OPTIONS: RejectionOption[] = [
  {
    id: 'waiting_period',
    title: 'Waiting period cited',
    description: 'Specific illness or 24/48-month exclusion invoked by the insurer.',
    clauseTag: 'Clause 4.1 / 4.2',
  },
  {
    id: 'ped',
    title: 'Pre-existing disease (PED)',
    description: 'Insurer claims the illness existed prior to policy inception and was undisclosed.',
    clauseTag: 'Non-disclosure',
  },
  {
    id: 'room_rent',
    title: 'Room rent sub-limit deduction',
    description: 'Disproportionate deduction applied across ICU, surgery, and doctor charges.',
    clauseTag: 'Rule 2020 circular',
  },
  {
    id: 'medical_necessity',
    title: 'Not medically necessary',
    description: 'Insurer claims treatment could be performed as OPD or hospitalization was unjustified.',
    clauseTag: 'Active line of care',
  },
  {
    id: 'other',
    title: 'Other reason / Not sure',
    description: 'Let Google Gemini examine the full rejection letter to extract grounds.',
    clauseTag: 'Full Audit',
  },
];

const ANALYSIS_STATUS_MESSAGES = [
  'Reading your rejection letter with Gemini Vision…',
  'Extracting insurer stated grounds & repudiation clauses…',
  'Checking policy terms, waiting periods, and exclusions…',
  'Recalculating continuous coverage credit & hospital dates…',
  'Checking IRDAI 2020 guidelines & Ombudsman Rule 17 limits…',
  'Formulating formal grievance appeal representations…',
];

export const NewCasePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, setConsent } = useAuthStore();
  const { 
    pendingFiles, 
    setPendingFiles, 
    runAnalysis, 
    currentStepIndex, 
    analysisProgress 
  } = useCaseStore();

  // Wizard step (1 to 5)
  const [step, setStep] = useState<number>(1);
  const [direction, setDirection] = useState<number>(1);

  // Form inputs
  const [rejectionCategory, setRejectionCategory] = useState<string>('waiting_period');
  const [insurerName, setInsurerName] = useState<string>('');
  const [claimAmount, setClaimAmount] = useState<string>('');
  const [hospitalizationDate, setHospitalizationDate] = useState<string>('');
  const [patientName, setPatientName] = useState<string>('');
  const dateInputRef = useRef<HTMLInputElement>(null);

  const toISODate = (val: string): string => {
    if (!val) return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(val)) return val;
    const match = val.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
    if (match) {
      const [, d, m, y] = match;
      return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    }
    return '';
  };
  
  // Files
  const [rejectionFile, setRejectionFile] = useState<File | null>(null);
  const [policyFile, setPolicyFile] = useState<File | null>(null);
  const [dischargeFile, setDischargeFile] = useState<File | null>(null);

  // Consent & UI
  const [consentChecked, setConsentChecked] = useState<boolean>(user?.consent_given || true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusMessageIndex, setStatusMessageIndex] = useState<number>(0);
  const [isLoadingSample, setIsLoadingSample] = useState<boolean>(false);
  const [selectedSampleId, setSelectedSampleId] = useState<string | null>(null);

  // Restore saved draft from localStorage or pending files on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const validIds = REJECTION_OPTIONS.map((o) => o.id);
        if (parsed.rejectionCategory && validIds.includes(parsed.rejectionCategory)) {
          setRejectionCategory(parsed.rejectionCategory);
        } else {
          setRejectionCategory('waiting_period');
        }
        if (parsed.insurerName) setInsurerName(parsed.insurerName);
        if (parsed.claimAmount) setClaimAmount(parsed.claimAmount);
        if (parsed.hospitalizationDate) setHospitalizationDate(parsed.hospitalizationDate);
        if (parsed.patientName) setPatientName(parsed.patientName);
      }
    } catch {
      // Ignore storage errors
    }

    // If pending files came from homepage dropzone
    if (pendingFiles?.rejection) {
      setRejectionFile(pendingFiles.rejection);
      if (pendingFiles.policy) setPolicyFile(pendingFiles.policy);
      if (pendingFiles.discharge) setDischargeFile(pendingFiles.discharge);
      // Auto-advance to step 3 if user already uploaded rejection
      setStep(3);
    }

    // If query param ?sample=... is passed
    const sampleParam = searchParams.get('sample');
    if (sampleParam) {
      handleLoadSample(sampleParam);
    }
  }, []);

  // Save draft on changes
  useEffect(() => {
    try {
      const draft = {
        rejectionCategory,
        insurerName,
        claimAmount,
        hospitalizationDate,
        patientName,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    } catch {
      // Ignore storage errors
    }
  }, [rejectionCategory, insurerName, claimAmount, hospitalizationDate, patientName]);

  // Rotate status message during analysis
  useEffect(() => {
    if (step === 4) {
      const interval = setInterval(() => {
        setStatusMessageIndex((prev) => (prev + 1) % ANALYSIS_STATUS_MESSAGES.length);
      }, 2400);
      return () => clearInterval(interval);
    }
  }, [step]);

  // Step navigation helpers
  const goToStep = (newStep: number) => {
    setDirection(newStep > step ? 1 : -1);
    setStep(newStep);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectCategory = (categoryId: string) => {
    setRejectionCategory(categoryId);
    setErrorMessage(null);
  };

  const handleNextStep = () => {
    setErrorMessage(null);

    if (step === 1) {
      if (!rejectionCategory) {
        setErrorMessage('Please select a rejection reason to continue.');
        return;
      }
      goToStep(2);
    } else if (step === 2) {
      goToStep(3);
    } else if (step === 3) {
      if (!rejectionFile) {
        setErrorMessage('Please upload your insurer rejection letter to run the analysis.');
        return;
      }
      if (!consentChecked) {
        setErrorMessage('Please accept the data processing terms before proceeding.');
        return;
      }

      // Start Analysis on step 4
      goToStep(4);
      triggerAnalysis();
    }
  };

  const handlePrevStep = () => {
    setErrorMessage(null);
    if (step > 1 && step !== 4) {
      goToStep(step - 1);
    }
  };

  // Trigger analysis pipeline
  const triggerAnalysis = async () => {
    setErrorMessage(null);
    try {
      // Prepare files
      const filesPayload = {
        rejection: rejectionFile!,
        policy: policyFile || { name: 'sample_policy_wordings_star.pdf', size: 3400000, url: '/samples/sample_policy_wordings_star.pdf' },
        discharge: dischargeFile || { name: 'sample_discharge_summary_cataract.pdf', size: 850000, url: '/samples/sample_discharge_summary_cataract.pdf' }
      };

      setPendingFiles({
        rejection: rejectionFile!,
        policy: policyFile,
        discharge: dischargeFile,
      });

      await runAnalysis({
        files: filesPayload,
        sampleId: selectedSampleId || undefined,
      });

      // Clear draft after successful start
      localStorage.removeItem(STORAGE_KEY);

      // Move to Step 5 (Success)
      goToStep(5);
    } catch (err: any) {
      console.error('Analysis failed:', err);
      setErrorMessage(err?.message || 'Analysis failed. Please check your documents and try again.');
    }
  };

  // Load sample case helper
  const handleLoadSample = async (sampleId: string) => {
    setIsLoadingSample(true);
    setSelectedSampleId(sampleId);
    setErrorMessage(null);
    try {
      const sample = SAMPLE_CASES.find(s => s.id === sampleId) || SAMPLE_CASES[0];
      setInsurerName(sample.insurerName);
      setClaimAmount(String(sample.claimAmount));
      setPatientName(sample.patientName);

      if (sample.id === 'case-waiting-period-cataract') {
        setRejectionCategory('waiting_period');
        setHospitalizationDate('2026-08-02');
      } else if (sample.id === 'case-ped-hypertension-fracture') {
        setRejectionCategory('ped');
        setHospitalizationDate('2026-05-15');
      } else if (sample.id === 'case-sublimit-room-rent') {
        setRejectionCategory('room_rent');
        setHospitalizationDate('2026-04-20');
      }

      const [rBlob, pBlob, dBlob] = await Promise.all([
        fetch(sample.files.rejection_letter.url).then(r => r.blob()),
        fetch(sample.files.policy_document.url).then(r => r.blob()),
        fetch(sample.files.discharge_summary.url).then(r => r.blob()),
      ]);

      const realRej = new File([rBlob], sample.files.rejection_letter.name, { type: 'application/pdf' });
      const realPol = new File([pBlob], sample.files.policy_document.name, { type: 'application/pdf' });
      const realDis = new File([dBlob], sample.files.discharge_summary.name, { type: 'application/pdf' });

      setRejectionFile(realRej);
      setPolicyFile(realPol);
      setDischargeFile(realDis);
      setConsentChecked(true);
      setConsent(true);
      goToStep(3);
    } catch (err) {
      console.error('Failed to load sample files:', err);
      setErrorMessage('Could not load sample files. Please select files from your computer.');
    } finally {
      setIsLoadingSample(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-140px)] bg-cream py-6 md:py-10 px-4">
      <div className="mx-auto w-full max-w-[560px]">
        {/* Top Navigation Bar: Back, Step Counter, Close */}
        <div className="flex items-center justify-between pb-3">
          {step > 1 && step !== 4 && step !== 5 ? (
            <button
              type="button"
              onClick={handlePrevStep}
              className="inline-flex items-center gap-1.5 text-xs font-mono uppercase text-muted hover:text-ink transition-colors cursor-pointer"
            >
              <ArrowLeft className="size-4" />
              <span>Back</span>
            </button>
          ) : (
            <div className="w-12" />
          )}

          <div className="flex items-center gap-1 text-xs font-mono tracking-wider text-muted uppercase">
            <span>Step</span>
            <span className="font-semibold text-ink">{Math.min(step, 5)}</span>
            <span>of 5</span>
          </div>

          <button
            type="button"
            onClick={() => navigate('/')}
            className="p-1 rounded-full text-muted hover:text-ink hover:bg-muted/15 transition-colors cursor-pointer"
            title="Cancel and return home"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Linear Progress Bar */}
        <div className="w-full bg-line h-1 rounded-full overflow-hidden mb-6">
          <motion.div
            className="bg-teal h-full rounded-full"
            initial={false}
            animate={{ width: `${(Math.min(step, 5) / 5) * 100}%` }}
            transition={{ duration: MOTION.durations.base, ease: MOTION.easings.easeOutCubic }}
          />
        </div>

        {/* Step Content Container */}
        <div className="relative">
          <AnimatePresence mode="wait" custom={direction}>
            {/* STEP 1: Reason for Rejection */}
            {step === 1 && (
              <motion.div
                key="step-1"
                custom={direction}
                variants={stepTransitionVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="space-y-6"
              >
                <div>
                  <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-ink">
                    Why did the insurer reject your claim?
                  </h1>
                  <p className="text-sm text-muted mt-1.5 leading-relaxed">
                    Select the repudiation reason stated in your rejection letter, or choose not sure.
                  </p>
                </div>

                {/* Option Cards */}
                <div role="radiogroup" aria-label="Insurance claim rejection reason" className="space-y-2.5">
                  {REJECTION_OPTIONS.map((option) => {
                    const isSelected = rejectionCategory === option.id;
                    return (
                      <button
                        type="button"
                        key={option.id}
                        role="radio"
                        aria-checked={isSelected}
                        onClick={() => handleSelectCategory(option.id)}
                        className={`w-full group relative flex items-start gap-3.5 rounded-2xl border-2 p-3.5 sm:p-4 text-left transition-all duration-150 focus-visible:ring-2 focus-visible:ring-teal focus-visible:outline-none cursor-pointer ${
                          isSelected
                            ? 'border-teal bg-mint/35 shadow-soft ring-2 ring-teal/20'
                            : 'border-line bg-surface hover:border-teal/40 hover:bg-cream/40'
                        }`}
                      >
                        {/* Radio Circle with Solid Black Dot */}
                        <div
                          className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-150 ${
                            isSelected
                              ? 'border-black bg-white ring-2 ring-black/10'
                              : 'border-line bg-white group-hover:border-black/50'
                          }`}
                        >
                          {isSelected && (
                            <div className="size-2.5 rounded-full bg-black" />
                          )}
                        </div>

                        {/* Text and Badge */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-semibold text-ink">
                              {option.title}
                            </span>
                            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-cream text-muted-foreground border border-line">
                              {option.clauseTag}
                            </span>
                          </div>
                          <p className="text-xs text-muted mt-0.5 leading-normal">
                            {option.description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Primary Next Action Button */}
                <div className="pt-1">
                  <Button
                    variant="primary"
                    size="lg"
                    showArrow={true}
                    className="w-full justify-center text-center font-bold"
                    onClick={handleNextStep}
                  >
                    Next: Claim details
                  </Button>
                </div>

                {/* Quick Sample Selector helper */}
                <div className="rounded-xl border border-line bg-surface/60 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2">
                    <Sparkles className="size-4 text-amber shrink-0" />
                    <span className="text-xs text-ink">Don't have files right now?</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      disabled={isLoadingSample}
                      onClick={() => handleLoadSample('case-waiting-period-cataract')}
                      className="px-2.5 py-1 rounded-full text-xs font-mono border border-line bg-surface text-ink hover:border-teal transition-colors"
                    >
                      Cataract sample
                    </button>
                    <button
                      type="button"
                      disabled={isLoadingSample}
                      onClick={() => handleLoadSample('case-sublimit-room-rent')}
                      className="px-2.5 py-1 rounded-full text-xs font-mono border border-line bg-surface text-ink hover:border-teal transition-colors"
                    >
                      Room Rent
                    </button>
                  </div>
                </div>

                {errorMessage && (
                  <div className="rounded-xl border border-[#791F1F]/30 bg-[#FCEBEB] p-3 text-xs text-[#791F1F] flex items-center gap-2">
                    <AlertCircle className="size-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}
              </motion.div>
            )}

            {/* STEP 2: Claim Details */}
            {step === 2 && (
              <motion.div
                key="step-2"
                custom={direction}
                variants={stepTransitionVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="space-y-6"
              >
                <div>
                  <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-ink">
                    Tell us about your claim
                  </h1>
                  <p className="text-sm text-muted mt-1.5 leading-relaxed">
                    These help verify exact dates, financial deductions, and statutory ceilings.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Insurer Input with Quick Suggestions */}
                  <div className="space-y-1.5">
                    <FloatingInput
                      label="Insurer or TPA name"
                      value={insurerName}
                      onChange={(e) => setInsurerName(e.target.value)}
                      placeholder="e.g. Star Health, HDFC ERGO, Care"
                      helperText="Start typing or pick a common insurer below"
                    />

                    {/* Quick Suggestions Chips */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {COMMON_INSURERS.slice(0, 4).map((ins) => (
                        <button
                          key={ins}
                          type="button"
                          onClick={() => setInsurerName(ins)}
                          className="rounded-full border border-line bg-surface px-2.5 py-1 text-[11px] font-mono text-muted-foreground hover:border-teal hover:text-ink transition-colors"
                        >
                          {ins.split(' ')[0]}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Claim Amount */}
                  <FloatingInput
                    label="Total billed claim amount (₹)"
                    type="number"
                    value={claimAmount}
                    onChange={(e) => setClaimAmount(e.target.value)}
                    placeholder="e.g. 75000"
                    helperText="Total hospital bill amount submitted to the insurer"
                  />

                  {/* Hospitalization Date with Calendar Picker */}
                  <FloatingInput
                    ref={dateInputRef}
                    label="Hospital admission date"
                    type="date"
                    value={toISODate(hospitalizationDate)}
                    onChange={(e) => setHospitalizationDate(e.target.value)}
                    rightIcon={<Calendar className="size-4 text-teal" />}
                    onRightIconClick={() => {
                      try {
                        dateInputRef.current?.showPicker?.();
                      } catch {}
                    }}
                    helperText="Pick date using the calendar or type admission date"
                  />

                  {/* Patient Name (Optional) */}
                  <FloatingInput
                    label="Patient name (optional)"
                    type="text"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="e.g. Ramesh Kumar"
                    helperText="Will be automatically extracted from discharge summary if left blank"
                  />
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <Button
                    variant="secondary"
                    size="lg"
                    className="flex-1 justify-center font-semibold"
                    onClick={handlePrevStep}
                  >
                    Back
                  </Button>
                  <Button
                    variant="primary"
                    size="lg"
                    showArrow={true}
                    className="flex-2 justify-center font-bold"
                    onClick={handleNextStep}
                  >
                    Add documents
                  </Button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: Add Documents */}
            {step === 3 && (
              <motion.div
                key="step-3"
                custom={direction}
                variants={stepTransitionVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="space-y-6"
              >
                <div>
                  <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-ink">
                    Add your documents
                  </h1>
                  <p className="text-sm text-muted mt-1.5 leading-relaxed">
                    Upload clear PDFs or photos. Gemini compares clause text against hospital dates.
                  </p>
                </div>

                {/* 3 File Slots */}
                <div className="space-y-3">
                  <FileSlot
                    label="1. Insurer rejection letter"
                    sublabel="Letter or deduction breakdown quoting repudiation clauses"
                    required
                    file={rejectionFile}
                    onSelect={(file) => setRejectionFile(file)}
                    onRemove={() => setRejectionFile(null)}
                  />

                  <FileSlot
                    label="2. Policy document"
                    sublabel="Policy booklet or schedule stating waiting periods and room rent terms"
                    file={policyFile}
                    onSelect={(file) => setPolicyFile(file)}
                    onRemove={() => setPolicyFile(null)}
                  />

                  <FileSlot
                    label="3. Hospital discharge summary"
                    sublabel="Clinical record stating diagnosis, treatment, and admission dates"
                    file={dischargeFile}
                    onSelect={(file) => setDischargeFile(file)}
                    onRemove={() => setDischargeFile(null)}
                  />
                </div>

                {/* DPDP Consent */}
                <div className="rounded-2xl border border-line bg-surface p-4 space-y-2.5">
                  <div className="flex items-start gap-3">
                    <input
                      id="wizard-consent"
                      type="checkbox"
                      checked={consentChecked}
                      onChange={(e) => {
                        setConsentChecked(e.target.checked);
                        setConsent(e.target.checked);
                      }}
                      className="mt-1 size-4 rounded border-line text-teal focus:ring-teal cursor-pointer"
                    />
                    <label htmlFor="wizard-consent" className="text-xs text-ink cursor-pointer leading-relaxed">
                      I understand my documents are processed by AI, automatically deleted after 24 hours, and this is general information, not legal advice.
                    </label>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] font-mono text-muted pl-7">
                    <Lock className="size-3.5 text-teal" />
                    <span>DPDP Act compliant • 24h auto-purge • No LLM training</span>
                  </div>
                </div>

                {errorMessage && (
                  <div className="rounded-xl border border-[#791F1F]/30 bg-[#FCEBEB] p-3 text-xs text-[#791F1F] flex items-center gap-2">
                    <AlertCircle className="size-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div className="pt-2 flex items-center gap-3">
                  <Button
                    variant="secondary"
                    size="lg"
                    className="flex-1 justify-center font-semibold"
                    onClick={handlePrevStep}
                  >
                    Back
                  </Button>
                  <Button
                    variant="primary"
                    size="lg"
                    showArrow={true}
                    className="flex-2 justify-center font-bold"
                    onClick={handleNextStep}
                  >
                    Run AI Analysis
                  </Button>
                </div>
              </motion.div>
            )}

            {/* STEP 4: Analysing in Progress */}
            {step === 4 && (
              <motion.div
                key="step-4"
                custom={direction}
                variants={stepTransitionVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="space-y-6 text-center py-4"
              >
                {/* Mascot in Thinking Mood */}
                <div className="flex justify-center">
                  <Mascot mood="thinking" size={130} />
                </div>

                <div>
                  <h2 className="text-2xl font-medium tracking-tight text-ink">
                    Analysing your claim
                  </h2>
                  <p 
                    aria-live="polite" 
                    className="text-sm text-teal font-medium mt-2 h-6 transition-all duration-300"
                  >
                    {ANALYSIS_STATUS_MESSAGES[statusMessageIndex]}
                  </p>
                </div>

                {/* Progress Card */}
                <div className="rounded-2xl border border-line bg-surface p-5 space-y-4 text-left shadow-soft">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-ink font-semibold">
                      Step {Math.min(currentStepIndex + 1, 6)} of 6
                    </span>
                    <span className="text-muted flex items-center gap-1">
                      <Clock className="size-3.5 text-amber" aria-hidden="true" />
                      <span>{Math.round(analysisProgress)}% complete</span>
                    </span>
                  </div>

                  <div 
                    role="progressbar"
                    aria-valuenow={Math.round(analysisProgress)}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label="Claim analysis progress"
                    className="w-full bg-cream h-2 rounded-full overflow-hidden border border-line"
                  >
                    <motion.div
                      className="bg-teal h-full rounded-full"
                      animate={{ width: `${Math.max(analysisProgress, 12)}%` }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                    />
                  </div>

                  {/* Step Indicators */}
                  <div className="grid grid-cols-6 gap-1.5 pt-1">
                    {[1, 2, 3, 4, 5, 6].map((st) => (
                      <div
                        key={st}
                        className={`h-1.5 rounded-full transition-colors ${
                          st <= currentStepIndex + 1 ? 'bg-teal' : 'bg-line'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Simulated Document Scanning View */}
                  <div className="relative rounded-xl border border-line bg-cream p-4 overflow-hidden mt-3">
                    <div className="space-y-2 opacity-60">
                      <div className="h-3 bg-muted/30 rounded w-3/4" />
                      <div className="h-3 bg-muted/20 rounded w-full" />
                      <div className="h-3 bg-muted/25 rounded w-5/6" />
                    </div>

                    {/* Scanning Laser Beam Line */}
                    <motion.div
                      className="absolute inset-x-0 h-[2px] bg-teal shadow-[0_0_8px_#1B7F7A]"
                      animate={{ top: ['0%', '100%', '0%'] }}
                      transition={{ duration: 2.4, repeat: Infinity, ease: 'linear' }}
                    />
                  </div>
                </div>

                {/* Error handling in case something fails */}
                {errorMessage && (
                  <div className="rounded-2xl border border-[#791F1F]/40 bg-[#FCEBEB] p-4 text-xs text-[#791F1F] space-y-3">
                    <div className="flex items-center justify-center gap-2 font-medium">
                      <AlertCircle className="size-4 shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => {
                          setErrorMessage(null);
                          triggerAnalysis();
                        }}
                      >
                        <RefreshCw className="size-3.5 mr-1" />
                        <span>Retry Analysis</span>
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setErrorMessage(null);
                          goToStep(3);
                        }}
                      >
                        <span>Back to Documents</span>
                      </Button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* STEP 5: Analysis Complete / Success Transition */}
            {step === 5 && (
              <motion.div
                key="step-5"
                custom={direction}
                variants={stepTransitionVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="space-y-6 text-center py-6"
              >
                {/* Mascot Happy with Celebratory Ring */}
                <div className="relative inline-flex items-center justify-center">
                  <motion.div
                    className="absolute size-40 rounded-full border-2 border-teal/30"
                    animate={{ scale: [1, 1.25, 1], opacity: [0.6, 0, 0.6] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  />
                  <Mascot mood="happy" size={130} />
                </div>

                <div className="space-y-1.5">
                  <span className="text-xs font-mono uppercase tracking-wider text-teal font-semibold">
                    Audit Finished
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-ink">
                    Your claim analysis is ready!
                  </h1>
                  <p className="text-sm text-muted max-w-sm mx-auto leading-relaxed">
                    We cross-checked policy clauses, recomputed dates with continuity credit, and drafted your grievance appeal.
                  </p>
                </div>

                <div className="pt-4 max-w-xs mx-auto space-y-2.5">
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full justify-center"
                    onClick={() => navigate('/result')}
                  >
                    <span>View claim analysis & appeal</span>
                    <ChevronRight className="size-4 ml-1" />
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
};
