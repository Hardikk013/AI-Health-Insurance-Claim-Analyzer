import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, Mail, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [email, setEmail] = useState('policyholder.demo@claimfight.in');
  const [password, setPassword] = useState('demo1234');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await login(email, 'Policyholder Demo');
    navigate('/dashboard');
  };

  const handleOAuthDemo = async () => {
    setLoading(true);
    await login('google.user@gmail.com', 'Google Policyholder');
    navigate('/dashboard');
  };

  return (
    <main className="mx-auto w-full max-w-md px-4 py-16">
      <div className="rounded-xl border bg-card p-6 md:p-8 space-y-6 shadow-xs">
        <div className="text-center space-y-2">
          <span className="grid size-10 place-items-center rounded-lg bg-primary text-primary-foreground mx-auto">
            <ShieldCheck className="size-5" />
          </span>
          <h1 className="text-2xl font-semibold tracking-tight text-primary">Sign in to ClaimFight</h1>
          <p className="text-xs text-muted-foreground">
            Access your evaluated health insurance cases and appeal letters
          </p>
        </div>

        {/* Google OAuth Button */}
        <button
          type="button"
          onClick={handleOAuthDemo}
          className="w-full inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border bg-card hover:bg-muted/50 text-xs font-medium text-foreground transition-colors"
        >
          <svg className="size-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        <div className="relative flex items-center justify-center">
          <div className="border-t w-full" />
          <span className="bg-card px-2 text-[11px] text-muted-foreground uppercase tracking-wider">or email</span>
        </div>

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

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-primary">Password</label>
              <Link to="/forgot-password" className="text-[11px] text-accent hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border rounded-lg bg-background text-foreground focus:outline-none focus:border-accent"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex min-h-11 items-center justify-center rounded-lg bg-accent px-4 text-xs font-medium text-accent-foreground hover:opacity-90 shadow-sm"
          >
            <span>{loading ? 'Signing in...' : 'Sign in'}</span>
            <ArrowRight className="size-3.5 ml-1.5" />
          </button>
        </form>

        <p className="text-center text-xs text-muted-foreground">
          Don't have an account?{' '}
          <Link to="/register" className="text-accent font-medium hover:underline">
            Sign up free
          </Link>
        </p>
      </div>
    </main>
  );
};
