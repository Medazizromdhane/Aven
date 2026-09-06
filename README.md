# VisaHunter AI

Find international jobs with **visa sponsorship**, auto-score your fit, and generate
ATS-optimized resumes & cover letters — powered by **Groq**.

Monorepo:

- `apps/backend` — NestJS API (auth, CV parsing, job aggregation, visa analysis, matching, generation, applications, dashboard). Prisma + PostgreSQL. BullMQ/Redis-ready. Swagger at `/docs`.
- `apps/web` — Next.js 15 + TypeScript + Tailwind + TanStack Query + Zustand.

---

## 1. Local setup

> Requires Node ≥ 20 and pnpm. **Free at least ~2 GB disk** before installing.

```powershell
# from the repo root
corepack enable
pnpm install

# configure env
Copy-Item .env.example apps/backend/.env
# edit apps/backend/.env and set GROQ_API_KEY + DATABASE_URL

# database (for a new local database)
pnpm --filter @visahunter/backend prisma:generate
pnpm --filter @visahunter/backend prisma:migrate
SEED_DEMO_DATA=true pnpm --filter @visahunter/backend seed   # optional local demo jobs

# run both apps
pnpm dev
```

- API: http://localhost:4000/api · Swagger: http://localhost:4000/docs
- Web: http://localhost:3000

Only `GROQ_API_KEY` and `DATABASE_URL` are required to boot. All job providers
that need keys (Adzuna, JSearch) auto-disable when unset; the free ones
(Remotive, Greenhouse, Lever, The Muse) work with **no keys**.

---

## 2. Deploy for **$0 — no credit card required**

Every service below has a genuinely free tier that does **not** ask for a card.

| Piece            | Free host                    | Card needed? |
| ---------------- | ---------------------------- | ------------ |
| PostgreSQL       | **Neon** (neon.tech)         | ❌ No        |
| Redis (queues)   | **Upstash** (upstash.com)    | ❌ No        |
| Backend (NestJS) | **Render** free web service  | ❌ No        |
| Frontend (Next)  | **Vercel** Hobby             | ❌ No        |
| File storage     | **Supabase Storage** free    | ❌ No        |
| Email            | **Resend** free (3k/mo)      | ❌ No        |
| LLM              | **Groq** (your key)          | —            |
| Daily cron ping  | **cron-job.org**             | ❌ No        |

### Step A — Database (Neon)
1. Create a project at neon.tech → copy the **connection string**.
2. It becomes your `DATABASE_URL` (append `?sslmode=require`).

### Step B — Redis (Upstash)
1. Create a Redis database at upstash.com → copy the **`rediss://` URL**.
2. That is your `REDIS_URL`.

### Step C — Storage (Supabase)
1. Create a project at supabase.com → **Storage** → create a public bucket `visahunter`.
2. Settings → Storage → S3 access: copy the endpoint and access keys.
4. Set `STORAGE_ENDPOINT`, `STORAGE_ACCESS_KEY_ID`, `STORAGE_SECRET_ACCESS_KEY`,
  `STORAGE_BUCKET`, and `STORAGE_REGION=auto` in Render.
  > The endpoint must look like `https://PROJECT_REF.supabase.co/storage/v1/s3`.
  > Do not include the bucket name before the project ref.

### Step D — One-click app deployment (Render Blueprint)
1. Push this repo to GitHub.
2. Render → **New → Blueprint** → pick the repository.
3. Render reads `render.yaml` and creates both free services automatically:
  - `aven-api` — NestJS backend
  - `aven-web` — Next.js frontend
4. The Blueprint automatically connects the frontend API URL to the backend and
  configures backend CORS for the frontend. You do not need to create a Vercel project.
5. Add the secret variables when Render prompts you: `DATABASE_URL`, `GROQ_API_KEY`,
  `STORAGE_ENDPOINT`, `STORAGE_ACCESS_KEY_ID`, and `STORAGE_SECRET_ACCESS_KEY`.
  `JWT_SECRET` and `JOBS_CRON_SECRET` are generated automatically.

The Blueprint references each service's public `RENDER_EXTERNAL_URL`, so the browser
gets an `https://` API URL and backend CORS is configured without copying URLs by hand.

> Render free instances sleep after ~15 min idle. See Step F to keep the daily
> hunt working.

### Step E — Open the deployed app
After the Blueprint finishes, open the public URL for `aven-web` in Render.
The backend is available at the public URL for `aven-api`; its health check is
`/api/health` and Swagger is available at `/docs`.

### Step F — Daily job hunt on a free (sleeping) backend
The in-app cron (`JobsCronService`, 6 AM daily) won't fire while a free Render
instance is asleep. Two free options:
- Schedule `POST https://YOUR-RENDER-URL/api/jobs/internal/daily-hunt` in
  **cron-job.org** (free), with header `x-cron-secret: YOUR_JOBS_CRON_SECRET`.
  Add the same `JOBS_CRON_SECRET` to Render. This wakes the service and runs the
  user-aware hunt. Do not expose this endpoint without the secret.
- A cheaper fallback is a periodic `GET https://YOUR-RENDER-URL/api/health` ping,
  but that only keeps the service warm; it does not run a hunt.

### Step G — Email (Resend)
1. Get an API key at resend.com → set `RESEND_API_KEY`.
2. Until you verify a domain, send from `onboarding@resend.dev` via `EMAIL_FROM`.

### What cannot be fully automated for free
Render can provision the two application services automatically, but no deployment
file can create accounts or obtain credentials for Neon, Supabase, or Mistral on your
behalf. Render's own free Postgres is not a durable production option because it
expires after 30 days. Create the external services once, paste their credentials
into the Blueprint prompt, and future GitHub pushes deploy automatically.

---

## 3. Free-tier notes & limits

- **Application workflow**: the web app now saves jobs, opens the employer's real
  `applyUrl`, and tracks application status. Browser automation is intentionally not
  enabled: it is unreliable on free hosts and many job boards prohibit automated submission.
- **Neon free**: ample for this workload; it auto-sleeps and wakes on connect.
- **Upstash free**: 10k commands/day — fine for light queue use.
- **Mistral costs**: the visa keyword pass and matching engine are 100% local
  (no tokens). Only CV extraction and document generation call the API — cheap and
  on demand.
- The first deployment uses `prisma db push` because this repository currently has
  no checked-in migration history. Before a larger production rollout, replace it
  with reviewed Prisma migrations.
- Everything can later be upgraded without code changes (all storage is
  S3-compatible; DB/Redis are standard URLs).

---

## 4. API overview

`/api/auth` · `/api/users/me/profile` · `/api/cv/upload` · `/api/jobs` ·
`/api/jobs/search` · `/api/matching/recompute` · `/api/matching/top` ·
`/api/generation/resume` · `/api/generation/cover-letter` · `/api/applications` ·
`/api/dashboard`. Full interactive docs at `/docs`.
