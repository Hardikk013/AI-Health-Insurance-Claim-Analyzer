import React, { useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Clock, 
  ShieldCheck, 
  Lock, 
  HelpCircle, 
  FileCheck, 
  Scale, 
  Building2, 
  Activity, 
  ArrowRight,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { SAMPLE_CASES } from '../data/sampleCases';
import { useCaseStore } from '../store/useCaseStore';
import { Mascot } from '../components/common/Mascot';
import { Dropzone } from '../components/common/DropZone';
import { Button } from '../components/common/Button';
import { Tag } from '../components/common/Tag';
import { Card } from '../components/common/Card';
import { Accordion } from '../components/common/Accordion';
import { CountUp } from '../components/common/CountUp';
import { Reveal } from '../components/common/Reveal';
import { LetterScanDemo } from '../components/home/LetterScanDemo';
import { PageTransition } from '../components/common/PageTransition';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { loadSampleCase, setPendingFiles } = useCaseStore();
  const dropzoneRef = useRef<HTMLDivElement>(null);

  const handleTestSample = (sampleId: string) => {
    loadSampleCase(sampleId);
    navigate('/result');
  };

  const handleDropzoneFile = (file: File) => {
    // Store file in pending and navigate to case wizard step 3
    setPendingFiles({
      rejection: file,
      policy: null as any,
      discharge: null as any,
    });
    navigate('/new');
  };

  const scrollToDropzone = () => {
    if (dropzoneRef.current) {
      dropzoneRef.current.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/new');
    }
  };

  const faqItems = [
    {
      id: 'faq-1',
      question: 'Is my data and medical information safe?',
      answer: 'Yes. All documents uploaded to ClaimFight are stored in temporary memory and permanently deleted after 24 hours. We operate in strict compliance with the Indian Digital Personal Data Protection (DPDP) Act, 2023. We never sell, share or retain your health documents.',
    },
    {
      id: 'faq-2',
      question: 'Is this considered formal legal advice?',
      answer: 'No. ClaimFight is an automated audit tool that cross-checks insurer statements against published IRDAI regulations, statutory circulars, and Insurance Ombudsman jurisprudence. We provide structured draft representations to help policyholders exercise their legal rights, but recommend consulting an advocate for complex litigation.',
    },
    {
      id: 'faq-3',
      question: 'What documents do I need to run a full audit?',
      answer: 'For a comprehensive verification, you need three documents: (1) the repudiation or deduction letter from your insurer or TPA, (2) your insurance policy wordings or schedule, and (3) the hospital indoor discharge summary. Photos or scans from mobile phones are accepted.',
    },
    {
      id: 'faq-4',
      question: 'How does continuity credit verification work?',
      answer: 'Under IRDAI Portability Guidelines, if you ported your policy from another insurer without break, all waiting periods served in the previous policy carry forward. ClaimFight recalculates your total continuous policy tenure deterministically so insurers cannot falsely claim a 24-month waiting period has not elapsed.',
    },
    {
      id: 'faq-5',
      question: 'What if the insurer rejects my internal grievance appeal?',
      answer: 'If the insurer’s Grievance Redressal Officer (GRO) rejects your representation or fails to resolve it within 30 days, you can escalate directly to the Insurance Ombudsman under Rule 13 of the Insurance Ombudsman Rules, 2017. ClaimFight automatically formats an Ombudsman complaint outline for you.',
    },
    {
      id: 'faq-6',
      question: 'Are there any fees or hidden charges?',
      answer: 'ClaimFight is 100% free to use. Every Indian policyholder receives 3 free full claim audits per day with no credit card or account registration required.',
    },
  ];

  return (
    <PageTransition className="space-y-24 md:space-y-32 pb-24">
      {/* 1. Hero Section */}
      <section className="mx-auto max-w-5xl px-4 pt-12 md:pt-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Headline and Actions */}
          <div className="lg:col-span-7 space-y-6 text-left">
            {/* Small Monospace Label Row */}
            <div className="flex items-center justify-between font-mono-code text-[11px] text-muted-foreground pb-1">
              <span>(CLAIMFIGHT 2026)</span>
              <span>IRDAI-ALIGNED</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-medium tracking-tight text-ink leading-[1.04]">
              Rejected health claim?<br />
              We find the <span className="font-serif-italic text-teal">grounds</span><br />
              <span className="text-muted">and write your appeal.</span>
            </h1>

            {/* One-line subtext */}
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-lg">
              Built for Indian health insurance. From policy clauses to a ready-to-send letter in under 2 minutes.
            </p>

            {/* Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Button
                variant="primary"
                onClick={scrollToDropzone}
                className="w-full sm:w-auto"
              >
                Upload your letter
              </Button>

              <Button
                variant="tertiary"
                onClick={() => handleTestSample('case-waiting-period-cataract')}
              >
                See a sample case
              </Button>
            </div>

            {/* Small Mono Line */}
            <p className="font-mono-code text-[11px] text-muted-foreground/85 pt-1">
              FREE · NO SIGN-UP · 3 ANALYSES PER DAY · DELETED IN 24H
            </p>
          </div>

          {/* Right Column: Friendly Shield Mascot */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <Mascot
              mood="idle"
              size={180}
              showNote={true}
              noteText="hi, I'm your claim buddy"
            />
          </div>
        </div>
      </section>

      {/* 2. Upload-First Box (Directly Under Hero) */}
      <section ref={dropzoneRef} className="mx-auto max-w-4xl px-4 scroll-mt-24">
        <Reveal>
          <Dropzone
            onFileSelect={handleDropzoneFile}
            title="Drop your rejection letter here"
            subtitle="PDF, photo or screenshot. Policy and discharge summary can be added next."
          />
        </Reveal>
      </section>

      {/* 3. How It Works (3 Steps Horizontal) */}
      <section className="mx-auto max-w-5xl px-4 space-y-12">
        <Reveal className="text-center space-y-2 max-w-xl mx-auto">
          <Tag variant="mono">HOW IT WORKS</Tag>
          <h2 className="text-2xl sm:text-3xl font-medium text-ink tracking-tight">
            From rejection to ready appeal in 3 steps
          </h2>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {/* Step 1 */}
          <Reveal delay={0.1}>
            <Card hoverLift={false} className="h-full space-y-4">
              <div className="flex size-11 items-center justify-center rounded-full bg-mint text-teal font-medium text-sm">
                1
              </div>
              <h3 className="text-base font-medium text-ink">Upload your documents</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Add your rejection letter, policy schedule, and discharge summary. Scanned PDFs or photos taken on your phone are accepted.
              </p>
            </Card>
          </Reveal>

          {/* Step 2 */}
          <Reveal delay={0.2}>
            <Card hoverLift={false} className="h-full space-y-4">
              <div className="flex size-11 items-center justify-center rounded-full bg-mint text-teal font-medium text-sm">
                2
              </div>
              <h3 className="text-base font-medium text-ink">AI cross-examines policy &amp; rules</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Gemini reads exact document lines while our deterministic engine verifies active days, continuity credits, and IRDAI circulars.
              </p>
            </Card>
          </Reveal>

          {/* Step 3 */}
          <Reveal delay={0.3}>
            <Card hoverLift={false} className="h-full space-y-4">
              <div className="flex size-11 items-center justify-center rounded-full bg-mint text-teal font-medium text-sm">
                3
              </div>
              <h3 className="text-base font-medium text-ink">Download your appeal letter</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Get an editable grievance appeal to the insurer’s GRO and an Insurance Ombudsman complaint outline complete with legal citations.
              </p>
            </Card>
          </Reveal>
        </div>
      </section>

      {/* 4. Live OCR Scanner Demo Section */}
      <section className="mx-auto max-w-4xl px-4 space-y-8">
        <Reveal className="text-center space-y-2 max-w-xl mx-auto">
          <Tag variant="mono">LIVE SCANNER PREVIEW</Tag>
          <h2 className="text-2xl sm:text-3xl font-medium text-ink tracking-tight">
            See how ClaimFight catches repudiation errors
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Our engine scans every cited clause and extracts statutory counter-arguments automatically.
          </p>
        </Reveal>

        <Reveal delay={0.15}>
          <LetterScanDemo />
        </Reveal>
      </section>

      {/* 5. The 4 Core Grounds as Cards */}
      <section className="mx-auto max-w-5xl px-4 space-y-10">
        <Reveal className="text-center space-y-2 max-w-xl mx-auto">
          <Tag variant="mono">LEGAL JURISPRUDENCE</Tag>
          <h2 className="text-2xl sm:text-3xl font-medium text-ink tracking-tight">
            The 4 core contestable grounds
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            We focus on the most common reasons insurers repudiate or cut legitimate hospital claims.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Ground 1 */}
          <Reveal delay={0.1}>
            <Card className="h-full flex flex-col justify-between space-y-4">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-mint text-teal">
                    <Clock className="size-4.5" />
                  </div>
                  <Tag variant="strong">IRDAI Portability Norms</Tag>
                </div>
                <h3 className="text-base font-medium text-ink">Waiting Period Miscalculation</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Insurers often count days from the current renewal date, ignoring prior continuous policy tenure and 12/24-month continuity credits earned.
                </p>
              </div>
              <Link to="/sources" className="text-xs font-medium text-teal hover:underline inline-flex items-center gap-1 pt-2">
                <span>Learn about waiting period rules</span>
                <ChevronRight className="size-3.5" />
              </Link>
            </Card>
          </Reveal>

          {/* Ground 2 */}
          <Reveal delay={0.15}>
            <Card className="h-full flex flex-col justify-between space-y-4">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-mint text-teal">
                    <Activity className="size-4.5" />
                  </div>
                  <Tag variant="strong">Supreme Court Precedent</Tag>
                </div>
                <h3 className="text-base font-medium text-ink">Pre-Existing Disease Non-Disclosure</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Supreme Court rulings establish that accidental bone fractures and acute trauma have zero medical nexus to mild chronic hypertension or diabetes.
                </p>
              </div>
              <Link to="/sources" className="text-xs font-medium text-teal hover:underline inline-flex items-center gap-1 pt-2">
                <span>Learn about causal nexus</span>
                <ChevronRight className="size-3.5" />
              </Link>
            </Card>
          </Reveal>

          {/* Ground 3 */}
          <Reveal delay={0.2}>
            <Card className="h-full flex flex-col justify-between space-y-4">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-mint text-teal">
                    <Building2 className="size-4.5" />
                  </div>
                  <Tag variant="strong">Circular 194/2020</Tag>
                </div>
                <h3 className="text-base font-medium text-ink">Proportionate Room Rent Deductions</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Under IRDAI circulars, insurers are legally prohibited from proportionately cutting medicines, implants, and ICU charges when a patient chooses an upgraded room.
                </p>
              </div>
              <Link to="/sources" className="text-xs font-medium text-teal hover:underline inline-flex items-center gap-1 pt-2">
                <span>Learn about room rent rules</span>
                <ChevronRight className="size-3.5" />
              </Link>
            </Card>
          </Reveal>

          {/* Ground 4 */}
          <Reveal delay={0.25}>
            <Card className="h-full flex flex-col justify-between space-y-4">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-mint text-teal">
                    <Scale className="size-4.5" />
                  </div>
                  <Tag variant="strong">Standardisation Directives</Tag>
                </div>
                <h3 className="text-base font-medium text-ink">Daycare &amp; Medical Necessity</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Modern day-care procedures (e.g. cataract phacoemulsification, dialysis, chemotherapy) cannot be denied simply for lack of 24-hour hospitalization.
                </p>
              </div>
              <Link to="/sources" className="text-xs font-medium text-teal hover:underline inline-flex items-center gap-1 pt-2">
                <span>Learn about day-care coverage</span>
                <ChevronRight className="size-3.5" />
              </Link>
            </Card>
          </Reveal>
        </div>
      </section>

      {/* 6. Pre-Loaded Sample Cases */}
      <section className="mx-auto max-w-5xl px-4 space-y-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1.5">
            <Tag variant="mono">REAL INDIAN CLAIMS</Tag>
            <h2 className="text-2xl sm:text-3xl font-medium text-ink tracking-tight">
              Explore sample cases
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Modeled on actual claim repudiations with watermarked PDFs you can test in real time.
            </p>
          </div>

          <Link to="/samples" className="text-xs font-semibold text-teal hover:underline inline-flex items-center gap-1">
            <span>View all cases</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {SAMPLE_CASES.slice(0, 3).map((sample, idx) => (
            <Reveal key={sample.id} delay={idx * 0.1}>
              <Card className="h-full flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Tag variant={sample.verdict === 'grounds_to_contest' ? 'strong' : 'weak'}>
                      {sample.verdict === 'grounds_to_contest' ? 'Contestable' : 'Legitimate'}
                    </Tag>
                    <span className="font-mono text-xs font-medium text-ink">
                      Dispute: ₹{sample.deductedAmount.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <h3 className="text-base font-medium text-ink line-clamp-1">
                    {sample.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                    {sample.summary}
                  </p>
                </div>

                <div className="pt-4 border-t border-line flex items-center justify-between">
                  <span className="font-mono text-[11px] text-muted truncate max-w-[140px]">
                    {sample.insurerName}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleTestSample(sample.id)}
                    className="text-xs font-medium text-teal hover:text-ink inline-flex items-center gap-1 cursor-pointer"
                  >
                    <span>Test case</span>
                    <ArrowRight className="size-3.5" />
                  </button>
                </div>
              </Card>
            </Reveal>
          ))}
        </div>
      </section>

      {/* 7. Trust, Privacy & Live Stats */}
      <section className="mx-auto max-w-5xl px-4">
        <Reveal>
          <div className="rounded-2xl border border-line bg-surface p-8 sm:p-12 space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 border-b border-line pb-10">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-teal font-medium text-sm">
                  <Lock className="size-4" />
                  <span>24-Hour Auto-Purge</span>
                </div>
                <h3 className="text-base font-medium text-ink">Zero Data Retention</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Uploaded medical bills and letters are held in volatile storage and purged after 24 hours.
                </p>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-teal font-medium text-sm">
                  <ShieldCheck className="size-4" />
                  <span>DPDP Act 2023</span>
                </div>
                <h3 className="text-base font-medium text-ink">Digital Privacy Aligned</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Designed from the ground up to respect Indian data protection principles with strict access isolation.
                </p>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-teal font-medium text-sm">
                  <Scale className="size-4" />
                  <span>Statutory Precedents</span>
                </div>
                <h3 className="text-base font-medium text-ink">Binding IRDAI Authority</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Cross-referenced with official Insurance Ombudsman rules and landmark Supreme Court health judgments.
                </p>
              </div>
            </div>

            {/* Numbers Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
              <div>
                <p className="text-2xl sm:text-3xl font-medium text-ink tracking-tight">
                  <CountUp end={4} suffix=" Core" />
                </p>
                <p className="text-[11px] font-mono text-muted uppercase mt-1">Grounds Audited</p>
              </div>

              <div>
                <p className="text-2xl sm:text-3xl font-medium text-teal tracking-tight">
                  <CountUp end={2} suffix=" Mins" />
                </p>
                <p className="text-[11px] font-mono text-muted uppercase mt-1">Average Turnaround</p>
              </div>

              <div>
                <p className="text-2xl sm:text-3xl font-medium text-ink tracking-tight">
                  <CountUp end={24} suffix="h" />
                </p>
                <p className="text-[11px] font-mono text-muted uppercase mt-1">Document Deletion</p>
              </div>

              <div>
                <p className="text-2xl sm:text-3xl font-medium text-amber-600 tracking-tight">
                  ₹<CountUp end={20000} useIndianFormat={true} suffix=" Cr" />
                </p>
                <p className="text-[11px] font-mono text-muted uppercase mt-1">Annual Claims Deducted in India</p>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* 8. FAQ Accordion Section */}
      <section className="mx-auto max-w-3xl px-4 space-y-8">
        <Reveal className="text-center space-y-2">
          <Tag variant="mono">QUESTIONS ANSWERED</Tag>
          <h2 className="text-2xl sm:text-3xl font-medium text-ink tracking-tight">
            Frequently asked questions
          </h2>
        </Reveal>

        <Reveal delay={0.15}>
          <Accordion items={faqItems} />
        </Reveal>
      </section>

      {/* 9. Final Call to Action */}
      <section className="mx-auto max-w-4xl px-4 text-center">
        <Reveal>
          <div className="rounded-2xl border border-line bg-surface p-10 sm:p-14 space-y-5 shadow-soft">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium text-ink tracking-tight leading-[1.08]">
              Your claim deserves a <span className="font-serif-italic text-teal">second look</span>.
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto">
              Check insurer statements against binding regulations and generate a formal grievance appeal in under 2 minutes.
            </p>
            <div className="pt-3">
              <Button
                variant="primary"
                onClick={scrollToDropzone}
                className="w-full sm:w-auto"
              >
                Upload your letter
              </Button>
            </div>
            <p className="font-mono-code text-[11px] text-muted pt-2">
              FREE · NO CREDIT CARD · 24H PRIVACY PURGE
            </p>
          </div>
        </Reveal>
      </section>
    </PageTransition>
  );
};
