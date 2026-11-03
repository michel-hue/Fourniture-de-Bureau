# WorkStore — Design System & Refonte UX

> **Vague 2 — affinage (nov. 2026)** : traits allégés pour un rendu plus moderne et cohérent.
> - Bordures **1px** partout (`border-border-brand` = `#E5ECEE`), contours de champs `border-line-strong` (`#CFD9DE`) au lieu du gris-bleu foncé ; plus aucune bordure 1,5px / 3px.
> - Graisse max **600** pour Outfit (titres, prix, boutons) et 500/600 pour Public Sans ; plus de 700/800 sur le texte courant.
> - Rayons : cards 12px, boutons 8px (`rounded-lg`) ; ombres plus diffuses (`shadow-card`, `shadow-hover`, `shadow-aside`).
> - Badges en teintes pâles (warning/accent n'utilisent plus le jaune plein).
> - Composants partagés : `PageHeader` (en-tête de toutes les pages), `AccountLayout` (espace client), `FavoriButton`, `ProductCard` (image bord à bord, bouton panier compact).
> Les sections ci-dessous qui mentionnent 1,5px / 800 décrivent la vague 1 et sont remplacées par ces règles.

> Document de référence pour le frontend (React 19 + Vite + Tailwind CSS 4 + lucide-react).
> **Source de vérité** : `maquette/SPEC_DESIGN.md` (prototype 4 écrans). Ce document en est le reflet applicatif : tokens, classes Tailwind réellement disponibles, composants.
> Marque : **BureauStore → WorkStore** (vague 1 = fondations ; la refonte des pages — Home / Catalogue / Checkout / Admin — fait l'objet des vagues suivantes).

---

## 1. Identité de marque

| Élément | Valeur |
|---|---|
| Nom | **WorkStore** (wordmark : `Work` en couleur courante + `Store` en teal) |
| Domaine public | `https://www.workstore.ci` — configuré **une seule fois** : `src/hooks/usePageMeta.ts` (`SITE_URL = import.meta.env.VITE_SITE_URL ?? 'https://www.workstore.ci'`), variables dans `.env.example` |
| Email de contact | `contact@workstore.ci` |
| theme-color / teal primaire | `#00797D` |
| Logos officiels | `maquette/workstore-icone-*.svg` copiés dans `public/` : `logo-workstore.svg`, `logo-workstore-fonce.svg`, `logo-workstore-monochrome-blanc.svg`, `logo-workstore-monochrome-nuit.svg` (+ `favicon.svg`, `og-image.svg`) |
| Composant | `src/components/Logo.tsx` → `<Logo size={34} variant="couleur" />` et `<Wordmark tone="dark" />` |

### `Logo` — variantes

| `variant` | Polygon | Point | « W » | Usage |
|---|---|---|---|---|
| `couleur` (défaut) | `#00797D` | `#FFB800` | blanc | fond clair (header, pages) |
| `fond-fonce` | `#3FD0D4` | `#FFB800` | `#0A2540` | fond navy (sidebar admin, footer, panneau marque login) |
| `monochrome-blanc` | blanc | teal | teal | sérigraphie / fond foncé uni |
| `monochrome-nuit` | navy | blanc | blanc | fond teal clair |

Props : `size?: number` (px), `variant?`, `className?`. `aria-label="WorkStore"` toujours présent.

### `Wordmark`

`<Wordmark tone="dark" | "light" size?: number className?: string />`
- `tone="dark"` (fond clair) : `Work` = `text-ink`, `Store` = `text-primary-600`
- `tone="light"` (fond navy) : `Work` = blanc, `Store` = `text-primary-400` (`#3FD0D4`)
- Taille par défaut responsive : `text-[26px] max-sm:text-[22px]` ; sinon passer `size={22}` (admin).

---

## 2. Tokens (`src/index.css` → `@theme`)

### A. Palette — classes générées

#### Primaire — Teal

| Classe | Hex | Usage |
|---|---|---|
| `bg-primary-50` / `bg-surface` | `#E3F5F4` | surface teal pâle : zone image produit, barre de recherche, chips, tuiles catégories, bandeau USP, hover ghost |
| `bg-primary-100` | `#D2EFEE` | survols/états légers |
| `border-primary-200` | `#B4E5E4` | bordures décoratives |
| `text-primary-300` | `#7FD9DB` | bordures hover de cards |
| `text-primary-400` | `#3FD0D4` | **teal clair** — wordmark « Store » sur navy, icônes sur navy, toasts info |
| `bg-primary-500` | `#14A6A9` | teal intermédiaire |
| `bg-primary-600` / `text-primary-600` / `border-primary-600` | `#00797D` | **couleur de base** : boutons, liens actifs, nav active, radio cochée, chip actif, hero, pagination active, item sidebar admin actif, focus ring |
| `bg-primary-700` / `text-primary-700` | `#00585B` | **hover de tout ce qui est teal**, texte de lien actif |
| `text-primary-800` → `950` | `#004A4D` → `#02292B` | variantes sombres (rarement utilisées) |

#### Accent — Jaune

| Classe | Hex | Usage |
|---|---|---|
| `bg-accent-500` | `#FFB800` | **jaune accent** : CTA promo/paiement (`Button variant="accent"`), compteur panier, badge promo, badge « Stock faible » (`Badge variant="warning"`), point du logo |
| `hover:bg-accent-600` | `#E5A600` | hover du jaune |
| `text-accent-700` | `#9A7100` | texte jaune sur fond clair |
| `bg-accent-50/100` | `#FFF9E6` / `#FFF2CE` | fonds d'alerte warning |

#### Encre, surfaces, bordures (tokens explicites)

| Classe | Hex | Usage |
|---|---|---|
| `text-ink` / `bg-ink` | `#0A2540` | **navy** : texte principal, texte sur jaune, fond footer, fond sidebar admin, fond toasts, overlay modals (`bg-ink/50`) |
| `text-ink-soft` | `#4F6B7F` | texte secondaire, labels, placeholders, icônes discrètes |
| `bg-surface` | `#E3F5F4` | surface teal pâle (alias de `primary-50`) |
| `bg-page` | `#F6FBFB` | fond de page checkout & admin, hover de ligne de table, footer de card |
| `border-border-brand` | `#cfe9e7` | **bordure standard 1.5px** : cards, header, nav, tables, séparateurs |

> ⚠️ La classe générée par `--color-border-brand` est **`border-border-brand`** (ex. `border-b-[1.5px] border-border-brand`).

#### Palette statut (pills → `Badge`)

| `Badge variant` | Fond | Texte | Spec |
|---|---|---|---|
| `success` (En stock / Payée) | `bg-success-100` `#DDF2E4` | `text-success-700` `#187A42` | ✓ |
| `warning` (Stock faible / À réappro) | `bg-warning-500` `#FFB800` | `text-ink` `#0A2540` | ✓ |
| `error` (Rupture / erreur) | `bg-error-100` `#FBE3E4` | `text-error-700` `#B3262F` | ✓ |
| `info` (En préparation) | `bg-info-100` `#E3F5F4` | `text-info-700` `#00585B` | ✓ |
| `neutral` (Expédiée) | `bg-neutral-100` `#E4EAF0` (écrase le neutre Tailwind) | `text-ink` | ✓ |
| `primary` | `bg-surface` `#E3F5F4` | `text-primary-700` | ✓ |
| `accent` | `bg-accent-500` `#FFB800` | `text-ink` | ✓ |

Autres échelles sémantiques (alertes, toasts, formulaires) : `success-*`, `error-*`, `warning-*`, `info-*` avec les mêmes valeurs (50 = fond, 100 = pill, 600/700 = texte et icônes, 500 = icône sur fond sombre).

#### Tints illustration / charts

| Classe | Hex | Usage |
|---|---|---|
| `bg-tint-light` | `#7fbcbd` | barres de chart (hors dernière) |
| `bg-tint-mid` | `#4aa1a3` | barres médianes |
| (actif) | `#00797D` | dernière barre (`bg-primary-600`) |

#### Neutres

Les neutres **`slate-*`** natifs de Tailwind restent disponibles (usages transitoires). La spec privilégie `text-ink` (navy) + `text-ink-soft` (gris-bleu) sur fond blanc.

### B. Typographie

Chargées via Google Fonts dans `index.html` (Inter est supprimé).

| Police | Poids | Classe | Usage |
|---|---|---|---|
| **Outfit** | 600/700/800 | `font-display` | titres, prix, boutons, KPI, wordmark, onglets pagination |
| **Public Sans** | 400/600/700 | `font-sans` (défaut) | corps, UI, labels, pills, tables |
| **JetBrains Mono** | 400/700 | `font-mono` | SKU, n° de commande, codes coupons |

Échelle (spec) : H1 hero 52/56 800 · H1 page 36/40 800 · H2 section 28/800 · H2 card 22/700 · H3 produit 16/22 700 · prix card 22/800 · total 28/800 · KPI 32/800 · bouton 15/700 (`text-[15px] font-display font-bold`) · CTA promo 18/800 · wordmark 26/800 (mobile 22) · corps 16/24 400 · méta 13 · eyebrow 11 uppercase `tracking-[0.1em]` 700 · pill 12/700 · mono 13.

Classes Tailwind utilitaires : `text-[26px]`, `text-[15px]`, `text-[11px]`, `tracking-[0.1em]`, `leading-[1.1]`, etc.

### C. Rayons, bordures, ombres

| Rayon | Classe | Valeur | Usage |
|---|---|---|---|
| `--radius-lg` | `rounded-lg` | **8px** | images, inputs, steppers, pagination |
| `--radius-xl` | `rounded-xl` | **14px** | **cards, boutons, options, alertes** |
| `--radius-2xl` / `3xl` | `rounded-2xl` / `rounded-3xl` | **20px** | hero, bandeaux, modals, grandes surfaces |
| `--radius-pill` | `rounded-pill` | **99px** | pills, chips, badges, recherche, avatars (Ø), compteur panier |
| — | `rounded-full` | 9999px | cercles (icônes rondes, avatars) — toujours possible |

> `rounded-3xl` (anciennement 24px) est plafonné à **20px** ; les cards doivent utiliser `rounded-xl` (14px).

**Bordures** : `border-[1.5px] border-border-brand` (standard) · `border-[1.5px] border-primary-600` (outline/actif) · `border-[1.5px] border-ink-soft` (inputs/steppers) · `border-b-[3px] border-primary-600` (nav active) · `border-t border-border-brand` (séparateurs de table, 1px).

**Ombres** (`--shadow-*`) :

| Classe | Valeur | Usage |
|---|---|---|
| `shadow-card` (et `shadow-sm`, redéfini) | `0 1px 2px rgba(10,37,64,.1)` | cards au repos |
| `shadow-aside` | `0 8px 22px rgba(10,37,64,.14)` | aside récapitulatif, modals, toasts, drawer admin |

### D. Animations

Inchangées : `animate-fade-in`, `animate-modal-in`, `animate-toast-in` (+ `animate-pulse` pour les skeletons).

---

## 3. Composants UI (`src/components/ui/`) — API inchangée, restylage visuel

| Composant | Spécificités visuelles |
|---|---|
| `Button` | `rounded-xl` · `font-display font-bold` · `primary` = `bg-primary-600 hover:bg-primary-700` · `accent` = jaune `bg-accent-500 text-ink` · `secondary` = blanc + `border-[1.5px] border-border-brand` · `outline` = `border-[1.5px] border-primary-600` · tailles `sm` min-h 36 / `md` **min-h 44** (15px) / `lg` **min-h 52** (18/800) · `focus-visible:ring-2 ring-primary-600 ring-offset-2` |
| `Badge` (pill) | `rounded-pill px-2.5 py-[3px] text-xs font-bold` — palette statut ci-dessus |
| `Card` | `rounded-xl border-[1.5px] border-border-brand bg-white shadow-card` · variant `hover` · `CardFooter` = `bg-page` |
| `Input` / `Select` / `Textarea` | `h-11 rounded-lg border-[1.5px] border-ink-soft text-[15px]` · label `text-sm font-semibold text-ink-soft` · focus `border-primary-600 ring-4 ring-primary-600/10` · erreur `border-error-600` + `text-error-700` · disabled `bg-page` |
| `Modal` | `rounded-2xl border-[1.5px] border-border-brand shadow-aside` · overlay `bg-ink/50` · titre `font-display text-lg font-bold` |
| `Pagination` | boutons `h-9 w-9 rounded-lg border-[1.5px] border-border-brand` · actif `border-primary-600 bg-primary-600 text-white font-display font-bold` |
| `Table` | `th` `text-[11px] font-bold uppercase tracking-[0.1em] text-ink-soft py-2` · `td` `py-3 border-t border-border-brand` + hover `bg-page` · refs mono / montants `tabular-nums` (au niveau page) |
| `Alert` | `rounded-xl border-[1.5px]` fonds 50 / texte & icône 700 |
| `EmptyState` | pastille `bg-surface text-primary-600` · titre `font-display font-bold text-ink` |
| `Skeleton` | `bg-border-brand` · `SkeletonCard` = card 1.5px + image `bg-surface` |
| `Toast` | `rounded-xl bg-ink text-white shadow-aside` · icône info `text-primary-400` |

> **Règle** : ne jamais changer les props publiques de ces composants — d'autres pages en dépendent.

---

## 4. Layouts

### Header (`src/components/Header.tsx`)

- `sticky top-0 z-40 border-b-[1.5px] border-border-brand bg-white/95 backdrop-blur`
- Ligne 1 : logo (`Logo size={34}`) + `Wordmark` — **`aria-label="WorkStore, accueil"`** · recherche **pill** `h-11 rounded-pill bg-surface` (sans bordure, placeholder `text-ink-soft`) · liens `font-semibold text-ink-soft`, actif `font-bold text-primary-600` · **compteur panier** `bg-accent-500 text-ink font-display font-extrabold rounded-pill h-[22px] min-w-[22px] text-xs`
- Ligne 2 : **nav catégories** (chargée via `categoriesApi.getAll()`, cache module) — items `h-12 border-b-[3px]`, actif `border-primary-600 text-primary-700 font-bold`, inactif `text-ink-soft`. Liens `/catalogue?categorie=<id>` (**`Catalogue` lit ce paramètre**).
- Menu mobile conservé : recherche, liens, panier, Connexion/Inscription, Déconnexion.

### Footer (`src/components/Footer.tsx`)

- **`bg-ink`** (`#0A2540`) pleine largeur, `pt-14 pb-20`
- Marque : `Logo variant="fond-fonce"` + `Wordmark tone="light"`
- Titres de colonnes : `text-[11px] font-bold uppercase tracking-[0.1em] text-primary-400`
- Newsletter : champ pill `bg-white/10` + bouton `bg-accent-500 text-ink` · honeypot anti-spam conservé
- Bas de page : `© 2026 WorkStore. Tous droits réservés.` · `border-t border-white/10`

### AdminLayout (`src/layouts/AdminLayout.tsx`)

- Racine : `bg-page` (`#F6FBFB`)
- **Sidebar : `w-60` (240px) `bg-ink`** — items `min-h-11 rounded-lg px-4 py-3 text-[15px] font-semibold`, inactif `text-white/85 hover:bg-white/10`, **actif `bg-primary-600 text-white`**
- Tête : `Logo variant="fond-fonce"` + `Wordmark size={22} tone="light"` + eyebrow « Administration »
- Drawer mobile conservé · contenu `px-4 py-6 sm:px-6 lg:px-10 lg:py-8`

### MainLayout

- `bg-white` (spec : accueil blanc). Les pages checkout/admin qui doivent être sur `#F6FBFB` appliquent `bg-page` sur leur propre conteneur (vague 2).

---

## 5. Environnement & SEO

- `VITE_SITE_URL` (canonical, og:url, og:image, sitemap) — **point unique** dans `src/hooks/usePageMeta.ts` ; fallback `https://www.workstore.ci` documenté ; typedef dans `src/vite-env.d.ts`.
- `.env.example` : `VITE_API_URL`, `VITE_SITE_URL`, `VITE_GA_ID`.
- `index.html` : title/OG/Twitter « WorkStore », canonical `https://www.workstore.ci/`, `theme-color #00797D`.
- `public/robots.txt` + `public/sitemap.xml` : domaine workstore.ci.
- `usePageMeta({ title, description, path, ogImage, noIndex })` : suffixe `| WorkStore`, `og:site_name = WorkStore`.
- Clé de consentement cookies : `workstore_cookie_consent`.

---

## 6. Règles transverses

- **Toujours passer par les tokens** : pas de `#hex` en dur dans les composants (les seules couleurs en dur acceptées sont dans `Logo.tsx` / assets SVG officiels).
- **Aucun emoji** : icônes lucide-react ou SVG inline.
- **Accessibilité** : `:focus-visible` global → contour `2px solid #00797D` (couche `base` de `index.css`) ; composants UI ajoutent `focus-visible:ring-2 ring-primary-600 ring-offset-2` ; `aria-label` sur les boutons icônes ; contrastes AA (navy sur blanc, blanc sur teal 600, navy sur jaune).
- **Responsive mobile-first** : `grid-cols-1` → `sm:`/`md:`/`lg:` ; marges 16px mobile / 40px desktop ; grille produits `1fr 1fr` gap 12 sous 640px.
- **Prix** : `tabular-nums`, formatés FCFA (`Intl.NumberFormat('fr-FR')` + suffixe FCFA, cf. `src/utils/panier.ts`).
- **Mono** : `font-mono` pour SKU, n° de commande (`CMD-2026-0001`) et codes coupons.

---

## 7. Vague 2 — pages publiques refondues

| Page | Fichier | Apport |
|---|---|---|
| Accueil | `src/pages/Home.tsx` | hero teal `rounded-2xl` (H1 52/56 → 28/32 mobile), tuiles catégories, `ProductCard`, bandeau USP, newsletter **désactivée** |
| Catalogue | `src/pages/Catalogue.tsx` | chips catégories, champs `.fld`, tri, drawer mobile, pagination serveur |
| Fiche produit | `src/pages/ProduitDetail.tsx` | galerie, pills statut, stepper 44, CTA primaire + highlight jaune — pill de stock branchée sur l'endpoint public `GET /produits/:id/stock` (« En stock » / « Stock faible : N » / « Rupture », seuil = `seuil_alerte` réel) |
| Card produit | `src/components/ProductCard.tsx` | composant partagé (Home / Catalogue / fiche produit) |
| Panier | `src/pages/Panier.tsx` | ligne panier (thumb 64, méta mono, stepper, prix 20/800) + aside récap `shadow-aside` |
| Checkout | `src/pages/Checkout.tsx` | `bg-page`, H1 « Finaliser ma commande », 3 cards numérotées + aside 380px (coupon désactivé, bouton jaune « Payer N FCFA ») |
| Confirmation | `src/pages/CommandeConfirmation.tsx` | n° de commande en mono, bandeau livraison 48 h |
| Mes commandes | `src/pages/MesCommandes.tsx` | pills statut (spec §1), n° mono, table + totaux `.sum` dans la modal |
| Profil / Adresses | `src/pages/Profile.tsx`, `src/pages/Addresses.tsx` | tokens ink ; adresses branchées sur `adressesApi` (liste, création, suppression) |
| Login / Register | `src/pages/Login.tsx`, `src/pages/Register.tsx` | panneau marque `bg-ink` + USP « Prix en FCFA / Livraison 48 h / Paiement local » |
| 404 | `src/pages/NotFound.tsx` | SVG recoloré teal `#00797D` / jaune `#FFB800` |
| Mobile | `src/components/BottomTabBar.tsx` + `MainLayout.tsx` | 4 onglets (Accueil/Catalogue/Favoris/Compte), safe-area, `pb-[calc(3.5rem+env(safe-area-inset-bottom))] sm:pb-0` |

### Vague 2 — back-office refondu (`src/pages/admin/*`)

| Page | Fichier | Apport |
|---|---|---|
| Dashboard | `src/pages/admin/AdminDashboard.tsx` | H1 « Tableau de bord » + mois courant (`Intl.DateTimeFormat fr-FR`), 3 KPI cards **100 % données réelles**, chart « Ventes des 7 derniers jours » calculé sur `GET /commandes/admin/all` (barres `bg-tint-light`, dernière `bg-primary-600`, h 240 / gap 20 / rayon 8 — spec §2.12), card « Alertes de stock » (`seuil_alerte` réel) + card pleine largeur « Dernières commandes » (n° mono, montant FCFA, pill statut) |
| Produits | `src/pages/admin/AdminProduits.tsx` | recherche pill `bg-surface` sans bordure, filtre catégorie, refs mono, prix `font-display` 700, pill stock calculée sur le `seuil_alerte` réel (plus de seuil codé en dur), modales ink |
| Catégories | `src/pages/admin/AdminCategories.tsx` | recherche pill, tri, pills actif/inactif, modale suppression |
| Stocks | `src/pages/admin/AdminStocks.tsx` | bandeau « Alertes de stock » (pastille `bg-accent-100`), seuils en mono, pills statut alignées sur la spec §1.1 (rupture = rouge, stock faible = jaune) |
| Commandes | `src/pages/admin/AdminCommandes.tsx` | filtre statut + compteur, table mono/display/pills, bouton « Détail » outline teal, modal en cartes `bg-page` + « Mettre à jour le statut » |

**Palette statut (spec §1.1)** — `EN_ATTENTE` warning · `PAYEE` / `LIVREE` success · `EN_PREPARATION` info · `EXPEDIEE` neutral · `ANNULEE` error · stock : `quantite = 0` error (rupture), `quantite < seuil_alerte` warning (stock faible), `quantite = seuil_alerte` warning (seuil atteint), sinon success.

**Écart assumé** — le libellé des jours du chart est une fenêtre glissante de 7 jours se terminant aujourd'hui (la maquette affichait « Lun → Dim », artefact de la capture) ; l'unité reste le FCFA (format compact `k` / `M` au-dessus des barres).

### Stock public (front public)

Endpoint **public** `GET /produits/:id/stock` (aucun token) → `{ produit_id, quantite, seuil_alerte, disponible, en_rupture }`. Utilisé par `src/api/produits.api.ts` → `produitsApi.getStock(id)`.

Règles d'affichage (fiche produit uniquement, `src/pages/ProduitDetail.tsx`) :

| État | Condition | Pill | Classes |
|---|---|---|---|
| En stock | `quantite > seuil_alerte` | « En stock » | `Badge variant="success"` — `bg-success-100` `#DDF2E4` / `text-success-700` `#187A42` |
| Stock faible | `quantite > 0 && quantite <= seuil_alerte` | « Stock faible : N » | `Badge variant="warning"` — `bg-warning-500` `#FFB800` / `text-ink` `#0A2540` |
| Rupture | `quantite <= 0` | « Rupture » | `Badge variant="error"` — `bg-error-100` `#FBE3E4` / `text-error-700` `#B3262F` |

- Le seuil « faible » est le `seuil_alerte` renvoyé par l'API — aucune constante côté front.
- Un produit sans ligne de stock est renvoyé `quantite: 0` → rupture.
- **Échec de l'appel** (réseau, 404) → aucune pill, aucun message, et l'achat reste possible : on n'affirme jamais un état de stock inconnu.
- En rupture : « Ajouter au panier » / « Acheter maintenant » désactivés + message explicite.
- `GET /stocks/produit/:id` est **réservé aux admins** (403) : il n'est plus appelé par le front public ; le back-office garde `GET /stocks` (liste) et `GET /stocks/alerts`.

### Fonctionnalités non branchées (UI seule, documentées)

| Élément | Pourquoi | Traitement UI |
|---|---|---|
| Newsletter (Home + Footer) | aucun endpoint newsletter | champ `disabled` + pill « Bientôt disponible » |
| Favoris (onglet + page) | aucun endpoint favoris | page « Bientôt disponible » conservée, onglet conservé |
| Code coupon (checkout, hero) | aucun endpoint coupon, DTO commande sans champ coupon | champ `disabled` + bouton « Appliquer » désactivé + mention explicite |
| Paiement en ligne | aucun endpoint paiement | moyen de paiement + téléphone en état local + `Alert` info |
| Stock sur les cards | l'endpoint public `GET /produits/:id/stock` ne renvoie le stock que d'un produit : l'afficher sur chaque card déclencherait une requête par carte (N+1) | la card affiche la note avis ou une pill « Nouveau » ; le stock n'est affiché que sur la fiche produit (1 requête) |

---

## 8. Points restants (vagues suivantes)

- **Photos produit** : remplacer les images Unsplash par des pictos SVG 3 tints teal (`tint-light` / `tint-mid` / `primary-600`).
- **Seed catégories** : vérifier le seed des 5 rubriques (Papeterie, Classement, Informatique, Impression, Consommables) côté API avant de le changer (le front affiche les catégories de l'API).
- **Back-office** : KPI cards, chart barres (`tint-light`/`tint-mid`/`primary-600`), tables de commandes avec pills statut — **fait en vague 2** (voir §7, « back-office refondu »). Restant : le KPI « Coupon actif » de la maquette n'a pas de source de données réelle (aucun endpoint coupon côté admin) et n'a donc pas été repris.
- **Back-end manquant** : endpoints newsletter, favoris, coupons, paiement en ligne. *(Stock public : fait — `GET /produits/:id/stock`.)*
- **Profil** : le formulaire de `Profile.tsx` n'est pas persisté (aucun endpoint « profil ») — le bandeau de succès est informatif.
