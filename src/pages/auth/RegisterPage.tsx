import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, Mail, User, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

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
    <main className="mx-auto w-full max-w-md px-4 py-16">
      <div className="rounded-xl border bg-card p-6 md:p-8 space-y-6 shadow-xs">
        <div className="text-center space-y-2">
          <span className="grid size-10 place-items-center rounded-lg bg-primary text-primary-foreground mx-auto">
            <ShieldCheck className="size-5" />
          </span>
          <h1 className="text-2xl font-semibold tracking-tight text-primary">Create ClaimFight account</h1>
          <p className="text-xs text-muted-foreground">
            Contest health insurance rejections with AI and verified IRDAI rules
          </p>
        </div>

        {error && (
          <div className="p-3 bg-danger-soft border border-destructive/30 rounded-lg text-xs text-destructive flex items-center gap-2">
            <AlertCircle className="size-3.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-primary">Full Name</label>
            <div className="relative">
              <User className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                required
                placeholder="e.g. Ramesh Chandra Sharma"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border rounded-lg bg-background text-foreground focus:outline-none focus:border-accent"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-primary">Email address</label>
            <div className="relative">
              <Mail className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="email"
                required
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border rounded-lg bg-background text-foreground focus:outline-none focus:border-accent"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-primary">Create Password</label>
            <div className="relative">
              <Lock className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border rounded-lg bg-background text-foreground focus:outline-none focus:border-accent"
              />
            </div>
          </div>

          {/* Mandatory consent */}
          <div className="p-3 bg-muted/30 border rounded-lg space-y-1">
            <div className="flex items-start gap-2.5">
              <input
                id="reg-consent"
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-1 size-3.5 rounded border-border text-accent focus:ring-accent"
              />
              <label htmlFor="reg-consent" className="text-xs text-foreground leading-relaxed cursor-pointer font-medium">
                I understand my documents are processed by AI, automatically deleted after 24 hours, and this is general information, not legal advice.
              </label>
            </div>
          </div>

          <button
            type="submit"
            className="w-full inline-flex min-h-11 items-center justify-center rounded-lg bg-accent px-4 text-xs font-medium text-accent-foreground hover:opacity-90 shadow-sm"
          >
            <span>Create free account</span>
            <ArrowRight className="size-3.5 ml-1.5" />
          </button>
        </form>

        <p className="text-center text-xs text-muted-foreground">
          Already have an account?{' '}
          <Link to="/login" className="text-accent font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
};
