# ☁️ Tête dans les Nuages — Application Mobile

Application mobile multiplateforme (iOS + Android) pour le réseau de salles de divertissement **Tête dans les Nuages**.

---

## 📁 Structure du monorepo

```
/tdln-app
├── /backend          # API REST Node.js + Express + TypeScript + Prisma
├── /frontend         # Application mobile React Native + Expo
├── /admin            # Back-office web React + Vite + Ant Design
├── docker-compose.yml
└── README.md
```

---

## 🏗️ Stack Technique

### Backend
- **Node.js** + **Express.js** (TypeScript)
- **Prisma** ORM + **PostgreSQL**
- **Redis** (cache sessions & soldes)
- **JWT** (access token 15min + refresh token 7j)
- **Zod** (validation des requêtes)
- **Stripe** (paiements)
- **Nodemailer** (emails transactionnels)

### Frontend (Mobile)
- **React Native** + **Expo** (SDK 50)
- **TypeScript**
- **NativeWind** (Tailwind CSS pour React Native)
- **Expo Router** v3 (routing basé sur les fichiers)
- **TanStack Query** v5 (gestion des appels API + cache)
- **Zustand** (état global : auth + carte)
- **Stripe React Native** (paiements in-app)

### Admin (Web)
- **React** + **Vite** (TypeScript)
- **Ant Design** (composants UI)
- **React Router** v6

---

## 🚀 Installation & Démarrage

### Prérequis

