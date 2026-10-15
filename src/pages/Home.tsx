import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Truck,
  ShieldCheck,
  RotateCcw,
  Headphones,
  Star,
  ShoppingCart,
  Check,
  PenLine,
  Armchair,
  Monitor,
  FileText,
  Package,
  Mail,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { usePageMeta } from '../hooks/usePageMeta';

const categories = [
  {
    name: 'Papeterie',
    icon: FileText,
    description: 'Papiers, cahiers et blocs-notes',
  },
  {
    name: 'Écriture',
    icon: PenLine,
    description: 'Stylos, crayons et marqueurs',
  },
  {
    name: 'Mobilier',
    icon: Armchair,
    description: 'Bureaux, fauteuils et rangements',
  },
  {
    name: 'Informatique',
    icon: Monitor,
    description: 'Accessoires et périphériques',
  },
];

const advantages = [
  {
    icon: Truck,
    title: 'Livraison 24/48h',
    description: 'Expédié depuis nos entrepôts en France',
  },
  {
    icon: ShieldCheck,
    title: 'Paiement sécurisé',
    description: 'CB, virement ou paiement en plusieurs fois',
  },
  {
    icon: RotateCcw,
    title: 'Retours 30 jours',
    description: 'Satisfait ou remboursé, sans justification',
  },
  {
    icon: Headphones,
    title: 'Support dédié',
    description: 'Une équipe à votre écoute 6j/7',
  },
];

const featuredProducts = [
  {
    name: 'Ramette de papier A4 80g',
    category: 'Papeterie',
    price: '3 900 FCFA',
    oldPrice: '4 900 FCFA',
    rating: '4,6',
    discount: 20,
  },
  {
    name: 'Stylo à bille bleu (lot de 10)',
    category: 'Écriture',
    price: '5 600 FCFA',
    oldPrice: null,
    rating: '4,8',
    discount: null,
  },
  {
    name: 'Fauteuil de bureau ergonomique',
    category: 'Mobilier',
    price: '124 000 FCFA',
    oldPrice: '163 300 FCFA',
    rating: '4,5',
    discount: 24,
  },
  {
    name: 'Souris sans fil silencieuse',
    category: 'Informatique',
    price: '16 400 FCFA',
    oldPrice: null,
    rating: '4,7',
    discount: null,
  },
];

const heroPills = ['+10 000 références', 'Livraison 24/48h', 'Paiement sécurisé'];

