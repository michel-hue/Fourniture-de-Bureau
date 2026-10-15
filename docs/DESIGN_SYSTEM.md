# BureauStore — Design System & Refonte UX

> Document de référence pour le frontend (React 19 + Vite + Tailwind CSS 4 + lucide-react).
> Design basé sur le template « 001-fashion-boutique.html » — couleur principale : **Indigo**.

---

## 1. Design System

### A. Palette de couleurs

#### Primaire — "Indigo" (couleur unique du design)

Teinte ~239°. Utilisé pour : boutons, liens, badges, pills, sections CTA, header, footer, sidebar admin, titres.

| Token | Hex | Usage |
|---|---|---|
| `primary-50` | `#EEF2FF` | Fonds de pills, badges, hover légers |
| `primary-100` | `#E0E7FF` | Fonds de badges, hover légers |
| `primary-200` | `#C7D2FE` | Bordures décoratives |
| `primary-300` | `#A5B4FC` | Bordures, états hover d'icônes |
| `primary-400` | `#818CF8` | Accents clairs, liens survolés (dark mode) |
| `primary-500` | `#6366F1` | **Couleur de base** — boutons header/footer, badges "New", sections CTA |
| `primary-600` | `#4F46E5` | **Couleur de base** — boutons primaires, liens, badges promo |
| `primary-700` | `#4338CA` | Hover des boutons primaires, textes accent sur fond clair |
| `primary-800` | `#3730A3` | Titres secondaires |
| `primary-900` | `#312E81` | Titres, textes importants |
| `primary-950` | `#1E1B4B` | Sidebar admin, hero foncé |

#### Accent — Indigo (même gamme que primary)

L'accent est aligné sur l'indigo pour une cohérence totale du design (le template n'utilise qu'une seule couleur + slate).

| Token | Hex |
|---|---|
| `accent-50` | `#EEF2FF` |
| `accent-100` | `#E0E7FF` |
| `accent-200` | `#C7D2FE` |
| `accent-300` | `#A5B4FC` |
| `accent-400` | `#818CF8` |
| `accent-500` | `#6366F1` |
| `accent-600` | `#4F46E5` |
| `accent-700` | `#4338CA` |
| `accent-800` | `#3730A3` |
| `accent-900` | `#312E81` |

#### Neutres — "Slate" (grès ardoise)

| Token | Hex | Usage |
|---|---|---|
| `slate-50` | `#F8FAFC` | Fond de page |
| `slate-100` | `#F1F5F9` | Fonds de sections, hover de lignes |
| `slate-200` | `#E2E8F0` | Bordures de cards, inputs |
| `slate-300` | `#CBD5E1` | Bordures fortes, placeholders |
| `slate-400` | `#94A3B8` | Icônes désactivées, textes très secondaires |
| `slate-500` | `#64748B` | Textes secondaires |
| `slate-600` | `#475569` | Textes tertiaires |
| `slate-700` | `#334155` | Texte principal secondaire |
| `slate-800` | `#1E293B` | Boutons newsletter (sur fond indigo), footer |
| `slate-900` | `#0F172A` | **Footer card**, titres très importants, texte hero |

#### Sémantiques (inchangées)

| Rôle | Token | Hex |
|---|---|---|
| Success | `success-50/100/500/600/700` | `#ECFDF5` / `#D1FAE5` / `#10B981` / `#059669` / `#047857` |
| Error | `error-50/100/500/600/700` | `#FEF2F2` / `#FEE2E2` / `#EF4444` / `#DC2626` / `#B91C1C` |
| Warning | `warning-50/100/500/600/700` | `#FFFBEB` / `#FEF3C7` / `#F59E0B` / `#D97706` / `#B45309` |
| Info | `info-50/100/500/600/700` | `#F0F9FF` / `#E0F2FE` / `#0EA5E9` / `#0284C7` / `#0369A1` |

**Règle de contraste** : texte sémantique sur fond clair → teintes 700+. Le 500 ne sert que pour les icônes et les fonds avec texte blanc.

---

### B. Typographie

**Police principale : Inter** (Google Fonts).

| Niveau | Classe Tailwind | Poids | Usage |
|---|---|---|---|
| Display (hero) | `text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1]` | 700 | Hero de la Home |
| H1 (page) | `text-3xl md:text-4xl font-bold tracking-tight` | 700 | Titres de pages |
| H2 (section) | `text-2xl font-semibold tracking-tight` | 600 | Sections de pages |
| H3 (sous-section) | `text-lg font-semibold` | 600 | Cards, sous-blocs |
| Body | `text-base leading-relaxed text-slate-600` | 400 | Paragraphes |
| Body-sm | `text-sm text-slate-600` | 400 | Descriptions |
| Small | `text-xs text-slate-500` | 400 | Notes, timestamps |
| Eyebrow | `text-xs font-medium uppercase tracking-wider text-primary-600` | 500 | Labels au-dessus des titres |
| Prix | `text-lg font-bold tabular-nums text-slate-900` | 700 | Prix produits |

**Règles** : `tracking-tight` sur les titres, `tabular-nums` pour les prix/tableaux, jamais de majuscules hors eyebrows.

