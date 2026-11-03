import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Mail, Lock, Wallet, Truck, CreditCard } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Alert } from '../components/ui/Alert';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { usePageMeta } from '../hooks/usePageMeta';

interface LoginState {
  from?: string;
  message?: string;
}

/** Signatures de marque (spec §4). */
const brandPillars = [
  {
    icon: Wallet,
    title: 'Prix en FCFA',
    description: 'Prix et stocks toujours à jour.',
  },
  {
    icon: Truck,
    title: 'Livraison à Abidjan en 48 h',
    description: 'Suivi de commande en temps réel.',
  },
  {
    icon: CreditCard,
    title: 'Paiement local',
    description: 'Orange Money · MTN Money · Wave · Carte',
  },
];

export function Login() {
  usePageMeta({
    title: 'Connexion',
    description: 'Connectez-vous à votre compte WorkStore pour suivre vos commandes.',
    path: '/login',
    noIndex: true,
  });

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LoginState | null;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      navigate(state?.from ?? '/', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-page">
      <div className="mx-auto grid max-w-7xl items-center gap-6 px-4 py-8 sm:px-6 sm:py-12 lg:grid-cols-2 lg:gap-12 lg:px-10 lg:py-16">
        {/* ── Panneau marque (navy) ─────────────────────────────────────── */}
        <aside className="hidden flex-col justify-center gap-10 rounded-2xl bg-ink p-10 text-white lg:flex">
          <div>
            <h2 className="font-display text-[28px] font-semibold leading-tight">
              Votre bureau, simplifié.
            </h2>
            <p className="mt-3 max-w-md text-sm leading-6 text-primary-100">
              Commandez vos fournitures en quelques clics et suivez vos commandes où que vous
              soyez.
            </p>

            <ul className="mt-8 space-y-5">
              {brandPillars.map((pillar) => {
                const Icon = pillar.icon;
                return (
                  <li key={pillar.title} className="flex items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-accent-400">
                      <Icon size={20} aria-hidden="true" />
                    </span>
                    <span>
                      <span className="block font-display text-base font-semibold">{pillar.title}</span>
                      <span className="block text-sm text-primary-100">{pillar.description}</span>
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>

        </aside>

        {/* ── Formulaire ────────────────────────────────────────────────── */}
        <div className="w-full max-w-md justify-self-center lg:justify-self-start">
          <h1 className="font-display text-[26px] font-semibold leading-tight text-ink sm:text-[32px]">
            Connexion
          </h1>
          <p className="mt-2 text-sm text-ink-soft">Accédez à votre compte WorkStore.</p>

          {state?.message && (
            <div className="mt-5">
              <Alert type="info" message={state.message} />
            </div>
          )}

          {error && (
            <div className="mt-5">
              <Alert type="error" message={error} onClose={() => setError(null)} />
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-7 space-y-4" noValidate>
            <Input
              label="Email"
              type="email"
              name="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="vous@exemple.ci"
              autoComplete="username"
              required
              leftIcon={<Mail size={16} aria-hidden="true" />}
            />
            <Input
              label="Mot de passe"
              type="password"
              name="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              required
              leftIcon={<Lock size={16} aria-hidden="true" />}
            />
            <div className="-mt-1 flex justify-end">
              <Link
                to="/mot-de-passe-oublie"
                className="text-[13px] font-medium text-primary-700 transition-colors hover:text-primary-600"
              >
                Mot de passe oublié ?
              </Link>
            </div>
            <Button type="submit" className="w-full" loading={loading}>
              {loading ? 'Connexion en cours…' : 'Se connecter'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-ink-soft">
            Pas encore de compte ?{' '}
            <Link
              to="/register"
              className="font-semibold text-primary-600 transition-colors hover:text-primary-700"
            >
              S&apos;inscrire
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
