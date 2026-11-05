import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { 
  CheckCircle2, 
  Loader2, 
  Clock, 
  ShieldCheck, 
  AlertCircle,
  FileSearch,
  BookOpen,
  Scale,
  CalendarCheck,
  FileText
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useCaseStore } from '../store/useCaseStore';
import { Mascot } from '../components/common/Mascot';
import { Button } from '../components/common/Button';

export const ProcessingPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { 
    runAnalysis, 
    analysisSteps, 
    currentStepIndex, 
    analysisProgress, 
    analysisError 
  } = useCaseStore();

  const [hasStarted, setHasStarted] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(55);
  const timerRef = useRef<number | null>(null);

  const stepIcons = [
    FileSearch,
    BookOpen,
    Scale,
    FileText,
    CalendarCheck,
    ShieldCheck
  ];

  useEffect(() => {
    timerRef.current = window.setInterval(() => {
      setSecondsRemaining((prev) => (prev > 1 ? prev - 1 : 1));
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!hasStarted) {
      setHasStarted(true);
      const filesState = location.state?.files || {
        rejection: { name: 'sample_rejection_letter_cataract.pdf', size: 1200000, url: '/samples/sample_rejection_letter_cataract.pdf' },
        policy: { name: 'sample_policy_wordings_star.pdf', size: 3400000, url: '/samples/sample_policy_wordings_star.pdf' },
        discharge: { name: 'sample_discharge_summary_cataract.pdf', size: 850000, url: '/samples/sample_discharge_summary_cataract.pdf' }
      };

      runAnalysis({ files: filesState })
        .then(async (completedCase) => {
          if (completedCase.overall_verdict === 'grounds_to_contest') {
            try {
              const confettiModule = await import('canvas-confetti');
              const fireConfetti = confettiModule.default || confettiModule;
              fireConfetti({
                particleCount: 70,
                spread: 60,
                origin: { y: 0.6 }
              });
            } catch {
              // Ignore confetti load error if offline
            }
          }
          setTimeout(() => {
            navigate('/result');
          }, 800);
        })
        .catch((err) => {
          console.error('Analysis failed:', err);
        });
    }
  }, [hasStarted, location.state, runAnalysis, navigate]);

  return (
    <main className="min-h-[calc(100vh-140px)] bg-cream py-10 px-4">
      <div className="mx-auto w-full max-w-2xl space-y-8">
        {/* Thinking Mascot and Header */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <Mascot mood="thinking" size={120} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-ink">
            Analyzing your documents
          </h1>
          <p className="text-sm text-muted max-w-md mx-auto leading-relaxed">
            Reading policy clauses, checking repudiation statements, and recalculating waiting periods with continuity credit.
          </p>
        </div>

        {/* Progress Card */}
        <div className="rounded-2xl border border-line bg-surface p-5 space-y-3 shadow-soft">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="font-semibold text-ink">
              Step {Math.min(currentStepIndex + 1, 6)} of 6 ({Math.round(analysisProgress)}%)
            </span>
            <span className="flex items-center gap-1 text-muted">
              <Clock className="size-3.5 text-amber" />
              <span>~{secondsRemaining}s remaining</span>
            </span>
          </div>

          {/* Progress Track */}
          <div className="w-full bg-cream h-2.5 rounded-full overflow-hidden border border-line">
            <motion.div
              className="bg-teal h-full rounded-full"
              animate={{ width: `${Math.max(analysisProgress, 8)}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Step-by-step audit checklist */}
        <div className="rounded-2xl border border-line bg-surface divide-y divide-line overflow-hidden shadow-soft">
          {analysisSteps.map((step, idx) => {
            const StepIcon = stepIcons[idx] || ShieldCheck;
            const isDone = step.status === 'completed';
            const isRunning = step.status === 'running';

            return (
              <div
                key={step.step}
                className={`p-4 flex items-start gap-3.5 transition-colors ${
                  isRunning ? 'bg-mint/30' : isDone ? 'bg-surface' : 'bg-surface/60 opacity-60'
                }`}
              >
                <div
                  className={`size-8 rounded-xl flex items-center justify-center shrink-0 ${
                    isDone
                      ? 'bg-mint text-teal'
                      : isRunning
                      ? 'bg-teal text-surface animate-pulse'
                      : 'bg-cream text-muted border border-line'
                  }`}
                >
                  {isDone ? (
                    <CheckCircle2 className="size-4" />
                  ) : isRunning ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <StepIcon className="size-4" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm text-ink">
                      Step {step.step}: {step.name}
                    </h4>
                    <span className="text-[11px] font-mono text-muted uppercase">
                      {step.status === 'completed' ? 'Done' : step.status === 'running' ? 'Active' : `~${step.estimatedSeconds}s`}
                    </span>
                  </div>
                  <p className="text-xs text-muted mt-0.5 leading-normal">
                    {step.description}
                  </p>
                  {isRunning && step.detailMessage && (
                    <p className="text-xs text-teal mt-1 font-medium font-mono">
                      ↳ {step.detailMessage}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {analysisError && (
          <div className="p-5 bg-[#FCEBEB] border border-[#791F1F]/30 rounded-2xl text-xs text-[#791F1F] space-y-3 shadow-soft">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="size-5 shrink-0 text-[#791F1F] mt-0.5" />
              <div>
                <p className="font-semibold text-sm text-[#791F1F]">Analysis Notification</p>
                <p className="mt-1 leading-relaxed text-[#791F1F]/90">{analysisError}</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setHasStarted(false);
                  setSecondsRemaining(55);
                }}
                className="px-4 py-2 text-xs font-mono font-medium rounded-full bg-teal text-surface cursor-pointer hover:opacity-90 transition-opacity"
              >
                Retry Analysis
              </button>
              <Link
                to="/new"
                className="px-4 py-2 text-xs font-mono font-medium rounded-full bg-surface border border-line text-ink hover:bg-cream transition-colors"
              >
                Back to Documents
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};
