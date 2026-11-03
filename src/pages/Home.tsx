import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CreditCard, Package, ShieldCheck, Truck, Wallet } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { SkeletonCard } from '../components/ui/Skeleton';
import { ProductCard } from '../components/ProductCard';
import { usePageMeta } from '../hooks/usePageMeta';
import { produitsApi } from '../api/produits.api';
import { categoriesApi } from '../api/categories.api';
import type { Categorie, Produit } from '../types';

/** Arguments de réassurance. */
const uspItems = [
  {
    icon: Wallet,
    title: 'Prix en FCFA',
    description: 'Prix et stocks toujours à jour.',
  },
  {
    icon: ShieldCheck,
    title: 'Produits garantis',
    description: 'Marques officielles, retours sous 30 jours.',
  },
  {
    icon: Truck,
    title: 'Livraison à Abidjan en 48 h',
    description: 'Suivi de commande en temps réel.',
  },
  {
    icon: CreditCard,
    title: 'Paiement local',
    description: 'Orange Money · MTN Money · Wave · Carte',
  },
];

const heroStats: Array<[string, string]> = [
  ['50+', 'références'],
  ['48 h', 'livraison'],
  ['30 j', 'pour changer d’avis'],
];

export function Home() {
  usePageMeta({
    title: 'WorkStore - Fournitures de Bureau',
    description:
      'Papeterie, informatique et fournitures de bureau : des milliers de références au meilleur prix, livrées à Abidjan en 48 h.',
    path: '/',
  });

  const [categories, setCategories] = useState<Categorie[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [featured, setFeatured] = useState<Produit[]>([]);
  const [nouveautes, setNouveautes] = useState<Produit[]>([]);
  const [produitsLoading, setProduitsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    categoriesApi
      .getAll()
      .then((res) => {
        if (!cancelled) setCategories((res.data.data ?? []).filter((c) => c.actif));
      })
      .catch(() => {
        if (!cancelled) setCategories([]);
      })
      .finally(() => {
        if (!cancelled) setCategoriesLoading(false);
      });

    Promise.allSettled([
      produitsApi.getFeatured(),
      produitsApi.getAll({ sort: 'nouveautes', limit: 4 }),
    ])
      .then(([top, recents]) => {
        if (cancelled) return;
        setFeatured(top.status === 'fulfilled' ? (top.value.data.data ?? []) : []);
        setNouveautes(recents.status === 'fulfilled' ? (recents.value.data.data ?? []) : []);
      })
      .finally(() => {
        if (!cancelled) setProduitsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const heroImages = featured
    .map((p) => p.images?.[0]?.url)
    .filter((url): url is string => Boolean(url))
    .slice(0, 3);

  return (
    <div className="bg-white">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="border-b border-border-brand bg-gradient-to-b from-primary-50/70 to-white">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-[1.05fr_1fr] lg:px-10 lg:py-16">
          <div>
            <span className="inline-flex items-center gap-2 rounded-pill border border-primary-200 bg-white px-3 py-1 text-xs font-medium text-primary-700">
              <span className="h-1.5 w-1.5 rounded-full bg-primary-500" aria-hidden="true" />
              Livraison à Abidjan en 48 h
            </span>
            <h1 className="mt-5 max-w-xl font-display text-[34px] font-semibold leading-[1.1] text-ink sm:text-[44px] lg:text-[52px]">
              Tout pour votre bureau, <span className="text-primary-600">au juste prix.</span>
            </h1>
            <p className="mt-4 max-w-lg text-base leading-7 text-ink-soft">
              Papeterie, informatique, impression et mobilier : plus de 50 références de grandes
              marques, prix affichés en FCFA et paiement par Mobile Money.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/catalogue">
                <Button size="lg" rightIcon={<ArrowRight size={18} aria-hidden="true" />}>
                  Découvrir le catalogue
                </Button>
              </Link>
              <a href="#categories">
                <Button size="lg" variant="secondary">
                  Parcourir les rayons
                </Button>
              </a>
            </div>
            <dl className="mt-9 grid max-w-md grid-cols-3 gap-6 border-t border-border-brand pt-6">
              {heroStats.map(([value, label]) => (
                <div key={label}>
                  <dt className="sr-only">{label}</dt>
                  <dd className="font-display text-2xl font-semibold text-ink">{value}</dd>
                  <dd className="mt-0.5 text-xs text-ink-soft">{label}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative hidden h-[420px] lg:block" aria-hidden="true">
            {heroImages.length >= 3 ? (
              <>
                <img
                  src={heroImages[0]}
                  alt=""
                  className="absolute right-0 top-0 h-[300px] w-[72%] rounded-2xl object-cover shadow-aside"
                />
                <img
                  src={heroImages[1]}
                  alt=""
                  className="absolute bottom-0 left-0 h-[220px] w-[48%] rounded-2xl border-4 border-white object-cover shadow-aside"
                />
                <img
                  src={heroImages[2]}
                  alt=""
                  className="absolute bottom-6 right-6 h-[150px] w-[34%] rounded-2xl border-4 border-white object-cover shadow-aside"
                />
              </>
            ) : (
              <div className="h-full w-full animate-pulse rounded-2xl bg-primary-50" />
            )}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 sm:pb-16 lg:px-10">
        {/* ── Catégories ─────────────────────────────────────────────────── */}
        <section id="categories" className="scroll-mt-28 pt-12 sm:pt-16">
          <SectionHeader title="Nos rayons" eyebrow="Catégories" />

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
            {categoriesLoading
              ? Array.from({ length: 8 }).map((_, index) => (
                  <div key={index} className="aspect-[4/3] animate-pulse rounded-xl bg-page" />
                ))
              : categories.map((categorie) => (
                  <Link
                    key={categorie.id}
                    to={`/catalogue?categorie=${categorie.id}`}
                    className="group relative isolate flex aspect-[4/3] flex-col justify-end overflow-hidden rounded-xl bg-ink p-4"
                  >
                    {categorie.image && (
                      <img
                        src={categorie.image}
                        alt=""
                        loading="lazy"
                        className="absolute inset-0 -z-10 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    )}
                    <span
                      className="absolute inset-0 -z-10 bg-gradient-to-t from-ink/85 via-ink/25 to-transparent"
                      aria-hidden="true"
                    />
                    <span className="font-display text-base font-semibold text-white sm:text-lg">
                      {categorie.nom}
                    </span>
                    {categorie.description && (
                      <span className="mt-0.5 line-clamp-1 text-xs text-white/75 sm:text-[13px]">
                        {categorie.description}
                      </span>
                    )}
                  </Link>
                ))}
            {!categoriesLoading && (
              <Link
                to="/catalogue"
                className="group flex aspect-[4/3] flex-col items-start justify-end rounded-xl border border-dashed border-line-strong p-4 transition-colors hover:border-primary-600 hover:bg-primary-50"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-50 text-primary-700 transition-colors group-hover:bg-primary-600 group-hover:text-white">
                  <ArrowRight size={18} aria-hidden="true" />
                </span>
                <span className="mt-3 font-display text-base font-semibold text-ink">
                  Tout le catalogue
                </span>
              </Link>
            )}
          </div>
        </section>

        {/* ── Les plus commandés ─────────────────────────────────────────── */}
        <ProductRow
          title="Les plus commandés"
          eyebrow="Meilleures ventes"
          produits={featured.slice(0, 4)}
          loading={produitsLoading}
        />

        {/* ── Réassurance ────────────────────────────────────────────────── */}
        <section className="mt-14 sm:mt-16">
          <div className="grid gap-px overflow-hidden rounded-xl border border-border-brand bg-border-brand sm:grid-cols-2 lg:grid-cols-4">
            {uspItems.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="flex items-start gap-3 bg-white p-5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-700">
                    <Icon size={18} aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-ink">{item.title}</p>
                    <p className="mt-0.5 text-[13px] leading-5 text-ink-soft">{item.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Nouveautés ─────────────────────────────────────────────────── */}
        <ProductRow
          title="Nouveautés"
          eyebrow="Fraîchement arrivés"
          produits={nouveautes}
          loading={produitsLoading}
          link="/catalogue?sort=nouveautes"
        />

        {/* ── Bandeau entreprises ────────────────────────────────────────── */}
        <section className="mt-14 sm:mt-16">
          <div className="relative overflow-hidden rounded-2xl bg-ink px-6 py-10 sm:px-10 lg:px-14">
            <div
              className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary-600/40 blur-3xl"
              aria-hidden="true"
            />
            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-xl">
                <p className="text-xs font-medium uppercase tracking-[0.08em] text-primary-300">
                  Entreprises &amp; administrations
                </p>
                <h2 className="mt-2 font-display text-2xl font-semibold text-white sm:text-3xl">
                  Équipez toute votre équipe en une seule commande.
                </h2>
                <p className="mt-3 text-sm leading-6 text-white/70">
                  Créez votre compte, enregistrez vos adresses de livraison et suivez chaque
                  commande jusqu’à votre bureau.
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap gap-3">
                <Link to="/register">
                  <Button variant="accent" size="lg">
                    Créer un compte
                  </Button>
                </Link>
                <a href="mailto:contact@workstore.ci">
                  <Button size="lg" variant="ghost" className="!text-white hover:!bg-white/10">
                    Nous contacter
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function SectionHeader({
  title,
  eyebrow,
  link = '/catalogue',
}: {
  title: string;
  eyebrow?: string;
  link?: string;
}) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        {eyebrow && (
          <p className="text-xs font-medium uppercase tracking-[0.08em] text-primary-600">
            {eyebrow}
          </p>
        )}
        <h2 className="mt-1 font-display text-2xl font-semibold text-ink sm:text-[28px]">
          {title}
        </h2>
      </div>
      <Link
        to={link}
        className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-primary-700 transition-colors hover:text-primary-600"
      >
        Tout voir <ArrowRight size={15} aria-hidden="true" />
      </Link>
    </div>
  );
}

function ProductRow({
  title,
  eyebrow,
  produits,
  loading,
  link,
}: {
  title: string;
  eyebrow: string;
  produits: Produit[];
  loading: boolean;
  link?: string;
}) {
  return (
    <section className="mt-14 sm:mt-16">
      <SectionHeader title={title} eyebrow={eyebrow} link={link} />
      {loading ? (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      ) : produits.length > 0 ? (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          {produits.map((produit) => (
            <ProductCard key={produit.id} produit={produit} />
          ))}
        </div>
      ) : (
        <Card className="mt-6">
          <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-50 text-primary-700">
              <Package size={22} aria-hidden="true" />
            </span>
            <p className="font-display text-base font-semibold text-ink">
              Aucun produit à afficher pour le moment
            </p>
            <Link to="/catalogue">
              <Button variant="secondary">Voir le catalogue</Button>
            </Link>
          </div>
        </Card>
      )}
    </section>
  );
}
