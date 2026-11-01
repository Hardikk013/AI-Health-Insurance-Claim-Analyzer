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
import confetti from 'canvas-confetti';
import { useCaseStore } from '../store/useCaseStore';

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
        rejection: { name: 'sample_rejection_letter_cataract.pdf', size: 1200000 },
        policy: { name: 'sample_policy_wordings_star.pdf', size: 3400000 },
        discharge: { name: 'sample_discharge_summary_cataract.pdf', size: 850000 }
      };

      runAnalysis({ files: filesState })
        .then((completedCase) => {
          if (completedCase.overall_verdict === 'grounds_to_contest') {
            confetti({
              particleCount: 70,
              spread: 60,
              origin: { y: 0.6 }
            });
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
    <main className="mx-auto w-full max-w-3xl px-4 py-8 md:py-12 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-primary">
          Analyzing your documents
        </h1>
        <p className="text-sm text-muted-foreground max-w-lg mx-auto">
          Checking policy clauses, extracting rejection reasons, and recomputing dates with deterministic rules.
        </p>
      </div>

      {/* Progress Card */}
      <div className="rounded-xl border bg-card p-5 space-y-3 shadow-xs">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-primary">
            Step {Math.min(currentStepIndex + 1, 6)} of 6 ({analysisProgress}%)
          </span>
          <span className="flex items-center gap-1 text-muted-foreground">
            <Clock className="size-3 text-warning" />
            <span>~{secondsRemaining}s remaining</span>
          </span>
        </div>

        {/* Progress Track */}
        <div className="w-full bg-muted h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-accent h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${analysisProgress}%` }}
          />
        </div>
      </div>

      {/* Step by step list */}
      <div className="rounded-xl border bg-card divide-y shadow-xs">
        {analysisSteps.map((step, idx) => {
          const StepIcon = stepIcons[idx] || ShieldCheck;
          const isDone = step.status === 'completed';
          const isRunning = step.status === 'running';

          return (
            <div
              key={step.step}
              className={`p-4 flex items-start gap-3.5 transition-opacity ${
                isRunning ? 'opacity-100 bg-muted/20' : isDone ? 'opacity-90' : 'opacity-40'
              }`}
            >
              <div
                className={`size-8 rounded-lg flex items-center justify-center shrink-0 ${
                  isDone
                    ? 'bg-success-soft text-success'
                    : isRunning
                    ? 'bg-secondary text-accent animate-pulse'
                    : 'bg-muted text-muted-foreground'
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
                  <h4 className="font-semibold text-sm text-primary">
                    Step {step.step}: {step.name}
                  </h4>
                  <span className="text-[11px] font-mono text-muted-foreground">
                    {step.status === 'completed' ? 'Done' : step.status === 'running' ? 'Running' : `~${step.estimatedSeconds}s`}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {step.description}
                </p>
                {isRunning && step.detailMessage && (
                  <p className="text-xs text-accent mt-1 font-medium">
                    ↳ {step.detailMessage}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {analysisError && (
        <div className="p-4 bg-danger-soft border border-destructive/30 rounded-xl text-xs text-destructive flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="size-4 shrink-0" />
            <span>{analysisError}</span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/admin"
              className="px-3 py-1 font-semibold bg-accent text-accent-foreground rounded-lg hover:opacity-90 inline-block text-center"
            >
              Reset quota in Admin
            </Link>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-3 py-1 font-semibold bg-danger text-destructive-foreground rounded-lg"
            >
              Retry
            </button>
          </div>
        </div>
      )}
    </main>
  );
};
