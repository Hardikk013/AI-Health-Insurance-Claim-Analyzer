import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  FileText, 
  Download, 
  ArrowRight, 
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { SAMPLE_CASES } from '../data/sampleCases';
import { useCaseStore } from '../store/useCaseStore';
import { Tag } from '../components/common/Tag';
import { Button } from '../components/common/Button';
import { PageTransition } from '../components/common/PageTransition';

export const SampleCasesPage: React.FC = () => {
  const navigate = useNavigate();
  const { loadSampleCase } = useCaseStore();

  const handleLaunchSample = (sampleId: string) => {
    loadSampleCase(sampleId);
    navigate('/result');
  };

  return (
    <PageTransition>
      <main className="min-h-screen bg-cream py-8 md:py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-6xl space-y-8">
          
          {/* Header */}
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-mint text-teal text-xs font-mono font-medium">
              <Sparkles className="size-3.5 text-amber" />
              <span>Realistic Testing Datasets</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-medium tracking-tight text-ink">
              Official sample cases
            </h1>
            <p className="max-w-2xl text-sm text-muted leading-relaxed">
              Pre-built cases modeled on actual Indian health insurance repudiations. Each case includes watermarked test documents with cited clauses and hospital records.
            </p>
          </div>

          {/* Grid of sample cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {SAMPLE_CASES.map((sample) => {
              const isContestable = sample.verdict === 'grounds_to_contest';

              return (
                <div
                  key={sample.id}
                  className="rounded-2xl border border-line bg-surface p-6 flex flex-col justify-between space-y-5 shadow-soft hover:border-teal/60 transition-all"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-2">
                      <Tag variant={isContestable ? 'strong' : 'weak'}>
                        {isContestable ? 'Grounds to contest' : 'Sound repudiation'}
                      </Tag>
                      <span className="text-xs font-mono font-semibold text-teal">
                        Dispute: ₹{sample.deductedAmount.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium text-ink">
                        {sample.title}
                      </h3>
                      <p className="text-xs font-mono text-teal mt-0.5">{sample.subtitle}</p>
                      <p className="text-xs text-muted mt-2 leading-relaxed">
                        {sample.summary}
                      </p>
                    </div>

                    {/* Watermarked Files Preview */}
                    <div className="rounded-xl border border-line bg-cream p-3.5 space-y-2">
                      <p className="text-[10px] font-mono uppercase tracking-wider text-muted font-semibold">
                        Watermarked test documents:
                      </p>
                      <div className="space-y-1.5">
                        <a
                          href={sample.files.rejection_letter.url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-between text-xs p-1.5 rounded-lg bg-surface hover:bg-cream border border-line text-ink transition-colors"
                        >
                          <span className="flex items-center gap-1.5 truncate max-w-[260px]">
                            <FileText className="size-3.5 text-[#791F1F] shrink-0" />
                            <span className="truncate font-mono text-[11px]">{sample.files.rejection_letter.name}</span>
                          </span>
                          <Download className="size-3 text-teal shrink-0" />
                        </a>

                        <a
                          href={sample.files.policy_document.url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-between text-xs p-1.5 rounded-lg bg-surface hover:bg-cream border border-line text-ink transition-colors"
                        >
                          <span className="flex items-center gap-1.5 truncate max-w-[260px]">
                            <FileText className="size-3.5 text-teal shrink-0" />
                            <span className="truncate font-mono text-[11px]">{sample.files.policy_document.name}</span>
                          </span>
                          <Download className="size-3 text-teal shrink-0" />
                        </a>

                        <a
                          href={sample.files.discharge_summary.url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-between text-xs p-1.5 rounded-lg bg-surface hover:bg-cream border border-line text-ink transition-colors"
                        >
                          <span className="flex items-center gap-1.5 truncate max-w-[260px]">
                            <FileText className="size-3.5 text-teal shrink-0" />
                            <span className="truncate font-mono text-[11px]">{sample.files.discharge_summary.name}</span>
                          </span>
                          <Download className="size-3 text-teal shrink-0" />
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Button
                      variant="primary"
                      size="md"
                      className="w-full justify-center"
                      onClick={() => handleLaunchSample(sample.id)}
                    >
                      <span>Audit this sample case</span>
                      <ArrowRight className="size-4 ml-1.5" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </PageTransition>
  );
};
