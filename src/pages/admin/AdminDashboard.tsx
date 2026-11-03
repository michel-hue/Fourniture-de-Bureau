import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Package, TriangleAlert, ShoppingCart, ArrowRight, ChartColumn } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Alert } from '../../components/ui/Alert';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { Table, type TableColumn } from '../../components/ui/Table';
import { produitsApi } from '../../api/produits.api';
import { categoriesApi } from '../../api/categories.api';
import { stocksApi } from '../../api/stocks.api';
import { commandesApi } from '../../api/commandes.api';
import { usePageMeta } from '../../hooks/usePageMeta';
import { formatPrix, toNumber } from '../../utils/panier';
import type { Commande, Stock } from '../../types';

interface DashboardStats {
  totalProduits: number;
  totalCategories: number;
  alertesStock: number;
}

const initialStats: DashboardStats = {
  totalProduits: 0,
  totalCategories: 0,
  alertesStock: 0,
};

type StockStatus = 'ok' | 'seuil' | 'alerte' | 'rupture';

/**
 * Statut d'un stock comparé à son seuil d'alerte réel.
 * `seuil_alerte` est propre à chaque produit : il n'est jamais codé en dur.
 */
function getStockStatus(stock: Stock): StockStatus {
  if (stock.quantite === 0) return 'rupture';
  if (stock.quantite < stock.seuil_alerte) return 'alerte';
  if (stock.quantite === stock.seuil_alerte) return 'seuil';
  return 'ok';
}

/** Palette statut de la spec §1.1 : rupture = rouge, stock faible = jaune. */
const stockStatusConfig: Record<
  StockStatus,
  { label: string; badge: 'success' | 'warning' | 'error' }
> = {
  ok: { label: 'En stock', badge: 'success' },
  seuil: { label: 'Seuil atteint', badge: 'warning' },
  alerte: { label: 'Stock faible', badge: 'warning' },
  rupture: { label: 'Rupture', badge: 'error' },
};

const statutCommandeConfig: Record<
  string,
  { variant: 'neutral' | 'primary' | 'accent' | 'success' | 'warning' | 'error' | 'info'; label: string }
> = {
  EN_ATTENTE: { variant: 'warning', label: 'En attente' },
  PAYEE: { variant: 'success', label: 'Payée' },
  EN_PREPARATION: { variant: 'info', label: 'En préparation' },
  EXPEDIEE: { variant: 'neutral', label: 'Expédiée' },
  LIVREE: { variant: 'success', label: 'Livrée' },
  ANNULEE: { variant: 'error', label: 'Annulée' },
};

function getStatutCommandeConfig(statut: string) {
  return statutCommandeConfig[statut] ?? { variant: 'neutral' as const, label: statut };
}

const JOURS_COURTS = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

interface ActiviteJour {
  cle: string;
  label: string;
  dateLabel: string;
  montant: number;
  nbCommandes: number;
}

/**
 * Activité des 7 derniers jours, calculée à partir des commandes réellement
 * enregistrées (`GET /commandes/admin/all`) : montant cumulé et nombre de
 * commandes par jour de création. Les commandes annulées sont exclues du
 * montant affiché (une commande annulée n'est pas une vente).
 */
function buildActivite7Jours(commandes: Commande[]): ActiviteJour[] {
  const aujourdhui = new Date();
  const premierJour = new Date(aujourdhui);
  premierJour.setHours(0, 0, 0, 0);
  premierJour.setDate(premierJour.getDate() - 6);

  const jours: ActiviteJour[] = [];

  for (let i = 0; i < 7; i += 1) {
    const debut = new Date(premierJour);
    debut.setDate(premierJour.getDate() + i);
    const fin = new Date(debut);
    fin.setDate(debut.getDate() + 1);

    const debutTs = debut.getTime();
    const finTs = fin.getTime();

    const commandesDuJour = commandes.filter((commande) => {
      if (commande.statut === 'ANNULEE') return false;
      const ts = new Date(commande.created_at).getTime();
      return ts >= debutTs && ts < finTs;
    });

    jours.push({
      cle: `${debut.getFullYear()}-${debut.getMonth()}-${debut.getDate()}`,
      label: JOURS_COURTS[debut.getDay()],
      dateLabel: `${debut.getDate()}/${debut.getMonth() + 1}`,
      montant: commandesDuJour.reduce(
        (total, commande) => total + toNumber(commande.montant_total),
        0,
      ),
      nbCommandes: commandesDuJour.length,
    });
  }

  return jours;
}

