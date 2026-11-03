import { NavLink, Outlet } from 'react-router-dom';
import { Heart, LayoutDashboard, MapPin, Package, User } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const links = [
  { to: '/profil', label: 'Profil', icon: User },
  { to: '/mes-commandes', label: 'Commandes', icon: Package },
  { to: '/adresses', label: 'Adresses', icon: MapPin },
  { to: '/favoris', label: 'Favoris', icon: Heart },
];

/**
 * Espace client : navigation latérale (desktop) / onglets défilants (mobile)
 * partagée par Profil, Commandes, Adresses et Favoris — même largeur, même
 * en-tête, même rythme vertical sur toutes ces pages.
 */
export function AccountLayout() {
  const { user, isAdmin } = useAuth();
  const initials = `${user?.prenom?.[0] ?? ''}${user?.nom?.[0] ?? ''}`.toUpperCase() || 'U';

  return (
    <div className="bg-page">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 pb-24 sm:px-6 sm:py-10 lg:grid-cols-[240px_1fr] lg:gap-10 lg:px-10">
        <aside className="min-w-0 lg:sticky lg:top-24 lg:self-start">
          {user && (
            <div className="hidden items-center gap-3 px-1 pb-5 lg:flex">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-600 text-sm font-semibold text-white">
                {initials}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink">
                  {user.prenom} {user.nom}
                </p>
                <p className="truncate text-xs text-ink-soft">{user.email}</p>
              </div>
            </div>
          )}

          <nav
            aria-label="Mon compte"
            className="-mx-4 flex gap-1 overflow-x-auto px-4 sm:mx-0 sm:px-0 lg:flex-col"
            style={{ scrollbarWidth: 'none' }}
          >
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `flex shrink-0 items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                      isActive
                        ? 'bg-white font-medium text-primary-700 shadow-sm ring-1 ring-border-brand'
                        : 'text-ink-soft hover:bg-white/70 hover:text-ink'
                    }`
                  }
                >
                  <Icon size={17} aria-hidden="true" />
                  {link.label}
                </NavLink>
              );
            })}
            {isAdmin && (
              <NavLink
                to="/admin"
                className="flex shrink-0 items-center gap-3 rounded-lg px-3 py-2 text-sm text-ink-soft transition-colors hover:bg-white/70 hover:text-ink lg:mt-3 lg:border-t lg:border-border-brand lg:pt-4"
              >
                <LayoutDashboard size={17} aria-hidden="true" />
                Administration
              </NavLink>
            )}
          </nav>
        </aside>

        <div className="min-w-0">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
