import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Cookie } from 'lucide-react';
import { Button } from './ui/Button';

const CONSENT_KEY = 'bureaustore_cookie_consent';

type Consent = 'accepted' | 'refused' | null;

function getStoredConsent(): Consent {
  const value = localStorage.getItem(CONSENT_KEY);
  return value === 'accepted' || value === 'refused' ? value : null;
}

export function CookieBanner() {
  const [consent, setConsent] = useState<Consent>(getStoredConsent);

  useEffect(() => {
    if (consent === 'accepted') {
      // Activer les outils d'analytics si configurés
      const gaId = import.meta.env.VITE_GA_ID as string | undefined;
      if (gaId && typeof window.gtag === 'function') {
        window.gtag('config', gaId, { send_page_view: true });
      }
    }
  }, [consent]);

  if (consent !== null) return null;

  const handleChoice = (choice: Exclude<Consent, null>) => {
    localStorage.setItem(CONSENT_KEY, choice);
    setConsent(choice);
  };

  return (
    <div
      role="dialog"
      aria-label="Gestion des cookies"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white p-4 shadow-2xl sm:p-6"
    >
      <div className="mx-auto flex max-w-7xl flex-col items-start gap-4 sm:flex-row sm:items-center">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-600">
          <Cookie size={20} aria-hidden="true" />
        </span>
        <div className="flex-1 text-sm text-slate-600">
          <p className="font-semibold text-slate-900">Nous respectons votre vie privée</p>
          <p className="mt-1">
            Nous utilisons des cookies pour améliorer votre expérience, mesurer l'audience et
            personnaliser nos offres. Consultez notre{' '}
            <Link to="/confidentialite" className="font-medium text-primary-600 hover:underline">
              politique de confidentialité
            </Link>
            .
          </p>
        </div>
        <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
          <Button variant="secondary" size="sm" onClick={() => handleChoice('refused')}>
            Tout refuser
          </Button>
          <Button size="sm" onClick={() => handleChoice('accepted')}>
            Tout accepter
          </Button>
        </div>
      </div>
    </div>
  );
}