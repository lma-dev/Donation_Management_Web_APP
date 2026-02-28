# Deployment Guide (Vercel)

## Prerequisites

- A [Vercel](https://vercel.com) account
- GitHub repository connected to Vercel
- A PostgreSQL database (Neon, Supabase, or any hosted provider)

## Step-by-Step

1. **Import project** — Go to [vercel.com/new](https://vercel.com/new), select your GitHub repository. Vercel auto-detects Next.js.

2. **Configure environment variables** — In Vercel project settings, add:

   | Variable | Required | Value |
   |---|---|---|
   | `DATABASE_URL` | Yes | PostgreSQL connection string (with `?sslmode=require`) |
   | `NEXTAUTH_URL` | Yes | Your production domain, e.g. `https://your-app.vercel.app` |
   | `NEXTAUTH_SECRET` | Yes | Generate with: `openssl rand -base64 32` |
   | `SMTP_HOST` | No | SMTP server hostname (e.g. `smtp.gmail.com`) |
   | `SMTP_PORT` | No | SMTP port (`587` for TLS, `465` for SSL) |
   | `SMTP_USER` | No | SMTP username / email |
   | `SMTP_PASS` | No | SMTP password / app password |
   | `SMTP_FROM` | No | Sender email address (defaults to `SMTP_USER`) |

   > SMTP variables are optional. If not configured, user registration still works but emails will not be sent.

3. **Deploy** — Click "Deploy" and wait for the build to complete.

4. **Run database migrations** — After the first deploy, run from your local machine:

   ```bash
   DATABASE_URL="your-production-url" pnpm prisma migrate deploy
   ```

5. **Seed the admin user**:

   ```bash
   DATABASE_URL="your-production-url" pnpm db:seed
   ```

6. **Custom domain** (optional) — In Vercel project settings > Domains, add your custom domain and configure DNS.

## Database Providers

| Provider | Free Tier | Notes |
|---|---|---|
| [Neon](https://neon.tech) | 0.5 GB | Serverless PostgreSQL, built-in connection pooling |
| [Supabase](https://supabase.com) | 500 MB | Full PostgreSQL with dashboard |
| [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres) | 256 MB | Integrated with Vercel, powered by Neon |

For serverless environments, use connection pooling to avoid exhausting database connections. Most hosted providers offer this by default. With Neon, use the pooled connection string (port `5432` with `-pooler` suffix in hostname).

---

## Database Migrations

Always use `migrate deploy` (not `migrate dev`) against production:

```bash
DATABASE_URL="your-production-url" pnpm prisma migrate deploy
```

This applies pending migrations without generating new ones or resetting data.

---

## Post-Deployment Checklist

- [ ] Generate a secure `NEXTAUTH_SECRET` (do not use the default)
- [ ] Run `prisma migrate deploy` against your production database
- [ ] Run `pnpm db:seed` to create the initial admin user
- [ ] Change the default admin password after first login
- [ ] Configure SMTP variables if you want email notifications
- [ ] Verify the application loads at your production URL
- [ ] Set up database backups on your PostgreSQL provider
