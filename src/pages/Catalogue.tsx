import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X, PackageSearch, ChevronDown } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Alert } from '../components/ui/Alert';
import { Button } from '../components/ui/Button';
import { Pagination } from '../components/ui/Pagination';
import { EmptyState } from '../components/ui/EmptyState';
import { SkeletonCard } from '../components/ui/Skeleton';
import { ProductCard } from '../components/ProductCard';
import { produitsApi } from '../api/produits.api';
import { categoriesApi } from '../api/categories.api';
import { usePageMeta } from '../hooks/usePageMeta';
import type { Categorie, Produit } from '../types';

const PAGE_SIZE = 12;

const sortOptions = [
  { value: '', label: 'Pertinence' },
  { value: 'prix_asc', label: 'Prix croissant' },
  { value: 'prix_desc', label: 'Prix décroissant' },
  { value: 'nouveautes', label: 'Nouveautés' },
  { value: 'note', label: 'Meilleures notes' },
];

/** Champ « .fld » (spec §Inputs) : h 44 · bordure 1px `line-strong` · radius 8. */
const fieldClasses =
  'h-10 w-full rounded-lg border border-line-strong bg-white px-3.5 text-sm text-ink shadow-sm transition-[border-color,box-shadow] hover:border-ink-muted focus:border-primary-600 focus:outline-none focus:ring-[3px] focus:ring-primary-600/12';

export function Catalogue() {
  usePageMeta({
    title: 'Catalogue - Fournitures de bureau',
    description:
      'Parcourez notre catalogue de fournitures de bureau : papeterie, écriture, mobilier, informatique. Prix compétitifs et livraison rapide.',
    path: '/catalogue',
  });

  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') ?? '';
  // Pris en charge depuis la barre de catégories du Header (`/catalogue?categorie=<id>`)
  const initialCategorie = searchParams.get('categorie') ?? '';

  const [produits, setProduits] = useState<Produit[]>([]);
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState(initialSearch);
  const [searchInput, setSearchInput] = useState(initialSearch);
  const [categorieId, setCategorieId] = useState(initialCategorie);
  const [prixMin, setPrixMin] = useState('');
  const [prixMax, setPrixMax] = useState('');
  const [sort, setSort] = useState(searchParams.get('sort') ?? '');
  const [filtersOpen, setFiltersOpen] = useState(false);

  // La barre de catégories du Header pointe vers /catalogue?categorie=<id> :
  // on resynchronise le filtre local quand le paramètre d'URL change
  // (même route = composant conservé, l'initial state ne se rejoue pas).
  const lastParams = useRef({
    categorie: initialCategorie,
    search: initialSearch,
    sort: searchParams.get('sort') ?? '',
  });
  useEffect(() => {
    const next = {
      categorie: searchParams.get('categorie') ?? '',
      search: searchParams.get('search') ?? '',
      sort: searchParams.get('sort') ?? '',
    };
    const prev = lastParams.current;
    if (prev.categorie === next.categorie && prev.search === next.search && prev.sort === next.sort) {
      return;
    }
    lastParams.current = next;
    setCategorieId(next.categorie);
    setSearch(next.search);
    setSearchInput(next.search);
    setSort(next.sort);
    setPage(1);
  }, [searchParams]);

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

  const selectCategorie = (id: string) => {
    setCategorieId(id);
    setPage(1);
  };

  const chipClasses = (active: boolean) =>
    `inline-flex h-9 shrink-0 items-center rounded-pill border px-3.5 text-[13px] font-medium transition-colors ${
      active
        ? 'border-ink bg-ink text-white'
        : 'border-border-brand bg-white text-ink-soft hover:border-line-strong hover:text-ink'
    }`;

  const sidebar = (
    <Card className="p-5">
      <form onSubmit={handleFiltersSubmit} className="space-y-5">
        <div>
          <label htmlFor="recherche" className="mb-1.5 block text-sm font-semibold text-ink-soft">
            Recherche
          </label>
          <div className="relative">
            <Search
              size={16}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft"
              aria-hidden="true"
            />
            <input
              id="recherche"
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Rechercher un produit…"
              className={`${fieldClasses} pl-10`}
            />
          </div>
        </div>

        <div>
          <p className="mb-1.5 text-sm font-semibold text-ink-soft">Prix (FCFA)</p>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              min="0"
              step="0.01"
              value={prixMin}
              onChange={(e) => setPrixMin(e.target.value)}
              placeholder="Min"
              aria-label="Prix minimum"
              className={fieldClasses}
            />
            <input
              type="number"
              min="0"
              step="0.01"
              value={prixMax}
              onChange={(e) => setPrixMax(e.target.value)}
              placeholder="Max"
              aria-label="Prix maximum"
              className={fieldClasses}
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
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-8 sm:px-6 sm:pb-16 lg:px-10">
      {/* ── En-tête de page ─────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-[26px] font-semibold leading-tight text-ink sm:text-[32px]">
            {search
              ? `Résultats pour « ${search} »`
              : (categories.find((c) => c.id === categorieId)?.nom ?? 'Catalogue')}
          </h1>
          <p className="mt-1 text-sm text-ink-soft">
            {loading ? 'Chargement…' : `${total} produit${total > 1 ? 's' : ''}`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            onClick={() => setFiltersOpen(true)}
            className="lg:hidden"
            leftIcon={<SlidersHorizontal size={16} aria-hidden="true" />}
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
              className={`${fieldClasses} w-full appearance-none pr-9 sm:w-auto sm:min-w-[200px]`}
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown
              size={16}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft"
              aria-hidden="true"
            />
          </div>
        </div>
      </div>

      {/* ── Chips catégories (scrollables sur mobile) ───────────────────── */}
      {categories.length > 0 && (
        <nav
          aria-label="Filtrer par catégorie"
          className="mt-5 flex gap-2 overflow-x-auto sm:flex-wrap sm:overflow-visible"
          style={{ scrollbarWidth: 'none' }}
        >
          <button
            type="button"
            onClick={() => selectCategorie('')}
            aria-pressed={categorieId === ''}
            className={chipClasses(categorieId === '')}
          >
            Toutes les catégories
          </button>
          {categories.map((categorie) => (
            <button
              key={categorie.id}
              type="button"
              onClick={() => selectCategorie(categorie.id)}
              aria-pressed={categorieId === categorie.id}
              className={chipClasses(categorieId === categorie.id)}
            >
              {categorie.nom}
            </button>
          ))}
        </nav>
      )}

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr] lg:gap-8">
        {/* Sidebar desktop */}
        <aside className="hidden lg:sticky lg:top-24 lg:block lg:h-fit">{sidebar}</aside>

        {/* Drawer filtres mobile */}
        {filtersOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 animate-fade-in bg-ink/50 backdrop-blur-sm"
              onClick={() => setFiltersOpen(false)}
              aria-hidden="true"
            />
            <div className="absolute inset-y-0 left-0 w-80 max-w-[85vw] animate-modal-in overflow-y-auto bg-page p-4 shadow-aside">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-display text-lg font-semibold text-ink">Filtres</h2>
                <button
                  type="button"
                  onClick={() => setFiltersOpen(false)}
                  aria-label="Fermer les filtres"
                  className="rounded-lg p-1 text-ink-soft transition-colors hover:bg-surface hover:text-ink"
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
          {error && (
            <div className="mb-6">
              <Alert type="error" message={error} />
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3">
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
              <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3">
                {produits.map((produit) => (
                  <ProductCard key={produit.id} produit={produit} eyebrow="categorie" />
                ))}
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
