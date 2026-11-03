import { useEffect } from 'react';

/**
 * Domaine public du site — point unique de configuration.
 * Renseigné via `VITE_SITE_URL` (voir `.env.example`) ; fallback documenté ici.
 */
const SITE_URL = (import.meta.env.VITE_SITE_URL ?? 'https://www.workstore.ci').replace(/\/+$/, '');
const SITE_NAME = 'WorkStore';
const DEFAULT_TITLE = 'WorkStore - Fournitures de Bureau';
const DEFAULT_DESCRIPTION =
  'Papeterie, informatique et fournitures de bureau : des milliers de références au meilleur prix, livrées à Abidjan en 48 h.';

export { SITE_URL, SITE_NAME, DEFAULT_TITLE, DEFAULT_DESCRIPTION };

interface PageMetaOptions {
  title: string;
  description?: string;
  /** Chemin de la page, ex: /catalogue */
  path?: string;
  /** Image Open Graph (chemin public, ex: /og-image.svg) */
  ogImage?: string;
  /** Empêche l'indexation (pages privées) */
  noIndex?: boolean;
}

function setMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

/**
 * Met à jour les balises meta (title, description, canonical, Open Graph, Twitter)
 * pour chaque page. À appeler dans chaque page.
 */
export function usePageMeta({ title, description, path = '/', ogImage, noIndex }: PageMetaOptions) {
  useEffect(() => {
    const fullTitle = title === DEFAULT_TITLE ? title : `${title} | ${SITE_NAME}`;
    document.title = fullTitle;

    const desc = description ?? DEFAULT_DESCRIPTION;
    setMeta('name', 'description', desc);
    setMeta('property', 'og:title', fullTitle);
    setMeta('property', 'og:description', desc);
    setMeta('property', 'og:type', 'website');
    setMeta('property', 'og:url', `${SITE_URL}${path}`);
    setMeta('property', 'og:site_name', SITE_NAME);
    setMeta('property', 'og:image', `${SITE_URL}${ogImage ?? '/og-image.svg'}`);
    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', fullTitle);
    setMeta('name', 'twitter:description', desc);
    setMeta('name', 'twitter:image', `${SITE_URL}${ogImage ?? '/og-image.svg'}`);

    // Lien canonique
    setLink('canonical', `${SITE_URL}${path}`);

    // Indexation
    let robots = document.head.querySelector<HTMLMetaElement>('meta[name="robots"]');
    if (noIndex) {
      if (!robots) {
        robots = document.createElement('meta');
        robots.setAttribute('name', 'robots');
        document.head.appendChild(robots);
      }
      robots.setAttribute('content', 'noindex, nofollow');
    } else if (robots) {
      robots.remove();
    }

    return () => {
      document.title = DEFAULT_TITLE;
    };
  }, [title, description, path, ogImage, noIndex]);
}