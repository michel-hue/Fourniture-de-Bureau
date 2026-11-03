import api from './axios';
import type { ApiResponse, Categorie } from '../types';

export const categoriesApi = {
  getAll: () => api.get<ApiResponse<Categorie[]>>('/categories'),
  getOne: (id: string) => api.get<ApiResponse<Categorie>>(`/categories/${id}`),
  create: (data: Partial<Categorie>) => api.post<ApiResponse<Categorie>>('/categories', data),
  update: (id: string, data: Partial<Categorie>) => api.patch<ApiResponse<Categorie>>(`/categories/${id}`, data),
  remove: (id: string) => api.delete<ApiResponse<void>>(`/categories/${id}`),
};
