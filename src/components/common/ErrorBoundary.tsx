import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RotateCcw, Home } from 'lucide-react';
import { Mascot } from './Mascot';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ClaimFight ErrorBoundary] Uncaught render error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-cream px-4 py-12">
          <div className="w-full max-w-md bg-surface border border-line rounded-3xl p-6 sm:p-8 text-center space-y-6 shadow-soft">
            <div className="flex justify-center">
              <Mascot mood="thinking" size={110} />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-ink">
                Something went wrong
              </h2>
              <p className="text-xs sm:text-sm text-muted leading-relaxed">
                An unexpected interface issue occurred. Your case data and uploaded documents are securely preserved.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3.5 bg-[#FCEBEB] border border-[#791F1F]/20 rounded-xl text-left text-xs text-[#791F1F] font-mono overflow-auto max-h-32">
                <div className="flex items-center gap-1.5 font-bold mb-1">
                  <AlertCircle className="size-3.5 shrink-0" />
                  <span>Error Details</span>
                </div>
                {this.state.error.message || 'Unknown render exception'}
              </div>
            )}

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-mono font-medium rounded-full bg-teal text-surface hover:opacity-90 transition-opacity"
              >
                <RotateCcw className="size-3.5" />
                <span>Reload Page</span>
              </button>
              <button
                type="button"
                onClick={this.handleReset}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-mono font-medium rounded-full bg-cream border border-line text-ink hover:bg-surface transition-colors"
              >
                <Home className="size-3.5" />
                <span>Return Home</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
