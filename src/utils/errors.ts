import axios from 'axios';

export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string | string[] } | undefined;
    if (typeof data?.message === 'string') {
      return data.message;
    }
    if (Array.isArray(data?.message)) {
      return data.message.join(', ');
    }
    if (error.response?.status === 401) {
      return 'Votre session a expiré. Veuillez vous reconnecter.';
    }
  }
  return 'Une erreur est survenue. Veuillez réessayer.';
}