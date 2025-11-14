# 🎨 NARA - Plateforme Artisanale Digitale

> **Plateforme intelligente de gestion pour créateurs de contenu et influenceurs**

NARA est une application web complète conçue pour simplifier la gestion professionnelle des créateurs de contenu. Elle offre des outils d'analyse juridique, de gestion financière, de compliance et d'organisation via une interface moderne et intuitive.

---

## 📋 Table des matières

- [Vue d'ensemble](#-vue-densemble)
- [Fonctionnalités](#-fonctionnalités)
- [Stack technique](#-stack-technique)
- [Architecture](#-architecture)
- [Intégrations](#-intégrations)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Structure du projet](#-structure-du-projet)
- [Déploiement](#-déploiement)
- [Utilisation](#-utilisation)
- [Développement](#-développement)
- [Contribution](#-contribution)

---

## 🎯 Vue d'ensemble

NARA est une solution tout-en-un pour les créateurs de contenu qui souhaitent professionnaliser leur activité. La plateforme combine :

- **Analyse juridique intelligente** : Analyse automatique de contrats via IA
- **Gestion financière** : Suivi des factures et cashflow
- **Compliance automatisée** : Classification intelligente des emails et gestion des opportunités
- **Organisation** : Calendrier intégré et vue d'ensemble des opportunités

### Public cible

- Créateurs de contenu
- Influenceurs
- Artistes digitaux
- Freelancers créatifs

---

## ✨ Fonctionnalités

### 🛡️ GUARDIANS - Protection Juridique

**Analyse de contrats intelligente**

- **Upload de contrats PDF** : Glisser-déposer ou sélection de fichiers
- **Analyse automatique** : Traitement via N8N et Dust AI pour extraction et analyse
- **Rapport d'analyse** : Identification automatique des clauses problématiques
- **Alertes intelligentes** : Classification des risques (critique, attention, informatif)
- **Chat avec agent juridique** : Assistant IA spécialisé en droit des contrats
- **Stockage des contrats** : Archivage avec résumés consultables
- **Copie de résumés** : Fonctionnalité de copie dans le presse-papiers

**Technologies utilisées :**
- N8N pour le workflow de traitement
- Dust AI pour l'analyse intelligente
- Supabase pour le stockage des résumés
- Base64 pour l'upload sécurisé

### 💰 FLOW - Gestion Financière

**Comptabilité simplifiée**

- **Création de factures** : Upload de factures PDF pour traitement automatique
- **Chat avec agent financier** : Assistant IA pour questions comptables
- **Tableau de bord financier** :
  - Chiffre d'affaires (30 jours)
  - Factures en attente
  - Revenus mensuels
- **Graphiques de revenus** : Visualisation des revenus sur 12 mois
- **Liste des factures** : Suivi des factures avec statuts (payée, envoyée, en retard, brouillon)
- **Statistiques en temps réel** : Métriques financières à jour

**Technologies utilisées :**
- Dust AI pour l'assistant financier
- N8N pour le traitement des factures
- Local Storage pour les données de démonstration

### 🎯 ORBIT - Compliance & Organisation

**Gestion intelligente des emails et opportunités**

#### Classification automatique des emails

- **Analyse intelligente** : Classification basée sur le contenu via IA
- **Catégories automatiques** :
  - 🟢 **Collaborations Rémunérées** : Contrats avec paiement
  - 🔵 **Collaborations Non Rémunérées** : Partenariats sans rémunération
  - ⭐ **Gifting** : Produits offerts, échantillons
  - 📅 **Invitation** : Événements, vernissages, soirées
  - 📥 **A trier** : Emails non classés

- **Dashboards intelligents** :
  - **À faire aujourd'hui** : Emails non lus prioritaires
  - **Importants** : Emails marqués importants/favoris
  - **Emails classés** : Vue par catégorie avec compteurs

- **Détails complets** : Affichage du contenu complet (body_html/body_text) dans des popups

#### Calendrier des événements

- **Vue hebdomadaire** : Navigation semaine par semaine
- **Événements automatiques** : Extraction depuis les emails d'invitation
- **Événements manuels** : Ajout depuis le Dashboard
- **Navigation temporelle** : Boutons précédent/suivant et "Aujourd'hui"
- **Affichage compact** : Maximum 2-3 événements par jour avec compteur "+X autres"
- **Date de référence** : 14 novembre 2025

#### Vue d'ensemble des opportunités

- **Collaborations** : Liste centralisée des opportunités de collaboration
- **Invitations** : Tous les événements proposés
- **Gifting** : Produits et services offerts
- **Vue unifiée** : Tableau de bord centralisé

**Technologies utilisées :**
- Supabase pour le stockage des emails
- IA de classification basée sur mots-clés et analyse sémantique
- Extraction de dates depuis le contenu des emails
- Local Storage pour les événements manuels

### 🏠 Dashboard - Accueil

**Vue d'ensemble quotidienne**

- **Métriques clés** :
  - Événements à venir (calendrier)
  - Collaborations en cours
  - Invitations en attente
  - Gifting reçu

- **Vue d'ensemble des opportunités** : Résumé des opportunités par catégorie

- **Actions rapides** :
  - Soumettre un contrat → Redirection vers GUARDIANS
  - Créer une facture → Redirection vers FLOW
  - Ajouter une tâche → Création d'événement pour le calendrier ORBIT

**Technologies utilisées :**
- React Query pour la gestion des données
- Services Supabase et EmailService
- Navigation React Router

---

## 🛠️ Stack technique

### Frontend

#### Framework & Build

- **React 18.3.1** : Bibliothèque UI moderne
- **TypeScript 5.8.3** : Typage statique pour la robustesse
- **Vite 5.4.19** : Build tool ultra-rapide avec HMR
- **React Router DOM 6.30.1** : Routing côté client

#### UI & Styling

- **Tailwind CSS 3.4.17** : Framework CSS utility-first
- **shadcn/ui** : Composants UI basés sur Radix UI
- **Radix UI** : Composants accessibles et personnalisables
  - Dialog, Sheet, Collapsible, Toast, etc.
- **Lucide React** : Bibliothèque d'icônes moderne
- **Tailwind Animate** : Animations CSS
- **Class Variance Authority** : Gestion des variants de composants

#### State Management & Data

- **TanStack React Query 5.83.0** : Gestion des données serveur et cache
- **React Hooks** : useState, useEffect, useRef, etc.
- **Local Storage** : Persistance des événements manuels

#### Formulaires & Validation

- **React Hook Form 7.61.1** : Gestion de formulaires performante
- **Zod 3.25.76** : Validation de schémas TypeScript
- **@hookform/resolvers** : Intégration Zod avec React Hook Form

#### Notifications

- **Sonner 1.7.4** : Système de notifications toast moderne

### Backend & Services

#### Serverless Functions (Netlify)

- **Node.js** : Runtime pour les fonctions serverless
- **node-fetch 2.7.0** : Client HTTP pour les appels API

**Fonctions Netlify :**
- `contract-webhook.js` : Proxy vers N8N pour upload de contrats
- `dust-proxy.js` : Proxy vers Dust AI pour l'agent juridique
- `dust-proxy-cashflow.js` : Proxy vers Dust AI pour l'agent financier
- `dust-upload.js` : Upload de fichiers vers Dust

#### Base de données

- **Supabase** : Backend-as-a-Service PostgreSQL
  - **Tables principales** :
    - `contract_summaries` : Résumés de contrats analysés
    - `emails` : Emails classés et analysés

#### Intégrations externes

- **N8N** : Automatisation de workflows
  - Webhook : `https://api.ia2s.app/webhook/pdf-to-dust`
  - Traitement des PDFs
  - Extraction de texte
  - Analyse IA

- **Dust AI** : Agents conversationnels IA
  - Agent juridique : Analyse de contrats
  - Agent financier : Assistance comptable
  - API via proxies Netlify

### Déploiement

- **Netlify** : Hosting et CI/CD
  - Build automatique depuis GitHub
  - Functions serverless
  - Redirects SPA
  - Variables d'environnement

### Outils de développement

- **ESLint 9.32.0** : Linting du code
- **TypeScript ESLint** : Linting TypeScript
- **PostCSS** : Traitement CSS
- **Autoprefixer** : Compatibilité navigateurs

---

## 🏗️ Architecture

### Architecture générale

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React)                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │Dashboard │  │Guardians │  │  Cashflow │  │Compliance│ │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘ │
│       │            │              │             │        │
│       └────────────┴──────────────┴─────────────┘        │
│                          │                               │
│              ┌───────────┴───────────┐                  │
│              │    Services Layer      │                  │
│              │  ┌──────────────────┐  │                  │
│              │  │ ContractService  │  │                  │
│              │  │  DustService     │  │                  │
│              │  │  EmailService    │  │                  │
│              │  │ SupabaseService  │  │                  │
│              │  │CalendarEventSvc  │  │                  │
│              │  └──────────────────┘  │                  │
│              └───────────┬────────────┘                  │
└─────────────────────────┼──────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
┌───────▼──────┐  ┌────────▼────────┐  ┌─────▼──────┐
│  Netlify    │  │    Supabase      │  │    N8N     │
│  Functions  │  │   (PostgreSQL)   │  │ (Workflows)│
│             │  │                  │  │            │
│ ┌─────────┐ │  │ ┌──────────────┐│  │ ┌────────┐│
│ │contract │ │  │ │contract_      ││  │ │PDF     ││
│ │webhook  │ │  │ │summaries      ││  │ │Process ││
│ └─────────┘ │  │ └──────────────┘│  │ └────────┘│
│ ┌─────────┐ │  │ ┌──────────────┐│  │ ┌────────┐│
│ │dust-    │ │  │ │emails         ││  │ │Dust AI ││
│ │proxy    │ │  │ └──────────────┘│  │ │Analysis ││
│ └─────────┘ │  │                  │  │ └────────┘│
└─────────────┘  └──────────────────┘  └──────────┘
```

### Flux de données

#### Upload de contrat

```
1. User upload PDF (Guardians)
   ↓
2. ContractService.uploadContract()
   ↓
3. Base64 encoding
   ↓
4. Netlify Function: contract-webhook
   ↓
5. N8N Webhook: /webhook/pdf-to-dust
   ↓
6. N8N Workflow:
   - Extract PDF text
   - Analyze with Dust AI
   - Store in Supabase (contract_summaries)
   ↓
7. Frontend polls Supabase
   ↓
8. Contract appears in storage
```

#### Chat avec agent IA

```
1. User sends message
   ↓
2. DustService.callAgent() / callCashflowAgent()
   ↓
3. Netlify Function: dust-proxy / dust-proxy-cashflow
   ↓
4. Dust AI API
   ↓
5. Response with conversationId
   ↓
6. Display in chat UI
```

#### Classification d'emails

```
1. EmailService.getAllEmails()
   ↓
2. Fetch from Supabase (emails table)
   ↓
3. analyzeAndCategorizeEmails()
   - Detect category via keywords
   - Classify: Collaborations, Gifting, Invitation, etc.
   ↓
4. Display in Compliance page
   ↓
5. Extract events for calendar
```

---

## 🔌 Intégrations

### Supabase

**Configuration :**
- **URL** : `https://xtyiubhthowddifvourf.supabase.co` (contrats)
- **URL** : `https://gttdxeghsgfabgtganvi.supabase.co` (emails)
- **Service Role Key** : Utilisée pour accès complet

**Tables utilisées :**

1. **`contract_summaries`**
   ```sql
   - id (UUID, PRIMARY KEY)
   - resume (TEXT) - Résumé du contrat
   - file_name (TEXT) - Nom du fichier
   - contract_id (TEXT) - ID généré par N8N
   - created_at (TIMESTAMP)
   ```

2. **`emails`**
   ```sql
   - id (UUID, PRIMARY KEY)
   - subject (TEXT)
   - from_name (TEXT)
   - from_address (TEXT)
   - body_text (TEXT)
   - body_html (TEXT)
   - snippet (TEXT)
   - received_at (TIMESTAMP)
   - is_read (BOOLEAN)
   - is_important (BOOLEAN)
   - category (TEXT)
   - ... (autres champs Gmail)
   ```

### N8N

**Workflow principal :** Traitement de contrats PDF

**Webhook URL :** `https://api.ia2s.app/webhook/pdf-to-dust`

**Processus :**
1. Réception du PDF en base64
2. Décodage et extraction du texte
3. Analyse via Dust AI (optionnel)
4. Stockage dans Supabase
5. Notification (optionnel)

**Configuration requise :**
- Credentials Supabase
- Credentials Dust AI (si utilisé)
- Variables d'environnement N8N

### Dust AI

**Agents utilisés :**

1. **Agent Juridique** (Guardians)
   - Analyse de contrats
   - Réponses aux questions juridiques
   - Identification de clauses problématiques

2. **Agent Financier** (Cashflow)
   - Assistance comptable
   - Analyse de factures
   - Conseils financiers

**API :**
- Accès via proxies Netlify Functions
- Conversation ID pour maintenir le contexte
- Support des fichiers uploadés

### Netlify Functions

**Fonctions serverless :**

1. **`contract-webhook`**
   - Endpoint : `/.netlify/functions/contract-webhook`
   - Méthode : POST
   - Payload : `{ fileName, fileType, fileBase64 }`
   - Forward vers N8N

2. **`dust-proxy`**
   - Endpoint : `/.netlify/functions/dust-proxy`
   - Méthode : POST
   - Payload : `{ message, username, conversationId }`
   - Forward vers Dust AI (agent juridique)

3. **`dust-proxy-cashflow`**
   - Endpoint : `/.netlify/functions/dust-proxy-cashflow`
   - Méthode : POST
   - Payload : `{ message, username, conversationId }`
   - Forward vers Dust AI (agent financier)

4. **`dust-upload`**
   - Endpoint : `/.netlify/functions/dust-upload`
   - Méthode : POST
   - Upload de fichiers vers Dust

---

## 📦 Installation

### Prérequis

- **Node.js** : Version 18+ recommandée
- **npm** ou **yarn** : Gestionnaire de paquets
- **Git** : Pour cloner le repository

### Installation locale

```bash
# 1. Cloner le repository
git clone https://github.com/votre-username/NARA.git
cd nara-artisanal-digital

# 2. Installer les dépendances
npm install

# 3. Créer le fichier .env.local
cp .env.example .env.local

# 4. Configurer les variables d'environnement (voir section Configuration)

# 5. Lancer le serveur de développement
npm run dev
```

L'application sera accessible sur `http://localhost:8080`

### Scripts disponibles

```bash
# Développement
npm run dev              # Serveur de développement (port 8080)

# Build
npm run build           # Build de production
npm run build:dev       # Build en mode développement

# Linting
npm run lint            # Vérifier le code avec ESLint

# Preview
npm run preview         # Prévisualiser le build de production

# Test
npm run test:dust       # Tester l'upload vers Dust
```

---

## ⚙️ Configuration

### Variables d'environnement

Créez un fichier `.env.local` à la racine du projet :

```env
# Supabase - Contrats
VITE_SUPABASE_URL=https://xtyiubhthowddifvourf.supabase.co
VITE_SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Supabase - Emails
VITE_SUPABASE_EMAILS_URL=https://gttdxeghsgfabgtganvi.supabase.co
VITE_SUPABASE_EMAILS_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# N8N Webhook
VITE_CONTRACT_WEBHOOK_URL=https://api.ia2s.app/webhook/pdf-to-dust
# OU pour développement local :
# VITE_CONTRACT_WEBHOOK_URL=http://localhost:5678/webhook/pdf-to-dust

# Dust AI Proxies (Netlify Functions)
VITE_DUST_PROXY_URL=/.netlify/functions/dust-proxy
VITE_DUST_CASHFLOW_PROXY_URL=/.netlify/functions/dust-proxy-cashflow
VITE_DUST_UPLOAD_URL=/.netlify/functions/dust-upload

# En production, ces URLs pointent automatiquement vers les fonctions Netlify
```

### Configuration Netlify

Dans le dashboard Netlify, configurez les variables d'environnement :

1. Allez dans **Site settings** > **Environment variables**
2. Ajoutez toutes les variables `VITE_*` nécessaires
3. Redéployez le site

### Configuration Supabase

1. Créez les tables nécessaires (voir section Intégrations)
2. Configurez les Row Level Security (RLS) si nécessaire
3. Notez l'URL et la Service Role Key

### Configuration N8N

1. Créez un workflow avec un trigger Webhook
2. Configurez l'URL du webhook : `https://api.ia2s.app/webhook/pdf-to-dust`
3. Ajoutez les nodes nécessaires (extraction PDF, analyse, stockage)
4. Configurez les credentials Supabase et Dust AI

---

## 📁 Structure du projet

```
nara-artisanal-digital/
├── public/                    # Assets statiques
│   ├── favicon.ico
│   ├── logo.svg
│   └── robots.txt
│
├── src/
│   ├── assets/                # Images et ressources
│   │   ├── logo.svg
│   │   ├── hero-background.jpg
│   │   └── ...
│   │
│   ├── components/             # Composants React
│   │   ├── ui/                # Composants shadcn/ui
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   └── ...
│   │   ├── AppSidebar.tsx     # Sidebar principale
│   │   ├── Navigation.tsx
│   │   ├── Hero.tsx
│   │   └── ...
│   │
│   ├── hooks/                  # Custom React Hooks
│   │   ├── use-mobile.tsx     # Détection mobile
│   │   └── use-toast.ts
│   │
│   ├── lib/                    # Utilitaires
│   │   └── utils.ts           # Fonctions utilitaires (cn, etc.)
│   │
│   ├── pages/                  # Pages de l'application
│   │   ├── Index.tsx           # Page d'accueil publique
│   │   ├── AppLayout.tsx       # Layout de l'app (/app)
│   │   ├── Dashboard.tsx       # Dashboard principal
│   │   ├── Guardians.tsx       # Page contrats
│   │   ├── Cashflow.tsx        # Page finances
│   │   ├── Compliance.tsx      # Page compliance/organisation
│   │   └── ...
│   │
│   ├── services/               # Services API
│   │   ├── ContractService.ts  # Upload contrats → N8N
│   │   ├── DustService.ts      # Communication Dust AI
│   │   ├── EmailService.ts     # Gestion emails Supabase
│   │   ├── SupabaseService.ts # Contrats Supabase
│   │   └── CalendarEventService.ts # Événements calendrier
│   │
│   ├── App.tsx                 # Composant racine
│   ├── main.tsx               # Point d'entrée
│   └── index.css               # Styles globaux
│
├── netlify/
│   └── functions/              # Netlify Functions
│       ├── contract-webhook.js
│       ├── dust-proxy.js
│       ├── dust-proxy-cashflow.js
│       ├── dust-upload.js
│       └── package.json
│
├── dist/                       # Build de production (généré)
│
├── .gitignore
├── netlify.toml               # Configuration Netlify
├── package.json
├── tsconfig.json              # Configuration TypeScript
├── vite.config.ts             # Configuration Vite
├── tailwind.config.ts         # Configuration Tailwind
└── README.md                   # Ce fichier
```

---

## 🚀 Déploiement

### Déploiement sur Netlify

#### Option 1 : Via GitHub (Recommandé)

1. **Connecter le repository GitHub**
   - Allez sur [Netlify](https://app.netlify.com)
   - Cliquez sur **"Add new site"** > **"Import an existing project"**
   - Connectez votre compte GitHub
   - Sélectionnez le repository `NARA`

2. **Configuration du build**
   - **Build command** : `npm run build`
   - **Publish directory** : `dist`
   - Netlify détecte automatiquement ces valeurs depuis `netlify.toml`

3. **Variables d'environnement**
   - Allez dans **Site settings** > **Environment variables**
   - Ajoutez toutes les variables `VITE_*` nécessaires

4. **Déploiement**
   - Netlify déploie automatiquement à chaque push sur `main`
   - Les fonctions serverless sont déployées depuis `netlify/functions`

#### Option 2 : Via Netlify CLI

```bash
# Installer Netlify CLI
npm install -g netlify-cli

# Se connecter
netlify login

# Initialiser le site
netlify init

# Déployer
netlify deploy --prod
```

### Configuration Netlify Functions

Les fonctions sont automatiquement détectées dans `netlify/functions/`.

**Vérification :**
- Les fonctions sont accessibles sur `https://votre-site.netlify.app/.netlify/functions/nom-fonction`
- Les logs sont disponibles dans le dashboard Netlify

### Domaine personnalisé

1. Allez dans **Site settings** > **Domain management**
2. Cliquez sur **"Add custom domain"**
3. Suivez les instructions pour configurer le DNS

---

## 💻 Utilisation

### Première utilisation

1. **Accéder à l'application**
   - Ouvrez l'URL de votre site déployé
   - Cliquez sur **"Accéder à la plateforme"** ou naviguez vers `/app`

2. **Dashboard**
   - Vue d'ensemble des métriques
   - Actions rapides disponibles

3. **GUARDIANS - Soumettre un contrat**
   - Cliquez sur **"Soumettre un contrat"**
   - Glissez-déposez un PDF ou sélectionnez un fichier
   - Le contrat est envoyé à N8N pour traitement
   - Le résumé apparaît dans **"Stockage des contrats"** une fois analysé

4. **FLOW - Créer une facture**
   - Cliquez sur **"Créer une facture"**
   - Upload un PDF de facture
   - Consultez les statistiques financières

5. **ORBIT - Compliance**
   - Les emails sont automatiquement classés
   - Le calendrier affiche les événements extraits des emails
   - Ajoutez des événements manuels depuis le Dashboard

### Fonctionnalités avancées

#### Chat avec agents IA

- **Agent Juridique** (Guardians) : Posez des questions sur vos contrats
- **Agent Financier** (Cashflow) : Obtenez des conseils comptables

Les conversations sont maintenues via `conversationId`.

#### Classification d'emails

Les emails sont automatiquement classés selon leur contenu :
- Détection de mots-clés
- Analyse sémantique
- Catégorisation intelligente

#### Calendrier

- Navigation semaine par semaine
- Événements extraits des emails d'invitation
- Ajout manuel depuis le Dashboard
- Date de référence : 14 novembre 2025

---

## 🔧 Développement

### Architecture des services

#### ContractService

```typescript
// Upload d'un contrat PDF vers N8N
const result = await ContractService.uploadContract(file);
// Retourne: { contractId, fileName, status }
```

#### DustService

```typescript
// Appel de l'agent juridique
const response = await DustService.callAgent({
  message: "Question sur le contrat",
  username: "User",
  conversationId: "existing-id" // Optionnel
});

// Appel de l'agent financier
const response = await DustService.callCashflowAgent({
  message: "Question financière",
  username: "User"
});
```

#### EmailService

```typescript
// Récupérer tous les emails
const emails = await EmailService.getAllEmails();

// Classifier les emails
const categories = EmailService.analyzeAndCategorizeEmails(emails);

// Extraire les événements
const events = EmailService.getCalendarEvents(emails);
```

#### SupabaseService

```typescript
// Récupérer les contrats
const contracts = await SupabaseService.getContractSummaries();

// Récupérer un contrat spécifique
const contract = await SupabaseService.getContractSummaryById(id);
```

### Ajout de nouvelles fonctionnalités

1. **Créer un nouveau service**
   - Ajoutez un fichier dans `src/services/`
   - Exportez une classe ou un objet singleton

2. **Créer une nouvelle page**
   - Ajoutez un fichier dans `src/pages/`
   - Ajoutez la route dans `App.tsx`
   - Ajoutez le lien dans `AppSidebar.tsx`

3. **Créer un nouveau composant**
   - Ajoutez dans `src/components/`
   - Utilisez les composants shadcn/ui comme base

### Tests

```bash
# Linter
npm run lint

# Test d'upload Dust
npm run test:dust
```

### Responsive Design

L'application est entièrement responsive :
- **Mobile** : Sidebar en drawer, layouts empilés
- **Tablet** : Layouts adaptatifs
- **Desktop** : Layouts complets

Breakpoints Tailwind utilisés :
- `sm:` : 640px+
- `md:` : 768px+
- `lg:` : 1024px+

---

## 🤝 Contribution

### Workflow de contribution

1. **Fork** le repository
2. **Créer une branche** : `git checkout -b feature/ma-fonctionnalite`
3. **Commit** : `git commit -m "Ajout de ma fonctionnalité"`
4. **Push** : `git push origin feature/ma-fonctionnalite`
5. **Créer une Pull Request**

### Standards de code

- **TypeScript** : Utiliser les types strictement
- **ESLint** : Respecter les règles de linting
- **Formatage** : Utiliser Prettier (si configuré)
- **Commits** : Messages clairs et descriptifs

### Structure des commits

```
feat: Ajout d'une nouvelle fonctionnalité
fix: Correction d'un bug
docs: Modification de la documentation
style: Changements de formatage
refactor: Refactoring du code
test: Ajout de tests
chore: Tâches de maintenance
```

---

## 📝 Licence

Ce projet est privé et propriétaire de NARA.

---

## 📞 Support

Pour toute question ou problème :
- **Issues GitHub** : Créez une issue sur le repository
- **Email** : support@nara.com (exemple)

---

## 🙏 Remerciements

- **shadcn/ui** : Pour les composants UI exceptionnels
- **Radix UI** : Pour l'accessibilité
- **Dust AI** : Pour les agents conversationnels
- **Supabase** : Pour le backend-as-a-service
- **N8N** : Pour l'automatisation des workflows
- **Netlify** : Pour l'hosting et les fonctions serverless

---

**Développé avec ❤️ pour les créateurs de contenu**
