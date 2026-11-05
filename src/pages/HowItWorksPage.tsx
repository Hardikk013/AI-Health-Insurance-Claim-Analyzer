import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, ShieldCheck, Scale, FileText, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Tag } from '../components/common/Tag';
import { Mascot } from '../components/common/Mascot';
import { PageTransition } from '../components/common/PageTransition';

export const HowItWorksPage: React.FC = () => {
  const navigate = useNavigate();

  const steps = [
    {
      step: '01',
      title: 'Multimodal Vision Document Reading',
      desc: 'Google Gemini 2.0 Flash inspects the insurer repudiation notice, policy terms booklet, and hospital discharge summary for verbatim clauses, doctor stamps, and dates.',
    },
    {
      step: '02',
      title: 'Policy Clause Isolation',
      desc: 'Isolates waiting period clauses (Clause 4.1/4.2), specific illness exclusions, room rent caps, and pre-existing disease disclosure terms.',
    },
    {
      step: '03',
      title: 'Insurer Repudiation Fact-Checking',
      desc: 'Extracts the exact clause numbers quoted by the insurer, along with the billed claim amount, approved sum, and disputed deductions.',
    },
    {
      step: '04',
      title: 'Hospital Clinical Record Cross-Correlation',
      desc: 'Matches clinical history, surgical procedure, and primary diagnosis from the discharge summary against the insurer’s stated reasons.',
    },
    {
      step: '05',
      title: 'Deterministic Date & Math Verification',
      desc: 'Executes independent calendar arithmetic for active policy tenure and continuity credit under IRDAI guidelines (never guessed by AI).',
    },
    {
      step: '06',
      title: 'Appellate Representation & Ombudsman Drafting',
      desc: 'Generates a ready-to-sign formal grievance appeal letter and Insurance Ombudsman complaint citing binding regulations and precedents.',
    },
  ];

  return (
    <PageTransition>
      <main className="min-h-screen bg-cream py-8 md:py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-5xl space-y-10">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-mint text-teal text-xs font-mono font-medium">
                <Sparkles className="size-3.5 text-amber" />
                <span>Deterministic AI Architecture</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-medium tracking-tight text-ink">
                How ClaimFight works
              </h1>
              <p className="max-w-2xl text-sm text-muted leading-relaxed">
                ClaimFight audits individual and family floater health policies in India under official IRDAI circulars and Insurance Ombudsman Rules.
              </p>
            </div>

            <div className="hidden sm:block shrink-0">
              <Mascot mood="idle" size={90} />
            </div>
          </div>

          {/* 6 Step Grid */}
          <div className="grid gap-4 md:grid-cols-2">
            {steps.map((st) => (
              <div
                key={st.step}
                className="rounded-2xl border border-line bg-surface p-6 space-y-3 shadow-soft hover:border-teal/50 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-semibold text-teal bg-mint/40 px-2.5 py-1 rounded-full border border-teal/20">
                    Step {st.step}
                  </span>
                  <CheckCircle2 className="size-4 text-teal" />
                </div>
                <h2 className="text-lg font-medium text-ink">
                  {st.title}
                </h2>
                <p className="text-xs text-muted leading-relaxed">
                  {st.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="rounded-2xl border border-line bg-surface p-8 text-center space-y-4 shadow-soft max-w-xl mx-auto">
            <h3 className="text-xl font-medium text-ink">Ready to audit your rejected claim?</h3>
            <p className="text-xs text-muted leading-relaxed">
              Upload your documents or explore a pre-loaded sample case to see the engine in action.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Button
                variant="primary"
                size="md"
                onClick={() => navigate('/new')}
              >
                <span>Upload rejection letter</span>
                <ArrowRight className="size-4 ml-1.5" />
              </Button>
              <Button
                variant="secondary"
                size="md"
                onClick={() => navigate('/samples')}
              >
                <span>Explore sample cases</span>
              </Button>
            </div>
          </div>

        </div>
      </main>
    </PageTransition>
  );
};
