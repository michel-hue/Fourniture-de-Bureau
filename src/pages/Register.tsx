import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Truck, ShieldCheck, RotateCcw, User } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Alert } from '../components/ui/Alert';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Logo } from '../components/Logo';
import { usePageMeta } from '../hooks/usePageMeta';

interface FormErrors {
  nom?: string;
  prenom?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

const initialForm = {
  nom: '',
  prenom: '',
  email: '',
  password: '',
  confirmPassword: '',
  telephone: '',
};

export function Register() {
  usePageMeta({
    title: 'Inscription',
    description: 'Créez votre compte BureauStore et commandez vos fournitures de bureau en ligne.',
    path: '/register',
    noIndex: true,
  });

  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validate = (): boolean => {
    const next: FormErrors = {};

    if (!form.nom.trim()) {
      next.nom = 'Le nom est requis.';
    }
    if (!form.prenom.trim()) {
      next.prenom = 'Le prénom est requis.';
    }
    if (!form.email.trim()) {
      next.email = "L'email est requis.";
    } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      next.email = "L'email n'est pas valide.";
    }
    if (!form.password) {
      next.password = 'Le mot de passe est requis.';
    } else if (form.password.length < 6) {
      next.password = 'Le mot de passe doit contenir au moins 6 caractères.';
    }
    if (form.confirmPassword !== form.password) {
      next.confirmPassword = 'Les mots de passe ne correspondent pas.';
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setApiError(null);
    if (!validate()) {
      return;
    }
    setLoading(true);
    try {
      await register({
        nom: form.nom.trim(),
        prenom: form.prenom.trim(),
        email: form.email.trim(),
        password: form.password,
        telephone: form.telephone.trim() || undefined,
      });
      navigate('/login');
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Une erreur est survenue.');
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
          <h2 className="text-3xl font-semibold tracking-tight">Rejoignez BureauStore.</h2>
          <p className="mt-3 max-w-md leading-relaxed text-slate-300">
            Créez votre compte en quelques secondes et profitez de tous nos avantages.
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
            Inscription
          </h1>
          <p className="mt-2 text-sm text-slate-500">Créez votre compte BureauStore.</p>

          {apiError && (
            <div className="mt-4">
              <Alert type="error" message={apiError} onClose={() => setApiError(null)} />
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-4" noValidate>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="Nom"
                name="nom"
                value={form.nom}
                onChange={handleChange}
                placeholder="Dupont"
                error={errors.nom}
                required
                leftIcon={<User size={16} aria-hidden="true" />}
              />
              <Input
                label="Prénom"
                name="prenom"
                value={form.prenom}
                onChange={handleChange}
                placeholder="Marie"
                error={errors.prenom}
                required
              />
            </div>
            <Input
              label="Email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="vous@exemple.fr"
              error={errors.email}
              autoComplete="email"
              required
              leftIcon={<Mail size={16} aria-hidden="true" />}
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="Mot de passe"
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                error={errors.password}
                autoComplete="new-password"
                required
                leftIcon={<Lock size={16} aria-hidden="true" />}
              />
              <Input
                label="Confirmer le mot de passe"
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                error={errors.confirmPassword}
                autoComplete="new-password"
                required
              />
            </div>
            <Input
              label="Téléphone (optionnel)"
              type="tel"
              name="telephone"
              value={form.telephone}
              onChange={handleChange}
              placeholder="06 12 34 56 78"
            />
            <Button type="submit" className="w-full" loading={loading}>
              {loading ? 'Inscription en cours…' : "S'inscrire"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            Déjà un compte ?{' '}
            <Link
              to="/login"
              className="font-medium text-primary-700 transition-colors hover:text-primary-900"
            >
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}