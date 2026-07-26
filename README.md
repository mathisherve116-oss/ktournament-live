# K'TOURNAMENT LIVE — MVP V1

Application SaaS pour organiser, piloter et monetiser des tournois amateurs en
direct, conforme au cahier des charges developpeur V1 (120 pages / 24 ecrans
fonctionnels).

Perimetre livre : le noyau prioritaire recommande par le cahier des charges
(page 119) — **creation tournoi + equipes + poules + matchs + score live +
classements + K'Screen + K'Remote + QR public + sponsors simples** — avec
authentification par role, temps reel WebSocket et journal d'audit.

## Stack technique

- **Frontend** : Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS.
- **Backend** : API routes Next.js (Node.js), Socket.IO pour le temps reel.
- **Base de donnees** : SQLite via le module natif `node:sqlite` de Node.js
  (aucune dependance binaire externe a installer — voir "Pourquoi pas
  Prisma/Postgres" ci-dessous).
- **Auth** : JWT (cookie httpOnly) + hash bcrypt + matrice de roles (RBAC).

## Prerequis

- **Node.js 22.5 ou superieur** (le module `node:sqlite` est requis). Verifiez
  avec `node -v`.

## Installation

```bash
npm install
npm run seed     # cree un club, un tournoi de demo, equipes, poules, matchs, sponsors et ecrans
npm run dev      # lance le serveur (front + API + WebSocket) sur http://localhost:3000
```

Ouvrez http://localhost:3000 — vous serez redirige vers l'ecran de connexion.

### Comptes de demonstration

Mot de passe pour tous : `Kdosports2026!`

| Email | Role |
|---|---|
| admin@kdosports.fr | Administrateur K'dosports |
| club@as-lumiere.fr | Responsable club |
| tournoi@as-lumiere.fr | Responsable tournoi |
| score@as-lumiere.fr | Benevole score |
| ecran@as-lumiere.fr | Responsable ecran |

## Les 4 espaces de l'application

1. **Back-office** (`/dashboard`, `/tournaments/[id]/...`) — creation et
   pilotage complet du tournoi : parametres, categories, terrains, equipes
   (saisie + import CSV), poules (generation automatique equilibree), matchs
   (generation round-robin + planning), score live (saisie/validation/
   historique), classements automatiques (points, diff. de buts, buts
   marques, confrontation directe), phases finales, sponsors, ecrans, resume
   tournoi.
2. **K'Remote** (`/remote/[tournamentId]`) — telecommande mobile : choix de
   l'ecran, choix du contenu a projeter, pilotage live (rafraichir, match
   suivant, lancer/stopper la boucle sponsors, stop projection).
3. **K'Screen** (`/screen/[screenId]`) — projection plein ecran (TV /
   videoprojecteur), sans compte, mise a jour temps reel (WebSocket) avec
   secours par rafraichissement automatique toutes les 4 secondes en cas de
   coupure. Affiche accueil, matchs en direct, planning, classements,
   sponsors (bandeau permanent + plein ecran), QR code, message libre.
4. **Page publique QR** (`/t/[slug]`) — suivi public sans compte : accueil,
   matchs, classements, sponsors. Le lien peut etre desactive a tout moment
   depuis le resume du tournoi (ecran "securite QR" du cahier des charges).

## Temps reel

Socket.IO diffuse les evenements du cahier des charges (`match.started`,
`score.updated`, `ranking.updated`, `screen.contentChanged`,
`screen.connected/disconnected`, `sponsor.rotationStarted/Stopped`,
`tournament.updated`) dans une room par tournoi (`tournament:<id>`) et par
ecran (`screen:<id>`). Le back-office, K'Screen et K'Remote s'abonnent et se
rafraichissent automatiquement.

## Securite et conformite au cahier des charges

- Mots de passe haches (bcrypt), sessions JWT en cookie httpOnly.
- Matrice de roles RBAC (`src/lib/rbac.ts`) : admin, responsable club,
  responsable tournoi, benevole score, responsable ecran, public.
- Journal d'audit (`audit_logs`) sur les actions critiques : creation/
  modification tournoi, scores, validations, projection ecran, connexions.
- Lien public desactivable, donnees exposees en lecture seule uniquement.

## Pourquoi pas Prisma/PostgreSQL comme suggere en option A du cahier des charges

Le cahier des charges recommande PostgreSQL (ou Supabase) avec Prisma. Ce
MVP utilise **SQLite via le module natif `node:sqlite`** pour eliminer toute
dependance a un moteur binaire externe a telecharger/installer (Prisma
telecharge des binaires natifs par plateforme, ce qui peut echouer derriere
certains pare-feux d'entreprise — un probleme direct pour la fiabilite
terrain que le cahier des charges met justement en avant). Le schema
relationnel complet (`src/lib/db.ts`) reprend fidelement les tables du
cahier des charges (clubs, users, tournaments, categories, teams, groups,
matches, scores, rankings, screens, sponsors, audit_logs, public_links...).

**Migration vers PostgreSQL pour la montee en charge multi-clubs** : la
couche d'acces aux donnees est isolee dans `src/lib/db.ts` (connexion) et
`src/lib/repo.ts` (toutes les requetes SQL). Remplacer ces deux fichiers par
une implementation Prisma/PostgreSQL ou Supabase ne necessite aucune
modification des routes API ni du frontend, qui ne connaissent que les
fonctions exportees par `repo.ts`.

## Ce qui reste a faire avant une mise en production reelle

- Remplacer le secret JWT de developpement (`.env`) par un secret fort et
  gere en variable d'environnement securisee.
- Brancher un stockage de fichiers (logos clubs/equipes/sponsors) — prevu
  dans le schema (`logo_url`) mais l'upload n'est pas implemente dans ce
  MVP.
- Ajouter les tests automatises (le cahier des charges prevoit un plan de
  test terrain complet, page 108-111).
- Exports PDF/CSV (table `exports` prevue au schema, non implementee).
- Passer a PostgreSQL si plusieurs clubs/tournois simultanes a fort trafic
  (voir section precedente).
- Deploiement : `npm run build` puis `npm start` (le serveur custom
  `server.js` sert le front, l'API et Socket.IO sur le meme port).

## Structure du projet

```
src/
  app/            pages Next.js (back-office, K'Remote, K'Screen, page publique, API)
  components/     composants UI partages (design system premium sombre)
  lib/            acces donnees (db.ts, repo.ts), auth, rbac, socket, api-client
scripts/seed.ts   jeu de donnees de demonstration
server.js         serveur HTTP custom (Next.js + Socket.IO)
```
