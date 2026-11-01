import React, { useState } from 'react';
import { User, Mail, Trash2, Check, Gauge, Sparkles, Key, ExternalLink } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useCaseStore } from '../store/useCaseStore';
import { getGeminiApiKey, setGeminiApiKey } from '../services/geminiService';

export const AccountSettingsPage: React.FC = () => {
  const { user, purgeUserData } = useAuthStore();
  const { loadCases } = useCaseStore();
  const [purgeSuccess, setPurgeSuccess] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState(getGeminiApiKey());
  const [apiKeySaved, setApiKeySaved] = useState(false);

  const handlePurge = () => {
    if (window.confirm('Are you sure you want to purge all your cases, uploaded documents, and generated letters immediately? This cannot be undone.')) {
      purgeUserData();
      loadCases();
      setPurgeSuccess(true);
      setTimeout(() => setPurgeSuccess(false), 4000);
    }
  };

  const handleSaveApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    setGeminiApiKey(apiKeyInput);
    setApiKeySaved(true);
    setTimeout(() => setApiKeySaved(false), 3000);
  };

  const analysesToday = user?.analyses_today || 0;
  const remainingToday = Math.max(0, 3 - analysesToday);

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 md:py-12 space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-primary">Account settings</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Manage your session, daily analysis quotas, Google Gemini verification engine, and privacy preferences.
        </p>
      </div>

      {purgeSuccess && (
        <div className="p-3.5 bg-success-soft border border-success/30 rounded-lg text-xs text-success font-medium flex items-center gap-2">
          <Check className="size-4" />
          <span>All your account records and stored documents have been deleted.</span>
        </div>
      )}

      {/* Google Gemini AI Configuration Card */}
      <div className="rounded-xl border bg-card p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-lg bg-secondary text-accent">
              <Sparkles className="size-4.5" />
            </span>
            <div>
              <h2 className="text-base font-semibold text-primary">Google Gemini Document Verification</h2>
              <p className="text-xs text-muted-foreground">Active model: <strong>Gemini 2.0 Flash</strong> for multimodal OCR, clause isolation, and date checks</p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-success-soft text-success">
            Ready
          </span>
        </div>

        <form onSubmit={handleSaveApiKey} className="space-y-3 pt-1">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-primary flex items-center gap-1.5">
                <Key className="size-3.5 text-accent" />
                <span>Google AI Studio Gemini API Key (Optional)</span>
              </label>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-accent hover:underline flex items-center gap-1"
              >
                <span>Get free Gemini API Key</span>
                <ExternalLink className="size-3" />
              </a>
            </div>
            <div className="flex gap-2">
              <input
                type="password"
                placeholder="AIzaSy... (leave blank to use built-in engine)"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                className="flex-1 px-3 py-2 text-xs border rounded-lg bg-background text-foreground focus:outline-none focus:border-accent"
              />
              <button
                type="submit"
                className="inline-flex min-h-11 items-center rounded-lg bg-accent px-4 text-xs font-medium text-accent-foreground hover:opacity-90"
              >
                Save key
              </button>
            </div>
          </div>

          {apiKeySaved && (
            <p className="text-xs text-success font-medium flex items-center gap-1">
              <Check className="size-3.5" />
              <span>Gemini API Key saved for this session!</span>
            </p>
          )}

          <p className="text-[11px] text-muted-foreground">
            Gemini reads your uploaded rejection letters, policy pages, and doctor discharge summaries with multimodal computer vision to catch date discrepancies and wrongful exclusions.
          </p>
        </form>
      </div>

      {/* Profile Card */}
      <div className="rounded-xl border bg-card p-6 space-y-4 shadow-xs">
        <h2 className="text-lg font-semibold text-primary">Policyholder profile</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="rounded-lg border bg-muted/30 p-3 space-y-1">
            <span className="text-muted-foreground block font-medium">Full Name</span>
            <span className="text-sm font-semibold text-foreground flex items-center gap-1.5">
              <User className="size-3.5 text-accent" />
              <span>{user?.full_name || 'Policyholder'}</span>
            </span>
          </div>

          <div className="rounded-lg border bg-muted/30 p-3 space-y-1">
            <span className="text-muted-foreground block font-medium">Registered Email</span>
            <span className="text-sm font-semibold text-foreground flex items-center gap-1.5">
              <Mail className="size-3.5 text-accent" />
              <span>{user?.email || 'policyholder@claimfight.in'}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Daily Quota Card */}
      <div className="rounded-xl border bg-card p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-primary">Daily analysis usage</h2>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-secondary text-secondary-foreground font-mono">
            {analysesToday} / 3 used
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          Free hackathon quota resets automatically at midnight UTC. You currently have <strong>{remainingToday}</strong> analyses remaining today.
        </p>
      </div>

      {/* Data deletion */}
      <div className="rounded-xl border border-destructive/30 bg-danger-soft p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-semibold text-sm text-destructive">Wipe all stored data</h3>
          <p className="text-xs text-muted-foreground mt-0.5 max-w-md">
            Permanently remove your claim evaluations, uploaded files, and generated appeal drafts immediately.
          </p>
        </div>

        <button
          type="button"
          onClick={handlePurge}
          className="inline-flex min-h-11 items-center rounded-lg bg-danger px-4 text-xs font-semibold text-destructive-foreground hover:opacity-90 shrink-0"
        >
          <Trash2 className="size-3.5 mr-1.5" />
          <span>Purge all data now</span>
        </button>
      </div>
    </main>
  );
};
