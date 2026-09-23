# MediGo

Plateforme de référence santé au Togo : géolocalisation des pharmacies (dont celles de garde), vérification de la disponibilité des médicaments en temps réel, réservations, rendez-vous, ordonnances par photo et messagerie patient ↔ pharmacie — via un site web et une application mobile.

🔗 **En ligne** : https://medi-go-murex.vercel.app
📦 **Dépôt** : https://github.com/Riotlagrinta/medi_go

---

## Structure du dépôt

| Dossier | Rôle | Statut |
|---|---|---|
| [`web/`](web) | Site Next.js — pages patient/pharmacie/super-admin **et** toute l'API (routes `app/api/*`) | ✅ Actif — c'est l'app déployée |
| [`mobile/`](mobile) | App mobile Expo (React Native) — expérience patient uniquement (recherche, carte, commandes, profil) | ✅ Actif |
| [`backend/`](backend) | Ancienne API Express/PostgreSQL, remplacée par les routes Next.js de `web/` | ⚠️ Legacy, non déployé — conservé pour référence |
| [`mobile_flutter/`](mobile_flutter) | Client mobile Flutter alternatif, jamais développé au-delà du template par défaut | ⚠️ Abandonné |
| [`schema.sql`](schema.sql) | Schéma PostgreSQL (Neon) + données de test + migrations | — |
| [`PROGRESS.md`](PROGRESS.md) | Journal détaillé de ce qui est fait / reste à faire | — |
| [`ROADMAP.md`](ROADMAP.md) | Feuille de route produit par étapes | — |

L'app mobile et le site web parlent tous les deux à l'API de `web/` (déployée sur Vercel) — `backend/` n'est appelé par rien en production.

---

## Stack technique

- **Web** : Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Leaflet / React-Leaflet (carte)
- **API** : routes Next.js (`web/src/app/api`), JWT (`jsonwebtoken` + `bcryptjs`), upload fichiers via Vercel Blob, emails transactionnels via [Resend](https://resend.com)
- **Base de données** : PostgreSQL serverless via [Neon](https://neon.tech) (`@neondatabase/serverless`)
- **Mobile** : Expo 54 (Expo Router), React Native, `expo-secure-store`, `expo-location`, `react-native-maps`
- **Déploiement** : Vercel (Root Directory = `web`)

---

## Démarrage rapide

### Site web (`web/`)

```bash
cd web
npm install
npm run dev
```

> Sous Windows, les scripts `dev`/`build`/`start` chargent `patch-fs.js`, qui corrige un bug connu de Node/Webpack sur `readlink` (`EISDIR` au lieu de `EINVAL`). Ne pas appeler `next dev`/`next build` directement sur Windows sans ce patch.

Variables d'environnement nécessaires (fichier `web/.env.local`, non versionné) :

| Variable | Description | Obligatoire |
|---|---|---|
| `DATABASE_URL` | Chaîne de connexion Neon PostgreSQL | Oui |
| `JWT_SECRET` | Secret de signature des tokens JWT | Oui (une valeur par défaut de dev est utilisée sinon — à ne jamais garder en production) |
| `BLOB_READ_WRITE_TOKEN` | Token du Blob store Vercel (upload photos d'ordonnances) | Oui pour l'upload d'ordonnances |
| `RESEND_API_KEY` | Clé API [Resend](https://resend.com), pour l'email « mot de passe oublié » | Oui pour la réinitialisation de mot de passe |
| `RESEND_FROM_EMAIL` | Adresse d'expédition (ex: `MediGo <no-reply@medigo.tg>`), nécessite un domaine vérifié dans Resend | Optionnel — sans domaine vérifié, les emails ne partent que vers l'adresse du compte Resend |
| `ORS_API_KEY` | Clé API [OpenRouteService](https://openrouteservice.org/dev/#/signup) (compte gratuit), pour calculer l'itinéraire vers la pharmacie la plus proche | Oui pour le bouton « Itinéraire » — sans clé, l'API répond simplement 503 et le bouton affiche un message d'erreur |

### Application mobile (`mobile/`)

```bash
cd mobile
npm install
npm start        # puis scanner le QR code avec Expo Go
```

L'URL de l'API est codée dans [`mobile/src/lib/api.ts`](mobile/src/lib/api.ts) (`API_URL`) — à mettre à jour si l'app web est redéployée ailleurs.

### Base de données

Exécuter [`schema.sql`](schema.sql) dans la console SQL Neon pour créer les tables et les données de test. Le fichier contient aussi, en bas, les migrations idempotentes à rejouer sur une base déjà existante (ex: colonnes de réinitialisation de mot de passe).

---

## Déploiement

Le projet est pensé pour Vercel avec le **Root Directory réglé sur `web`** (voir [`vercel.json`](vercel.json) et [`ROADMAP.md`](ROADMAP.md) pour le détail des variables d'environnement à configurer côté Vercel).

---

## État du projet

Voir [`PROGRESS.md`](PROGRESS.md) pour le détail de ce qui est fait, en cours ou bloqué en attente de configuration, et [`ROADMAP.md`](ROADMAP.md) pour les prochaines étapes produit.
