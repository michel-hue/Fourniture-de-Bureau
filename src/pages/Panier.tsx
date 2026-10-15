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
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <Skeleton className="h-9 w-48" />
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-28 w-full rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (!panier || panier.details.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">Mon panier</h1>
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
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">Mon panier</h1>
          <p className="mt-1 text-sm text-slate-500">
            {nbArticles} article{nbArticles > 1 ? 's' : ''} dans votre panier
          </p>
        </div>
        <Button
          variant="ghost"
          onClick={handleClear}
          loading={clearing}
          leftIcon={<Trash2 size={16} />}
          className="text-error-600 hover:bg-error-50 hover:text-error-700"
        >
          Vider le panier
        </Button>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
        {/* Liste des articles */}
        <div className="space-y-4">
          {panier.details.map((detail) => {
            const produit = detail.produit;
            const sousTotal = prixLigne(detail.prix_unitaire, detail.quantite);
            return (
              <Card key={detail.id} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                {/* Image */}
                <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-100 text-slate-300">
                  {produit?.images?.[0] ? (
                    <img
                      src={produit.images[0].url}
                      alt={produit.nom}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Package size={28} aria-hidden="true" />
                  )}
                </div>

                {/* Infos produit */}
                <div className="min-w-0 flex-1">
                  <Link
                    to={`/produits/${detail.produit_id}`}
                    className="font-semibold text-slate-900 transition-colors hover:text-primary-900"
                  >
                    {produit?.nom ?? 'Produit'}
                  </Link>
                  <p className="mt-0.5 text-sm text-slate-500">
                    {formatPrix(detail.prix_unitaire)} / unité
                  </p>
                </div>

                {/* Stepper quantité */}
                <div className="flex items-center rounded-md border border-slate-300 bg-white">
                  <button
                    type="button"
                    onClick={() => handleUpdateQuantite(detail.id, detail.quantite - 1)}
                    disabled={updatingId === detail.id || detail.quantite <= 1}
                    aria-label="Diminuer la quantité"
                    className="flex h-10 w-10 items-center justify-center text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Minus size={14} aria-hidden="true" />
                  </button>
                  <span className="w-10 text-center text-sm font-semibold tabular-nums text-slate-900">
                    {detail.quantite}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleUpdateQuantite(detail.id, detail.quantite + 1)}
                    disabled={updatingId === detail.id || detail.quantite >= 99}
                    aria-label="Augmenter la quantité"
                    className="flex h-10 w-10 items-center justify-center text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Plus size={14} aria-hidden="true" />
                  </button>
                </div>

                {/* Sous-total + suppression */}
                <div className="flex items-center justify-between gap-4 sm:w-32 sm:flex-col sm:items-end">
                  <p className="font-bold tabular-nums text-slate-900">{formatPrix(sousTotal)}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemove(detail.id)}
                    loading={removingId === detail.id}
                    aria-label={`Supprimer ${produit?.nom ?? "l'article"} du panier`}
                    className="text-error-600 hover:bg-error-50 hover:text-error-700"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Récapitulatif sticky */}
        <div className="lg:sticky lg:top-24 lg:h-fit">
          <Card>
            <div className="border-b border-slate-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-slate-900">Récapitulatif</h2>
            </div>
            <div className="space-y-3 p-6 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Sous-total</span>
                <span className="font-semibold tabular-nums text-slate-900">
                  {formatPrix(total)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Frais de livraison</span>
                {fraisLivraison === 0 ? (
                  <Badge variant="success">Offerts</Badge>
                ) : (
                  <span className="font-semibold tabular-nums text-slate-900">
                    {formatPrix(fraisLivraison)}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between border-t border-slate-200 pt-3">
                <span className="font-semibold text-slate-900">Total</span>
                <span className="text-xl font-bold tabular-nums text-slate-900">
                  {formatPrix(totalAvecLivraison)}
                </span>
              </div>
            </div>
            <div className="border-t border-slate-200 bg-slate-50 px-6 py-4">
              <Button
                variant="accent"
                size="lg"
                className="w-full"
                onClick={() => navigate('/checkout')}
                rightIcon={<ArrowRight size={16} />}
              >
                Passer la commande
              </Button>
              <Link
                to="/catalogue"
                className="mt-3 flex items-center justify-center gap-1 text-sm font-medium text-primary-700 transition-colors hover:text-primary-900"
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