import { useState } from 'react';
import type { MouseEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Loader2, Package, ShoppingCart, Star } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { usePanier } from '../hooks/usePanier';
import { formatPrix, calculerRemise } from '../utils/panier';
import { Badge } from './ui/Badge';
import { FavoriButton } from './FavoriButton';
import type { Produit } from '../types';

interface ProductCardProps {
  produit: Produit;
  /**
   * Eyebrow de la card : `marque` (maquette — DOUBLE A / BIC / ESSELTE / MAPED)
   * ou `categorie`.
   */
  eyebrow?: 'marque' | 'categorie';
  className?: string;
}

/**
 * Card produit WorkStore (spec §2 « Card produit »).
 *
 * - image bord à bord 4:3 (zoom léger au survol), pastille remise
 * - eyebrow marque · titre 15/20 medium · note compacte
 * - prix Outfit 600 + ancien prix barré · bouton panier compact (icône)
 *
 * ⚠️ Pas de pill de stock ici : le stock public n'est exposé que produit par
 * produit (`GET /produits/:id/stock`). L'afficher déclencherait une requête
 * par carte (N+1) sur les grilles du catalogue, de l'accueil et de la fiche
 * produit. L'état de stock reste affiché sur la fiche produit, qui n'appelle
 * l'endpoint qu'une fois. Voir `docs/DESIGN_SYSTEM.md` § « fonctionnalités non
 * branchées ».
 */
export function ProductCard({ produit, eyebrow = 'marque', className = '' }: ProductCardProps) {
  const { isAuthenticated } = useAuth();
  const { addItem } = usePanier();
  const navigate = useNavigate();
  const location = useLocation();
  const [adding, setAdding] = useState(false);

  const remise = calculerRemise(produit.prix, produit.ancien_prix);
  const image = produit.images?.[0];

  const handleAdd = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (!isAuthenticated) {
      navigate('/login', {
        state: {
          from: location.pathname,
          message: 'Connectez-vous pour ajouter ce produit à votre panier.',
        },
      });
      return;
    }

    setAdding(true);
    try {
      await addItem(produit.id, 1);
    } catch {
      // Le toast d'erreur est déjà affiché par le contexte
    } finally {
      setAdding(false);
    }
  };

  return (
    <article
      className={`group relative flex h-full flex-col overflow-hidden rounded-xl border border-border-brand bg-white shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-hover ${className}`}
    >
      <Link to={`/produits/${produit.id}`} className="block" aria-label={produit.nom} tabIndex={-1}>
        <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-page">
          {image ? (
            <img
              src={image.url}
              alt={produit.nom}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            />
          ) : (
            <Package size={40} strokeWidth={1.5} className="text-primary-300" aria-hidden="true" />
          )}
          {remise !== null && (
            <span className="absolute left-3 top-3 rounded-pill bg-white/95 px-2 py-0.5 text-xs font-semibold text-error-600 shadow-sm backdrop-blur">
              -{remise} %
            </span>
          )}
        </div>
      </Link>
      <FavoriButton produit={produit} className="absolute right-3 top-3" />

      <div className="flex flex-1 flex-col p-4">
        <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-ink-muted">
          {eyebrow === 'marque'
            ? produit.marque || produit.categorie?.nom || 'WorkStore'
            : produit.categorie?.nom || 'Fournitures'}
        </p>

        <h3 className="mt-1 line-clamp-2 min-h-[40px] text-sm font-medium leading-5 text-ink sm:text-[15px]">
          <Link
            to={`/produits/${produit.id}`}
            className="transition-colors hover:text-primary-700"
          >
            {produit.nom}
          </Link>
        </h3>

        {produit.note_moyenne > 0 ? (
          <p className="mt-1.5 flex items-center gap-1 text-xs text-ink-soft">
            <Star size={12} className="fill-accent-500 text-accent-500" aria-hidden="true" />
            <span className="font-medium text-ink">{produit.note_moyenne.toFixed(1)}</span>
            <span>({produit.nombre_avis})</span>
          </p>
        ) : (
          <div className="mt-1.5">
            <Badge variant="neutral">Nouveau</Badge>
          </div>
        )}

        <div className="mt-auto flex items-end justify-between gap-2 pt-4">
          <div className="min-w-0">
            {remise !== null && (
              <p className="text-xs tabular-nums text-ink-muted line-through">
                {formatPrix(produit.ancien_prix)}
              </p>
            )}
            <p className="whitespace-nowrap font-display text-[15px] font-semibold tabular-nums text-ink sm:text-lg">
              {formatPrix(produit.prix)}
            </p>
          </div>

          <button
            type="button"
            onClick={handleAdd}
            disabled={adding}
            aria-label={`Ajouter « ${produit.nom} » au panier`}
            title="Ajouter au panier"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-700 transition-colors hover:bg-primary-600 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600/50 disabled:opacity-60"
          >
            {adding ? (
              <Loader2 size={18} className="animate-spin" aria-hidden="true" />
            ) : (
              <ShoppingCart size={18} aria-hidden="true" />
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
