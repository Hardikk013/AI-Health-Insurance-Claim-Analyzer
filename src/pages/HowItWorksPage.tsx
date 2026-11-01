import React from 'react';
import { Link } from 'react-router-dom';
import { TermTooltip } from '../components/common/TermTooltip';

export const HowItWorksPage: React.FC = () => {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 md:py-12">
      <h1 className="text-3xl font-semibold tracking-tight text-primary">How it works</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        ClaimFight works on individual and family floater health policies in India. It explains terms like{' '}
        <TermTooltip termKey="Proportionate Deduction">
          proportionate deduction
        </TermTooltip>{' '}
        and the{' '}
        <TermTooltip termKey="Ombudsman">
          ombudsman
        </TermTooltip>{' '}
        along the way.
      </p>

      <ol className="mt-8 grid gap-4 md:grid-cols-2">
        <li className="rounded-xl border bg-card p-5">
          <span className="text-sm font-semibold text-accent">Step 1</span>
          <h2 className="mt-1 text-lg font-semibold text-primary">Read the documents</h2>
          <p className="mt-1 text-muted-foreground">
            Text is pulled from PDFs and phone photos, page by page. We note when a photo is hard to read.
          </p>
        </li>

        <li className="rounded-xl border bg-card p-5">
          <span className="text-sm font-semibold text-accent">Step 2</span>
          <h2 className="mt-1 text-lg font-semibold text-primary">Find policy rules</h2>
          <p className="mt-1 text-muted-foreground">
            Exclusions, waiting periods, sub-limits, co-pay, room-rent caps, start date and renewals.
          </p>
        </li>

        <li className="rounded-xl border bg-card p-5">
          <span className="text-sm font-semibold text-accent">Step 3</span>
          <h2 className="mt-1 text-lg font-semibold text-primary">Find the insurer's reason</h2>
          <p className="mt-1 text-muted-foreground">
            The reason given, the clause cited, and the claimed, approved and cut amounts.
          </p>
        </li>

        <li className="rounded-xl border bg-card p-5">
          <span className="text-sm font-semibold text-accent">Step 4</span>
          <h2 className="mt-1 text-lg font-semibold text-primary">Compare with the hospital record</h2>
          <p className="mt-1 text-muted-foreground">
            Diagnosis, procedure, dates and medical history from the discharge summary.
          </p>
        </li>

        <li className="rounded-xl border bg-card p-5">
          <span className="text-sm font-semibold text-accent">Step 5</span>
          <h2 className="mt-1 text-lg font-semibold text-primary">Check dates with fixed rules</h2>
          <p className="mt-1 text-muted-foreground">
            Was the policy active? Had the waiting period passed? Dates are computed, never guessed.
          </p>
        </li>

        <li className="rounded-xl border bg-card p-5">
          <span className="text-sm font-semibold text-accent">Step 6</span>
          <h2 className="mt-1 text-lg font-semibold text-primary">Draft your letters</h2>
          <p className="mt-1 text-muted-foreground">
            An appeal to the insurer, and an Ombudsman complaint outline if you have grounds.
          </p>
        </li>
      </ol>

      <Link
        className="mt-8 inline-flex min-h-12 items-center rounded-lg bg-primary px-5 font-medium text-primary-foreground hover:opacity-90 shadow-sm"
        to="/samples"
      >
        See a sample
      </Link>
    </main>
  );
};
