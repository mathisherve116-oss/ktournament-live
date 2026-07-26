# Deployer K'TOURNAMENT LIVE sur Railway

Le code est deja compatible Railway sans modification (serveur Node
persistant, port et base de donnees configurables par variables
d'environnement). Compter 15-20 minutes.

## 1. Compte et outil

1. Cree un compte sur https://railway.app (gratuit pour demarrer, credit
   d'essai puis facturation a l'usage tres faible pour un petit tournoi).
2. Installe l'outil en ligne de commande Railway :
   ```bash
   npm install -g @railway/cli
   ```
3. Connecte-toi :
   ```bash
   railway login
   ```
   (ouvre une page web pour valider la connexion)

## 2. Initialiser le projet

Depuis le dossier du projet decompresse (`ktl_package` ou le nom que tu as
choisi) :

```bash
railway init
```

Choisis "Create new project" et donne-lui un nom, par exemple
`ktournament-live`.

## 3. Stockage persistant pour la base de donnees

Par defaut, le disque d'un service Railway est efface a chaque
redeploiement. Il faut donc un volume persistant pour ne pas perdre les
tournois :

1. Dans le dashboard Railway, ouvre ton service.
2. Onglet **Volumes** → **New Volume**.
3. Mount path : `/data`

## 4. Variables d'environnement

Toujours dans le dashboard, onglet **Variables**, ajoute :

| Variable | Valeur |
|---|---|
| `JWT_SECRET` | une longue chaine aleatoire (ex: genere sur https://1password.com/password-generator ou `openssl rand -hex 32`) |
| `JWT_EXPIRES_IN` | `12h` |
| `DATABASE_FILE` | `/data/ktl.db` |
| `NODE_ENV` | `production` |

## 5. Deployer

```bash
railway up
```

Railway detecte automatiquement Next.js, execute `npm install` puis
`npm run build`, et lance `npm start` (qui demarre `server.js`, donc
Socket.IO fonctionne normalement).

## 6. Generer l'URL publique

Dashboard → onglet **Settings** → **Networking** → **Generate Domain**.
Tu obtiens une URL du type `ktournament-live-production.up.railway.app`.

## 7. Creer les donnees de demonstration

Une seule fois, apres le premier deploiement reussi :

```bash
railway run npm run seed
```

Cela cree le club, le tournoi de demo, les comptes (voir README.md) et les
donnees d'exemple, directement dans la base persistante `/data/ktl.db`.

## 8. C'est en ligne

Ouvre l'URL generee a l'etape 6 : back-office sur `/login`, K'Screen sur
`/screen/<id>`, K'Remote sur `/remote/<tournamentId>`, page publique QR sur
`/t/<slug>` (visible dans le resume du tournoi une fois connecte).

## Pour aller plus loin

- **Nom de domaine perso** (ex: live.kdosports.fr) : Settings → Networking →
  Custom Domain, puis ajoute l'enregistrement CNAME indique chez ton
  registrar.
- **Sauvegardes** : le volume Railway n'est pas sauvegarde automatiquement
  sur le plan de base — exporte regulierement `data/ktl.db` si le tournoi
  est critique (Railway propose des snapshots sur les plans superieurs).
- **Plusieurs tournois/clubs en meme temps** : si le trafic grossit,
  remplacer SQLite par une base Postgres managee (Railway propose Postgres
  en un clic) — voir la section correspondante dans `README.md`.
