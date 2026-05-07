# MediGo — Journal de Progression

## Statut Global : 🟡 En cours — Infrastructure complète, fonctionnalités à finaliser

---

## ✅ PHASE 1 — Base de code & Infrastructure (TERMINÉE)

### Web (Next.js)
- [x] Structure Next.js App Router complète
- [x] Landing page publique (hero, features, CTA)
- [x] Page de connexion (`/connexion`)
- [x] Page d'inscription (`/inscription`)
- [x] Dashboard patient (recherche médicaments, pharmacies, carte)
- [x] Dashboard pharmacie (`/dashboard`)
- [x] Gestion ordonnances pharmacie (`/dashboard/ordonnances`)
- [x] Gestion RDV pharmacie (`/dashboard/rdv`)
- [x] Gestion stocks pharmacie (`/dashboard/stocks`)
- [x] Chat pharmacie (`/dashboard/chat`)
- [x] Super admin dashboard (`/super-admin`)
- [x] Page commandes patient (`/commandes`)
- [x] Page profil patient (`/profil`)
- [x] Composant carte Leaflet (`PharmacyMap`)
- [x] Barre de progression navigation (NProgress)

### API Backend (Next.js API Routes — Vercel-ready)
- [x] `POST /api/auth/register` — inscription
- [x] `POST /api/auth/login` — connexion JWT
- [x] `GET /api/auth/me` — utilisateur connecté
- [x] `PATCH /api/auth/profile` — mise à jour profil
- [x] `GET /api/search` — recherche médicaments par géolocalisation
- [x] `GET /api/pharmacies/on-duty` — pharmacies de garde
- [x] `GET /api/pharmacies/search` — recherche pharmacie par nom
- [x] `GET /api/pharmacies/[id]/prescriptions` — ordonnances d'une pharmacie
- [x] `GET /api/reservations` — historique réservations
- [x] `POST /api/reservations` — créer réservation
- [x] `GET /api/appointments` — historique RDV
- [x] `POST /api/appointments` — créer RDV
- [x] `GET /api/prescriptions` — ordonnances (admin)
- [x] `POST /api/prescriptions` — envoyer ordonnance
- [x] `PATCH /api/prescriptions/[id]/status` — valider/rejeter ordonnance
- [x] `GET /api/messages/[pharmacy_id]` — messages
- [x] `POST /api/messages/[pharmacy_id]` — envoyer message
- [x] `GET /api/admin/stats` — statistiques globales
- [x] `GET /api/admin/pharmacies` — liste pharmacies (super admin)
- [x] `PATCH /api/admin/pharmacies/[id]/verify` — vérifier pharmacie
- [x] `GET /api/admin/users` — liste utilisateurs (super admin)
- [x] `PATCH /api/admin/users/[id]/role` — changer rôle utilisateur
- [x] `GET /api/reports/sales` — rapport ventes du jour
- [x] `POST /api/upload/prescription` — upload ordonnance (Vercel Blob)

### Base de données (Neon PostgreSQL)
- [x] Connexion Neon établie et testée ✅
- [x] Schéma SQL complet créé (`schema.sql`)
- [x] Tables : `users`, `pharmacies`, `medications`, `pharmacy_stocks`, `reservations`, `appointments`, `prescriptions`, `messages`
- [x] Index de performance créés
- [x] Triggers `updated_at` automatiques
- [x] Données de test : 4 pharmacies Lomé, 5 médicaments, 8 stocks, 1 super admin

### Application Mobile (Expo + React Native)
- [x] Structure Expo Router complète
- [x] Écran de connexion (JWT)
- [x] Écran d'inscription
- [x] Onglet Accueil (recherche médicaments + réservation)
- [x] Onglet Carte (pharmacies sur MapView)
- [x] Onglet Commandes (réservations + RDV)
- [x] Onglet Profil (édition + déconnexion)
- [x] Authentification sécurisée via `expo-secure-store`
- [x] Géolocalisation avec `expo-location`

### Corrections de bugs
- [x] `pharmacyActions.ts` — fichier corrompu UTF-16 réécrit
- [x] Import `supabase` inutilisé supprimé de 3 fichiers
- [x] `inscription/page.tsx` — mauvaise redirection corrigée (`/dashboard` → `/`)
- [x] `profil/page.tsx` — logout bugué corrigé, mélange Supabase/JWT supprimé
- [x] `api.ts` — URL relative `/api` (fonctionne local + Vercel)

---

## 🔴 PHASE 2 — Déploiement Vercel (À FAIRE)

- [ ] Créer un repo GitHub et pousser le code
- [ ] Connecter le repo à Vercel
- [ ] Configurer les variables d'environnement sur Vercel :
  - `DATABASE_URL`
  - `JWT_SECRET`
  - `BLOB_READ_WRITE_TOKEN`
- [ ] Vérifier le premier déploiement Vercel
- [ ] Mettre l'URL Vercel dans `mobile/src/lib/api.ts`

---

## 🔴 PHASE 3 — Fonctionnalités manquantes (À FAIRE)

- [ ] Page `/a-propos` — contenu réel
- [ ] Page `/paiement` — intégration paiement mobile (MTN/Moov Money)
- [ ] Page `/livreur` — interface livreur complète
- [ ] Dashboard stocks (`/dashboard/stocks`) — CRUD médicaments dynamique
- [ ] Dashboard chat (`/dashboard/chat`) — messages côté pharmacie
- [ ] Notifications push (mobile)
- [ ] SMS de confirmation ordonnance (Twilio/Africa's Talking)
- [ ] Système de pharmacie de garde rotatif (planning)
- [ ] Recherche vocale médicaments

---

## 🔴 PHASE 4 — Production (À FAIRE)

- [ ] Domaine personnalisé (ex: medigo.tg)
- [ ] Publication Expo Go → APK Android → Play Store
- [ ] Monitoring erreurs (Sentry)
- [ ] Analytics (Vercel Analytics)
- [ ] Tests automatisés
- [ ] Optimisation SEO
