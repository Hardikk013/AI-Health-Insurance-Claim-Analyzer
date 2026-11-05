import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MailCheck } from 'lucide-react';
import { Mascot } from '../../components/common/Mascot';
import { Button } from '../../components/common/Button';
import { PageTransition } from '../../components/common/PageTransition';

export const VerifyEmailPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <PageTransition>
      <main className="min-h-[calc(100vh-140px)] bg-cream flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md rounded-2xl border border-line bg-surface p-6 sm:p-8 space-y-5 text-center shadow-soft">
          <div className="flex justify-center mb-1">
            <Mascot mood="happy" size={72} />
          </div>
          <h1 className="text-2xl font-medium tracking-tight text-ink">Verify your email</h1>
          <p className="text-xs text-muted leading-relaxed">
            We have sent a confirmation message to your email. Click the verification link inside to activate your ClaimFight account.
          </p>

          <div className="pt-2">
            <Button
              variant="primary"
              size="md"
              className="w-full justify-center"
              onClick={() => navigate('/login')}
            >
              <span>Proceed to sign in</span>
            </Button>
          </div>
        </div>
      </main>
    </PageTransition>
  );
};
