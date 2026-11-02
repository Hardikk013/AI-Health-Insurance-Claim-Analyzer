import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  ExternalLink,
  ChevronRight,
  Clock,
  Lock,
  Scale
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SAMPLE_CASES } from '../data/sampleCases';
import { useCaseStore } from '../store/useCaseStore';
import { VerdictBadge } from '../components/common/VerdictBadge';
import { TermTooltip } from '../components/common/TermTooltip';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { loadSampleCase } = useCaseStore();

  const handleTestSample = (sampleId: string) => {
    loadSampleCase(sampleId);
    navigate('/result');
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 md:py-12 space-y-16">
      {/* Hero Section */}
      <section className="text-center max-w-3xl mx-auto space-y-5 pt-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-semibold">
          <ShieldCheck className="size-3.5" />
          <span>Built for Indian Health Insurance &amp; IRDAI Rules</span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-primary leading-tight">
          Was your health insurance claim wrongly rejected?
        </h1>

        <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
          Upload your rejection letter, policy document, and discharge summary. ClaimFight compares insurer statements against policy clauses and IRDAI rules, flags contestable grounds, and drafts your appeal in under 2 minutes.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
          <Link
            to="/new"
            className="w-full sm:w-auto inline-flex min-h-12 items-center justify-center rounded-lg bg-accent px-6 font-medium text-accent-foreground hover:opacity-90 shadow-sm text-sm sm:text-base"
          >
            <span>Check my claim free</span>
            <ArrowRight className="size-4 ml-2" />
          </Link>

          <button
            type="button"
            onClick={() => handleTestSample('case-waiting-period-cataract')}
            className="w-full sm:w-auto inline-flex min-h-12 items-center justify-center rounded-lg border bg-card px-6 font-medium text-primary hover:bg-muted/50 shadow-xs text-sm sm:text-base"
          >
            <Sparkles className="size-4 mr-2 text-warning" />
            <span>Try a live sample case</span>
          </button>
        </div>

        <p className="text-xs text-muted-foreground">
          No sign-up fee • 3 free analyses per day • 24-hour automatic document purge
        </p>
      </section>

      {/* Metrics Row */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border bg-card p-5 text-center">
          <p className="text-2xl font-bold text-primary">₹20,000+ Cr</p>
          <p className="text-xs text-muted-foreground mt-1">
            Claims deducted annually across Indian insurers
          </p>
        </div>
        <div className="rounded-xl border bg-card p-5 text-center">
          <p className="text-2xl font-bold text-accent">4 Core Grounds</p>
          <p className="text-xs text-muted-foreground mt-1">
            Waiting period, PED, Room rent, Medical necessity
          </p>
        </div>
        <div className="rounded-xl border bg-card p-5 text-center">
          <p className="text-2xl font-bold text-success">24h Auto-Purge</p>
          <p className="text-xs text-muted-foreground mt-1">
            DPDP Act aligned: Documents automatically deleted
          </p>
        </div>
      </section>

      {/* Sample Cases Preview */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-primary">Try a sample claim</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Explore pre-loaded cases to test the verification screen immediately.
            </p>
          </div>
          <Link to="/samples" className="text-sm font-medium text-accent hover:underline flex items-center gap-1">
            <span>All samples</span>
            <ChevronRight className="size-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {SAMPLE_CASES.slice(0, 3).map((sample) => (
            <div
              key={sample.id}
              className="rounded-xl border bg-card p-5 flex flex-col justify-between hover:border-accent/50 transition-colors"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <VerdictBadge verdict={sample.verdict} size="sm" />
                  <span className="text-xs font-mono text-muted-foreground">
                    ₹{sample.deductedAmount.toLocaleString('en-IN')}
                  </span>
                </div>
                <h3 className="font-semibold text-base text-primary">
                  {sample.title}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-3">
                  {sample.summary}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground font-mono">
                  {sample.insurerName.split(' ')[0]}
                </span>
                <button
                  type="button"
                  onClick={() => handleTestSample(sample.id)}
                  className="text-xs font-semibold text-accent hover:opacity-90 inline-flex items-center gap-1"
                >
                  <span>Open demo</span>
                  <ChevronRight className="size-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4 Supported Scope Limits */}
      <section className="rounded-xl border bg-card p-6 md:p-8 space-y-6">
        <div>
          <span className="text-xs font-semibold text-accent uppercase tracking-wider">Scope Limits</span>
          <h2 className="text-xl md:text-2xl font-semibold text-primary mt-1">
            Supported Rejection Categories in India
          </h2>
          <p className="text-xs md:text-sm text-muted-foreground mt-1">
            ClaimFight supports individual and family floater health insurance for exactly four reasons:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-lg border bg-muted/40 p-4">
            <h4 className="font-semibold text-sm text-primary">1. Waiting period disputes</h4>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              Initial 30-day exclusion or 1/2-year specific illness exclusions (cataract, hernia, stones) where the waiting period had already elapsed.
            </p>
          </div>

          <div className="rounded-lg border bg-muted/40 p-4">
            <h4 className="font-semibold text-sm text-primary">2. Pre-existing disease (PED) exclusion</h4>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              Accidental trauma repudiated for an unrelated lifestyle condition, or policies active for over 60 months under the 2024 IRDAI moratorium rule.
            </p>
          </div>

          <div className="rounded-lg border bg-muted/40 p-4">
            <h4 className="font-semibold text-sm text-primary">3. Room rent proportionate deduction</h4>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              Illegal deduction applied to pharmacy, implants, and ICU charges violating IRDAI Master Circular 2020.
            </p>
          </div>

          <div className="rounded-lg border bg-muted/40 p-4">
            <h4 className="font-semibold text-sm text-primary">4. Daycare &amp; medical necessity</h4>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              Claims denied for "insufficient 24-hour hospitalisation" for modern day-care procedures (dialysis, cataract, chemotherapy).
            </p>
          </div>
        </div>

        <div className="pt-2 border-t flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground gap-2">
          <span>Other reasons are flagged as "Not yet supported" with a link to official Ombudsman guidance.</span>
          <Link to="/sources" className="text-accent hover:underline font-medium">
            View official rules &rarr;
          </Link>
        </div>
      </section>

      {/* 3 Step Explainer */}
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold text-primary">How ClaimFight works</h2>
          <p className="text-sm text-muted-foreground mt-1">
            From confusing repudiation letters to an iron-clad grievance appeal in 3 steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl border bg-card p-5">
            <span className="text-sm font-semibold text-accent">Step 1</span>
            <h3 className="text-base font-semibold text-primary mt-1">Upload 3 documents</h3>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
              Drop your insurer's rejection letter, policy document, and hospital discharge summary (PDF, JPG, PNG). Photos from your phone are supported.
            </p>
          </div>

          <div className="rounded-xl border bg-card p-5">
            <span className="text-sm font-semibold text-accent">Step 2</span>
            <h3 className="text-base font-semibold text-primary mt-1">AI &amp; deterministic rules</h3>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
              Claude extracts policy clauses while our deterministic rules engine computes active days, <TermTooltip termKey="Waiting Period">waiting periods</TermTooltip>, and <TermTooltip termKey="Proportionate Deduction">room rent deductions</TermTooltip>.
            </p>
          </div>

          <div className="rounded-xl border bg-card p-5">
            <span className="text-sm font-semibold text-accent">Step 3</span>
            <h3 className="text-base font-semibold text-primary mt-1">Download appeal letters</h3>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
              Receive an editable appeal to the Insurer's Grievance Redressal Officer (GRO) and an <TermTooltip termKey="Ombudsman">Ombudsman</TermTooltip> complaint outline with cited precedents.
            </p>
          </div>
        </div>
      </section>

      {/* Call to action */}
      <section className="rounded-xl border bg-secondary p-8 text-center space-y-4">
        <h2 className="text-2xl font-semibold text-secondary-foreground">
          Don't accept an unfair claim deduction.
        </h2>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Check your claim against binding IRDAI guidelines in under 2 minutes. Free and auto-deleted after 24 hours.
        </p>
        <div>
          <Link
            to="/new"
            className="inline-flex min-h-12 items-center rounded-lg bg-accent px-6 font-medium text-accent-foreground hover:opacity-90 shadow-sm"
          >
            Start claim verification
          </Link>
        </div>
      </section>
    </div>
  );
};