export function Home() {
  usePageMeta({
    title: 'BureauStore - Fournitures de Bureau',
    description:
      'Papeterie, mobilier, informatique : plus de 10 000 références de fournitures de bureau au meilleur prix. Livraison 24/48h en France.',
    path: '/',
  });

  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [honeypot, setHoneypot] = useState('');

  const handleSubscribe = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Anti-spam : si le champ caché est rempli, c'est un bot — on ignore.
    if (honeypot) return;
    if (!email.trim()) return;
    setSubscribed(true);
    setEmail('');
  };

  return (
    <div>
      {/* Hero — split layout */}
      <section className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* Contenu */}
            <div className="space-y-8">
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500">Fournitures de bureau</span>
                <span className="text-primary-600">/</span>
                <span className="text-sm font-medium text-primary-600">Nouveautés</span>
              </div>

              <h1 className="text-4xl font-bold leading-[1.1] text-slate-900 sm:text-5xl lg:text-6xl">
                Tout le bureau, <span className="text-primary-600">livré en 24/48h</span>
              </h1>

              <p className="max-w-lg text-lg text-slate-600">
                Papeterie, mobilier, informatique… Découvrez plus de 10 000 références au meilleur
                prix pour équiper votre entreprise ou votre bureau à la maison.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link to="/catalogue">
                  <Button
                    size="lg"
                    className="bg-primary-600 hover:bg-primary-700"
                    rightIcon={<ArrowRight size={18} />}
                  >
                    Découvrir le catalogue
                  </Button>
                </Link>
                <Link
                  to="/catalogue"
                  className="inline-flex items-center gap-2 font-semibold text-primary-600 transition-all duration-300 hover:gap-3"
                >
                  Nos marques
                  <ArrowRight size={20} aria-hidden="true" />
                </Link>
              </div>

              {/* Feature pills */}
              <div className="flex flex-wrap gap-3 pt-4">
                {heroPills.map((pill) => (
                  <div
                    key={pill}
                    className="flex items-center gap-2 rounded-full bg-primary-50 px-4 py-2"
                  >
                    <Check size={16} className="text-primary-600" aria-hidden="true" />
                    <span className="text-sm text-slate-700">{pill}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Image produit */}
            <div>
              <div className="relative aspect-square overflow-hidden rounded-3xl bg-slate-100 shadow-2xl shadow-primary-900/10 ring-1 ring-slate-200">
                <img
                  src="https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=1200&auto=format&fit=crop&q=80"
                  alt="Fournitures de bureau colorées disposées à plat"
                  fetchPriority="high"
                  className="h-full w-full object-cover"
                />
                <div className="absolute right-4 top-4 rounded-full bg-primary-600 px-3 py-1.5 text-sm font-semibold text-white">
                  Nouveautés
                </div>
                <div className="absolute bottom-4 left-4 rounded-xl bg-white/90 px-4 py-2 backdrop-blur-xs">
                  <span className="text-2xl font-bold text-slate-900">-20%</span>
                  <span className="ml-1 text-sm text-slate-500">sur le mobilier</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bandeau avantages */}
      <section className="border-b border-slate-100 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-10 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
          {advantages.map((advantage) => {
            const Icon = advantage.icon;
            return (
              <div key={advantage.title} className="flex items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-600">
                  <Icon size={22} aria-hidden="true" />
                </span>
                <div>
                  <p className="font-semibold text-slate-900">{advantage.title}</p>
                  <p className="mt-0.5 text-sm text-slate-500">{advantage.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Catégories */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-primary-600">
              Nos univers
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
              Explorez par catégorie
            </h2>
          </div>
          <Link
            to="/catalogue"
            className="hidden items-center gap-1 text-sm font-medium text-primary-600 transition-colors hover:text-primary-700 sm:inline-flex"
          >
            Tout voir <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Link key={category.name} to="/catalogue" className="group">
                <Card variant="hover" className="h-full p-6">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                    <Icon size={24} aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 text-lg font-semibold tracking-tight text-slate-900">
                    {category.name}
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">{category.description}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary-600 transition-colors group-hover:text-primary-700">
                    Voir <ArrowRight size={14} aria-hidden="true" />
                  </span>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Bandeau promo */}
      <section className="bg-primary-600 text-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-10 text-center sm:px-6 md:flex-row md:text-left lg:px-8">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-primary-100">
              Offre de bienvenue
            </p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight">
              -10% sur votre première commande
            </h2>
            <p className="mt-1 text-sm text-primary-100">
              Utilisez le code{' '}
              <span className="rounded bg-white/20 px-2 py-0.5 font-bold">BIENVENUE10</span> au
              moment du paiement.
            </p>
          </div>
          <Link to="/catalogue">
            <Button size="lg" className="bg-white text-primary-700 hover:bg-primary-50">
              J'en profite
            </Button>
          </Link>
        </div>
      </section>

      {/* Produits vedettes */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-primary-600">
              Sélection
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
              Produits vedettes
            </h2>
          </div>
          <Link
            to="/catalogue"
            className="hidden items-center gap-1 text-sm font-medium text-primary-600 transition-colors hover:text-primary-700 sm:inline-flex"
          >
            Tout voir <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featuredProducts.map((product) => (
            <Link key={product.name} to="/catalogue" className="group">
              <Card variant="hover" className="flex h-full flex-col overflow-hidden">
                <div className="relative aspect-[4/3] bg-slate-100">
                  <div className="flex h-full items-center justify-center text-slate-300">
                    <Package size={40} aria-hidden="true" />
                  </div>
                  {product.discount && (
                    <Badge className="absolute left-2 top-2 bg-primary-600 text-white">
                      -{product.discount}%
                    </Badge>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <p className="text-xs font-medium uppercase tracking-wider text-primary-600">
                    {product.category}
                  </p>
                  <h3 className="mt-1 line-clamp-2 font-semibold text-slate-900">
                    {product.name}
                  </h3>
                  <div className="mt-2 flex items-center gap-1">
                    <Star size={14} className="fill-primary-500 text-primary-500" aria-hidden="true" />
                    <span className="text-sm font-medium text-slate-700">{product.rating}</span>
                  </div>
                  <div className="mt-auto flex items-center justify-between pt-3">
                    <div>
                      {product.oldPrice && (
                        <p className="text-xs text-slate-400 line-through">{product.oldPrice}</p>
                      )}
                      <p className="text-lg font-bold tabular-nums text-slate-900">
                        {product.price}
                      </p>
                    </div>
                    <span
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-600 text-white transition-colors group-hover:bg-primary-700"
                      aria-label="Ajouter au panier"
                    >
                      <ShoppingCart size={16} aria-hidden="true" />
                    </span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Newsletter — section bleu encre */}
      <section className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-br from-primary-500 to-primary-600 p-8 shadow-xl shadow-primary-900/10 sm:p-10">
            <div className="grid items-center gap-8 lg:grid-cols-2">
              <div className="flex items-start gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/20">
                  <Mail size={22} className="text-white" aria-hidden="true" />
                </span>
                <div>
                  <h2 className="text-2xl font-bold text-white sm:text-3xl">Restez informé</h2>
                  <p className="mt-2 text-primary-100">
                    Offres exclusives et nouveautés de la boutique, directement dans votre boîte
                    mail.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubscribe} className="w-full">
                <div className="flex flex-col gap-3 sm:flex-row">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Votre adresse email"
                    aria-label="Votre adresse email"
                    className="h-11 flex-1 rounded-xl bg-white px-4 text-sm text-slate-900 shadow-xs transition-colors placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-white/50"
                  />
                  <input
                    type="text"
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                    aria-hidden="true"
                    tabIndex={-1}
                    autoComplete="off"
                    className="absolute -left-[9999px] h-0 w-0 opacity-0"
                  />
                  <button
                    type="submit"
                    className="h-11 whitespace-nowrap rounded-xl bg-slate-900 px-6 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
                  >
                    S'abonner
                  </button>
                </div>
                {subscribed && (
                  <p className="mt-3 text-sm text-primary-100">
                    Merci ! Votre inscription à la newsletter a bien été prise en compte.
                  </p>
                )}
                <p className="mt-3 text-xs text-primary-200">
                  En vous inscrivant, vous acceptez notre politique de confidentialité.
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}