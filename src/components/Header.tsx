import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, NavLink, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ChevronDown,
  Heart,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  Package,
  Search,
  ShoppingCart,
  User,
  X,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { usePanier } from '../hooks/usePanier';
import { useFavoris } from '../hooks/useFavoris';
import { Button } from './ui/Button';
import { Logo, Wordmark } from './Logo';
import { categoriesApi } from '../api/categories.api';
import type { Categorie } from '../types';

const searchInputClasses =
  'h-10 w-full rounded-lg border border-border-brand bg-page pl-10 pr-4 text-sm text-ink transition-[border-color,box-shadow,background-color] hover:border-line-strong focus:border-primary-600 focus:bg-white focus:outline-none focus:ring-[3px] focus:ring-primary-600/12';

const iconButtonClasses =
  'relative flex h-10 w-10 items-center justify-center rounded-lg text-ink-soft transition-colors hover:bg-page hover:text-ink';

const accountLinks = [
  { to: '/profil', label: 'Mon profil', icon: User },
  { to: '/mes-commandes', label: 'Mes commandes', icon: Package },
  { to: '/adresses', label: 'Mes adresses', icon: MapPin },
  { to: '/favoris', label: 'Mes favoris', icon: Heart },
];

/** Cache module : les catégories sont stables pendant une session. */
let categoriesCache: Categorie[] | null = null;

function CountBadge({ value }: { value: number }) {
  if (value <= 0) return null;
  return (
    <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-pill bg-primary-600 px-1 text-[10px] font-semibold leading-none text-white ring-2 ring-white">
      {value > 99 ? '99+' : value}
    </span>
  );
}

