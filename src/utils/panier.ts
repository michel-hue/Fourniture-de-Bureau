import type { Montant } from '../types';

// Frais de livraison en FCFA (Côte d'Ivoire)
export const FRAIS_LIVRAISON = 3000;
export const SEUIL_LIVRAISON_GRATUITE = 50000;

export function calculerFraisLivraison(sousTotal: number): number {
  return sousTotal >= SEUIL_LIVRAISON_GRATUITE ? 0 : FRAIS_LIVRAISON;
}

/**
 * Convertit un montant venu de l'API en nombre.
 *
 * PostgreSQL renvoie les `numeric` en chaîne (ex: `"8500.00"`) : sans cette
 * conversion, `Math.round("8500.00")` et `"8500.00" * 2` valent tous deux `NaN`.
 * Une valeur absente ou illisible est ramenée à 0 pour ne jamais propager de NaN
 * dans un total affiché.
 */
export function toNumber(value: Montant | null | undefined): number {
  const parsed = typeof value === 'string' ? Number(value.trim()) : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

/**
 * Formate un montant en FCFA.
 * Le FCFA n'a pas de sous-unités : le montant est arrondi au franc.
 */
export function formatPrix(value: Montant | null | undefined): string {
  return `${new Intl.NumberFormat('fr-FR').format(Math.round(toNumber(value)))} FCFA`;
}

/** Prix d'une ligne de panier : prix unitaire × quantité, ramené au franc. */
export function prixLigne(prixUnitaire: Montant | null | undefined, quantite: number): number {
  return Math.round(toNumber(prixUnitaire) * quantite);
}

/**
 * Pourcentage de remise d'un produit, ou `null` s'il n'est pas en promotion.
 * (même règle que l'affichage : ancien prix défini et strictement supérieur)
 */
export function calculerRemise(
  prix: Montant | null | undefined,
  ancienPrix: Montant | null | undefined,
): number | null {
  const prixActuel = toNumber(prix);
  const prixReference = toNumber(ancienPrix);
  if (prixReference <= 0 || prixReference <= prixActuel) return null;
  return Math.round(((prixReference - prixActuel) / prixReference) * 100);
}
