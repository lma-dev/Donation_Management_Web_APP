# CLAUDE.md

## Tech Stack

- **Framework:** Next.js 16 (App Router) + React 19 + TypeScript 5
- **Database:** PostgreSQL 16 + Prisma 7 (with `@prisma/adapter-pg`)
- **Auth:** NextAuth v4 (Credentials provider, JWT strategy)
- **Styling:** Tailwind CSS v4 + shadcn/ui (new-york style, lucide icons)
- **State:** Jotai (client) + TanStack React Query v5 (server)
- **i18n:** next-intl v4
- **Validation:** Zod v4
- **Package Manager:** pnpm

## Commands

```bash
pnpm dev              # Start dev server
pnpm build            # Production build
pnpm start            # Start production server
pnpm lint             # Run ESLint
pnpm test             # Run vitest
pnpm test:watch       # Run vitest in watch mode
pnpm db:seed          # Seed data
pnpm prisma migrate dev      # Create + apply migration
pnpm prisma migrate deploy   # Apply pending migrations (production)
pnpm prisma generate         # Regenerate Prisma client
```

## Project Structure

```
app/                         # Next.js App Router
├── api/                     # API routes grouped by resource
├── [locale]/                # i18n pages
│   ├── auth/                # Auth pages (login, forgot/reset password)
│   └── (dashboard)/         # Protected routes (sidebar layout)
└── generated/prisma/        # Auto-generated Prisma client (DO NOT EDIT)

features/                    # Feature modules (clean architecture)
├── [feature]/
│   ├── domain/index.ts      # Business logic
│   ├── data/index.ts        # Database queries
│   ├── schema.ts            # Zod validation
│   ├── error.ts             # Custom error class
│   ├── types.ts             # TypeScript types
│   ├── api-client.ts        # Frontend fetch wrapper
│   ├── atoms.ts             # Jotai state atoms
│   ├── use-*.ts             # React Query hooks
│   └── export/              # Excel/PDF/JSON export utils

components/                  # UI components
├── ui/                      # shadcn/ui primitives (button, input, dialog, etc.)
├── layout/                  # Sidebar, Navbar, UserMenu, ThemeToggle, LanguageSwitcher
├── [feature]/               # Feature-specific components (tables, forms, dialogs)

lib/                         # Shared utilities
├── auth.ts                  # NextAuth config
├── prisma.ts                # Prisma client singleton (PG adapter)
├── api-auth.ts              # requireRole() API middleware
├── activity-log.ts          # logAction() audit utility
├── permissions.ts           # Role hierarchy & route permissions
├── utils.ts                 # cn() classname helper

i18n/                        # next-intl config (routing, request, navigation)
messages/                    # Translation JSON files per locale
providers/                   # React context providers (query, session, theme)
prisma/                      # Schema, migrations, seed script
types/                       # Global type definitions
```

## Architecture Patterns

### Feature Module Pattern

Every feature follows: `domain/ → data/ → schema.ts → api-client.ts → use-*.ts → components/`

- **domain/** — Pure business logic, no framework dependencies
- **data/** — Prisma queries only, called by domain or API routes
- **schema.ts** — Zod schemas for request validation
- **api-client.ts** — Frontend `fetch()` wrapper for the feature's API
- **use-*.ts** — React Query hooks consuming api-client
- **atoms.ts** — Jotai atoms for client-side UI state

### API Route Pattern

```typescript
// app/api/[resource]/route.ts
import { requireRole } from "@/lib/api-auth";

export async function GET(req: Request) {
  const session = await requireRole("ADMIN");  // throws 401/403
  // ... handle request
  return Response.json(data);
}
```

### Database Access

- Prisma client: `import { prisma } from "@/lib/prisma"`
- Generated client output: `app/generated/prisma/` (configured in schema.prisma)
- Uses `@prisma/adapter-pg` for connection pooling
- Soft delete pattern: `deletedAt` column (NULL = active)

### Auth & Permissions

- **Middleware** (`middleware.ts`): Enforces locale routing + role-based access
- **API auth** (`lib/api-auth.ts`): `requireRole()` for API route protection
- Always use `requireRole()` in API routes, never trust client-side role checks

### i18n

- URL-based: `/{locale}/dashboard`
- Translations in `messages/{locale}.json`
- Use `useTranslations('Namespace')` in components
- When adding UI text, add keys to all locale files

## Coding Conventions

- **Path alias:** `@/` maps to project root
- **Imports:** Use `@/` prefix (e.g., `@/lib/prisma`, `@/features/auth/domain`)
- **Components:** PascalCase filenames, `"use client"` directive for interactive components
- **API routes:** RESTful, grouped by resource under `app/api/`
- **Styling:** Tailwind utility classes + `cn()` from `@/lib/utils` for conditional classes
- **Toasts:** `sonner` — use `toast.success()`, `toast.error()`
- **Icons:** `lucide-react` only
- **Forms:** Zod schema → validate in API route, client-side validation in components
- **Error classes:** Each feature has its own `error.ts` with a custom Error subclass
- **Activity logging:** Use `logAction()` from `@/lib/activity-log` for audit trail on mutations
- **Export formats:** Excel (exceljs), PDF (pdfkit), JSON — see `features/*/export/`

## Important Notes

- **DO NOT edit** `app/generated/prisma/` — auto-generated by `prisma generate`
- **Soft delete** — Use `deletedAt` instead of hard delete
