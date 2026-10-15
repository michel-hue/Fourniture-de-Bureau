import api from './axios';
import type { ApiResponse, Stock } from '../types';

export const stocksApi = {
  getAll: () => api.get<ApiResponse<Stock[]>>('/stocks'),
  getAlerts: () => api.get<ApiResponse<Stock[]>>('/stocks/alerts'),
  getOne: (id: string) => api.get<ApiResponse<Stock>>(`/stocks/${id}`),
  /**
   * Stock d'un produit.
   *
   * Endpoint PUBLIC : la page détail produit s'en sert pour afficher le badge
   * « En stock » / « Rupture » et pour désactiver l'ajout au panier, y compris
   * pour un visiteur non connecté (aucun token n'est requis).
   */
  getByProduit: (produitId: string) =>
    api.get<ApiResponse<Stock>>(`/stocks/produit/${produitId}`),
  create: (data: Partial<Stock>) => api.post<ApiResponse<Stock>>('/stocks', data),
  update: (id: string, data: Partial<Stock>) =>
    api.patch<ApiResponse<Stock>>(`/stocks/${id}`, data),
  remove: (id: string) => api.delete<ApiResponse<void>>(`/stocks/${id}`),
};
