import { useEffect, useMemo, useState } from 'react';
import { Eye } from 'lucide-react';
import { commandesApi } from '../../api/commandes.api';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Alert } from '../../components/ui/Alert';
import { Modal } from '../../components/ui/Modal';
import { Select } from '../../components/ui/Select';
import { Table, type TableColumn } from '../../components/ui/Table';
import { useToast } from '../../hooks/useToast';
import { usePageMeta } from '../../hooks/usePageMeta';
import { formatPrix, toNumber } from '../../utils/panier';
import { getApiErrorMessage } from '../../utils/errors';
import type { Commande } from '../../types';

type StatutVariant =
  | 'neutral'
  | 'primary'
  | 'accent'
  | 'success'
  | 'warning'
  | 'error'
  | 'info';

const statutsDisponibles = [
  'EN_ATTENTE',
  'PAYEE',
  'EN_PREPARATION',
  'EXPEDIEE',
  'LIVREE',
  'ANNULEE',
] as const;

const statutConfig: Record<string, { variant: StatutVariant; label: string }> = {
  EN_ATTENTE: { variant: 'warning', label: 'En attente' },
  PAYEE: { variant: 'info', label: 'Payée' },
  EN_PREPARATION: { variant: 'info', label: 'En préparation' },
  EXPEDIEE: { variant: 'primary', label: 'Expédiée' },
  LIVREE: { variant: 'success', label: 'Livrée' },
  ANNULEE: { variant: 'error', label: 'Annulée' },
};

