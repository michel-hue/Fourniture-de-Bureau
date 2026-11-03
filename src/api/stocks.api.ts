import api from './axios';
import type { ApiResponse, Stock } from '../types';

export const stocksApi = {
  getAll: () => api.get<ApiResponse<Stock[]>>('/stocks'),
  getAlerts: () => api.get<ApiResponse<Stock[]>>('/stocks/alerts'),
  getOne: (id: string) => api.get<ApiResponse<Stock>>(`/stocks/${id}`),
  // ⚠️ `GET /stocks/produit/:id` est réservé aux admins (403 côté API) : il
  // n'est plus utilisé par le front public. La page détail produit utilise
  // l'endpoint public `produitsApi.getStock()` (`GET /produits/:id/stock`).
  create: (data: Partial<Stock>) => api.post<ApiResponse<Stock>>('/stocks', data),
  update: (id: string, data: Partial<Stock>) =>
    api.patch<ApiResponse<Stock>>(`/stocks/${id}`, data),
  remove: (id: string) => api.delete<ApiResponse<void>>(`/stocks/${id}`),
};
