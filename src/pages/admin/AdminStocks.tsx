import { useEffect, useMemo, useState } from 'react';
import { Pencil, TriangleAlert, PackageX, Search } from 'lucide-react';
import { Pagination } from '../../components/ui/Pagination';
import { Select } from '../../components/ui/Select';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Alert } from '../../components/ui/Alert';
import { Modal } from '../../components/ui/Modal';
import { Table, type TableColumn } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { useToast } from '../../hooks/useToast';
import { stocksApi } from '../../api/stocks.api';
import { usePageMeta } from '../../hooks/usePageMeta';
import type { Stock } from '../../types';

type StockStatus = 'ok' | 'seuil' | 'alerte' | 'rupture';

/** Statut calculé à partir du seuil d'alerte réel de chaque produit. */
function getStatus(stock: Stock): StockStatus {
  if (stock.quantite === 0) return 'rupture';
  if (stock.quantite < stock.seuil_alerte) return 'alerte';
  if (stock.quantite === stock.seuil_alerte) return 'seuil';
  return 'ok';
}

/** Palette statut de la spec §1.1 : rupture = rouge, stock faible = jaune. */
const statusConfig: Record<StockStatus, { label: string; badge: 'success' | 'warning' | 'error' }> = {
  ok: { label: 'En stock', badge: 'success' },
  seuil: { label: 'Seuil atteint', badge: 'warning' },
  alerte: { label: 'Stock faible', badge: 'warning' },
  rupture: { label: 'Rupture', badge: 'error' },
};

