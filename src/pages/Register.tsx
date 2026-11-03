import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Wallet, Truck, CreditCard } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Alert } from '../components/ui/Alert';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
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

export function Register() {
  usePageMeta({
    title: 'Inscription',
    description: 'Créez votre compte WorkStore et commandez vos fournitures de bureau en ligne.',
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
    <div className="bg-page">
      <div className="mx-auto grid max-w-7xl items-center gap-6 px-4 py-8 sm:px-6 sm:py-12 lg:grid-cols-2 lg:gap-12 lg:px-10 lg:py-16">
        {/* ── Panneau marque (navy) ─────────────────────────────────────── */}
        <aside className="hidden flex-col justify-center gap-10 rounded-2xl bg-ink p-10 text-white lg:flex lg:order-2">
          <div>
            <h2 className="font-display text-[28px] font-semibold leading-tight">
              Rejoignez WorkStore.
            </h2>
            <p className="mt-3 max-w-md text-sm leading-6 text-primary-100">
              Créez votre compte en quelques secondes et profitez de tous nos avantages.
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
        <div className="w-full max-w-md justify-self-center lg:order-1 lg:justify-self-start">
          <h1 className="font-display text-[26px] font-semibold leading-tight text-ink sm:text-[32px]">
            Inscription
          </h1>
          <p className="mt-2 text-sm text-ink-soft">Créez votre compte WorkStore.</p>

          {apiError && (
            <div className="mt-5">
              <Alert type="error" message={apiError} onClose={() => setApiError(null)} />
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-7 space-y-4" noValidate>
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
              placeholder="vous@exemple.ci"
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
              placeholder="07 00 00 00 00"
            />
            <Button type="submit" className="w-full" loading={loading}>
              {loading ? 'Inscription en cours…' : "S'inscrire"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-ink-soft">
            Déjà un compte ?{' '}
            <Link
              to="/login"
              className="font-semibold text-primary-600 transition-colors hover:text-primary-700"
            >
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
