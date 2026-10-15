import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { MapPin, Plus, Check, ChevronRight, ChevronLeft, Package } from 'lucide-react';
import { usePanier } from '../hooks/usePanier';
import { useToast } from '../hooks/useToast';
import { adressesApi } from '../api/adresses.api';
import { commandesApi } from '../api/commandes.api';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Alert } from '../components/ui/Alert';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { EmptyState } from '../components/ui/EmptyState';
import { Skeleton } from '../components/ui/Skeleton';
import { calculerFraisLivraison, formatPrix, prixLigne } from '../utils/panier';
import { getApiErrorMessage } from '../utils/errors';
import { usePageMeta } from '../hooks/usePageMeta';
import type { Adresse } from '../types';

type Etape = 1 | 2;

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
  pays: 'France',
  code_postal: '',
  telephone: '',
  is_principale: false,
};

const etapes = [
  { numero: 1, label: 'Adresse' },
  { numero: 2, label: 'Récapitulatif' },
  { numero: 3, label: 'Confirmation' },
];

export function Checkout() {
  usePageMeta({ title: 'Commande', path: '/checkout', noIndex: true });

  const { panier, total, loading: panierLoading, clearPanier } = usePanier();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [adresses, setAdresses] = useState<Adresse[]>([]);
  const [adressesLoading, setAdressesLoading] = useState(true);
  const [adresseId, setAdresseId] = useState('');
  const [etape, setEtape] = useState<Etape>(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<AdresseForm>(emptyAdresseForm);
  const [formError, setFormError] = useState('');
  const [savingAdresse, setSavingAdresse] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    const loadAdresses = async () => {
      setAdressesLoading(true);
      setError('');
      try {
        const res = await adressesApi.getAll();
        if (cancelled) return;
        setAdresses(res.data.data);
        const principale = res.data.data.find((adresse) => adresse.is_principale);
        if (principale) setAdresseId(principale.id);
      } catch (err) {
        if (!cancelled) setError(getApiErrorMessage(err));
      } finally {
        if (!cancelled) setAdressesLoading(false);
      }
    };

    void loadAdresses();

    return () => {
      cancelled = true;
    };
  }, []);

  const fraisLivraison = calculerFraisLivraison(total);
  const totalAvecLivraison = total + fraisLivraison;

  const handleAddAdresse = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError('');
    setSavingAdresse(true);
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
      const nouvelleAdresse = res.data.data;
      setAdresses((prev) => [...prev, nouvelleAdresse]);
      setAdresseId(nouvelleAdresse.id);
      setModalOpen(false);
      setForm(emptyAdresseForm);
      showToast('success', 'Adresse ajoutée avec succès.');
    } catch (err) {
      setFormError(getApiErrorMessage(err));
    } finally {
      setSavingAdresse(false);
    }
  };

  const handleConfirm = async () => {
    if (!adresseId) return;
    setConfirming(true);
    setError('');
    try {
      // Le body ne contient QUE l'adresse : les frais de livraison sont calculés
      // par le backend (sous-total >= 50 000 → 0, sinon 3 000) et ignorés s'ils
      // sont envoyés. `fraisLivraison` reste utilisé ci-dessus pour l'affichage
      // du récapitulatif (UX), jamais comme source de vérité pour la commande.
      const res = await commandesApi.create({
        adresse_livraison_id: adresseId,
      });
      const commande = res.data.data;
      sessionStorage.setItem(
        'lastCommande',
        JSON.stringify({ numero: commande.numero, id: commande.id }),
      );
      await clearPanier();
      navigate('/commande-confirmation', { state: { numero: commande.numero } });
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setConfirming(false);
    }
  };

  if (panierLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <Skeleton className="h-9 w-64" />
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-28 w-full rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (!confirming && (!panier || panier.details.length === 0)) {
    return <Navigate to="/panier" replace />;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">Finaliser ma commande</h1>

      {/* Stepper */}
      <ol className="mt-8 flex items-center justify-center gap-2 sm:gap-4">
        {etapes.map((etapeItem, index) => {
          const isActive = etape === etapeItem.numero;
          const isDone = etape > etapeItem.numero;
          return (
            <li key={etapeItem.numero} className="flex items-center gap-2 sm:gap-4">
              <div className="flex flex-col items-center gap-1.5">
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                    isDone
                      ? 'bg-success-500 text-white'
                      : isActive
                        ? 'bg-primary-900 text-white'
                        : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {isDone ? <Check size={16} aria-hidden="true" /> : etapeItem.numero}
                </span>
                <span
                  className={`text-xs font-medium ${
                    isActive ? 'text-primary-900' : 'text-slate-500'
                  }`}
                >
                  {etapeItem.label}
                </span>
              </div>
              {index < etapes.length - 1 && (
                <div
                  className={`h-0.5 w-8 sm:w-16 ${isDone ? 'bg-success-500' : 'bg-slate-200'}`}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>

      {error && (
        <div className="mt-6">
          <Alert type="error" message={error} onClose={() => setError('')} />
        </div>
      )}

      {/* Étape 1 — Adresse de livraison */}
      {etape === 1 && (
        <div className="mx-auto mt-8 max-w-3xl">
          {adressesLoading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {Array.from({ length: 2 }).map((_, index) => (
                <Skeleton key={index} className="h-40 rounded-xl" />
              ))}
            </div>
          ) : adresses.length === 0 ? (
            <Card>
              <EmptyState
                icon={MapPin}
                title="Aucune adresse enregistrée"
                description="Ajoutez une adresse de livraison pour continuer votre commande."
                action={
                  <Button onClick={() => setModalOpen(true)} leftIcon={<Plus size={16} />}>
                    Ajouter une adresse
                  </Button>
                }
              />
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {adresses.map((adresse) => (
                <label
                  key={adresse.id}
                  className={`cursor-pointer rounded-xl border p-4 transition-colors ${
                    adresseId === adresse.id
                      ? 'border-primary-700 bg-primary-50 ring-2 ring-primary-500/20'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="adresse"
                    value={adresse.id}
                    checked={adresseId === adresse.id}
                    onChange={() => setAdresseId(adresse.id)}
                    className="sr-only"
                  />
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-primary-800">
                        <MapPin size={16} aria-hidden="true" />
                      </span>
                      <p className="font-semibold text-slate-900">{adresse.libelle}</p>
                    </div>
                    {adresse.is_principale && <Badge variant="primary">Principale</Badge>}
                  </div>
                  <p className="mt-3 text-sm text-slate-600">
                    {adresse.adresse}
                    <br />
                    {adresse.code_postal ? `${adresse.code_postal} ` : ''}
                    {adresse.ville}, {adresse.pays}
                  </p>
                  {adresse.telephone && (
                    <p className="mt-1 text-sm text-slate-500">Tél : {adresse.telephone}</p>
                  )}
                </label>
              ))}
            </div>
          )}

          <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Link
              to="/panier"
              className="inline-flex items-center gap-1 text-sm font-medium text-primary-700 transition-colors hover:text-primary-900"
            >
              <ChevronLeft size={16} aria-hidden="true" /> Retour au panier
            </Link>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                variant="secondary"
                onClick={() => setModalOpen(true)}
                leftIcon={<Plus size={16} />}
              >
                Ajouter une adresse
              </Button>
              <Button
                onClick={() => setEtape(2)}
                disabled={!adresseId}
                rightIcon={<ChevronRight size={16} />}
              >
                Continuer
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Étape 2 — Récapitulatif */}
      {etape === 2 && panier && (
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
          <div className="space-y-4">
            {panier.details.map((detail) => {
              const produit = detail.produit;
              const sousTotal = prixLigne(detail.prix_unitaire, detail.quantite);
              return (
                <Card key={detail.id} className="flex items-center gap-4 p-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-100 text-slate-300">
                    {produit?.images?.[0] ? (
                      <img
                        src={produit.images[0].url}
                        alt={produit.nom}
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Package size={24} aria-hidden="true" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-slate-900">
                      {produit?.nom ?? 'Produit'}
                    </p>
                    <p className="mt-0.5 text-sm text-slate-500">
                      {detail.quantite} × {formatPrix(detail.prix_unitaire)}
                    </p>
                  </div>
                  <p className="shrink-0 font-semibold tabular-nums text-slate-900">
                    {formatPrix(sousTotal)}
                  </p>
                </Card>
              );
            })}
          </div>

          <div className="lg:sticky lg:top-24 lg:h-fit">
            <Card>
              <div className="border-b border-slate-200 px-6 py-4">
                <h2 className="text-lg font-semibold text-slate-900">Récapitulatif</h2>
              </div>
              <div className="space-y-3 p-6 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Sous-total</span>
                  <span className="font-semibold tabular-nums text-slate-900">
                    {formatPrix(total)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Frais de livraison</span>
                  {fraisLivraison === 0 ? (
                    <Badge variant="success">Offerts</Badge>
                  ) : (
                    <span className="font-semibold tabular-nums text-slate-900">
                      {formatPrix(fraisLivraison)}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between border-t border-slate-200 pt-3">
                  <span className="font-semibold text-slate-900">Total</span>
                  <span className="text-xl font-bold tabular-nums text-slate-900">
                    {formatPrix(totalAvecLivraison)}
                  </span>
                </div>
              </div>
              <div className="border-t border-slate-200 bg-slate-50 px-6 py-4">
                <Button
                  variant="accent"
                  size="lg"
                  className="w-full"
                  onClick={handleConfirm}
                  loading={confirming}
                >
                  Confirmer la commande
                </Button>
                <Button
                  variant="ghost"
                  className="mt-2 w-full"
                  onClick={() => setEtape(1)}
                  disabled={confirming}
                >
                  Retour
                </Button>
              </div>
            </Card>
          </div>
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
            <Button type="submit" form="adresse-form" loading={savingAdresse}>
              Enregistrer
            </Button>
          </>
        }
      >
        <form id="adresse-form" onSubmit={handleAddAdresse} className="space-y-4">
          {formError && <Alert type="error" message={formError} />}
          <Input
            label="Libellé"
            name="libelle"
            value={form.libelle}
            onChange={(e) => setForm({ ...form, libelle: e.target.value })}
            required
            placeholder="Ex : Maison, Bureau"
          />
          <Input
            label="Adresse"
            name="adresse"
            value={form.adresse}
            onChange={(e) => setForm({ ...form, adresse: e.target.value })}
            required
            placeholder="12 rue du Commerce"
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Code postal"
              name="code_postal"
              value={form.code_postal}
              onChange={(e) => setForm({ ...form, code_postal: e.target.value })}
              placeholder="75001"
            />
            <Input
              label="Ville"
              name="ville"
              value={form.ville}
              onChange={(e) => setForm({ ...form, ville: e.target.value })}
              required
              placeholder="Paris"
            />
          </div>
          <Input
            label="Pays"
            name="pays"
            value={form.pays}
            onChange={(e) => setForm({ ...form, pays: e.target.value })}
            required
            placeholder="France"
          />
          <Input
            label="Téléphone"
            name="telephone"
            value={form.telephone}
            onChange={(e) => setForm({ ...form, telephone: e.target.value })}
            placeholder="06 12 34 56 78"
          />
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={form.is_principale}
              onChange={(e) => setForm({ ...form, is_principale: e.target.checked })}
              className="h-4 w-4 rounded border-slate-300 text-primary-900 focus:ring-primary-500"
            />
            Définir comme adresse principale
          </label>
        </form>
      </Modal>
    </div>
  );
}