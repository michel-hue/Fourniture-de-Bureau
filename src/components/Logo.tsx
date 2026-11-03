/**
 * Identité visuelle WorkStore.
 *
 * Les 4 variantes reprennent tels quels les SVG officiels de `maquette/`
 * (viewBox 0 0 48 48) : pentagone teal pointant à droite + point jaune + « W ».
 * Copies statiques : /logo-workstore.svg, /logo-workstore-fonce.svg,
 * /logo-workstore-monochrome-blanc.svg, /logo-workstore-monochrome-nuit.svg
 */
export type LogoVariant = 'couleur' | 'fond-fonce' | 'monochrome-blanc' | 'monochrome-nuit';

const VARIANT_COLORS: Record<LogoVariant, { polygon: string; dot: string; w: string }> = {
  couleur: { polygon: '#00797D', dot: '#FFB800', w: '#FFFFFF' },
  'fond-fonce': { polygon: '#3FD0D4', dot: '#FFB800', w: '#0A2540' },
  'monochrome-blanc': { polygon: '#FFFFFF', dot: '#00797D', w: '#00797D' },
  'monochrome-nuit': { polygon: '#0A2540', dot: '#FFFFFF', w: '#FFFFFF' },
};

interface LogoProps {
  /** Taille en px (carré) */
  size?: number;
  /** Variante colorimétrique — défaut : fond clair */
  variant?: LogoVariant;
  className?: string;
}

/** Icône officielle WorkStore (pentagone + point jaune + « W »). */
export function Logo({ size = 36, variant = 'couleur', className = '' }: LogoProps) {
  const { polygon, dot, w } = VARIANT_COLORS[variant];

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="WorkStore"
      className={className}
    >
      <title>WorkStore</title>
      <polygon
        points="9,9 28,9 41,24 28,39 9,39"
        fill={polygon}
        stroke={polygon}
        strokeWidth="6"
        strokeLinejoin="round"
      />
      <circle cx="14.5" cy="24" r="3" fill={dot} />
      <polyline
        points="20,17 23.5,31 27,22 30.5,31 34,17"
        fill="none"
        stroke={w}
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface WordmarkProps {
  /**
   * Classes de taille / positionnement. Sans `size`, l'échelle responsive de la
   * spec s'applique : 26px desktop / 22px mobile.
   */
  className?: string;
  /** Couleurs : `dark` = sur fond clair (Work navy, Store teal) · `light` = sur fond navy (Work blanc, Store teal clair) */
  tone?: 'dark' | 'light';
  /** Taille forcée en px (bypass l'échelle responsive) */
  size?: number;
}

/**
 * Wordmark « WorkStore » — Outfit 800, « Work » en couleur courante,
 * « Store » en teal (`#00797D`) ou teal clair (`#3FD0D4`) sur fond navy.
 */
export function Wordmark({ className = '', tone = 'dark', size }: WordmarkProps) {
  const workColor = tone === 'dark' ? 'text-ink' : 'text-white';
  const storeColor = tone === 'dark' ? 'text-primary-600' : 'text-primary-400';
  const sizeClasses = size ? '' : 'text-[26px] max-sm:text-[22px]';

  return (
    <span
      className={`font-display font-bold leading-none ${sizeClasses} ${className}`}
      style={size ? { fontSize: `${size}px` } : undefined}
    >
      <span className={workColor}>Work</span>
      <span className={storeColor}>Store</span>
    </span>
  );
}
