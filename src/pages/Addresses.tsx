import { MapPin, Plus } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { usePageMeta } from '../hooks/usePageMeta';

export function Addresses() {
  usePageMeta({ title: 'Mes adresses', path: '/adresses', noIndex: true });

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
            Mes adresses
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Gérez vos adresses de livraison et de facturation.
          </p>
        </div>
        <Button leftIcon={<Plus size={16} />}>Ajouter une adresse</Button>
      </div>

      <div className="mt-8">
        <EmptyState
          icon={MapPin}
          title="Aucune adresse enregistrée"
          description="Ajoutez une adresse pour faciliter vos prochaines commandes."
          action={
            <Button variant="secondary" leftIcon={<Plus size={16} />}>
              Ajouter une adresse
            </Button>
          }
        />
      </div>
    </div>
  );
}