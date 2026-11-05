import React from 'react';
import { PageTransition } from '../components/common/PageTransition';
import { Scale } from 'lucide-react';

export const TermsPage: React.FC = () => {
  return (
    <PageTransition>
      <main className="min-h-screen bg-cream py-8 md:py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-4xl space-y-8">
          
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-mint text-teal text-xs font-mono font-medium">
              <Scale className="size-3.5 text-teal" />
              <span>User Terms &amp; Advisory Notice</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-medium tracking-tight text-ink">Terms of service</h1>
            <p className="max-w-2xl text-sm text-muted leading-relaxed">
              Please review these terms before using the ClaimFight automated evaluation service.
            </p>
          </div>

          <div className="rounded-2xl border border-line bg-surface p-6 sm:p-8 space-y-6 text-sm text-ink leading-relaxed shadow-soft">
            <section className="space-y-1.5">
              <h2 className="text-base font-medium text-ink">1. General informational aid, not legal advice</h2>
              <p className="text-muted text-xs sm:text-sm leading-relaxed">
                ClaimFight is an automated computational evaluation and drafting aid. It does not provide legal representation, legal advice, or formal medical advocacy. ClaimFight is not a law firm or a licensed insurance intermediary. All analyses, explanations, and drafts are generated for general consumer educational and grievance assistance purposes.
              </p>
            </section>

            <section className="space-y-1.5">
              <h2 className="text-base font-medium text-ink">2. No guarantee of claim approval or settlement</h2>
              <p className="text-muted text-xs sm:text-sm leading-relaxed">
                While ClaimFight compares documents against published IRDAI circulars, final decisions made by insurance companies, Grievance Redressal Officers, and the Insurance Ombudsman remain subject to their independent statutory discretion.
              </p>
            </section>

            <section className="space-y-1.5">
              <h2 className="text-base font-medium text-ink">3. Policyholder responsibility to review representations</h2>
              <p className="text-muted text-xs sm:text-sm leading-relaxed">
                The policyholder is solely responsible for reviewing all generated representations, verifying factual accuracy (including dates, bank details, and medical records), and deciding whether to submit the documents to insurers or regulatory authorities.
              </p>
            </section>

            <section className="space-y-1.5">
              <h2 className="text-base font-medium text-ink">4. Fair use tier &amp; rate limits</h2>
              <p className="text-muted text-xs sm:text-sm leading-relaxed">
                ClaimFight is provided free of cost with a fair use limit of 3 analyses per user per day to ensure equitable computational availability.
              </p>
            </section>

            <section className="space-y-1.5">
              <h2 className="text-base font-medium text-ink">5. 24-hour auto-purge</h2>
              <p className="text-muted text-xs sm:text-sm leading-relaxed">
                In compliance with the principles of India's Digital Personal Data Protection (DPDP) Act, 2023, all uploaded document files and raw OCR extractions are purged after 24 hours.
              </p>
            </section>
          </div>
        </div>
      </main>
    </PageTransition>
  );
};
