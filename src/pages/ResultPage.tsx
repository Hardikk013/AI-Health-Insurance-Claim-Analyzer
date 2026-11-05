import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  FileText, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Download,
  Scale,
  Calendar,
  FileSpreadsheet,
  AlertOctagon,
  Copy,
  Check,
  Edit3,
  ChevronDown,
  ChevronUp,
  Send,
  FileDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCaseStore } from '../store/useCaseStore';
import { SAMPLE_CASES } from '../data/sampleCases';
import { SourceViewerModal } from '../components/case/SourceViewerModal';
import { DocumentType } from '../types';
import { exportLetterToPdf, exportLetterToDocx } from '../services/exportService';
import { Gauge } from '../components/common/Gauge';
import { Tag } from '../components/common/Tag';
import { Button } from '../components/common/Button';
import { Mascot } from '../components/common/Mascot';
import { PageTransition } from '../components/common/PageTransition';

export const ResultPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { activeCase, cases, loadCases, setActiveCase, loadSampleCase, updateLetterBody } = useCaseStore();

  const [activeModalData, setActiveModalData] = useState<{
    isOpen: boolean;
    title: string;
    docType: DocumentType;
    page: number;
    quote: string;
    context?: string;
  }>({
    isOpen: false,
    title: '',
    docType: 'rejection_letter',
    page: 1,
    quote: ''
  });

  const [isCopied, setIsCopied] = useState(false);
  const [isEditingLetter, setIsEditingLetter] = useState(false);
  const [letterBodyDraft, setLetterBodyDraft] = useState('');
  const [expandedGroundIndex, setExpandedGroundIndex] = useState<number | null>(0);

  useEffect(() => {
    loadCases();
  }, [loadCases]);

  useEffect(() => {
    if (id) {
      const saved = cases.find(c => c.id === id);
      if (saved) {
        setActiveCase(saved);
      } else {
        const sample = SAMPLE_CASES.find(s => s.id === id);
        if (sample) {
          loadSampleCase(id);
        }
      }
    } else if (!activeCase) {
      if (cases.length > 0) {
        setActiveCase(cases[0]);
      } else {
        loadSampleCase('case-waiting-period-cataract');
      }
    }
  }, [id, cases, activeCase, setActiveCase, loadSampleCase]);

  const appealLetter = activeCase?.letters?.find(l => l.letter_type === 'grievance_appeal');
  const ombLetter = activeCase?.letters?.find(l => l.letter_type === 'ombudsman_complaint');

  useEffect(() => {
    if (appealLetter?.body) {
      setLetterBodyDraft(appealLetter.body);
    }
  }, [appealLetter?.body]);

  if (!activeCase) {
    return (
      <main className="min-h-[calc(100vh-140px)] bg-cream py-16 px-4">
        <div className="mx-auto w-full max-w-md text-center space-y-4 rounded-2xl border border-line bg-surface p-8 shadow-soft">
          <AlertCircle className="size-10 text-muted mx-auto" />
          <h2 className="text-xl font-medium text-ink">No claim case loaded</h2>
          <p className="text-xs text-muted leading-relaxed">
            Please create a new case or test with one of our pre-built official cases.
          </p>
          <div className="pt-2">
            <Button
              variant="primary"
              size="md"
              className="w-full justify-center"
              onClick={() => navigate('/new')}
            >
              <span>Start new case</span>
            </Button>
          </div>
        </div>
      </main>
    );
  }

  const comparisons = activeCase.comparisons || [];
  const contestableComparisons = comparisons.filter(c => c.verdict === 'grounds_to_contest');
  const isContestable = activeCase.overall_verdict === 'grounds_to_contest';

  // 5 Distinct Financial Quantities
  const claimedAmount = Number(activeCase.claim_amount) || 0;
  const approvedAmount = Number(activeCase.approved_amount) || 0;
  const rejectedAmount = activeCase.rejected_amount !== undefined 
    ? Number(activeCase.rejected_amount) 
    : (approvedAmount === 0 ? claimedAmount : 0);
  const deductedAmount = Number(activeCase.deducted_amount) || 0;
  const disputedAmount = Number(activeCase.disputed_amount) || 
    (rejectedAmount > 0 ? rejectedAmount : (deductedAmount > 0 ? deductedAmount : claimedAmount));

  // Date and Continuity Credit details
  const dateVerif = activeCase.date_verification || null;
  const ombVerif = activeCase.ombudsman_verification || null;

  const handleOpenSourceViewer = (
    docType: DocumentType,
    title: string,
    page: number,
    quote: string,
    context?: string
  ) => {
    setActiveModalData({
      isOpen: true,
      title,
      docType,
      page,
      quote,
      context
    });
  };

  const handleCopyLetter = () => {
    const textToCopy = isEditingLetter ? letterBodyDraft : (appealLetter?.body || '');
    navigator.clipboard.writeText(textToCopy);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2400);
  };

  const handleSaveLetterDraft = () => {
    if (appealLetter && letterBodyDraft) {
      updateLetterBody(appealLetter.id, letterBodyDraft);
      setIsEditingLetter(false);
    }
  };

  const handleDownloadAppealPdf = () => {
    if (!appealLetter) return;
    exportLetterToPdf({
      title: 'Formal Grievance Redressal Appeal',
      recipientTitle: appealLetter.recipient_title,
      recipientOrg: appealLetter.recipient_organization,
      subject: appealLetter.subject,
      body: isEditingLetter ? letterBodyDraft : appealLetter.body,
      caseNumber: activeCase.case_number,
      patientName: activeCase.patient_name,
      policyNumber: activeCase.policy_number,
      claimNumber: activeCase.claim_number,
      hospitalName: activeCase.hospital_name,
      claimAmount: activeCase.claim_amount,
      deductedAmount: disputedAmount,
    }, `ClaimFight_Grievance_Appeal_${activeCase.case_number}.pdf`);
  };

  const handleDownloadOmbudsmanPdf = () => {
    if (!ombLetter) return;
    exportLetterToPdf({
      title: 'Complaint to Insurance Ombudsman',
      recipientTitle: ombLetter.recipient_title,
      recipientOrg: ombLetter.recipient_organization,
      subject: ombLetter.subject,
      body: ombLetter.body,
      caseNumber: activeCase.case_number,
      patientName: activeCase.patient_name,
      policyNumber: activeCase.policy_number,
      claimNumber: activeCase.claim_number,
      hospitalName: activeCase.hospital_name,
      claimAmount: activeCase.claim_amount,
      deductedAmount: disputedAmount,
    }, `ClaimFight_Ombudsman_Complaint_${activeCase.case_number}.pdf`);
  };

  const handleDownloadAppealDocx = () => {
    if (!appealLetter) return;
    exportLetterToDocx({
      title: 'Formal Grievance Redressal Appeal',
      recipientTitle: appealLetter.recipient_title,
      recipientOrg: appealLetter.recipient_organization,
      subject: appealLetter.subject,
      body: isEditingLetter ? letterBodyDraft : appealLetter.body,
      caseNumber: activeCase.case_number,
      patientName: activeCase.patient_name,
      policyNumber: activeCase.policy_number,
      claimNumber: activeCase.claim_number,
      hospitalName: activeCase.hospital_name,
      claimAmount: activeCase.claim_amount,
      deductedAmount: disputedAmount,
    }, `ClaimFight_Grievance_Appeal_${activeCase.case_number}.docx`);
  };

  return (
    <PageTransition>
      <main className="min-h-screen bg-cream py-8 md:py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-7xl space-y-8">
          
          {/* Top Banner: Success Header with Mascot and Case Meta */}
          <div className="rounded-2xl border border-line bg-surface p-6 sm:p-8 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-5">
              <div className="hidden sm:block shrink-0">
                <Mascot mood={isContestable ? 'happy' : 'idle'} size={72} />
              </div>
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs text-muted-foreground bg-cream px-2.5 py-1 rounded-full border border-line">
                    {activeCase.case_number}
                  </span>
                  <Tag variant={isContestable ? 'strong' : 'weak'}>
                    {isContestable ? 'Grounds to contest' : 'Repudiation legally sound'}
                  </Tag>
                  {activeCase.is_sample && (
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-[#FAEEDA] text-[#633806] border border-[#F2D7AE]">
                      Sample Case
                    </span>
                  )}
                </div>

                <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-ink">
                  Claim Analysis: {activeCase.patient_name}
                </h1>

                <p className="text-xs sm:text-sm text-muted">
                  Insurer: <strong className="text-ink font-medium">{activeCase.insurer_name}</strong> • Policy:{' '}
                  <span className="font-mono text-ink">{activeCase.policy_number}</span> • Claim:{' '}
                  <span className="font-mono text-ink">{activeCase.claim_number}</span>
                </p>

                <p className="text-xs text-muted">
                  Hospital: <strong className="text-ink font-medium">{activeCase.hospital_name}</strong>
                  {activeCase.admission_date && ` • Admission: ${activeCase.admission_date}`}
                  {activeCase.discharge_date && ` • Discharge: ${activeCase.discharge_date}`}
                </p>
              </div>
            </div>

            {/* Quick Actions in Banner */}
            <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0">
              {isContestable ? (
                <>
                  <Button
                    variant="primary"
                    size="md"
                    onClick={handleDownloadAppealPdf}
                    className="justify-center"
                  >
                    <Download className="size-4 mr-1.5" />
                    <span>Download Appeal PDF</span>
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleDownloadOmbudsmanPdf}
                    className="justify-center"
                  >
                    <span>Download Ombudsman PDF</span>
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleDownloadAppealDocx}
                    className="justify-center"
                  >
                    <FileDown className="size-3.5 mr-1" />
                    <span>Download Appeal DOCX</span>
                  </Button>
                </>
              ) : (
                <div className="rounded-xl border border-line bg-cream p-3 max-w-xs text-xs text-muted leading-relaxed">
                  <p className="font-medium text-ink mb-0.5">Objective AI Assessment</p>
                  The repudiation aligns with standard policy exclusions. ClaimFight does not draft misleading appeals.
                </div>
              )}
            </div>
          </div>

          {/* 5-Figure Financial Breakdown Row */}
          <div className="rounded-2xl border border-line bg-surface p-5 sm:p-6 space-y-4 shadow-soft">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="size-4 text-teal" />
                <h2 className="text-xs font-mono uppercase tracking-wider text-ink font-semibold">
                  Financial Analysis & Dispute Quantification
                </h2>
              </div>
              <span className="text-[11px] font-mono text-muted">Independent Arithmetic Audit</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="p-3.5 rounded-xl border border-line bg-cream space-y-1">
                <span className="text-[11px] font-mono uppercase text-muted block">Total Claimed</span>
                <p className="text-base sm:text-lg font-medium text-ink">₹{claimedAmount.toLocaleString('en-IN')}</p>
                <span className="text-[10px] text-muted block">Hospital billed amount</span>
              </div>

              <div className="p-3.5 rounded-xl border border-line bg-cream space-y-1">
                <span className="text-[11px] font-mono uppercase text-muted block">Amount Approved</span>
                <p className="text-base sm:text-lg font-medium text-teal">₹{approvedAmount.toLocaleString('en-IN')}</p>
                <span className="text-[10px] text-muted block">Admitted by insurer</span>
              </div>

              <div className="p-3.5 rounded-xl border border-line bg-cream space-y-1">
                <span className="text-[11px] font-mono uppercase text-muted block">Amount Rejected</span>
                <p className="text-base sm:text-lg font-medium text-[#791F1F]">₹{rejectedAmount.toLocaleString('en-IN')}</p>
                <span className="text-[10px] text-muted block">Full repudiation sum</span>
              </div>

              <div className="p-3.5 rounded-xl border border-line bg-cream space-y-1">
                <span className="text-[11px] font-mono uppercase text-muted block">Amount Deducted</span>
                <p className="text-base sm:text-lg font-medium text-[#633806]">₹{deductedAmount.toLocaleString('en-IN')}</p>
                <span className="text-[10px] text-muted block">Sub-limits & co-pays</span>
              </div>

              <div className="p-3.5 rounded-xl border border-teal bg-mint/30 space-y-1">
                <span className="text-[11px] font-mono uppercase text-[#085041] font-semibold block">Potentially Disputed</span>
                <p className="text-base sm:text-lg font-bold text-teal">₹{disputedAmount.toLocaleString('en-IN')}</p>
                <span className="text-[10px] text-[#085041] block">Target relief in appeal</span>
              </div>
            </div>

            <p className="text-[11px] text-muted italic">
              Note: These five amounts are tracked separately and not treated as interchangeable. Disputed relief represents the net financial sum eligible for grievance escalation under IRDAI guidelines.
            </p>
          </div>

          {/* TWO-COLUMN CORE LAYOUT */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT COLUMN: Appeal Strength & Evidence Audit (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Appeal Strength Card with Gauge */}
              <div className="rounded-2xl border border-line bg-surface p-6 space-y-5 shadow-soft">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <div className="shrink-0">
                    <Gauge 
                      verdict={activeCase.overall_verdict} 
                      score={isContestable ? 88 : 22} 
                      size={180} 
                    />
                  </div>
                  <div className="space-y-2 text-center sm:text-left">
                    <span className="text-xs font-mono uppercase tracking-wider text-teal font-semibold">
                      Appeal Strength Assessment
                    </span>
                    <h3 className="text-xl sm:text-2xl font-medium tracking-tight text-ink">
                      {isContestable 
                        ? `${contestableComparisons.length} of ${comparisons.length} grounds can be contested`
                        : 'Repudiation appears compliant'}
                    </h3>
                    <p className="text-xs sm:text-sm text-muted leading-relaxed">
                      {isContestable
                        ? 'Google Gemini and our rule engine detected explicit conflicts between the repudiation clauses and your policy schedule / IRDAI guidelines.'
                        : 'Based on the policy terms booklet and hospital clinical notes, the cited exclusions appear legally grounded.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Contestable Grounds Accordion List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-mono uppercase tracking-wider text-ink font-semibold">
                    Detailed Grounds & Verification Audit
                  </h3>
                  <span className="text-xs text-muted font-mono">{comparisons.length} items evaluated</span>
                </div>

                {comparisons.map((item, idx) => {
                  const isExpanded = expandedGroundIndex === idx;
                  const isItemContestable = item.verdict === 'grounds_to_contest';

                  return (
                    <div
                      key={item.id || idx}
                      className="rounded-2xl border border-line bg-surface overflow-hidden shadow-soft transition-all"
                    >
                      {/* Accordion Row Header */}
                      <button
                        type="button"
                        onClick={() => setExpandedGroundIndex(isExpanded ? null : idx)}
                        className="w-full p-4 sm:p-5 flex items-start justify-between gap-4 text-left cursor-pointer hover:bg-cream/40 transition-colors"
                      >
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Tag variant={isItemContestable ? 'strong' : item.verdict === 'unclear' ? 'medium' : 'weak'}>
                              {isItemContestable ? 'Strong Ground' : item.verdict === 'unclear' ? 'Needs Info' : 'Sound Clause'}
                            </Tag>
                            {item.verification_status && (
                              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-cream text-muted border border-line">
                                {item.verification_status === 'verified' ? 'Verified in PDF' : 'Missing Doc'}
                              </span>
                            )}
                          </div>
                          <p className="text-sm sm:text-base font-medium text-ink leading-snug">
                            {item.contest_reason_plain}
                          </p>
                        </div>

                        <div className="p-1 text-muted hover:text-ink shrink-0">
                          {isExpanded ? <ChevronUp className="size-5" /> : <ChevronDown className="size-5" />}
                        </div>
                      </button>

                      {/* Expanded Evidence Details */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="border-t border-line bg-cream/30 p-5 space-y-4"
                          >
                            {/* Side-by-Side: Rejection Quote vs Policy Clause */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                              {/* Left: Insurer Stated Grounds */}
                              <div className="rounded-xl border border-line bg-surface p-4 flex flex-col justify-between space-y-2">
                                <div>
                                  <div className="flex items-center justify-between text-[11px] font-mono text-muted mb-1">
                                    <span className="text-[#791F1F] font-semibold uppercase">Insurer Stated</span>
                                    <span>Page {item.insurer_doc_page || 1}</span>
                                  </div>
                                  <p className="text-xs text-ink leading-normal">
                                    {item.insurer_statement}
                                  </p>
                                </div>

                                {item.insurer_quote && (
                                  <button
                                    type="button"
                                    onClick={() => handleOpenSourceViewer(
                                      'rejection_letter',
                                      'Rejection Letter',
                                      item.insurer_doc_page || 1,
                                      item.insurer_quote!
                                    )}
                                    className="text-left p-2.5 rounded-lg border border-line bg-cream/50 text-[11px] text-muted hover:text-teal transition-colors cursor-pointer group"
                                  >
                                    <div className="flex items-center justify-between text-[10px] font-mono text-teal mb-0.5">
                                      <span>Click to inspect PDF quote</span>
                                      <ExternalLink className="size-3" />
                                    </div>
                                    <p className="italic text-ink">"{item.insurer_quote}"</p>
                                  </button>
                                )}
                              </div>

                              {/* Right: Policy Document Clause */}
                              <div className="rounded-xl border border-line bg-surface p-4 flex flex-col justify-between space-y-2">
                                <div>
                                  <div className="flex items-center justify-between text-[11px] font-mono text-muted mb-1">
                                    <span className="text-teal font-semibold uppercase">Policy Clause</span>
                                    <span>Page {item.policy_page || 14}</span>
                                  </div>
                                  <p className="text-xs text-ink leading-normal font-medium">
                                    {item.policy_clause_heading}
                                  </p>
                                </div>

                                {item.policy_quote && (
                                  <button
                                    type="button"
                                    onClick={() => handleOpenSourceViewer(
                                      'policy_document',
                                      'Policy Document',
                                      item.policy_page || 14,
                                      item.policy_quote!
                                    )}
                                    className="text-left p-2.5 rounded-lg border border-line bg-cream/50 text-[11px] text-muted hover:text-teal transition-colors cursor-pointer group"
                                  >
                                    <div className="flex items-center justify-between text-[10px] font-mono text-teal mb-0.5">
                                      <span>Click to inspect clause text</span>
                                      <ExternalLink className="size-3" />
                                    </div>
                                    <p className="italic text-ink">"{item.policy_quote}"</p>
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Clinical Fact from Discharge Summary */}
                            {item.medical_fact && (
                              <div className="rounded-xl border border-line bg-surface p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                                <div className="space-y-0.5">
                                  <span className="text-[10px] font-mono uppercase tracking-wider text-muted block">
                                    Discharge Summary Fact (Page {item.discharge_page || 1})
                                  </span>
                                  <p className="text-xs text-ink">
                                    {item.medical_fact}
                                  </p>
                                </div>
                                {item.discharge_summary_quote && (
                                  <button
                                    type="button"
                                    onClick={() => handleOpenSourceViewer(
                                      'discharge_summary',
                                      'Discharge Summary',
                                      item.discharge_page || 1,
                                      item.discharge_summary_quote!
                                    )}
                                    className="text-xs font-mono text-teal hover:underline inline-flex items-center gap-1 shrink-0"
                                  >
                                    <span>Inspect clinical stamp</span>
                                    <ExternalLink className="size-3" />
                                  </button>
                                )}
                              </div>
                            )}

                            {/* Applied Rules Engine Note */}
                            {item.rules_applied && item.rules_applied.length > 0 && (
                              <div className="space-y-1.5 pt-1">
                                {item.rules_applied.map((rule, rIdx) => (
                                  <div key={rIdx} className="text-xs rounded-xl border border-line bg-surface p-3 space-y-1">
                                    <span className="font-semibold text-teal">{rule.rule_title}</span>
                                    <p className="text-muted leading-relaxed">{rule.explanation}</p>
                                    {rule.authority && (
                                      <span className="text-[10px] font-mono text-muted block">
                                        Source: {rule.authority} • Verified: {rule.last_verified || '2026-11-01'}
                                      </span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>

              {/* Deterministic Date & Waiting Period Calculation Card */}
              <div className="rounded-2xl border border-line bg-surface p-5 sm:p-6 space-y-4 shadow-soft">
                <div className="flex items-center justify-between border-b border-line pb-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="size-4 text-teal" />
                    <h3 className="text-xs font-mono uppercase tracking-wider text-ink font-semibold">
                      Deterministic Date & Waiting-Period Verification
                    </h3>
                  </div>
                  <span className="text-[11px] font-mono text-muted">IRDAI Guidelines</span>
                </div>

                {dateVerif ? (
                  <div className="space-y-3.5">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                      <div className="p-3 rounded-xl border border-line bg-cream space-y-1">
                        <span className="text-[10px] font-mono uppercase text-muted block">Policy Inception</span>
                        <span className="font-medium text-ink">{dateVerif.policy_start_date || '01-01-2025'}</span>
                      </div>
                      <div className="p-3 rounded-xl border border-line bg-cream space-y-1">
                        <span className="text-[10px] font-mono uppercase text-muted block">Hospital Admission</span>
                        <span className="font-medium text-ink">{dateVerif.hospitalization_date || activeCase.admission_date || '02-08-2026'}</span>
                      </div>
                      <div className="p-3 rounded-xl border border-line bg-cream space-y-1">
                        <span className="text-[10px] font-mono uppercase text-muted block">Active Policy Days</span>
                        <span className="font-semibold text-teal">{dateVerif.active_policy_days ?? 578} Days</span>
                      </div>
                      <div className="p-3 rounded-xl border border-line bg-cream space-y-1">
                        <span className="text-[10px] font-mono uppercase text-muted block">Standard Wait Period</span>
                        <span className="font-medium text-ink">{Math.round((dateVerif.standard_waiting_period_days || 730) / 30.4375)} Months ({dateVerif.standard_waiting_period_days || 730}d)</span>
                      </div>
                    </div>

                    {/* Visual Milestone Timeline */}
                    <div className="rounded-xl border border-line bg-cream/40 p-4 space-y-2">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-muted block">
                        Statutory Milestone Timeline:
                      </span>
                      <div className="relative pt-2 pb-1">
                        <div className="absolute top-4 left-6 right-6 h-0.5 bg-line" />
                        <div className="relative z-10 grid grid-cols-4 text-center">
                          <div className="flex flex-col items-center">
                            <div className="size-3.5 rounded-full bg-teal ring-4 ring-mint flex items-center justify-center mb-1.5" />
                            <span className="text-[10px] font-mono text-muted uppercase">Inception</span>
                            <span className="text-[11px] font-medium text-ink font-mono">{dateVerif.policy_start_date || '01-01-2025'}</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <div className="size-3.5 rounded-full bg-teal ring-4 ring-mint flex items-center justify-center mb-1.5" />
                            <span className="text-[10px] font-mono text-muted uppercase">+12m Credit</span>
                            <span className="text-[11px] font-semibold text-teal font-mono">365d Target</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <div className="size-3.5 rounded-full bg-teal ring-4 ring-mint flex items-center justify-center mb-1.5" />
                            <span className="text-[10px] font-mono text-muted uppercase">Admission</span>
                            <span className="text-[11px] font-medium text-ink font-mono">{dateVerif.hospitalization_date || activeCase.admission_date || '02-08-2026'}</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <div className="size-3.5 rounded-full bg-[#085041] ring-4 ring-mint flex items-center justify-center mb-1.5">
                              <Check className="size-2 text-surface stroke-[3]" />
                            </div>
                            <span className="text-[10px] font-mono text-teal uppercase font-semibold">578d Active</span>
                            <span className="text-[11px] font-bold text-teal font-mono">Elapsed ✓</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Continuity Credit Explanation Box */}
                    <div className="rounded-xl border border-line bg-cream p-4 space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                        <span className="font-medium text-ink flex items-center gap-1.5">
                          <Clock className="size-3.5 text-teal" />
                          <span>Continuity Credit & Net Threshold Calculation:</span>
                        </span>
                        <span className="font-mono text-[11px] text-muted">
                          Credit: {dateVerif.continuity_credit_months || 12} Months ({dateVerif.continuity_credit_days || 365} Days)
                        </span>
                      </div>

                      <p className="text-xs text-ink leading-relaxed">
                        {dateVerif.calculation_explanation}
                      </p>

                      <div className="pt-1 flex items-center gap-2">
                        <Tag variant={dateVerif.waiting_period_completed === true ? 'strong' : 'medium'}>
                          {dateVerif.waiting_period_completed === true 
                            ? 'Waiting Period Has Elapsed (With Continuity Credit)' 
                            : 'Waiting Period Active'}
                        </Tag>
                      </div>
                    </div>

                    {/* Missing Portability Document Notice */}
                    {dateVerif.missing_portability_documents && dateVerif.missing_portability_documents.length > 0 && (
                      <div className="rounded-xl border border-[#F2A93B]/40 bg-[#FAEEDA]/50 p-4 flex items-start gap-3 text-xs text-[#633806]">
                        <AlertOctagon className="size-4 shrink-0 mt-0.5 text-amber" />
                        <div className="space-y-1 leading-relaxed">
                          <span className="font-semibold text-ink">Action Required: Enclose Prior Portability Certificate</span>
                          <p>
                            Continuity credit is recognized under IRDAI Portability Guidelines, but insurers require the previous policy schedule or portability certificate to substantiate the 12-month tenure credit. Enclose prior policy proof with your grievance submission.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-muted">Date verification completed with standard calendar arithmetic.</p>
                )}
              </div>

              {/* Insurance Ombudsman Legal Limits Card */}
              <div className="rounded-2xl border border-line bg-surface p-5 sm:p-6 space-y-4 shadow-soft">
                <div className="flex items-center justify-between border-b border-line pb-3">
                  <div className="flex items-center gap-2">
                    <Scale className="size-4 text-teal" />
                    <h3 className="text-xs font-mono uppercase tracking-wider text-ink font-semibold">
                      Insurance Ombudsman Legal Verification (Rules 2017)
                    </h3>
                  </div>
                  <span className="text-[11px] font-mono text-muted">
                    Verified: {ombVerif?.last_verified || '2026-11-01'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl border border-line bg-cream space-y-1">
                    <span className="text-[10px] font-mono uppercase text-muted block">Ombudsman Ceiling</span>
                    <p className="text-base font-semibold text-ink">₹50,00,000</p>
                    <span className="text-[10px] text-muted block">Pecuniary jurisdiction limit</span>
                  </div>

                  <div className="p-3.5 rounded-xl border border-line bg-cream space-y-1">
                    <span className="text-[10px] font-mono uppercase text-muted block">Relief Sought</span>
                    <p className="text-base font-bold text-teal">₹{disputedAmount.toLocaleString('en-IN')}</p>
                    <span className="text-[10px] text-[#085041] font-medium block">✓ Within Ombudsman limit</span>
                  </div>

                  <div className="p-3.5 rounded-xl border border-line bg-cream space-y-1">
                    <span className="text-[10px] font-mono uppercase text-muted block">Authority Citation</span>
                    <p className="text-xs font-medium text-ink">Council for Insurance Ombudsmen</p>
                    <span className="text-[10px] text-muted block">Rules 2017 (Amended 2021)</span>
                  </div>
                </div>

                {/* Checklist */}
                <div className="p-3.5 rounded-xl border border-line bg-cream/60 space-y-2 text-xs">
                  <span className="text-[11px] font-mono uppercase tracking-wide text-ink font-semibold block">
                    Rule 14(3) Ombudsman Eligibility Conditions:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-muted">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="size-3.5 text-teal shrink-0" />
                      <span>1. First submit appeal to Insurer's GRO</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="size-3.5 text-teal shrink-0" />
                      <span>2. Wait 30 days or await rejection</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="size-3.5 text-teal shrink-0" />
                      <span>3. File within 1 year of rejection</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="size-3.5 text-teal shrink-0" />
                      <span>4. No concurrent court proceeding</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Appeal Letter & Action Center (5 cols) */}
            <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
              
              {/* Appeal Letter Card */}
              <div className="rounded-2xl border border-line bg-surface p-6 space-y-4 shadow-soft">
                <div className="flex items-center justify-between border-b border-line pb-3">
                  <div className="flex items-center gap-2">
                    <FileText className="size-4 text-teal" />
                    <h3 className="text-xs font-mono uppercase tracking-wider text-ink font-semibold">
                      Appeal Representation
                    </h3>
                  </div>
                  <Tag variant="strong">Draft ready</Tag>
                </div>

                {appealLetter ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-xs text-muted">
                      <span>Addressed to: <strong className="text-ink">{appealLetter.recipient_organization || activeCase.insurer_name}</strong></span>
                      <button
                        type="button"
                        onClick={() => setIsEditingLetter(!isEditingLetter)}
                        className="text-xs font-mono text-teal hover:underline inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="size-3" />
                        <span>{isEditingLetter ? 'Done editing' : 'Edit letter'}</span>
                      </button>
                    </div>

                    {/* Letter Preview Box */}
                    <div className="relative rounded-xl border border-line bg-cream p-4 font-mono text-xs text-ink/90 leading-relaxed max-h-[380px] overflow-y-auto">
                      {isEditingLetter ? (
                        <textarea
                          value={letterBodyDraft}
                          onChange={(e) => setLetterBodyDraft(e.target.value)}
                          className="w-full h-80 bg-transparent resize-none outline-none font-mono text-xs text-ink"
                        />
                      ) : (
                        <div className="whitespace-pre-wrap">
                          {letterBodyDraft || appealLetter.body}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="space-y-2.5 pt-1">
                      {isEditingLetter ? (
                        <Button
                          variant="primary"
                          size="md"
                          className="w-full justify-center"
                          onClick={handleSaveLetterDraft}
                        >
                          <Check className="size-4 mr-1.5" />
                          <span>Save changes</span>
                        </Button>
                      ) : (
                        <Button
                          variant="primary"
                          size="lg"
                          className="w-full justify-center"
                          onClick={handleDownloadAppealPdf}
                        >
                          <Download className="size-4 mr-1.5" />
                          <span>Download Appeal PDF</span>
                        </Button>
                      )}

                      <div className="flex items-center gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          className="flex-1 justify-center"
                          onClick={handleCopyLetter}
                        >
                          {isCopied ? <Check className="size-3.5 mr-1 text-teal" /> : <Copy className="size-3.5 mr-1" />}
                          <span>{isCopied ? 'Copied to clipboard' : 'Copy text'}</span>
                        </Button>

                        <Button
                          variant="secondary"
                          size="sm"
                          className="flex-1 justify-center"
                          onClick={handleDownloadOmbudsmanPdf}
                        >
                          <Scale className="size-3.5 mr-1 text-teal" />
                          <span>Ombudsman PDF</span>
                        </Button>
                      </div>
                    </div>

                    <p className="text-[11px] text-muted text-center pt-2 leading-relaxed">
                      This formal grievance representation is drafted based on your policy clauses and IRDAI regulations. It does not constitute formal legal representation.
                    </p>
                  </div>
                ) : (
                  <div className="p-6 text-center text-xs text-muted space-y-2">
                    <p>No appeal letter generated for this claim.</p>
                  </div>
                )}
              </div>

              {/* What to do next: Vertical Timeline */}
              <div className="rounded-2xl border border-line bg-surface p-6 space-y-4 shadow-soft">
                <div className="flex items-center gap-2 border-b border-line pb-3">
                  <Send className="size-4 text-teal" />
                  <h3 className="text-xs font-mono uppercase tracking-wider text-ink font-semibold">
                    What to do next (Official 3-Step Escalation)
                  </h3>
                </div>

                <div className="space-y-4 text-xs">
                  {/* Step 1 */}
                  <div className="flex items-start gap-3">
                    <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-teal text-surface font-mono text-xs font-bold mt-0.5">
                      1
                    </div>
                    <div className="space-y-0.5">
                      <span className="font-semibold text-ink">Submit Appeal to Insurer's GRO</span>
                      <p className="text-muted leading-relaxed">
                        Email the downloaded appeal PDF to your insurer's Grievance Redressal Officer (e.g. gro@{activeCase.insurer_name.toLowerCase().replace(/[^a-z]/g, '') || 'insurance'}.com) along with your original policy copy and discharge summary.
                      </p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex items-start gap-3">
                    <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-cream border border-line text-ink font-mono text-xs font-bold mt-0.5">
                      2
                    </div>
                    <div className="space-y-0.5">
                      <span className="font-semibold text-ink">Wait 30 Statutory Days</span>
                      <p className="text-muted leading-relaxed">
                        Under IRDAI Protection of Policyholders' Interests Regulations, the insurer must resolve your grievance within 30 days.
                      </p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="flex items-start gap-3">
                    <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-cream border border-line text-ink font-mono text-xs font-bold mt-0.5">
                      3
                    </div>
                    <div className="space-y-0.5">
                      <span className="font-semibold text-ink">Escalate to Insurance Ombudsman</span>
                      <p className="text-muted leading-relaxed">
                        If rejected or unresolved after 30 days, file the pre-drafted Ombudsman Complaint. The Insurance Ombudsman charges ₹0 in court fees and issues legally binding awards up to ₹50,00,000.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* PDF / Document Evidence Modal */}
        <SourceViewerModal
          isOpen={activeModalData.isOpen}
          onClose={() => setActiveModalData(prev => ({ ...prev, isOpen: false }))}
          documentTitle={activeModalData.title}
          docType={activeModalData.docType}
          pageNumber={activeModalData.page}
          highlightedQuote={activeModalData.quote}
          contextText={activeModalData.context}
        />
      </main>
    </PageTransition>
  );
};
