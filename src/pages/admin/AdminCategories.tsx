import { useEffect, useMemo, useState } from 'react';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Alert } from '../../components/ui/Alert';
import { Modal } from '../../components/ui/Modal';
import { Table, type TableColumn } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Pagination } from '../../components/ui/Pagination';
import { useToast } from '../../hooks/useToast';
import { categoriesApi } from '../../api/categories.api';
import { usePageMeta } from '../../hooks/usePageMeta';
import type { Categorie } from '../../types';

interface CategorieForm {
  nom: string;
  description: string;
  image: string;
  actif: boolean;
}

const emptyForm: CategorieForm = {
  nom: '',
  description: '',
  image: '',
  actif: true,
};

const PAGE_SIZE = 8;

export function AdminCategories() {
  usePageMeta({ title: 'Gestion des catégories', path: '/admin/categories', noIndex: true });

  const { showToast } = useToast();
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState('nom');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CategorieForm>(emptyForm);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Categorie | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadCategories = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await categoriesApi.getAll();
        if (cancelled) return;
        setCategories(res.data.data);
      } catch {
        if (!cancelled) {
          setError('Impossible de charger les catégories. Vérifiez que le serveur est démarré.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadCategories();

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const filtered = useMemo(() => {
    const query = searchInput.trim().toLowerCase();
    const result = query
      ? categories.filter(
          (categorie) =>
            categorie.nom.toLowerCase().includes(query) ||
            (categorie.description ?? '').toLowerCase().includes(query),
        )
      : [...categories];

    result.sort((a, b) => {
      const value = a.nom.localeCompare(b.nom, 'fr');
      return sortDirection === 'asc' ? value : -value;
    });
    return result;
  }, [categories, searchInput, sortDirection]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleSort = (key: string) => {
    if (key === sortKey) {
      setSortDirection((direction) => (direction === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormError('');
    setModalOpen(true);
  };

  const openEdit = (categorie: Categorie) => {
    setEditingId(categorie.id);
    setForm({
      nom: categorie.nom,
      description: categorie.description ?? '',
      image: categorie.image ?? '',
      actif: categorie.actif,
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSaving(true);
    try {
      const payload = {
        nom: form.nom.trim(),
        description: form.description.trim() || undefined,
        image: form.image.trim() || undefined,
        actif: form.actif,
      };
      if (editingId) {
        await categoriesApi.update(editingId, payload);
        showToast('success', 'Catégorie mise à jour avec succès.');
      } else {
        await categoriesApi.create(payload);
        showToast('success', 'Catégorie créée avec succès.');
      }
      setModalOpen(false);
      setReloadKey((key) => key + 1);
    } catch (err) {
      const message =
        (err as { response?: { data?: { message?: string } } }).response?.data?.message ??
        'Une erreur est survenue lors de l\'enregistrement.';
      setFormError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setError('');
    try {
      await categoriesApi.remove(deleteTarget.id);
      showToast('success', 'Catégorie supprimée avec succès.');
      setDeleteTarget(null);
      setReloadKey((key) => key + 1);
    } catch (err) {
      const message =
        (err as { response?: { data?: { message?: string } } }).response?.data?.message ??
        'Impossible de supprimer cette catégorie.';
      showToast('error', message);
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  const columns: TableColumn<Categorie>[] = [
    {
      key: 'nom',
      label: 'Nom',
      sortable: true,
      render: (categorie) => (
        <span className="font-medium text-slate-900">{categorie.nom}</span>
      ),
    },
    {
      key: 'description',
      label: 'Description',
      render: (categorie) => (
        <span className="line-clamp-2 max-w-xs text-slate-600">
          {categorie.description || '—'}
        </span>
      ),
    },
    {
      key: 'actif',
      label: 'Statut',
      render: (categorie) =>
        categorie.actif ? (
          <Badge variant="success" dot>
            Actif
          </Badge>
        ) : (
          <Badge variant="neutral" dot>
            Inactif
          </Badge>
        ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (categorie) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => openEdit(categorie)}
            aria-label={`Modifier ${categorie.nom}`}
          >
            <Pencil size={14} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDeleteTarget(categorie)}
            aria-label={`Supprimer ${categorie.nom}`}
            className="text-error-600 hover:bg-error-50 hover:text-error-700"
          >
            <Trash2 size={14} />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Catégories</h2>
          <p className="mt-1 text-sm text-slate-500">
            Gérez les catégories de votre catalogue.
          </p>
        </div>
        <Button onClick={openCreate} leftIcon={<Plus size={16} />}>
          Ajouter une catégorie
        </Button>
      </div>

      {error && (
        <div className="mt-4">
          <Alert type="error" message={error} onClose={() => setError('')} />
        </div>
      )}

      <Card className="mt-6 overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 md:flex-row md:items-center">
          <div className="relative md:w-72">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
                setPage(1);
              }}
              placeholder="Rechercher une catégorie…"
              aria-label="Rechercher une catégorie"
              className="h-10 w-full rounded-md border border-slate-300 bg-white pl-9 pr-3 text-sm text-slate-900 shadow-xs transition-colors placeholder:text-slate-400 focus:border-primary-600 focus:outline-none focus:ring-4 focus:ring-primary-500/10"
            />
          </div>
        </div>

        <Table
          columns={columns}
          data={pageItems}
          loading={loading}
          emptyMessage="Aucune catégorie trouvée"
          sortKey={sortKey}
          sortDirection={sortDirection}
          onSort={handleSort}
        />

        <div className="border-t border-slate-200 px-4 py-3">
          <Pagination
            page={currentPage}
            totalPages={totalPages}
            total={filtered.length}
            onPageChange={setPage}
          />
        </div>
      </Card>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Modifier la catégorie' : 'Ajouter une catégorie'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" form="categorie-form" loading={saving}>
              {editingId ? 'Enregistrer' : 'Créer'}
            </Button>
          </>
        }
      >
        <form id="categorie-form" onSubmit={handleSubmit} className="space-y-4">
          {formError && <Alert type="error" message={formError} />}
          <Input
            label="Nom"
            name="nom"
            value={form.nom}
            onChange={(e) => setForm({ ...form, nom: e.target.value })}
            required
            placeholder="Ex : Papeterie"
          />
          <Input
            label="Description"
            name="description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Description de la catégorie"
          />
          <Input
            label="Image (URL)"
            name="image"
            value={form.image}
            onChange={(e) => setForm({ ...form, image: e.target.value })}
            placeholder="https://exemple.com/image.jpg"
          />
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={form.actif}
              onChange={(e) => setForm({ ...form, actif: e.target.checked })}
              className="h-4 w-4 rounded border-slate-300 text-primary-900 focus:ring-primary-500"
            />
            Catégorie active
          </label>
        </form>
      </Modal>

      <Modal
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title="Supprimer la catégorie"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteTarget(null)}>
              Annuler
            </Button>
            <Button variant="danger" onClick={handleDelete} loading={deleting}>
              Supprimer
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-600">
          Êtes-vous sûr de vouloir supprimer la catégorie{' '}
          <span className="font-semibold text-slate-900">{deleteTarget?.nom}</span> ? Cette action
          est irréversible.
        </p>
      </Modal>
    </div>
  );
}