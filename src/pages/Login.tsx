import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Mail, Lock, Truck, ShieldCheck, RotateCcw, Info } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Alert } from '../components/ui/Alert';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Logo } from '../components/Logo';
import { usePageMeta } from '../hooks/usePageMeta';

interface LoginState {
  from?: string;
  message?: string;
}

export function Login() {
  usePageMeta({
    title: 'Connexion',
    description: 'Connectez-vous à votre compte BureauStore pour suivre vos commandes.',
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
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Colonne gauche — marque */}
      <div className="hidden bg-gradient-to-br from-primary-950 via-primary-900 to-primary-800 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="flex items-center gap-2.5">
          <Logo size={40} className="rounded-lg" />
          <span className="text-xl font-bold">BureauStore</span>
        </div>
        <div>
          <h2 className="text-3xl font-semibold tracking-tight">Votre bureau, simplifié.</h2>
          <p className="mt-3 max-w-md leading-relaxed text-slate-300">
            Commandez vos fournitures en quelques clics et suivez vos commandes où que vous soyez.
          </p>
          <ul className="mt-8 space-y-4">
            <li className="flex items-center gap-3 text-sm text-slate-200">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-accent-400">
                <Truck size={18} aria-hidden="true" />
              </span>
              Livraison rapide en 24/48h
            </li>
            <li className="flex items-center gap-3 text-sm text-slate-200">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-accent-400">
                <ShieldCheck size={18} aria-hidden="true" />
              </span>
              Paiement 100% sécurisé
            </li>
            <li className="flex items-center gap-3 text-sm text-slate-200">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-accent-400">
                <RotateCcw size={18} aria-hidden="true" />
              </span>
              Retours gratuits sous 30 jours
            </li>
          </ul>
        </div>
        <p className="text-xs text-slate-400">© 2026 BureauStore. Tous droits réservés.</p>
      </div>

      {/* Colonne droite — formulaire */}
      <div className="flex items-center justify-center bg-slate-50 px-4 py-16">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <Logo size={36} className="rounded-lg" />
            <span className="text-lg font-bold text-primary-900">BureauStore</span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
            Connexion
          </h1>
          <p className="mt-2 text-sm text-slate-500">Accédez à votre compte BureauStore.</p>

          {state?.message && (
            <div className="mt-4 flex items-start gap-3 rounded-xl border border-primary-200 bg-primary-50 p-4">
              <Info size={18} className="mt-0.5 shrink-0 text-primary-700" aria-hidden="true" />
              <p className="text-sm text-primary-900">{state.message}</p>
            </div>
          )}

          {error && (
            <div className="mt-4">
              <Alert type="error" message={error} onClose={() => setError(null)} />
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-4" noValidate>
            <Input
              label="Email"
              type="email"
              name="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="vous@exemple.fr"
              autoComplete="email"
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
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 text-primary-900 focus:ring-primary-500"
                />
                Se souvenir de moi
              </label>
              <Link
                to="/login"
                className="text-sm font-medium text-primary-700 transition-colors hover:text-primary-900"
              >
                Mot de passe oublié ?
              </Link>
            </div>
            <Button type="submit" className="w-full" loading={loading}>
              {loading ? 'Connexion en cours…' : 'Se connecter'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            Pas encore de compte ?{' '}
            <Link
              to="/register"
              className="font-medium text-primary-700 transition-colors hover:text-primary-900"
            >
              S'inscrire
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}