---

### C. Espacement & rayon

**Grille de page** : `mx-auto max-w-7xl px-4 sm:px-6 lg:px-8`.

#### Rayons (design arrondi)

| Token | Valeur | Usage |
|---|---|---|
| `rounded-xl` | 12px | Inputs, selects, textareas, boutons header, badges overlay |
| `rounded-2xl` | 16px | Modals, pastilles d'icônes |
| `rounded-3xl` | 24px | **Cards, images produits, sections CTA, footer card** |
| `rounded-full` | 999px | **Boutons**, badges, pills, avatars, icônes sociales |

#### Ombres

| Token | Usage |
|---|---|
| `shadow-xs` | Éléments plats avec bordure |
| `shadow-sm` | Cards au repos |
| `shadow-md` | Cards au hover |
| `shadow-2xl` | Modals |

---

### D. Composants

#### Button

**Variants** :

| Variant | Classes | Usage |
|---|---|---|
| `primary` | `bg-primary-600 text-white hover:bg-primary-700` | Action principale |
| `accent` | `bg-accent-500 text-white hover:bg-accent-600` | CTA de conversion |
| `secondary` | `bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 hover:border-slate-400` | Actions secondaires |
| `outline` | `border border-primary-600 text-primary-700 hover:bg-primary-50` | Actions alternatives |
| `ghost` | `text-slate-600 hover:bg-slate-100 hover:text-slate-900` | Actions contextuelles |
| `danger` | `bg-error-600 text-white hover:bg-error-700` | Actions destructives |

**Base commune** : `inline-flex items-center justify-center rounded-full font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]`

**Tailles** : `sm` = `h-9 px-3 text-sm` · `md` = `h-10 px-4 text-sm` · `lg` = `h-12 px-6 text-base`.

#### Input / Select / Textarea

**Base** : `h-10 w-full rounded-xl border bg-white px-3 text-sm text-slate-900 shadow-xs transition-colors placeholder:text-slate-400`

| État | Classes |
|---|---|
| Normal | `border-slate-200` |
| Focus | `border-primary-500 ring-4 ring-primary-500/10 outline-none` |
| Erreur | `border-error-500 ring-4 ring-error-500/10` |
| Disabled | `bg-slate-50 text-slate-400 cursor-not-allowed` |

#### Card

- Base : `rounded-3xl border border-slate-200 bg-white shadow-sm`
- Variant `hover` : `transition-all hover:shadow-md hover:border-slate-300`
- Variant `plain` : `border-0 shadow-none`
- `CardFooter` : `rounded-b-3xl border-t border-slate-200 bg-slate-50`

#### Badge

- Base : `inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium`
- Variants : `neutral` (slate-100/700), `primary` (primary-100/800), `accent` (accent-100/700), `success`, `warning`, `error`, `info`
- Badge promo sur image : `bg-primary-600 text-white` (absolute top-2 left-2)

#### Header (front office)

- `sticky top-0 z-40 border-b border-slate-100 bg-white/90 backdrop-blur`
- Conteneur : `mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8`
- Logo : `Logo.tsx` (SVG) + wordmark `font-bold text-lg text-slate-900`
- Nav desktop : `hidden items-center gap-8 lg:flex` — liens `text-sm font-medium text-slate-600 hover:text-primary-500` — actif `text-primary-600`
- Bouton "Inscription" : `bg-primary-500 hover:bg-primary-600 rounded-xl`
- Panier : badge compteur `rounded-full bg-primary-500 text-white`
- Hamburger mobile : 3 lignes `h-0.5 w-5 rounded-full bg-slate-900`
- Menu mobile : items `rounded-xl px-4 py-3` — actif `bg-primary-50 text-primary-600`

#### Footer

- `bg-white py-20` → card interne `relative overflow-hidden rounded-3xl bg-slate-900`
- Image de fond : `object-cover opacity-20` + overlay `bg-gradient-to-r from-slate-900 via-slate-900/95 to-slate-900/80`
- Section haute : logo + tagline, nav horizontale `gap-x-10` (hover `text-primary-400`), CTA `rounded-full bg-primary-500 hover:bg-primary-600`
- Section basse : liens légaux `text-slate-500 hover:text-primary-400`, icônes sociales `h-10 w-10 rounded-full bg-slate-800 hover:bg-primary-500`
- Newsletter : input `rounded-xl bg-white` + bouton `rounded-xl bg-slate-800 hover:bg-slate-700`
- Copyright : `border-t border-slate-800 text-slate-500`

#### Sidebar admin

- Desktop : `hidden w-64 shrink-0 bg-primary-950 text-white md:block`
- Link actif : `bg-white/10 text-white` + icône `text-primary-400`

#### Pagination

- Boutons : `h-9 w-9 rounded-md border text-sm` — actif `bg-primary-900 text-white border-primary-900`

---

## 2. Structure UX des pages

### Home

