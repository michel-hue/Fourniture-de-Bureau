import { Link, Outlet, useLocation } from 'react-router-dom';
import { ArrowLeft, Lock } from 'lucide-react';
import { Logo, Wordmark } from '../components/Logo';

/** Pages du tunnel de paiement : on y affiche « Paiement sécurisé ». */
const CHECKOUT_PATHS = ['/checkout', '/commande-confirmation'];

/**
 * Layout « focus » pour les pages où l'utilisateur n'a qu'une chose à faire :
 * connexion, inscription, mot de passe oublié, paiement.
 *
 * Header minimal (logo + retour), sans recherche, catégories, panier ni
 * barre d'onglets mobile : moins de distractions, pas de sortie accidentelle
 * du tunnel de commande. Le header n'est pas collant : la page est courte.
 */
export function FocusLayout() {
  const { pathname } = useLocation();
  const checkout = CHECKOUT_PATHS.includes(pathname);

  return (
    <div className="flex min-h-screen flex-col bg-page">
      <header className="border-b border-border-brand bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-10">
          <Link to="/" aria-label="WorkStore, accueil" className="flex shrink-0 items-center gap-2">
            <Logo size={30} />
            <Wordmark size={22} />
          </Link>

          {checkout ? (
            <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-soft">
              <Lock size={14} className="text-primary-600" aria-hidden="true" />
              Paiement sécurisé
            </span>
          ) : (
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft transition-colors hover:text-ink"
            >
              <ArrowLeft size={15} aria-hidden="true" />
              <span className="hidden sm:inline">Retour à la boutique</span>
              <span className="sm:hidden">Boutique</span>
            </Link>
          )}
        </div>
      </header>

      <main className="flex flex-1 flex-col justify-center">
        <Outlet />
      </main>

      <footer className="border-t border-border-brand bg-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-ink-soft sm:flex-row sm:px-6 lg:px-10">
          <p>© 2026 WorkStore</p>
          <nav aria-label="Liens utiles" className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1">
            <a href="mailto:contact@workstore.ci" className="hover:text-ink">
              Besoin d’aide ?
            </a>
            <Link to="/cgu" className="hover:text-ink">
              Conditions générales
            </Link>
            <Link to="/confidentialite" className="hover:text-ink">
              Confidentialité
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
