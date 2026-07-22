# Faalupega API

NestJS API for Faalupega (auth, users, sessions).

## Prerequisites

- Node.js 20+
- Docker Desktop (for local MySQL)

## Setup

```bash
npm install
cp .env.example .env
npm run db:up
```

## Development

```bash
npm run dev
```

API runs at http://localhost:3001 by default.

## Production

```bash
npm run build
npm run start:prod
```

## Environment

Copy `.env.example` to `.env` and configure:

| Variable | Description |
|----------|-------------|
| `API_PORT` | HTTP port (default `3001`) |
| `DB_HOST` | MySQL host |
| `DB_PORT` | MySQL port |
| `DB_USER` | MySQL user |
| `DB_PASSWORD` | MySQL password |
| `DB_NAME` | MySQL database |
| `JWT_SECRET` | Secret for signing JWTs |
| `CORS_ORIGIN` | Allowed frontend URL(s), comma-separated (e.g. `http://localhost:3000,https://your-app.vercel.app`) |

## Database

Start MySQL with Docker:

```bash
npm run db:up
npm run db:down
```

Schema is applied automatically on first container start via `db/init/`.

### Railway

Link your MySQL service to the API service, then either:

1. **Single reference (easiest)** — on the **API service**, add one variable:

   ```
   MYSQL_URL=${{MySQL.MYSQL_URL}}
   ```

   Replace `MySQL` with your MySQL service name exactly as shown on the Railway canvas.

2. **Individual references** — on the **API service** (not MySQL, not shared):

   ```
   DB_HOST=${{MySQL.MYSQLHOST}}
   DB_PORT=${{MySQL.MYSQLPORT}}
   DB_USER=${{MySQL.MYSQLUSER}}
   DB_PASSWORD=${{MySQL.MYSQLPASSWORD}}
   DB_NAME=${{MySQL.MYSQLDATABASE}}
   ```

   Variables on the MySQL service's own Variables tab are **not** automatically visible to the API. Shared variables are optional and not required for this setup.

Apply the schema once against the Railway database (e.g. via Railway's MySQL shell or `mysql` CLI):

```bash
mysql -h $MYSQLHOST -P $MYSQLPORT -u $MYSQLUSER -p$MYSQLPASSWORD $MYSQLDATABASE < db/init/01-schema.sql
```

Redeploy the API after changing variables.

Query the database:

```bash
docker exec -it faalupega-mysql mysql -ufaalupega -pfaalupega faalupega
```
