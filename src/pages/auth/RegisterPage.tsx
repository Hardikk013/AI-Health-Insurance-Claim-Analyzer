import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, Mail, User, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { Button } from '../../components/common/Button';
import { Mascot } from '../../components/common/Mascot';
import { PageTransition } from '../../components/common/PageTransition';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!consent) {
      setError('You must accept the DPDP data handling and legal disclaimer consent.');
      return;
    }

    await login(email, fullName || 'Policyholder');
    navigate('/dashboard');
  };

  return (
    <PageTransition>
      <main className="min-h-[calc(100vh-140px)] bg-cream flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md rounded-2xl border border-line bg-surface p-6 sm:p-8 space-y-6 shadow-soft">
          
          <div className="text-center space-y-2">
            <div className="flex justify-center mb-1">
              <Mascot mood="idle" size={64} />
            </div>
            <h1 className="text-2xl font-medium tracking-tight text-ink">Create ClaimFight account</h1>
            <p className="text-xs text-muted">
              Contest health insurance rejections with AI and verified IRDAI rules
            </p>
          </div>

          {error && (
            <div className="p-3 bg-[#FCEBEB] border border-[#791F1F]/30 rounded-xl text-xs text-[#791F1F] flex items-center gap-2">
              <AlertCircle className="size-3.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-mono uppercase text-muted">Full Name</label>
              <div className="relative">
                <User className="size-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Chandra Sharma"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs border border-line rounded-xl bg-cream/40 text-ink focus:outline-none focus:border-teal transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono uppercase text-muted">Email address</label>
              <div className="relative">
                <Mail className="size-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type="email"
                  required
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs border border-line rounded-xl bg-cream/40 text-ink focus:outline-none focus:border-teal transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono uppercase text-muted">Create Password</label>
              <div className="relative">
                <Lock className="size-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs border border-line rounded-xl bg-cream/40 text-ink focus:outline-none focus:border-teal transition-colors"
                />
              </div>
            </div>

            {/* Mandatory consent */}
            <div className="p-3.5 bg-cream/60 border border-line rounded-xl space-y-1">
              <div className="flex items-start gap-2.5">
                <input
                  id="reg-consent"
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-0.5 size-4 rounded border-line text-teal focus:ring-teal cursor-pointer"
                />
                <label htmlFor="reg-consent" className="text-xs text-ink cursor-pointer leading-relaxed">
                  I understand ClaimFight provides informational analysis under Indian insurance rules and is not a law firm.
                </label>
              </div>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="md"
                className="w-full justify-center"
              >
                <span>Create account</span>
              </Button>
            </div>
          </form>

          <div className="text-center text-xs text-muted">
            Already have an account?{' '}
            <Link to="/login" className="text-teal font-medium hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </main>
    </PageTransition>
  );
};
