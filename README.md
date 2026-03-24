# Tanaros - Template Site Vitrine Premium (Express)

Template multipage en marque blanche pour activite de creation de site web.

## Stack
- Node.js + Express
- EJS (templates multipages)
- CSS/JS natifs (animations + compteurs)
- Security: Helmet, Rate limit, validation formulaire

## Pages incluses
- `/` Accueil
- `/services`
- `/realisations`
- `/a-propos`
- `/contact`
- `404`

## Lancer en local
1. Installer Node.js 20+
2. Copier `.env.example` en `.env`
3. Installer les dependances:
   ```bash
   npm install
   ```
4. Lancer en dev:
   ```bash
   npm run dev
   ```
5. Ouvrir `http://localhost:3000`

## Personnalisation marque blanche
- Nom et infos entreprise: `config/site.config.js`
- Identite visuelle: `public/css/styles.css` (`:root`)
- Textes des pages: `views/pages/*.ejs`

## Formulaire contact
Route: `POST /contact`

Protections activees:
- honeypot (`website`)
- rate limiting (8 req / 15 min / IP)
- validation et sanitation des champs
- headers de securite (Helmet + CSP)

### SMTP
Configurer dans `.env`:
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_SECURE`
- `SMTP_USER`
- `SMTP_PASS`
- `CONTACT_TO`
- `CONTACT_FROM`

Si SMTP n'est pas configure, les messages sont traces en console.

## Docker
Build + run:
```bash
docker compose up -d --build
```

Arret:
```bash
docker compose down
```

## Recommandations production
- Mettre un reverse proxy (Nginx/Caddy/Traefik)
- Forcer HTTPS + HSTS
- Activer logs centralises
- Mettre en place sauvegardes et supervision
