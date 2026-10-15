/**
 * Montant monétaire en FCFA.
 *
 * PostgreSQL renvoie les colonnes `numeric` sous forme de chaîne (ex: `"8500.00"`) :
 * l'API peut donc renvoyer un montant en `number` ou en `string`. Tant que le backend
 * n'est pas corrigé, on accepte les deux formes.
 *
 * ⚠️ Tout calcul (multiplication, soustraction, comparaison) doit passer par
 * `toNumber()` de `utils/panier.ts` : `"8500.00" * 2` vaut `NaN`.
 * Pour l'affichage, utiliser `formatPrix()`.
 */
export type Montant = number | string;

export interface Categorie {
  id: string;
  nom: string;
  description?: string;
  image?: string;
  actif: boolean;
  created_at: string;
  updated_at: string;
}

export interface ImageProduit {
  id: string;
  url: string;
  is_principale: boolean;
  ordre: number;
}

export interface Produit {
  id: string;
  nom: string;
  description?: string;
  prix: Montant;
  ancien_prix?: Montant;
  marque?: string;
  reference?: string;
  categorie_id: string;
  categorie?: Categorie;
  actif: boolean;
  note_moyenne: number;
  nombre_avis: number;
  images?: ImageProduit[];
  created_at: string;
  updated_at: string;
}

export interface Stock {
  id: string;
  produit_id: string;
  produit?: Produit;
  quantite: number;
  seuil_alerte: number;
  created_at: string;
  updated_at: string;
}

export interface PanierDetail {
  id: string;
  panier_id: string;
  produit_id: string;
  produit?: Produit;
  quantite: number;
  prix_unitaire: Montant;
  created_at: string;
  updated_at: string;
}

export interface Panier {
  id: string;
  user_id: string;
  details: PanierDetail[];
  // Pas de champ `total` : l'API ne le renvoie pas, le total est calculé
  // côté client à partir des détails (voir PanierContext).
  created_at: string;
  updated_at: string;
}

export interface DetailCommande {
  id: string;
  commande_id: string;
  produit_id: string;
  produit?: Produit;
  nom_produit: string;
  prix_unitaire: Montant;
  quantite: number;
  sous_total: Montant;
  created_at: string;
}

export interface Commande {
  id: string;
  numero: string;
  user_id: string;
  user?: {
    id: string;
    nom: string;
    prenom: string;
    email: string;
    telephone?: string;
  };
  montant_total: Montant;
  frais_livraison: Montant;
  adresse_livraison_id?: string;
  adresse_livraison?: Adresse;
  statut: string;
  details: DetailCommande[];
  created_at: string;
  updated_at: string;
}

export interface Adresse {
  id: string;
  user_id: string;
  libelle: string;
  adresse: string;
  ville: string;
  pays: string;
  code_postal?: string;
  telephone?: string;
  is_principale: boolean;
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

/** Métadonnées de pagination renvoyées par l'API dans la clé `meta`. */
export interface PaginationMeta {
  total: number;
  totalPages: number;
  page: number;
  limit: number;
}

/**
 * Réponse paginée de l'API.
 *
 * L'API imbrique la pagination sous `meta` :
 * `{ success, message, data: T[], meta: { total, totalPages, page, limit } }`.
 * ⚠️ Ne pas lire `total` / `totalPages` à la racine : ils y valent `undefined`
 * et la pagination affiche 0 bouton.
 */
export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  meta: PaginationMeta;
}
