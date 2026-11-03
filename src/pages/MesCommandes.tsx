import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PackageSearch, ChevronRight, Truck } from 'lucide-react';
import { commandesApi } from '../api/commandes.api';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Alert } from '../components/ui/Alert';
import { Modal } from '../components/ui/Modal';
import { EmptyState } from '../components/ui/EmptyState';
import { Skeleton } from '../components/ui/Skeleton';
import { Button } from '../components/ui/Button';
import { formatPrix, toNumber } from '../utils/panier';
import { getApiErrorMessage } from '../utils/errors';
import { usePageMeta } from '../hooks/usePageMeta';
import type { Commande } from '../types';
import { PageHeader } from '../components/PageHeader';

type StatutVariant =
  | 'neutral'
  | 'primary'
  | 'accent'
  | 'success'
  | 'warning'
  | 'error'
  | 'info';

/** Pills statut (spec §1 « Palette statut »). */
const statutConfig: Record<string, { variant: StatutVariant; label: string }> = {
  EN_ATTENTE: { variant: 'warning', label: 'En attente' },
  PAYEE: { variant: 'success', label: 'Payée' },
  EN_PREPARATION: { variant: 'info', label: 'En préparation' },
  EXPEDIEE: { variant: 'neutral', label: 'Expédiée' },
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
    <div>
      <PageHeader
        title="Mes commandes"
        description="Retrouvez l’historique et le suivi de toutes vos commandes."
      />

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
                <Button>Découvrir le catalogue</Button>
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
                      <p className="font-mono text-base font-semibold text-ink">{commande.numero}</p>
                      <p className="mt-0.5 text-[13px] leading-[18px] text-ink-soft">
                        {formatDate(commande.created_at)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={statut.variant} dot>
                        {statut.label}
                      </Badge>
                      <ChevronRight size={18} className="text-ink-soft" aria-hidden="true" />
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-t border-border-brand pt-4">
                    <p className="text-sm text-ink-soft">
                      {nbArticles} article{nbArticles > 1 ? 's' : ''}
                    </p>
                    <p className="font-display text-xl font-semibold tabular-nums text-ink">
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
              <span className="text-sm text-ink-soft">{formatDate(selected.created_at)}</span>
            </div>

            {/* Lignes de commande (spec §2 « Tables ») */}
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="pb-2 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-soft">
                    Produit
                  </th>
                  <th className="pb-2 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-soft">
                    Qté
                  </th>
                  <th className="pb-2 text-right text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-soft">
                    Montant
                  </th>
                </tr>
              </thead>
              <tbody>
                {selected.details.map((detail) => (
                  <tr key={detail.id} className="border-t border-border-brand">
                    <td className="py-3 pr-3">
                      <p className="font-semibold text-ink">{detail.nom_produit}</p>
                      <p className="text-[13px] leading-[18px] text-ink-soft">
                        {formatPrix(detail.prix_unitaire)}
                      </p>
                    </td>
                    <td className="py-3 pr-3 font-display font-semibold tabular-nums text-ink">
                      ×{detail.quantite}
                    </td>
                    <td className="py-3 text-right font-display font-semibold tabular-nums text-ink">
                      {formatPrix(detail.sous_total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totaux (lignes `.sum`) */}
            <div className="space-y-3 border-t border-border-brand pt-4 text-sm">
              <div className="flex items-center justify-between gap-4">
                <span className="text-ink-soft">Sous-total</span>
                <span className="font-display font-semibold tabular-nums text-ink">
                  {formatPrix(toNumber(selected.montant_total) - toNumber(selected.frais_livraison))}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-ink-soft">Livraison à Abidjan</span>
                <span className="font-display font-semibold tabular-nums text-ink">
                  {formatPrix(selected.frais_livraison)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4 border-t border-border-brand pt-4">
                <span className="text-[18px] font-semibold text-ink">Total</span>
                <span className="font-display text-[28px] font-semibold tabular-nums text-ink">
                  {formatPrix(selected.montant_total)}
                </span>
              </div>
            </div>

            {selected.adresse_livraison && (
              <div className="rounded-xl border border-border-brand bg-page p-4 text-sm">
                <p className="flex items-center gap-2 font-semibold text-ink">
                  <Truck size={16} className="text-primary-600" aria-hidden="true" />
                  {selected.adresse_livraison.libelle}
                </p>
                <p className="mt-1 text-[13px] leading-[18px] text-ink-soft">
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
