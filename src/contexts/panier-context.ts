import { createContext } from 'react';
import type { Panier } from '../types';

export interface PanierContextValue {
  panier: Panier | null;
  nbArticles: number;
  total: number;
  loading: boolean;
  refreshPanier: () => Promise<void>;
  addItem: (produitId: string, quantite: number) => Promise<void>;
  updateItem: (detailId: string, quantite: number) => Promise<void>;
  removeItem: (detailId: string) => Promise<void>;
  clearPanier: () => Promise<void>;
}

export const PanierContext = createContext<PanierContextValue | undefined>(undefined);