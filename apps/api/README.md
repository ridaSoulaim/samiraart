# Samira Art API

## Configuration MySQL

1. Copy `.env.example` to `.env` in this directory.
2. Set `MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_DATABASE`, `MYSQL_USER`, and `MYSQL_PASSWORD`.
3. Set a private `ADMIN_PASSWORD` and a long random `ADMIN_TOKEN_SECRET`.
4. Create the tables in your existing database (replace `your_database_name`):

```bash
mysql -u root -p your_database_name < apps/api/schema.sql
```

Ou, avec la configuration de `.env` :

```bash
npm --prefix apps/api run db:init
```

The API stores products in the `products` table. Admin credentials are kept in environment variables and are never sent to the browser; the browser receives only a short-lived session token.

## Synchroniser le catalogue existant

Après avoir configuré MySQL et importé `schema.sql`, lancez depuis la racine :

```bash
npm --prefix apps/api run sync:products
```

Cette commande récupère les produits actuellement publiés par l’API e-commerce du site et les insère ou met à jour dans MySQL. Elle ne supprime aucun produit local.

## Run locally

From the repository root:

```bash
npm install
npm run dev
```

The React app runs on `http://localhost:3000` and the API on `http://localhost:4000`. Vite proxies `/api` requests to the API.

The API health check is available at `http://localhost:4000/api/health`.
