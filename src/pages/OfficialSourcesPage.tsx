import React, { useEffect, useState } from 'react';
import { Search, ExternalLink, CheckCircle2, Scale, BookOpen } from 'lucide-react';
import { OfficialRule } from '../types';
import { fetchOfficialRules } from '../services/api';
import { Tag } from '../components/common/Tag';
import { Button } from '../components/common/Button';
import { PageTransition } from '../components/common/PageTransition';

export const OfficialSourcesPage: React.FC = () => {
  const [rules, setRules] = useState<OfficialRule[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchOfficialRules().then((res) => {
      setRules(res);
    });
  }, []);

  const filteredRules = rules.filter(
    (r) =>
      r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.authority.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.rule_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <PageTransition>
      <main className="min-h-screen bg-cream py-8 md:py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-5xl space-y-8">
          
          {/* Header */}
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-mint text-teal text-xs font-mono font-medium">
              <Scale className="size-3.5 text-teal" />
              <span>Statutory Legal Verification</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-medium tracking-tight text-ink">
              Official legal sources & circulars
            </h1>
            <p className="max-w-2xl text-sm text-muted leading-relaxed">
              ClaimFight never fabricates statutory timelines or compensation limits. All thresholds, moratorium guidelines, and Ombudsman award ceilings are derived from verified official circulars.
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-md">
            <Search className="size-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              placeholder="Search by rule code, authority, or keyword..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-line bg-surface text-ink placeholder:text-muted focus:outline-none focus:border-teal shadow-soft transition-colors"
            />
          </div>

          {/* Rules list */}
          <div className="space-y-4">
            {filteredRules.map((rule) => (
              <div
                key={rule.id || rule.rule_code}
                className="rounded-2xl border border-line bg-surface p-6 space-y-4 shadow-soft hover:border-teal/50 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold bg-cream px-2.5 py-1 rounded-full border border-line text-ink">
                      {rule.rule_code}
                    </span>
                    <span className="font-medium text-teal font-mono">{rule.authority}</span>
                  </div>
                  <span className="text-muted font-mono text-[11px]">
                    Verified: {rule.last_verified}
                  </span>
                </div>

                <div>
                  <h2 className="text-lg font-medium text-ink">
                    {rule.title}
                  </h2>
                  <p className="text-xs text-muted mt-1.5 leading-relaxed">
                    {rule.summary}
                  </p>
                </div>

                {rule.details && Object.keys(rule.details).length > 0 && (
                  <div className="rounded-xl border border-line bg-cream p-4 text-xs space-y-2">
                    <p className="font-mono uppercase tracking-wider text-ink text-[10px] font-semibold">
                      Statutory Parameters:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-muted">
                      {Object.entries(rule.details).map(([k, v]) => (
                        <div key={k} className="flex items-start gap-2">
                          <CheckCircle2 className="size-3.5 text-teal shrink-0 mt-0.5" />
                          <span>
                            <strong className="capitalize text-ink">{k.replace(/_/g, ' ')}:</strong>{' '}
                            {Array.isArray(v) ? v.join(', ') : String(v)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-2 border-t border-line flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <span className="text-muted text-[11px]">
                    Binding regulation under Indian Insurance Law & IRDAI Directives
                  </span>
                  <a
                    href={rule.source_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-line bg-cream text-ink hover:border-teal hover:text-teal font-mono text-xs transition-colors shrink-0"
                  >
                    <span>Inspect official gazette</span>
                    <ExternalLink className="size-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </PageTransition>
  );
};
