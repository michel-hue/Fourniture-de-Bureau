interface LogoProps {
  size?: number;
  className?: string;
}

/**
 * Logo de la marque : badge dégradé bleu encre avec "B" stylisé
 * et accent orange crayon (rappel du stylo). Moderne et lisible en petit.
 */
export function Logo({ size = 36, className = '' }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Logo BureauStore"
      className={className}
    >
      <title>Logo BureauStore</title>
      <desc>Badge dégradé bleu encre avec la lettre B et un accent orange</desc>

      <defs>
        <linearGradient id="bs-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#4A76A6" />
          <stop offset="100%" stopColor="#1C2E47" />
        </linearGradient>
        <linearGradient id="bs-b" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#C3D5E8" />
        </linearGradient>
      </defs>

      {/* Fond dégradé arrondi */}
      <rect x="0" y="0" width="200" height="200" rx="46" fill="url(#bs-bg)" />

      {/* Halo lumineux en haut à gauche */}
      <circle cx="62" cy="52" r="70" fill="#FFFFFF" opacity="0.08" />

      {/* Lettre B stylisée */}
      <text
        x="100"
        y="138"
        textAnchor="middle"
        fontFamily="system-ui, -apple-system, 'Segoe UI', sans-serif"
        fontWeight="800"
        fontSize="118"
        fill="url(#bs-b)"
      >
        B
      </text>

      {/* Accent stylo : trait orange sous la lettre */}
      <rect x="52" y="152" width="96" height="10" rx="5" fill="#F97B1C" />
    </svg>
  );
}