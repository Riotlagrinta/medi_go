# MediGo — Roadmap

## Vision
Plateforme de référence santé au Togo connectant patients et pharmacies en temps réel — web + mobile.

---

## 🚀 ÉTAPE 1 — Mise en ligne (Cette semaine)

> Objectif : L'app web tourne sur internet, la base de données est connectée.

### 1.1 GitHub
- Créer un repo GitHub `medi-go` (public ou privé)
- Pousser le code

### 1.2 Vercel
- Connecter le repo GitHub à Vercel
- Définir le **Root Directory** sur `web`
- Ajouter les 3 variables d'environnement :
  | Variable | Valeur |
  |---|---|
  | `DATABASE_URL` | `postgresql://neondb_owner:...` (votre connexion Neon) |
  | `JWT_SECRET` | une chaîne secrète longue et aléatoire |
  | `BLOB_READ_WRITE_TOKEN` | créer un Blob store dans Vercel > Storage |
- Déployer → tester `/api/auth/register` et `/api/auth/login`

### 1.3 Mobile
- Mettre l'URL Vercel dans `mobile/src/lib/api.ts`
- Installer les dépendances : `cd mobile && npm install`
- Tester avec Expo Go : `npx expo start`

---

## 📦 ÉTAPE 2 — Compléter les fonctionnalités (Semaines 2-3)

> Objectif : Toutes les pages fonctionnent de bout en bout.

### 2.1 Stocks pharmacie (`/dashboard/stocks`)
- Afficher la liste des médicaments en stock
- Ajouter / modifier / supprimer un médicament
- Alerte quand quantité < seuil

### 2.2 Chat côté pharmacie (`/dashboard/chat`)
- Liste des conversations patients
- Répondre aux messages en temps réel

### 2.3 Système de garde
- Interface pour planifier les pharmacies de garde par date
- Rotation automatique ou manuelle par le super admin

### 2.4 Page À propos (`/a-propos`)
- Présentation de MediGo
- FAQ
- Contact

---

## 💳 ÉTAPE 3 — Paiement mobile money (Semaine 4)

> Objectif : Les patients peuvent payer leurs réservations en ligne.

### Options pour le Togo
- **MTN Mobile Money** — API MTN MoMo
- **Moov Money** — API Flooz
- **Fédapay** — agrégateur de paiement local (recommandé, supporte les deux)

### Ce qu'il faut faire
- Créer un compte Fédapay (ou MTN MoMo)
- Ajouter la route `POST /api/payments/initiate`
- Mettre à jour la page `/paiement`
- Gérer le webhook de confirmation de paiement

---

## 📱 ÉTAPE 4 — Publication mobile (Semaine 5-6)

> Objectif : L'app est téléchargeable sur Android.

### 4.1 Build APK
```bash
cd mobile
npx expo install expo-dev-client
npx eas build --platform android --profile preview
```

### 4.2 Play Store
- Créer un compte Google Play Developer (25 USD une fois)
- Préparer les captures d'écran, descriptions en français
- Soumettre l'APK

### 4.3 iOS (optionnel)
- Compte Apple Developer (99 USD/an)
- Build iOS via EAS

---

## 🔔 ÉTAPE 5 — Notifications & SMS (Semaine 6-7)

> Objectif : Les patients sont notifiés quand leur ordonnance est prête.

### SMS
- **Africa's Talking** — opérateur SMS Afrique recommandé
- Déclencher un SMS quand `status` passe à `ready` ou `rejected`
- Route `PATCH /api/prescriptions/[id]/status` → appel SMS

### Notifications push
- `expo-notifications` dans l'app mobile
- Stocker les tokens push en base
- Envoyer depuis l'API Vercel

---

## 🌍 ÉTAPE 6 — Production (Semaine 8+)

> Objectif : L'app est stable, sécurisée, et visible.

### Domaine
- Acheter `medigo.tg` (NIC Togo) ou `medigo.africa`
- Connecter à Vercel : `Settings > Domains`

### Sécurité
- Changer `JWT_SECRET` pour une valeur forte en production
- Activer le rate limiting sur les routes auth
- HTTPS activé automatiquement sur Vercel

### Monitoring
- Activer **Vercel Analytics** (gratuit)
- Intégrer **Sentry** pour les erreurs (`npm install @sentry/nextjs`)

### SEO
- Métadonnées Open Graph (titre, description, image)
- Sitemap automatique Next.js
- Google Search Console

---

## 📊 Résumé des priorités

| Priorité | Tâche | Effort | Impact |
|---|---|---|---|
| 🔴 Critique | Déployer sur Vercel | 1h | Lance l'app en ligne |
| 🔴 Critique | Variables d'env Vercel | 15min | Base de données connectée |
| 🔴 Critique | URL Vercel dans mobile | 2min | Mobile connecté |
| 🟠 Important | Stocks pharmacie | 2h | Dashboard complet |
| 🟠 Important | Chat pharmacie | 2h | Communication complète |
| 🟡 Moyen | Paiement Fédapay | 4h | Monétisation |
| 🟡 Moyen | SMS ordonnances | 2h | UX patients |
| 🟢 Long terme | Play Store | 1 semaine | Distribution large |
| 🟢 Long terme | Domaine .tg | 30min | Crédibilité |
