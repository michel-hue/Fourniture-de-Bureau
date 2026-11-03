import type { MouseEvent } from 'react';
import { Heart } from 'lucide-react';
import { useFavoris } from '../hooks/useFavoris';
import type { Produit } from '../types';

interface FavoriButtonProps {
  produit: Produit;
  size?: 'sm' | 'md';
  className?: string;
}

/** Bouton cœur : ajoute / retire le produit des favoris. */
export function FavoriButton({ produit, size = 'sm', className = '' }: FavoriButtonProps) {
  const { isFavori, toggleFavori } = useFavoris();
  const actif = isFavori(produit.id);

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    toggleFavori(produit);
  };

  const dims = size === 'sm' ? 'h-9 w-9' : 'h-11 w-11';

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={actif}
      aria-label={actif ? `Retirer « ${produit.nom} » des favoris` : `Ajouter « ${produit.nom} » aux favoris`}
      title={actif ? 'Retirer des favoris' : 'Ajouter aux favoris'}
      className={`flex ${dims} shrink-0 items-center justify-center rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600/50 ${
        actif
          ? 'border-error-200 bg-error-50 text-error-600'
          : 'border-border-brand bg-white/95 text-ink-soft backdrop-blur hover:text-error-600'
      } ${className}`}
    >
      <Heart
        size={size === 'sm' ? 16 : 18}
        className={actif ? 'fill-current' : ''}
        aria-hidden="true"
      />
    </button>
  );
}
