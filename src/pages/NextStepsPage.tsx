import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ExternalLink, 
  Scale, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { Tag } from '../components/common/Tag';
import { Button } from '../components/common/Button';
import { PageTransition } from '../components/common/PageTransition';

export const NextStepsPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <PageTransition>
      <main className="min-h-screen bg-cream py-8 md:py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-5xl space-y-8">
          
          {/* Header */}
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-mint text-teal text-xs font-mono font-medium">
              <Scale className="size-3.5 text-teal" />
              <span>Statutory Grievance Hierarchy</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-medium tracking-tight text-ink">
              Grievance escalation roadmap
            </h1>
            <p className="max-w-2xl text-sm text-muted leading-relaxed">
              In India, health insurance repudiation disputes follow a structured 3-stage statutory hierarchy prescribed by IRDAI. Follow these steps in order to ensure your complaint is legally admissible.
            </p>
          </div>

          {/* 3 Stages */}
          <div className="space-y-6">
            
            {/* Stage 1 */}
            <div className="rounded-2xl border border-line bg-surface p-6 sm:p-8 space-y-4 shadow-soft">
              <div className="flex items-center justify-between">
                <Tag variant="strong">Stage 1: Turnaround 15 to 30 days</Tag>
                <span className="font-mono text-xs text-muted">First Recourse</span>
              </div>

              <div>
                <h2 className="text-xl font-medium text-ink">
                  1. Written appeal to Insurer's Grievance Redressal Officer (GRO)
                </h2>
                <p className="text-xs sm:text-sm text-muted mt-1 leading-relaxed">
                  Every licensed insurer has a designated Head of Grievances. Submit your ClaimFight appeal letter along with copies of your rejection notice, hospital bills, and policy schedule.
                </p>
              </div>

              <div className="rounded-xl border border-line bg-cream p-4 text-xs space-y-1.5 text-muted">
                <p className="font-mono uppercase text-ink font-semibold text-[10px]">Stage 1 Protocol:</p>
                <ul className="space-y-1 list-disc pl-5">
                  <li>Always obtain a formal Grievance Registration / Token Number.</li>
                  <li>Under IRDAI regulations, the insurer must acknowledge within 3 working days and provide resolution within 15 to 30 days.</li>
                </ul>
              </div>

              <div className="pt-2">
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => navigate('/appeal')}
                >
                  <span>Download &amp; edit appeal letter</span>
                  <ArrowRight className="size-3.5 ml-1.5" />
                </Button>
              </div>
            </div>

            {/* Stage 2 */}
            <div className="rounded-2xl border border-line bg-surface p-6 sm:p-8 space-y-4 shadow-soft">
              <div className="flex items-center justify-between">
                <Tag variant="medium">Stage 2: Regulatory Escalation</Tag>
                <span className="font-mono text-xs text-muted">Bima Bharosa</span>
              </div>

              <div>
                <h2 className="text-xl font-medium text-ink">
                  2. Escalate via IRDAI Bima Bharosa Portal (IGMS)
                </h2>
                <p className="text-xs sm:text-sm text-muted mt-1 leading-relaxed">
                  If the insurer fails to respond within 15–30 days or offers an unsatisfactory resolution, register the complaint directly with IRDAI on Bima Bharosa.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="rounded-xl border border-line bg-cream p-4 space-y-1">
                  <span className="font-mono uppercase text-ink text-[10px] font-semibold block">Toll-Free IRDAI Helpline</span>
                  <p className="text-muted leading-relaxed">Call <strong>155255</strong> or <strong>1800 4254 732</strong> (8 AM – 8 PM, Mon–Sat).</p>
                </div>
                <div className="rounded-xl border border-line bg-cream p-4 space-y-1">
                  <span className="font-mono uppercase text-ink text-[10px] font-semibold block">Online Bima Bharosa Portal</span>
                  <p className="text-muted leading-relaxed">Register grievance at <a href="https://bimabharosa.irdai.gov.in" target="_blank" rel="noreferrer" className="text-teal underline font-medium">bimabharosa.irdai.gov.in</a>.</p>
                </div>
              </div>

              <div className="pt-2">
                <a
                  href="https://bimabharosa.irdai.gov.in"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-line bg-cream text-ink hover:border-teal hover:text-teal font-mono text-xs transition-colors"
                >
                  <span>Open Bima Bharosa Portal</span>
                  <ExternalLink className="size-3 text-teal" />
                </a>
              </div>
            </div>

            {/* Stage 3 */}
            <div className="rounded-2xl border border-line bg-surface p-6 sm:p-8 space-y-4 shadow-soft">
              <div className="flex items-center justify-between">
                <Tag variant="strong">Stage 3: Quasi-Judicial Binding Award</Tag>
                <span className="font-mono text-xs text-muted">Zero Fees</span>
              </div>

              <div>
                <h2 className="text-xl font-medium text-ink">
                  3. Lodge Complaint with Insurance Ombudsman (CIO)
                </h2>
                <p className="text-xs sm:text-sm text-muted mt-1 leading-relaxed">
                  Under the Insurance Ombudsman Rules (and updated CIO/IRDAI guidelines), individual policyholders can file complaints with zero court fees. Ombudsman awards are legally binding on insurers up to ₹50,00,000.
                </p>
              </div>

              <div className="rounded-xl border border-line bg-cream p-4 text-xs space-y-1.5 text-muted">
                <p className="font-mono uppercase text-ink font-semibold text-[10px]">Procedural Prerequisites under Rule 14(3):</p>
                <ul className="space-y-1 list-disc pl-5">
                  <li>Written appeal must have been sent to insurer's GRO first.</li>
                  <li>30 days must have elapsed or a repudiation received.</li>
                  <li>Complaint filed within 1 year from the date of rejection.</li>
                  <li>No concurrent lawsuit filed in Civil Court or Consumer Commission.</li>
                </ul>
              </div>

              <div className="pt-2">
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => navigate('/ombudsman')}
                >
                  <span>Download Ombudsman Complaint PDF</span>
                  <ArrowRight className="size-3.5 ml-1.5" />
                </Button>
              </div>
            </div>

          </div>
        </div>
      </main>
    </PageTransition>
  );
};
