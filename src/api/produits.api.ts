import api from './axios';
import type { ApiResponse, PaginatedResponse, Produit, ProductStock } from '../types';

export interface ProduitParams {
  page?: number;
  limit?: number;
  categorie_id?: string;
  search?: string;
  prix_min?: number;
  prix_max?: number;
  sort?: string;
}

export const produitsApi = {
  getAll: (params?: ProduitParams) =>
    api.get<PaginatedResponse<Produit>>('/produits', { params }),
  getOne: (id: string) =>
    api.get<ApiResponse<Produit>>(`/produits/${id}`),
  getFeatured: () =>
    api.get<ApiResponse<Produit[]>>('/produits/featured'),
  /**
   * Stock d'un produit — endpoint PUBLIC (`GET /produits/:id/stock`).
   *
   * Aucun token n'est requis : la fiche produit affiche la pill de stock
   * (« En stock » / « Stock faible : N » / « Rupture ») et bloque l'achat
   * quand le produit est en rupture, y compris pour un visiteur anonyme.
   *
   * 404 si le produit n'existe pas ; un produit sans ligne de stock est renvoyé
   * avec `quantite: 0` (donc en rupture).
   */
  getStock: (id: string) =>
    api.get<ApiResponse<ProductStock>>(`/produits/${id}/stock`),
  create: (data: Partial<Produit>) =>
    api.post<ApiResponse<Produit>>('/produits', data),
  update: (id: string, data: Partial<Produit>) =>
    api.patch<ApiResponse<Produit>>(`/produits/${id}`, data),
  remove: (id: string) =>
    api.delete<ApiResponse<void>>(`/produits/${id}`),
};