1. **Hero** — `bg-white py-20 sm:py-24`, layout `grid lg:grid-cols-2 gap-12 items-center` :
   - Badge : `Fournitures de bureau / Nouveautés` (texte `text-primary-600`)
   - H1 display avec mot accentué `text-primary-600`
   - Sous-titre `text-lg text-slate-600 max-w-lg`
   - 2 CTA : bouton `bg-primary-600 hover:bg-primary-700 rounded-full` + lien `text-primary-600` avec flèche (hover:gap-3)
   - Feature pills : `rounded-full bg-primary-50 px-4 py-2` avec icône Check `text-primary-600`
   - Image : `relative aspect-square rounded-3xl overflow-hidden bg-slate-100` + badge "Nouveautés" `bg-primary-600 rounded-full` (top-right) + prix overlay `bg-white/90 backdrop-blur-xs rounded-xl` (bottom-left)
2. **Bandeau avantages** — 4 items, icônes dans pastilles `rounded-full bg-primary-50 text-primary-600`
3. **Catégories** — grille 2/4, cards `rounded-3xl`, icônes `rounded-xl bg-primary-50 text-primary-600`
4. **Bandeau promo** — `bg-primary-600 text-white`, code promo `bg-white/20 rounded`, CTA blanc
5. **Produits vedettes** — cards produits, badge promo `bg-primary-600`, étoiles `fill-primary-500`, bouton panier `rounded-full bg-primary-600 group-hover:bg-primary-700`
6. **Newsletter** — section `bg-white py-20` → card `rounded-3xl bg-primary-500 p-8 sm:p-12 lg:p-16` :
   - Icône dans pastille `bg-white/20 rounded-2xl`
   - Titre blanc, sous-titre `text-primary-100`
   - Input `rounded-xl bg-white` + bouton `rounded-xl bg-slate-900 hover:bg-slate-800`
   - Stats : `border-t border-white/20`, valeurs `text-2xl font-bold text-white`, labels `text-primary-200`

### Catalogue / ProduitDetail / Panier / Checkout / Auth / Admin

Structure fonctionnelle inchangée — les couleurs suivent automatiquement les tokens (primary/accent = indigo). Les boutons sont `rounded-full`, les cards `rounded-3xl`, les inputs `rounded-xl`.

---

## 3. Tokens Tailwind (fichier `src/index.css`)

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
@import "tailwindcss";

@theme {
  --font-sans: "Inter", ui-sans-serif, system-ui, -apple-system, sans-serif;

  /* Primaire — Indigo */
  --color-primary-50: #EEF2FF;
  --color-primary-100: #E0E7FF;
  --color-primary-200: #C7D2FE;
  --color-primary-300: #A5B4FC;
  --color-primary-400: #818CF8;
  --color-primary-500: #6366F1;
  --color-primary-600: #4F46E5;
  --color-primary-700: #4338CA;
  --color-primary-800: #3730A3;
  --color-primary-900: #312E81;
  --color-primary-950: #1E1B4B;

  /* Accent — Indigo (même gamme) */
  --color-accent-50: #EEF2FF;
  --color-accent-100: #E0E7FF;
  --color-accent-200: #C7D2FE;
  --color-accent-300: #A5B4FC;
  --color-accent-400: #818CF8;
  --color-accent-500: #6366F1;
  --color-accent-600: #4F46E5;
  --color-accent-700: #4338CA;
  --color-accent-800: #3730A3;
  --color-accent-900: #312E81;

  /* Sémantiques (inchangées) */
  --color-success-50: #ECFDF5;
  --color-success-100: #D1FAE5;
  --color-success-500: #10B981;
  --color-success-600: #059669;
  --color-success-700: #047857;

  --color-error-50: #FEF2F2;
  --color-error-100: #FEE2E2;
  --color-error-500: #EF4444;
  --color-error-600: #DC2626;
  --color-error-700: #B91C1C;

  --color-warning-50: #FFFBEB;
  --color-warning-100: #FEF3C7;
  --color-warning-500: #F59E0B;
  --color-warning-600: #D97706;
  --color-warning-700: #B45309;

  --color-info-50: #F0F9FF;
  --color-info-100: #E0F2FE;
  --color-info-500: #0EA5E9;
  --color-info-600: #0284C7;
  --color-info-700: #0369A1;
}
```

**Note** : les neutres `slate-*` sont natifs dans Tailwind 4 — aucune redéfinition nécessaire.

---

## 4. Règles transverses

- **Aucune couleur en dur** (`#hex` ou `bg-[...]`) dans les composants : toujours passer par les tokens.
- **Aucun emoji** dans l'UI : icônes lucide-react ou SVG inline (icônes de marques non disponibles dans lucide-react).
- **Accessibilité** : focus visible (`focus-visible:ring-2 ring-primary-500 ring-offset-2`), `aria-label` sur les boutons icônes, contrastes AA.
- **Responsive mobile-first** : `grid-cols-1` par défaut, montée en `sm:`/`md:`/`lg:`/`xl:`.
- **Prix** : toujours `tabular-nums`, formatés via `Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' })`.
- **Logo BureauStore** : composant `Logo.tsx` (SVG inline) — à conserver tel quel dans Header, Footer, AdminLayout, Login, Register.