# MediGo - Plateforme de Services Pharmaceutiques

MediGo est une plateforme permettant de consulter la disponibilité des médicaments, de trouver les pharmacies de garde, de prendre rendez-vous et de commander en ligne.

## Structure du Projet

- `/web` : Frontend Next.js (React, Tailwind CSS, Lucide Icons)
- `/api` : Backend Node.js Express (TypeScript, PostgreSQL/PostGIS)

## Prérequis

- Node.js (v18+)
- Docker & Docker Compose (pour la base de données)

## Démarrage Rapide

### 1. Base de données
```bash
docker-compose up -d
```

### 2. Backend (API)
```bash
cd api
npm install
npm run dev
```

### 3. Frontend (Web)
```bash
cd web
npm install
npm run dev
```

## Fonctionnalités principales
- [x] Interface Web Mobile-First
- [ ] Recherche de médicaments par proximité (PostGIS)
- [ ] Consultation des pharmacies de garde en temps réel
- [ ] Système de prise de rendez-vous
- [ ] Module de commande et livraison