export function Header() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { nbArticles } = usePanier();
  const { favoris } = useFavoris();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [searchInput, setSearchInput] = useState(() => searchParams.get('search') ?? '');
  const [categories, setCategories] = useState<Categorie[]>(() => categoriesCache ?? []);
  const accountRef = useRef<HTMLDivElement>(null);
  const [hidden, setHidden] = useState(false);

  // Mobile : le header se masque quand on descend et réapparaît dès qu'on remonte.
  useEffect(() => {
    const mobile = window.matchMedia('(max-width: 639px)');
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      if (!mobile.matches || y < 80) {
        setHidden(false);
      } else if (Math.abs(y - lastY) > 6) {
        setHidden(y > lastY);
      }
      lastY = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (categoriesCache) return;
    let cancelled = false;
    categoriesApi
      .getAll()
      .then((res) => {
        categoriesCache = res.data.data.filter((c) => c.actif);
        if (!cancelled) setCategories(categoriesCache);
      })
      .catch(() => {
        // La barre de catégories reste masquée si l'API est indisponible
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Ferme les menus à chaque changement de page (ajustement d'état pendant le rendu,
  // recommandé par React plutôt qu'un effet)
  const pageKey = location.pathname + location.search;
  const [lastPageKey, setLastPageKey] = useState(pageKey);
  if (lastPageKey !== pageKey) {
    setLastPageKey(pageKey);
    setMenuOpen(false);
    setAccountOpen(false);
  }

  // Ferme le menu compte au clic extérieur / Échap
  useEffect(() => {
    if (!accountOpen) return;
    const onClick = (event: MouseEvent) => {
      if (!accountRef.current?.contains(event.target as Node)) setAccountOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setAccountOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [accountOpen]);

  const activeCategorie =
    location.pathname === '/catalogue' ? (searchParams.get('categorie') ?? '') : null;

  const initials = `${user?.prenom?.[0] ?? ''}${user?.nom?.[0] ?? ''}`.toUpperCase() || 'U';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = searchInput.trim();
    navigate(query ? `/catalogue?search=${encodeURIComponent(query)}` : '/catalogue');
  };

  const searchForm = (className: string) => (
    <form onSubmit={handleSearch} className={`relative ${className}`} role="search">
      <Search
        size={16}
        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted"
        aria-hidden="true"
      />
      <input
        type="search"
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        placeholder="Rechercher un produit, une marque…"
        aria-label="Rechercher un produit"
        className={searchInputClasses}
      />
    </form>
  );

  const categoryLinkClass = (active: boolean) =>
    `relative flex h-11 shrink-0 items-center whitespace-nowrap text-[13px] font-medium transition-colors after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:rounded-full after:transition-colors ${
      active
        ? 'text-primary-700 after:bg-primary-600'
        : 'text-ink-soft after:bg-transparent hover:text-ink'
    }`;

  return (
    <>
    <header
      className={`sticky top-0 z-40 border-b border-border-brand bg-white/90 backdrop-blur-md transition-transform duration-300 ${
        hidden && !menuOpen && !accountOpen ? '-translate-y-full' : 'translate-y-0'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:gap-8 lg:px-10">
        <Link to="/" aria-label="WorkStore, accueil" className="flex shrink-0 items-center gap-2">
          <Logo size={30} />
          <Wordmark size={22} />
        </Link>

        {searchForm('hidden max-w-xl flex-1 md:block')}

        <div className="ml-auto flex items-center gap-1">
          <Link
            to="/favoris"
            aria-label={`Favoris (${favoris.length})`}
            className={`${iconButtonClasses} hidden sm:flex`}
          >
            <Heart size={20} strokeWidth={1.75} aria-hidden="true" />
            <CountBadge value={favoris.length} />
          </Link>
          <Link
            to="/panier"
            aria-label={`Panier (${nbArticles} article${nbArticles > 1 ? 's' : ''})`}
            className={iconButtonClasses}
          >
            <ShoppingCart size={20} strokeWidth={1.75} aria-hidden="true" />
            <CountBadge value={nbArticles} />
          </Link>

          <span className="mx-2 hidden h-6 w-px bg-border-brand sm:block" aria-hidden="true" />

          {isAuthenticated ? (
            <div className="relative hidden sm:block" ref={accountRef}>
              <button
                type="button"
                onClick={() => setAccountOpen((open) => !open)}
                aria-expanded={accountOpen}
                aria-haspopup="menu"
                className="flex h-10 items-center gap-2 rounded-lg pl-1 pr-2 transition-colors hover:bg-page"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-600 text-xs font-semibold text-white">
                  {initials}
                </span>
                <span className="hidden max-w-[120px] truncate text-sm font-medium text-ink lg:block">
                  {user?.prenom}
                </span>
                <ChevronDown
                  size={16}
                  className={`text-ink-muted transition-transform ${accountOpen ? 'rotate-180' : ''}`}
                  aria-hidden="true"
                />
              </button>

              {accountOpen && (
                <div
                  role="menu"
                  className="absolute right-0 top-12 w-64 animate-modal-in overflow-hidden rounded-xl border border-border-brand bg-white shadow-aside"
                >
                  <div className="border-b border-border-brand px-4 py-3">
                    <p className="truncate text-sm font-semibold text-ink">
                      {user?.prenom} {user?.nom}
                    </p>
                    <p className="truncate text-xs text-ink-soft">{user?.email}</p>
                  </div>
                  <div className="p-1.5">
                    {isAdmin && (
                      <Link
                        to="/admin"
                        role="menuitem"
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-primary-700 transition-colors hover:bg-primary-50"
                      >
                        <LayoutDashboard size={16} aria-hidden="true" />
                        Administration
                      </Link>
                    )}
                    {accountLinks.map((link) => {
                      const Icon = link.icon;
                      return (
                        <Link
                          key={link.to}
                          to={link.to}
                          role="menuitem"
                          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-ink transition-colors hover:bg-page"
                        >
                          <Icon size={16} className="text-ink-muted" aria-hidden="true" />
                          {link.label}
                        </Link>
                      );
                    })}
                  </div>
                  <div className="border-t border-border-brand p-1.5">
                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-ink transition-colors hover:bg-error-50 hover:text-error-600"
                    >
                      <LogOut size={16} className="text-ink-muted" aria-hidden="true" />
                      Se déconnecter
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Connexion
                </Button>
              </Link>
              <Link to="/register">
                <Button size="sm">Créer un compte</Button>
              </Link>
            </div>
          )}

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            aria-expanded={menuOpen}
            className={`${iconButtonClasses} sm:hidden`}
          >
            {menuOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
          </button>
        </div>
      </div>

      {/* Menu mobile */}
      {menuOpen && (
        <div className="border-t border-border-brand bg-white px-4 pb-4 sm:hidden">
          {searchForm('mt-3')}
          <nav className="mt-3 flex flex-col gap-0.5">
            {isAuthenticated ? (
              <>
                <div className="mb-2 flex items-center gap-3 rounded-lg bg-page px-3 py-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-600 text-xs font-semibold text-white">
                    {initials}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-ink">
                      {user?.prenom} {user?.nom}
                    </p>
                    <p className="truncate text-xs text-ink-soft">{user?.email}</p>
                  </div>
                </div>
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-primary-700 hover:bg-primary-50"
                  >
                    <LayoutDashboard size={18} aria-hidden="true" />
                    Administration
                  </Link>
                )}
                {accountLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.to}
                      to={link.to}
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-ink hover:bg-page"
                    >
                      <Icon size={18} className="text-ink-muted" aria-hidden="true" />
                      {link.label}
                    </Link>
                  );
                })}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="mt-1 flex items-center gap-3 rounded-lg border-t border-border-brand px-3 py-2.5 text-left text-sm text-error-600 hover:bg-error-50"
                >
                  <LogOut size={18} aria-hidden="true" />
                  Se déconnecter
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link to="/login">
                  <Button variant="secondary" className="w-full">
                    Connexion
                  </Button>
                </Link>
                <Link to="/register">
                  <Button className="w-full">Créer un compte</Button>
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>

      {/* Barre catégories */}
      {categories.length > 0 && (
        <div className="border-b border-border-brand bg-white">
          <nav
            aria-label="Catégories"
            className="mx-auto flex max-w-7xl items-stretch gap-6 overflow-x-auto px-4 sm:px-6 lg:px-10"
            style={{ scrollbarWidth: 'none' }}
          >
            <NavLink to="/catalogue" className={categoryLinkClass(activeCategorie === '')}>
              Tout le catalogue
            </NavLink>
            {categories.map((categorie) => (
              <NavLink
                key={categorie.id}
                to={`/catalogue?categorie=${categorie.id}`}
                className={categoryLinkClass(activeCategorie === categorie.id)}
              >
                {categorie.nom}
              </NavLink>
            ))}
          </nav>
        </div>
      )}
    </>
  );
}