- [Node.js](https://nodejs.org/) ≥ 20
- [Docker](https://www.docker.com/) + Docker Compose
- [Expo CLI](https://docs.expo.dev/get-started/installation/) : `npm install -g expo-cli`
- [Git](https://git-scm.com/)

---

### 1. Cloner le dépôt

```bash
git clone https://github.com/votre-org/tdln-app.git
cd tdln-app
```

---

### 2. Démarrer l'infrastructure (PostgreSQL + Redis)

```bash
docker-compose up -d postgres redis
```

Vérifier que les services sont en bonne santé :
```bash
docker-compose ps
```

---

### 3. Configurer le Backend

```bash
cd backend
cp .env.example .env
# Éditer .env avec vos valeurs (voir section Variables d'environnement)
```

Installer les dépendances :
```bash
npm install
```

Générer le client Prisma et appliquer les migrations :
```bash
npx prisma generate
npx prisma migrate dev --name init
```

Alimenter la base avec des données de test :
```bash
npm run prisma:seed
```

Démarrer le serveur de développement :
```bash
npm run dev
```

L'API sera disponible sur **http://localhost:3000**

---

### 4. Configurer le Frontend

```bash
cd ../frontend
cp .env.example .env
# Éditer EXPO_PUBLIC_API_URL avec l'IP de votre machine (ex: http://192.168.1.100:3000)
```

> ⚠️ Sur mobile physique, utilisez l'IP locale de votre machine, pas `localhost`.

Installer les dépendances :
```bash
npm install
```

Démarrer l'application Expo :
```bash
npm start
```

Puis scanner le QR code avec **Expo Go** (iOS/Android), ou appuyer sur `i` pour iOS Simulator / `a` pour Android Emulator.

---

### 5. Configurer l'Admin

```bash
cd ../admin
cp .env.example .env
npm install
npm run dev
```

L'interface admin sera disponible sur **http://localhost:5173**

Connectez-vous avec :
- Email : `admin@tdln.fr`
- Mot de passe : `Admin1234!`

---

### 6. Tout démarrer avec Docker (API complète)

```bash
# Copier les variables d'environnement
cp backend/.env.example backend/.env

# Démarrer tous les services
docker-compose up -d
```

---

## 🔑 Comptes de test (après seed)

| Rôle  | Email            | Mot de passe |
|-------|-----------------|--------------|
| Admin | admin@tdln.fr   | Admin1234!   |
| User  | demo@tdln.fr    | User1234!    |

---

## 📡 API Reference

### Authentification
| Méthode | Route                        | Description                    |
|---------|------------------------------|--------------------------------|
| POST    | /api/auth/register           | Inscription                    |
| GET     | /api/auth/verify-email/:token| Vérification email             |
| POST    | /api/auth/login              | Connexion                      |
| POST    | /api/auth/refresh            | Renouveler access token        |
| POST    | /api/auth/logout             | Déconnexion                    |
| POST    | /api/auth/forgot-password    | Demande de réinitialisation    |
| POST    | /api/auth/reset-password     | Réinitialisation mot de passe  |

### Carte & Solde
| Méthode | Route                  | Auth | Description                       |
|---------|------------------------|------|-----------------------------------|
| GET     | /api/card/me           | ✅   | Récupérer sa carte et son solde   |
| POST    | /api/card/debit        | —    | Débiter une carte (borne de jeu)  |
| GET     | /api/card/transactions | ✅   | Historique des transactions       |

### Recharge
| Méthode | Route                        | Auth | Description                       |
|---------|------------------------------|------|-----------------------------------|
| GET     | /api/recharge/packs          | —    | Liste des packs de recharge       |
| POST    | /api/recharge/payment-intent | ✅   | Créer un PaymentIntent Stripe     |
| POST    | /api/recharge/webhook        | —    | Webhook Stripe (créditer solde)   |

### Gazette
| Méthode | Route              | Description               |
|---------|--------------------|---------------------------|
| GET     | /api/gazette       | Liste des articles         |
| GET     | /api/gazette/:id   | Détail d'un article        |

### Leaderboard & Gamification
| Méthode | Route                        | Auth | Description              |
|---------|------------------------------|------|--------------------------|
| GET     | /api/leaderboard/:gameId     | —    | Classement d'un jeu      |
| POST    | /api/leaderboard/game-session| ✅   | Enregistrer une partie   |
| GET     | /api/user/:id/stats          | ✅   | Stats d'un utilisateur   |

### Admin (toutes les routes requièrent le rôle ADMIN)
- `GET/POST/PUT/DELETE /api/admin/articles`
- `GET/POST/PUT /api/admin/packs`
- `GET /api/admin/users`
- `GET /api/admin/transactions`
- `GET /api/admin/games`
- `GET /api/admin/venues`

---

## 🃏 QR Code & Borne de Jeu

Le QR code affiché dans l'app contient le `card_id` (UUID) de l'utilisateur.

La borne de jeu scanne le QR et appelle :

```http
POST /api/card/debit
Content-Type: application/json

{
  "cardId": "uuid-de-la-carte",
  "amount": 5,
  "description": "VR Space Explorer - 1 partie",
  "gameId": "uuid-du-jeu",
  "machineId": "BORNE-01"
}
```

La transaction est **atomique** (transaction PostgreSQL) : le solde ne peut jamais être négatif.

---

## 💳 Intégration Stripe

1. Créer un compte sur [stripe.com](https://stripe.com)
2. Récupérer vos clés API dans le Dashboard Stripe
3. Configurer `STRIPE_SECRET_KEY` dans `backend/.env`
4. Configurer `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY` dans `frontend/.env`
5. Pour les webhooks en local, utiliser [Stripe CLI](https://stripe.com/docs/stripe-cli) :
   ```bash
   stripe listen --forward-to localhost:3000/api/recharge/webhook
   ```
6. Copier le webhook secret dans `STRIPE_WEBHOOK_SECRET`

---

## 📧 Configuration Email

Le backend utilise **Nodemailer** pour envoyer les emails de vérification et de réinitialisation.

Configurer dans `backend/.env` :
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre@gmail.com
SMTP_PASS=votre_app_password
```

---

## 🐳 Variables d'environnement

### Backend (`backend/.env`)

| Variable              | Description                          | Requis |
|-----------------------|--------------------------------------|--------|
| DATABASE_URL          | URL PostgreSQL                       | ✅     |
| REDIS_URL             | URL Redis                            | ✅     |
| JWT_ACCESS_SECRET     | Secret pour les access tokens        | ✅     |
| JWT_REFRESH_SECRET    | Secret pour les refresh tokens       | ✅     |
| STRIPE_SECRET_KEY     | Clé secrète Stripe                   | ⚠️     |
| STRIPE_WEBHOOK_SECRET | Secret webhook Stripe                | ⚠️     |
| SMTP_HOST             | Hôte SMTP                            | ⚠️     |
| SMTP_USER             | Utilisateur SMTP                     | ⚠️     |
| SMTP_PASS             | Mot de passe SMTP                    | ⚠️     |
| FRONTEND_URL          | URL frontend (pour les liens email)  | ✅     |

### Frontend (`frontend/.env`)

| Variable                           | Description                  | Requis |
|------------------------------------|------------------------------|--------|
| EXPO_PUBLIC_API_URL                | URL de l'API                 | ✅     |
| EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY | Clé publique Stripe          | ⚠️     |
| EXPO_PUBLIC_BALANCE_POLL_INTERVAL_MS | Intervalle de polling (ms) | —      |

---

## 🏆 Gamification (roadmap)

Le modèle de données est en place pour :
- **Sessions de jeu** : score, durée, XP gagné
- **Leaderboards** : score max par jeu, classement global et par salle
- **Badges** : système de déclenchement configurable
- **Niveaux/XP** : progression des joueurs

---

## 📱 Développement en équipe

### Structure des commits
```
feat: nouvelle fonctionnalité
fix: correction de bug
chore: maintenance
docs: documentation
```

### Lancer les linters
```bash
# Backend
cd backend && npm run lint

# Admin
cd admin && npm run lint
```

---

## 🔒 Sécurité

- Mots de passe hashés avec **bcrypt** (12 rounds)
- JWT access token (15min) + refresh token (7j en base)
- Validation de toutes les entrées avec **Zod**
- Transactions atomiques PostgreSQL pour les débits
- Helmet.js pour les headers HTTP sécurisés
- CORS configuré avec l'origine du frontend

---

## 📞 Support

Pour toute question, ouvrir une issue sur le dépôt GitHub.
