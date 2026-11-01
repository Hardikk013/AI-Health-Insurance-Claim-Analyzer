import React from 'react';
import { ShieldAlert, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const DisclaimerBanner: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="bg-primary text-primary-foreground text-xs py-1.5 px-4 border-b border-border/30 sticky top-0 z-40 backdrop-blur-md">
      <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <ShieldAlert className="size-3.5 text-warning shrink-0" />
          <span className="font-medium text-primary-foreground/90">
            {t('disclaimerBanner', 'This is general information, not legal advice. Verify rules at official sources.')}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/sources"
            className="inline-flex items-center gap-1 text-accent hover:underline font-medium transition-colors"
          >
            <span>Verify official rules</span>
            <ExternalLink className="size-3" />
          </Link>
          <span className="text-primary-foreground/40 hidden sm:inline">•</span>
          <span className="text-primary-foreground/75 text-[11px] hidden sm:inline">
            24h DPDP Auto-Purge
          </span>
        </div>
      </div>
    </div>
  );
};
