import api from './axios';
import type { ApiResponse, Commande } from '../types';

/**
 * Corps de création d'une commande.
 *
 * `frais_livraison` en est volontairement absent : le backend calcule les frais
 * (sous-total >= 50 000 → 0, sinon 3 000) et ignorerait la valeur envoyée.
 * Le type interdit donc de la fournir par erreur.
 */
export interface CreateCommandePayload {
  adresse_livraison_id: string;
}

export const commandesApi = {
  create: (data: CreateCommandePayload) =>
    api.post<ApiResponse<Commande>>('/commandes', data),
  getMine: () => api.get<ApiResponse<Commande[]>>('/commandes'),
  getOne: (id: string) => api.get<ApiResponse<Commande>>(`/commandes/${id}`),
  // Admin
  getAllAdmin: () => api.get<ApiResponse<Commande[]>>('/commandes/admin/all'),
  updateStatut: (id: string, statut: string) =>
    api.patch<ApiResponse<Commande>>(`/commandes/${id}/statut`, { statut }),
};