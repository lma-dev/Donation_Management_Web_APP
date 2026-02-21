# Deployment Guide

## Vercel Deployment (Recommended)

### Prerequisites

- A [Vercel](https://vercel.com) account
- GitHub repository connected to Vercel
- A PostgreSQL database (Vercel Postgres, Neon, Supabase, or any hosted provider)

### Step-by-Step

1. **Import project** — Go to [vercel.com/new](https://vercel.com/new), select your GitHub repository.

2. **Configure environment variables** — In Vercel project settings, add:

   | Variable | Value |
   |---|---|
   | `DATABASE_URL` | Your PostgreSQL connection string (with `?sslmode=require` for hosted DBs) |
   | `NEXTAUTH_URL` | Your production domain, e.g. `https://your-app.vercel.app` |
   | `NEXTAUTH_SECRET` | Generate with: `openssl rand -base64 32` |
   | `SMTP_HOST` | SMTP server hostname (e.g. `smtp.gmail.com`) |
   | `SMTP_PORT` | SMTP port (`587` for TLS, `465` for SSL) |
   | `SMTP_USER` | SMTP username / email |
   | `SMTP_PASS` | SMTP password / app password |
   | `SMTP_FROM` | Sender email address |

3. **Deploy** — Vercel auto-detects Next.js. Click "Deploy" and wait for the build to complete.

4. **Run database migrations** — After the first deploy, run migrations from a machine with database access:

   ```bash
   DATABASE_URL="your-production-url" pnpm prisma migrate deploy
   ```

5. **Seed the admin user**:

   ```bash
   DATABASE_URL="your-production-url" pnpm db:seed
   ```

6. **Custom domain** (optional) — In Vercel project settings > Domains, add your custom domain and configure DNS.

### Database Providers

| Provider | Free Tier | Notes |
|---|---|---|
| [Neon](https://neon.tech) | 0.5 GB | Serverless PostgreSQL, built-in connection pooling |
| [Supabase](https://supabase.com) | 500 MB | Full PostgreSQL with dashboard |
| [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres) | 256 MB | Integrated with Vercel, powered by Neon |

For serverless environments (Vercel), use connection pooling to avoid exhausting database connections. Most hosted providers offer this by default. With Neon, use the pooled connection string (port `5432` with `-pooler` suffix in hostname).

---

## Docker Deployment (Alternative)

### Production with Docker Compose

1. **Configure environment** — Copy and edit `.env`:

   ```bash
   cp .env.example .env
   # Edit .env with production values
   ```

2. **Build and run**:

   ```bash
   docker compose up -d --build
   ```

3. **Run migrations**:

   ```bash
   docker compose exec app pnpm prisma migrate deploy
   ```

4. **Seed admin user**:

   ```bash
   docker compose exec app pnpm db:seed
   ```

### Reverse Proxy

For production Docker deployments, place a reverse proxy (nginx, Caddy, or Traefik) in front of the app for SSL termination and load balancing.

Example nginx configuration:

```nginx
server {
    listen 443 ssl;
    server_name your-domain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## Environment Variables Reference

| Variable | Required | Description | Example |
|---|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `NEXTAUTH_URL` | Yes | Application base URL | `https://your-app.com` |
| `NEXTAUTH_SECRET` | Yes | Secret for signing JWT tokens | `openssl rand -base64 32` |
| `NODE_ENV` | No | Environment mode | `production` |
| `SMTP_HOST` | No | SMTP server hostname | `smtp.gmail.com` |
| `SMTP_PORT` | No | SMTP server port | `587` |
| `SMTP_USER` | No | SMTP authentication username | `user@gmail.com` |
| `SMTP_PASS` | No | SMTP authentication password | App password |
| `SMTP_FROM` | No | Sender email address | `noreply@your-app.com` |

> SMTP variables are optional. If not configured, user registration will still work but confirmation emails will not be sent.

---

## Database Migrations in Production

Always use `migrate deploy` (not `migrate dev`) in production:

```bash
pnpm prisma migrate deploy
```

This applies pending migrations without generating new ones or resetting data.

---

## Post-Deployment Checklist

- [ ] Generate a secure `NEXTAUTH_SECRET` (do not use the default)
- [ ] Run `pnpm prisma migrate deploy` against your production database
- [ ] Run `pnpm db:seed` to create the initial admin user
- [ ] Change the default admin password after first login
- [ ] Configure SMTP variables if you want confirmation emails
- [ ] Test email delivery by creating a test user
- [ ] Verify the application loads at your production URL
- [ ] Set up database backups on your PostgreSQL provider
