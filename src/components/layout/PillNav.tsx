import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  HelpCircle, 
  FolderKanban, 
  BookOpen, 
  FolderCheck, 
  Plus, 
  Sun, 
  Moon, 
  Globe 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/useAuthStore';

export const PillNav: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const { user, isAuthenticated, logout } = useAuthStore();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark') || 
             localStorage.getItem('theme') === 'dark';
    }
    return false;
  });
  const [langOpen, setLangOpen] = useState(false);

  // Monitor scroll for shrink effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 80) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Theme toggle
  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/how-it-works', label: 'How it works', icon: HelpCircle },
    { path: '/samples', label: 'Sample cases', icon: FolderKanban },
    { path: '/sources', label: 'Official sources', icon: BookOpen },
    { path: '/dashboard', label: 'My cases', icon: FolderCheck },
  ];

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'हिंदी' },
    { code: 'gu', label: 'ગુજરાતી' },
    { code: 'mr', label: 'मराठी' },
  ];

  const currentLangLabel = languages.find(l => l.code === i18n.language)?.code.toUpperCase() || 'EN';

  // Do not show full nav on multi-step wizard if minimized is requested
  const isCaseWizard = location.pathname === '/new' || location.pathname === '/new-case';

  return (
    <>
      {/* Desktop Sticky Floating Navigation */}
      <header className="hidden md:flex fixed top-4 inset-x-0 z-50 justify-center px-4 pointer-events-none">
        <motion.div
          animate={{
            y: 0,
            scale: isScrolled ? 0.96 : 1,
            padding: isScrolled ? '6px 14px' : '8px 18px',
          }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="pointer-events-auto flex items-center gap-2.5 rounded-full border border-line bg-surface/90 backdrop-blur-md shadow-soft"
        >
          {/* Logo brand */}
          <Link
            to="/"
            className="flex items-center gap-1.5 pl-1.5 pr-2.5 py-1 text-ink hover:opacity-85 transition-opacity"
          >
            <span className="font-semibold text-sm tracking-tight text-ink">ClaimFight</span>
            <span className="text-[10px] font-mono text-muted tracking-tight">.in</span>
          </Link>

          <div className="h-4 w-[1px] bg-line" />

          {/* Navigation Icon Buttons with mint active background */}
          <nav className="flex items-center gap-1" aria-label="Main Navigation">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  aria-current={isActive ? 'page' : undefined}
                  title={item.label}
                  className={`relative p-2 rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-teal focus-visible:outline-none group ${
                    isActive
                      ? 'text-ink bg-mint'
                      : 'text-muted-foreground hover:text-ink hover:bg-muted/15'
                  }`}
                >
                  <Icon className="size-4" aria-hidden="true" />
                  <span className="sr-only">{item.label}</span>

                  {/* Tooltip */}
                  <span aria-hidden="true" className="pointer-events-none absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-ink px-2 py-0.5 text-[10px] text-cream opacity-0 shadow-xs transition-opacity group-hover:opacity-100">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>

          <div className="h-4 w-[1px] bg-line" aria-hidden="true" />

          {/* Dark Mode Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
            className="p-2 rounded-full text-muted-foreground hover:text-ink hover:bg-muted/15 focus-visible:ring-2 focus-visible:ring-teal focus-visible:outline-none transition-colors cursor-pointer"
          >
            {isDark ? <Sun className="size-4" aria-hidden="true" /> : <Moon className="size-4" aria-hidden="true" />}
            <span className="sr-only">{isDark ? 'Switch to light mode' : 'Switch to dark mode'}</span>
          </button>

          {/* Language Selector Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setLangOpen(!langOpen)}
              aria-haspopup="true"
              aria-expanded={langOpen}
              aria-label={`Select language. Current language: ${currentLangLabel}`}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-mono font-medium text-muted-foreground hover:text-ink hover:bg-muted/15 focus-visible:ring-2 focus-visible:ring-teal focus-visible:outline-none transition-colors cursor-pointer"
            >
              <Globe className="size-3.5" aria-hidden="true" />
              <span>{currentLangLabel}</span>
            </button>

            <AnimatePresence>
              {langOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  role="menu"
                  aria-label="Language selection"
                  className="absolute right-0 mt-2 w-32 rounded-xl border border-line bg-surface p-1 shadow-soft"
                >
                  {languages.map((l) => (
                    <button
                      key={l.code}
                      type="button"
                      role="menuitem"
                      aria-current={i18n.language === l.code ? 'true' : undefined}
                      onClick={() => {
                        i18n.changeLanguage(l.code);
                        setLangOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-teal focus-visible:outline-none ${
                        i18n.language === l.code ? 'bg-mint text-ink font-medium' : 'text-muted-foreground hover:bg-muted/15'
                      }`}
                    >
                      {l.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="h-4 w-[1px] bg-line" />

          {/* Dark Pill Action Button: "+ New case" */}
          <Link
            to="/new"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-ink text-cream text-xs font-medium hover:bg-ink/90 active:scale-95 transition-all shadow-xs"
          >
            <span className="flex size-4 items-center justify-center rounded-full bg-cream/20 text-cream">
              <Plus className="size-3 stroke-[2.5]" />
            </span>
            <span>New case</span>
          </Link>

          {/* Log in / Account */}
          {isAuthenticated ? (
            <button
              onClick={logout}
              className="text-xs text-muted-foreground hover:text-ink transition-colors pl-1 pr-2"
            >
              Log out
            </button>
          ) : (
            <Link
              to="/login"
              className="text-xs text-muted-foreground hover:text-ink transition-colors pl-1 pr-2"
            >
              Log in
            </Link>
          )}
        </motion.div>
      </header>

      {/* Mobile Floating Bottom Bar */}
      <nav 
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-4 inset-x-4 z-50 flex items-center justify-between px-4 py-2.5 rounded-full border border-line bg-surface/95 backdrop-blur-md shadow-soft"
      >
        <Link
          to="/"
          className={`p-2 rounded-full ${location.pathname === '/' ? 'text-ink bg-mint' : 'text-muted-foreground'}`}
        >
          <Home className="size-5" />
          <span className="sr-only">Home</span>
        </Link>

        <Link
          to="/how-it-works"
          className={`p-2 rounded-full ${location.pathname === '/how-it-works' ? 'text-ink bg-mint' : 'text-muted-foreground'}`}
        >
          <HelpCircle className="size-5" />
          <span className="sr-only">How it works</span>
        </Link>

        {/* Center Circular "New case" Button */}
        <Link
          to="/new"
          className="flex size-11 -mt-4 items-center justify-center rounded-full bg-ink text-cream shadow-soft border-2 border-surface active:scale-95 transition-transform"
        >
          <Plus className="size-5 stroke-[2.5]" />
          <span className="sr-only">New case</span>
        </Link>

        <Link
          to="/samples"
          className={`p-2 rounded-full ${location.pathname === '/samples' ? 'text-ink bg-mint' : 'text-muted-foreground'}`}
        >
          <FolderKanban className="size-5" />
          <span className="sr-only">Sample cases</span>
        </Link>

        <Link
          to="/dashboard"
          className={`p-2 rounded-full ${location.pathname === '/dashboard' ? 'text-ink bg-mint' : 'text-muted-foreground'}`}
        >
          <FolderCheck className="size-5" />
          <span className="sr-only">My cases</span>
        </Link>
      </nav>
    </>
  );
};
