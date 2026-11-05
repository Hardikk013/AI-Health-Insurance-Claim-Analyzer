import React, { useState } from 'react';
import { 
  Lock, 
  Trash2, 
  Clock, 
  Check, 
  EyeOff,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useCaseStore } from '../store/useCaseStore';
import { Button } from '../components/common/Button';
import { Tag } from '../components/common/Tag';
import { PageTransition } from '../components/common/PageTransition';

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
    <PageTransition>
      <main className="min-h-screen bg-cream py-8 md:py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-5xl space-y-8">
          
          {/* Header */}
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-mint text-teal text-xs font-mono font-medium">
              <Lock className="size-3.5 text-teal" />
              <span>DPDP Act Principles</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-medium tracking-tight text-ink">
              Privacy &amp; data handling
            </h1>
            <p className="max-w-2xl text-sm text-muted leading-relaxed">
              Health insurance records contain sensitive medical details. ClaimFight is built with strict purpose limitation, zero AI model training, and automatic 24-hour deletion aligned with India's DPDP Act principles.
            </p>
          </div>

          {purgeSuccess && (
            <div className="p-4 bg-mint border border-teal/30 rounded-2xl text-xs text-[#085041] font-mono font-medium flex items-center gap-2">
              <Check className="size-4 text-teal" />
              <span>All your cases, stored documents, and analysis records have been wiped immediately.</span>
            </div>
          )}

          {/* 4 Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-line bg-surface p-6 space-y-3 shadow-soft">
              <div className="flex size-10 items-center justify-center rounded-xl bg-mint text-teal">
                <Clock className="size-5" />
              </div>
              <h3 className="font-medium text-lg text-ink">Automated 24-hour purge</h3>
              <p className="text-xs text-muted leading-relaxed">
                All uploaded document files (PDFs, images) and raw extracted text are permanently purged 24 hours after processing via automated background cleanup jobs.
              </p>
            </div>

            <div className="rounded-2xl border border-line bg-surface p-6 space-y-3 shadow-soft">
              <div className="flex size-10 items-center justify-center rounded-xl bg-mint text-teal">
                <EyeOff className="size-5" />
              </div>
              <h3 className="font-medium text-lg text-ink">Zero model training</h3>
              <p className="text-xs text-muted leading-relaxed">
                Your medical papers are evaluated through secure enterprise API calls. No user documents or clinical findings are ever retained or used to train public AI foundation models.
              </p>
            </div>

            <div className="rounded-2xl border border-line bg-surface p-6 space-y-3 shadow-soft">
              <div className="flex size-10 items-center justify-center rounded-xl bg-mint text-teal">
                <Lock className="size-5" />
              </div>
              <h3 className="font-medium text-lg text-ink">Ephemeral signed URLs</h3>
              <p className="text-xs text-muted leading-relaxed">
                Document storage is completely private. Files are accessible only through short-lived 15-minute signed URLs protected by Row Level Security (RLS).
              </p>
            </div>

            <div className="rounded-2xl border border-line bg-surface p-6 space-y-3 shadow-soft">
              <div className="flex size-10 items-center justify-center rounded-xl bg-mint text-teal">
                <ShieldCheck className="size-5" />
              </div>
              <h3 className="font-medium text-lg text-ink">Isolated fact extraction</h3>
              <p className="text-xs text-muted leading-relaxed">
                Document text is isolated in strict data blocks with system instructions treating document content strictly as data, never executable instructions.
              </p>
            </div>
          </div>

          {/* Manual Purge Card */}
          <div className="rounded-2xl border border-[#791F1F]/30 bg-[#FCEBEB] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-soft">
            <div className="space-y-1">
              <h3 className="font-medium text-base text-[#791F1F] flex items-center gap-1.5">
                <ShieldAlert className="size-4" />
                <span>Immediate manual data wipe</span>
              </h3>
              <p className="text-xs text-muted leading-relaxed max-w-md">
                Wipe all claim records, uploaded documents, and generated appeal drafts immediately from your session.
              </p>
            </div>

            <button
              type="button"
              onClick={handlePurgeNow}
              className="inline-flex min-h-11 items-center rounded-full bg-[#791F1F] px-5 text-xs font-mono font-medium text-surface hover:opacity-90 transition-opacity shrink-0 cursor-pointer"
            >
              <Trash2 className="size-3.5 mr-1.5" />
              <span>Purge all my data now</span>
            </button>
          </div>
        </div>
      </main>
    </PageTransition>
  );
};
