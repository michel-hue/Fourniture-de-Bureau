import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CheckCircle2, Package, Home, Truck } from 'lucide-react';
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
    <div className="bg-page">
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:py-16">
        <Card className="overflow-hidden">
          <div className="bg-surface px-6 py-10 text-center sm:px-10">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success-100 text-success-600">
              <CheckCircle2 size={32} aria-hidden="true" />
            </span>
            <h1 className="mt-6 font-display text-[26px] font-semibold leading-tight text-ink sm:text-[32px]">
              Commande confirmée !
            </h1>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-ink-soft sm:text-base">
              Merci pour votre commande. Un email de confirmation vous a été envoyé avec le détail
              de vos articles.
            </p>

            {numero && (
              <div className="mt-6 inline-flex flex-col items-center gap-1 rounded-xl border border-border-brand bg-white px-6 py-4">
                <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-soft">
                  Numéro de commande
                </span>
                <span className="font-mono text-lg font-semibold text-ink">{numero}</span>
              </div>
            )}
          </div>

          <div className="space-y-5 p-6 sm:p-8">
            <div className="flex items-start gap-3 rounded-xl bg-page p-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-primary-600">
                <Truck size={20} aria-hidden="true" />
              </span>
              <p className="text-sm leading-6 text-ink-soft">
                Livraison à Abidjan en 48 h pour toute commande payée avant 15 h. Vous pouvez suivre
                l&apos;avancement de votre commande depuis « Mes commandes ».
              </p>
            </div>

            <div className="flex flex-col justify-center gap-3 sm:flex-row">
              <Link to="/mes-commandes" className="w-full sm:w-auto">
                <Button className="w-full" leftIcon={<Package size={16} />}>
                  Voir mes commandes
                </Button>
              </Link>
              <Link to="/" className="w-full sm:w-auto">
                <Button variant="secondary" className="w-full" leftIcon={<Home size={16} />}>
                  Retour à l&apos;accueil
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
