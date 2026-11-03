import api from './axios';
import type { ApiResponse } from '../types';

/** Utilisateur vu par l'administration (`GET /auth/users`, rôle admin). */
export interface UtilisateurAdmin {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string | null;
  role: 'admin' | 'client';
  created_at: string;
  nb_commandes: number;
  total_depense: number;
}

export const utilisateursApi = {
  getAll: () => api.get<ApiResponse<UtilisateurAdmin[]>>('/auth/users'),
};
