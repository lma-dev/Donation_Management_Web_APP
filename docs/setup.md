# Development Setup

## Prerequisites

- Node.js 20+
- pnpm
- PostgreSQL 16+

## Quick Start

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` with your local database credentials. See `.env.example` for all available variables.

### 3. Set up the database

Create the database:

```bash
psql -c "CREATE DATABASE spring_liberation_rose;"
```

Run migrations:

```bash
pnpm prisma migrate dev
```

Generate the Prisma client:

```bash
pnpm prisma generate
```

Seed the admin user:

```bash
pnpm db:seed
```

You can customize the admin credentials via environment variables before seeding:

```bash
ADMIN_EMAIL="your-email@example.com" ADMIN_PASSWORD="your-secure-password" pnpm db:seed
```

Default credentials (if env vars are not set): `admin@example.com` / `changeme123`

> **Important:** Change the default password immediately after first login.

### 4. Start development server

```bash
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Docker (alternative)

If you prefer not to install PostgreSQL locally, use Docker Compose:

```bash
cp .env.example .env
docker compose up -d --build
docker compose exec app npx prisma migrate deploy
docker compose exec app npx tsx prisma/seed.ts
```

See [Docker Workflow](./docker-workflow.md) for full details and common commands.

## Available Scripts

| Script | Description |
|---|---|
| `pnpm dev` | Start development server |
| `pnpm build` | Production build |
| `pnpm start` | Start production server |
| `pnpm test` | run test |
| `pnpm lint` | Run ESLint |
| `pnpm db:seed` | Seed admin user |
| `pnpm prisma migrate dev` | Run database migrations |
| `pnpm prisma generate` | Regenerate Prisma client |
| `pnpm prisma studio` | Open Prisma Studio (DB GUI) |

## Production Deployment

See [deployment.md](./deployment.md) for the Vercel deployment guide.
