import { useContext } from 'react';
import { PanierContext } from '../contexts/panier-context';

export function usePanier() {
  const context = useContext(PanierContext);
  if (!context) {
    throw new Error('usePanier doit être utilisé dans un PanierProvider.');
  }
  return context;
}