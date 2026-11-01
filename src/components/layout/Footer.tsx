import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-16 border-t bg-card">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-8 text-sm text-muted-foreground">
        <p>ClaimFight gives general information, not legal advice.</p>
        <nav className="flex flex-wrap gap-4">
          <Link className="hover:text-primary transition-colors" to="/privacy">
            Privacy &amp; data
          </Link>
          <Link className="hover:text-primary transition-colors" to="/terms">
            Terms
          </Link>
          <Link className="hover:text-primary transition-colors" to="/sources">
            Official sources
          </Link>
          <Link className="hover:text-primary transition-colors" to="/settings">
            Account settings
          </Link>
          <Link className="hover:text-primary transition-colors" to="/admin">
            Admin panel
          </Link>
        </nav>
      </div>
    </footer>
  );
};
