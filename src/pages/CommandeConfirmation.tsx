import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CheckCircle2, Package, Home } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { usePageMeta } from '../hooks/usePageMeta';

interface LocationState {
  numero?: string;
}

function readNumeroCommande(state: LocationState | null): string | null {
  if (state?.numero) return state.numero;
  try {
    const stored = sessionStorage.getItem('lastCommande');
    if (stored) {
      const data = JSON.parse(stored) as { numero?: string };
      return data.numero ?? null;
    }
  } catch {
    // Données de session invalides — on ignore
  }
  return null;
}

export function CommandeConfirmation() {
  usePageMeta({ title: 'Commande confirmée', path: '/commande-confirmation', noIndex: true });

  const location = useLocation();
  const [numero] = useState<string | null>(() =>
    readNumeroCommande(location.state as LocationState | null),
  );

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <Card className="p-8 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success-100 text-success-600">
          <CheckCircle2 size={32} aria-hidden="true" />
        </div>
        <h1 className="mt-6 text-3xl font-bold tracking-tight text-slate-900">
          Commande confirmée !
        </h1>
        <p className="mt-3 text-slate-600">
          Merci pour votre commande. Un email de confirmation vous a été envoyé avec le détail de
          vos articles.
        </p>
        {numero && (
          <p className="mt-4 text-sm text-slate-500">
            Numéro de commande :{' '}
            <span className="font-semibold text-slate-900">{numero}</span>
          </p>
        )}
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link to="/mes-commandes">
            <Button leftIcon={<Package size={16} />}>Voir mes commandes</Button>
          </Link>
          <Link to="/">
            <Button variant="secondary" leftIcon={<Home size={16} />}>
              Retour à l'accueil
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}