export function AdminStocks() {
  usePageMeta({ title: 'Gestion des stocks', path: '/admin/stocks', noIndex: true });

  const { showToast } = useToast();
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [alertes, setAlertes] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'' | StockStatus>('');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 12;

  const filteredStocks = useMemo(() => {
    const q = search.trim().toLowerCase();
    return stocks.filter((stock) => {
      if (statusFilter && getStatus(stock) !== statusFilter) return false;
      if (!q) return true;
      return `${stock.produit?.nom ?? ''} ${stock.produit?.reference ?? ''}`.toLowerCase().includes(q);
    });
  }, [stocks, search, statusFilter]);
  const totalPages = Math.max(1, Math.ceil(filteredStocks.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageStocks = filteredStocks.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingStock, setEditingStock] = useState<Stock | null>(null);
  const [quantite, setQuantite] = useState('');
  const [seuil, setSeuil] = useState('');
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadStocks = async () => {
      setLoading(true);
      setError('');
      try {
        const [allRes, alertsRes] = await Promise.all([
          stocksApi.getAll(),
          stocksApi.getAlerts(),
        ]);
        if (cancelled) return;
        setStocks(allRes.data.data);
        setAlertes(alertsRes.data.data);
      } catch {
        if (!cancelled) {
          setError('Impossible de charger les stocks. Vérifiez que le serveur est démarré.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadStocks();

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const openEdit = (stock: Stock) => {
    setEditingStock(stock);
    setQuantite(String(stock.quantite));
    setSeuil(String(stock.seuil_alerte));
    setFormError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStock) return;
    setFormError('');
    setSaving(true);
    try {
      const qte = parseInt(quantite, 10);
      const seuilValue = parseInt(seuil, 10);
      if (Number.isNaN(qte) || qte < 0) {
        setFormError('La quantité doit être un nombre entier positif.');
        setSaving(false);
        return;
      }
      if (Number.isNaN(seuilValue) || seuilValue < 0) {
        setFormError("Le seuil d'alerte doit être un nombre entier positif.");
        setSaving(false);
        return;
      }
      await stocksApi.update(editingStock.id, {
        quantite: qte,
        seuil_alerte: seuilValue,
      });
      showToast('success', 'Stock mis à jour avec succès.');
      setModalOpen(false);
      setReloadKey((key) => key + 1);
    } catch (err) {
      const message =
        (err as { response?: { data?: { message?: string } } }).response?.data?.message ??
        "Une erreur est survenue lors de la mise à jour.";
      setFormError(message);
    } finally {
      setSaving(false);
    }
  };

  const columns: TableColumn<Stock>[] = [
    {
      key: 'produit',
      label: 'Produit',
      render: (stock) => (
        <div className="min-w-0">
          <p className="truncate font-semibold text-ink">{stock.produit?.nom ?? 'Produit inconnu'}</p>
          {stock.produit?.reference && (
            <p className="font-mono text-xs text-ink-soft">{stock.produit.reference}</p>
          )}
        </div>
      ),
    },
    {
      key: 'quantite',
      label: 'Quantité',
      render: (stock) => (
        <span className="font-display font-semibold tabular-nums text-ink">{stock.quantite}</span>
      ),
    },
    {
      key: 'seuil_alerte',
      label: "Seuil d'alerte",
      render: (stock) => (
        <span className="font-mono tabular-nums text-ink-soft">{stock.seuil_alerte}</span>
      ),
    },
    {
      key: 'statut',
      label: 'Statut',
      render: (stock) => {
        const status = getStatus(stock);
        const config = statusConfig[status];
        return (
          <Badge variant={config.badge} dot>
            {config.label}
          </Badge>
        );
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (stock) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => openEdit(stock)}
          aria-label={`Modifier le stock de ${stock.produit?.nom ?? 'ce produit'}`}
        >
          <Pencil size={14} className="mr-1" /> Modifier
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-[26px] font-semibold leading-tight text-ink sm:text-[30px]">
          Stocks
        </h1>
        <p className="mt-1 text-sm text-ink-soft">
          Suivez et mettez à jour les niveaux de stock de vos produits.
        </p>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      <Card className="p-6">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-100 text-accent-700">
            <TriangleAlert size={20} aria-hidden="true" />
          </span>
          <div>
            <h2 className="font-display text-lg font-semibold text-ink">Alertes de stock</h2>
            <p className="text-[13px] text-ink-soft">
              Produits dont la quantité a atteint ou dépassé leur seuil d'alerte.
            </p>
          </div>
        </div>
        {loading ? (
          <div className="mt-4 space-y-2">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-16 animate-pulse rounded-xl bg-border-brand/60" />
            ))}
          </div>
        ) : alertes.length === 0 ? (
          <p className="mt-4 flex items-center gap-2 text-sm font-semibold text-success-700">
            <span className="h-2 w-2 rounded-full bg-success-500" aria-hidden="true" />
            Aucune alerte : tous les produits sont correctement approvisionnés.
          </p>
        ) : (
          <ul className="mt-4 space-y-2">
            {alertes.map((stock) => {
              const status = getStatus(stock);
              const config = statusConfig[status];
              return (
                <li
                  key={stock.id}
                  className="flex flex-col gap-3 rounded-xl border border-border-brand bg-white p-4 shadow-card sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-3">
                    {status === 'rupture' ? (
                      <PackageX size={18} className="shrink-0 text-error-700" aria-hidden="true" />
                    ) : (
                      <TriangleAlert
                        size={18}
                        className="shrink-0 text-accent-700"
                        aria-hidden="true"
                      />
                    )}
                    <div>
                      <p className="text-sm font-semibold text-ink">
                        {stock.produit?.nom ?? 'Produit inconnu'}
                      </p>
                      <p className="font-mono text-xs text-ink-soft">
                        Quantité : {stock.quantite} — Seuil : {stock.seuil_alerte}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={config.badge} dot>
                      {config.label}
                    </Badge>
                    <Button variant="secondary" size="sm" onClick={() => openEdit(stock)}>
                      <Pencil size={14} className="mr-1" /> Modifier
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      <Card className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-border-brand p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h2 className="font-display text-base font-semibold text-ink">Tous les stocks</h2>
            <p className="text-[13px] text-ink-soft">
              {filteredStocks.length} produit{filteredStocks.length > 1 ? 's' : ''}
              {filteredStocks.length !== stocks.length ? ` sur ${stocks.length}` : ' suivis'}
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative sm:w-64">
              <Search
                size={16}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted"
                aria-hidden="true"
              />
              <input
                type="search"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Produit ou référence…"
                aria-label="Rechercher un stock"
                className="h-10 w-full rounded-lg border border-line-strong bg-white pl-10 pr-3 text-sm text-ink shadow-sm transition-[border-color,box-shadow] focus:border-primary-600 focus:outline-none focus:ring-[3px] focus:ring-primary-600/12"
              />
            </div>
            <div className="sm:w-44">
              <Select
                aria-label="Filtrer par statut"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as '' | StockStatus);
                  setPage(1);
                }}
                className="!h-10 text-sm"
              >
                <option value="">Tous les statuts</option>
                <option value="ok">En stock</option>
                <option value="seuil">Seuil atteint</option>
                <option value="alerte">Stock faible</option>
                <option value="rupture">Rupture</option>
              </Select>
            </div>
          </div>
        </div>
        <Table
          columns={columns}
          data={pageStocks}
          loading={loading}
          emptyMessage={search || statusFilter ? 'Aucun produit ne correspond à ces critères.' : 'Aucun stock enregistré'}
        />
        {!loading && filteredStocks.length > PAGE_SIZE && (
          <div className="border-t border-border-brand px-4 py-3 sm:px-6">
            <Pagination
              page={currentPage}
              totalPages={totalPages}
              total={filteredStocks.length}
              onPageChange={setPage}
            />
          </div>
        )}
      </Card>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`Modifier le stock — ${editingStock?.produit?.nom ?? ''}`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" form="stock-form" loading={saving}>
              Enregistrer
            </Button>
          </>
        }
      >
        <form id="stock-form" onSubmit={handleSubmit} className="space-y-4">
          {formError && <Alert type="error" message={formError} />}
          <Input
            label="Quantité"
            name="quantite"
            type="number"
            min="0"
            step="1"
            value={quantite}
            onChange={(e) => setQuantite(e.target.value)}
            required
          />
          <Input
            label="Seuil d'alerte"
            name="seuil"
            type="number"
            min="0"
            step="1"
            value={seuil}
            onChange={(e) => setSeuil(e.target.value)}
            required
            helper="Le produit passe en alerte dès que la quantité atteint ce seuil."
          />
        </form>
      </Modal>
    </div>
  );
}
