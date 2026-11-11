# EstateProfile

Portfolio websites with an AI concierge for real-estate agents and brokers. One codebase runs two ways:

- **SaaS (`DEPLOY_MODE=multi`)**: agents sign up at `/signup` and get `<slug>.yourdomain.com`, and can add custom domains later.
- **Self-hosted (`DEPLOY_MODE=single`)**: a separate deployment for one client, serving `TENANT_SLUG` on any host.

Stack: Next.js 16 (App Router), Tailwind v4, Supabase (Postgres + RLS, Auth, Storage), Vercel AI SDK v7.

## Features
- **Public site**: pages built from sections (hero, stats, about, featured projects, filterable project grid, features, testimonials, gallery, CTA, chat prompt, FAQ, contact form, map). Also includes project detail pages and a full-page `/concierge`.
- **AI concierge**:
  - Answers from the tenant's projects, FAQs and private knowledge notes.
  - Can search the inventory with filters (`searchProjects`) and capture leads (`captureLead`).
  - Hands visitors off to WhatsApp, and stores transcripts.
- **Admin `/admin`**:
  - Overview, projects (with image and PDF upload), page builder and theme editor.
  - AI settings (persona, greeting, instructions, model).
  - FAQ and knowledge notes, a leads inbox, conversations, and site settings (contact details, navigation, custom domains).
- **Theming**: 4 presets. Colors, fonts, corner radius, logo and favicon can be overridden per tenant.

## AI models (free / low cost)
Set at least one key. The provider is chosen per tenant in Admin → AI concierge ("Automatic" uses the cheapest available). If a call fails, the next configured provider takes over.

| Env var | Default model | Notes |
|---|---|---|
| `GOOGLE_GENERATIVE_AI_API_KEY` (or `GEMINI_API_KEY`) | `gemini-flash-latest` | free tier |
| `GROQ_API_KEY` | `llama-3.3-70b-versatile` | free tier, fast |
| `OPENROUTER_API_KEY` | `meta-llama/llama-3.3-70b-instruct` | many cheap/free models |
| `ANTHROPIC_API_KEY` | `claude-haiku-5-5` | low cost, best quality |

Retrieval uses Postgres full-text search instead of embeddings, so it works with every provider and adds no cost per query. API keys live only in server env, never in the database. Daily message caps per plan are set in `src/lib/plans.ts`.

## Local development
```bash
pnpm install
pnpm db:start                 # local Supabase (Docker); applies migrations + seed
cp .env.example .env.local    # fill keys from `pnpm exec supabase status`, plus one AI key
pnpm create-admin demo@estatesite.test demo-pass-123 demo
pnpm dev                      # http://localhost:3100
```

| URL | What |
|---|---|
| http://localhost:3100 | platform landing page |
| http://demo.localhost:3100 | demo tenant "Aurelia Estates" (luxury theme) |
| http://skyline.localhost:3100 | second demo tenant (modern theme) |
| http://localhost:3100/admin | dashboard |

## Tests
```bash
pnpm test:chat   # chatbot tools + retrieval against the DB (no LLM needed)
pnpm test:rls    # tenant isolation (needs a skyline admin: pnpm create-admin skyline@estatesite.test demo-pass-123 skyline)
pnpm test:e2e    # browser flow: login, edit settings/theme/pages/projects, signup (dev server running)
```

## Deploying
**SaaS on Vercel**: see **[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)**. It covers creating the dev and prod Supabase projects, pushing migrations, auth and email settings, the Vercel project (Root Directory `web`), Preview vs Production env vars, wildcard and custom domains, the first admin, and troubleshooting.

Quick reference: `pnpm build:dev` / `pnpm start:dev` use `.env.dev.local`, and `pnpm build:prod` / `pnpm start:prod` use `.env.prod.local` (templates: `.env.dev.example`, `.env.prod.example`). On Vercel, keep the build command as `pnpm build` and set the variables per environment.

**Self-hosted client**
- Create the client's Supabase project and run `supabase db push`. Seed data is not applied to remote projects.
- Build the image:
  `docker build --build-arg NEXT_PUBLIC_SUPABASE_URL=… --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY=… -t estatesite .`
- Run it with `DEPLOY_MODE=single TENANT_SLUG=<slug>`, the service-role key and an AI key.
- Create the tenant and its owner:
  `node --env-file=.env scripts/create-admin.mjs owner@client.com <password> <slug> --create "Client Name"`

## Layout
```
src/proxy.ts                 host → tenant routing (rewrites to /s/[site]/…)
src/app/s/[site]/            tenant public site
src/app/admin/               CMS (server actions in actions.ts)
src/app/api/chat/            streaming AI endpoint (rate-limited, transcripts saved)
src/lib/ai/                  providers + fallback, prompt/retrieval, tools
src/lib/sections/registry.ts section types & editable fields (add new blocks here + in components/sections/render.tsx)
src/lib/theme.ts             presets & CSS variables
supabase/migrations/         schema + RLS
```

## Exporting a client's site
`scripts/export-site.mjs` saves one client's public site as plain static files (HTML, scripts, styles, images) that can be hosted anywhere. The folder contains no platform code, server code or secrets, so it is the way to hand a client their website without handing over the product.

```bash
# 1. Run a production build of the platform (the exporter reads the live site from it).
# 2. Export, naming the domain the client will host it on:
node --env-file=.env.local scripts/export-site.mjs <slug> <new-empty-folder> \
  --site-url https://<slug>.<your-root-domain> \
  --origin https://www.clientdomain.com --origin https://clientdomain.com
# 3. Upload the folder's contents to the root of the client's hosting.
```

How it works:
- It follows links from the home page to find every page, loads each in a browser to collect the scripts and styles they use, and downloads the images and PDFs (rewriting the links to `/media/...`). It then serves the folder on its own and fails if any page errors, a file is missing, or platform-only text (such as a service key) is found.
- Chat and the contact form still call the platform (`--site-url`). `--origin` adds the client's domain to `tenants.allowed_origins`, which `src/lib/cors.ts` checks; members cannot edit that column. Remove an origin there and the chat and form stop working on that copy while the pages keep working. The chat still counts against the client's plan limit.
- The export is a snapshot: re-run it after the client edits their site. Fonts still load from Google Fonts, and the "Powered by" footer line follows the plan like on the live site.
- Hosting must serve `path/index.html` for `/path/` at the domain root (all common static hosts do). Link prefetches 404 harmlessly and the browser falls back to normal page loads.
- Not included: a `--no-concierge` mode for clients who leave the platform entirely.

## Not built yet
- A "Download my site" button in the admin (the export is an operator command for now).
- Stripe billing. `tenants.plan` (`free`, `solo`, `team`) can only be changed with the service role, so a billing webhook just updates that column. Until then, change a plan with `node --env-file=.env.local scripts/set-plan.mjs <slug> <free|solo|team>`.
- Team accounts (invites and roles); the Team plan currently differs from Solo only in its chat cap.
- The investor portal (holdings, payments, documents).
- An embeddable `<script>` chat widget for agents' existing websites.
- Per-tenant caching (`use cache` + `cacheTag`).
