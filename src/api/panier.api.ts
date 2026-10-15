import api from './axios';
import type { ApiResponse, Panier } from '../types';

export const panierApi = {
  get: () => api.get<ApiResponse<Panier>>('/panier'),
  addItem: (produit_id: string, quantite: number) =>
    api.post<ApiResponse<Panier>>('/panier/items', { produit_id, quantite }),
  updateItem: (detailId: string, quantite: number) =>
    api.patch<ApiResponse<Panier>>(`/panier/items/${detailId}`, { quantite }),
  removeItem: (detailId: string) =>
    api.delete<ApiResponse<Panier>>(`/panier/items/${detailId}`),
  clear: () => api.delete<ApiResponse<Panier>>('/panier'),
};