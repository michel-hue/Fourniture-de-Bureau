import { createContext } from 'react';
import type { Produit } from '../types';

export interface FavorisContextValue {
  favoris: Produit[];
  isFavori: (produitId: string) => boolean;
  toggleFavori: (produit: Produit) => void;
  removeFavori: (produitId: string) => void;
}

export const FavorisContext = createContext<FavorisContextValue | undefined>(undefined);
