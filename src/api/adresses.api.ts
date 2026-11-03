import api from './axios';
import type { ApiResponse, Adresse } from '../types';

export const adressesApi = {
  getAll: () => api.get<ApiResponse<Adresse[]>>('/adresses'),
  create: (data: Partial<Adresse>) => api.post<ApiResponse<Adresse>>('/adresses', data),
  update: (id: string, data: Partial<Adresse>) => api.patch<ApiResponse<Adresse>>(`/adresses/${id}`, data),
  remove: (id: string) => api.delete<ApiResponse<void>>(`/adresses/${id}`),
};