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

Edit `.env` with your local database credentials:

```
DATABASE_URL="postgresql://<user>@localhost:5432/spring_liberation_rose"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-change-in-production"
NODE_ENV="development"

# Optional: SMTP for sending confirmation emails on user registration
SMTP_HOST=""
SMTP_PORT="587"
SMTP_USER=""
SMTP_PASS=""
SMTP_FROM=""
```

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

Default admin credentials:
- Email: `admin@slr.org`
- Password: `admin123`

### 4. Start development server

```bash
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Docker (alternative)

```bash
docker compose up
```

This starts PostgreSQL and the app together.

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

See [deployment.md](./deployment.md) for Vercel and Docker deployment guides.
