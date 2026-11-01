import React from 'react';
import { Link } from 'react-router-dom';
import { MailCheck, ArrowRight } from 'lucide-react';

export const VerifyEmailPage: React.FC = () => {
  return (
    <main className="mx-auto w-full max-w-md px-4 py-16">
      <div className="rounded-xl border bg-card p-6 md:p-8 space-y-4 text-center shadow-xs">
        <span className="grid size-10 place-items-center rounded-lg bg-secondary text-secondary-foreground mx-auto">
          <MailCheck className="size-5" />
        </span>
        <h1 className="text-2xl font-semibold tracking-tight text-primary">Verify your email</h1>
        <p className="text-xs text-muted-foreground leading-relaxed">
          We have sent a verification message to your email. Click the confirmation link to activate your ClaimFight account.
        </p>

        <div className="pt-2">
          <Link
            to="/login"
            className="inline-flex min-h-11 items-center rounded-lg bg-accent px-4 text-xs font-medium text-accent-foreground hover:opacity-90 shadow-sm"
          >
            <span>Proceed to sign in</span>
            <ArrowRight className="size-3.5 ml-1.5" />
          </Link>
        </div>
      </div>
    </main>
  );
};
