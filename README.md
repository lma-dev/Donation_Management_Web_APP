# Spring Liberation Rose (SLR)

A full-stack donation tracking and fund distribution management system built for nonprofits and charitable organizations.

Track incoming donations, manage fund distributions, generate financial reports, and maintain a complete audit trail — all in one self-hosted application with multi-currency and multi-language support.

## Features

- **Donation Tracking** — Record supporter donations with multi-currency support (JPY, MMK) and automatic exchange rate conversion
- **Fund Distribution** — Track where and to whom funds are distributed, with donation place management
- **Monthly Overviews** — View monthly summaries with KPI cards, carry-over balances, and exchange rate management
- **Yearly Summaries** — Aggregated fiscal year reports with monthly breakdowns
- **Dashboard** — Visual KPI cards and charts for quick financial insights
- **Data Export** — Export reports to Excel, PDF, CSV, and JSON formats
- **User Management** — Role-based access control (SYSTEM_ADMIN, ADMIN, USER) with account locking
- **Activity Logs** — Full audit trail with filtering, search, and CSV export
- **Multi-Language** — English, Japanese, and Myanmar language support
- **Soft Delete** — Safe deletion with trash and restore functionality
- **Email Notifications** — SMTP-based email for password resets and user registration
- **Dark/Light Theme** — Built-in theme switching

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript (strict) |
| Database | PostgreSQL 16 + Prisma ORM |
| Auth | NextAuth v4 (JWT + Credentials) |
| UI | Tailwind CSS 4 + shadcn/ui |
| State | TanStack React Query |
| i18n | next-intl (EN, JA, MM) |
| Validation | Zod |
| Export | pdfkit, exceljs |
| Testing | Vitest |

## Quick Start

### Prerequisites

- Node.js 20+
- pnpm
- PostgreSQL 16+

### Setup

```bash
# 1. Install dependencies
pnpm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your database URL and generate a NEXTAUTH_SECRET:
#   openssl rand -base64 32

# 3. Run database migrations
pnpm prisma migrate dev

# 4. Seed the admin user
pnpm db:seed

# 5. Start the development server
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000)

> You can customize the seed admin credentials via `ADMIN_EMAIL` and `ADMIN_PASSWORD` environment variables. See `.env.example` for details.

### Docker

```bash
cp .env.example .env
docker compose up -d --build
docker compose exec app pnpm prisma migrate deploy
docker compose exec app pnpm db:seed
```

## Project Structure

```
app/                  # Next.js App Router (pages & API routes)
features/             # Feature modules (clean architecture)
  auth/               #   Authentication
  dashboard/          #   Dashboard & KPIs
  monthly-overview/   #   Monthly donation/distribution tracking
  yearly-overview/    #   Yearly summaries
  user-management/    #   User CRUD & roles
  donation-place/     #   Donation place management
  activity-log/       #   Audit trail
components/           # Reusable UI components (shadcn/ui)
lib/                  # Utilities, auth config, Prisma client
messages/             # Translation files (en, ja, mm)
prisma/               # Database schema, migrations, seed
docs/                 # Documentation
```

## Documentation

- [Setup Guide](docs/setup.md) — Installation and configuration
- [Architecture](docs/architecture.md) — Tech stack, directory structure, patterns
- [Database Schema](docs/database.md) — ER diagram and model relationships
- [Business Flows](docs/business-flows.md) — Feature flow diagrams
- [Deployment](docs/deployment.md) — Vercel and Docker deployment guides

## Deployment

Supports deployment to:

- **Vercel** (recommended) — Auto-detects Next.js, connect a hosted PostgreSQL (Neon, Supabase)
- **Docker** — Self-hosted with the included Dockerfile and docker-compose.yml
- **Any Node.js host** — Standard `pnpm build && pnpm start`

See the [Deployment Guide](docs/deployment.md) for step-by-step instructions.

## Scripts

| Script | Description |
|---|---|
| `pnpm dev` | Start development server |
| `pnpm build` | Production build |
| `pnpm start` | Start production server |
| `pnpm test` | Run tests |
| `pnpm lint` | Run ESLint |
| `pnpm db:seed` | Seed admin user and sample data |
| `pnpm prisma migrate dev` | Run database migrations |
| `pnpm prisma studio` | Open database GUI |

## License

[MIT](LICENSE)
