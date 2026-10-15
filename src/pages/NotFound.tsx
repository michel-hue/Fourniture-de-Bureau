import { Link } from 'react-router-dom';
import { ArrowRight, Home, PackageSearch } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { usePageMeta } from '../hooks/usePageMeta';

/**
 * Illustration 404 : une feuille de papier égarée avec un trombone,
 * un stylo et un "404" tamponné — dans l'univers BureauStore.
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
          stroke="#C3D5E8"
          strokeWidth="7"
          strokeLinecap="round"
        />
      </g>

      {/* Feuille de papier */}
      <g transform="translate(160,120)">
        <rect x="-95" y="-80" width="190" height="160" rx="10" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="2" />
        {/* Lignes de texte */}
        <line x1="-65" y1="-40" x2="65" y2="-40" stroke="#E2E8F0" strokeWidth="4" strokeLinecap="round" />
        <line x1="-65" y1="-15" x2="45" y2="-15" stroke="#E2E8F0" strokeWidth="4" strokeLinecap="round" />
        <line x1="-65" y1="10" x2="65" y2="10" stroke="#E2E8F0" strokeWidth="4" strokeLinecap="round" />
        <line x1="-65" y1="35" x2="30" y2="35" stroke="#E2E8F0" strokeWidth="4" strokeLinecap="round" />
        {/* Coin plié */}
        <path d="M95,-80 L95,-30 L45,-80 Z" fill="#F1F5F9" stroke="#E2E8F0" strokeWidth="2" />
        {/* Tampon 404 */}
        <g transform="rotate(-8)">
          <rect x="-52" y="-62" width="104" height="52" rx="8" fill="#F0F5FA" stroke="#4A76A6" strokeWidth="3" strokeDasharray="6 4" />
          <text
            x="0"
            y="-28"
            textAnchor="middle"
            fontFamily="system-ui, sans-serif"
            fontWeight="800"
            fontSize="34"
            fill="#3A5F8F"
          >
            404
          </text>
        </g>
      </g>

      {/* Stylo orange (signature de la marque) */}
      <g transform="translate(250,190) rotate(35)">
        <rect x="-70" y="-8" width="140" height="16" rx="8" fill="#F97B1C" />
        <polygon points="70,-8 70,8 88,0" fill="#C24A0C" />
        <rect x="-70" y="-8" width="10" height="16" rx="3" fill="#3A5F8F" />
      </g>

      {/* Agrafe (décor) */}
      <g transform="translate(60,185)">
        <path d="M0,0 L0,18 L14,18 L14,6 L6,6 L6,12" fill="none" stroke="#9BB8D6" strokeWidth="4" strokeLinecap="round" />
      </g>

      {/* Points de gomme (décor) */}
      <circle cx="285" cy="45" r="6" fill="#FDE68A" />
      <circle cx="300" cy="70" r="4" fill="#FCA5A5" />
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
    <div className="relative overflow-hidden bg-slate-50">
      {/* Décor de fond : lignes de cahier */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(transparent, transparent 39px, #E2E8F0 39px, #E2E8F0 40px)',
        }}
      />

      <div className="relative mx-auto flex min-h-[80vh] max-w-3xl flex-col items-center justify-center px-4 py-20 text-center">
        <NotFoundIllustration />

        <p className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary-50 px-4 py-1.5 text-sm font-medium text-primary-700">
          <PackageSearch size={16} aria-hidden="true" />
          Erreur 404
        </p>

        <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Oups, cette page s'est égarée dans le classeur…
        </h1>

        <p className="mt-4 max-w-md text-slate-600">
          La page que vous cherchez a peut-être été déplacée, renommée ou n'existe plus.
          Pas de panique, nos fournitures, elles, sont bien rangées.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link to="/">
            <Button
              size="lg"
              className="w-full bg-primary-600 hover:bg-primary-700 sm:w-auto"
              leftIcon={<Home size={18} />}
            >
              Retour à l'accueil
            </Button>
          </Link>
          <Link to="/catalogue">
            <Button
              variant="secondary"
              size="lg"
              className="w-full sm:w-auto"
              rightIcon={<ArrowRight size={18} />}
            >
              Voir le catalogue
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}