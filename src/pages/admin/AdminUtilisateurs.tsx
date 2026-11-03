import { useEffect, useMemo, useState } from 'react';
import { Search, ShieldCheck, UserPlus, Users, Wallet } from 'lucide-react';
import { utilisateursApi } from '../../api/utilisateurs.api';
import type { UtilisateurAdmin } from '../../api/utilisateurs.api';
import { Alert } from '../../components/ui/Alert';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { Pagination } from '../../components/ui/Pagination';
import { Select } from '../../components/ui/Select';
import { Table } from '../../components/ui/Table';
import type { TableColumn } from '../../components/ui/Table';
import { PageHeader } from '../../components/PageHeader';
import { formatPrix } from '../../utils/panier';
import { getApiErrorMessage } from '../../utils/errors';
import { usePageMeta } from '../../hooks/usePageMeta';

const PAGE_SIZE = 10;

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function AdminUtilisateurs() {
  usePageMeta({ title: 'Utilisateurs — Administration', path: '/admin/utilisateurs', noIndex: true });

  const [users, setUsers] = useState<UtilisateurAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    let cancelled = false;
    utilisateursApi
      .getAll()
      .then((res) => {
        if (!cancelled) setUsers(res.data.data ?? []);
      })
      .catch((err) => {
        if (!cancelled) setError(getApiErrorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((u) => {
      if (role && u.role !== role) return false;
      if (!q) return true;
      return `${u.prenom} ${u.nom} ${u.email} ${u.telephone ?? ''}`.toLowerCase().includes(q);
    });
  }, [users, search, role]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageRows = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const stats = useMemo(() => {
    const debutMois = new Date();
    debutMois.setDate(1);
    debutMois.setHours(0, 0, 0, 0);
    const clients = users.filter((u) => u.role === 'client');
    return {
      clients: clients.length,
      admins: users.filter((u) => u.role === 'admin').length,
      nouveaux: users.filter((u) => new Date(u.created_at) >= debutMois).length,
      ca: clients.reduce((sum, u) => sum + u.total_depense, 0),
    };
  }, [users]);

  const columns: TableColumn<UtilisateurAdmin>[] = [
    {
      key: 'utilisateur',
      label: 'Utilisateur',
      render: (u) => (
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-50 text-xs font-semibold text-primary-700">
            {`${u.prenom?.[0] ?? ''}${u.nom?.[0] ?? ''}`.toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="truncate font-medium text-ink">
              {u.prenom} {u.nom}
            </p>
            <p className="truncate text-xs text-ink-soft">{u.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'telephone',
      label: 'Téléphone',
      render: (u) => <span className="text-ink-soft">{u.telephone || '—'}</span>,
    },
    {
      key: 'role',
      label: 'Rôle',
      render: (u) =>
        u.role === 'admin' ? (
          <Badge variant="primary">Administrateur</Badge>
        ) : (
          <Badge variant="neutral">Client</Badge>
        ),
    },
    {
      key: 'nb_commandes',
      label: 'Commandes',
      render: (u) => <span className="tabular-nums">{u.nb_commandes}</span>,
    },
    {
      key: 'total_depense',
      label: 'Total dépensé',
      render: (u) => (
        <span className="font-medium tabular-nums">
          {u.total_depense > 0 ? formatPrix(u.total_depense) : '—'}
        </span>
      ),
    },
    {
      key: 'created_at',
      label: 'Inscrit le',
      render: (u) => <span className="text-ink-soft">{formatDate(u.created_at)}</span>,
    },
  ];

  const kpis = [
    { label: 'Clients', value: String(stats.clients), icon: Users },
    { label: 'Nouveaux ce mois-ci', value: String(stats.nouveaux), icon: UserPlus },
    { label: 'Administrateurs', value: String(stats.admins), icon: ShieldCheck },
    { label: 'Chiffre d’affaires clients', value: formatPrix(stats.ca), icon: Wallet },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Utilisateurs"
        description="Comptes clients et administrateurs, avec leur activité d’achat."
      />

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.label} className="p-4 sm:p-5">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[13px] text-ink-soft">{kpi.label}</p>
                <Icon size={16} className="text-ink-muted" aria-hidden="true" />
              </div>
              <p className="mt-2 font-display text-xl font-semibold tabular-nums text-ink sm:text-2xl">
                {loading ? '—' : kpi.value}
              </p>
            </Card>
          );
        })}
      </div>

      <Card className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-border-brand p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-xs">
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
              placeholder="Nom, email, téléphone…"
              aria-label="Rechercher un utilisateur"
              className="h-10 w-full rounded-lg border border-line-strong bg-white pl-10 pr-3 text-sm text-ink shadow-sm transition-[border-color,box-shadow] focus:border-primary-600 focus:outline-none focus:ring-[3px] focus:ring-primary-600/12"
            />
          </div>
          <div className="w-full sm:w-48">
            <Select
              aria-label="Filtrer par rôle"
              value={role}
              onChange={(e) => {
                setRole(e.target.value);
                setPage(1);
              }}
              className="!h-10 text-sm"
            >
              <option value="">Tous les rôles</option>
              <option value="client">Clients</option>
              <option value="admin">Administrateurs</option>
            </Select>
          </div>
        </div>

        <Table
          columns={columns}
          data={pageRows}
          loading={loading}
          emptyMessage={search || role ? 'Aucun utilisateur ne correspond à ces critères.' : 'Aucun utilisateur.'}
        />

        {!loading && filtered.length > PAGE_SIZE && (
          <div className="border-t border-border-brand px-4 py-3">
            <Pagination
              page={currentPage}
              totalPages={totalPages}
              total={filtered.length}
              onPageChange={setPage}
            />
          </div>
        )}
      </Card>
    </div>
  );
}
