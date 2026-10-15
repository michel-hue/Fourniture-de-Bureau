import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ArrowRight } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Alert } from '../components/ui/Alert';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { usePageMeta } from '../hooks/usePageMeta';

export function Profile() {
  usePageMeta({ title: 'Mon profil', path: '/profil', noIndex: true });

  const { user } = useAuth();
  const [form, setForm] = useState({
    nom: user?.nom ?? '',
    prenom: user?.prenom ?? '',
    email: user?.email ?? '',
    telephone: user?.telephone ?? '',
  });
  const [success, setSuccess] = useState<string | null>(null);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSuccess('Vos informations ont été enregistrées.');
  };

  const initials = `${user?.prenom?.[0] ?? ''}${user?.nom?.[0] ?? ''}`.toUpperCase();

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">Mon profil</h1>
      <p className="mt-2 text-sm text-slate-500">Gérez vos informations personnelles.</p>

      <Card className="mt-8">
        <div className="flex items-center gap-4 border-b border-slate-200 px-6 py-5">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary-100 text-lg font-bold text-primary-800">
            {initials || 'U'}
          </span>
          <div className="min-w-0">
            <p className="truncate font-semibold text-slate-900">
              {user?.prenom} {user?.nom}
            </p>
            <p className="truncate text-sm text-slate-500">{user?.email}</p>
          </div>
        </div>
        <div className="p-6">
          {success && (
            <div className="mb-6">
              <Alert type="success" message={success} onClose={() => setSuccess(null)} />
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input label="Nom" name="nom" value={form.nom} onChange={handleChange} required />
              <Input
                label="Prénom"
                name="prenom"
                value={form.prenom}
                onChange={handleChange}
                required
              />
            </div>
            <Input
              label="Email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
            />
            <Input
              label="Téléphone"
              type="tel"
              name="telephone"
              value={form.telephone}
              onChange={handleChange}
              placeholder="06 12 34 56 78"
            />
            <Button type="submit">Enregistrer</Button>
          </form>
        </div>
      </Card>

      <Card className="mt-6 flex items-center justify-between gap-4 p-6">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-700">
            <MapPin size={20} aria-hidden="true" />
          </span>
          <div>
            <h2 className="font-semibold text-slate-900">Mes adresses</h2>
            <p className="mt-0.5 text-sm text-slate-500">
              Gérez vos adresses de livraison et de facturation.
            </p>
          </div>
        </div>
        <Link
          to="/adresses"
          className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-primary-700 transition-colors hover:text-primary-900"
        >
          Gérer <ArrowRight size={14} aria-hidden="true" />
        </Link>
      </Card>
    </div>
  );
}