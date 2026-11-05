import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { DisclaimerBanner } from './components/layout/DisclaimerBanner';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { RouteSkeleton } from './components/common/RouteSkeleton';

// Eager load LandingPage for fastest LCP & zero CLS on homepage
import { LandingPage } from './pages/LandingPage';

// Lazy-loaded routes for reduced initial bundle size
const DashboardPage = lazy(() => import('./pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const NewCasePage = lazy(() => import('./pages/NewCasePage').then(m => ({ default: m.NewCasePage })));
const ProcessingPage = lazy(() => import('./pages/ProcessingPage').then(m => ({ default: m.ProcessingPage })));
const ResultPage = lazy(() => import('./pages/ResultPage').then(m => ({ default: m.ResultPage })));
const AppealEditorPage = lazy(() => import('./pages/AppealEditorPage').then(m => ({ default: m.AppealEditorPage })));
const OmbudsmanComplaintPage = lazy(() => import('./pages/OmbudsmanComplaintPage').then(m => ({ default: m.OmbudsmanComplaintPage })));
const NextStepsPage = lazy(() => import('./pages/NextStepsPage').then(m => ({ default: m.NextStepsPage })));
const SampleCasesPage = lazy(() => import('./pages/SampleCasesPage').then(m => ({ default: m.SampleCasesPage })));
const OfficialSourcesPage = lazy(() => import('./pages/OfficialSourcesPage').then(m => ({ default: m.OfficialSourcesPage })));
const HowItWorksPage = lazy(() => import('./pages/HowItWorksPage').then(m => ({ default: m.HowItWorksPage })));
const PrivacyDataPage = lazy(() => import('./pages/PrivacyDataPage').then(m => ({ default: m.PrivacyDataPage })));
const TermsPage = lazy(() => import('./pages/TermsPage').then(m => ({ default: m.TermsPage })));
const AccountSettingsPage = lazy(() => import('./pages/AccountSettingsPage').then(m => ({ default: m.AccountSettingsPage })));
const AdminPanelPage = lazy(() => import('./pages/AdminPanelPage').then(m => ({ default: m.AdminPanelPage })));

// Auth Pages (Lazy)
const LoginPage = lazy(() => import('./pages/auth/LoginPage').then(m => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage').then(m => ({ default: m.RegisterPage })));
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage').then(m => ({ default: m.ForgotPasswordPage })));
const VerifyEmailPage = lazy(() => import('./pages/auth/VerifyEmailPage').then(m => ({ default: m.VerifyEmailPage })));

import './i18n/config';

// Scroll to top helper
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ScrollToTop />
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#1B7F7A] focus:text-white focus:rounded-full focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#12302E] font-mono text-xs font-semibold"
        >
          Skip to main content
        </a>
        <div className="min-h-screen flex flex-col bg-background text-foreground font-sans antialiased">
          <DisclaimerBanner />
          <Navbar />

          <main id="main-content" tabIndex={-1} className="flex-1 outline-none">
            <Suspense fallback={<RouteSkeleton />}>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/how-it-works" element={<HowItWorksPage />} />
                <Route path="/samples" element={<SampleCasesPage />} />
                <Route path="/sample-cases" element={<SampleCasesPage />} />
                <Route path="/sources" element={<OfficialSourcesPage />} />
                <Route path="/official-sources" element={<OfficialSourcesPage />} />
                <Route path="/official-rules" element={<OfficialSourcesPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/my-cases" element={<DashboardPage />} />
                <Route path="/cases" element={<DashboardPage />} />
                
                <Route path="/new" element={<NewCasePage />} />
                <Route path="/new-case" element={<NewCasePage />} />
                <Route path="/processing" element={<ProcessingPage />} />
                <Route path="/result" element={<ResultPage />} />
                <Route path="/case/:id" element={<ResultPage />} />
                <Route path="/cases/:id" element={<ResultPage />} />
                <Route path="/appeal" element={<AppealEditorPage />} />
                <Route path="/appeal/:id" element={<AppealEditorPage />} />
                <Route path="/appeal-editor" element={<AppealEditorPage />} />
                <Route path="/appeal-editor/:id" element={<AppealEditorPage />} />
                <Route path="/ombudsman" element={<OmbudsmanComplaintPage />} />
                <Route path="/ombudsman/:id" element={<OmbudsmanComplaintPage />} />
                <Route path="/next-steps" element={<NextStepsPage />} />

                <Route path="/privacy" element={<PrivacyDataPage />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/settings" element={<AccountSettingsPage />} />
                <Route path="/admin" element={<AdminPanelPage />} />

                {/* Auth */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/verify-email" element={<VerifyEmailPage />} />
              </Routes>
            </Suspense>
          </main>

          <Footer />
        </div>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
