import { NavLink } from 'react-router-dom';
import { Home, Grid3X3, Heart, User } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

/**
 * Bottom tab bar mobile (spec §2 « Tabbar mobile » / §3.4).
 *
 * 4 onglets — Accueil / Catalogue / Favoris / Compte — affichés uniquement
 * sous 640px (`sm:hidden`). « Favoris » pointe vers la page d'attente
 * (`/favoris`) : la liste de favoris n'est pas encore implémentée côté API.
 */
const tabClass = ({ isActive }: { isActive: boolean }) =>
  `flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 px-1 py-1.5 text-[11px] font-semibold transition-colors ${
    isActive ? 'text-primary-600' : 'text-ink-soft'
  }`;

export function BottomTabBar() {
  const { isAuthenticated } = useAuth();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-border-brand bg-white pb-[max(0.5rem,env(safe-area-inset-bottom))] sm:hidden"
      aria-label="Navigation mobile"
    >
      <div className="mx-auto flex max-w-7xl items-stretch">
        <NavLink to="/" end className={tabClass}>
          <Home size={24} strokeWidth={1.8} aria-hidden="true" />
          <span>Accueil</span>
        </NavLink>
        <NavLink to="/catalogue" className={tabClass}>
          <Grid3X3 size={24} strokeWidth={1.8} aria-hidden="true" />
          <span>Catalogue</span>
        </NavLink>
        <NavLink to="/favoris" className={tabClass}>
          <Heart size={24} strokeWidth={1.8} aria-hidden="true" />
          <span>Favoris</span>
        </NavLink>
        <NavLink to={isAuthenticated ? '/profil' : '/login'} className={tabClass}>
          <User size={24} strokeWidth={1.8} aria-hidden="true" />
          <span>Compte</span>
        </NavLink>
      </div>
    </nav>
  );
}
