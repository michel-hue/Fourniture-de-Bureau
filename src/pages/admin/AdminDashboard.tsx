import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  Tags,
  AlertTriangle,
  Boxes,
  ArrowRight,
  TrendingUp,
  Plus,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Alert } from '../../components/ui/Alert';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Table, type TableColumn } from '../../components/ui/Table';
import { produitsApi } from '../../api/produits.api';
import { categoriesApi } from '../../api/categories.api';
import { stocksApi } from '../../api/stocks.api';
import { usePageMeta } from '../../hooks/usePageMeta';
import { formatPrix } from '../../utils/panier';
import type { Produit } from '../../types';

interface DashboardStats {
  totalProduits: number;
  totalCategories: number;
  alertesStock: number;
  totalStocks: number;
}

const initialStats: DashboardStats = {
  totalProduits: 0,
  totalCategories: 0,
  alertesStock: 0,
  totalStocks: 0,
};

const chartBars = [35, 55, 40, 70, 50, 80, 65, 90, 60, 75, 85, 95];

export function AdminDashboard() {
  usePageMeta({ title: 'Administration', path: '/admin', noIndex: true });

  const [stats, setStats] = useState<DashboardStats>(initialStats);
  const [derniersProduits, setDerniersProduits] = useState<Produit[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingProduits, setLoadingProduits] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    const loadStats = async () => {
      setLoading(true);
      setError('');
      try {
        const [produitsRes, categoriesRes, stocksRes, alertesRes] = await Promise.all([
          produitsApi.getAll({ limit: 1 }),
          categoriesApi.getAll(),
          stocksApi.getAll(),
          stocksApi.getAlerts(),
        ]);

        if (cancelled) return;

        setStats({
          totalProduits: produitsRes.data.meta.total ?? produitsRes.data.data.length,
          totalCategories: categoriesRes.data.data.length,
          totalStocks: stocksRes.data.data.length,
          alertesStock: alertesRes.data.data.length,
        });
      } catch {
        if (!cancelled) {
          setError('Impossible de charger les statistiques. Vérifiez que le serveur est démarré.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    const loadDerniersProduits = async () => {
      setLoadingProduits(true);
      try {
        const res = await produitsApi.getAll({ limit: 5, sort: 'nouveautes' });
        if (!cancelled) setDerniersProduits(res.data.data);
      } catch {
        if (!cancelled) setDerniersProduits([]);
      } finally {
        if (!cancelled) setLoadingProduits(false);
      }
    };

    loadStats();
    loadDerniersProduits();

    return () => {
      cancelled = true;
    };
  }, []);

  const statCards = [
    {
      label: 'Produits',
      value: stats.totalProduits,
      icon: Package,
      pastille: 'bg-primary-100 text-primary-700',
      link: '/admin/produits',
    },
    {
      label: 'Catégories',
      value: stats.totalCategories,
      icon: Tags,
      pastille: 'bg-accent-100 text-accent-700',
      link: '/admin/categories',
    },
    {
      label: 'Alertes stock',
      value: stats.alertesStock,
      icon: AlertTriangle,
      pastille: 'bg-error-100 text-error-700',
      link: '/admin/stocks',
    },
    {
      label: 'Stocks',
      value: stats.totalStocks,
      icon: Boxes,
      pastille: 'bg-success-100 text-success-700',
      link: '/admin/stocks',
    },
  ];

  const columns: TableColumn<Produit>[] = [
    {
      key: 'nom',
      label: 'Produit',
      render: (produit) => (
        <span className="font-medium text-slate-900">{produit.nom}</span>
      ),
    },
    {
      key: 'categorie',
      label: 'Catégorie',
      render: (produit) => (
        <span className="text-slate-600">{produit.categorie?.nom ?? '—'}</span>
      ),
    },
    {
      key: 'prix',
      label: 'Prix',
      render: (produit) => (
        <span className="font-semibold tabular-nums text-slate-900">
          {formatPrix(produit.prix)}
        </span>
      ),
    },
    {
      key: 'actif',
      label: 'Statut',
      render: (produit) =>
        produit.actif ? (
          <Badge variant="success" dot>
            Actif
          </Badge>
        ) : (
          <Badge variant="neutral" dot>
            Inactif
          </Badge>
        ),
    },
  ];

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard</h2>
          <p className="mt-1 text-sm text-slate-500">
            Vue d'ensemble de votre boutique de fournitures de bureau.
          </p>
        </div>
        <Badge variant="primary">
          {new Intl.DateTimeFormat('fr-FR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          }).format(new Date())}
        </Badge>
      </div>

      {error && (
        <div className="mt-4">
          <Alert type="error" message={error} />
        </div>
      )}

      {/* KPIs */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="p-5">
              <div className="flex items-center gap-4">
                <span
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${stat.pastille}`}
                >
                  <Icon size={24} aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm text-slate-500">{stat.label}</p>
                  {loading ? (
                    <div className="mt-1 h-7 w-16 animate-pulse rounded bg-slate-200/70" />
                  ) : (
                    <p className="text-2xl font-bold tabular-nums text-slate-900">{stat.value}</p>
                  )}
                </div>
              </div>
              <Link
                to={stat.link}
                className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary-700 transition-colors hover:text-primary-900"
              >
                Voir la section <ArrowRight size={14} aria-hidden="true" />
              </Link>
            </Card>
          );
        })}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Graphique */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold tracking-tight text-slate-900">
                Ventes sur 30 jours
              </h3>
              <p className="mt-1 text-sm text-slate-500">Évolution du chiffre d'affaires</p>
            </div>
            <Badge variant="success" dot>
              +12,4%
            </Badge>
          </div>
          <div className="mt-6 flex h-48 items-end gap-2">
            {chartBars.map((height, index) => (
              <div
                key={index}
                className="flex-1 rounded-t-md bg-primary-100 transition-colors hover:bg-primary-200"
                style={{ height: `${height}%` }}
              />
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
            <span>Il y a 30 jours</span>
            <span>Aujourd'hui</span>
          </div>
        </Card>

        {/* Actions rapides */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold tracking-tight text-slate-900">Actions rapides</h3>
          <p className="mt-1 text-sm text-slate-500">Accédez directement aux sections clés.</p>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Link to="/admin/produits">
              <Button variant="secondary" className="w-full" leftIcon={<Plus size={16} />}>
                Produits
              </Button>
            </Link>
            <Link to="/admin/categories">
              <Button variant="secondary" className="w-full" leftIcon={<Tags size={16} />}>
                Catégories
              </Button>
            </Link>
            <Link to="/admin/stocks">
              <Button variant="secondary" className="w-full" leftIcon={<Boxes size={16} />}>
                Stocks
              </Button>
            </Link>
          </div>
          <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <TrendingUp size={16} className="text-primary-700" aria-hidden="true" />
              À venir
            </p>
            <ul className="mt-3 space-y-2 text-sm text-slate-500">
              <li>Gestion des commandes (Phase 3)</li>
              <li>Gestion des utilisateurs (Phase 3)</li>
              <li>Gestion des coupons (Phase 3)</li>
            </ul>
          </div>
        </Card>
      </div>

      {/* Derniers produits */}
      <Card className="mt-8 overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h3 className="text-lg font-semibold tracking-tight text-slate-900">
            Derniers produits
          </h3>
          <Link
            to="/admin/produits"
            className="inline-flex items-center gap-1 text-sm font-medium text-primary-700 transition-colors hover:text-primary-900"
          >
            Tout voir <ArrowRight size={14} aria-hidden="true" />
          </Link>
        </div>
        <Table
          columns={columns}
          data={derniersProduits}
          loading={loadingProduits}
          emptyMessage="Aucun produit trouvé"
        />
      </Card>
    </div>
  );
}