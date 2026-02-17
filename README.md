# Spring Liberation Rose (SLR)

Donation tracking and fund distribution management system.

## Features

- Admin authentication (email + password)
- Campaign management
- Incoming donation tracking with multi-currency support
- Fund distribution records
- Monthly exchange rate management
- Multi-language support (English, Japanese, Myanmar)

## Quick Start

```bash
pnpm install
cp .env.example .env       # configure your database URL
pnpm prisma migrate dev    # run migrations
pnpm db:seed               # seed admin user
pnpm dev                   # start dev server
```

Visit [http://localhost:3000](http://localhost:3000)

Default login: `admin@slr.org` / `admin123`

## Documentation

- [Setup Guide](docs/setup.md)
- [Architecture](docs/architecture.md)
- [Database Schema](docs/database.md)
