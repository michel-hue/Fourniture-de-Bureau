import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { X, ShoppingCart, Search } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { usePanier } from '../hooks/usePanier';
import { Button } from './ui/Button';
import { Logo } from './Logo';

const desktopLinkClass = ({ isActive }: { isActive: boolean }) =>
  `text-sm font-medium transition-colors ${
    isActive
      ? 'text-primary-600'
      : 'text-slate-600 hover:text-primary-500'
  }`;

const mobileLinkClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
    isActive ? 'bg-primary-50 text-primary-600' : 'text-slate-600 hover:bg-slate-100'
  }`;

export function Header() {
  const { isAuthenticated, isAdmin, logout } = useAuth();
  const { nbArticles } = usePanier();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = searchInput.trim();
    navigate(query ? `/catalogue?search=${encodeURIComponent(query)}` : '/catalogue');
    setMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex shrink-0 items-center gap-2.5">
          <Logo size={32} className="rounded-lg" />
          <span className="text-lg font-bold text-slate-900">BureauStore</span>
        </Link>

        <form
          onSubmit={handleSearch}
          className="relative hidden flex-1 md:block md:max-w-md"
          role="search"
        >
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Rechercher un produit…"
            aria-label="Rechercher un produit"
            className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-900 shadow-xs transition-colors placeholder:text-slate-400 focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-500/10"
          />
        </form>

        <nav className="hidden items-center gap-8 lg:flex">
          <NavLink to="/" end className={desktopLinkClass}>
            Accueil
          </NavLink>
          <NavLink to="/catalogue" className={desktopLinkClass}>
            Catalogue
          </NavLink>
          {isAuthenticated && (
            <>
              <NavLink to="/profil" className={desktopLinkClass}>
                Mon Profil
              </NavLink>
              <NavLink to="/adresses" className={desktopLinkClass}>
                Mes Adresses
              </NavLink>
              <NavLink to="/mes-commandes" className={desktopLinkClass}>
                Mes commandes
              </NavLink>
            </>
          )}
          {isAdmin && (
            <NavLink to="/admin" className={desktopLinkClass}>
              Administration
            </NavLink>
          )}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to="/panier"
            aria-label={`Panier (${nbArticles} article${nbArticles > 1 ? 's' : ''})`}
            className="relative rounded-xl p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-primary-500"
          >
            <ShoppingCart size={20} aria-hidden="true" />
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary-500 px-1 text-xs font-bold text-white">
              {nbArticles}
            </span>
          </Link>
          {isAuthenticated ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleLogout}
              className="hidden sm:inline-flex"
            >
              Déconnexion
            </Button>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Link to="/login">
                <Button variant="secondary" size="sm">
                  Connexion
                </Button>
              </Link>
              <Link to="/register">
                <Button size="sm" className="bg-primary-500 hover:bg-primary-600">
                  Inscription
                </Button>
              </Link>
            </div>
          )}
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            aria-expanded={menuOpen}
            className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 rounded-xl transition-colors hover:bg-slate-100 lg:hidden"
          >
            {menuOpen ? (
              <X size={20} className="text-slate-900" />
            ) : (
              <>
                <span className="h-0.5 w-5 rounded-full bg-slate-900" />
                <span className="h-0.5 w-5 rounded-full bg-slate-900" />
                <span className="h-0.5 w-5 rounded-full bg-slate-900" />
              </>
            )}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="border-t border-slate-100 bg-white px-4 pb-4 lg:hidden">
          <form onSubmit={handleSearch} className="relative mt-3 md:hidden" role="search">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Rechercher un produit…"
              aria-label="Rechercher un produit"
              className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-900 shadow-xs transition-colors placeholder:text-slate-400 focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-500/10"
            />
          </form>
          <nav className="flex flex-col gap-1 pt-3">
            <NavLink to="/" end className={mobileLinkClass} onClick={() => setMenuOpen(false)}>
              Accueil
            </NavLink>
            <NavLink to="/catalogue" className={mobileLinkClass} onClick={() => setMenuOpen(false)}>
              Catalogue
            </NavLink>
            {isAuthenticated && (
              <>
                <NavLink
                  to="/profil"
                  className={mobileLinkClass}
                  onClick={() => setMenuOpen(false)}
                >
                  Mon Profil
                </NavLink>
                <NavLink
                  to="/adresses"
                  className={mobileLinkClass}
                  onClick={() => setMenuOpen(false)}
                >
                  Mes Adresses
                </NavLink>
                <NavLink
                  to="/mes-commandes"
                  className={mobileLinkClass}
                  onClick={() => setMenuOpen(false)}
                >
                  Mes commandes
                </NavLink>
              </>
            )}
            {isAdmin && (
              <NavLink to="/admin" className={mobileLinkClass} onClick={() => setMenuOpen(false)}>
                Administration
              </NavLink>
            )}
            <div className="mt-2 flex flex-col gap-2 border-t border-slate-100 pt-3">
              <Link
                to="/panier"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-100"
              >
                <ShoppingCart size={18} aria-hidden="true" />
                Panier
                <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-primary-500 px-1 text-xs font-bold text-white">
                  {nbArticles}
                </span>
              </Link>
              {isAuthenticated ? (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    handleLogout();
                    setMenuOpen(false);
                  }}
                >
                  Déconnexion
                </Button>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMenuOpen(false)}>
                    <Button variant="secondary" size="sm" className="w-full">
                      Connexion
                    </Button>
                  </Link>
                  <Link to="/register" onClick={() => setMenuOpen(false)}>
                    <Button size="sm" className="w-full bg-primary-500 hover:bg-primary-600">
                      Inscription
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}