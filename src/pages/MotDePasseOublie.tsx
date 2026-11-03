import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, KeyRound, Mail } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { usePageMeta } from '../hooks/usePageMeta';

const SUPPORT_EMAIL = 'contact@workstore.ci';

/**
 * Réinitialisation du mot de passe.
 *
 * L'API n'envoie pas encore d'emails : la demande est transmise au support
 * (email pré-rempli), qui vérifie l'identité du client avant réinitialisation.
 * Aucune promesse d'email automatique n'est faite à l'utilisateur.
 */
export function MotDePasseOublie() {
  usePageMeta({
    title: 'Mot de passe oublié',
    description: 'Demandez la réinitialisation de votre mot de passe WorkStore.',
    path: '/mot-de-passe-oublie',
    noIndex: true,
  });

  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError('Saisissez une adresse email valide.');
      return;
    }
    setError(null);
    const subject = encodeURIComponent('Réinitialisation de mon mot de passe');
    const body = encodeURIComponent(
      `Bonjour,\n\nJe souhaite réinitialiser le mot de passe du compte WorkStore associé à l'adresse : ${email.trim()}\n\nMerci.`,
    );
    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;
    setSent(true);
  };

  return (
    <div className="bg-page">
      <div className="mx-auto flex max-w-md flex-col px-4 py-12 sm:py-16">
        <Card className="p-6 sm:p-8">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50 text-primary-700">
            <KeyRound size={20} aria-hidden="true" />
          </span>
          <h1 className="mt-5 font-display text-2xl font-semibold text-ink">
            Mot de passe oublié ?
          </h1>
          <p className="mt-2 text-sm leading-6 text-ink-soft">
            Indiquez l’email de votre compte. Notre équipe vérifie votre identité puis vous
            renvoie un lien de réinitialisation sous 24 h ouvrées.
          </p>

          {sent ? (
            <div className="mt-6 rounded-lg border border-primary-200 bg-primary-50 p-4 text-sm leading-6 text-primary-800">
              Votre messagerie s’est ouverte avec une demande pré-remplie. Si rien ne s’est
              ouvert, écrivez-nous directement à{' '}
              <a href={`mailto:${SUPPORT_EMAIL}`} className="font-semibold underline">
                {SUPPORT_EMAIL}
              </a>
              .
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
              <Input
                label="Email du compte"
                type="email"
                name="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vous@exemple.ci"
                error={error ?? undefined}
                leftIcon={<Mail size={16} aria-hidden="true" />}
                required
              />
              <Button type="submit" className="w-full">
                Demander la réinitialisation
              </Button>
            </form>
          )}

          <Link
            to="/login"
            className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-primary-700 hover:text-primary-600"
          >
            <ArrowLeft size={15} aria-hidden="true" /> Retour à la connexion
          </Link>
        </Card>
      </div>
    </div>
  );
}
