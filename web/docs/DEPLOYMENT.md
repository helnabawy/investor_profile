# Deploying EstateProfile (Vercel + Supabase)

This guide takes the SaaS setup (`DEPLOY_MODE=multi`) from nothing to a live site, with two environments:

| | Dev / staging | Production |
|---|---|---|
| Git branch | `dev` (and any feature branch) | `main` |
| Vercel environment | Preview | Production |
| Root domain | `dev.yourdomain.com` | `yourdomain.com` |
| Tenant sites | `<slug>.dev.yourdomain.com` | `<slug>.yourdomain.com`, custom domains |
| Supabase project | `estatesite-dev` | `estatesite-prod` |
| Local env file | `.env.dev.local` | `.env.prod.local` |

Replace `yourdomain.com` with your real domain everywhere below. All commands run from the `web/` folder.

To install a single client on their own server with Docker instead, see "Self-hosted client" in the [README](../README.md#deploying).

---

## 0. What you need

- A GitHub repo containing this code (Vercel deploys from Git).
- A [Vercel](https://vercel.com) account and a [Supabase](https://supabase.com) account.
- A domain you control. Wildcard subdomains (`*.yourdomain.com`) need the domain to use **Vercel's nameservers** (step 4).
- At least one AI key: Gemini, Groq, OpenRouter or Anthropic (see the README's "AI models").
- Locally: `pnpm install` done. The Supabase CLI is already a dev dependency (`pnpm exec supabase …`).

---

## 1. Create the Supabase projects

Create **two** projects in the Supabase dashboard, `estatesite-dev` and `estatesite-prod`. Pick the region closest to your visitors, and use the same one for both. Save each database password; the CLI asks for it.

The app talks to Supabase only over its HTTP API (`supabase-js`). It never opens a direct Postgres connection, so you don't need a pooler or connection string on Vercel.

### 1.1 Apply the schema

Run this once per project, and again each time you add a migration:

```bash
pnpm exec supabase login
```

```bash
pnpm exec supabase link --project-ref <dev-project-ref>
```

```bash
pnpm exec supabase db push
```

Then link the other project and push again:

```bash
pnpm exec supabase link --project-ref <prod-project-ref>
```

```bash
pnpm exec supabase db push
```

The project ref is the `xxxx` in `https://xxxx.supabase.co` (also under Project Settings → General).

`db push` applies everything in `supabase/migrations/`:
- the tables, row-level security (RLS) policies and column grants
- the `pg_trgm` extension
- the public **`media`** storage bucket that image and PDF uploads use, with policies that let only a site's members write to its folder

You don't need to create anything by hand in the Table editor or Storage.

> `supabase/seed.sql` (the demo tenants) is **not** applied to remote projects. Keep it that way for production. For a populated dev project you can run `pnpm exec supabase db push --include-seed` against the **dev** project only.

Check that it worked: in the dashboard, Table editor shows `tenants`, `projects`, `pages`, `leads`, and so on, and Storage shows a public `media` bucket.

### 1.2 Get the API keys

Project Settings → API (or **API Keys**) for each project:

| Supabase value | Env var |
|---|---|
| Project URL | `NEXT_PUBLIC_SUPABASE_URL` |
| `anon` key, or the newer **publishable** key (`sb_publishable_…`) | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| `service_role` key, or the newer **secret** key (`sb_secret_…`) | `SUPABASE_SERVICE_ROLE_KEY` |

The service-role/secret key bypasses RLS. It must only ever be set as a server env var. Never put it in a `NEXT_PUBLIC_*` variable.

### 1.3 Auth settings

Authentication → **URL Configuration**, per project:

| | Dev | Prod |
|---|---|---|
| Site URL | `https://dev.yourdomain.com` | `https://yourdomain.com` |
| Redirect URLs | `https://dev.yourdomain.com/**`, `https://*-<your-vercel-team>.vercel.app/**` | `https://yourdomain.com/**` |

Authentication → **Sign In / Providers → Email**: decide on **Confirm email**.
- **On** (the hosted default): after signing up, the agent is asked to confirm their email, then sign in and finish creating their site. Turn this on for production.
- **Off**: sign-up continues straight to choosing the site address. Convenient on the dev project.

Authentication → **Emails → SMTP Settings**: Supabase's built-in mailer only sends a few emails per hour and is meant for testing. For production, set up custom SMTP so confirmation and password emails arrive. Resend works, and it's the same provider the app uses for lead emails (host `smtp.resend.com`, port `465`, user `resend`, password = a Resend API key, sender on a verified domain).

---

## 2. Create the Vercel project

1. Vercel → **Add New → Project** → import the GitHub repo.
2. Set **Root Directory** to `web`. This is required, because the app is not at the repo root.
3. Leave Framework (Next.js), Install command and Build command at their defaults. Vercel detects pnpm from `pnpm-lock.yaml`, and the build command stays `pnpm build`.
4. Don't deploy yet. Add the environment variables first (step 3), or the first build will have no Supabase URL baked in.

Under Settings → Git, keep **Production Branch** = `main`.

---

## 3. Environment variables

Settings → Environment Variables. Add each variable once **for Production** with the prod values, and once **for Preview** with the dev values. Templates with every key are in [`.env.prod.example`](../.env.prod.example) and [`.env.dev.example`](../.env.dev.example).

| Variable | Preview (dev) | Production | Notes |
|---|---|---|---|
| `DEPLOY_MODE` | `multi` | `multi` | |
| `NEXT_PUBLIC_ROOT_DOMAIN` | `dev.yourdomain.com` | `yourdomain.com` | no `https://`, no trailing slash |
| `NEXT_PUBLIC_SUPABASE_URL` | dev project URL | prod project URL | |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | dev anon/publishable | prod anon/publishable | |
| `SUPABASE_SERVICE_ROLE_KEY` | dev service/secret | prod service/secret | mark **Sensitive** |
| `PREVIEW_SECRET` | random | a *different* random | `openssl rand -base64 32`; signs theme previews, salts rate-limit hashes |
| `GOOGLE_GENERATIVE_AI_API_KEY` / `GROQ_API_KEY` / `OPENROUTER_API_KEY` / `ANTHROPIC_API_KEY` | at least one | at least one | free tiers are fine for dev |
| `NEXT_PUBLIC_PLATFORM_URL` | `https://dev.yourdomain.com` | `https://yourdomain.com` | "Powered by" link and upgrade link |
| `RESEND_API_KEY`, `LEADS_FROM_EMAIL` | optional | recommended | without them, lead emails are only logged |
| `VERCEL_TOKEN`, `VERCEL_PROJECT_ID`, `VERCEL_TEAM_ID` | leave empty | optional | registers tenants' custom domains automatically |

- `NEXT_PUBLIC_*` values are compiled into the build. After changing one, **redeploy** (Deployments → ⋯ → Redeploy). The other variables are read at runtime.
- `TENANT_SLUG` is only used in single mode, so you can leave it out.
- `VERCEL_TOKEN`: create one under Account Settings → Tokens. `VERCEL_PROJECT_ID` and `VERCEL_TEAM_ID` are in Project Settings → General and Team Settings → General. Leave these empty on Preview, so tenants testing on dev never attach domains to the project.

> **Vercel's Supabase integration** (Marketplace → Supabase) can fill these in for you. It connects a single project to every environment, though, and its variable names can differ from the ones above. If you use it, check that the three Supabase names match this table, and scope the dev project to Preview by hand.

---

## 4. Domains

Settings → Domains:

1. Add `yourdomain.com` and `www.yourdomain.com` (both assigned to Production).
2. Add `*.yourdomain.com`. Vercel asks you to move the domain to its nameservers (`ns1.vercel-dns.com`, `ns2.vercel-dns.com`) at your registrar. That's required for wildcard SSL certificates.
3. For the dev environment, first create and push a `dev` branch:

   ```bash
   git switch -c dev && git push -u origin dev
   ```

   Then add `dev.yourdomain.com` and `*.dev.yourdomain.com` and set each to **Git Branch → `dev`**.

Every other branch still gets a `*.vercel.app` preview URL. Those URLs show the platform landing page, `/admin`, `/login` and `/signup`. Tenant sites only open on `<slug>.<root domain>` or a custom domain.

**Tenants' custom domains** (Solo and Team plans): the agent adds the domain under Admin → Settings. If `VERCEL_TOKEN` is set, the domain is registered with the project automatically; otherwise add it by hand in Settings → Domains. The agent then creates a DNS record at their registrar: a `CNAME` for `www` → `cname.vercel-dns.com`, or for the bare domain the `A` record Vercel shows.

---

## 5. Deploy

- Production: push or merge to `main`.
- Dev: push to `dev`.

You can also click **Deploy** / **Redeploy** in the dashboard. Watch the build log for the route list ending in `ƒ Proxy (Middleware)`.

### Create the first tenant and admin

Pull the environment's variables locally, then run the admin script against it:

```bash
pnpm dlx vercel link
```

```bash
pnpm dlx vercel env pull .env.prod.local --environment=production
```

```bash
node --env-file=.env.prod.local scripts/create-admin.mjs you@example.com '<password>' <slug> --create "Business Name"
```

Use `--environment=preview` and `.env.dev.local` for the dev project. Agents can also just sign up at `https://yourdomain.com/signup`, but a site created there starts on the Free plan. Change the plan with:

```bash
node --env-file=.env.prod.local scripts/set-plan.mjs <slug> solo
```

---

## 6. Check it works

After each first deploy (dev, then production):

- [ ] `https://yourdomain.com` shows the landing page, and "See a demo" links use `https://`.
- [ ] `/signup` creates an account, sends the confirmation email (if Confirm email is on), and creates a site.
- [ ] `https://<slug>.yourdomain.com` shows the tenant's site.
- [ ] Admin → Projects: uploading an image works, and the image URL points at `<project>.supabase.co/storage/v1/object/public/media/…`.
- [ ] Admin → Theme → Preview opens the draft theme in the iframe.
- [ ] The concierge chat answers. If it doesn't, check Vercel → Logs for the `/api/chat` function and confirm an AI key is set for this environment.
- [ ] The contact form creates a lead under Admin → Leads.

---

## 7. Building locally against dev or prod

To reproduce a deployed build on your machine:

```bash
cp .env.dev.example .env.dev.local    # or: pnpm dlx vercel env pull .env.dev.local --environment=preview
```

```bash
pnpm build:dev && pnpm start:dev      # http://localhost:3100, using the dev Supabase project
```

`pnpm build:prod` / `pnpm start:prod` do the same with `.env.prod.local`. The two builds share the `.next` folder, so `start:*` runs whichever build came last. Next.js also reads `.env.local` during a build. Keep every key in the `.dev`/`.prod` file so none of them falls back to your local dev values.

Note that `NEXT_PUBLIC_ROOT_DOMAIN` is the real domain, so tenant subdomains won't resolve on `localhost`. Locally you can check the landing page, `/admin` and the API, but not tenant sites.

---

## 8. Ongoing changes

- **New migration**: add it under `supabase/migrations/`, run `pnpm exec supabase db push` against **dev**, test, then link prod and push. Deploy the code after the prod migration whenever the code depends on the new schema.
- **Rotating keys**: update the Vercel variable and redeploy. Rotating `PREVIEW_SECRET` cancels open preview links and resets visitor rate-limit buckets; nothing else breaks.
- **Free Supabase projects** pause after about a week without activity. Use a paid plan for production, or unpause a dev project from the dashboard.

## Troubleshooting

| Symptom | Likely cause |
|---|---|
| Every page 404s on `yourdomain.com` | `NEXT_PUBLIC_ROOT_DOMAIN` doesn't match the host (includes `https://`, `www.`, or a typo). Fix it and **redeploy**. |
| `<slug>.yourdomain.com` has no SSL / doesn't resolve | Wildcard domain missing, or the domain isn't on Vercel's nameservers. |
| Tenant site 404s, but the subdomain resolves | No tenant with that slug, the tenant is unpublished, or (custom domain) the plan doesn't include custom domains. |
| `SUPABASE_SERVICE_ROLE_KEY is not set` in logs | Variable missing for that environment (Preview vs Production). |
| Sign-up says "check your inbox" but no email arrives | Built-in mailer limit; set up custom SMTP (step 1.3). |
| Confirmation link lands on the wrong site | Site URL / Redirect URLs in Supabase Auth point to the other environment. |
| Uploads fail with a permission error | Migrations not pushed to that project (the `media` bucket policies are missing), or the user isn't a member of the site. |
| Chat returns 503 "No AI provider configured" | No AI key set for this environment (Preview vs Production). |
| Chat says "The concierge is busy right now" | The site's daily chat cap for its plan was reached (`src/lib/plans.ts`). |
| Chat on an exported copy of a site returns 403 | That copy's domain isn't in `tenants.allowed_origins` (see "Exporting a client's site" in the README). |
