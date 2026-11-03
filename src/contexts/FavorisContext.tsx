import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { FavorisContext } from './favoris-context';
import type { FavorisContextValue } from './favoris-context';
import type { Produit } from '../types';

/**
 * Favoris — stockés dans le navigateur (localStorage), sans compte requis.
 * On garde un instantané du produit (nom, prix, image) pour afficher la liste
 * sans requête supplémentaire. L'API n'expose pas encore de favoris : le jour
 * où elle le fera, seul ce provider sera à adapter.
 */
const STORAGE_KEY = 'workstore_favoris';

function readStored(): Produit[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(parsed) ? (parsed as Produit[]) : [];
  } catch {
    return [];
  }
}

function snapshot(produit: Produit): Produit {
  const copie: Produit = { ...produit, images: produit.images?.slice(0, 1) };
  delete copie.description;
  return copie;
}

export function FavorisProvider({ children }: { children: ReactNode }) {
  const [favoris, setFavoris] = useState<Produit[]>(readStored);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favoris));
    } catch {
      // stockage indisponible (navigation privée) : les favoris restent en mémoire
    }
  }, [favoris]);

  // Synchronisation entre onglets
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) setFavoris(readStored());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const ids = useMemo(() => new Set(favoris.map((p) => p.id)), [favoris]);

  const isFavori = useCallback((produitId: string) => ids.has(produitId), [ids]);

  const toggleFavori = useCallback((produit: Produit) => {
    setFavoris((current) =>
      current.some((p) => p.id === produit.id)
        ? current.filter((p) => p.id !== produit.id)
        : [snapshot(produit), ...current],
    );
  }, []);

  const removeFavori = useCallback((produitId: string) => {
    setFavoris((current) => current.filter((p) => p.id !== produitId));
  }, []);

  const value = useMemo<FavorisContextValue>(
    () => ({ favoris, isFavori, toggleFavori, removeFavori }),
    [favoris, isFavori, toggleFavori, removeFavori],
  );

  return <FavorisContext.Provider value={value}>{children}</FavorisContext.Provider>;
}
