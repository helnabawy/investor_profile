# EstateSite

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

Retrieval uses Postgres full-text search instead of embeddings, so it works with every provider and adds no cost per query. API keys live only in server env, never in the database. Daily message caps per plan are set in `src/app/api/chat/route.ts`.

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
**SaaS on Vercel**
- Create a Supabase project and run `supabase db push`.
- Add a wildcard domain `*.yourdomain.com`, and set `NEXT_PUBLIC_ROOT_DOMAIN=yourdomain.com`.
- Set `VERCEL_TOKEN` and `VERCEL_PROJECT_ID` so custom domains added in the admin are registered automatically. Tenants point a CNAME to `cname.vercel-dns.com`.

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

## Not built yet
- Stripe billing. `tenants.plan` exists and only the service role can change it, so a billing webhook just updates that column.
- The investor portal (holdings, payments, documents).
- An embeddable `<script>` chat widget for agents' existing websites.
- Per-tenant caching (`use cache` + `cacheTag`).
