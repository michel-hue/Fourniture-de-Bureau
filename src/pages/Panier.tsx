import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Trash2, Minus, Plus, Package, ArrowRight, ArrowLeft } from 'lucide-react';
import { usePanier } from '../hooks/usePanier';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { Skeleton } from '../components/ui/Skeleton';
import { usePageMeta } from '../hooks/usePageMeta';
import { calculerFraisLivraison, formatPrix, prixLigne } from '../utils/panier';

/** Stepper quantité (spec §2 « Stepper qty ») : 44×44, bordure 1px `line-strong`, radius 8. */
const stepperButtonClasses =
  'flex h-11 w-11 items-center justify-center rounded-lg text-ink transition-colors hover:bg-page disabled:cursor-not-allowed disabled:opacity-40';

export function Panier() {
  usePageMeta({ title: 'Panier', path: '/panier', noIndex: true });

  const { panier, nbArticles, total, loading, updateItem, removeItem, clearPanier } = usePanier();
  const navigate = useNavigate();
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [clearing, setClearing] = useState(false);

  const fraisLivraison = calculerFraisLivraison(total);
  const totalAvecLivraison = total + fraisLivraison;

  const handleUpdateQuantite = async (detailId: string, quantite: number) => {
    if (quantite < 1 || quantite > 99) return;
    setUpdatingId(detailId);
    try {
      await updateItem(detailId, quantite);
    } catch {
      // Le toast d'erreur est déjà affiché par le contexte
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemove = async (detailId: string) => {
    setRemovingId(detailId);
    try {
      await removeItem(detailId);
    } catch {
      // Le toast d'erreur est déjà affiché par le contexte
    } finally {
      setRemovingId(null);
    }
  };

  const handleClear = async () => {
    setClearing(true);
    try {
      await clearPanier();
    } catch {
      // Le toast d'erreur est déjà affiché par le contexte
    } finally {
      setClearing(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-10">
        <Skeleton className="h-10 w-56" />
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]">
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-80 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (!panier || panier.details.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-10">
        <h1 className="font-display text-[26px] font-semibold leading-tight text-ink sm:text-[32px]">
          Mon panier
        </h1>
        <Card className="mt-8">
          <EmptyState
            icon={ShoppingCart}
            title="Votre panier est vide"
            description="Parcourez notre catalogue et ajoutez vos fournitures préférées."
            action={
              <Link to="/catalogue">
                <Button leftIcon={<ArrowRight size={16} />}>Découvrir le catalogue</Button>
              </Link>
            }
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-10">
      {/* ── Titre ────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-[26px] font-semibold leading-tight text-ink sm:text-[32px]">
            Mon panier
          </h1>
          <p className="mt-1 text-sm text-ink-soft">
            {nbArticles} article{nbArticles > 1 ? 's' : ''} dans votre panier
          </p>
        </div>

        <button
          type="button"
          onClick={handleClear}
          disabled={clearing}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 transition-colors hover:text-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Trash2 size={15} aria-hidden="true" />
          Vider le panier
        </button>
      </div>

      <div className="mt-6 grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_380px] lg:gap-8">
        {/* ── Lignes du panier (spec §2 « Ligne panier ») ─────────────────── */}
        <Card className="overflow-hidden">
          {panier.details.map((detail, index) => {
            const produit = detail.produit;
            const sousTotal = prixLigne(detail.prix_unitaire, detail.quantite);
            return (
              <div
                key={detail.id}
                className={`flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:gap-6 sm:p-5 ${
                  index > 0 ? 'border-t border-border-brand' : ''
                }`}
              >
                {/* Vignette 64×64 */}
                <Link
                  to={`/produits/${detail.produit_id}`}
                  className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-surface text-primary-300"
                >
                  {produit?.images?.[0] ? (
                    <img
                      src={produit.images[0].url}
                      alt={produit.nom}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Package size={24} aria-hidden="true" />
                  )}
                </Link>

                {/* Nom + méta */}
                <div className="min-w-0 flex-1">
                  <Link
                    to={`/produits/${detail.produit_id}`}
                    className="font-semibold text-ink transition-colors hover:text-primary-700"
                  >
                    {produit?.nom ?? 'Produit'}
                  </Link>
                  <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[13px] leading-[18px] text-ink-soft">
                    <span>{formatPrix(detail.prix_unitaire)} / unité</span>
                    {produit?.reference && (
                      <span className="font-mono text-xs text-ink-soft">{produit.reference}</span>
                    )}
                  </p>
                </div>

                {/* Stepper */}
                <div className="flex items-center rounded-lg border border-line-strong bg-white">
                  <button
                    type="button"
                    onClick={() => handleUpdateQuantite(detail.id, detail.quantite - 1)}
                    disabled={updatingId === detail.id || detail.quantite <= 1}
                    aria-label="Diminuer la quantité"
                    className={stepperButtonClasses}
                  >
                    <Minus size={16} aria-hidden="true" />
                  </button>
                  <span className="w-11 text-center font-display text-lg font-semibold tabular-nums text-ink">
                    {detail.quantite}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleUpdateQuantite(detail.id, detail.quantite + 1)}
                    disabled={updatingId === detail.id || detail.quantite >= 99}
                    aria-label="Augmenter la quantité"
                    className={stepperButtonClasses}
                  >
                    <Plus size={16} aria-hidden="true" />
                  </button>
                </div>

                {/* Prix + suppression */}
                <div className="flex items-center justify-between gap-3 sm:w-[110px] sm:flex-col sm:items-end">
                  <p className="font-display text-xl font-semibold tabular-nums text-ink">
                    {formatPrix(sousTotal)}
                  </p>
                  <button
                    type="button"
                    onClick={() => handleRemove(detail.id)}
                    disabled={removingId === detail.id}
                    aria-label={`Supprimer ${produit?.nom ?? "l'article"} du panier`}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-ink-soft transition-colors hover:bg-error-50 hover:text-error-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Trash2 size={16} aria-hidden="true" />
                  </button>
                </div>
              </div>
            );
          })}
        </Card>

        {/* ── Aside récap (spec §2 « Card » variant aside) ─────────────────── */}
        <div className="lg:sticky lg:top-24">
          <Card className="shadow-aside">
            <div className="border-b border-border-brand px-6 py-5">
              <h2 className="font-display text-[22px] font-semibold leading-tight text-ink">
                Récapitulatif
              </h2>
            </div>

            <div className="space-y-4 p-6">
              {/* Lignes `.sum` */}
              <div className="flex items-center justify-between gap-4 text-[15px]">
                <span className="text-ink-soft">Sous-total</span>
                <span className="font-display font-semibold tabular-nums text-ink">
                  {formatPrix(total)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4 text-[15px]">
                <span className="text-ink-soft">Livraison à Abidjan</span>
                {fraisLivraison === 0 ? (
                  <Badge variant="success">Offerte</Badge>
                ) : (
                  <span className="font-display font-semibold tabular-nums text-ink">
                    {formatPrix(fraisLivraison)}
                  </span>
                )}
              </div>

              {/* Total */}
              <div className="flex items-center justify-between gap-4 border-t border-border-brand pt-4">
                <span className="text-[18px] font-semibold text-ink">Total</span>
                <span className="font-display text-[28px] font-semibold tabular-nums text-ink">
                  {formatPrix(totalAvecLivraison)}
                </span>
              </div>
            </div>

            <div className="space-y-3 rounded-b-xl bg-page px-6 py-5">
              <Button
                variant="accent"
                size="lg"
                className="w-full"
                onClick={() => navigate('/checkout')}
                rightIcon={<ArrowRight size={18} aria-hidden="true" />}
              >
                Passer la commande
              </Button>
              <Link
                to="/catalogue"
                className="flex items-center justify-center gap-1 text-sm font-semibold text-primary-600 transition-colors hover:text-primary-700"
              >
                <ArrowLeft size={14} aria-hidden="true" /> Continuer mes achats
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
