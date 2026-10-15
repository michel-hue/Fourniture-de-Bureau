import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { Logo } from './Logo';

export function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [honeypot, setHoneypot] = useState('');

  const handleSubscribe = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Anti-spam : si le champ caché est rempli, c'est un bot — on ignore.
    if (honeypot) return;
    if (!email.trim()) return;
    setSubscribed(true);
    setEmail('');
  };

  const navLinks = [
    { to: '/catalogue', label: 'Catalogue' },
    { to: '/catalogue', label: 'Papeterie' },
    { to: '/catalogue', label: 'Mobilier' },
    { to: '/catalogue', label: 'Informatique' },
  ];

  const legalLinks = [
    { to: '/cgu', label: 'CGU' },
    { to: '/confidentialite', label: 'Confidentialité' },
    { to: '/cgu', label: 'Mentions légales' },
  ];

  return (
    <footer className="bg-white pb-20 pt-4">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-primary-950 px-8 py-12 sm:px-12 lg:px-16">
          <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1.4fr] lg:items-start">
            {/* Marque */}
            <div>
              <Link to="/" className="flex items-center gap-2.5">
                <Logo size={36} className="rounded-lg" />
                <span className="text-lg font-bold text-white">BureauStore</span>
              </Link>
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-400">
                Votre fournisseur de confiance en fournitures de bureau, livré en 24/48h partout en
                Côte d'Ivoire.
              </p>
            </div>

            {/* Navigation */}
            <nav aria-label="Navigation pied de page">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Boutique
              </p>
              <ul className="mt-4 space-y-3">
                {navLinks.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-sm text-slate-300 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Newsletter */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Newsletter
              </p>
              <p className="mt-4 text-sm text-slate-400">
                Recevez nos offres exclusives et les nouveautés.
              </p>
              <form onSubmit={handleSubscribe} className="mt-4">
                <div className="flex flex-col gap-2 sm:flex-row">
                  <div className="relative flex-1">
                    <Mail
                      size={16}
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                      aria-hidden="true"
                    />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Votre email"
                      aria-label="Votre adresse email"
                      className="h-10 w-full rounded-xl bg-white/10 pl-9 pr-3 text-sm text-white transition-colors placeholder:text-slate-500 focus:bg-white/15 focus:outline-none focus:ring-2 focus:ring-primary-400/60"
                    />
                  </div>
                  <button
                    type="submit"
                    className="h-10 whitespace-nowrap rounded-xl bg-primary-500 px-5 text-sm font-semibold text-white transition-colors hover:bg-primary-400"
                  >
                    S'abonner
                  </button>
                </div>
                <input
                  type="text"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                  aria-hidden="true"
                  tabIndex={-1}
                  autoComplete="off"
                  className="absolute -left-[9999px] h-0 w-0 opacity-0"
                />
                {subscribed && (
                  <p className="mt-3 text-sm text-success-500">
                    Merci ! Votre inscription a bien été prise en compte.
                  </p>
                )}
              </form>
            </div>
          </div>

          {/* Bas de page */}
          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-primary-900 pt-6 sm:flex-row">
            <p className="text-xs text-slate-500">© 2026 BureauStore. Tous droits réservés.</p>
            <ul className="flex items-center gap-6">
              {legalLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-xs text-slate-500 transition-colors hover:text-slate-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}