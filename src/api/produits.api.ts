import api from './axios';
import type { ApiResponse, PaginatedResponse, Produit } from '../types';

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
  create: (data: Partial<Produit>) =>
    api.post<ApiResponse<Produit>>('/produits', data),
  update: (id: string, data: Partial<Produit>) =>
    api.patch<ApiResponse<Produit>>(`/produits/${id}`, data),
  remove: (id: string) =>
    api.delete<ApiResponse<void>>(`/produits/${id}`),
};
