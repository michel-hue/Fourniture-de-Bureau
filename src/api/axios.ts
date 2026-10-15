import axios from 'axios';
import type { AxiosError } from 'axios';

// L'API est hébergée séparément du frontend (api-project, NestJS).
// En dev : proxy Vite /api -> http://localhost:3000 (voir vite.config.ts)
// En prod : VITE_API_URL pointe vers le domaine de l'API (ex: https://api.bureaustore.fr)
const API_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Endpoints publics : un 401 dessus signifie « identifiants invalides »,
 * pas « session expirée ». Purger le token et rediriger rechargerait la page
 * et effacerait le message d'erreur affiché par les formulaires.
 */
const PUBLIC_ENDPOINTS = [
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/refresh',
];

function isPublicEndpoint(url: string | undefined): boolean {
  if (!url) return false;
  // `url` est relatif au baseURL : on retire query string, hash et slash final.
  const path = url.split('?')[0].split('#')[0].replace(/\/+$/, '');
  return PUBLIC_ENDPOINTS.some((endpoint) => path === endpoint || path.startsWith(`${endpoint}/`));
}

/**
 * La session n'est purgée que si la requête qui échoue était authentifiée.
 * Sans token envoyé, un 401 est une réponse normale à laisser remonter :
 * l'appelant (Login.tsx, etc.) affiche alors le message renvoyé par l'API.
 */
function isSessionExpiree(error: AxiosError): boolean {
  if (isPublicEndpoint(error.config?.url)) return false;
  const headers = error.config?.headers as Record<string, unknown> | undefined;
  return typeof headers?.Authorization === 'string';
}

// Intercepteur pour gérer les erreurs 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401 && isSessionExpiree(error)) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
