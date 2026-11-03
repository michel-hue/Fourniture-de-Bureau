import { useEffect, useMemo, useState } from 'react';
import { Eye } from 'lucide-react';
import { commandesApi } from '../../api/commandes.api';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Alert } from '../../components/ui/Alert';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Table, type TableColumn } from '../../components/ui/Table';
import { Pagination } from '../../components/ui/Pagination';
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

/** Palette statut de la spec §1.1 : payée/livrée = vert, préparation = teal, expédiée = neutre. */
const statutConfig: Record<string, { variant: StatutVariant; label: string }> = {
  EN_ATTENTE: { variant: 'warning', label: 'En attente' },
  PAYEE: { variant: 'success', label: 'Payée' },
  EN_PREPARATION: { variant: 'info', label: 'En préparation' },
  EXPEDIEE: { variant: 'neutral', label: 'Expédiée' },
  LIVREE: { variant: 'success', label: 'Livrée' },
  ANNULEE: { variant: 'error', label: 'Annulée' },
};

function getStatutConfig(statut: string): { variant: StatutVariant; label: string } {
  return statutConfig[statut] ?? { variant: 'neutral', label: statut };
}

function formatDate(date: string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function AdminCommandes() {
  usePageMeta({ title: 'Gestion des commandes', path: '/admin/commandes', noIndex: true });

  const { showToast } = useToast();
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  const [filtreStatut, setFiltreStatut] = useState('TOUS');
  const [page, setPage] = useState(1);
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

  const PAGE_SIZE = 15;
  const totalPages = Math.max(1, Math.ceil(commandesFiltrees.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageCommandes = commandesFiltrees.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

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
        <span className="font-mono text-sm font-semibold text-ink">{commande.numero}</span>
      ),
    },
    {
      key: 'client',
      label: 'Client',
      render: (commande) => (
        <div className="min-w-0">
          <p className="truncate font-semibold text-ink">
            {commande.user?.prenom} {commande.user?.nom}
          </p>
          <p className="truncate text-xs text-ink-soft">{commande.user?.email}</p>
        </div>
      ),
    },
    {
      key: 'date',
      label: 'Date',
      render: (commande) => (
        <span className="text-[13px] text-ink-soft">{formatDate(commande.created_at)}</span>
      ),
    },
    {
      key: 'montant',
      label: 'Montant',
      render: (commande) => (
        <span className="font-display font-semibold tabular-nums text-ink">
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
      label: 'Actions',
      render: (commande) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => openDetail(commande)}
          aria-label={`Voir la commande ${commande.numero}`}
        >
          <Eye size={14} className="mr-1" aria-hidden="true" />
          Détail
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-[26px] font-semibold leading-tight text-ink sm:text-[30px]">
            Commandes
          </h1>
          <p className="mt-1 text-sm text-ink-soft">
            Suivez et mettez à jour le statut des commandes de vos clients.
          </p>
        </div>
        <div className="w-full sm:w-64">
          <Select
            aria-label="Filtrer par statut"
            value={filtreStatut}
            onChange={(e) => {
              setFiltreStatut(e.target.value);
              setPage(1);
            }}
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

      <Card className="overflow-hidden">
        <div className="flex items-center justify-between gap-3 border-b border-border-brand px-4 py-4 sm:px-6">
          <h2 className="font-display text-base font-semibold text-ink">
            {filtreStatut === 'TOUS'
              ? 'Toutes les commandes'
              : statutConfig[filtreStatut]?.label ?? 'Commandes'}
          </h2>
          <p className="text-[13px] text-ink-soft">
            {commandesFiltrees.length} commande{commandesFiltrees.length > 1 ? 's' : ''}
          </p>
        </div>
        <Table
          columns={columns}
          data={pageCommandes}
          loading={loading}
          emptyMessage="Aucune commande trouvée"
        />
        {!loading && commandesFiltrees.length > PAGE_SIZE && (
          <div className="border-t border-border-brand px-4 py-3 sm:px-6">
            <Pagination
              page={currentPage}
              totalPages={totalPages}
              total={commandesFiltrees.length}
              onPageChange={setPage}
            />
          </div>
        )}
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
              <span className="text-[13px] text-ink-soft">{formatDate(selected.created_at)}</span>
            </div>

            {/* Client */}
            <div className="rounded-xl border border-border-brand bg-page p-4 text-sm">
              <p className="font-semibold text-ink">
                {selected.user?.prenom} {selected.user?.nom}
              </p>
              <p className="mt-0.5 text-ink-soft">{selected.user?.email}</p>
            </div>

            {/* Articles */}
            <div className="space-y-3">
              {selected.details.map((detail) => (
                <div key={detail.id} className="flex items-center justify-between gap-3 text-sm">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-ink">{detail.nom_produit}</p>
                    <p className="font-mono text-xs text-ink-soft">
                      {detail.quantite} × {formatPrix(detail.prix_unitaire)}
                    </p>
                  </div>
                  <p className="shrink-0 font-display font-semibold tabular-nums text-ink">
                    {formatPrix(detail.sous_total)}
                  </p>
                </div>
              ))}
            </div>

            {/* Totaux */}
            <div className="space-y-2 border-t border-border-brand pt-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-ink-soft">Sous-total</span>
                <span className="font-semibold tabular-nums text-ink">
                  {formatPrix(toNumber(selected.montant_total) - toNumber(selected.frais_livraison))}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-ink-soft">Frais de livraison</span>
                <span className="font-semibold tabular-nums text-ink">
                  {formatPrix(selected.frais_livraison)}
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-border-brand pt-3">
                <span className="font-display text-lg font-semibold text-ink">Total</span>
                <span className="font-display text-lg font-semibold tabular-nums text-ink">
                  {formatPrix(selected.montant_total)}
                </span>
              </div>
            </div>

            {/* Adresse de livraison */}
            {selected.adresse_livraison && (
              <div className="rounded-xl border border-border-brand bg-page p-4 text-sm">
                <p className="font-semibold text-ink">{selected.adresse_livraison.libelle}</p>
                <p className="mt-1 text-ink-soft">
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
            <div className="border-t border-border-brand pt-4">
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
              <Button
                type="button"
                onClick={handleChangeStatut}
                disabled={saving || nouveauStatut === selected.statut}
                loading={saving}
                className="mt-4 w-full"
              >
                {saving ? 'Mise à jour…' : 'Mettre à jour le statut'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
