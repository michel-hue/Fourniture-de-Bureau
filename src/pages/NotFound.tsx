import { Link } from 'react-router-dom';
import { ArrowRight, Home, PackageSearch } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { usePageMeta } from '../hooks/usePageMeta';

/**
 * Illustration 404 : une feuille de papier égarée avec un trombone,
 * un stylo et un "404" tamponné — dans l'univers WorkStore
 * (teal `#00797D`, jaune `#FFB800`, encre navy `#0A2540`).
 */
function NotFoundIllustration() {
  return (
    <svg
      width="320"
      height="240"
      viewBox="0 0 320 240"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Illustration : feuille de papier égarée avec un 404 tamponné"
      className="mx-auto"
    >
      <title>Feuille égarée</title>

      {/* Trombone géant (décor) */}
      <g transform="translate(40,30) rotate(-15)">
        <path
          d="M0,0 L0,70 Q0,90 20,90 Q40,90 40,70 L40,20 Q40,5 25,5 Q10,5 10,20 L10,60"
          fill="none"
          stroke="#7fbcbd"
          strokeWidth="7"
          strokeLinecap="round"
        />
      </g>

      {/* Feuille de papier */}
      <g transform="translate(160,120)">
        <rect x="-95" y="-80" width="190" height="160" rx="10" fill="#FFFFFF" stroke="#cfe9e7" strokeWidth="2" />
        {/* Lignes de texte */}
        <line x1="-65" y1="-40" x2="65" y2="-40" stroke="#cfe9e7" strokeWidth="4" strokeLinecap="round" />
        <line x1="-65" y1="-15" x2="45" y2="-15" stroke="#cfe9e7" strokeWidth="4" strokeLinecap="round" />
        <line x1="-65" y1="10" x2="65" y2="10" stroke="#cfe9e7" strokeWidth="4" strokeLinecap="round" />
        <line x1="-65" y1="35" x2="30" y2="35" stroke="#cfe9e7" strokeWidth="4" strokeLinecap="round" />
        {/* Coin plié */}
        <path d="M95,-80 L95,-30 L45,-80 Z" fill="#E3F5F4" stroke="#cfe9e7" strokeWidth="2" />
        {/* Tampon 404 */}
        <g transform="rotate(-8)">
          <rect x="-52" y="-62" width="104" height="52" rx="8" fill="#F1FBFB" stroke="#00797D" strokeWidth="3" strokeDasharray="6 4" />
          <text
            x="0"
            y="-28"
            textAnchor="middle"
            fontFamily="Outfit, system-ui, sans-serif"
            fontWeight="800"
            fontSize="34"
            fill="#00797D"
          >
            404
          </text>
        </g>
      </g>

      {/* Stylo jaune (signature de la marque) */}
      <g transform="translate(250,190) rotate(35)">
        <rect x="-70" y="-8" width="140" height="16" rx="8" fill="#FFB800" />
        <polygon points="70,-8 70,8 88,0" fill="#E5A600" />
        <rect x="-70" y="-8" width="10" height="16" rx="3" fill="#0A2540" />
      </g>

      {/* Agrafe (décor) */}
      <g transform="translate(60,185)">
        <path d="M0,0 L0,18 L14,18 L14,6 L6,6 L6,12" fill="none" stroke="#7fbcbd" strokeWidth="4" strokeLinecap="round" />
      </g>

      {/* Points de gomme (décor) */}
      <circle cx="285" cy="45" r="6" fill="#FFB800" />
      <circle cx="300" cy="70" r="4" fill="#cfe9e7" />
    </svg>
  );
}

export function NotFound() {
  usePageMeta({
    title: 'Page non trouvée',
    description: 'La page que vous recherchez n\'existe pas ou a été déplacée.',
    path: '/404',
    noIndex: true,
  });

  return (
    <div className="relative overflow-hidden bg-page">
      {/* Décor de fond : lignes de cahier */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            'repeating-linear-gradient(transparent, transparent 39px, #cfe9e7 39px, #cfe9e7 40px)',
        }}
      />

      <div className="relative mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center px-4 py-16 text-center">
        <NotFoundIllustration />

        <p className="mt-8 inline-flex items-center gap-2 rounded-pill bg-surface px-4 py-1.5 text-sm font-semibold text-primary-700">
          <PackageSearch size={16} aria-hidden="true" />
          Erreur 404
        </p>

        <h1 className="mt-4 font-display text-[26px] font-semibold leading-tight text-ink sm:text-[32px]">
          Oups, cette page s&apos;est égarée dans le classeur…
        </h1>

        <p className="mt-4 max-w-md text-sm leading-6 text-ink-soft sm:text-base">
          La page que vous cherchez a peut-être été déplacée, renommée ou n&apos;existe plus. Pas
          de panique, nos fournitures, elles, sont bien rangées.
        </p>

        <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <Link to="/" className="w-full sm:w-auto">
            <Button size="lg" className="w-full" leftIcon={<Home size={18} />}>
              Retour à l&apos;accueil
            </Button>
          </Link>
          <Link to="/catalogue" className="w-full sm:w-auto">
            <Button variant="secondary" size="lg" className="w-full" rightIcon={<ArrowRight size={18} />}>
              Voir le catalogue
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
