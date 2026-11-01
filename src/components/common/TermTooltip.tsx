import React, { useState } from 'react';
import { CircleHelp } from 'lucide-react';

export interface TermDefinition {
  term: string;
  definition: string;
  example?: string;
  sourceAuthority?: string;
}

export const INSURANCE_GLOSSARY: Record<string, TermDefinition> = {
  'TPA': {
    term: 'Third Party Administrator (TPA)',
    definition: 'An IRDAI-licensed entity processing health claims on behalf of insurance companies. TPAs cannot reject claims directly—only the insurer has statutory authority to repudiate.',
    sourceAuthority: 'IRDAI TPA Regulations'
  },
  'PED': {
    term: 'Pre-Existing Disease (PED)',
    definition: 'Any medical condition or injury diagnosed by a physician within 36 months prior to policy inception. Covered after serving waiting period or under the 60-month moratorium rule.',
    example: 'Hypertension or Diabetes diagnosed 2 years prior.',
    sourceAuthority: 'IRDAI Health Insurance Guidelines'
  },
  'Waiting Period': {
    term: 'Waiting Period',
    definition: 'A stipulated duration during which specific treatments are excluded from coverage. Initial waiting period is 30 days (accidents covered from day 1); specific illnesses carry 12–24 months.',
    sourceAuthority: 'IRDAI Guidelines'
  },
  'Proportionate Deduction': {
    term: 'Proportionate Deduction',
    definition: 'If you choose a room exceeding your daily eligibility, insurers may proportionately reduce doctor and nursing fees. However, IRDAI expressly prohibits proportionate cuts on medicines, implants, and ICU charges.',
    example: 'Eligible for ₹4,000/day but stayed in ₹6,000/day room.',
    sourceAuthority: 'IRDAI Master Circular 2020'
  },
  'Moratorium Period': {
    term: 'Moratorium Period',
    definition: 'Under IRDAI Master Circular (2024), after 60 continuous months (5 years) of active coverage without break, no claim can be rejected for non-disclosure or pre-existing diseases, except for established fraud.',
    sourceAuthority: 'IRDAI Master Circular 2024'
  },
  'Day Care Procedure': {
    term: 'Day Care Procedure',
    definition: 'Surgeries or treatments completed in under 24 hours due to modern technology (cataract, dialysis, chemotherapy). Insurers cannot reject claims merely for lack of an overnight stay.',
    sourceAuthority: 'IRDAI Standard Day Care Guidelines'
  },
  'Ombudsman': {
    term: 'Insurance Ombudsman',
    definition: 'An independent quasi-judicial forum resolving personal health insurance disputes up to ₹30 Lakhs without charging any court fee or requiring a lawyer.',
    sourceAuthority: 'Council for Insurance Ombudsmen'
  }
};

interface TermTooltipProps {
  termKey: keyof typeof INSURANCE_GLOSSARY | string;
  children?: React.ReactNode;
}

export const TermTooltip: React.FC<TermTooltipProps> = ({ termKey, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const info = INSURANCE_GLOSSARY[termKey] || {
    term: termKey,
    definition: 'Standard term in Indian health insurance governed by IRDAI regulations.'
  };

  return (
    <span className="relative inline-block">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        className="inline-flex items-center gap-0.5 underline decoration-dotted underline-offset-4 text-inherit cursor-help hover:text-primary transition-colors font-medium"
        aria-label={`Definition of ${info.term}`}
      >
        <span>{children || termKey}</span>
        <CircleHelp className="size-3.5 text-muted-foreground shrink-0" />
      </button>

      {isOpen && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-3.5 bg-card text-card-foreground text-xs rounded-xl shadow-xl border border-border z-50 pointer-events-none transition-all block">
          <span className="font-semibold text-primary block mb-1 text-sm">{info.term}</span>
          <span className="text-muted-foreground block mb-1.5 leading-relaxed">{info.definition}</span>
          {info.example && (
            <span className="text-warning-foreground bg-warning-soft px-1.5 py-0.5 rounded block mb-1">
              <strong>Example:</strong> {info.example}
            </span>
          )}
          {info.sourceAuthority && (
            <span className="text-muted-foreground/75 block text-[10px] border-t pt-1 mt-1 font-mono">
              Authority: {info.sourceAuthority}
            </span>
          )}
        </span>
      )}
    </span>
  );
};
