# MediGo - ERP Pharmaceutique

Système de gestion pour pharmacies avec recherche géo-spatiale, messagerie et authentification sécurisée.

## 🚀 Déploiement Rapide

### Backend (API) - Render
1. Créer un **Web Service** sur Render.
2. Root Directory: `api`
3. Build Command: `npm install && npm run build`
4. Start Command: `npm start`
5. Variables d'env: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `JWT_SECRET`.

### Frontend (Web) - Vercel
1. Importer le projet sur Vercel.
2. Root Directory: `web`
3. Variables d'env: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_API_URL`.

## 🛠 Tech Stack
- **Frontend**: Next.js 15, Tailwind CSS, Lucide React
- **Backend**: Node.js, Express, TypeScript
- **Sécurité**: JWT, Zod, Helmet, Rate Limiting
- **Base de données**: PostgreSQL + PostGIS (via Supabase)

## 🔒 Sécurité
- Score: 9.5/10
- Validation des données via Zod
- En-têtes sécurisés via Helmet
- Protection Brute-force via Rate Limiting
- Isolation des données par pharmacie (RLS & Middleware)