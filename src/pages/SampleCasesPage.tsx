import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  FileText, 
  Download, 
  ArrowRight, 
  ChevronRight
} from 'lucide-react';
import { SAMPLE_CASES } from '../data/sampleCases';
import { useCaseStore } from '../store/useCaseStore';
import { VerdictBadge } from '../components/common/VerdictBadge';

export const SampleCasesPage: React.FC = () => {
  const navigate = useNavigate();
  const { loadSampleCase } = useCaseStore();

  const handleLaunchSample = (sampleId: string) => {
    loadSampleCase(sampleId);
    navigate('/result');
  };

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 md:py-12 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-primary">Sample cases</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Pre-built cases modeled on real Indian health insurance repudiations. Each case includes watermarked sample documents stored in <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">/public/samples</code>.
        </p>
      </div>

      {/* Grid of sample cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {SAMPLE_CASES.map((sample) => (
          <div
            key={sample.id}
            className="rounded-xl border bg-card p-5 flex flex-col justify-between space-y-4 hover:border-accent/60 transition-colors"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <VerdictBadge verdict={sample.verdict} size="sm" />
                <span className="text-xs font-mono text-muted-foreground">
                  Dispute: ₹{sample.deductedAmount.toLocaleString('en-IN')}
                </span>
              </div>

              <div>
                <h3 className="font-semibold text-base text-primary">
                  {sample.title}
                </h3>
                <p className="text-xs text-accent mt-0.5 font-medium">{sample.subtitle}</p>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                  {sample.summary}
                </p>
              </div>

              {/* Sample files */}
              <div className="rounded-lg border bg-muted/30 p-3 space-y-1.5">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                  Watermarked sample documents:
                </p>
                <div className="space-y-1">
                  <a
                    href={sample.files.rejection_letter.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between text-xs p-1 rounded hover:bg-card text-foreground transition-colors"
                  >
                    <span className="flex items-center gap-1.5 truncate max-w-[240px]">
                      <FileText className="size-3.5 text-danger shrink-0" />
                      <span className="truncate">{sample.files.rejection_letter.name}</span>
                    </span>
                    <Download className="size-3 text-accent shrink-0" />
                  </a>

                  <a
                    href={sample.files.policy_document.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between text-xs p-1 rounded hover:bg-card text-foreground transition-colors"
                  >
                    <span className="flex items-center gap-1.5 truncate max-w-[240px]">
                      <FileText className="size-3.5 text-accent shrink-0" />
                      <span className="truncate">{sample.files.policy_document.name}</span>
                    </span>
                    <Download className="size-3 text-accent shrink-0" />
                  </a>

                  <a
                    href={sample.files.discharge_summary.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between text-xs p-1 rounded hover:bg-card text-foreground transition-colors"
                  >
                    <span className="flex items-center gap-1.5 truncate max-w-[240px]">
                      <FileText className="size-3.5 text-success shrink-0" />
                      <span className="truncate">{sample.files.discharge_summary.name}</span>
                    </span>
                    <Download className="size-3 text-accent shrink-0" />
                  </a>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleLaunchSample(sample.id)}
              className="w-full inline-flex min-h-11 items-center justify-center rounded-lg bg-primary px-4 text-xs font-medium text-primary-foreground hover:opacity-90 transition-colors shadow-xs"
            >
              <span>Load this case into result view</span>
              <ArrowRight className="size-3.5 ml-1.5" />
            </button>
          </div>
        ))}
      </div>
    </main>
  );
};
