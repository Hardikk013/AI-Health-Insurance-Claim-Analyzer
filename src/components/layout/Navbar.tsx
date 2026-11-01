import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { ShieldCheck, Menu, X, Globe, ChevronDown, Gauge } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/useAuthStore';

export const Navbar: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  const currentLang = i18n.language || 'en';

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'हिन्दी (Hindi)' },
    { code: 'gu', label: 'ગુજરાતી (Gujarati)' }
  ];

  const changeLanguage = (code: string) => {
    i18n.changeLanguage(code);
    setLangMenuOpen(false);
  };

  const navLinks = [
    { to: '/how-it-works', label: 'How it works' },
    { to: '/samples', label: 'Sample cases' },
    { to: '/sources', label: 'Official sources' },
    { to: '/dashboard', label: 'My cases' },
  ];

  const analysesToday = user?.analyses_today || 0;
  const remainingToday = Math.max(0, 3 - analysesToday);

  return (
    <header className="sticky top-0 z-30 border-b bg-card/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-2">
        {/* Brand */}
        <Link
          className="inline-flex min-h-11 items-center gap-2 font-semibold text-primary"
          to="/"
        >
          <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
            <ShieldCheck className="size-4" />
          </span>
          <span>ClaimFight</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center md:flex">
          {navLinks.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `rounded-md px-3 py-2 text-sm min-h-11 inline-flex items-center transition-colors ${
                  isActive
                    ? 'text-primary font-semibold'
                    : 'text-muted-foreground hover:text-primary'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Right side controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Quota indicator */}
          <div
            className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-muted text-muted-foreground"
            title="Daily free limit: 3 claims per user per day"
          >
            <Gauge className="size-3.5 text-accent" />
            <span>{remainingToday}/3 left today</span>
          </div>

          {/* Language selector */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="inline-flex min-h-11 items-center gap-1 rounded-md px-2.5 py-2 text-sm text-muted-foreground hover:text-primary"
              aria-label="Change language"
            >
              <Globe className="size-3.5 text-accent" />
              <span className="uppercase text-xs font-semibold">{currentLang}</span>
              <ChevronDown className="size-3 text-muted-foreground" />
            </button>

            {langMenuOpen && (
              <div className="absolute right-0 mt-1 w-40 rounded-xl border bg-card p-1 shadow-lg z-50">
                {languages.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => changeLanguage(l.code)}
                    className={`w-full text-left px-3 py-1.5 text-xs rounded-lg transition-colors flex items-center justify-between ${
                      currentLang === l.code
                        ? 'bg-muted text-primary font-semibold'
                        : 'text-foreground hover:bg-muted/50'
                    }`}
                  >
                    <span>{l.label}</span>
                    {currentLang === l.code && <span className="text-accent font-bold">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Log in */}
          <Link
            className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:text-primary min-h-11 inline-flex items-center"
            to="/login"
          >
            Log in
          </Link>

          {/* New case button */}
          <Link
            className="inline-flex min-h-11 items-center rounded-lg bg-accent px-4 text-sm font-medium text-accent-foreground hover:opacity-90 shadow-xs"
            to="/new"
          >
            New case
          </Link>

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-muted-foreground hover:text-primary"
          >
            {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-card px-4 py-3 space-y-1">
          {navLinks.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-md text-sm ${
                  isActive ? 'bg-muted text-primary font-semibold' : 'text-muted-foreground hover:text-primary'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
          <div className="pt-2 border-t text-xs text-muted-foreground px-3 flex items-center justify-between">
            <span>Quota remaining today</span>
            <span className="font-semibold text-primary">{remainingToday}/3 analyses</span>
          </div>
        </div>
      )}
    </header>
  );
};
