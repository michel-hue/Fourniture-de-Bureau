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
  MessageSquare,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { Skeleton } from '../components/ui/Skeleton';
import { produitsApi } from '../api/produits.api';
import { stocksApi } from '../api/stocks.api';
import { useAuth } from '../hooks/useAuth';
import { usePanier } from '../hooks/usePanier';
import { usePageMeta } from '../hooks/usePageMeta';
import { formatPrix, calculerRemise } from '../utils/panier';
import type { Produit } from '../types';

export function ProduitDetail() {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuth();
  const { addItem } = usePanier();
  const navigate = useNavigate();
  const location = useLocation();
  const [produit, setProduit] = useState<Produit | null>(null);
  const [similaires, setSimilaires] = useState<Produit[]>([]);
  const [stockInfo, setStockInfo] = useState<{ quantite: number; seuil: number } | null>(null);
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
      setStockInfo(null);
      setSimilaires([]);
      try {
        const res = await produitsApi.getOne(id);
        if (cancelled) return;
        setProduit(res.data.data);

        // `GET /stocks/produit/:produitId` est public : la page reste complète
        // pour un visiteur anonyme (badge « En stock » / « Rupture » et
        // désactivation du bouton en découlent). En cas d'échec réseau on laisse
        // `stockInfo` à `null` — ni badge, ni blocage de l'achat — plutôt que
        // d'affirmer un état de stock faux.
        const [stockResult, similairesResult] = await Promise.allSettled([
          stocksApi.getByProduit(id),
          produitsApi.getAll({
            limit: 4,
            categorie_id: res.data.data.categorie_id,
          }),
        ]);
        if (cancelled) return;

        if (stockResult.status === 'fulfilled') {
          setStockInfo({
            quantite: stockResult.value.data.data.quantite,
            seuil: stockResult.value.data.data.seuil_alerte,
          });
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
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <Skeleton className="h-4 w-64" />
        <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-2">
          <Skeleton className="aspect-square rounded-xl" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-9 w-2/3" />
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-10 w-1/4" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !produit) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <Alert type="error" message={error || 'Produit introuvable.'} />
        <Link
          to="/catalogue"
          className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary-700 transition-colors hover:text-primary-900"
        >
          <ChevronRight size={16} className="rotate-180" /> Retour au catalogue
        </Link>
      </div>
    );
  }

  const images = produit.images?.length ? produit.images : [];
  const imagePrincipale = images[imageIndex] ?? produit.images?.find((i) => i.is_principale) ?? produit.images?.[0];
  const remise = calculerRemise(produit.prix, produit.ancien_prix);

  const stockStatus =
    stockInfo === null
      ? null
      : stockInfo.quantite === 0
        ? 'rupture'
        : stockInfo.quantite <= stockInfo.seuil
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
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Fil d'Ariane */}
      <nav aria-label="Fil d'Ariane" className="flex flex-wrap items-center gap-1.5 text-sm text-slate-500">
        <Link to="/" className="transition-colors hover:text-primary-900">
          Accueil
        </Link>
        <ChevronRight size={14} className="text-slate-400" aria-hidden="true" />
        <Link to="/catalogue" className="transition-colors hover:text-primary-900">
          Catalogue
        </Link>
        {produit.categorie && (
          <>
            <ChevronRight size={14} className="text-slate-400" aria-hidden="true" />
            <Link to="/catalogue" className="transition-colors hover:text-primary-900">
              {produit.categorie.nom}
            </Link>
          </>
        )}
        <ChevronRight size={14} className="text-slate-400" aria-hidden="true" />
        <span className="font-medium text-slate-700">{produit.nom}</span>
      </nav>

      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-2">
        {/* Galerie */}
        <div>
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            {imagePrincipale ? (
              <img
                src={imagePrincipale.url}
                alt={produit.nom}
                fetchPriority="high"
                className="aspect-square w-full object-cover"
              />
            ) : (
              <div className="flex aspect-square items-center justify-center bg-slate-100 text-slate-300">
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
                  className={`h-20 w-20 overflow-hidden rounded-lg border-2 transition-colors ${
                    index === imageIndex
                      ? 'border-accent-500'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <img src={image.url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Infos */}
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-accent-700">
            {produit.categorie?.nom ?? 'Fournitures'}
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
            {produit.nom}
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1">
              <Star
                size={18}
                className={
                  produit.note_moyenne > 0 ? 'fill-accent-500 text-accent-500' : 'text-slate-300'
                }
                aria-hidden="true"
              />
              <span className="font-semibold tabular-nums text-slate-800">
                {produit.note_moyenne > 0 ? produit.note_moyenne.toFixed(1) : 'Nouveau'}
              </span>
            </div>
            <span className="text-sm text-slate-500">
              {produit.nombre_avis > 0
                ? `${produit.nombre_avis} avis`
                : 'Aucun avis pour le moment'}
            </span>
            {stockStatus === 'ok' && (
              <Badge variant="success" dot>
                En stock
              </Badge>
            )}
            {stockStatus === 'faible' && (
              <Badge variant="warning" dot>
                Stock faible
              </Badge>
            )}
            {stockStatus === 'rupture' && (
              <Badge variant="error" dot>
                Rupture de stock
              </Badge>
            )}
          </div>

          <div className="mt-4 flex items-baseline gap-3">
            <p className="text-3xl font-bold tabular-nums text-slate-900">
              {formatPrix(produit.prix)}
            </p>
            {remise !== null && (
              <>
                <p className="text-lg text-slate-400 line-through">
                  {formatPrix(produit.ancien_prix)}
                </p>
                <Badge className="bg-accent-500 text-white">-{remise}%</Badge>
              </>
            )}
          </div>

          {produit.description && (
            <p className="mt-4 leading-relaxed text-slate-700">{produit.description}</p>
          )}

          <dl className="mt-6 space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm">
            {produit.marque && (
              <div className="flex items-center gap-2">
                <Tag size={16} className="shrink-0 text-primary-700" aria-hidden="true" />
                <dt className="text-slate-500">Marque :</dt>
                <dd className="font-medium text-slate-800">{produit.marque}</dd>
              </div>
            )}
            {produit.reference && (
              <div className="flex items-center gap-2">
                <Barcode size={16} className="shrink-0 text-primary-700" aria-hidden="true" />
                <dt className="text-slate-500">Référence :</dt>
                <dd className="font-medium text-slate-800">{produit.reference}</dd>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Package size={16} className="shrink-0 text-primary-700" aria-hidden="true" />
              <dt className="text-slate-500">Catégorie :</dt>
              <dd className="font-medium text-slate-800">{produit.categorie?.nom ?? 'Non classé'}</dd>
            </div>
          </dl>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <div className="flex items-center rounded-md border border-slate-300 bg-white">
              <button
                type="button"
                onClick={() => setQuantite((q) => Math.max(1, q - 1))}
                disabled={ruptureStock}
                aria-label="Diminuer la quantité"
                className="flex h-12 w-11 items-center justify-center text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Minus size={16} aria-hidden="true" />
              </button>
              <span className="w-12 text-center text-sm font-semibold tabular-nums text-slate-900">
                {quantite}
              </span>
              <button
                type="button"
                onClick={() => setQuantite((q) => Math.min(99, q + 1))}
                disabled={ruptureStock || quantite >= 99}
                aria-label="Augmenter la quantité"
                className="flex h-12 w-11 items-center justify-center text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Plus size={16} aria-hidden="true" />
              </button>
            </div>
            <Button
              variant="accent"
              size="lg"
              className="flex-1"
              onClick={handleAddToCart}
              loading={adding}
              disabled={ruptureStock}
              leftIcon={<ShoppingCart size={18} />}
            >
              Ajouter au panier
            </Button>
            <Button
              variant="primary"
              size="lg"
              className="flex-1"
              onClick={handleBuyNow}
              loading={adding}
              disabled={ruptureStock}
              leftIcon={<Zap size={18} />}
            >
              Acheter maintenant
            </Button>
          </div>
          {ruptureStock && (
            <p className="mt-2 text-xs text-error-600">
              Ce produit est en rupture de stock et ne peut pas être commandé.
            </p>
          )}

          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-600">
              <Truck size={18} className="shrink-0 text-primary-700" aria-hidden="true" />
              Livraison 24/48h
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-600">
              <RotateCcw size={18} className="shrink-0 text-primary-700" aria-hidden="true" />
              Retours 30 jours
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-600">
              <ShieldCheck size={18} className="shrink-0 text-primary-700" aria-hidden="true" />
              Paiement sécurisé
            </div>
          </div>
        </div>
      </div>

      {/* Avis clients */}
      <section className="mt-16">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Avis clients</h2>
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
          <Card className="p-6 text-center">
            <p className="text-4xl font-bold tabular-nums text-slate-900">
              {produit.note_moyenne > 0 ? produit.note_moyenne.toFixed(1) : '—'}
            </p>
            <div className="mt-2 flex items-center justify-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={18}
                  className={
                    star <= Math.round(produit.note_moyenne)
                      ? 'fill-accent-500 text-accent-500'
                      : 'text-slate-300'
                  }
                  aria-hidden="true"
                />
              ))}
            </div>
            <p className="mt-2 text-sm text-slate-500">
              {produit.nombre_avis} avis vérifiés
            </p>
          </Card>
          <Card className="p-6">
            {produit.nombre_avis > 0 ? (
              <EmptyState
                icon={MessageSquare}
                title="Les avis détaillés arrivent bientôt"
                description="La liste complète des avis clients sera disponible dans une prochaine version."
              />
            ) : (
              <EmptyState
                icon={MessageSquare}
                title="Aucun avis pour le moment"
                description="Soyez le premier à donner votre avis sur ce produit."
              />
            )}
          </Card>
        </div>
      </section>

      {/* Produits similaires */}
      {similaires.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
            Produits similaires
          </h2>
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {similaires.map((produitSimilaire) => {
              const remiseSimilaire = calculerRemise(
                produitSimilaire.prix,
                produitSimilaire.ancien_prix,
              );
              return (
                <Link
                  key={produitSimilaire.id}
                  to={`/produits/${produitSimilaire.id}`}
                  className="group"
                >
                  <Card variant="hover" className="flex h-full flex-col overflow-hidden">
                    <div className="relative aspect-[4/3] bg-slate-100">
                      {produitSimilaire.images?.[0] ? (
                        <img
                          src={produitSimilaire.images[0].url}
                          alt={produitSimilaire.nom}
                          loading="lazy"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-slate-300">
                          <Package size={32} aria-hidden="true" />
                        </div>
                      )}
                      {remiseSimilaire !== null && (
                        <Badge className="absolute left-2 top-2 bg-accent-500 text-white">
                          -{remiseSimilaire}%
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col p-4">
                      <h3 className="line-clamp-2 font-semibold text-slate-900 transition-colors group-hover:text-primary-900">
                        {produitSimilaire.nom}
                      </h3>
                      <div className="mt-2 flex items-center gap-1 text-sm">
                        <Star
                          size={14}
                          className={
                            produitSimilaire.note_moyenne > 0
                              ? 'fill-accent-500 text-accent-500'
                              : 'text-slate-300'
                          }
                          aria-hidden="true"
                        />
                        <span className="font-medium text-slate-700">
                          {produitSimilaire.note_moyenne > 0
                            ? produitSimilaire.note_moyenne.toFixed(1)
                            : 'Nouveau'}
                        </span>
                      </div>
                      <p className="mt-auto pt-3 text-lg font-bold tabular-nums text-slate-900">
                        {formatPrix(produitSimilaire.prix)}
                      </p>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}