function getStatutConfig(statut: string): { variant: StatutVariant; label: string } {
  return statutConfig[statut] ?? { variant: 'neutral', label: statut };
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function AdminCommandes() {
  usePageMeta({ title: 'Gestion des commandes', path: '/admin/commandes', noIndex: true });

  const { showToast } = useToast();
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  const [filtreStatut, setFiltreStatut] = useState('TOUS');
  const [selected, setSelected] = useState<Commande | null>(null);
  const [nouveauStatut, setNouveauStatut] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadCommandes = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await commandesApi.getAllAdmin();
        if (cancelled) return;
        setCommandes(res.data.data);
      } catch (err) {
        if (!cancelled) setError(getApiErrorMessage(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void loadCommandes();

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const commandesFiltrees = useMemo(() => {
    if (filtreStatut === 'TOUS') return commandes;
    return commandes.filter((commande) => commande.statut === filtreStatut);
  }, [commandes, filtreStatut]);

  const openDetail = (commande: Commande) => {
    setSelected(commande);
    setNouveauStatut(commande.statut);
  };

  const handleChangeStatut = async () => {
    if (!selected || !nouveauStatut || nouveauStatut === selected.statut) return;
    setSaving(true);
    try {
      await commandesApi.updateStatut(selected.id, nouveauStatut);
      showToast('success', `Commande ${selected.numero} : statut mis à jour.`);
      setSelected(null);
      setReloadKey((key) => key + 1);
    } catch (err) {
      showToast('error', getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const columns: TableColumn<Commande>[] = [
    {
      key: 'numero',
      label: 'Commande',
      render: (commande) => (
        <span className="font-medium text-slate-900">{commande.numero}</span>
      ),
    },
    {
      key: 'client',
      label: 'Client',
      render: (commande) => (
        <div>
          <p className="font-medium text-slate-900">
            {commande.user?.prenom} {commande.user?.nom}
          </p>
          <p className="text-xs text-slate-500">{commande.user?.email}</p>
        </div>
      ),
    },
    {
      key: 'date',
      label: 'Date',
      render: (commande) => <span className="text-slate-600">{formatDate(commande.created_at)}</span>,
    },
    {
      key: 'montant',
      label: 'Montant',
      render: (commande) => (
        <span className="font-semibold tabular-nums text-slate-900">
          {formatPrix(commande.montant_total)}
        </span>
      ),
    },
    {
      key: 'statut',
      label: 'Statut',
      render: (commande) => {
        const statut = getStatutConfig(commande.statut);
        return (
          <Badge variant={statut.variant} dot>
            {statut.label}
          </Badge>
        );
      },
    },
    {
      key: 'actions',
      label: '',
      render: (commande) => (
        <button
          type="button"
          onClick={() => openDetail(commande)}
          aria-label={`Voir la commande ${commande.numero}`}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:border-primary-500 hover:text-primary-700"
        >
          <Eye size={14} aria-hidden="true" />
          Détail
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Commandes</h2>
          <p className="mt-1 text-sm text-slate-500">
            Suivez et mettez à jour le statut des commandes de vos clients.
          </p>
        </div>
        <div className="w-full sm:w-56">
          <Select
            aria-label="Filtrer par statut"
            value={filtreStatut}
            onChange={(e) => setFiltreStatut(e.target.value)}
          >
            <option value="TOUS">Tous les statuts</option>
            {statutsDisponibles.map((statut) => (
              <option key={statut} value={statut}>
                {statutConfig[statut].label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      <Card className="p-0">
        <Table
          columns={columns}
          data={commandesFiltrees}
          loading={loading}
          emptyMessage="Aucune commande trouvée"
        />
      </Card>

      {/* Modal — Détail de la commande */}
      <Modal
        isOpen={selected !== null}
        onClose={() => setSelected(null)}
        title={selected ? `Commande ${selected.numero}` : ''}
      >
        {selected && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Badge variant={getStatutConfig(selected.statut).variant} dot>
                {getStatutConfig(selected.statut).label}
              </Badge>
              <span className="text-sm text-slate-500">{formatDate(selected.created_at)}</span>
            </div>

            {/* Client */}
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm">
              <p className="font-semibold text-slate-900">
                {selected.user?.prenom} {selected.user?.nom}
              </p>
              <p className="mt-0.5 text-slate-600">{selected.user?.email}</p>
            </div>

            {/* Articles */}
            <div className="space-y-3">
              {selected.details.map((detail) => (
                <div key={detail.id} className="flex items-center justify-between gap-3 text-sm">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-slate-900">{detail.nom_produit}</p>
                    <p className="text-xs text-slate-500">
                      {detail.quantite} × {formatPrix(detail.prix_unitaire)}
                    </p>
                  </div>
                  <p className="shrink-0 font-semibold tabular-nums text-slate-900">
                    {formatPrix(detail.sous_total)}
                  </p>
                </div>
              ))}
            </div>

            {/* Totaux */}
            <div className="space-y-2 border-t border-slate-200 pt-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Sous-total</span>
                <span className="font-medium tabular-nums text-slate-900">
                  {formatPrix(toNumber(selected.montant_total) - toNumber(selected.frais_livraison))}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Frais de livraison</span>
                <span className="font-medium tabular-nums text-slate-900">
                  {formatPrix(selected.frais_livraison)}
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-slate-200 pt-2">
                <span className="font-semibold text-slate-900">Total</span>
                <span className="text-lg font-bold tabular-nums text-slate-900">
                  {formatPrix(selected.montant_total)}
                </span>
              </div>
            </div>

            {/* Adresse de livraison */}
            {selected.adresse_livraison && (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm">
                <p className="font-semibold text-slate-900">
                  {selected.adresse_livraison.libelle}
                </p>
                <p className="mt-1 text-slate-600">
                  {selected.adresse_livraison.adresse}
                  <br />
                  {selected.adresse_livraison.code_postal
                    ? `${selected.adresse_livraison.code_postal} `
                    : ''}
                  {selected.adresse_livraison.ville}, {selected.adresse_livraison.pays}
                </p>
              </div>
            )}

            {/* Changement de statut */}
            <div className="border-t border-slate-200 pt-4">
              <Select
                label="Changer le statut"
                value={nouveauStatut}
                onChange={(e) => setNouveauStatut(e.target.value)}
              >
                {statutsDisponibles.map((statut) => (
                  <option key={statut} value={statut}>
                    {statutConfig[statut].label}
                  </option>
                ))}
              </Select>
              <button
                type="button"
                onClick={handleChangeStatut}
                disabled={saving || nouveauStatut === selected.statut}
                className="mt-4 inline-flex h-10 w-full items-center justify-center rounded-xl bg-primary-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? 'Mise à jour…' : 'Mettre à jour le statut'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}