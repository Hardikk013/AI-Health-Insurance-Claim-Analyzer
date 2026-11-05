import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, Check } from 'lucide-react';
import { Mascot } from '../../components/common/Mascot';
import { Button } from '../../components/common/Button';
import { PageTransition } from '../../components/common/PageTransition';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <PageTransition>
      <main className="min-h-[calc(100vh-140px)] bg-cream flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md rounded-2xl border border-line bg-surface p-6 sm:p-8 space-y-6 shadow-soft">
          <div className="text-center space-y-2">
            <div className="flex justify-center mb-1">
              <Mascot mood="idle" size={64} />
            </div>
            <h1 className="text-2xl font-medium tracking-tight text-ink">Reset password</h1>
            <p className="text-xs text-muted">
              Enter your registered email to receive password reset instructions
            </p>
          </div>

          {submitted ? (
            <div className="p-4 bg-mint border border-teal/30 rounded-2xl text-xs text-[#085041] text-center space-y-2 font-mono">
              <Check className="size-4 mx-auto text-teal" />
              <p className="font-semibold">Reset instructions sent</p>
              <p className="text-muted text-[11px]">If an account exists for {email}, a recovery link has been dispatched.</p>
              <Link to="/login" className="inline-block mt-2 font-medium text-teal hover:underline">
                Return to sign in
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-mono uppercase text-muted">Email address</label>
                <div className="relative">
                  <Mail className="size-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 text-xs border border-line rounded-xl bg-cream/40 text-ink focus:outline-none focus:border-teal transition-colors"
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  className="w-full justify-center"
                >
                  <span>Send reset link</span>
                </Button>
              </div>

              <div className="text-center text-xs text-muted">
                Remembered your password?{' '}
                <Link to="/login" className="text-teal font-medium hover:underline">
                  Sign in
                </Link>
              </div>
            </form>
          )}
        </div>
      </main>
    </PageTransition>
  );
};
