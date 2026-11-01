import React, { useEffect, useState } from 'react';
import { Search, ExternalLink, CheckCircle2 } from 'lucide-react';
import { OfficialRule } from '../types';
import { fetchOfficialRules } from '../services/api';

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
    <main className="mx-auto w-full max-w-6xl px-4 py-8 md:py-12 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-primary">Official sources</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          ClaimFight never invents legal deadlines or rules in frontend code. All thresholds, moratorium periods, and Ombudsman financial limits are retrieved from verified regulatory circulars.
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search by rule code, authority, or keyword..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-3 py-2 text-xs border rounded-lg bg-card text-foreground focus:outline-none focus:border-accent"
        />
      </div>

      {/* Rules list */}
      <div className="space-y-4">
        {filteredRules.map((rule) => (
          <div
            key={rule.id || rule.rule_code}
            className="rounded-xl border bg-card p-5 space-y-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-mono font-semibold bg-muted px-2 py-0.5 rounded text-primary">
                  {rule.rule_code}
                </span>
                <span className="font-medium text-muted-foreground">{rule.authority}</span>
              </div>
              <span className="text-muted-foreground/70 text-[11px]">
                Verified: {rule.last_verified}
              </span>
            </div>

            <div>
              <h2 className="text-base font-semibold text-primary">
                {rule.title}
              </h2>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                {rule.summary}
              </p>
            </div>

            {rule.details && Object.keys(rule.details).length > 0 && (
              <div className="rounded-lg border bg-muted/30 p-3 text-xs space-y-1 text-muted-foreground">
                <p className="font-semibold text-primary text-[11px] uppercase tracking-wide">Key Parameters:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {Object.entries(rule.details).map(([k, v]) => (
                    <div key={k} className="flex items-start gap-1.5">
                      <CheckCircle2 className="size-3.5 text-success shrink-0 mt-0.5" />
                      <span>
                        <strong className="capitalize text-foreground">{k.replace(/_/g, ' ')}:</strong>{' '}
                        {Array.isArray(v) ? v.join(', ') : String(v)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-2 border-t flex items-center justify-between text-xs">
              <span className="text-muted-foreground text-[11px]">
                Binding regulation under Indian insurance law
              </span>
              <a
                href={rule.source_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-11 items-center rounded-lg border bg-card px-3 text-xs font-medium text-primary hover:bg-muted/50"
              >
                <span>Verify at official source</span>
                <ExternalLink className="size-3 text-accent ml-1.5" />
              </a>
            </div>
          </div>
        ))}

        {filteredRules.length === 0 && (
          <div className="p-8 text-center rounded-xl border bg-card text-xs text-muted-foreground">
            No official regulations matching "{searchTerm}".
          </div>
        )}
      </div>
    </main>
  );
};
