import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Plus,
  CreditCard,
  Smartphone,
  Minus,
  Package,
  Trash2,
  Lock,
} from 'lucide-react';
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
import { Skeleton } from '../components/ui/Skeleton';
import { calculerFraisLivraison, formatPrix, prixLigne } from '../utils/panier';
import { getApiErrorMessage } from '../utils/errors';
import { usePageMeta } from '../hooks/usePageMeta';
import type { Adresse } from '../types';

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

/** Moyens de paiement proposés (spec §3.2 carte 3). */
const moyensPaiement = [
  { id: 'orange', label: 'Orange Money', hint: 'Orange CI', icon: Smartphone },
  { id: 'mtn', label: 'MTN Money', hint: 'MTN CI', icon: Smartphone },
  { id: 'wave', label: 'Wave', hint: 'Wave CI', icon: Smartphone },
  { id: 'carte', label: 'Carte bancaire', hint: 'Visa · Mastercard', icon: CreditCard },
];

/** Stepper quantité (spec §2 « Stepper qty ») : 44×44, bordure 1px `line-strong`, radius 8. */
const stepperButtonClasses =
  'flex h-11 w-11 items-center justify-center rounded-lg text-ink transition-colors hover:bg-page disabled:cursor-not-allowed disabled:opacity-40';

