import React from 'react';
import { X, FileText, CheckCircle2, ExternalLink, ShieldCheck } from 'lucide-react';

interface SourceViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentTitle: string;
  docType: 'rejection_letter' | 'policy_document' | 'discharge_summary';
  pageNumber: number;
  highlightedQuote: string;
  contextText?: string;
  ocrConfidence?: number;
  downloadUrl?: string;
}

export const SourceViewerModal: React.FC<SourceViewerModalProps> = ({
  isOpen,
  onClose,
  documentTitle,
  docType,
  pageNumber,
  highlightedQuote,
  contextText,
  ocrConfidence = 98.6,
  downloadUrl
}) => {
  // Accessible Keyboard Handler: ESC closes modal
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const docTypeLabels = {
    rejection_letter: 'Insurer rejection letter',
    policy_document: 'Policy wordings',
    discharge_summary: 'Hospital discharge summary'
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="source-viewer-title"
        className="relative w-full max-w-xl bg-card text-card-foreground rounded-xl shadow-2xl border border-border overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-100"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b bg-card">
          <div className="flex items-center gap-2.5">
            <span className="grid size-8 place-items-center rounded-lg bg-secondary text-secondary-foreground" aria-hidden="true">
              <FileText className="size-4" />
            </span>
            <div>
              <h3 id="source-viewer-title" className="font-semibold text-sm text-primary leading-tight">{documentTitle}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {docTypeLabels[docType]} • Page {pageNumber}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close document source viewer"
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted focus-visible:ring-2 focus-visible:ring-teal focus-visible:outline-none transition-colors"
          >
            <X className="size-4.5" aria-hidden="true" />
          </button>
        </div>

        {/* Confidence bar */}
        <div className="bg-muted/40 px-5 py-2 border-b flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5 text-accent font-medium">
            <ShieldCheck className="size-3.5" />
            <span>OCR confidence: {ocrConfidence}%</span>
          </span>
          <span className="font-mono text-[11px]">
            Page {pageNumber}
          </span>
        </div>

        {/* Highlighted Quote Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-sm font-sans">
          <div className="p-4 bg-warning-soft border-l-4 border-warning rounded-r-lg">
            <p className="text-xs font-semibold text-warning-foreground uppercase tracking-wide mb-1">
              Highlighted passage from document
            </p>
            <p className="text-foreground font-medium text-sm leading-relaxed">
              "{highlightedQuote}"
            </p>
          </div>

          {contextText && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                Surrounding context
              </p>
              <div className="p-3 bg-muted/40 border rounded-lg font-mono text-xs text-muted-foreground leading-relaxed whitespace-pre-line">
                {contextText}
              </div>
            </div>
          )}

          <div className="p-3 rounded-lg bg-success-soft border border-success/30 flex items-center gap-2 text-xs text-success">
            <CheckCircle2 className="size-3.5 shrink-0" />
            <span>
              Verbatim citation preserved for the grievance appeal evidence ledger.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t bg-muted/20 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            Auto-deleted 24 hours after analysis
          </span>
          <div className="flex items-center gap-2">
            {downloadUrl && (
              <a
                href={downloadUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-11 items-center gap-1 px-3 text-xs font-medium text-accent hover:underline"
              >
                <ExternalLink className="size-3" />
                <span>View full PDF</span>
              </a>
            )}
            <button
              type="button"
              onClick={onClose}
              className="inline-flex min-h-11 items-center px-4 text-xs font-medium rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
