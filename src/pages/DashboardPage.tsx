import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FilePlus, 
  Trash2, 
  Clock, 
  Sparkles, 
  ArrowRight, 
  FileText, 
  Gauge
} from 'lucide-react';
import { useCaseStore } from '../store/useCaseStore';
import { useAuthStore } from '../store/useAuthStore';
import { VerdictBadge } from '../components/common/VerdictBadge';
import { ClaimCase } from '../types';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { cases, loadCases, setActiveCase, deleteCase, loadSampleCase } = useCaseStore();
  const { user } = useAuthStore();
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    loadCases();
  }, [loadCases]);

  const handleOpenCase = (c: ClaimCase) => {
    setActiveCase(c);
    navigate('/result');
  };

  const handleOpenAppeal = (c: ClaimCase, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveCase(c);
    navigate('/appeal');
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteCase(id);
    setDeleteConfirmId(null);
  };

  const formatCountdown = (expiresAt: string) => {
    const diff = new Date(expiresAt).getTime() - Date.now();
    if (diff <= 0) return 'Expired (Purging)';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${mins}m left until file auto-purge`;
  };

  const analysesToday = user?.analyses_today || 0;
  const remainingToday = Math.max(0, 3 - analysesToday);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 md:py-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-primary">My cases</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track analyses, inspect side-by-side comparisons, and download grievance appeal letters.
          </p>
        </div>

        <Link
          to="/new"
          className="inline-flex min-h-11 items-center rounded-lg bg-accent px-4 text-sm font-medium text-accent-foreground hover:opacity-90 shadow-sm shrink-0"
        >
          <FilePlus className="size-4 mr-2" />
          <span>New case</span>
        </Link>
      </div>

      {/* Daily Quota Card */}
      <div className="rounded-xl border bg-card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-lg bg-secondary text-secondary-foreground shrink-0">
            <Gauge className="size-4.5" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-primary">Daily Analysis Quota</span>
              <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded font-mono">
                {analysesToday}/3 analyses used
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Limit of 3 analyses per user per day. Resets every midnight.
            </p>
          </div>
        </div>

        <div>
          <span className="text-xs font-semibold text-accent px-3 py-1.5 rounded-lg bg-secondary">
            {remainingToday} free analyses left today
          </span>
        </div>
      </div>

      {/* Case List */}
      {cases.length === 0 ? (
        <div className="rounded-xl border border-dashed bg-card p-12 text-center max-w-md mx-auto space-y-4">
          <div className="grid size-12 place-items-center rounded-full bg-muted text-muted-foreground mx-auto">
            <FileText className="size-6" />
          </div>
          <h3 className="text-base font-semibold text-primary">No claim cases yet</h3>
          <p className="text-xs text-muted-foreground">
            Upload your health insurance documents to check for contestable grounds, or test with a sample claim.
          </p>
          <div className="flex items-center justify-center gap-2 pt-2">
            <Link
              to="/new"
              className="inline-flex min-h-11 items-center rounded-lg bg-accent px-4 text-xs font-medium text-accent-foreground"
            >
              Start new case
            </Link>
            <button
              type="button"
              onClick={() => {
                loadSampleCase('case-waiting-period-cataract');
                navigate('/result');
              }}
              className="inline-flex min-h-11 items-center rounded-lg border bg-card px-4 text-xs font-medium text-primary hover:bg-muted/50"
            >
              <Sparkles className="size-3.5 mr-1 text-warning" />
              <span>Load Cataract sample</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid gap-3">
          {cases.map((c) => (
            <div
              key={c.id}
              onClick={() => handleOpenCase(c)}
              className="rounded-xl border bg-card p-5 hover:border-accent/60 transition-colors cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                    {c.case_number}
                  </span>
                  <VerdictBadge verdict={c.overall_verdict} size="sm" />
                  {c.is_sample && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-warning-soft text-warning-foreground">
                      Sample case
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="font-semibold text-base text-primary">
                    {c.patient_name} • {c.insurer_name}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Policy: <span className="font-mono">{c.policy_number}</span> • Claim: <span className="font-mono">{c.claim_number}</span>
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span>
                    Claim: <strong className="text-foreground">₹{Number(c.claim_amount).toLocaleString('en-IN')}</strong>
                  </span>
                  <span>•</span>
                  <span>
                    Deducted: <strong className="text-danger">₹{Number(c.deducted_amount).toLocaleString('en-IN')}</strong>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="size-3 text-warning" />
                    <span>{formatCountdown(c.expires_at)}</span>
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0">
                {c.overall_verdict === 'grounds_to_contest' && c.letters && c.letters.length > 0 && (
                  <button
                    type="button"
                    onClick={(e) => handleOpenAppeal(c, e)}
                    className="inline-flex min-h-11 items-center rounded-lg bg-secondary px-3.5 text-xs font-medium text-secondary-foreground hover:opacity-90"
                  >
                    View appeal
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleOpenCase(c)}
                  className="inline-flex min-h-11 items-center rounded-lg border bg-card px-3.5 text-xs font-medium text-primary hover:bg-muted/50"
                >
                  <span>Results</span>
                  <ArrowRight className="size-3.5 ml-1" />
                </button>

                {deleteConfirmId === c.id ? (
                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={(e) => handleDelete(c.id, e)}
                      className="px-2.5 py-1.5 text-xs font-semibold bg-danger text-destructive-foreground rounded-lg"
                    >
                      Delete
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmId(null)}
                      className="px-2 py-1.5 text-xs text-muted-foreground"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteConfirmId(c.id);
                    }}
                    className="p-2 text-muted-foreground hover:text-danger rounded-lg transition-colors"
                    title="Delete case immediately"
                  >
                    <Trash2 className="size-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
};
