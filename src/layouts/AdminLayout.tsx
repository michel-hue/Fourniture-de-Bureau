import { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Tags,
  Boxes,
  ShoppingCart,
  Users,
  LogOut,
  Menu,
  X,
  ArrowLeft,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Logo, Wordmark } from '../components/Logo';

const adminLinks = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/produits', label: 'Produits', icon: Package },
  { to: '/admin/categories', label: 'Catégories', icon: Tags },
  { to: '/admin/stocks', label: 'Stocks', icon: Boxes },
  { to: '/admin/commandes', label: 'Commandes', icon: ShoppingCart },
  { to: '/admin/utilisateurs', label: 'Utilisateurs', icon: Users },
];

export function AdminLayout() {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const initials = `${user?.prenom?.[0] ?? ''}${user?.nom?.[0] ?? ''}`.toUpperCase();

  const sidebarContent = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center gap-2.5 px-5">
        <Logo size={28} variant="fond-fonce" />
        <Wordmark size={19} tone="light" />
        <span className="ml-auto rounded-pill bg-white/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.08em] text-white/60">
          Admin
        </span>
      </div>
      <p className="px-5 pb-2 pt-4 text-[11px] font-medium uppercase tracking-[0.08em] text-white/40">
        Gestion
      </p>
      <nav className="flex-1 space-y-0.5 px-3">
        {adminLinks.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `relative flex h-10 items-center gap-3 rounded-lg px-3 text-sm transition-colors ${
                  isActive
                    ? 'bg-white/10 font-medium text-white before:absolute before:left-0 before:top-2 before:h-6 before:w-0.5 before:rounded-full before:bg-primary-400'
                    : 'text-white/65 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    size={17}
                    className={isActive ? 'text-primary-300' : 'text-white/45'}
                    aria-hidden="true"
                  />
                  {link.label}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>
      <div className="border-t border-white/10 px-4 py-4">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-600 text-xs font-semibold text-white">
            {initials || 'U'}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-medium text-white">
              {user?.prenom} {user?.nom}
            </p>
            <p className="truncate text-xs text-white/50">{user?.email}</p>
          </div>
          <button
            type="button"
            onClick={logout}
            aria-label="Se déconnecter"
            className="shrink-0 rounded-lg p-2 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
          >
            <LogOut size={16} aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-page">
      {/* Sidebar desktop (spec : 240px, navy #0A2540, item actif teal) */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 bg-ink text-white md:block">
        {sidebarContent}
      </aside>

      {/* Drawer mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 animate-fade-in bg-ink/50 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
          <aside className="absolute inset-y-0 left-0 w-60 animate-modal-in bg-ink text-white shadow-aside">
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              aria-label="Fermer le menu"
              className="absolute right-3 top-5 z-10 rounded-lg p-1 text-white/60 transition-colors hover:text-white"
            >
              <X size={20} />
            </button>
            {sidebarContent}
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border-brand bg-white/90 px-4 backdrop-blur-md sm:px-6 lg:px-10">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Ouvrir le menu"
              className="rounded-lg p-2 text-ink-soft transition-colors hover:bg-surface hover:text-ink md:hidden"
            >
              <Menu size={20} aria-hidden="true" />
            </button>
            <p className="hidden text-sm font-medium text-ink-soft sm:block">Back-office WorkStore</p>
          </div>
          <Link
            to="/"
            className="inline-flex items-center gap-1 text-sm font-semibold text-ink-soft transition-colors hover:text-primary-600"
          >
            <ArrowLeft size={14} aria-hidden="true" /> Retour à la boutique
          </Link>
        </header>
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
