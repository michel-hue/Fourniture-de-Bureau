import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { MapPin, Plus, Trash2, Phone } from 'lucide-react';
import { adressesApi } from '../api/adresses.api';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Alert } from '../components/ui/Alert';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { EmptyState } from '../components/ui/EmptyState';
import { Skeleton } from '../components/ui/Skeleton';
import { useToast } from '../hooks/useToast';
import { getApiErrorMessage } from '../utils/errors';
import { usePageMeta } from '../hooks/usePageMeta';
import type { Adresse } from '../types';
import { PageHeader } from '../components/PageHeader';

interface AdresseForm {
  libelle: string;
  adresse: string;
  ville: string;
  pays: string;
  code_postal: string;
  telephone: string;
  is_principale: boolean;
}

const emptyAdresseForm: AdresseForm = {
  libelle: '',
  adresse: '',
  ville: '',
  pays: 'Côte d\'Ivoire',
  code_postal: '',
  telephone: '',
  is_principale: false,
};

export function Addresses() {
  usePageMeta({ title: 'Mes adresses', path: '/adresses', noIndex: true });

  const { showToast } = useToast();
  const [adresses, setAdresses] = useState<Adresse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<AdresseForm>(emptyAdresseForm);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadAdresses = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await adressesApi.getAll();
        if (!cancelled) setAdresses(res.data.data);
      } catch (err) {
        if (!cancelled) setError(getApiErrorMessage(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void loadAdresses();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError('');
    setSaving(true);
    try {
      const res = await adressesApi.create({
        libelle: form.libelle.trim(),
        adresse: form.adresse.trim(),
        ville: form.ville.trim(),
        pays: form.pays.trim(),
        code_postal: form.code_postal.trim() || undefined,
        telephone: form.telephone.trim() || undefined,
        is_principale: form.is_principale,
      });
      setAdresses((prev) => [...prev, res.data.data]);
      setModalOpen(false);
      setForm(emptyAdresseForm);
      showToast('success', 'Adresse ajoutée avec succès.');
    } catch (err) {
      setFormError(getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (adresse: Adresse) => {
    if (confirmDeleteId !== adresse.id) {
      setConfirmDeleteId(adresse.id);
      return;
    }
    try {
      await adressesApi.remove(adresse.id);
      setAdresses((prev) => prev.filter((item) => item.id !== adresse.id));
      showToast('success', 'Adresse supprimée.');
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setConfirmDeleteId(null);
    }
  };

  return (
    <div>
      <PageHeader
        title="Mes adresses"
        description="Gérez vos adresses de livraison et de facturation."
        actions={
          <Button leftIcon={<Plus size={16} />} onClick={() => setModalOpen(true)}>
            Ajouter une adresse
          </Button>
        }
      />

      {error && (
        <div className="mt-6">
          <Alert type="error" message={error} onClose={() => setError('')} />
        </div>
      )}

      {loading ? (
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {Array.from({ length: 2 }).map((_, index) => (
            <Skeleton key={index} className="h-40 rounded-xl" />
          ))}
        </div>
      ) : adresses.length === 0 ? (
        <Card className="mt-8">
          <EmptyState
            icon={MapPin}
            title="Aucune adresse enregistrée"
            description="Ajoutez une adresse pour faciliter vos prochaines commandes."
            action={
              <Button variant="secondary" leftIcon={<Plus size={16} />} onClick={() => setModalOpen(true)}>
                Ajouter une adresse
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {adresses.map((adresse) => (
            <Card key={adresse.id} className="flex flex-col p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2.5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface text-primary-600">
                    <MapPin size={20} aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-display text-base font-semibold text-ink">
                      {adresse.libelle}
                    </p>
                    {adresse.is_principale && (
                      <Badge variant="primary" className="mt-1">
                        Principale
                      </Badge>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => void handleDelete(adresse)}
                  onBlur={() => setConfirmDeleteId(null)}
                  aria-label={`Supprimer l'adresse ${adresse.libelle}`}
                  className={`inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold transition-colors ${
                    confirmDeleteId === adresse.id
                      ? 'bg-error-50 text-error-700'
                      : 'text-ink-soft hover:bg-error-50 hover:text-error-700'
                  }`}
                >
                  <Trash2 size={15} aria-hidden="true" />
                  {confirmDeleteId === adresse.id ? 'Confirmer' : ''}
                </button>
              </div>

              <p className="mt-4 text-sm leading-6 text-ink-soft">
                {adresse.adresse}
                <br />
                {adresse.code_postal ? `${adresse.code_postal} ` : ''}
                {adresse.ville}, {adresse.pays}
              </p>

              {adresse.telephone && (
                <p className="mt-2 flex items-center gap-1.5 text-[13px] leading-[18px] text-ink-soft">
                  <Phone size={14} aria-hidden="true" />
                  {adresse.telephone}
                </p>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Modal — Ajouter une adresse */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Ajouter une adresse"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" form="adresse-form" loading={saving}>
              Enregistrer
            </Button>
          </>
        }
      >
        <form id="adresse-form" onSubmit={handleCreate} className="space-y-4">
          {formError && <Alert type="error" message={formError} />}
          <Input
            label="Libellé"
            name="libelle"
            value={form.libelle}
            onChange={(e) => setForm({ ...form, libelle: e.target.value })}
            required
            placeholder="Ex : Bureau, Maison"
          />
          <Input
            label="Adresse"
            name="adresse"
            value={form.adresse}
            onChange={(e) => setForm({ ...form, adresse: e.target.value })}
            required
            placeholder="Rue des Galions, Cocody"
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Code postal"
              name="code_postal"
              value={form.code_postal}
              onChange={(e) => setForm({ ...form, code_postal: e.target.value })}
              placeholder="BP 1000"
            />
            <Input
              label="Ville"
              name="ville"
              value={form.ville}
              onChange={(e) => setForm({ ...form, ville: e.target.value })}
              required
              placeholder="Abidjan"
            />
          </div>
          <Input
            label="Pays"
            name="pays"
            value={form.pays}
            onChange={(e) => setForm({ ...form, pays: e.target.value })}
            required
            placeholder="Côte d'Ivoire"
          />
          <Input
            label="Téléphone"
            name="telephone"
            value={form.telephone}
            onChange={(e) => setForm({ ...form, telephone: e.target.value })}
            placeholder="07 00 00 00 00"
          />
          <label className="flex items-center gap-2 text-sm font-semibold text-ink">
            <input
              type="checkbox"
              checked={form.is_principale}
              onChange={(e) => setForm({ ...form, is_principale: e.target.checked })}
              className="h-4 w-4 rounded border-line-strong accent-primary-600"
            />
            Définir comme adresse principale
          </label>
        </form>
      </Modal>
    </div>
  );
}
