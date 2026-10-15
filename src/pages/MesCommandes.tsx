import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PackageSearch, ChevronRight } from 'lucide-react';
import { commandesApi } from '../api/commandes.api';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Alert } from '../components/ui/Alert';
import { Modal } from '../components/ui/Modal';
import { EmptyState } from '../components/ui/EmptyState';
import { Skeleton } from '../components/ui/Skeleton';
import { formatPrix, toNumber } from '../utils/panier';
import { getApiErrorMessage } from '../utils/errors';
import { usePageMeta } from '../hooks/usePageMeta';
import type { Commande } from '../types';

type StatutVariant =
  | 'neutral'
  | 'primary'
  | 'accent'
  | 'success'
  | 'warning'
  | 'error'
  | 'info';

const statutConfig: Record<string, { variant: StatutVariant; label: string }> = {
  EN_ATTENTE: { variant: 'warning', label: 'En attente' },
  PAYEE: { variant: 'info', label: 'Payée' },
  EN_PREPARATION: { variant: 'info', label: 'En préparation' },
  EXPEDIEE: { variant: 'primary', label: 'Expédiée' },
  LIVREE: { variant: 'success', label: 'Livrée' },
  ANNULEE: { variant: 'error', label: 'Annulée' },
};

function getStatutConfig(statut: string): { variant: StatutVariant; label: string } {
  return statutConfig[statut] ?? { variant: 'neutral', label: statut };
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function MesCommandes() {
  usePageMeta({ title: 'Mes commandes', path: '/mes-commandes', noIndex: true });

  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<Commande | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadCommandes = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await commandesApi.getMine();
        if (cancelled) return;
        setCommandes(res.data.data);
      } catch (err) {
        if (!cancelled) setError(getApiErrorMessage(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void loadCommandes();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
        Mes commandes
      </h1>
      <p className="mt-2 text-sm text-slate-500">
        Retrouvez ici l'historique de toutes vos commandes.
      </p>

      {error && (
        <div className="mt-6">
          <Alert type="error" message={error} onClose={() => setError('')} />
        </div>
      )}

      {loading ? (
        <div className="mt-8 space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-32 w-full rounded-xl" />
          ))}
        </div>
      ) : commandes.length === 0 ? (
        <Card className="mt-8">
          <EmptyState
            icon={PackageSearch}
            title="Aucune commande pour le moment"
            description="Vos commandes apparaîtront ici dès que vous aurez passé votre première commande."
            action={
              <Link to="/catalogue">
                <button
                  type="button"
                  className="inline-flex h-10 items-center justify-center rounded-md bg-primary-900 px-4 text-sm font-medium text-white transition-all duration-150 hover:bg-primary-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 active:scale-[0.98]"
                >
                  Découvrir le catalogue
                </button>
              </Link>
            }
          />
        </Card>
      ) : (
        <div className="mt-8 space-y-4">
          {commandes.map((commande) => {
            const statut = getStatutConfig(commande.statut);
            const nbArticles = commande.details.reduce(
              (somme, detail) => somme + detail.quantite,
              0,
            );
            return (
              <button
                key={commande.id}
                type="button"
                onClick={() => setSelected(commande)}
                className="block w-full text-left"
              >
                <Card variant="hover" className="cursor-pointer p-5">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-slate-900">Commande {commande.numero}</p>
                      <p className="mt-0.5 text-sm text-slate-500">
                        {formatDate(commande.created_at)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={statut.variant} dot>
                        {statut.label}
                      </Badge>
                      <ChevronRight size={18} className="text-slate-400" aria-hidden="true" />
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-4">
                    <p className="text-sm text-slate-600">
                      {nbArticles} article{nbArticles > 1 ? 's' : ''}
                    </p>
                    <p className="text-lg font-bold tabular-nums text-slate-900">
                      {formatPrix(commande.montant_total)}
                    </p>
                  </div>
                </Card>
              </button>
            );
          })}
        </div>
      )}

      {/* Modal — Détail de la commande */}
      <Modal
        isOpen={selected !== null}
        onClose={() => setSelected(null)}
        title={selected ? `Commande ${selected.numero}` : ''}
      >
        {selected && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Badge variant={getStatutConfig(selected.statut).variant} dot>
                {getStatutConfig(selected.statut).label}
              </Badge>
              <span className="text-sm text-slate-500">{formatDate(selected.created_at)}</span>
            </div>

            <div className="space-y-3">
              {selected.details.map((detail) => (
                <div key={detail.id} className="flex items-center justify-between gap-3 text-sm">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-slate-900">{detail.nom_produit}</p>
                    <p className="text-xs text-slate-500">
                      {detail.quantite} × {formatPrix(detail.prix_unitaire)}
                    </p>
                  </div>
                  <p className="shrink-0 font-semibold tabular-nums text-slate-900">
                    {formatPrix(detail.sous_total)}
                  </p>
                </div>
              ))}
            </div>

            <div className="space-y-2 border-t border-slate-200 pt-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Sous-total</span>
                <span className="font-medium tabular-nums text-slate-900">
                  {formatPrix(toNumber(selected.montant_total) - toNumber(selected.frais_livraison))}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Frais de livraison</span>
                <span className="font-medium tabular-nums text-slate-900">
                  {formatPrix(selected.frais_livraison)}
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-slate-200 pt-2">
                <span className="font-semibold text-slate-900">Total</span>
                <span className="text-lg font-bold tabular-nums text-slate-900">
                  {formatPrix(selected.montant_total)}
                </span>
              </div>
            </div>

            {selected.adresse_livraison && (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm">
                <p className="font-semibold text-slate-900">
                  {selected.adresse_livraison.libelle}
                </p>
                <p className="mt-1 text-slate-600">
                  {selected.adresse_livraison.adresse}
                  <br />
                  {selected.adresse_livraison.code_postal
                    ? `${selected.adresse_livraison.code_postal} `
                    : ''}
                  {selected.adresse_livraison.ville}, {selected.adresse_livraison.pays}
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}