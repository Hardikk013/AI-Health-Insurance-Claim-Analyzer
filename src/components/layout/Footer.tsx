import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-line bg-surface/50 mt-auto py-12 px-4 transition-colors">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <Link to="/" className="flex items-center gap-1.5 text-ink font-semibold tracking-tight text-base">
              <span>ClaimFight</span>
              <span className="text-xs font-mono text-muted">.in</span>
            </Link>
            <p className="text-xs text-muted-foreground max-w-sm">
              Empowering Indian policyholders to challenge unfair insurance repudiations through deterministic rule audits and AI document adjudication.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs text-muted-foreground font-medium">
            <Link to="/how-it-works" className="hover:text-ink transition-colors">How it works</Link>
            <Link to="/samples" className="hover:text-ink transition-colors">Sample cases</Link>
            <Link to="/sources" className="hover:text-ink transition-colors">Official sources</Link>
            <Link to="/privacy" className="hover:text-ink transition-colors">Privacy & DPDP Act</Link>
            <Link to="/terms" className="hover:text-ink transition-colors">Terms of service</Link>
          </div>
        </div>

        <div className="h-[1px] w-full bg-line" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-muted-foreground">
          <p className="leading-relaxed">
            This platform provides automated analysis and general information, not legal advice. Verify rules at{' '}
            <Link to="/sources" className="text-accent hover:underline font-medium inline-flex items-center gap-0.5">
              <span>Official sources</span>
              <ExternalLink className="size-3" />
            </Link>.
          </p>

          <span className="font-mono-code text-[11px] text-muted-foreground shrink-0 bg-muted/15 px-2.5 py-1 rounded-full">
            DOCUMENTS AUTOMATICALLY DELETED AFTER 24 HOURS
          </span>
        </div>

        <div className="text-[11px] text-muted-foreground/80 flex items-center justify-between pt-2">
          <span>© 2026 ClaimFight. Regulated under IRDAI Master Circulars & Ombudsman Rules.</span>
          <Link to="/admin" className="text-muted-foreground/60 hover:text-muted-foreground text-[10px] font-mono">
            Admin
          </Link>
        </div>
      </div>
    </footer>
  );
};
