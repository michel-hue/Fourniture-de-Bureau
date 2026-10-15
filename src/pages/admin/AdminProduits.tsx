import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Alert } from '../../components/ui/Alert';
import { Modal } from '../../components/ui/Modal';
import { Table, type TableColumn } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Pagination } from '../../components/ui/Pagination';
import { useToast } from '../../hooks/useToast';
import { produitsApi } from '../../api/produits.api';
import { categoriesApi } from '../../api/categories.api';
import { stocksApi } from '../../api/stocks.api';
import { usePageMeta } from '../../hooks/usePageMeta';
import { formatPrix } from '../../utils/panier';
import type { Categorie, Produit } from '../../types';

interface ProduitForm {
  nom: string;
  description: string;
  prix: string;
  ancien_prix: string;
  marque: string;
  reference: string;
  categorie_id: string;
  actif: boolean;
}

const emptyForm: ProduitForm = {
  nom: '',
  description: '',
  prix: '',
  ancien_prix: '',
  marque: '',
  reference: '',
  categorie_id: '',
  actif: true,
};

const PAGE_SIZE = 10;

export function AdminProduits() {
  usePageMeta({ title: 'Gestion des produits', path: '/admin/produits', noIndex: true });

  const { showToast } = useToast();
  const [produits, setProduits] = useState<Produit[]>([]);
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [stocksMap, setStocksMap] = useState<Record<string, number>>({});
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [categorieFilter, setCategorieFilter] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProduitForm>(emptyForm);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Produit | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadCategories = async () => {
      try {
        const res = await categoriesApi.getAll();
        if (!cancelled) setCategories(res.data.data);
      } catch {
        // Le filtre catégorie restera vide si le chargement échoue
      }
    };

    loadCategories();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      setLoading(true);
      setError('');
      try {
        const [produitsRes, stocksRes] = await Promise.all([
          produitsApi.getAll({
            page,
            limit: PAGE_SIZE,
            search: search || undefined,
            categorie_id: categorieFilter || undefined,
          }),
          stocksApi.getAll(),
        ]);
        if (cancelled) return;
        setProduits(produitsRes.data.data);
        setTotal(produitsRes.data.meta.total);
        setTotalPages(produitsRes.data.meta.totalPages);
        const map: Record<string, number> = {};
        for (const stock of stocksRes.data.data) {
          map[stock.produit_id] = stock.quantite;
        }
        setStocksMap(map);
      } catch {
        if (!cancelled) {
          setError('Impossible de charger les produits. Vérifiez que le serveur est démarré.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadData();

    return () => {
      cancelled = true;
    };
  }, [page, search, categorieFilter, reloadKey]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  const handleCategorieFilter = (value: string) => {
    setCategorieFilter(value);
    setPage(1);
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormError('');
    setModalOpen(true);
  };

  const openEdit = (produit: Produit) => {
    setEditingId(produit.id);
    setForm({
      nom: produit.nom,
      description: produit.description ?? '',
      prix: String(produit.prix),
      ancien_prix: produit.ancien_prix != null ? String(produit.ancien_prix) : '',
      marque: produit.marque ?? '',
      reference: produit.reference ?? '',
      categorie_id: produit.categorie_id,
      actif: produit.actif,
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSaving(true);
    try {
      const prix = parseFloat(form.prix);
      if (Number.isNaN(prix) || prix < 0) {
        setFormError('Le prix doit être un nombre positif.');
        setSaving(false);
        return;
      }
      const ancienPrix = form.ancien_prix.trim()
        ? parseFloat(form.ancien_prix)
        : undefined;
      if (ancienPrix !== undefined && (Number.isNaN(ancienPrix) || ancienPrix < 0)) {
        setFormError("L'ancien prix doit être un nombre positif.");
        setSaving(false);
        return;
      }
      if (!form.categorie_id) {
        setFormError('Veuillez sélectionner une catégorie.');
        setSaving(false);
        return;
      }

      const payload = {
        nom: form.nom.trim(),
        description: form.description.trim() || undefined,
        prix,
        ancien_prix: ancienPrix,
        marque: form.marque.trim() || undefined,
        reference: form.reference.trim() || undefined,
        categorie_id: form.categorie_id,
        actif: form.actif,
      };

      if (editingId) {
        await produitsApi.update(editingId, payload);
        showToast('success', 'Produit mis à jour avec succès.');
      } else {
        await produitsApi.create(payload);
        showToast('success', 'Produit créé avec succès.');
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
      await produitsApi.remove(deleteTarget.id);
      showToast('success', 'Produit supprimé avec succès.');
      setDeleteTarget(null);
      setReloadKey((key) => key + 1);
    } catch (err) {
      const message =
        (err as { response?: { data?: { message?: string } } }).response?.data?.message ??
        'Impossible de supprimer ce produit.';
      showToast('error', message);
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  const columns: TableColumn<Produit>[] = [
    {
      key: 'nom',
      label: 'Produit',
      render: (produit) => (
        <div>
          <p className="font-medium text-slate-900">{produit.nom}</p>
          {produit.reference && (
            <p className="text-xs text-slate-500">Réf. {produit.reference}</p>
          )}
        </div>
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
      key: 'stock',
      label: 'Stock',
      render: (produit) => {
        const quantite = stocksMap[produit.id];
        if (quantite === undefined) {
          return <span className="text-slate-400">—</span>;
        }
        if (quantite === 0) {
          return (
            <Badge variant="error" dot>
              Rupture
            </Badge>
          );
        }
        if (quantite <= 5) {
          return (
            <Badge variant="warning" dot>
              Stock faible
            </Badge>
          );
        }
        return (
          <Badge variant="success" dot>
            En stock
          </Badge>
        );
      },
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
    {
      key: 'actions',
      label: 'Actions',
      render: (produit) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => openEdit(produit)}
            aria-label={`Modifier ${produit.nom}`}
          >
            <Pencil size={14} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDeleteTarget(produit)}
            aria-label={`Supprimer ${produit.nom}`}
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
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Produits</h2>
          <p className="mt-1 text-sm text-slate-500">
            Gérez les produits de votre catalogue ({total} au total).
          </p>
        </div>
        <Button onClick={openCreate} leftIcon={<Plus size={16} />}>
          Ajouter un produit
        </Button>
      </div>

      {error && (
        <div className="mt-4">
          <Alert type="error" message={error} onClose={() => setError('')} />
        </div>
      )}

      <Card className="mt-6 overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 md:flex-row md:items-center">
          <form onSubmit={handleSearchSubmit} className="relative md:w-72">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Rechercher un produit…"
              aria-label="Rechercher un produit"
              className="h-10 w-full rounded-md border border-slate-300 bg-white pl-9 pr-3 text-sm text-slate-900 shadow-xs transition-colors placeholder:text-slate-400 focus:border-primary-600 focus:outline-none focus:ring-4 focus:ring-primary-500/10"
            />
          </form>
          <Select
            value={categorieFilter}
            onChange={(e) => handleCategorieFilter(e.target.value)}
            aria-label="Filtrer par catégorie"
            className="md:w-64"
          >
            <option value="">Toutes les catégories</option>
            {categories.map((categorie) => (
              <option key={categorie.id} value={categorie.id}>
                {categorie.nom}
              </option>
            ))}
          </Select>
        </div>

        <Table
          columns={columns}
          data={produits}
          loading={loading}
          emptyMessage="Aucun produit trouvé"
        />

        {totalPages > 1 && (
          <div className="border-t border-slate-200 px-4 py-3">
            <Pagination
              page={page}
              totalPages={totalPages}
              total={total}
              onPageChange={setPage}
            />
          </div>
        )}
      </Card>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Modifier le produit' : 'Ajouter un produit'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" form="produit-form" loading={saving}>
              {editingId ? 'Enregistrer' : 'Créer'}
            </Button>
          </>
        }
      >
        <form id="produit-form" onSubmit={handleSubmit} className="space-y-4">
          {formError && <Alert type="error" message={formError} />}
          <Input
            label="Nom"
            name="nom"
            value={form.nom}
            onChange={(e) => setForm({ ...form, nom: e.target.value })}
            required
            placeholder="Ex : Ramette de papier A4"
          />
          <Input
            label="Description"
            name="description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Description du produit"
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Prix (FCFA)"
              name="prix"
              type="number"
              step="0.01"
              min="0"
              value={form.prix}
              onChange={(e) => setForm({ ...form, prix: e.target.value })}
              required
              placeholder="0.00"
            />
            <Input
              label="Ancien prix (FCFA)"
              name="ancien_prix"
              type="number"
              step="0.01"
              min="0"
              value={form.ancien_prix}
              onChange={(e) => setForm({ ...form, ancien_prix: e.target.value })}
              placeholder="0.00"
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Marque"
              name="marque"
              value={form.marque}
              onChange={(e) => setForm({ ...form, marque: e.target.value })}
              placeholder="Ex : Bic"
            />
            <Input
              label="Référence"
              name="reference"
              value={form.reference}
              onChange={(e) => setForm({ ...form, reference: e.target.value })}
              placeholder="Ex : RAM-A4-500"
            />
          </div>
          <Select
            label="Catégorie"
            id="categorie_id"
            value={form.categorie_id}
            onChange={(e) => setForm({ ...form, categorie_id: e.target.value })}
            required
          >
            <option value="">Sélectionner une catégorie</option>
            {categories.map((categorie) => (
              <option key={categorie.id} value={categorie.id}>
                {categorie.nom}
              </option>
            ))}
          </Select>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={form.actif}
              onChange={(e) => setForm({ ...form, actif: e.target.checked })}
              className="h-4 w-4 rounded border-slate-300 text-primary-900 focus:ring-primary-500"
            />
            Produit actif
          </label>
        </form>
      </Modal>

      <Modal
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title="Supprimer le produit"
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
          Êtes-vous sûr de vouloir supprimer le produit{' '}
          <span className="font-semibold text-slate-900">{deleteTarget?.nom}</span> ? Cette action
          est irréversible.
        </p>
      </Modal>
    </div>
  );
}