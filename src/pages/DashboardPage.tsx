import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FilePlus, 
  Trash2, 
  Clock, 
  Sparkles, 
  ArrowRight, 
  FileText, 
  ShieldCheck,
  Building2,
  ChevronRight,
  Scale,
  CheckCircle2,
  AlertOctagon,
  BarChart3
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCaseStore } from '../store/useCaseStore';
import { useAuthStore } from '../store/useAuthStore';
import { ClaimCase } from '../types';
import { Tag } from '../components/common/Tag';
import { Button } from '../components/common/Button';
import { Mascot } from '../components/common/Mascot';
import { CountUp } from '../components/common/CountUp';
import { PageTransition } from '../components/common/PageTransition';

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
    if (diff <= 0) return 'Purged under DPDP Act';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${mins}m left until auto-purge`;
  };

  const analysesToday = user?.analyses_today || 0;
  const remainingToday = Math.max(0, 3 - analysesToday);

  // Statistics derived purely from real case data
  const totalCases = cases.length;
  const totalDisputed = cases.reduce((acc, c) => acc + (Number(c.deducted_amount) || Number(c.claim_amount) || 0), 0);
  const contestableCases = cases.filter(c => c.overall_verdict === 'grounds_to_contest');
  const soundCases = cases.filter(c => c.overall_verdict === 'insurer_appears_correct');
  const contestableRate = totalCases > 0 ? Math.round((contestableCases.length / totalCases) * 100) : 0;
  const contestablePercent = totalCases > 0 ? (contestableCases.length / totalCases) * 100 : 0;
  const soundPercent = totalCases > 0 ? (soundCases.length / totalCases) * 100 : 0;
  const otherPercent = Math.max(0, 100 - contestablePercent - soundPercent);

  return (
    <PageTransition>
      <main className="min-h-screen bg-cream py-8 md:py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-5xl space-y-8">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-mint text-teal text-xs font-mono font-medium mb-1.5">
                <ShieldCheck className="size-3.5 text-teal" />
                <span>Policyholder Adjudication Portal</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-ink">
                My cases
              </h1>
              <p className="mt-1 text-sm text-muted">
                Track audits, inspect policy comparisons, and download formal grievance appeal drafts.
              </p>
            </div>

            <Button
              variant="primary"
              size="md"
              onClick={() => navigate('/new')}
              className="shrink-0"
            >
              <FilePlus className="size-4 mr-1.5" />
              <span>New case</span>
            </Button>
          </div>

          {/* 4 KPI Statistics Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-line bg-surface p-5 space-y-2 shadow-soft hover:border-teal/50 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase text-muted">Total Audits</span>
                <div className="flex size-7 items-center justify-center rounded-lg bg-mint text-teal">
                  <FileText className="size-3.5" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-medium text-ink">
                <CountUp end={totalCases} />
              </p>
              <span className="text-[10px] text-muted block">Cases stored locally</span>
            </div>

            <div className="rounded-2xl border border-line bg-surface p-5 space-y-2 shadow-soft hover:border-teal/50 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase text-muted">Disputed Relief</span>
                <div className="flex size-7 items-center justify-center rounded-lg bg-mint text-teal">
                  <Scale className="size-3.5" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-medium text-ink">
                ₹<CountUp end={totalDisputed} useIndianFormat={true} />
              </p>
              <span className="text-[10px] text-muted block">Potential claim recovery</span>
            </div>

            <div className="rounded-2xl border border-line bg-surface p-5 space-y-2 shadow-soft hover:border-teal/50 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase text-muted">Contestable Rate</span>
                <div className="flex size-7 items-center justify-center rounded-lg bg-mint text-teal">
                  <CheckCircle2 className="size-3.5" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-medium text-teal">
                <CountUp end={contestableRate} suffix="%" />
              </p>
              <span className="text-[10px] text-muted block">{contestableCases.length} of {totalCases} claims contestable</span>
            </div>

            <div className="rounded-2xl border border-line bg-surface p-5 space-y-2 shadow-soft hover:border-teal/50 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase text-muted">Daily Fair Quota</span>
                <div className="flex size-7 items-center justify-center rounded-lg bg-mint text-teal font-mono font-bold text-xs">
                  {remainingToday}/3
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-medium text-ink">
                {remainingToday} <span className="text-sm font-normal text-muted">free</span>
              </p>
              <span className="text-[10px] text-muted block">24h DPDP auto-purge</span>
            </div>
          </div>

          {/* Visual Claims Distribution Chart (Only when data exists) */}
          {totalCases > 0 && (
            <div className="rounded-2xl border border-line bg-surface p-5 sm:p-6 space-y-3.5 shadow-soft">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <BarChart3 className="size-4 text-teal" />
                  <h3 className="text-xs font-mono uppercase tracking-wider text-ink font-semibold">
                    Claim Adjudication Distribution
                  </h3>
                </div>
                <div className="flex items-center gap-4 text-xs font-mono text-muted">
                  <span className="flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-teal" />
                    <span>Contestable ({contestableCases.length})</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-muted" />
                    <span>Sound ({soundCases.length})</span>
                  </span>
                </div>
              </div>

              {/* Segmented Horizontal Bar */}
              <div className="w-full bg-line h-3 rounded-full overflow-hidden flex">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${contestablePercent}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="bg-teal h-full"
                  title={`Contestable: ${contestableCases.length} (${Math.round(contestablePercent)}%)`}
                />
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${soundPercent}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
                  className="bg-muted h-full"
                  title={`Sound: ${soundCases.length} (${Math.round(soundPercent)}%)`}
                />
                {otherPercent > 0 && (
                  <div 
                    style={{ width: `${otherPercent}%` }}
                    className="bg-amber h-full opacity-60"
                    title={`Needs Info: ${Math.round(otherPercent)}%`}
                  />
                )}
              </div>
            </div>
          )}

          {/* Case List or Empty State */}
          {cases.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-line bg-surface/80 p-12 text-center max-w-md mx-auto space-y-5 shadow-soft">
              <div className="flex justify-center">
                <Mascot mood="idle" size={90} />
              </div>
              <div>
                <h3 className="text-lg font-medium text-ink">No claim cases yet</h3>
                <p className="text-xs text-muted mt-1 leading-relaxed">
                  Upload your rejection letter to find contestable grounds, or test with a pre-loaded sample.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => navigate('/new')}
                  className="w-full sm:w-auto justify-center"
                >
                  <span>Start new case</span>
                </Button>
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => {
                    loadSampleCase('case-waiting-period-cataract');
                    navigate('/result');
                  }}
                  className="w-full sm:w-auto justify-center"
                >
                  <Sparkles className="size-3.5 mr-1 text-amber" />
                  <span>Try Cataract sample</span>
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {cases.map((c) => {
                const isContestable = c.overall_verdict === 'grounds_to_contest';

                return (
                  <motion.div
                    key={c.id}
                    whileHover={{ y: -2 }}
                    onClick={() => handleOpenCase(c)}
                    className="rounded-2xl border border-line bg-surface p-5 hover:border-teal/60 transition-all cursor-pointer shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-2 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs text-muted bg-cream px-2.5 py-0.5 rounded-full border border-line">
                          {c.case_number}
                        </span>
                        <Tag variant={isContestable ? 'strong' : 'weak'}>
                          {isContestable ? 'Contestable' : 'Sound Repudiation'}
                        </Tag>
                        {c.is_sample && (
                          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-[#FAEEDA] text-[#633806] border border-[#F2D7AE]">
                            Sample Case
                          </span>
                        )}
                      </div>

                      <div>
                        <h3 className="text-base font-medium text-ink">
                          {c.patient_name} • {c.insurer_name}
                        </h3>
                        <p className="text-xs text-muted mt-0.5 font-mono">
                          Policy: {c.policy_number} • Claim: {c.claim_number}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted pt-0.5">
                        <span>
                          Claim: <strong className="text-ink font-medium">₹{Number(c.claim_amount).toLocaleString('en-IN')}</strong>
                        </span>
                        <span>•</span>
                        <span>
                          Deducted: <strong className="text-[#791F1F] font-medium">₹{Number(c.deducted_amount).toLocaleString('en-IN')}</strong>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 font-mono text-[11px] text-muted">
                          <Clock className="size-3 text-amber" />
                          <span>{formatCountdown(c.expires_at)}</span>
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-line">
                      {isContestable && c.letters && c.letters.length > 0 && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={(e) => handleOpenAppeal(c, e)}
                        >
                          <span>View appeal</span>
                        </Button>
                      )}

                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleOpenCase(c)}
                      >
                        <span>Audit result</span>
                      </Button>

                      {deleteConfirmId === c.id ? (
                        <div className="flex items-center gap-1.5 pl-2" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={(e) => handleDelete(c.id, e)}
                            className="px-2.5 py-1 text-xs font-mono font-medium rounded-full bg-[#791F1F] text-surface cursor-pointer"
                          >
                            Confirm Delete
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(null)}
                            className="px-2 py-1 text-xs text-muted hover:text-ink cursor-pointer"
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
                          className="p-2 text-muted hover:text-[#791F1F] rounded-lg transition-colors cursor-pointer"
                          title="Purge case immediately"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </PageTransition>
  );
};
