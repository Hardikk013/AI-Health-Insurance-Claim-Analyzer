import React from 'react';

export const TermsPage: React.FC = () => {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 md:py-12 space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-primary">Terms of service</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Please read these terms carefully before using the ClaimFight automated evaluation service.
        </p>
      </div>

      <div className="rounded-xl border bg-card p-6 md:p-8 space-y-6 text-sm text-foreground leading-relaxed shadow-xs">
        <section className="space-y-1.5">
          <h2 className="text-base font-semibold text-primary">1. General information, not legal advice</h2>
          <p className="text-muted-foreground text-xs sm:text-sm">
            ClaimFight is an automated computational evaluation and drafting aid. It does not provide legal representation, legal advice, or formal medical advocacy. ClaimFight is not a law firm or a licensed insurance intermediary. All analyses, explanations, and drafts are generated for general consumer educational and grievance assistance purposes.
          </p>
        </section>

        <section className="space-y-1.5">
          <h2 className="text-base font-semibold text-primary">2. No guarantee of claim approval or settlement</h2>
          <p className="text-muted-foreground text-xs sm:text-sm">
            While ClaimFight compares documents against published IRDAI circulars, final decisions made by insurance companies, Grievance Redressal Officers, and the Insurance Ombudsman remain subject to their independent statutory discretion.
          </p>
        </section>

        <section className="space-y-1.5">
          <h2 className="text-base font-semibold text-primary">3. Policyholder responsibility to review representations</h2>
          <p className="text-muted-foreground text-xs sm:text-sm">
            The policyholder is solely responsible for reviewing all generated representations, verifying factual accuracy (including dates, bank details, and medical records), and deciding whether to submit the documents to insurers or regulatory authorities.
          </p>
        </section>

        <section className="space-y-1.5">
          <h2 className="text-base font-semibold text-primary">4. Free hackathon tier &amp; rate limits</h2>
          <p className="text-muted-foreground text-xs sm:text-sm">
            ClaimFight is provided free of cost as a hackathon product with a daily limit of 3 analyses per user per day.
          </p>
        </section>

        <section className="space-y-1.5">
          <h2 className="text-base font-semibold text-primary">5. 24-hour auto-purge</h2>
          <p className="text-muted-foreground text-xs sm:text-sm">
            In compliance with the principles of India's Digital Personal Data Protection (DPDP) Act, 2023, all uploaded document files and raw OCR extractions are purged after 24 hours.
          </p>
        </section>
      </div>
    </main>
  );
};
