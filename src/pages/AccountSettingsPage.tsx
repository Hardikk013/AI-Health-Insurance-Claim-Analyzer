import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Mail, Trash2, Check, Gauge, Sparkles, Shield, Lock, ExternalLink } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useCaseStore } from '../store/useCaseStore';
import { Button } from '../components/common/Button';
import { Tag } from '../components/common/Tag';
import { PageTransition } from '../components/common/PageTransition';

export const AccountSettingsPage: React.FC = () => {
  const { user, purgeUserData } = useAuthStore();
  const { loadCases } = useCaseStore();
  const [purgeSuccess, setPurgeSuccess] = useState(false);

  const handlePurge = () => {
    if (window.confirm('Are you sure you want to purge all your cases, uploaded documents, and generated letters immediately? This cannot be undone.')) {
      purgeUserData();
      loadCases();
      setPurgeSuccess(true);
      setTimeout(() => setPurgeSuccess(false), 4000);
    }
  };

  const analysesToday = user?.analyses_today || 0;
  const remainingToday = Math.max(0, 3 - analysesToday);

  return (
    <PageTransition>
      <main className="min-h-screen bg-cream py-8 md:py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-4xl space-y-8">
          
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-medium tracking-tight text-ink">Account settings</h1>
            <p className="max-w-2xl text-sm text-muted leading-relaxed">
              Manage your session, daily analysis quotas, Google Gemini verification engine, and privacy preferences.
            </p>
          </div>

          {purgeSuccess && (
            <div className="p-4 bg-mint border border-teal/30 rounded-2xl text-xs text-[#085041] font-mono font-medium flex items-center gap-2">
              <Check className="size-4 text-teal" />
              <span>All your account records and stored documents have been deleted.</span>
            </div>
          )}

          {/* Google Gemini AI Configuration Card */}
          <div className="rounded-2xl border border-line bg-surface p-6 space-y-4 shadow-soft">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-mint text-teal">
                  <Sparkles className="size-5 text-teal" />
                </div>
                <div>
                  <h2 className="text-base font-medium text-ink">Google Gemini Multimodal Verification</h2>
                  <p className="text-xs text-muted">Active engine: <strong>Gemini 2.0 Flash</strong> (Server-Side Zero-Trust Isolation)</p>
                </div>
              </div>
              <Tag variant="strong">Active</Tag>
            </div>

            <div className="p-4 rounded-xl border border-line bg-cream/50 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-teal font-medium">
                <Shield className="size-4 shrink-0" />
                <span>Zero-Trust Credential Security (DPDP Act 2023)</span>
              </div>
              <p className="text-muted leading-relaxed">
                All Gemini API keys, OCR extraction engines, and webhook secrets are executed strictly inside secure server-side runtimes. No sensitive credentials or medical document bytes are ever stored in browser local storage or exposed via client JavaScript.
              </p>
              <div className="pt-2 flex items-center justify-between border-t border-line/60">
                <span className="font-mono text-[11px] text-muted">System Administrators:</span>
                <Link
                  to="/admin"
                  className="font-mono text-xs text-teal hover:underline flex items-center gap-1 font-medium"
                >
                  <Lock className="size-3" />
                  <span>Configure via Protected Admin Portal &rarr;</span>
                </Link>
              </div>
            </div>
          </div>

          {/* User Session Profile Card */}
          <div className="rounded-2xl border border-line bg-surface p-6 space-y-4 shadow-soft">
            <h2 className="text-base font-medium text-ink">Active Session Profile</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl border border-line bg-cream space-y-1">
                <span className="font-mono uppercase text-muted text-[10px] block">Full Name</span>
                <p className="font-medium text-ink text-sm">{user?.full_name || 'Policyholder Demo'}</p>
              </div>
              <div className="p-3.5 rounded-xl border border-line bg-cream space-y-1">
                <span className="font-mono uppercase text-muted text-[10px] block">Email Address</span>
                <p className="font-medium text-ink text-sm">{user?.email || 'policyholder.demo@claimfight.in'}</p>
              </div>
            </div>
          </div>

          {/* Immediate Purge Card */}
          <div className="rounded-2xl border border-[#791F1F]/30 bg-[#FCEBEB] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-soft">
            <div className="space-y-1">
              <h3 className="font-medium text-base text-[#791F1F]">Purge all account data</h3>
              <p className="text-xs text-muted leading-relaxed">
                Permanently purge all your cases, uploaded documents, and appeal letters immediately.
              </p>
            </div>
            <button
              type="button"
              onClick={handlePurge}
              className="inline-flex min-h-11 items-center rounded-full bg-[#791F1F] px-5 text-xs font-mono font-medium text-surface hover:opacity-90 transition-opacity shrink-0 cursor-pointer"
            >
              <Trash2 className="size-3.5 mr-1.5" />
              <span>Purge all data</span>
            </button>
          </div>

        </div>
      </main>
    </PageTransition>
  );
};
