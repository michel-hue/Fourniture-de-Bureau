import { useEffect, useState } from 'react';
import { Pencil, AlertTriangle, PackageX } from 'lucide-react';
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

function getStatus(stock: Stock): StockStatus {
  if (stock.quantite === 0) return 'rupture';
  if (stock.quantite < stock.seuil_alerte) return 'alerte';
  if (stock.quantite === stock.seuil_alerte) return 'seuil';
  return 'ok';
}

const statusConfig: Record<StockStatus, { label: string; badge: 'success' | 'warning' | 'error' }> = {
  ok: { label: 'En stock', badge: 'success' },
  seuil: { label: 'Proche du seuil', badge: 'warning' },
  alerte: { label: 'Stock faible', badge: 'error' },
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
        'Une erreur est survenue lors de la mise à jour.';
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
        <div>
          <p className="font-medium text-slate-900">{stock.produit?.nom ?? 'Produit inconnu'}</p>
          {stock.produit?.reference && (
            <p className="text-xs text-slate-500">Réf. {stock.produit.reference}</p>
          )}
        </div>
      ),
    },
    {
      key: 'quantite',
      label: 'Quantité',
      render: (stock) => (
        <span className="font-semibold tabular-nums text-slate-900">{stock.quantite}</span>
      ),
    },
    {
      key: 'seuil_alerte',
      label: "Seuil d'alerte",
      render: (stock) => (
        <span className="tabular-nums text-slate-600">{stock.seuil_alerte}</span>
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
    <div>
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Stocks</h2>
        <p className="mt-1 text-sm text-slate-500">
          Suivez et mettez à jour les niveaux de stock de vos produits.
        </p>
      </div>

      {error && (
        <div className="mt-4">
          <Alert type="error" message={error} onClose={() => setError('')} />
        </div>
      )}

      <Card className="mt-6 p-5">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-warning-50 text-warning-600">
            <AlertTriangle size={18} aria-hidden="true" />
          </span>
          <h3 className="text-lg font-semibold tracking-tight text-slate-900">Alertes stock</h3>
        </div>
        {loading ? (
          <div className="mt-4 space-y-2">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-10 animate-pulse rounded-md bg-slate-200/70" />
            ))}
          </div>
        ) : alertes.length === 0 ? (
          <p className="mt-4 flex items-center gap-2 text-sm text-success-700">
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
                  className="flex flex-col gap-2 rounded-md border border-slate-200 bg-slate-50 p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-3">
                    {status === 'rupture' ? (
                      <PackageX size={18} className="shrink-0 text-error-600" aria-hidden="true" />
                    ) : (
                      <AlertTriangle
                        size={18}
                        className="shrink-0 text-warning-600"
                        aria-hidden="true"
                      />
                    )}
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {stock.produit?.nom ?? 'Produit inconnu'}
                      </p>
                      <p className="text-xs text-slate-500">
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

      <Card className="mt-6 overflow-hidden">
        <div className="border-b border-slate-200 px-6 py-4">
          <h3 className="font-semibold text-slate-900">Tous les stocks</h3>
        </div>
        <Table
          columns={columns}
          data={stocks}
          loading={loading}
          emptyMessage="Aucun stock enregistré"
        />
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
          />
        </form>
      </Modal>
    </div>
  );
}