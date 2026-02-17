# Project Architecture

## Tech Stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **Language:** TypeScript (strict)
- **Database:** PostgreSQL 16 + Prisma ORM
- **Auth:** NextAuth v4 (JWT + Credentials provider)
- **UI:** Tailwind CSS 4 + shadcn/ui (new-york style)
- **i18n:** next-intl (en, ja, mm)
- **State:** TanStack React Query
- **Validation:** Zod

## Directory Structure

```
app/
  [locale]/                 # Localized pages
    auth/login/page.tsx     # Login page
    layout.tsx              # Locale layout (fonts, providers, i18n)
    page.tsx                # Home page
  api/auth/[...nextauth]/   # NextAuth API route
  globals.css               # Tailwind + theme variables
  layout.tsx                # Root layout
  page.tsx                  # Redirects to default locale

components/
  ui/                       # shadcn/ui components (Button, Card, Input, Label)

features/                   # Feature-based modules (clean architecture)
  auth/
    components/             # UI components (LoginForm)
    data/                   # Repository layer (DB queries)
    domain/                 # Business logic (authenticateUser)
    schema.ts               # Zod validation schemas
    api-client.ts           # Client-side API helpers
    error.ts                # Error definitions

i18n/
  routing.ts                # Locale config (en, ja, mm)
  request.ts                # Server-side locale resolution
  navigation.ts             # i18n-aware Link, useRouter, etc.

lib/
  auth.ts                   # NextAuth configuration
  prisma.ts                 # Prisma client singleton
  env.ts                    # Environment variable validation
  utils.ts                  # Utilities (cn)

messages/                   # Translation files
  en.json
  ja.json
  mm.json

prisma/
  schema.prisma             # Database schema
  migrations/               # Migration history
  seed.ts                   # Database seed script

providers/
  index.tsx                 # Provider composition
  session.tsx               # NextAuth SessionProvider
  query-client.tsx          # React Query provider

types/
  next-auth.d.ts            # NextAuth type augmentation
```

## Feature Module Pattern

Each feature follows a layered pattern:

```
features/<name>/
  components/     # React components (client/server)
  data/           # Database queries (repository pattern)
  domain/         # Business logic, use cases
  schema.ts       # Input/output validation (Zod)
  api-client.ts   # Client-side API calls
  error.ts        # Feature-specific errors
```

## Auth Flow

1. User submits email + password on `/[locale]/auth/login`
2. `signIn("credentials", ...)` calls NextAuth API route
3. NextAuth's `authorize` calls `authenticateUser` (domain layer)
4. Domain layer queries user via repository, validates password with bcrypt
5. On success: JWT token issued, session created
6. Middleware protects all routes except public pages (`/`, `/auth/login`, `/auth/register`)

## Database

See [database.md](./database.md) for the full ER diagram.

**Models:** User, Account, Session, VerificationToken, Campaign, IncomingDonation, FundDistribution, MonthlyExchangeRate

## Localization

- 3 locales: English (`en`), Japanese (`ja`), Myanmar (`mm`)
- Default: `en`
- URL pattern: `/{locale}/path` (e.g., `/ja/auth/login`)
- Translations stored in `messages/{locale}.json`
- Use `useTranslations("namespace")` in components
