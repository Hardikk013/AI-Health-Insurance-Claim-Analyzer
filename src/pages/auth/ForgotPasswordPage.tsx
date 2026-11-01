import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Mail, ArrowRight, Check } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <main className="mx-auto w-full max-w-md px-4 py-16">
      <div className="rounded-xl border bg-card p-6 md:p-8 space-y-6 shadow-xs">
        <div className="text-center space-y-2">
          <span className="grid size-10 place-items-center rounded-lg bg-primary text-primary-foreground mx-auto">
            <ShieldCheck className="size-5" />
          </span>
          <h1 className="text-2xl font-semibold tracking-tight text-primary">Reset password</h1>
          <p className="text-xs text-muted-foreground">
            Enter your email to receive password reset instructions
          </p>
        </div>

        {submitted ? (
          <div className="p-4 bg-success-soft border border-success/30 rounded-lg text-xs text-success text-center space-y-2">
            <Check className="size-4 mx-auto" />
            <p className="font-semibold">Reset instructions sent</p>
            <p className="text-muted-foreground">If an account exists for {email}, a reset link has been dispatched.</p>
            <Link to="/login" className="inline-block mt-2 font-medium text-accent hover:underline">
              Return to sign in
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-primary">Email address</label>
              <div className="relative">
                <Mail className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border rounded-lg bg-background text-foreground focus:outline-none focus:border-accent"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full inline-flex min-h-11 items-center justify-center rounded-lg bg-accent px-4 text-xs font-medium text-accent-foreground hover:opacity-90 shadow-sm"
            >
              <span>Send reset link</span>
              <ArrowRight className="size-3.5 ml-1.5" />
            </button>

            <div className="text-center">
              <Link to="/login" className="text-xs text-muted-foreground hover:text-primary">
                Back to sign in
              </Link>
            </div>
          </form>
        )}
      </div>
    </main>
  );
};
