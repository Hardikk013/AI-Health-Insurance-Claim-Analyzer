import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Key, 
  Lock, 
  Unlock, 
  RefreshCw, 
  Gauge, 
  Database, 
  Trash2, 
  Sparkles, 
  Check, 
  AlertCircle, 
  ExternalLink,
  Sliders,
  FileText
} from 'lucide-react';
import { useCaseStore } from '../store/useCaseStore';
import { useAuthStore } from '../store/useAuthStore';
import { 
  isAdminAuthenticated, 
  authenticateAdmin, 
  logoutAdmin, 
  isAdminMode, 
  setAdminMode, 
  resetUserQuota, 
  setUserQuotaLimit,
  getStoredUserProfile
} from '../services/api';
import { getGeminiApiKey, setGeminiApiKey } from '../services/geminiService';
import { VerdictBadge } from '../components/common/VerdictBadge';

export const AdminPanelPage: React.FC = () => {
  const { cases, loadCases, deleteCase } = useCaseStore();
  const { user, refreshUser } = useAuthStore();

  const [authenticated, setAuthenticated] = useState(isAdminAuthenticated());
  const [passcode, setPasscode] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  const [unlimitedActive, setUnlimitedActive] = useState(isAdminMode());
  const [quotaLimit, setQuotaLimit] = useState(user?.custom_daily_limit || 3);
  const [geminiKey, setGeminiKey] = useState(getGeminiApiKey());

  const [actionNotice, setActionNotice] = useState<string | null>(null);

  useEffect(() => {
    loadCases();
    refreshUser();
  }, [loadCases, refreshUser]);

  const showNotification = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3500);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    if (authenticateAdmin(passcode)) {
      setAuthenticated(true);
      showNotification('Admin panel unlocked successfully!');
    } else {
      setAuthError('Invalid admin passcode. Try "admin2026" or click demo unlock.');
    }
  };

  const handleQuickUnlock = () => {
    authenticateAdmin('admin2026');
    setAuthenticated(true);
    showNotification('Unlocked with Administrator Privileges');
  };

  const handleLogout = () => {
    logoutAdmin();
    setAuthenticated(false);
  };

  const handleResetQuota = () => {
    resetUserQuota();
    refreshUser();
    showNotification('Daily analysis quota reset to 0! You can now analyze new claims.');
  };

  const handleToggleUnlimited = (enabled: boolean) => {
    setAdminMode(enabled);
    setUnlimitedActive(enabled);
    refreshUser();
    showNotification(enabled ? 'Unlimited Analysis Mode Enabled (Bypassing daily limits)!' : 'Standard Quota Mode Restored');
  };

  const handleQuotaChange = (newLimit: number) => {
    setQuotaLimit(newLimit);
    setUserQuotaLimit(newLimit);
    refreshUser();
    showNotification(`Daily quota limit updated to ${newLimit} analyses/day`);
  };

  const handleSaveGeminiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeminiApiKey(geminiKey);
    try {
      await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: geminiKey, model: 'gemini-2.0-flash' })
      });
      showNotification('Google Gemini API Key securely saved and synced to backend!');
    } catch {
      showNotification('Google Gemini API Key saved for this session!');
    }
  };

  const analysesToday = user?.analyses_today || 0;

  // 1. If not authenticated, show sleek passcode lock screen
  if (!authenticated) {
    return (
      <main className="mx-auto w-full max-w-md px-4 py-16">
        <div className="rounded-xl border bg-card p-6 md:p-8 space-y-6 shadow-xs text-center">
          <span className="grid size-12 place-items-center rounded-xl bg-primary text-primary-foreground mx-auto">
            <Lock className="size-6" />
          </span>

          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-primary">ClaimFight Admin Access</h1>
            <p className="text-xs text-muted-foreground mt-1">
              Restricted area to manage daily rate limits, cases ledger, and Gemini API keys.
            </p>
          </div>

          {authError && (
            <div className="p-3 bg-danger-soft border border-destructive/30 rounded-lg text-xs text-destructive flex items-center gap-2">
              <AlertCircle className="size-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <div className="space-y-1">
              <label className="text-xs font-medium text-primary">Administrator Passcode</label>
              <div className="relative">
                <Key className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="password"
                  placeholder="Enter admin passcode"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border rounded-lg bg-background text-foreground focus:outline-none focus:border-accent"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full inline-flex min-h-11 items-center justify-center rounded-lg bg-primary px-4 text-xs font-medium text-primary-foreground hover:opacity-90 shadow-sm"
            >
              <Unlock className="size-3.5 mr-1.5" />
              <span>Unlock Admin Panel</span>
            </button>
          </form>

          {/* Quick Demo Unlock Button */}
          <div className="pt-2 border-t">
            <p className="text-[11px] text-muted-foreground mb-2">Hackathon Evaluator / Developer Access:</p>
            <button
              type="button"
              onClick={handleQuickUnlock}
              className="w-full inline-flex min-h-10 items-center justify-center rounded-lg border bg-muted/40 px-3 text-xs font-medium text-primary hover:bg-muted"
            >
              <Sparkles className="size-3 text-accent mr-1.5" />
              <span>One-Click Admin Demo Unlock</span>
            </button>
          </div>
        </div>
      </main>
    );
  }

  // 2. Authenticated Admin Dashboard
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 md:py-12 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-accent uppercase tracking-wider mb-1">
            <ShieldCheck className="size-4" />
            <span>Administrator Control Center</span>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-primary">ClaimFight Admin Panel</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage rate limits, reset daily quotas, toggle unlimited mode, and configure Google Gemini.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/dashboard"
            className="inline-flex min-h-10 items-center rounded-lg border bg-card px-3 text-xs font-medium text-primary hover:bg-muted/50"
          >
            My cases
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex min-h-10 items-center rounded-lg border bg-card px-3 text-xs font-medium text-destructive hover:bg-danger-soft"
          >
            Lock Admin
          </button>
        </div>
      </div>

      {actionNotice && (
        <div className="p-3.5 bg-success-soft border border-success/30 rounded-lg text-xs text-success font-medium flex items-center gap-2 animate-in fade-in">
          <Check className="size-4 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Metric summary */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border bg-card p-4 space-y-1">
          <span className="text-xs text-muted-foreground font-medium">Analyses Run Today</span>
          <p className="text-2xl font-bold text-primary font-mono">{analysesToday}</p>
          <span className="text-[11px] text-muted-foreground">Limit: {unlimitedActive ? 'Unlimited' : `${quotaLimit}/day`}</span>
        </div>

        <div className="rounded-xl border bg-card p-4 space-y-1">
          <span className="text-xs text-muted-foreground font-medium">Quota Status</span>
          <p className={`text-base font-bold ${unlimitedActive ? 'text-success' : analysesToday >= quotaLimit ? 'text-danger' : 'text-primary'}`}>
            {unlimitedActive ? 'Unlimited Mode' : analysesToday >= quotaLimit ? 'Daily Cap Reached' : 'Within Limits'}
          </p>
          <span className="text-[11px] text-muted-foreground">{unlimitedActive ? 'Quota checks bypassed' : `${Math.max(0, quotaLimit - analysesToday)} remaining`}</span>
        </div>

        <div className="rounded-xl border bg-card p-4 space-y-1">
          <span className="text-xs text-muted-foreground font-medium">Stored Claim Cases</span>
          <p className="text-2xl font-bold text-primary font-mono">{cases.length}</p>
          <span className="text-[11px] text-muted-foreground">In local session ledger</span>
        </div>

        <div className="rounded-xl border bg-card p-4 space-y-1">
          <span className="text-xs text-muted-foreground font-medium">AI Verification Engine</span>
          <p className="text-base font-bold text-accent">Gemini 2.0 Flash</p>
          <span className="text-[11px] text-success font-medium">Vision OCR Active</span>
        </div>
      </div>

      {/* Quota & Rate Limit Controls */}
      <div className="rounded-xl border bg-card p-6 space-y-5 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-lg bg-secondary text-accent">
              <Gauge className="size-4.5" />
            </span>
            <div>
              <h2 className="text-base font-semibold text-primary">Analysis Quotas &amp; Rate-Limiting Overrides</h2>
              <p className="text-xs text-muted-foreground">Instantly reset your daily count or enable unlimited analyses</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleResetQuota}
            className="inline-flex min-h-10 items-center rounded-lg bg-accent px-4 text-xs font-semibold text-accent-foreground hover:opacity-90 shadow-sm"
          >
            <RefreshCw className="size-3.5 mr-1.5" />
            <span>Reset Quota to 0 Now</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Toggle Unlimited */}
          <div className="rounded-lg border bg-muted/20 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-sm text-primary">Unlimited Analyses Mode</h4>
                <p className="text-xs text-muted-foreground mt-0.5">Bypass the 3 analyses/day rule for hackathon presentations</p>
              </div>
              <button
                type="button"
                onClick={() => handleToggleUnlimited(!unlimitedActive)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  unlimitedActive
                    ? 'bg-success text-success-foreground'
                    : 'bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                {unlimitedActive ? 'ENABLED' : 'DISABLED'}
              </button>
            </div>
          </div>

          {/* Custom Quota Selection */}
          <div className="rounded-lg border bg-muted/20 p-4 space-y-2">
            <h4 className="font-semibold text-sm text-primary">Set Daily Analysis Ceiling</h4>
            <div className="flex items-center gap-2 pt-1">
              {[3, 10, 25, 100].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleQuotaChange(num)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    quotaLimit === num
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-card border text-muted-foreground hover:text-primary'
                  }`}
                >
                  {num} / day
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Google Gemini AI Management */}
      <div className="rounded-xl border bg-card p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-lg bg-secondary text-accent">
              <Sparkles className="size-4.5" />
            </span>
            <div>
              <h2 className="text-base font-semibold text-primary">Google Gemini AI Engine Setup</h2>
              <p className="text-xs text-muted-foreground">Configured for multimodal OCR vision and IRDAI clause verification</p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-success-soft text-success">
            gemini-2.0-flash Active
          </span>
        </div>

        <form onSubmit={handleSaveGeminiKey} className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-primary">Custom Gemini API Key</label>
            <div className="flex gap-2">
              <input
                type="password"
                placeholder="AIzaSy... (leave blank to use built-in engine)"
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                className="flex-1 px-3 py-2 text-xs border rounded-lg bg-background text-foreground focus:outline-none focus:border-accent"
              />
              <button
                type="submit"
                className="inline-flex min-h-10 items-center rounded-lg bg-primary px-4 text-xs font-medium text-primary-foreground hover:opacity-90"
              >
                Save key
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Cases Ledger */}
      <div className="rounded-xl border bg-card p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-primary">All Cases Ledger ({cases.length})</h2>
            <p className="text-xs text-muted-foreground">Review stored claim analyses across sessions</p>
          </div>
          <Link
            to="/new"
            className="inline-flex min-h-10 items-center rounded-lg bg-accent px-3.5 text-xs font-semibold text-accent-foreground hover:opacity-90"
          >
            Create New Case
          </Link>
        </div>

        <div className="space-y-2">
          {cases.map((c) => (
            <div
              key={c.id}
              className="p-3.5 rounded-lg border bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-semibold text-muted-foreground">{c.case_number}</span>
                  <VerdictBadge verdict={c.overall_verdict} size="sm" />
                  <span className="font-semibold text-primary">{c.patient_name}</span>
                </div>
                <p className="text-muted-foreground">
                  {c.insurer_name} • Policy: {c.policy_number} • Claimed: ₹{Number(c.claim_amount).toLocaleString('en-IN')}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Link
                  to="/result"
                  onClick={() => useCaseStore.getState().setActiveCase(c)}
                  className="px-2.5 py-1 rounded-md border bg-card text-primary hover:bg-muted font-medium"
                >
                  View
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    deleteCase(c.id);
                    showNotification(`Deleted case ${c.case_number}`);
                  }}
                  className="p-1.5 text-muted-foreground hover:text-danger rounded-md transition-colors"
                  title="Delete case"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
};
