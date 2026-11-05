import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tag } from '../common/Tag';
import { ShieldAlert, CheckCircle2 } from 'lucide-react';

export const LetterScanDemo: React.FC = () => {
  const [scanStep, setScanStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setScanStep((prev) => (prev + 1) % 4);
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative rounded-2xl border border-line bg-surface p-6 sm:p-8 shadow-soft overflow-hidden">
      {/* Top document simulated header */}
      <div className="flex items-center justify-between border-b border-line pb-4 mb-5">
        <div className="flex items-center gap-2">
          <div className="size-2 rounded-full bg-red-400" />
          <div className="size-2 rounded-full bg-amber-400" />
          <div className="size-2 rounded-full bg-teal" />
          <span className="font-mono text-[11px] text-muted ml-2">REJECTION_NOTICE_STAR_HEALTH_2026.PDF</span>
        </div>
        <Tag variant="mono">LIVE OCR SCANNER DEMO</Tag>
      </div>

      {/* Simulated Rejection Letter Text & Scanner Line */}
      <div className="relative space-y-4 text-xs sm:text-sm font-sans leading-relaxed text-muted-foreground select-none">
        {/* Animated Scanning Line */}
        <motion.div
          animate={{ y: [0, 240, 0] }}
          transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
          className="pointer-events-none absolute inset-x-0 h-[2px] bg-teal shadow-[0_0_12px_2px_#1B7F7A] z-20"
        />

        <p className="font-medium text-ink">
          RE: REPUDIATION OF CLAIM NO. CIR/2026/121114/084319
        </p>

        <p>
          Dear Ramesh Chandra Sharma, with reference to claim for Cataract surgery of right eye under Policy No. P/121114/01/2025/004921, the competent authority has scrutinized the medical records.
        </p>

        {/* Clause 1: Waiting Period & Continuity Credit Highlight */}
        <div className="relative p-2 rounded-lg transition-colors border border-transparent hover:border-line">
          <p>
            "As per Section 4.2 of policy conditions, Cataract treatment is excluded until expiry of 24 consecutive months.{' '}
            <span className="bg-[#FAEEDA] text-[#633806] px-1 py-0.5 rounded font-medium">
              Tenure is 578 days from inception
            </span>
            , hence the claim of Rs. 78,000 stands repudiated."
          </p>

          <AnimatePresence>
            {scanStep >= 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="mt-2 inline-flex items-center gap-1.5"
              >
                <Tag variant="strong" icon={<CheckCircle2 className="size-3 text-teal" />}>
                  Clause 8 Continuity Credit Recorded: 12 Months Elapsed
                </Tag>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Clause 2: Trauma vs PED Nexus */}
        <div className="relative p-2 rounded-lg transition-colors border border-transparent hover:border-line">
          <p>
            "Hospital records indicate history of hypertension which was not disclosed at proposal.{' '}
            <span className="bg-[#FCEBEB] text-[#791F1F] px-1 py-0.5 rounded font-medium">
              Repudiated under Pre-Existing Disease non-disclosure.
            </span>
            "
          </p>

          <AnimatePresence>
            {scanStep >= 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="mt-2 inline-flex items-center gap-1.5"
              >
                <Tag variant="strong" icon={<CheckCircle2 className="size-3 text-teal" />}>
                  Supreme Court Precedent: Accidental Fracture Has No Nexus to Blood Pressure
                </Tag>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Clause 3: Room Rent Proportionate Deductions */}
        <div className="relative p-2 rounded-lg transition-colors border border-transparent hover:border-line">
          <p>
            "Because higher room category was chosen,{' '}
            <span className="bg-[#FAEEDA] text-[#633806] px-1 py-0.5 rounded font-medium">
              proportionate deduction applied to medicines and ICU charges.
            </span>
            "
          </p>

          <AnimatePresence>
            {scanStep >= 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="mt-2 inline-flex items-center gap-1.5"
              >
                <Tag variant="strong" icon={<CheckCircle2 className="size-3 text-teal" />}>
                  IRDAI Circular 194/2020: Proportionate Deduction on Medicines/ICU is Illegal
                </Tag>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
