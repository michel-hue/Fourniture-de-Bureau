import { useContext } from 'react';
import { FavorisContext } from '../contexts/favoris-context';

export function useFavoris() {
  const context = useContext(FavorisContext);
  if (!context) {
    throw new Error('useFavoris doit être utilisé dans un FavorisProvider.');
  }
  return context;
}
