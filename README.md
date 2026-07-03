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

Query the database:

```bash
docker exec -it faalupega-mysql mysql -ufaalupega -pfaalupega faalupega
```
