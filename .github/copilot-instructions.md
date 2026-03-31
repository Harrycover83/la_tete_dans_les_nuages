# La Tête Dans Les Nuages — Workspace Instructions

## Philosophie de Développement

**QUALITÉ ET RIGUEUR AVANT TOUT**

- **Jamais de contournement** : Résoudre les problèmes en profondeur, ne jamais prendre de raccourcis ou de solutions temporaires.
- **Fiabilité maximale** : Chaque solution doit être robuste, testée et conforme aux bonnes pratiques.
- **Efficacité optimale** : Privilégier les solutions pérennes et performantes plutôt que les patchs rapides.
- **Diagnostic complet** : Comprendre la cause racine de chaque problème avant d'implémenter une solution.
- **Pas de workarounds** : Si une dépendance ou configuration pose problème, la corriger proprement plutôt que de la contourner.

## Architecture

Monorepo avec 3 packages :
- `backend/` — Node.js + Express + Prisma + PostgreSQL + Redis + Stripe
- `frontend/` — React Native + Expo Router + NativeWind/Tailwind + Zustand + React Query
- `admin/` — React + Vite + Tailwind (SPA admin)

## Règles absolues (ZERO hardcoding)

- **Zéro valeur en dur** dans le code : toutes les constantes métier vont dans des fichiers `constants/` dédiés, toutes les configs d'environnement passent par `backend/src/utils/config.ts` (validé par Zod).
- **Zéro chaîne magique** : les codes d'erreur sont des constantes exportées (ex. `ERROR_CODES.EMAIL_TAKEN`), les noms de routes sont des constantes, les clés localStorage/SecureStore sont des constantes.
- **Zéro duplication logique** : toute logique réutilisée entre 2 endroits doit être extraite dans un utilitaire partagé.
- **Zéro `any` TypeScript** : typer strictement, utiliser `unknown` + narrowing si nécessaire.

## Conventions Backend

- Controllers : validation Zod → appel service → réponse. Pas de logique métier dans les controllers.
- Services : toute la logique métier. Lancent des erreurs typées via `ERROR_CODES`.
- Routes : déclaration uniquement, middleware d'auth et de validation attachés ici.
- Toujours utiliser les transactions Prisma (`$transaction`) pour les opérations multi-tables.
- Redis pour le cache uniquement (TTL explicite via constante nommée).
- Stripe uniquement dans `recharge.service.ts`, jamais ailleurs.

## Conventions Frontend (React Native)

- Zustand stores dans `stores/`, un store par domaine.
- React Query pour toutes les requêtes serveur (`useQuery`, `useMutation`).
- Services dans `services/` : wrappent les appels axios, types de retour explicites.
- Composants réutilisables dans `components/`, un composant = un fichier.
- Styles via NativeWind `className`, jamais de `StyleSheet.create` sauf pour des cas impossibles en Tailwind.

## Conventions Admin

- Pages dans `src/pages/`, hooks dans `src/hooks/`.
- Tous les appels API via `src/services/api.ts` (instance axios centralisée).
- Pas de `fetch` direct.

## Tests

- Backend : Jest + Supertest. Fichiers `*.test.ts` dans `backend/src/__tests__/`.
- Frontend : Jest + React Testing Library. Fichiers `*.test.tsx` dans `frontend/__tests__/`.
- Admin : Vitest + React Testing Library. Fichiers `*.test.tsx` dans `admin/src/__tests__/`.
- Toujours mocker Prisma avec `jest-mock-extended`, Redis avec mock manuel, Stripe avec `stripe-mock`.
- Chaque service doit avoir ses tests unitaires. Chaque route doit avoir ses tests d'intégration.

## Structure des constantes

```
backend/src/constants/
  error-codes.ts      # Toutes les chaînes d'erreur
  cache-keys.ts       # Toutes les clés Redis
  cache-ttl.ts        # Tous les TTL Redis
frontend/constants/
  routes.ts           # Noms de routes Expo Router
  storage-keys.ts     # Clés SecureStore
admin/src/constants/
  routes.ts           # Routes admin
```

## Design System — La Tête Dans Les Nuages

Univers **neon/arcade sur fond violet nuit**, inspiré de la charte graphique officielle.
Toutes les valeurs de design sont dans `frontend/constants/colors.ts` et `frontend/constants/typography.ts`.
**Ne jamais hardcoder une couleur ou une taille de police** — utiliser les tokens ou les classes Tailwind définies.

### Palette principale

| Token | Valeur | Usage |
|---|---|---|
| `COLORS.background.primary` | `#1B1C72` | Fond principal (bleu cobalt vibrant — dominant sur le site officiel) |
| `COLORS.background.secondary` | `#0B022E` | Fond secondaire (violet nuit — cartes, sections profondes) |
| `COLORS.neon.cyan` | `#00D3FF` | Accent principal, focus, badges |
| `COLORS.neon.pink` | `#FE53BB` | Accent secondaire |
| `COLORS.neon.yellow` | `#FFC700` | Scores, récompenses, badges |
| `COLORS.neon.orange` | `#FF6B35` | Point CTA des boutons outlined (style site officiel) |
| `COLORS.text.primary` | `#FFFFFF` | Texte principal |
| `COLORS.text.secondary` | `rgba(255,255,255,0.65)` | Texte muted |

### Classes Tailwind correspondantes

```
bg-bg-primary       → fond principal (bleu cobalt #1B1C72)
bg-bg-secondary     → fond secondaire/cartes (violet nuit #0B022E)
text-neon-cyan      → texte accent cyan
bg-neon-yellow      → bouton/badge jaune
text-neon-pink      → accent rose
neon-orange         → point CTA boutons outlined
```

### Style des boutons (site officiel)

Le style de bouton officiel est **outlined pill** avec un point coloré :
- `border-2 border-white/80 rounded-full py-4 flex-row justify-center gap-3`
- Texte blanc gras + `<View className="w-2 h-2 rounded-full bg-neon-orange" />`
- **Jamais** de bouton solide cyan pour les CTA principaux

### Règles visuelles

- `userInterfaceStyle: dark` — l'app est 100% dark mode
- Splash screen et icône : fond `#0B022E`
- Les boutons CTA principaux : fond `#00D3FF`, texte `#0B022E`
- Les éléments de gamification (scores, tickets) : couleur `#FFC700`
- Effets glow/neon via `shadow` / `opacity` sur les éléments actifs

## Déploiement — Apple Store & Google Play

L'app utilise **Expo EAS Build** pour générer les binaires iOS et Android.

```bash
# Installer EAS CLI
npm install -g eas-cli

# Configurer le projet (à faire une seule fois)
cd frontend && eas build:configure

# Build iOS (TestFlight / App Store)
cd frontend && eas build --platform ios --profile production

# Build Android (Google Play)
cd frontend && eas build --platform android --profile production

# Soumettre aux stores
cd frontend && eas submit --platform ios
cd frontend && eas submit --platform android
```

Identifiants des stores (configurés dans `app.json`) :
- **iOS** : `bundleIdentifier: fr.tete-dans-les-nuages.app`
- **Android** : `package: fr.tete_dans_les_nuages.app`

## Commandes utiles

```bash
# Backend
cd backend && npm run dev          # Démarrer en dev
cd backend && npm run prisma:migrate  # Migrations
cd backend && npm run prisma:seed     # Seed data
cd backend && npm test               # Tests

# Frontend
cd frontend && npx expo start        # Démarrer

# Admin
cd admin && npm run dev              # Démarrer
```
