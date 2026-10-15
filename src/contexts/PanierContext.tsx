import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { PanierContext } from './panier-context';
import type { PanierContextValue } from './panier-context';
import { panierApi } from '../api/panier.api';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { getApiErrorMessage } from '../utils/errors';
import { prixLigne } from '../utils/panier';
import type { Panier } from '../types';

export function PanierProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const [panier, setPanier] = useState<Panier | null>(null);
  const [loading, setLoading] = useState(isAuthenticated);

  // Réinitialiser le panier dès que l'utilisateur se connecte ou se déconnecte
  // (ajustement d'état pendant le rendu — pattern recommandé par React)
  const [previousAuth, setPreviousAuth] = useState(isAuthenticated);
  if (previousAuth !== isAuthenticated) {
    setPreviousAuth(isAuthenticated);
    if (!isAuthenticated) {
      setPanier(null);
      setLoading(false);
    } else {
      setLoading(true);
    }
  }

  // Charger le panier au montage si authentifié, et à chaque connexion
  useEffect(() => {
    if (!isAuthenticated) return;

    let cancelled = false;

    panierApi
      .get()
      .then((res) => {
        if (!cancelled) setPanier(res.data.data);
      })
      .catch((error) => {
        if (!cancelled) {
          setPanier(null);
          showToast('error', getApiErrorMessage(error));
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, showToast]);

  const refreshPanier = useCallback(async () => {
    if (!isAuthenticated) {
      setPanier(null);
      return;
    }
    setLoading(true);
    try {
      const res = await panierApi.get();
      setPanier(res.data.data);
    } catch (error) {
      setPanier(null);
      showToast('error', getApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, showToast]);

  const addItem = useCallback(
    async (produitId: string, quantite: number) => {
      try {
        const res = await panierApi.addItem(produitId, quantite);
        setPanier(res.data.data);
        showToast('success', 'Article ajouté au panier.');
      } catch (error) {
        showToast('error', getApiErrorMessage(error));
        throw error;
      }
    },
    [showToast],
  );

  const updateItem = useCallback(
    async (detailId: string, quantite: number) => {
      try {
        const res = await panierApi.updateItem(detailId, quantite);
        setPanier(res.data.data);
      } catch (error) {
        showToast('error', getApiErrorMessage(error));
        throw error;
      }
    },
    [showToast],
  );

  const removeItem = useCallback(
    async (detailId: string) => {
      try {
        const res = await panierApi.removeItem(detailId);
        setPanier(res.data.data);
        showToast('success', 'Article retiré du panier.');
      } catch (error) {
        showToast('error', getApiErrorMessage(error));
        throw error;
      }
    },
    [showToast],
  );

  const clearPanier = useCallback(async () => {
    try {
      const res = await panierApi.clear();
      setPanier(res.data.data);
      showToast('success', 'Votre panier a été vidé.');
    } catch (error) {
      showToast('error', getApiErrorMessage(error));
      throw error;
    }
  }, [showToast]);

  const nbArticles = useMemo(
    () => panier?.details.reduce((somme, detail) => somme + detail.quantite, 0) ?? 0,
    [panier],
  );

  const total = useMemo(
    () =>
      panier?.details.reduce(
        (somme, detail) => somme + prixLigne(detail.prix_unitaire, detail.quantite),
        0,
      ) ?? 0,
    [panier],
  );

  const value = useMemo<PanierContextValue>(
    () => ({
      panier,
      nbArticles,
      total,
      loading,
      refreshPanier,
      addItem,
      updateItem,
      removeItem,
      clearPanier,
    }),
    [
      panier,
      nbArticles,
      total,
      loading,
      refreshPanier,
      addItem,
      updateItem,
      removeItem,
      clearPanier,
    ],
  );

  return <PanierContext.Provider value={value}>{children}</PanierContext.Provider>;
}