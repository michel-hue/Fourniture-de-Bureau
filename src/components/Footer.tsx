import { Link } from 'react-router-dom';
import { Mail, MapPin } from 'lucide-react';
import { Logo, Wordmark } from './Logo';

const columns: Array<{ title: string; links: Array<{ label: string; to?: string; href?: string }> }> = [
  {
    title: 'Boutique',
    links: [
      { label: 'Tout le catalogue', to: '/catalogue' },
      { label: 'Nouveautés', to: '/catalogue?sort=nouveautes' },
      { label: 'Mieux notés', to: '/catalogue?sort=note' },
      { label: 'Mes favoris', to: '/favoris' },
    ],
  },
  {
    title: 'Mon compte',
    links: [
      { label: 'Mon profil', to: '/profil' },
      { label: 'Mes commandes', to: '/mes-commandes' },
      { label: 'Mes adresses', to: '/adresses' },
      { label: 'Panier', to: '/panier' },
    ],
  },
  {
    title: 'Aide',
    links: [
      { label: 'Nous contacter', href: 'mailto:contact@workstore.ci' },
      { label: 'Mot de passe oublié', to: '/mot-de-passe-oublie' },
      { label: 'Conditions générales', to: '/cgu' },
      { label: 'Confidentialité', to: '/confidentialite' },
    ],
  },
];

const paiements = ['Orange Money', 'MTN MoMo', 'Wave', 'Carte bancaire'];

export function Footer() {
  return (
    <footer className="bg-ink pb-24 pt-14 text-white sm:pb-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <Link to="/" aria-label="WorkStore, accueil" className="flex items-center gap-2">
              <Logo size={30} variant="fond-fonce" />
              <Wordmark tone="light" size={22} />
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-6 text-white/60">
              Fournitures et équipements de bureau, prix en FCFA, livrés à Abidjan en 48 h.
            </p>
            <ul className="mt-5 space-y-2 text-sm text-white/60">
              <li className="flex items-center gap-2">
                <Mail size={15} className="text-primary-300" aria-hidden="true" />
                <a href="mailto:contact@workstore.ci" className="transition-colors hover:text-white">
                  contact@workstore.ci
                </a>
              </li>
              <li className="flex items-center gap-2">
                <MapPin size={15} className="text-primary-300" aria-hidden="true" />
                Abidjan, Côte d’Ivoire
              </li>
            </ul>
          </div>

          {columns.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <p className="text-xs font-medium uppercase tracking-[0.08em] text-white/40">
                {column.title}
              </p>
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    {link.to ? (
                      <Link
                        to={link.to}
                        className="text-sm text-white/70 transition-colors hover:text-white"
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <a
                        href={link.href}
                        className="text-sm text-white/70 transition-colors hover:text-white"
                      >
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-white/45">© 2026 WorkStore. Tous droits réservés.</p>
          <ul className="flex flex-wrap gap-2" aria-label="Moyens de paiement acceptés">
            {paiements.map((moyen) => (
              <li
                key={moyen}
                className="rounded-md border border-white/10 px-2 py-1 text-[11px] text-white/55"
              >
                {moyen}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
