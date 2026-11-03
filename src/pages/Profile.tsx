import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { KeyRound, Mail, Phone } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { Alert } from '../components/ui/Alert';
import { Button } from '../components/ui/Button';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { PageHeader } from '../components/PageHeader';
import { usePageMeta } from '../hooks/usePageMeta';

export function Profile() {
  usePageMeta({ title: 'Mon profil', path: '/profil', noIndex: true });

  const { user, updateProfile, changePassword } = useAuth();
  const { showToast } = useToast();

  const [form, setForm] = useState({
    nom: user?.nom ?? '',
    prenom: user?.prenom ?? '',
    telephone: user?.telephone ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  const [pwd, setPwd] = useState({ ancien: '', nouveau: '', confirmation: '' });
  const [pwdSaving, setPwdSaving] = useState(false);
  const [pwdError, setPwdError] = useState<string | null>(null);

  const dirty =
    form.nom !== (user?.nom ?? '') ||
    form.prenom !== (user?.prenom ?? '') ||
    form.telephone !== (user?.telephone ?? '');

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setProfileError(null);
    if (!form.nom.trim() || !form.prenom.trim()) {
      setProfileError('Le nom et le prénom sont obligatoires.');
      return;
    }
    setSaving(true);
    try {
      await updateProfile({
        nom: form.nom.trim(),
        prenom: form.prenom.trim(),
        telephone: form.telephone.trim(),
      });
      showToast('success', 'Vos informations ont été enregistrées.');
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : 'Une erreur est survenue.');
    } finally {
      setSaving(false);
    }
  };

  const handlePassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPwdError(null);
    if (pwd.nouveau.length < 8) {
      setPwdError('Le nouveau mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    if (pwd.nouveau !== pwd.confirmation) {
      setPwdError('Les deux mots de passe ne correspondent pas.');
      return;
    }
    setPwdSaving(true);
    try {
      await changePassword(pwd.ancien, pwd.nouveau);
      setPwd({ ancien: '', nouveau: '', confirmation: '' });
      showToast('success', 'Votre mot de passe a été modifié.');
    } catch (err) {
      setPwdError(err instanceof Error ? err.message : 'Une erreur est survenue.');
    } finally {
      setPwdSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Mon profil" description="Gérez vos informations personnelles et votre sécurité." />

      <Card>
        <CardHeader>
          <h2 className="font-display text-base font-semibold text-ink">Informations personnelles</h2>
          <p className="mt-0.5 text-sm text-ink-soft">
            Ces informations figurent sur vos bons de livraison.
          </p>
        </CardHeader>
        <CardBody>
          {profileError && (
            <div className="mb-5">
              <Alert type="error" message={profileError} onClose={() => setProfileError(null)} />
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input label="Prénom" name="prenom" value={form.prenom} onChange={handleChange} required />
              <Input label="Nom" name="nom" value={form.nom} onChange={handleChange} required />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="Email"
                type="email"
                name="email"
                value={user?.email ?? ''}
                disabled
                helper="L’email sert d’identifiant et ne peut pas être modifié."
                leftIcon={<Mail size={16} aria-hidden="true" />}
              />
              <Input
                label="Téléphone"
                type="tel"
                name="telephone"
                value={form.telephone}
                onChange={handleChange}
                placeholder="07 00 00 00 00"
                leftIcon={<Phone size={16} aria-hidden="true" />}
              />
            </div>
            <div className="flex justify-end border-t border-border-brand pt-4">
              <Button type="submit" loading={saving} disabled={!dirty}>
                Enregistrer les modifications
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="font-display text-base font-semibold text-ink">Mot de passe</h2>
          <p className="mt-0.5 text-sm text-ink-soft">
            Utilisez au moins 8 caractères, idéalement avec chiffres et symboles.
          </p>
        </CardHeader>
        <CardBody>
          {pwdError && (
            <div className="mb-5">
              <Alert type="error" message={pwdError} onClose={() => setPwdError(null)} />
            </div>
          )}
          <form onSubmit={handlePassword} className="space-y-4" noValidate>
            <Input
              label="Mot de passe actuel"
              type="password"
              name="ancien"
              autoComplete="current-password"
              value={pwd.ancien}
              onChange={(e) => setPwd((p) => ({ ...p, ancien: e.target.value }))}
              leftIcon={<KeyRound size={16} aria-hidden="true" />}
              required
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="Nouveau mot de passe"
                type="password"
                name="nouveau"
                autoComplete="new-password"
                value={pwd.nouveau}
                onChange={(e) => setPwd((p) => ({ ...p, nouveau: e.target.value }))}
                required
              />
              <Input
                label="Confirmation"
                type="password"
                name="confirmation"
                autoComplete="new-password"
                value={pwd.confirmation}
                onChange={(e) => setPwd((p) => ({ ...p, confirmation: e.target.value }))}
                required
              />
            </div>
            <div className="flex justify-end border-t border-border-brand pt-4">
              <Button
                type="submit"
                variant="secondary"
                loading={pwdSaving}
                disabled={!pwd.ancien || !pwd.nouveau || !pwd.confirmation}
              >
                Changer le mot de passe
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