/** Montant court pour l'axe du graphique (12,4 k / 1,2 M). */
function formatCompactFcfa(valeur: number): string {
  const format = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 });
  if (valeur >= 1_000_000) return `${format.format(valeur / 1_000_000)} M`;
  if (valeur >= 1000) return `${format.format(valeur / 1000)} k`;
  return format.format(valeur);
}

function formatDateCourte(date: string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date));
}

export function AdminDashboard() {
  usePageMeta({ title: 'Administration', path: '/admin', noIndex: true });

  const [stats, setStats] = useState<DashboardStats>(initialStats);
  const [alertesStock, setAlertesStock] = useState<Stock[]>([]);
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingAlertes, setLoadingAlertes] = useState(true);
  const [loadingCommandes, setLoadingCommandes] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    const loadStats = async () => {
      setLoading(true);
      setError('');
      try {
        const [produitsRes, categoriesRes] = await Promise.all([
          produitsApi.getAll({ limit: 1 }),
          categoriesApi.getAll(),
        ]);

        if (cancelled) return;

        // Mise à jour fonctionnelle : `alertesStock` est renseigné par
        // `loadAlertes` (requête parallèle) et ne doit pas être écrasé ici.
        setStats((prev) => ({
          ...prev,
          totalProduits: produitsRes.data.meta.total ?? produitsRes.data.data.length,
          totalCategories: categoriesRes.data.data.length,
        }));
      } catch {
        if (!cancelled) {
          setError('Impossible de charger les statistiques. Vérifiez que le serveur est démarré.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    const loadAlertes = async () => {
      setLoadingAlertes(true);
      try {
        const res = await stocksApi.getAlerts();
        if (!cancelled) {
          const alertes = res.data.data ?? [];
          setAlertesStock(alertes);
          setStats((prev) => ({ ...prev, alertesStock: alertes.length }));
        }
      } catch {
        if (!cancelled) {
          setAlertesStock([]);
          setStats((prev) => ({ ...prev, alertesStock: 0 }));
        }
      } finally {
        if (!cancelled) setLoadingAlertes(false);
      }
    };

    const loadCommandes = async () => {
      setLoadingCommandes(true);
      try {
        const res = await commandesApi.getAllAdmin();
        if (!cancelled) {
          setCommandes(Array.isArray(res.data.data) ? res.data.data : []);
        }
      } catch {
        if (!cancelled) setCommandes([]);
      } finally {
        if (!cancelled) setLoadingCommandes(false);
      }
    };

    loadStats();
    loadAlertes();
    loadCommandes();

    return () => {
      cancelled = true;
    };
  }, []);

  const dernieresCommandes = useMemo(() => {
    const sorted = [...commandes].sort((a, b) => {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
    return sorted.slice(0, 6);
  }, [commandes]);

  const activite = useMemo(() => buildActivite7Jours(commandes), [commandes]);

  const commandesCeMois = useMemo(() => {
    const maintenant = new Date();
    return commandes.filter((commande) => {
      const date = new Date(commande.created_at);
      return (
        date.getMonth() === maintenant.getMonth() && date.getFullYear() === maintenant.getFullYear()
      );
    }).length;
  }, [commandes]);

  const totalPeriode = useMemo(
    () => activite.reduce((total, jour) => total + jour.montant, 0),
    [activite],
  );
  const commandesPeriode = useMemo(
    () => activite.reduce((total, jour) => total + jour.nbCommandes, 0),
    [activite],
  );
  const maxMontant = useMemo(
    () => activite.reduce((max, jour) => Math.max(max, jour.montant), 0),
    [activite],
  );

  const statCards = useMemo(
    () =>
      [
        {
          label: 'Produits',
          value: stats.totalProduits,
          icon: Package,
          pastille: 'bg-surface text-primary-600',
          link: '/admin/produits',
          loadingValue: loading,
          loadingDetail: loading,
          detail: (
            <span className="text-[13px] text-ink-soft">
              {stats.totalCategories} catégorie{stats.totalCategories > 1 ? 's' : ''} au catalogue
            </span>
          ),
        },
        {
          label: 'Alertes de stock',
          value: stats.alertesStock,
          icon: TriangleAlert,
          pastille: 'bg-accent-100 text-accent-700',
          link: '/admin/stocks',
          loadingValue: loadingAlertes,
          loadingDetail: loadingAlertes,
          detail:
            stats.alertesStock > 0 ? (
              <Badge variant="warning" dot>
                À réapprovisionner
              </Badge>
            ) : (
              <Badge variant="success" dot>
                Aucun réapprovisionnement
              </Badge>
            ),
        },
        {
          label: 'Commandes',
          value: commandes.length,
          icon: ShoppingCart,
          pastille: 'bg-info-100 text-info-700',
          link: '/admin/commandes',
          loadingValue: loadingCommandes,
          loadingDetail: loadingCommandes,
          detail: (
            <span className="text-[13px] text-ink-soft">
              {commandesCeMois} ce mois-ci
            </span>
          ),
        },
      ] satisfies {
        label: string;
        value: number;
        icon: typeof Package;
        pastille: string;
        link: string;
        loadingValue: boolean;
        loadingDetail: boolean;
        detail: ReactNode;
      }[],
    [
      stats,
      loading,
      loadingAlertes,
      loadingCommandes,
      commandes.length,
      commandesCeMois,
    ],
  );

  const alertesColumns: TableColumn<Stock>[] = [
    {
      key: 'produit',
      label: 'Produit',
      render: (stock) => (
        <div className="min-w-0">
          <p className="truncate font-semibold text-ink">
            {stock.produit?.nom ?? 'Produit inconnu'}
          </p>
          {stock.produit?.reference && (
            <p className="font-mono text-xs text-ink-soft">{stock.produit.reference}</p>
          )}
        </div>
      ),
    },
    {
      key: 'stock',
      label: 'Stock',
      render: (stock) => (
        <span className="font-display font-semibold tabular-nums text-ink">
          {stock.quantite}
          <span className="font-sans font-normal text-ink-soft"> / {stock.seuil_alerte}</span>
        </span>
      ),
    },
    {
      key: 'statut',
      label: 'Statut',
      render: (stock) => {
        const status = getStockStatus(stock);
        const config = stockStatusConfig[status];
        return (
          <Badge variant={config.badge} dot>
            {config.label}
          </Badge>
        );
      },
    },
  ];

  const commandesColumns: TableColumn<Commande>[] = [
    {
      key: 'numero',
      label: 'N° commande',
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
        <span className="text-[13px] text-ink-soft">{formatDateCourte(commande.created_at)}</span>
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
        const statut = getStatutCommandeConfig(commande.statut);
        return (
          <Badge variant={statut.variant} dot>
            {statut.label}
          </Badge>
        );
      },
    },
  ];

  const moisCourant = useMemo(
    () =>
      new Intl.DateTimeFormat('fr-FR', {
        month: 'long',
        year: 'numeric',
      }).format(new Date()),
    [],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-display text-[26px] font-semibold leading-tight text-ink sm:text-[30px]">
          Tableau de bord
        </h1>
        <p className="text-sm font-semibold capitalize text-ink-soft">{moisCourant}</p>
      </div>

      {error && <Alert type="error" message={error} />}

      {/* KPIs — 100 % de données réelles (aucun delta fictif) */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-ink-soft">{stat.label}</p>
                  {stat.loadingValue ? (
                    <div className="mt-1 h-9 w-20 animate-pulse rounded-lg bg-border-brand" />
                  ) : (
                    <p className="mt-1 font-display text-3xl font-semibold tabular-nums text-ink">
                      {stat.value}
                    </p>
                  )}
                </div>
                <span
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${stat.pastille}`}
                >
                  <Icon size={22} aria-hidden="true" />
                </span>
              </div>
              <div className="mt-3 flex min-h-6 items-center">
                {stat.loadingDetail ? (
                  <span className="h-6 w-28 animate-pulse rounded-full bg-border-brand" />
                ) : (
                  stat.detail
                )}
              </div>
              <Link
                to={stat.link}
                className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary-600 transition-colors hover:text-primary-700"
              >
                Voir la section <ArrowRight size={14} aria-hidden="true" />
              </Link>
            </Card>
          );
        })}
      </div>

      <div className="flex flex-col gap-5 lg:flex-row">
        {/* Activité des 7 derniers jours — données réelles issues des commandes */}
        <Card className="flex flex-[1.4] flex-col overflow-hidden">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border-brand px-6 py-4">
            <div>
              <h2 className="font-display text-lg font-semibold text-ink">
                Ventes des 7 derniers jours
              </h2>
              <p className="mt-1 text-[13px] text-ink-soft">
                Montant des commandes non annulées, par jour de création (FCFA)
              </p>
            </div>
            <div className="text-right">
              <p className="font-display text-xl font-semibold tabular-nums text-ink">
                {formatPrix(totalPeriode)}
              </p>
              <p className="text-[13px] text-ink-soft">
                {commandesPeriode} commande{commandesPeriode > 1 ? 's' : ''} sur 7 jours
              </p>
            </div>
          </div>

          <div className="flex-1 px-6 py-5">
            {loadingCommandes ? (
              <div className="flex h-60 items-end gap-5 border-b border-border-brand">
                {Array.from({ length: 7 }).map((_, index) => (
                  <div key={index} className="flex-1">
                    <div
                      className="w-full max-w-[44px] animate-pulse rounded-t-lg bg-border-brand"
                      style={{ height: `${24 + index * 20}px` }}
                    />
                  </div>
                ))}
              </div>
            ) : maxMontant > 0 ? (
              <>
                <div
                  className="flex h-60 items-end gap-5 border-b border-border-brand"
                  role="img"
                  aria-label="Montant des commandes non annulées des 7 derniers jours, en FCFA"
                >
                  {activite.map((jour, index) => {
                    const isLast = index === activite.length - 1;
                    const height =
                      jour.montant > 0
                        ? Math.max(8, Math.round((jour.montant / maxMontant) * 200))
                        : 0;
                    return (
                      <div
                        key={jour.cle}
                        className="flex flex-1 flex-col items-center justify-end gap-2"
                      >
                        {isLast && jour.montant > 0 && (
                          <span className="font-display text-base font-semibold tabular-nums text-ink">
                            {formatCompactFcfa(jour.montant)}
                          </span>
                        )}
                        {height > 0 && (
                          <div
                            className={`w-full max-w-[44px] rounded-t-lg ${
                              isLast ? 'bg-primary-600' : 'bg-tint-light'
                            }`}
                            style={{ height: `${height}px` }}
                            aria-hidden="true"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="mt-2 flex gap-5">
                  {activite.map((jour, index) => (
                    <div key={jour.cle} className="flex-1 text-center">
                      <p
                        className={`text-[13px] font-semibold ${
                          index === activite.length - 1 ? 'text-ink' : 'text-ink-soft'
                        }`}
                      >
                        {jour.label}
                      </p>
                      <p className="text-[11px] text-ink-soft">{jour.dateLabel}</p>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <EmptyState
                icon={ChartColumn}
                title="Aucune commande sur les 7 derniers jours"
                description="Le graphique se remplira automatiquement dès la première commande enregistrée."
              />
            )}
          </div>
        </Card>

        {/* Alertes de stock — seuil_alerte réel de chaque produit */}
        <Card className="flex flex-1 flex-col overflow-hidden">
          <div className="flex items-center justify-between gap-3 border-b border-border-brand px-6 py-4">
            <h2 className="font-display text-lg font-semibold text-ink">Alertes de stock</h2>
            <Link
              to="/admin/stocks"
              className="inline-flex items-center gap-1 whitespace-nowrap text-sm font-semibold text-primary-600 transition-colors hover:text-primary-700"
            >
              Gérer les stocks <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>
          <Table
            columns={alertesColumns}
            data={alertesStock}
            loading={loadingAlertes}
            emptyMessage="Aucune alerte de stock"
          />
        </Card>
      </div>

      {/* Dernières commandes */}
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between gap-3 border-b border-border-brand px-6 py-4">
          <h2 className="font-display text-lg font-semibold text-ink">Dernières commandes</h2>
          <Link
            to="/admin/commandes"
            className="inline-flex items-center gap-1 whitespace-nowrap text-sm font-semibold text-primary-600 transition-colors hover:text-primary-700"
          >
            Voir toutes les commandes <ArrowRight size={14} aria-hidden="true" />
          </Link>
        </div>
        <Table
          columns={commandesColumns}
          data={dernieresCommandes}
          loading={loadingCommandes}
          emptyMessage="Aucune commande récente"
        />
      </Card>
    </div>
  );
}
