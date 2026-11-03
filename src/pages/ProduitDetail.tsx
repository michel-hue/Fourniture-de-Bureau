import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  ChevronRight,
  Star,
  ShoppingCart,
  Zap,
  Truck,
  RotateCcw,
  ShieldCheck,
  Minus,
  Plus,
  Package,
  Tag,
  Barcode,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';
import { ProductCard } from '../components/ProductCard';
import { FavoriButton } from '../components/FavoriButton';
import { produitsApi } from '../api/produits.api';
import { useAuth } from '../hooks/useAuth';
import { usePanier } from '../hooks/usePanier';
import { usePageMeta } from '../hooks/usePageMeta';
import { formatPrix, calculerRemise } from '../utils/panier';
import type { Produit, ProductStock } from '../types';

export function ProduitDetail() {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuth();
  const { addItem } = usePanier();
  const navigate = useNavigate();
  const location = useLocation();
  const [produit, setProduit] = useState<Produit | null>(null);
  const [similaires, setSimilaires] = useState<Produit[]>([]);
  const [stock, setStock] = useState<ProductStock | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [imageIndex, setImageIndex] = useState(0);

  usePageMeta({
    title: produit ? produit.nom : 'Produit',
    description: produit
      ? `${produit.nom} — ${produit.description?.slice(0, 150) ?? 'Fourniture de bureau de qualité.'}`
      : 'Détail du produit.',
    path: `/produits/${id ?? ''}`,
  });
  const [quantite, setQuantite] = useState(1);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadProduit = async () => {
      if (!id) return;
      setLoading(true);
      setError('');
      setImageIndex(0);
      setQuantite(1);
      // Réinitialise les données dépendantes du produit précédent : sans cela, un
      // échec du chargement ferait afficher le stock d'un autre produit.
      setStock(null);
      setSimilaires([]);
      try {
        const res = await produitsApi.getOne(id);
        if (cancelled) return;
        setProduit(res.data.data);

        // `GET /produits/:id/stock` est PUBLIC : la page reste complète pour
        // un visiteur anonyme (pill « En stock » / « Stock faible : N » /
        // « Rupture » et désactivation du bouton en découlent). En cas
        // d'échec réseau on laisse `stock` à `null` — ni pill, ni blocage de
        // l'achat — plutôt que d'affirmer un état de stock faux.
        const [stockResult, similairesResult] = await Promise.allSettled([
          produitsApi.getStock(id),
          produitsApi.getAll({
            limit: 4,
            categorie_id: res.data.data.categorie_id,
          }),
        ]);
        if (cancelled) return;

        if (stockResult.status === 'fulfilled') {
          setStock(stockResult.value.data.data);
        }

        if (similairesResult.status === 'fulfilled') {
          setSimilaires(
            similairesResult.value.data.data.filter((p) => p.id !== res.data.data.id),
          );
        }
      } catch {
        if (!cancelled) {
          setError('Impossible de charger ce produit. Il a peut-être été supprimé.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadProduit();

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-10">
        <Skeleton className="h-4 w-64" />
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
          <Skeleton className="aspect-square rounded-xl" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-9 w-2/3" />
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-10 w-1/4" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !produit) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-10">
        <Alert type="error" message={error || 'Produit introuvable.'} />
        <Link
          to="/catalogue"
          className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary-600 transition-colors hover:text-primary-700"
        >
          <ChevronRight size={16} className="rotate-180" aria-hidden="true" /> Retour au catalogue
        </Link>
      </div>
    );
  }

  const images = produit.images?.length ? produit.images : [];
  const imagePrincipale = images[imageIndex] ?? produit.images?.find((i) => i.is_principale) ?? produit.images?.[0];
  const remise = calculerRemise(produit.prix, produit.ancien_prix);

  /**
   * État du stock affiché (spec §1.1 « palette statut ») :
   * - `ok`     → « En stock » (fond #DDF2E4 / texte #187A42)
   * - `faible` → « Stock faible : N » (fond #FFB800 / texte navy)
   * - `rupture`→ « Rupture » (fond #FBE3E4 / texte #B3262F)
   *
   * `null` = stock inconnu (échec de l'appel) → aucune pill, achat autorisé.
   * Le seuil « faible » est celui du produit (`seuil_alerte` renvoyé par
   * l'API), jamais une constante côté front.
   */
  const stockStatus =
    stock === null
      ? null
      : stock.quantite <= 0
        ? 'rupture'
        : stock.quantite <= stock.seuil_alerte
          ? 'faible'
          : 'ok';

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login', {
        state: {
          from: location.pathname,
          message: 'Connectez-vous pour ajouter ce produit à votre panier.',
        },
      });
      return;
    }
    if (!produit) return;
    setAdding(true);
    try {
      await addItem(produit.id, quantite);
    } catch {
      // Le toast d'erreur est déjà affiché par le contexte
    } finally {
      setAdding(false);
    }
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      navigate('/login', {
        state: {
          from: location.pathname,
          message: 'Connectez-vous pour finaliser votre achat.',
        },
      });
      return;
    }
    if (!produit) return;
    setAdding(true);
    try {
      await addItem(produit.id, quantite);
      navigate('/checkout');
    } catch {
      // Le toast d'erreur est déjà affiché par le contexte
    } finally {
      setAdding(false);
    }
  };

  const ruptureStock = stockStatus === 'rupture';

  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-8 sm:px-6 sm:pb-16 lg:px-10">
      {/* Fil d'Ariane */}
      <nav
        aria-label="Fil d'Ariane"
        className="flex flex-wrap items-center gap-1.5 text-[13px] text-ink-soft"
      >
        <Link to="/" className="transition-colors hover:text-primary-600">
          Accueil
        </Link>
        <ChevronRight size={14} className="text-ink-soft/60" aria-hidden="true" />
        <Link to="/catalogue" className="transition-colors hover:text-primary-600">
          Catalogue
        </Link>
        {produit.categorie && (
          <>
            <ChevronRight size={14} className="text-ink-soft/60" aria-hidden="true" />
            <Link to="/catalogue" className="transition-colors hover:text-primary-600">
              {produit.categorie.nom}
            </Link>
          </>
        )}
        <ChevronRight size={14} className="text-ink-soft/60" aria-hidden="true" />
        <span className="font-semibold text-ink">{produit.nom}</span>
      </nav>

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
        {/* ── Galerie ─────────────────────────────────────────────────────── */}
        <div>
          <div className="overflow-hidden rounded-xl border border-border-brand bg-white shadow-card">
            {imagePrincipale ? (
              <img
                src={imagePrincipale.url}
                alt={produit.nom}
                fetchPriority="high"
                className="aspect-square w-full bg-surface object-cover"
              />
            ) : (
              <div className="flex aspect-square items-center justify-center bg-surface text-primary-300">
                <Package size={64} aria-hidden="true" />
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="mt-3 flex gap-3">
              {images.map((image, index) => (
                <button
                  key={image.id}
                  type="button"
                  onClick={() => setImageIndex(index)}
                  aria-label={`Voir l'image ${index + 1}`}
                  className={`h-20 w-20 overflow-hidden rounded-lg border transition-colors ${
                    index === imageIndex
                      ? 'border-primary-600'
                      : 'border-border-brand hover:border-primary-300'
                  }`}
                >
                  <img src={image.url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Informations ────────────────────────────────────────────────── */}
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-soft">
            {produit.marque || produit.categorie?.nom || 'WorkStore'}
          </p>
          <h1 className="mt-2 font-display text-[26px] font-semibold leading-tight text-ink sm:text-[32px]">
            {produit.nom}
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1">
              <Star
                size={16}
                className={
                  produit.note_moyenne > 0 ? 'fill-accent-500 text-accent-500' : 'text-ink-soft/40'
                }
                aria-hidden="true"
              />
              <span className="font-display text-sm font-semibold tabular-nums text-ink">
                {produit.note_moyenne > 0 ? produit.note_moyenne.toFixed(1) : 'Nouveau'}
              </span>
            </div>
            <span className="text-[13px] text-ink-soft">
              {produit.nombre_avis > 0
                ? `${produit.nombre_avis} avis`
                : 'Aucun avis pour le moment'}
            </span>
            {stockStatus === 'ok' && (
              <Badge variant="success" dot>
                En stock
              </Badge>
            )}
            {stockStatus === 'faible' && stock && (
              <Badge variant="warning" dot>
                Stock faible : {stock.quantite}
              </Badge>
            )}
            {stockStatus === 'rupture' && (
              <Badge variant="error" dot>
                Rupture
              </Badge>
            )}
          </div>

          <div className="mt-5 flex flex-wrap items-baseline gap-3">
            <p className="font-display text-[28px] font-semibold leading-9 tabular-nums text-ink sm:text-[32px]">
              {formatPrix(produit.prix)}
            </p>
            {remise !== null && (
              <>
                <p className="text-[15px] text-ink-soft line-through">
                  {formatPrix(produit.ancien_prix)}
                </p>
                <Badge variant="accent">-{remise} %</Badge>
              </>
            )}
          </div>

          {produit.description && (
            <p className="mt-4 text-[15px] leading-6 text-ink-soft">{produit.description}</p>
          )}

          <dl className="mt-6 space-y-2.5 border-y border-border-brand py-4 text-sm">
            {produit.marque && (
              <div className="flex items-center gap-2">
                <Tag size={16} className="shrink-0 text-primary-600" aria-hidden="true" />
                <dt className="text-ink-soft">Marque :</dt>
                <dd className="font-semibold text-ink">{produit.marque}</dd>
              </div>
            )}
            {produit.reference && (
              <div className="flex items-center gap-2">
                <Barcode size={16} className="shrink-0 text-primary-600" aria-hidden="true" />
                <dt className="text-ink-soft">Référence :</dt>
                <dd className="font-mono text-[13px] text-ink">{produit.reference}</dd>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Package size={16} className="shrink-0 text-primary-600" aria-hidden="true" />
              <dt className="text-ink-soft">Catégorie :</dt>
              <dd className="font-semibold text-ink">
                {produit.categorie?.nom ?? 'Non classé'}
              </dd>
            </div>
          </dl>

          {/* Stepper 44×44 + CTA */}
          <div className="mt-6 flex flex-wrap items-stretch gap-3">
            <div className="flex items-center rounded-lg border border-line-strong bg-white">
              <button
                type="button"
                onClick={() => setQuantite((q) => Math.max(1, q - 1))}
                disabled={ruptureStock}
                aria-label="Diminuer la quantité"
                className="flex h-12 w-11 items-center justify-center text-ink-soft transition-colors hover:bg-page hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Minus size={16} aria-hidden="true" />
              </button>
              <span className="w-10 text-center text-base font-medium tabular-nums text-ink">
                {quantite}
              </span>
              <button
                type="button"
                onClick={() => setQuantite((q) => Math.min(99, q + 1))}
                disabled={ruptureStock || quantite >= 99}
                aria-label="Augmenter la quantité"
                className="flex h-12 w-11 items-center justify-center text-ink-soft transition-colors hover:bg-page hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Plus size={16} aria-hidden="true" />
              </button>
            </div>

            <Button
              variant="primary"
              size="lg"
              className="min-w-[200px] flex-1"
              onClick={handleAddToCart}
              loading={adding}
              disabled={ruptureStock}
              leftIcon={<ShoppingCart size={18} aria-hidden="true" />}
            >
              Ajouter au panier
            </Button>
            <FavoriButton produit={produit} size="md" className="!h-12 !w-12 !rounded-lg" />
            <Button
              variant="secondary"
              size="lg"
              className="w-full"
              onClick={handleBuyNow}
              loading={adding}
              disabled={ruptureStock}
              leftIcon={<Zap size={18} aria-hidden="true" />}
            >
              Acheter maintenant
            </Button>
          </div>
          {ruptureStock && (
            <p className="mt-2 text-[13px] text-error-700">
              Ce produit est en rupture de stock et ne peut pas être commandé.
            </p>
          )}

          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              { icon: Truck, label: 'Livraison 48 h' },
              { icon: RotateCcw, label: 'Retours 30 jours' },
              { icon: ShieldCheck, label: 'Paiement sécurisé' },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="flex items-center gap-2 rounded-lg border border-border-brand bg-white px-3 py-2.5 text-[13px] font-medium text-ink"
                >
                  <Icon size={17} className="shrink-0 text-primary-600" aria-hidden="true" />
                  {item.label}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Produits similaires ───────────────────────────────────────────── */}
      {similaires.length > 0 && (
        <section className="mt-14">
          <h2 className="font-display text-[22px] font-semibold leading-tight text-ink sm:text-[28px]">
            Produits similaires
          </h2>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
            {similaires.map((produitSimilaire) => (
              <ProductCard key={produitSimilaire.id} produit={produitSimilaire} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
