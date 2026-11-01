import React, { useState } from 'react';
import { 
  Lock, 
  Trash2, 
  Clock, 
  Check, 
  EyeOff,
  ShieldCheck
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useCaseStore } from '../store/useCaseStore';

export const PrivacyDataPage: React.FC = () => {
  const { purgeUserData } = useAuthStore();
  const { loadCases } = useCaseStore();
  const [purgeSuccess, setPurgeSuccess] = useState(false);

  const handlePurgeNow = () => {
    if (window.confirm('Are you sure you want to purge all your cases, uploaded documents, and generated letters immediately? This action is irreversible.')) {
      purgeUserData();
      loadCases();
      setPurgeSuccess(true);
      setTimeout(() => setPurgeSuccess(false), 4000);
    }
  };

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 md:py-12 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-primary">Privacy &amp; data handling</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Health insurance records contain sensitive medical details. ClaimFight is built with purpose limitation, zero AI training, and automatic 24-hour deletion aligned with India's DPDP Act principles.
        </p>
      </div>

      {purgeSuccess && (
        <div className="p-3.5 bg-success-soft border border-success/30 rounded-lg text-xs text-success font-medium flex items-center gap-2">
          <Check className="size-4" />
          <span>All your cases, stored documents, and analysis records have been purged.</span>
        </div>
      )}

      {/* 4 Pillars */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-xl border bg-card p-5 space-y-2">
          <div className="grid size-9 place-items-center rounded-lg bg-secondary text-secondary-foreground">
            <Clock className="size-4.5" />
          </div>
          <h3 className="font-semibold text-base text-primary">Automated 24-hour purge</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            All uploaded document files (PDFs, JPGs) and raw extracted OCR texts are automatically deleted 24 hours after analysis via Supabase <code className="bg-muted px-1 py-0.5 rounded font-mono text-[11px]">pg_cron</code>.
          </p>
        </div>

        <div className="rounded-xl border bg-card p-5 space-y-2">
          <div className="grid size-9 place-items-center rounded-lg bg-secondary text-secondary-foreground">
            <EyeOff className="size-4.5" />
          </div>
          <h3 className="font-semibold text-base text-primary">Zero model training</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Your medical papers are evaluated through secure private API calls. No user documents or extracted facts are ever retained or used to train AI foundation models.
          </p>
        </div>

        <div className="rounded-xl border bg-card p-5 space-y-2">
          <div className="grid size-9 place-items-center rounded-lg bg-secondary text-secondary-foreground">
            <Lock className="size-4.5" />
          </div>
          <h3 className="font-semibold text-base text-primary">15-minute signed URLs</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Storage buckets are private. Files are accessible only through ephemeral 15-minute signed URLs protected by Supabase Row Level Security (RLS).
          </p>
        </div>

        <div className="rounded-xl border bg-card p-5 space-y-2">
          <div className="grid size-9 place-items-center rounded-lg bg-secondary text-secondary-foreground">
            <ShieldCheck className="size-4.5" />
          </div>
          <h3 className="font-semibold text-base text-primary">Prompt-injection defense</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Document text is fed inside isolated XML tags (<code className="bg-muted px-1 py-0.5 rounded font-mono text-[11px]">&lt;document_text&gt;</code>) with system instructions explicitly treating document content as data, never executable instructions.
          </p>
        </div>
      </div>

      {/* Manual Purge Card */}
      <div className="rounded-xl border border-destructive/30 bg-danger-soft p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-semibold text-sm text-destructive">Manual data deletion</h3>
          <p className="text-xs text-muted-foreground mt-0.5 max-w-md">
            Wipe all claim records, stored documents, and generated appeal drafts immediately from your session.
          </p>
        </div>

        <button
          type="button"
          onClick={handlePurgeNow}
          className="inline-flex min-h-11 items-center rounded-lg bg-danger px-4 text-xs font-semibold text-destructive-foreground hover:opacity-90 shrink-0"
        >
          <Trash2 className="size-3.5 mr-1.5" />
          <span>Purge all my data now</span>
        </button>
      </div>
    </main>
  );
};