export function Checkout() {
  usePageMeta({ title: 'Finaliser ma commande', path: '/checkout', noIndex: true });

  const { panier, total, loading: panierLoading, clearPanier, updateItem, removeItem } = usePanier();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [adresses, setAdresses] = useState<Adresse[]>([]);
  const [adressesLoading, setAdressesLoading] = useState(true);
  const [adresseId, setAdresseId] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<AdresseForm>(emptyAdresseForm);
  const [formError, setFormError] = useState('');
  const [savingAdresse, setSavingAdresse] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState('');

  // Moyen de paiement + téléphone : purely UI (aucun endpoint de paiement
  // n'existe côté API, rien n'est envoyé au backend).
  const [moyenPaiement, setMoyenPaiement] = useState('orange');
  const [telephone, setTelephone] = useState('');

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
        if (principale) {
          setAdresseId(principale.id);
          if (principale.telephone) setTelephone(principale.telephone);
        }
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

  const handleSelectAdresse = (adresse: Adresse) => {
    setAdresseId(adresse.id);
    if (adresse.telephone) setTelephone(adresse.telephone);
  };

  /** Le contexte affiche déjà le toast d'erreur : on se contente d'absorber l'exception. */
  const handleUpdateQuantite = async (detailId: string, quantite: number) => {
    if (quantite < 1 || quantite > 99) return;
    try {
      await updateItem(detailId, quantite);
    } catch {
      // Toast déjà affiché par le contexte
    }
  };

  const handleRemoveItem = async (detailId: string) => {
    try {
      await removeItem(detailId);
    } catch {
      // Toast déjà affiché par le contexte
    }
  };

  const handleClearPanier = async () => {
    try {
      await clearPanier();
    } catch {
      // Toast déjà affiché par le contexte
    }
  };

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
      <div className="bg-page">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-10">
          <Skeleton className="h-10 w-80" />
          <div className="mt-6 grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_380px]">
            <div className="space-y-6">
              <Skeleton className="h-64 w-full rounded-xl" />
              <Skeleton className="h-56 w-full rounded-xl" />
              <Skeleton className="h-56 w-full rounded-xl" />
            </div>
            <Skeleton className="h-96 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  // `details` est utilisé pour éviter un accès à `panier.details` nullable
  // (le panier est vidé juste avant la redirection vers la confirmation).
  const details = panier?.details ?? [];

  if (!confirming && details.length === 0) {
    return <Navigate to="/panier" replace />;
  }

  return (
    <div className="bg-page">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
        {/* ── Titre (spec §3.2) ─────────────────────────────────────────── */}
        <h1 className="font-display text-[26px] font-semibold leading-tight text-ink sm:text-[32px]">
          Finaliser ma commande
        </h1>

        {error && (
          <div className="mt-6">
            <Alert type="error" message={error} onClose={() => setError('')} />
          </div>
        )}

        <div className="mt-6 grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_380px] lg:gap-8">
          {/* ══ Colonne gauche — 3 cards numérotées ═════════════════════════ */}
          <div className="flex flex-col gap-6">
            {/* ── 1. Mon panier ───────────────────────────────────────────── */}
            <Card className="overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-brand px-5 py-4 sm:px-6">
                <h2 className="font-display text-[22px] font-semibold leading-tight text-ink">
                  1. Mon panier · {details.length} article{details.length > 1 ? 's' : ''}
                </h2>
                <button
                  type="button"
                  onClick={() => void handleClearPanier()}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 transition-colors hover:text-primary-700"
                >
                  <Trash2 size={15} aria-hidden="true" />
                  Vider le panier
                </button>
              </div>

              <div>
                {details.map((detail, index) => {
                  const produit = detail.produit;
                  const sousTotal = prixLigne(detail.prix_unitaire, detail.quantite);
                  return (
                    <div
                      key={detail.id}
                      className={`flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:gap-5 sm:p-5 ${
                        index > 0 ? 'border-t border-border-brand' : ''
                      }`}
                    >
                      <Link
                        to={`/produits/${detail.produit_id}`}
                        className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-surface text-primary-300"
                      >
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
                      </Link>

                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-ink">{produit?.nom ?? 'Produit'}</p>
                        <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[13px] leading-[18px] text-ink-soft">
                          <span>
                            {detail.quantite} × {formatPrix(detail.prix_unitaire)}
                          </span>
                          {produit?.reference && (
                            <span className="font-mono text-xs text-ink-soft">
                              {produit.reference}
                            </span>
                          )}
                        </p>
                      </div>

                      <div className="flex items-center rounded-lg border border-line-strong bg-white">
                        <button
                          type="button"
                          onClick={() => void handleUpdateQuantite(detail.id, detail.quantite - 1)}
                          disabled={detail.quantite <= 1}
                          aria-label="Diminuer la quantité"
                          className={stepperButtonClasses}
                        >
                          <Minus size={16} aria-hidden="true" />
                        </button>
                        <span className="w-11 text-center font-display text-lg font-semibold tabular-nums text-ink">
                          {detail.quantite}
                        </span>
                        <button
                          type="button"
                          onClick={() => void handleUpdateQuantite(detail.id, detail.quantite + 1)}
                          disabled={detail.quantite >= 99}
                          aria-label="Augmenter la quantité"
                          className={stepperButtonClasses}
                        >
                          <Plus size={16} aria-hidden="true" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between gap-3 sm:w-[110px] sm:flex-col sm:items-end">
                        <p className="font-display text-xl font-semibold tabular-nums text-ink">
                          {formatPrix(sousTotal)}
                        </p>
                        <button
                          type="button"
                          onClick={() => void handleRemoveItem(detail.id)}
                          aria-label={`Supprimer ${produit?.nom ?? "l'article"} du panier`}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-ink-soft transition-colors hover:bg-error-50 hover:text-error-700"
                        >
                          <Trash2 size={16} aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* ── 2. Adresse de livraison ────────────────────────────────── */}
            <Card className="p-5 sm:p-6">
              <h2 className="font-display text-[22px] font-semibold leading-tight text-ink">
                2. Adresse de livraison
              </h2>

              <div className="mt-4">
                {adressesLoading ? (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {Array.from({ length: 2 }).map((_, index) => (
                      <Skeleton key={index} className="h-32 rounded-xl" />
                    ))}
                  </div>
                ) : adresses.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-border-brand bg-page px-4 py-8 text-center">
                    <MapPin size={24} className="mx-auto text-primary-600" aria-hidden="true" />
                    <p className="mt-3 font-semibold text-ink">Aucune adresse enregistrée</p>
                    <p className="mx-auto mt-1 max-w-sm text-sm text-ink-soft">
                      Ajoutez une adresse de livraison pour continuer votre commande.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {adresses.map((adresse) => {
                      const selected = adresseId === adresse.id;
                      return (
                        <label
                          key={adresse.id}
                          className={`flex cursor-pointer gap-3 rounded-xl border p-4 transition-colors ${
                            selected
                              ? 'border-primary-600 bg-surface'
                              : 'border-border-brand bg-white hover:border-primary-300'
                          }`}
                        >
                          <input
                            type="radio"
                            name="adresse"
                            value={adresse.id}
                            checked={selected}
                            onChange={() => handleSelectAdresse(adresse)}
                            className="mt-0.5 h-5 w-5 shrink-0 accent-primary-600"
                          />
                          <span className="min-w-0 flex-1">
                            <span className="flex flex-wrap items-center gap-2">
                              <span className="font-semibold text-ink">{adresse.libelle}</span>
                              {adresse.is_principale && (
                                <Badge variant="primary">Adresse principale</Badge>
                              )}
                            </span>
                            <span className="mt-1 block text-[13px] leading-[18px] text-ink-soft">
                              {adresse.adresse}
                              <br />
                              {adresse.code_postal ? `${adresse.code_postal} ` : ''}
                              {adresse.ville}, {adresse.pays}
                              {adresse.telephone ? ` · Tél. ${adresse.telephone}` : ''}
                            </span>
                          </span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              <Button
                variant="outline"
                onClick={() => setModalOpen(true)}
                className="mt-4 w-full min-h-16 sm:w-auto sm:px-6"
                leftIcon={<Plus size={16} aria-hidden="true" />}
              >
                Ajouter une adresse
              </Button>
            </Card>

            {/* ── 3. Moyen de paiement ───────────────────────────────────── */}
            <Card className="p-5 sm:p-6">
              <h2 className="font-display text-[22px] font-semibold leading-tight text-ink">
                3. Moyen de paiement
              </h2>

              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {moyensPaiement.map((moyen) => {
                  const selected = moyenPaiement === moyen.id;
                  const Icon = moyen.icon;
                  return (
                    <label
                      key={moyen.id}
                      className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-colors ${
                        selected
                          ? 'border-primary-600 bg-surface'
                          : 'border-border-brand bg-white hover:border-primary-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="moyen-paiement"
                        value={moyen.id}
                        checked={selected}
                        onChange={() => setMoyenPaiement(moyen.id)}
                        className="h-5 w-5 shrink-0 accent-primary-600"
                      />
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-primary-600">
                        <Icon size={20} aria-hidden="true" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-semibold text-ink">{moyen.label}</span>
                        <span className="block text-[13px] leading-[18px] text-ink-soft">
                          {moyen.hint}
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>

              <div className="mt-5 max-w-[320px]">
                <label
                  htmlFor="telephone-paiement"
                  className="mb-1.5 block text-sm font-semibold text-ink-soft"
                >
                  Téléphone
                </label>
                <input
                  id="telephone-paiement"
                  type="tel"
                  inputMode="tel"
                  value={telephone}
                  onChange={(event) => setTelephone(event.target.value)}
                  placeholder="07 00 00 00 00"
                  className="h-11 w-full rounded-lg border border-line-strong bg-white px-3.5 text-[15px] text-ink transition-colors placeholder:text-ink-soft focus:border-primary-600 focus:outline-none focus:ring-4 focus:ring-primary-600/10"
                />
                <p className="mt-1.5 text-xs text-ink-soft">
                  Numéro qui recevra la confirmation de paiement.
                </p>
              </div>

              <div className="mt-5">
                <Alert
                  type="info"
                  title="Paiement en ligne bientôt disponible"
                  message="Aucun moyen de paiement n'est encore débité en ligne : votre commande est enregistrée et vous payez à la livraison. Le choix du moyen de paiement sera pris en compte dès l'ouverture du service."
                />
              </div>
            </Card>
          </div>

          {/* ══ Aside récapitulatif (spec §3.2) ════════════════════════════ */}
          <div className="lg:sticky lg:top-6">
            <Card className="shadow-aside">
              <div className="border-b border-border-brand px-6 py-5">
                <h2 className="font-display text-[22px] font-semibold leading-tight text-ink">
                  Récapitulatif
                </h2>
              </div>

              <div className="space-y-5 p-6">
                {/* Code coupon — pas encore branché côté API */}
                <div>
                  <label
                    htmlFor="coupon"
                    className="mb-1.5 block text-sm font-semibold text-ink-soft"
                  >
                    Code coupon
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      id="coupon"
                      type="text"
                      placeholder="RENTREE2026"
                      disabled
                      className="h-11 w-full min-w-0 flex-1 cursor-not-allowed rounded-lg border border-line-strong bg-page px-3.5 font-mono text-sm text-ink-soft placeholder:text-ink-soft/70"
                    />
                    <Button variant="outline" disabled className="shrink-0">
                      Appliquer
                    </Button>
                  </div>
                  <p className="mt-1.5 text-xs text-ink-soft">
                    Codes promo — bientôt disponibles.
                  </p>
                </div>

                {/* Lignes `.sum` */}
                <div className="space-y-4 border-t border-border-brand pt-5">
                  <div className="flex items-center justify-between gap-4 text-[15px]">
                    <span className="text-ink-soft">Sous-total</span>
                    <span className="font-display font-semibold tabular-nums text-ink">
                      {formatPrix(total)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-4 text-[15px]">
                    <span className="text-ink-soft">Livraison à Abidjan</span>
                    {fraisLivraison === 0 ? (
                      <Badge variant="success">Offerte</Badge>
                    ) : (
                      <span className="font-display font-semibold tabular-nums text-ink">
                        {formatPrix(fraisLivraison)}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-4 border-t border-border-brand pt-4">
                    <span className="text-[18px] font-semibold text-ink">Total</span>
                    <span className="font-display text-[28px] font-semibold tabular-nums text-ink">
                      {formatPrix(totalAvecLivraison)}
                    </span>
                  </div>
                </div>

                <Button
                  variant="accent"
                  size="lg"
                  className="w-full"
                  onClick={handleConfirm}
                  loading={confirming}
                  disabled={!adresseId}
                  rightIcon={<Lock size={18} aria-hidden="true" />}
                >
                  Payer {formatPrix(totalAvecLivraison)}
                </Button>

                <p className="text-[13px] leading-[18px] text-ink-soft">
                  Livraison à Abidjan en 48 h pour toute commande payée avant 15 h. Vous recevez votre
                  numéro de commande, par exemple{' '}
                  <span className="font-mono text-ink">CMD-2026-0001</span>.
                </p>

                {!adresseId && !adressesLoading && (
                  <p className="text-[13px] leading-[18px] font-semibold text-error-700">
                    Sélectionnez une adresse de livraison pour continuer.
                  </p>
                )}

                <Link
                  to="/panier"
                  className="flex items-center justify-center gap-1 text-sm font-semibold text-primary-600 transition-colors hover:text-primary-700"
                >
                  Retour au panier
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </div>

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
