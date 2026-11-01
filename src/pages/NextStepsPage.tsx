import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, 
  Send, 
  Clock, 
  PhoneCall, 
  ExternalLink, 
  Scale, 
  ArrowRight
} from 'lucide-react';

export const NextStepsPage: React.FC = () => {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 md:py-12 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-primary">
          Grievance escalation roadmap
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          In India, health insurance complaints follow a structured 3-stage statutory hierarchy prescribed by IRDAI. Follow these steps in order to ensure your complaint is legally admissible.
        </p>
      </div>

      {/* 3 Stages */}
      <div className="space-y-4">
        {/* Stage 1 */}
        <div className="rounded-xl border bg-card p-6 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-secondary text-secondary-foreground">
              Stage 1: Turnaround 15 to 30 days
            </span>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-primary">
              1. Written appeal to Insurer's Grievance Redressal Officer (GRO)
            </h2>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              Every licensed insurer has a designated Head of Grievances. Submit your ClaimFight appeal letter along with copies of your rejection notice, hospital bills, and policy schedule.
            </p>
          </div>

          <div className="rounded-lg border bg-muted/30 p-3 text-xs space-y-1 text-muted-foreground">
            <p className="font-semibold text-primary">Stage 1 Tips:</p>
            <ul className="space-y-0.5 list-disc pl-5">
              <li>Always obtain a formal Grievance Registration / Token Number.</li>
              <li>Under IRDAI regulations, the insurer must acknowledge within 3 working days and provide resolution within 15 days.</li>
            </ul>
          </div>

          <div className="pt-1">
            <Link
              to="/appeal"
              className="inline-flex min-h-11 items-center rounded-lg bg-accent px-4 text-xs font-medium text-accent-foreground hover:opacity-90 shadow-sm"
            >
              <span>Download &amp; edit appeal letter</span>
              <ArrowRight className="size-3.5 ml-1.5" />
            </Link>
          </div>
        </div>

        {/* Stage 2 */}
        <div className="rounded-xl border bg-card p-6 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-warning-soft text-warning-foreground">
              Stage 2: Regulatory escalation
            </span>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-primary">
              2. Escalate via IRDAI Bima Bharosa Portal (IGMS)
            </h2>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              If the insurer fails to respond within 15 days or offers an unsatisfactory resolution, register the complaint directly with IRDAI on Bima Bharosa.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="rounded-lg border bg-muted/30 p-3">
              <span className="font-semibold text-primary block mb-0.5">Toll-Free Helpline</span>
              <p className="text-muted-foreground">Call <strong>155255</strong> or <strong>1800 4254 732</strong> (8 AM - 8 PM, Mon-Sat).</p>
            </div>
            <div className="rounded-lg border bg-muted/30 p-3">
              <span className="font-semibold text-primary block mb-0.5">Online Portal</span>
              <p className="text-muted-foreground">Register and track token at <a href="https://bimabharosa.irdai.gov.in" target="_blank" rel="noreferrer" className="text-accent underline font-semibold">bimabharosa.irdai.gov.in</a>.</p>
            </div>
          </div>

          <div className="pt-1">
            <a
              href="https://bimabharosa.irdai.gov.in"
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 items-center rounded-lg border bg-card px-4 text-xs font-medium text-primary hover:bg-muted/50"
            >
              <span>Open Bima Bharosa Portal</span>
              <ExternalLink className="size-3.5 text-accent ml-1.5" />
            </a>
          </div>
        </div>

        {/* Stage 3 */}
        <div className="rounded-xl border bg-card p-6 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-success-soft text-success">
              Stage 3: Quasi-judicial authority
            </span>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-primary">
              3. File with the Insurance Ombudsman (CIO)
            </h2>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              If 30 days have passed since your Stage 1 grievance without resolution, or if the insurer issued a final rejection, file a complaint with the regional Insurance Ombudsman.
            </p>
          </div>

          <div className="rounded-lg border bg-muted/30 p-3 text-xs space-y-1 text-muted-foreground">
            <p className="font-semibold text-primary">Ombudsman Benefits:</p>
            <p>• Completely <strong>free of cost</strong> (zero fees or stamp duty).</p>
            <p>• <strong>No lawyers allowed</strong>; policyholders represent themselves.</p>
            <p>• Awards are <strong>binding on the insurer</strong> within 30 days.</p>
            <p>• Financial jurisdiction cap: <strong>Up to ₹30 Lakhs</strong>.</p>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <Link
              to="/ombudsman"
              className="inline-flex min-h-11 items-center rounded-lg bg-accent px-4 text-xs font-medium text-accent-foreground hover:opacity-90 shadow-sm"
            >
              <span>Open Ombudsman complaint draft</span>
              <ArrowRight className="size-3.5 ml-1.5" />
            </Link>
            <a
              href="https://www.cioins.co.in/Ombudsman"
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 items-center rounded-lg border bg-card px-4 text-xs font-medium text-primary hover:bg-muted/50"
            >
              <span>Find your regional centre (17 centres across India)</span>
              <ExternalLink className="size-3 text-accent ml-1.5" />
            </a>
          </div>
        </div>
      </div>
    </main>
  );
};
