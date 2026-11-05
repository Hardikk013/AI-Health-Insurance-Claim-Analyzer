import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  FileText,
  Eye,
  EyeOff
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
  getAdminAuthToken
} from '../services/api';
import { Tag } from '../components/common/Tag';
import { Button } from '../components/common/Button';
import { Mascot } from '../components/common/Mascot';
import { PageTransition } from '../components/common/PageTransition';

export const AdminPanelPage: React.FC = () => {
  const navigate = useNavigate();
  const { cases, loadCases, deleteCase } = useCaseStore();
  const { user, refreshUser } = useAuthStore();

  const [authenticated, setAuthenticated] = useState(isAdminAuthenticated());
  const [passcode, setPasscode] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [showPasscode, setShowPasscode] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutSeconds, setLockoutSeconds] = useState(0);

  const [unlimitedActive, setUnlimitedActive] = useState(isAdminMode());
  const [quotaLimit, setQuotaLimit] = useState(user?.custom_daily_limit || 3);
  const [geminiKey, setGeminiKey] = useState('');
  const [isUpdatingKey, setIsUpdatingKey] = useState(false);

  const [actionNotice, setActionNotice] = useState<string | null>(null);

  useEffect(() => {
    loadCases();
    refreshUser();
  }, [loadCases, refreshUser]);

  useEffect(() => {
    if (lockoutSeconds > 0) {
      const timer = setTimeout(() => setLockoutSeconds((s) => s - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [lockoutSeconds]);

  const showNotification = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3500);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutSeconds > 0) return;

    setAuthError(null);
    const success = await authenticateAdmin(passcode);
    if (success) {
      setAuthenticated(true);
      setPasscode('');
      setFailedAttempts(0);
      showNotification('Administrator authenticated securely.');
    } else {
      const nextFail = failedAttempts + 1;
      setFailedAttempts(nextFail);
      setPasscode('');
      if (nextFail >= 5) {
        setLockoutSeconds(30);
        setAuthError('Too many failed attempts. Security cooldown active for 30 seconds.');
      } else {
        setAuthError('Invalid administrator credentials. Access denied.');
      }
    }
  };

  const handleLogout = () => {
    logoutAdmin();
    setAuthenticated(false);
    setPasscode('');
    setAuthError(null);
  };

  const handleResetQuota = () => {
    resetUserQuota();
    refreshUser();
    showNotification('Daily analysis quota reset to 0! You can now run fresh analyses.');
  };

  const handleToggleUnlimited = (enabled: boolean) => {
    setAdminMode(enabled);
    setUnlimitedActive(enabled);
    refreshUser();
    showNotification(enabled ? 'Unlimited Analysis Mode Enabled!' : 'Standard Quota Mode Restored');
  };

  const handleQuotaChange = (newLimit: number) => {
    setQuotaLimit(newLimit);
    setUserQuotaLimit(newLimit);
    refreshUser();
    showNotification(`Daily quota limit updated to ${newLimit} analyses/day`);
  };

  const handleSaveGeminiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!geminiKey.trim()) {
      showNotification('Please enter a valid Gemini API key.');
      return;
    }
    const token = getAdminAuthToken();
    if (!token) {
      showNotification('Administrator session expired. Please re-authenticate.');
      setAuthenticated(false);
      return;
    }
    setIsUpdatingKey(true);
    try {
      const res = await fetch('/api/admin/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ apiKey: geminiKey.trim() })
      });
      if (res.ok) {
        setGeminiKey('');
        showNotification('Gemini API key updated securely on backend server!');
      } else {
        showNotification('Failed to update API key: Authentication error or invalid key.');
      }
    } catch {
      showNotification('Network error connecting to backend admin configuration endpoint.');
    } finally {
      setIsUpdatingKey(false);
    }
  };

  if (!authenticated) {
    return (
      <PageTransition>
        <main className="min-h-[calc(100vh-140px)] bg-cream flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-md rounded-2xl border border-line bg-surface p-6 sm:p-8 space-y-6 shadow-soft">
            <div className="text-center space-y-2">
              <div className="flex justify-center mb-1">
                <Mascot mood="thinking" size={64} />
              </div>
              <h1 className="text-2xl font-medium tracking-tight text-ink">Administrator Access</h1>
              <p className="text-xs text-muted">
                Manage quotas, test limits, and inspect analysis audit trails
              </p>
            </div>

            {authError && (
              <div className="p-3 bg-[#FCEBEB] border border-[#791F1F]/30 rounded-xl text-xs text-[#791F1F] flex items-center gap-2">
                <AlertCircle className="size-3.5 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-mono uppercase text-muted">Admin Passcode</label>
                <div className="relative">
                  <Lock className="size-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                  <input
                    type={showPasscode ? "text" : "password"}
                    placeholder="Enter administrator passcode"
                    value={passcode}
                    disabled={lockoutSeconds > 0}
                    onChange={(e) => setPasscode(e.target.value)}
                    className="w-full pl-9 pr-10 py-2.5 text-xs border border-line rounded-xl bg-cream/40 text-ink focus:outline-none focus:border-teal font-mono transition-colors disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasscode(!showPasscode)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink cursor-pointer p-0.5 transition-colors"
                    title={showPasscode ? "Hide passcode" : "Show passcode"}
                  >
                    {showPasscode ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={lockoutSeconds > 0 || !passcode.trim()}
                  className="w-full justify-center"
                >
                  <span>{lockoutSeconds > 0 ? `Locked (${lockoutSeconds}s)` : 'Authenticate'}</span>
                </Button>
              </div>
            </form>
          </div>
        </main>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <main className="min-h-screen bg-cream py-8 md:py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-5xl space-y-8">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-mint text-teal text-xs font-mono font-medium">
                <ShieldCheck className="size-3.5 text-teal" />
                <span>Admin Privileges Active</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-medium tracking-tight text-ink">
                Administrator Control Panel
              </h1>
              <p className="text-xs sm:text-sm text-muted">
                Reset daily user limits, configure Gemini API keys, and oversee active claim sessions.
              </p>
            </div>

            <Button
              variant="secondary"
              size="sm"
              onClick={handleLogout}
              className="shrink-0"
            >
              <Lock className="size-3.5 mr-1" />
              <span>Lock admin</span>
            </Button>
          </div>

          {actionNotice && (
            <div className="p-3.5 bg-mint border border-teal/30 rounded-xl text-xs text-[#085041] font-mono font-medium flex items-center gap-2">
              <Check className="size-4 text-teal" />
              <span>{actionNotice}</span>
            </div>
          )}

          {/* Quotas & Limits */}
          <div className="rounded-2xl border border-line bg-surface p-6 space-y-5 shadow-soft">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-mint text-teal">
                  <Gauge className="size-5" />
                </div>
                <div>
                  <h2 className="text-base font-medium text-ink">Analysis Rate Limits &amp; Daily Quotas</h2>
                  <p className="text-xs text-muted">User usage today: {user?.analyses_today || 0} analyses recorded</p>
                </div>
              </div>
              <Tag variant={unlimitedActive ? 'strong' : 'info'}>
                {unlimitedActive ? 'Unlimited Active' : `${quotaLimit} / Day`}
              </Tag>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="rounded-xl border border-line bg-cream p-4 flex items-center justify-between">
                <div>
                  <span className="font-medium text-xs text-ink block">Reset Today's Usage</span>
                  <span className="text-[11px] text-muted">Zero out analysis counter</span>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleResetQuota}
                >
                  <RefreshCw className="size-3.5 mr-1" />
                  <span>Reset to 0</span>
                </Button>
              </div>

              <div className="rounded-xl border border-line bg-cream p-4 flex items-center justify-between">
                <div>
                  <span className="font-medium text-xs text-ink block">Unlimited Mode</span>
                  <span className="text-[11px] text-muted">Bypass 3/day quota check</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleUnlimited(!unlimitedActive)}
                  className={`px-3 py-1.5 rounded-full text-xs font-mono font-medium transition-colors cursor-pointer ${
                    unlimitedActive ? 'bg-teal text-surface' : 'bg-surface border border-line text-ink'
                  }`}
                >
                  {unlimitedActive ? 'Disable' : 'Enable'}
                </button>
              </div>
            </div>
          </div>

          {/* Gemini AI Management */}
          <div className="rounded-2xl border border-line bg-surface p-6 space-y-4 shadow-soft">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-mint text-teal">
                  <Sparkles className="size-5" />
                </div>
                <div>
                  <h2 className="text-base font-medium text-ink">Google Gemini Engine Config</h2>
                  <p className="text-xs text-muted">Model: gemini-2.0-flash multimodal document parser</p>
                </div>
              </div>
              <Tag variant="strong">Active</Tag>
            </div>

            <form onSubmit={handleSaveGeminiKey} className="space-y-3 pt-1">
              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase text-muted">Custom Gemini API Key</label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    placeholder="AIzaSy... (leave blank to use built-in engine)"
                    value={geminiKey}
                    onChange={(e) => setGeminiKey(e.target.value)}
                    className="flex-1 px-3.5 py-2.5 text-xs border border-line rounded-xl bg-cream/40 text-ink focus:outline-none focus:border-teal font-mono transition-colors"
                  />
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    disabled={isUpdatingKey || !geminiKey.trim()}
                  >
                    <span>{isUpdatingKey ? 'Updating...' : 'Save key'}</span>
                  </Button>
                </div>
              </div>
            </form>
          </div>

          {/* Cases Ledger */}
          <div className="rounded-2xl border border-line bg-surface p-6 space-y-4 shadow-soft">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-medium text-ink">All Cases Ledger ({cases.length})</h2>
                <p className="text-xs text-muted">Review active claim records across browser sessions</p>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/new')}
              >
                <span>New Case</span>
              </Button>
            </div>

            <div className="space-y-2">
              {cases.map((c) => (
                <div
                  key={c.id}
                  className="p-4 rounded-xl border border-line bg-cream/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-ink">{c.case_number}</span>
                      <Tag variant={c.overall_verdict === 'grounds_to_contest' ? 'strong' : 'weak'}>
                        {c.overall_verdict === 'grounds_to_contest' ? 'Contestable' : 'Sound'}
                      </Tag>
                      <span className="font-medium text-ink">{c.patient_name}</span>
                    </div>
                    <p className="text-muted font-mono text-[11px]">
                      {c.insurer_name} • Policy: {c.policy_number} • Claimed: ₹{Number(c.claim_amount).toLocaleString('en-IN')}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        useCaseStore.getState().setActiveCase(c);
                        navigate('/result');
                      }}
                    >
                      <span>View</span>
                    </Button>
                    <button
                      type="button"
                      onClick={() => {
                        deleteCase(c.id);
                        showNotification(`Deleted case ${c.case_number}`);
                      }}
                      className="p-1.5 text-muted hover:text-[#791F1F] rounded-lg transition-colors cursor-pointer"
                      title="Delete case"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>
    </PageTransition>
  );
};
