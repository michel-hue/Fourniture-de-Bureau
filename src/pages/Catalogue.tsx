import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Search,
  Star,
  SlidersHorizontal,
  X,
  PackageSearch,
  ChevronDown,
  Package,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Alert } from '../components/ui/Alert';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Pagination } from '../components/ui/Pagination';
import { EmptyState } from '../components/ui/EmptyState';
import { SkeletonCard } from '../components/ui/Skeleton';
import { produitsApi } from '../api/produits.api';
import { categoriesApi } from '../api/categories.api';
import { usePageMeta } from '../hooks/usePageMeta';
import { formatPrix, calculerRemise } from '../utils/panier';
import type { Categorie, Produit } from '../types';

const PAGE_SIZE = 8;

const sortOptions = [
  { value: '', label: 'Pertinence' },
  { value: 'prix_asc', label: 'Prix croissant' },
  { value: 'prix_desc', label: 'Prix décroissant' },
  { value: 'nouveautes', label: 'Nouveautés' },
  { value: 'note', label: 'Meilleures notes' },
];

export function Catalogue() {
  usePageMeta({
    title: 'Catalogue - Fournitures de bureau',
    description:
      'Parcourez notre catalogue de fournitures de bureau : papeterie, écriture, mobilier, informatique. Prix compétitifs et livraison rapide.',
    path: '/catalogue',
  });

  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') ?? '';

  const [produits, setProduits] = useState<Produit[]>([]);
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState(initialSearch);
  const [searchInput, setSearchInput] = useState(initialSearch);
  const [categorieId, setCategorieId] = useState('');
  const [prixMin, setPrixMin] = useState('');
  const [prixMax, setPrixMax] = useState('');
  const [sort, setSort] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadCategories = async () => {
      try {
        const res = await categoriesApi.getAll();
        if (!cancelled) setCategories(res.data.data);
      } catch {
        // Le filtre catégorie restera vide si le chargement échoue
      }
    };

    loadCategories();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadProduits = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await produitsApi.getAll({
          page,
          limit: PAGE_SIZE,
          search: search || undefined,
          categorie_id: categorieId || undefined,
          prix_min: prixMin ? parseFloat(prixMin) : undefined,
          prix_max: prixMax ? parseFloat(prixMax) : undefined,
          sort: sort || undefined,
        });
        if (cancelled) return;
        setProduits(res.data.data);
        setTotal(res.data.meta.total);
        setTotalPages(res.data.meta.totalPages);
      } catch {
        if (!cancelled) {
          setError('Impossible de charger le catalogue. Vérifiez que le serveur est démarré.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadProduits();

    return () => {
      cancelled = true;
    };
  }, [page, search, categorieId, prixMin, prixMax, sort]);

  const handleFiltersSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
    setFiltersOpen(false);
  };

  const resetFilters = () => {
    setSearchInput('');
    setSearch('');
    setCategorieId('');
    setPrixMin('');
    setPrixMax('');
    setSort('');
    setPage(1);
  };

  const sidebar = (
    <Card className="p-5">
      <form onSubmit={handleFiltersSubmit} className="space-y-5">
        <div>
          <label htmlFor="recherche" className="mb-1.5 block text-sm font-medium text-slate-700">
            Recherche
          </label>
          <div className="relative">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              id="recherche"
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Rechercher un produit…"
              className="h-10 w-full rounded-md border border-slate-300 bg-white pl-9 pr-3 text-sm text-slate-900 shadow-xs transition-colors placeholder:text-slate-400 focus:border-primary-600 focus:outline-none focus:ring-4 focus:ring-primary-500/10"
            />
          </div>
        </div>

        <div>
          <p className="mb-1.5 text-sm font-medium text-slate-700">Catégories</p>
          <div className="space-y-2">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
              <input
                type="radio"
                name="categorie"
                checked={categorieId === ''}
                onChange={() => {
                  setCategorieId('');
                  setPage(1);
                }}
                className="h-4 w-4 rounded-full border-slate-300 text-primary-900 focus:ring-primary-500"
              />
              Toutes les catégories
            </label>
            {categories.map((categorie) => (
              <label
                key={categorie.id}
                className="flex cursor-pointer items-center gap-2 text-sm text-slate-600"
              >
                <input
                  type="radio"
                  name="categorie"
                  checked={categorieId === categorie.id}
                  onChange={() => {
                    setCategorieId(categorie.id);
                    setPage(1);
                  }}
                  className="h-4 w-4 rounded-full border-slate-300 text-primary-900 focus:ring-primary-500"
                />
                {categorie.nom}
              </label>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-1.5 text-sm font-medium text-slate-700">Prix</p>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              min="0"
              step="0.01"
              value={prixMin}
              onChange={(e) => setPrixMin(e.target.value)}
              placeholder="Min"
              aria-label="Prix minimum"
              className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 shadow-xs transition-colors placeholder:text-slate-400 focus:border-primary-600 focus:outline-none focus:ring-4 focus:ring-primary-500/10"
            />
            <input
              type="number"
              min="0"
              step="0.01"
              value={prixMax}
              onChange={(e) => setPrixMax(e.target.value)}
              placeholder="Max"
              aria-label="Prix maximum"
              className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 shadow-xs transition-colors placeholder:text-slate-400 focus:border-primary-600 focus:outline-none focus:ring-4 focus:ring-primary-500/10"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button type="submit" className="flex-1">
            Appliquer
          </Button>
          <Button type="button" variant="ghost" onClick={resetFilters}>
            Réinitialiser
          </Button>
        </div>
      </form>
    </Card>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[280px_1fr]">
        {/* Sidebar desktop */}
        <aside className="hidden lg:sticky lg:top-24 lg:block lg:h-fit">{sidebar}</aside>

        {/* Drawer filtres mobile */}
        {filtersOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 animate-fade-in bg-slate-900/50 backdrop-blur-sm"
              onClick={() => setFiltersOpen(false)}
              aria-hidden="true"
            />
            <div className="absolute inset-y-0 left-0 w-80 max-w-[85vw] animate-modal-in overflow-y-auto bg-white p-4 shadow-2xl">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Filtres</h2>
                <button
                  type="button"
                  onClick={() => setFiltersOpen(false)}
                  aria-label="Fermer les filtres"
                  className="rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                >
                  <X size={20} />
                </button>
              </div>
              {sidebar}
            </div>
          </div>
        )}

        {/* Zone résultats */}
        <div>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
                Catalogue
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                {total} produit{total > 1 ? 's' : ''}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setFiltersOpen(true)}
                className="lg:hidden"
                leftIcon={<SlidersHorizontal size={16} />}
              >
                Filtres
              </Button>
              <div className="relative">
                <select
                  value={sort}
                  onChange={(e) => {
                    setSort(e.target.value);
                    setPage(1);
                  }}
                  aria-label="Trier les produits"
                  className="h-10 w-full appearance-none rounded-md border border-slate-300 bg-white pl-3 pr-9 text-sm text-slate-700 shadow-xs transition-colors focus:border-primary-600 focus:outline-none focus:ring-4 focus:ring-primary-500/10"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={16}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  aria-hidden="true"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-4">
              <Alert type="error" message={error} />
            </div>
          )}

          {loading ? (
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <SkeletonCard key={index} />
              ))}
            </div>
          ) : produits.length === 0 ? (
            <EmptyState
              icon={PackageSearch}
              title="Aucun produit trouvé"
              description="Essayez de modifier vos filtres ou de réinitialiser la recherche."
              action={
                <Button variant="secondary" onClick={resetFilters}>
                  Réinitialiser les filtres
                </Button>
              }
            />
          ) : (
            <>
              <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {produits.map((produit) => {
                  const remise = calculerRemise(produit.prix, produit.ancien_prix);
                  return (
                    <Link key={produit.id} to={`/produits/${produit.id}`} className="group">
                      <Card variant="hover" className="flex h-full flex-col overflow-hidden">
                        <div className="relative aspect-[4/3] bg-slate-100">
                          {produit.images?.[0] ? (
                            <img
                              src={produit.images[0].url}
                              alt={produit.nom}
                              loading="lazy"
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-slate-300">
                              <Package size={40} aria-hidden="true" />
                            </div>
                          )}
                          {remise !== null && (
                            <Badge className="absolute left-2 top-2 bg-accent-500 text-white">
                              -{remise}%
                            </Badge>
                          )}
                        </div>
                        <div className="flex flex-1 flex-col p-4">
                          <p className="text-xs font-medium uppercase tracking-wider text-accent-700">
                            {produit.categorie?.nom ?? 'Fournitures'}
                          </p>
                          <h2 className="mt-1 line-clamp-2 font-semibold text-slate-900 transition-colors group-hover:text-primary-900">
                            {produit.nom}
                          </h2>
                          <div className="mt-2 flex items-center gap-1 text-sm">
                            <Star
                              size={14}
                              className={
                                produit.note_moyenne > 0
                                  ? 'fill-accent-500 text-accent-500'
                                  : 'text-slate-300'
                              }
                              aria-hidden="true"
                            />
                            <span className="font-medium text-slate-700">
                              {produit.note_moyenne > 0
                                ? produit.note_moyenne.toFixed(1)
                                : 'Nouveau'}
                            </span>
                            {produit.nombre_avis > 0 && (
                              <span className="text-slate-400">({produit.nombre_avis} avis)</span>
                            )}
                          </div>
                          <div className="mt-auto pt-3">
                            {remise !== null && (
                              <p className="text-sm text-slate-400 line-through">
                                {formatPrix(produit.ancien_prix)}
                              </p>
                            )}
                            <p className="text-lg font-bold tabular-nums text-slate-900">
                              {formatPrix(produit.prix)}
                            </p>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  );
                })}
              </div>

              <div className="mt-10">
                <Pagination
                  page={page}
                  totalPages={totalPages}
                  total={total}
                  onPageChange={setPage}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}