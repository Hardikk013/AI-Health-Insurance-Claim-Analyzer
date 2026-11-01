import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { DisclaimerBanner } from './components/layout/DisclaimerBanner';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';

// Pages
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { NewCasePage } from './pages/NewCasePage';
import { ProcessingPage } from './pages/ProcessingPage';
import { ResultPage } from './pages/ResultPage';
import { AppealEditorPage } from './pages/AppealEditorPage';
import { OmbudsmanComplaintPage } from './pages/OmbudsmanComplaintPage';
import { NextStepsPage } from './pages/NextStepsPage';
import { SampleCasesPage } from './pages/SampleCasesPage';
import { OfficialSourcesPage } from './pages/OfficialSourcesPage';
import { HowItWorksPage } from './pages/HowItWorksPage';
import { PrivacyDataPage } from './pages/PrivacyDataPage';
import { TermsPage } from './pages/TermsPage';
import { AccountSettingsPage } from './pages/AccountSettingsPage';
import { AdminPanelPage } from './pages/AdminPanelPage';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { VerifyEmailPage } from './pages/auth/VerifyEmailPage';

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
    <BrowserRouter>
      <ScrollToTop />
      <div className="min-h-screen flex flex-col bg-background text-foreground font-sans antialiased">
        <DisclaimerBanner />
        <Navbar />

        <div className="flex-1">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/how-it-works" element={<HowItWorksPage />} />
            <Route path="/samples" element={<SampleCasesPage />} />
            <Route path="/sources" element={<OfficialSourcesPage />} />
            <Route path="/official-rules" element={<OfficialSourcesPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            
            <Route path="/new" element={<NewCasePage />} />
            <Route path="/new-case" element={<NewCasePage />} />
            <Route path="/processing" element={<ProcessingPage />} />
            <Route path="/result" element={<ResultPage />} />
            <Route path="/appeal" element={<AppealEditorPage />} />
            <Route path="/ombudsman" element={<OmbudsmanComplaintPage />} />
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
        </div>

        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
