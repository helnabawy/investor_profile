# EstateSite product-readiness review (code review of `web/`)

Scope and method: read-only review of `/Users/helnabawy/Work/personal/investor_profile/web` on branch `redesign/templates-and-preview` (3 commits, 2026-11-08 to 2026-11-11). Nothing was run: no build, no tests, no dev server. All statements are from reading source. Citations are `path:line` relative to `web/`. "Not found" means a grep over `src/`, `scripts/`, `supabase/` returned nothing.

---

## 1. Feature inventory: what is really implemented

### Takeaway
The core loop is genuinely built end to end: sign up, get a themed site on a subdomain, add projects/FAQs, AI chat answers from them and captures leads, leads and transcripts show in an admin inbox. It is a thin but coherent vertical slice (about 5,700 lines of app code), with two templates, a form-based page builder and a theme draft/preview flow. Everything beyond that loop (billing, teams, imports, integrations, SEO plumbing, i18n) is absent.

### Cited Findings

**Routing / tenancy**
- Host-based tenant resolution in a Next 16 `proxy.ts`: subdomain `<slug>.<root>` or custom hostname rewrites to `/s/[site]/...`; `DEPLOY_MODE=single` always serves `TENANT_SLUG` — `src/proxy.ts:12-21, 53-57`. Client-supplied `x-site` header is stripped and re-set — `src/proxy.ts:62-67`.
- Tenant lookup by slug or by `domains` array containment — `src/lib/tenant.ts:19-28`.

**Public site**
- 18 section types in the registry: page-header, story, hero-split, quick-links, steps, hero, stats, about, featured-projects, project-grid, features, testimonials, gallery, cta, chat-cta, faq, contact, map — `src/lib/sections/registry.ts:30-245`; rendered in `src/components/sections/render.tsx` (511 lines).
- Routes: home `src/app/s/[site]/page.tsx`, CMS pages `src/app/s/[site]/[slug]/page.tsx` (with built-in fallback `about`/`contact`, lines 10-13), projects list `src/app/s/[site]/projects/page.tsx`, project detail `src/app/s/[site]/projects/[id]/page.tsx`, full-page chat `src/app/s/[site]/concierge/page.tsx`.
- Project grid has client-side filters: text search, area, property type, 3 fixed budget buckets, status tabs (all/off-plan/ready), sort by featured/price — `src/components/sections/client.tsx:83-157`. All projects are loaded to the browser and filtered there (no server pagination) — `src/components/sections/render.tsx:257-265`, `src/lib/tenant.ts:59-71`.
- Project detail page: status badge, title, area/city/developer, full price, up to 2 hero images + gallery, key facts, overview, payment plan with a visual split bar when the text matches `NN/NN` summing to 100, amenities, enquiry form pre-filled with project title, WhatsApp/call/brochure/"ask concierge" buttons — `src/app/s/[site]/projects/[id]/page.tsx:19-25, 33-146`.
- Map section is a Google Maps `output=embed` iframe from a free-text query — `src/components/sections/render.tsx:480-492`.

**Templates and theming**
- Two templates only: "Classic" (top nav, scrolling sections) and "Lounge" (sidebar shell, chat as the home page); both `tier: "free"`. Premium tier is a type and a comment, no premium template exists — `src/lib/templates.ts:19-38`.
- In Lounge the home page ignores the page-builder home sections and renders only the chat — `src/app/s/[site]/page.tsx:12-24`.
- 6 colour presets (calm-green, classic-navy, luxury-gold, modern, minimal, desert-sand) — `src/lib/theme.ts:63-166` (README says "4 presets", `README.md:20`, so docs lag code). 13 Google fonts including Cairo and Tajawal — `src/lib/theme.ts:40-54`. Overrides for 8 colours, 2 fonts, radius, logo, favicon, portrait, backdrop, CTA label/link — `src/app/admin/theme/theme-editor.tsx:11-19, 110-155`.
- Theme values are sanitised before injection into a `<style>` tag — `src/lib/theme.ts:181-183`, `src/app/s/[site]/layout.tsx:45`.

**Theme draft + preview**
- Draft stored in a separate `theme_drafts` table (one row per tenant, member-only RLS) — `supabase/migrations/20261110000000_theme_drafts.sql:4-14`.
- "Preview on my site" upserts the draft, sets an `es_preview` cookie and opens `/admin/preview`, an iframe of the real site with desktop/phone toggle, page selector, change summary, Publish / Discard — `src/app/admin/actions.ts:93-119`, `src/app/admin/preview/preview-frame.tsx:11-90`, `src/app/admin/preview/page.tsx:10-23`. Draft is only returned to members because it is read with the visitor's session under RLS — `src/lib/tenant.ts:35-40`.
- Drafts exist for the theme only. Page content, projects, settings and AI config save straight to live — `src/app/admin/actions.ts:155-166, 178-212`.

**Page builder**
- Form-based accordion editor, not drag-and-drop or WYSIWYG: add section from a list, move up/down, duplicate, remove, edit fields generated from the registry; page title, slug, SEO description, published flag — `src/app/admin/pages/[id]/page-builder.tsx:12-70`. Server limits: 200 KB of sections JSON, reserved slugs — `src/app/admin/actions.ts:141-166`.

**Project model and admin form**
- Columns: title, developer, area, city, property_type, status (`off-plan|ready|sold-out`), bedrooms (free text), price_from, currency, handover (free text), payment_plan (free text), roi (free text), description, amenities[], images[], brochure_url, featured, published, sort — `supabase/migrations/20261108000000_init.sql:54-84`.
- Admin form covers all of them, with multi-image upload, set-cover, paste-URL, PDF brochure upload — `src/app/admin/projects/[id]/project-form.tsx:26-82`.

**AI concierge**
- Streaming endpoint `/api/chat` using Vercel AI SDK `streamText` with two tools, max 4 steps, 600 output tokens — `src/app/api/chat/route.ts:65-79`.
- Tools: `searchProjects` (free-text FTS, min/max price, status, bedrooms; returns max 6) and `captureLead` (name + phone or email required; returns a pre-filled wa.me link) — `src/lib/ai/tools.ts:13-54`.
- Chat UI: floating widget on every page, full-page `/concierge`, Lounge chat home; session id and last 30 messages kept in `localStorage`; suggestion chips; minimal safe markdown renderer; "Continue on WhatsApp" button after lead capture — `src/components/site/chat.tsx:19-58, 61-99, 102-126, 226-253`.
- Admin AI settings: enable/disable, assistant name, temperature (3 levels), greeting, up to 8 suggestion chips, free-text instructions (4,000 chars), provider choice and optional model id — `src/app/admin/ai/ai-form.tsx:20-58`, `src/app/admin/actions.ts:122-138`.

**Lead capture**
- Contact form (on contact section and every project page) posts to `/api/contact`; zod validation, honeypot field `company`, requires email or phone — `src/app/api/contact/route.ts:7-28`, `src/components/sections/client.tsx:159-220`.
- Leads table: name, email, phone, interest, budget, message, source (`form|chat`), status (`new|contacted|qualified|closed`), session_id — `supabase/migrations/20261108000000_init.sql:113-126`.
- Email notification IS implemented but optional: sent via Resend to `tenant.contact.email` as plain text if `RESEND_API_KEY` is set, otherwise only `console.log` — `src/lib/leads.ts:37-53`. Sign-up seeds `contact.email` with the owner's login email — `src/app/signup/actions.ts:33`.
- Leads inbox: status filter chips, status dropdown, mailto link, WhatsApp link to the lead's phone, link to the chat transcript; hard limit 200 rows, no pagination, search, notes, export — `src/app/admin/leads/page.tsx:11-49`.

**Chats inbox**
- Read-only list of the latest 100 sessions with first user message and message count, plus a transcript view — `src/app/admin/chats/page.tsx:7-24`, `src/app/admin/chats/[id]/page.tsx:10-23`. No live takeover, no reply, no alert.

**WhatsApp handoff**
- Plain `https://wa.me/<digits>?text=` deep links — `src/lib/format.ts:20-24`; used on contact section, project page, after lead capture. No WhatsApp Business API integration (not found in code or dependencies, `package.json:17-37`).

**Custom domains**
- Comma-separated domain list in Site settings; regex validation; cross-tenant duplicate check; on save calls Vercel API to add/remove the domain, a no-op unless `VERCEL_TOKEN`/`VERCEL_PROJECT_ID` are set; failures only `console.error` — `src/app/admin/actions.ts:49-55, 70-75`, `src/lib/domains.ts:13-30`. UI instruction is one line: point a CNAME to `cname.vercel-dns.com` — `src/app/admin/settings/settings-form.tsx:55-58`.

**Signup / onboarding**
- Two-step client flow: Supabase email+password sign-up, then business name, slug, starting look (3 choices) — `src/app/signup/signup-form.tsx:30-41, 56-89`. Server action validates slug, inserts tenant with starter theme, owner membership and 3 starter pages (home/about/contact) with sample copy — `src/app/signup/actions.ts:11-40`, `src/lib/admin/starter.ts:4-41`.
- Admin overview has a 4-step setup checklist (template, first project, contact details, FAQ) with a progress bar, 4 count tiles and latest 5 leads — `src/app/admin/page.tsx:28-33, 95-107`.
- Sign-up disabled in single mode; first admin created with `scripts/create-admin.mjs` — `src/app/signup/actions.ts:12`, `scripts/create-admin.mjs:14-41`.

**Storage uploads**
- Browser uploads straight to a public Supabase `media` bucket under `<tenant_id>/<uuid>.<ext>`; 8 MB check is client-side only — `src/components/admin/image-upload.tsx:7-15`. Write policies restrict the folder to tenant members — `supabase/migrations/20261108000000_init.sql:189-197`.

**Multi-site per login**
- A user can belong to several tenants and switch between them in the admin sidebar — `src/lib/admin/context.ts:17-28`, `src/app/admin/layout.tsx:19-25`.

### Inferences
- The product's differentiator as built is the Lounge chat-first template plus grounded chat with lead capture; the "website builder" part is basic compared with dedicated site products (2 layouts, form-based sections).
- The theme draft/preview flow is the most polished admin feature; content has no equivalent safety net.

### Gaps
- Visual quality was not assessed (nothing was rendered). `DESIGN.md` (373 lines) was not reviewed in detail since it describes design tokens, not capabilities.

---

## 2. AI concierge: grounding, limits, cost control, fallback, scale

### Takeaway
Grounding is hybrid but mostly context stuffing: up to 40 project summaries are placed in every system prompt, FAQ/notes are fetched by Postgres full-text search (no embeddings, no ranking), and a search tool covers the rest. It works for a boutique portfolio of a few dozen projects; for an agent with hundreds of listings it degrades. Cost and abuse controls are a per-tenant daily message count and a per-session burst limit that the client can bypass.

### Cited Findings

**Grounding**
- Every request loads up to 40 published projects (featured first, then `sort`) and puts a one-line summary of each into the system prompt — `src/lib/ai/knowledge.ts:41-51, 87-88`; summary fields are title, id, area/city, developer, type, status, bedrooms, from-price, handover, payment plan, yield — `src/lib/ai/knowledge.ts:23-38`. Project `description` and `amenities` are NOT in the prompt or tool output, so the bot cannot answer "does it have a gym / sea view" from project data.
- The prompt header prints `Inventory (${catalogue.length} published projects)`, i.e. at most 40, so with more listings the model is told the wrong total — `src/lib/ai/knowledge.ts:87`.
- FAQ and knowledge notes: latest user message is tokenised, English stop-words dropped, first 12 words OR-ed as prefix terms, matched against a `simple`-config tsvector, top 4 FAQs + top 4 notes, with no `ts_rank` ordering — `src/lib/ai/knowledge.ts:10-21, 54-67`.
- Only the latest message drives retrieval; follow-ups like "and what about fees there?" retrieve on those words alone — `src/app/api/chat/route.ts:60-63`.
- `searchProjects` tool: FTS over title/developer/area/city/type/status/bedrooms/description plus price range, status, bedrooms `ILIKE`; returns 6 ordered by price — `src/lib/ai/tools.ts:22-34`, index in `supabase/migrations/20261108000000_init.sql:78-86`. Bedrooms is free text, so `ILIKE '%2%'` misses a range written "1-3" and "1" matches "10".
- System prompt rules: answer only from this business's inventory, never invent, link projects as `/projects/<id>`, collect name + phone/email then call `captureLead`, under ~120 words, reply in the visitor's language, not legal/financial advice — `src/lib/ai/knowledge.ts:75-82`.

**Rate limits and abuse protection**
- Per-tenant cap on user messages in a rolling 24 h: `free: 100, pro: 2000, business: 10000`, keyed on `tenants.plan` — `src/app/api/chat/route.ts:21, 43-48`.
- Per-session burst: 8 user messages per 60 s — `src/app/api/chat/route.ts:51-53`. The session id is generated by the browser and accepted if unknown — `src/app/api/chat/route.ts:85-93`, so rotating ids defeats the burst limit. There is no IP-based limit, CAPTCHA or bot check (not found).
- Input limits: last message at most 2,000 chars; history truncated to the last 20 messages — `src/app/api/chat/route.ts:22-23, 34-38`. Earlier messages in the client-supplied history are not length-checked or role-checked (only the last must be `user`), and the server trusts client history instead of its stored transcript — `src/app/api/chat/route.ts:33-37, 68`.
- Output limits: `maxOutputTokens: 600`, 4 steps, `maxDuration = 30` — `src/app/api/chat/route.ts:18, 70-72`.
- `captureLead` has no per-session cap; each call inserts a lead and triggers an email — `src/lib/ai/tools.ts:46-52`, `src/lib/leads.ts:31-33`.

**Cost controls per tenant**
- Only the message-count cap above. No token accounting, no per-tenant spend tracking, no usage shown in admin (not found).
- API keys are platform-level env vars, never per tenant — `src/lib/ai/config.ts:7-11, 39-45`. In SaaS mode the operator pays for every tenant.
- A tenant can pick a provider and type any model id; it is used as-is on the operator's key — `src/app/admin/ai/ai-form.tsx:54-56`, `src/lib/ai/config.ts:65-73`. `ai_config` is also directly writable by any member via Supabase REST (column grant) — `supabase/migrations/20261108000100_tenant_column_grants.sql:4`.

**Model fallback**
- Providers: Google Gemini, Groq, OpenRouter, Anthropic; default models `gemini-flash-latest`, `llama-3.3-70b-versatile`, `meta-llama/llama-3.3-70b-instruct`, `claude-haiku-5-5`; "auto" order is cheapest first — `src/lib/ai/config.ts:26-34`.
- A wrapper model tries each configured provider in order when `doGenerate`/`doStream` throws, logging a warning — `src/lib/ai/fallback.ts:8-30`. It covers failures before the stream starts; an error mid-stream is only logged — `src/app/api/chat/route.ts:78`.
- No provider configured returns HTTP 503 with env-var names in the message shown to site visitors — `src/app/api/chat/route.ts:56`.

**Transcripts**
- User message stored before the model call; assistant text stored on stream end — `src/app/api/chat/route.ts:58, 73-77`. Tool calls/results are not stored.

### Inferences
- Scale to hundreds of listings: the bot would see only 40 in context (chosen by featured/sort, not relevance) and depend on the model deciding to call `searchProjects`, which returns 6 rows from a prefix-OR keyword match with no stemming or synonyms ("flat" will not find "apartment", "JVC" will not find "Jumeirah Village Circle"). Expect missed inventory and "let me check with an advisor" answers. It would function, but not well; relevance-ranked retrieval or embeddings would be needed.
- A 40-project prompt is roughly a few thousand input tokens per message on every turn; cheap on Flash/Groq-class models, but there is no prompt caching.
- Cross-language grounding is weak: an Arabic or Russian question produces query terms that will not match English FAQ text, so FAQ/notes retrieval returns nothing; only the always-included catalogue helps.
- A single abuser can exhaust a free tenant's 100 messages/day and silence that agent's concierge (visitors then get "The concierge is busy"). Platform-wide exposure is (number of tenants x cap), and tenant creation is free and unthrottled.
- Because any model id is accepted, a tenant could select an expensive model on the operator's Anthropic or OpenRouter key.

### Gaps
- Whether the default model ids resolve at the providers was not tested (nothing was run).
- Actual answer quality, hallucination rate and tool-calling reliability on the free models were not measured; `scripts/test-chat-tools.mts` tests tools and retrieval without an LLM (line 1).

---

## 3. What is missing for commercial launch

### Takeaway
There is no way to take money and none of the plan limits advertised on the landing page are enforced. Most table-stakes items a paying Dubai agent or brokerage would ask about (portal/CRM sync, listing import, Arabic, analytics, permit numbers, team seats, password reset, legal pages) do not exist in the code.

### Cited Findings (status per item)

| Item | Status | Evidence |
|---|---|---|
| Billing / plans / limits | Not built. `tenants.plan` text column defaults to `free` and is only changeable by service role; no Stripe dependency | `init.sql:13`; `20261108000100_tenant_column_grants.sql:1-4`; `package.json:17-37`; `README.md:84`; `PRODUCT.md:27` |
| Plan enforcement | `plan` is read in exactly two places: chat daily cap and "Powered by" footer badge. "Up to 10 projects" and "Custom domain" on Pro are not enforced: `saveProject` and `saveSite` have no plan check | `src/app/api/chat/route.ts:46`; `src/app/s/[site]/layout.tsx:79`; `src/components/lounge/footer.tsx:8`; `src/app/admin/actions.ts:44-77, 178-212`; `src/app/page.tsx:17-18` |
| Premium templates | Planned only; price is display-only | `src/lib/templates.ts:15-16, 36-37` |
| Email notification for new leads | Built, optional (Resend). Plain text, no reply-to, no branding, single recipient, default sender `leads@resend.dev`. Landing lists "Email lead alerts" as a Pro feature but the code does not gate it | `src/lib/leads.ts:37-53`; `.env.example:20-21`; `src/app/page.tsx:18` |
| Other lead alerts (WhatsApp/SMS/push to agent) | Not found | — |
| Analytics | Only 4 counters on the admin overview (projects, new leads, leads 30 d, chats 30 d). No page views, no traffic source/UTM on leads, no GA/GTM/Meta Pixel field, no conversion funnel | `src/app/admin/page.tsx:14-21, 96-100`; leads schema `init.sql:113-126` |
| WhatsApp click tracking | Not built; wa.me clicks are plain links and create no lead record | `src/lib/format.ts:20-24`; `src/app/s/[site]/projects/[id]/page.tsx:141` |
| SEO: titles/descriptions | Built: tenant title template, page description, project title/description | `src/app/s/[site]/layout.tsx:13-20`; `src/app/s/[site]/[slug]/page.tsx:15-20`; `src/app/s/[site]/projects/[id]/page.tsx:12-17` |
| SEO: OG images | Project pages only (first image). No OG image for home/other pages, no generated OG | `src/app/s/[site]/projects/[id]/page.tsx:16` |
| SEO: sitemap / robots / canonical / JSON-LD | Not found (no `sitemap.ts`, `robots.ts`, `ld+json`, `alternates`). The proxy matcher also excludes `.xml` and `.txt` paths from tenant rewriting | `src/proxy.ts:81` |
| SEO: URLs | Project URLs are UUIDs (`/projects/<uuid>`), no slug column | `src/lib/tenant.ts:73-74`; `init.sql:54-58` |
| SEO: Lounge home | Home is a client-side chat with no indexable content | `src/app/s/[site]/page.tsx:13-23` |
| Performance/caching | All tenant pages render dynamically on every request; raw `<img>` tags, no image optimisation | `next.config.ts:4-6`; `src/components/site/project-card.tsx:21-22`; `README.md:87` |
| i18n / Arabic RTL / multilingual | Not built. `<html lang="en">` hard-coded; no `dir`, no locale routing, no translation fields; UI strings hard-coded in English. Only Arabic-capable fonts (Cairo, Tajawal) and a prompt line "Reply in the visitor's language" | `src/app/layout.tsx:11`; `src/lib/theme.ts:52-53`; `src/lib/ai/knowledge.ts:81`; e.g. `src/components/sections/client.tsx:129, 217` |
| Multi-currency | Per-project free-text currency, default AED; no conversion or visitor currency switch. Budget filter buckets are fixed at 1.5M/5M and labelled with the first project's currency | `init.sql:65`; `src/components/sections/client.tsx:83-88, 113` |
| Teams / roles for brokerages | Schema has `tenant_members.role` (`owner|editor`) but no invite UI, no insert policy, and role is never checked (`is_member` ignores it). No per-agent profiles, lead assignment or routing | `init.sql:24-37, 172`; `src/lib/admin/context.ts:28` |
| CRM / portal integrations (Property Finder, Bayut, XML feeds, Salesforce/HubSpot, webhooks, Zapier) | Not found. No outbound webhook on lead | `package.json:17-37`; `src/lib/leads.ts` |
| Listing import (CSV/XML/URL scrape) | Not found; projects are created one at a time in a form | `src/app/admin/projects/[id]/project-form.tsx` |
| Lead export (CSV) | Not found | `src/app/admin/leads/page.tsx` |
| WhatsApp Business API | Not built (deep links only) | `src/lib/format.ts:20-24` |
| Embeddable chat widget | Not built | `README.md:86`; `PRODUCT.md:27` |
| Custom-domain automation | Partial: Vercel API add/remove on save. No DNS/SSL status, no verification feedback, errors swallowed to console, no apex-domain guidance; nothing for self-hosted | `src/lib/domains.ts:13-30`; `src/app/admin/actions.ts:73-75` |
| Legal pages / consent | Not found: no privacy policy, terms, cookie notice, chat-recording notice, or data-deletion tooling. Only a line under the form: "Your details go only to this advisor" | `src/components/sections/client.tsx:218`; landing footer `src/app/page.tsx:151-155` |
| RERA / DLD permit, BRN/ORN fields | Not found in project or tenant schema | `init.sql:7-21, 54-84`; `src/lib/types.ts:5-12` |
| Password reset / magic link / OAuth | Not found. Login is email+password only; `/auth` is listed as an app path but no `src/app/auth` route exists | `src/app/login/login-form.tsx:16`; `src/proxy.ts:5` |
| Booking / calendar | Not built; "Book a consultation" is a link to the contact form | `src/lib/admin/starter.ts:56-57` |
| Brochure gating | Brochure is a direct public download, no lead capture | `src/app/s/[site]/projects/[id]/page.tsx:143` |
| Investor portal | Not built | `README.md:85` |
| Tests | 3 ad-hoc scripts, no test framework, no CI | see section 6 |

### Inferences
- The landing page currently promises limits the product does not apply, so a "free" tenant gets everything a "Pro" tenant would, except the higher chat cap and badge removal, and those require a manual DB update of `plan`.
- For Dubai specifically, the missing permit-number fields and Arabic/RTL are compliance and market-fit blockers rather than nice-to-haves; the report writer should verify current RERA/Trakheesi advertising rules from an external source (not checked here).
- Lack of Property Finder/Bayut/CRM feed import means every listing is retyped by hand, which caps the product at boutique off-plan advisors with a short curated list.

### Gaps
- Whether hosted Supabase email confirmation is intended on or off in production is unknown; local config has `enable_confirmations = false` and `minimum_password_length = 6` (`supabase/config.toml:183, 228`), while the form asks for 8 (`src/app/signup/signup-form.tsx:49`).

---

## 4. Security and multi-tenancy soundness

### Takeaway
The isolation design is sound for a small product: RLS on every table, a column grant that blocks owners from changing `plan`/`slug`, service-role queries always filtered by tenant id, and an RLS test script. The weak points are public-endpoint abuse (no IP rate limiting or CAPTCHA), member-writable `domains`/`ai_config` without database constraints, and public readability of the whole `tenants` row.

### Cited Findings

**Sound**
- RLS enabled on all 9 base tables plus `theme_drafts` — `init.sql:157-165`; `20261110000000_theme_drafts.sql:12-14`.
- Public read only for published tenants/pages/projects/FAQs; knowledge, leads, chat sessions/messages are member-only; visitors cannot insert leads or messages directly (service role only) — `init.sql:169-186`.
- `is_member()` is `security definer` with fixed `search_path` — `init.sql:34-37`.
- Owners cannot update `plan`, `slug`, `id`: update revoked then granted per column — `20261108000100_tenant_column_grants.sql:3-4`.
- Storage writes restricted to the member's `<tenant_id>/` folder — `init.sql:192-197`.
- Service role used in four places, each scoped by tenant id: chat route, contact route, sign-up, domain-uniqueness check — `src/app/api/chat/route.ts:40-45`; `src/app/api/contact/route.ts:27`; `src/app/signup/actions.ts:28-39`; `src/app/admin/actions.ts:53`. Tools filter by `tenant.id` — `src/lib/ai/tools.ts:23`.
- Admin server actions all go through `getAdmin()` (auth + membership) and add `.eq("tenant_id", tenant.id)` on top of RLS — `src/lib/admin/context.ts:12-29`; `src/app/admin/actions.ts:163, 207, 216`.
- Tenant for public APIs comes from the Host header via proxy, not from the request body — `src/app/api/chat/route.ts:28-30`; `src/proxy.ts:62-67`.
- `/api/contact` validates with zod (lengths, email format) and has a honeypot — `src/app/api/contact/route.ts:7-14, 24`. Lead fields are clipped again before insert — `src/lib/leads.ts:17-30`.
- Chat markdown renderer builds React nodes, never injects HTML, and only allows `/` and `http(s)` links — `src/components/site/chat.tsx:226-253`.
- RLS test script covers cross-tenant read/update/insert/delete, storage, and anonymous access to leads/chats/knowledge — `scripts/test-rls.mts:12-30`.

**Weak or risky**
- No IP-based rate limiting or CAPTCHA on `/api/contact` or `/api/chat` (not found). The honeypot is the only spam control on the form; each accepted submission sends an email — `src/app/api/contact/route.ts:24-27`.
- Chat burst limit keyed on a client-chosen session id, so it is bypassable; daily cap can be exhausted by one visitor (denial of service against a tenant's concierge) — `src/app/api/chat/route.ts:50-53, 85-93`.
- Client-supplied chat history is trusted: up to 20 prior messages of any length and any role are forwarded to the model, enabling prompt injection via forged assistant/system turns and use of the endpoint as a free LLM proxy within the daily cap — `src/app/api/chat/route.ts:33-38, 68`.
- `domains` is member-writable at the database level with no unique constraint; the duplicate check lives only in the server action — `20261108000100_tenant_column_grants.sql:4`; `init.sql:12, 22`; `src/app/admin/actions.ts:53-54`. A member calling Supabase REST directly could add another tenant's custom domain; the lookup uses `.maybeSingle()`, which returns no row when two tenants match, so the victim's domain would 404 — `src/lib/tenant.ts:23`.
- No domain-ownership verification in the app; it relies on whatever Vercel enforces — `src/lib/domains.ts:13-21`.
- `ai_config` is member-writable and unvalidated at DB level, including arbitrary `model` on the operator's key — `20261108000100_tenant_column_grants.sql:4`; `src/lib/ai/config.ts:71-72`.
- Whole `tenants` row of every published tenant is readable with the anon key: full customer list, `plan`, `domains`, contact details, and the agent's private AI `instructions` — `init.sql:167-169`. The migration comment accepts this for `ai_config` because it holds no keys.
- Sign-up abuse: no CAPTCHA, no limit on sites per user (a signed-in user is sent straight to the create-site step) — `src/app/signup/page.tsx:17, 37`; `src/app/signup/actions.ts:11-40`. Slug squatting is possible.
- Sign-up is not transactional and ignores errors on the membership and pages inserts, which can leave an ownerless tenant holding a slug — `src/app/signup/actions.ts:38-39`.
- Uploads: file size and type are checked only in the browser; bucket is public; no per-tenant storage quota — `src/components/admin/image-upload.tsx:8-12`; `supabase/config.toml:119`.
- `next.config.ts` allows remote images from any HTTPS host — `next.config.ts:8`.
- Visitor-facing 503 error leaks env-var names — `src/app/api/chat/route.ts:56`.
- `editor` role has identical rights to `owner` (role never checked) — `init.sql:27, 34-37`.

### Inferences
- Tenant data isolation (leads, chats, knowledge) looks correct; the realistic risks at launch are spam leads, AI-quota exhaustion and operator AI-bill abuse, not cross-tenant data leaks.
- The domain-collision issue needs a DB-level unique index or a separate `domains` table before custom domains are sold.

### Gaps
- RLS behaviour was not executed; conclusions rest on reading policies and the test script. Supabase project-level settings in production (auth rate limits, CAPTCHA) are unknown.

---

## 5. Data model fit for Dubai off-plan, resale and rentals

### Takeaway
The model is a single flat "project" record that fits a curated off-plan showcase at marketing level (developer, handover, payment plan, starting price, yield, brochure) but stores the key off-plan numbers as free text. It does not model units, floor plans, sizes or permits, and it has no concept of a resale or rental listing.

### Cited Findings
- Off-plan fields present: `developer`, `area`, `city`, `property_type`, `status`, `bedrooms`, `price_from`, `currency`, `handover`, `payment_plan`, `roi`, `amenities[]`, `images[]`, `brochure_url` — `init.sql:57-72`.
- `handover`, `payment_plan`, `roi`, `bedrooms` are free text — `init.sql:63, 66-68`. Structure is recovered by regex at render time: payment split only for `NN/NN` summing to 100 (`src/app/s/[site]/projects/[id]/page.tsx:19-25`), yield figure by percent regex (`src/components/site/project-card.tsx:8-11`). A plan such as "70/30 with 1% monthly" shows the bar; "10/70/20" or post-handover plans fall back to plain text.
- Only a starting price; no price range, price per sq ft, service charge, DLD fee or booking amount fields — `init.sql:64`.
- No unit types table: no per-unit size (sq ft), bathrooms, floor, view, availability or unit price — `init.sql:54-84` (single table), `src/lib/types.ts:41-63`.
- No floor-plan field; one `brochure_url` PDF only. No video or virtual-tour field. No latitude/longitude; the map section is a page-level free-text query, not per project — `init.sql:72`; `src/lib/sections/registry.ts:235-244`.
- No permit/RERA/DLD number, no developer logo, no completion percentage, no escrow details — `init.sql:54-84`.
- Status enum is `off-plan | ready | sold-out` only; no sale vs rent flag, no rent amount/frequency, furnishing, cheques, availability date, plot/built-up area, or secondary-market fields — `init.sql:62`.
- UI vocabulary is off-plan/investment-oriented ("Projects", "Starting from", "Handover", "Expected gross yield", "Payment plan") — `src/app/s/[site]/projects/[id]/page.tsx:35-37, 58, 95`; `src/components/site/project-card.tsx:32-35`.
- The seed's second tenant ("Family homes & rentals") stores a single ready villa as a project with `handover: 'Ready'`, `payment_plan: 'Mortgage-friendly'`, showing how a resale unit is shoehorned in — `supabase/seed.sql:11, 72-74`.
- AI search tool only accepts status `off-plan | ready` — `src/lib/ai/tools.ts:19`.

### Inferences
- Fit for off-plan: adequate for a "hand-picked 5-30 projects" advisor pitch; inadequate for anyone who needs to show unit availability, floor plans or accurate multi-stage payment schedules, which competitors with developer-inventory feeds provide.
- Fit for resale: usable only as a workaround (one "project" per unit) and missing size, bathrooms and permit number.
- Fit for rentals: effectively not supported; a rent price would display as "From AED 120K" with no period.
- Free-text bedrooms/handover limit filtering, sorting and AI search precision.

### Gaps
- No external check was made of which fields Property Finder/Bayut feeds or RERA advertising rules require; that comparison belongs to the competitor research.

---

## 6. Quality signals

### Takeaway
Small, readable, consistent TypeScript codebase written in about three days, with no TODO debt but also no automated test suite or CI. Deployable in principle (Dockerfile, env example, Vercel notes), with several production loose ends.

### Cited Findings
- Size: 5,683 lines across `src/` (`.ts`, `.tsx`, `.css`) by `wc -l`; largest files `src/components/sections/render.tsx` (511), `globals.css` (346), `src/app/admin/actions.ts` (253), `src/components/site/chat.tsx` (253). Three migrations totalling 215 lines.
- History: 3 commits, 2026-11-08 to 2026-11-11 (`git log`). Version `0.1.0` — `package.json:3`.
- Tests: zero `*.test.*`/`*.spec.*` files; no test runner in dependencies. Three scripts: `test:chat` (tools + retrieval, no LLM), `test:rls` (isolation), `test:e2e` (Playwright-core flow with a hard-coded macOS Chromium path and hard-coded demo credentials) — `package.json:13-15`; `scripts/e2e-admin.mjs:6-7, 15-16`. All require a local seeded Supabase. No `.github/` directory (no CI).
- TODO/FIXME/HACK grep over `src`, `scripts`, `supabase/migrations`: none.
- Stack is current: Next 16.4.5, React 19.3, AI SDK 7, Tailwind 4, zod 4 — `package.json:17-49`. `AGENTS.md:3-5` warns that this Next version has breaking changes versus common knowledge.
- Deployability: multi-stage Dockerfile using Next `standalone` output — `Dockerfile:1-26`; `next.config.ts:7`. `.env.example` documents all variables — `.env.example:1-25`. `.env*` is git-ignored — `.gitignore:34-35`. README has SaaS-on-Vercel and self-hosted steps — `README.md:57-69`.
- No health endpoint, error monitoring, structured logging or migrations for seed/demo tenant in production (not found). Errors go to `console`.
- Bugs and loose ends found by reading:
  - Landing and sign-up "live demo" links are hard-coded to `http://demo.<root>`; the demo tenant exists only in local seed data, which README says is not applied to remote projects — `src/app/page.tsx:23`; `src/app/signup/page.tsx:33`; `README.md:64`.
  - Prompt reports at most 40 as the inventory size — `src/lib/ai/knowledge.ts:41, 87`.
  - Sign-up ignores errors on membership/pages inserts — `src/app/signup/actions.ts:38-39`.
  - Domain add/remove failures are swallowed; the user sees "Saved" — `src/app/admin/actions.ts:73-76`.
  - `saveSite` does `JSON.parse` on the nav field without try/catch — `src/app/admin/actions.ts:46`.
  - `saveSite` overwrites `contact` without preserving `socials` (type has it, form does not) — `src/app/admin/actions.ts:60-63`; `src/lib/types.ts:11`.
  - README says 4 presets; code has 6 — `README.md:20`; `src/lib/theme.ts:63-166`.
  - Leads list capped at 200 and chats at 100 with no paging — `src/app/admin/leads/page.tsx:11`; `src/app/admin/chats/page.tsx:9`.
  - Default theme fallback is `luxury-gold` when no preset is stored, while starter sites use `calm-green` — `src/lib/theme.ts:171`; `src/lib/templates.ts:26`.
- Landing-page pricing: Starter "Free" (subdomain, up to 10 projects, free templates, EstateSite badge); Pro "$29/mo" (custom domain, unlimited projects, premium templates as add-ons, no badge, email lead alerts); Self-hosted "One-time" (own servers, own AI keys, full source access, priority setup). All three buttons say "Start free" and link to `/signup` — `src/app/page.tsx:16-20, 134`. Marked as placeholders in code and in `PRODUCT.md:31` — `src/app/page.tsx:15`.
- The product doc states there are no real customers, testimonials or metrics, and seed tenants are fictional — `PRODUCT.md:29-31`.

### Inferences
- Code quality is above typical prototype level (validation, RLS, sanitisation, accessible markup), but the absence of CI, monitoring and a repeatable test suite means regressions would be caught manually.
- The landing page has no social proof, no legal footer and a demo link that will break in production unless a demo tenant is created manually.

### Gaps
- Build health, lint status and type-check status are unverified (nothing was run by constraint).

---

## 7. Overall maturity rating and top gaps

### Takeaway
Rating: late prototype / early MVP. It is demo-ready and could be hand-sold as a managed or self-hosted install to one friendly boutique off-plan advisor today, but it is not launch-ready as self-serve SaaS: there is no billing, no plan enforcement, weak abuse protection on the operator's AI bill, and it lacks Dubai market basics (permit numbers, Arabic, portal/CRM sync).

### Cited Findings (justification)
- Working end-to-end loop exists: sign-up to live site (`src/app/signup/actions.ts:29-40`), grounded chat with lead capture (`src/app/api/chat/route.ts:65-79`; `src/lib/ai/tools.ts:36-54`), lead inbox with transcripts (`src/app/admin/leads/page.tsx:35-37`), optional email alert (`src/lib/leads.ts:47-52`).
- Tenant isolation is deliberate and tested by script (`init.sql:157-186`; `scripts/test-rls.mts`).
- No revenue path: no billing code; plan column unused for limits (`README.md:84`; `src/app/admin/actions.ts:178-212`).
- Age and evidence: 3 commits over 3 days; no customers (`PRODUCT.md:29-31`).
- Only two templates and a form-based builder (`src/lib/templates.ts:19-38`).

### Highest-impact gaps, ordered for getting a first paying customer
1. **Take payment and enforce plans.** Stripe (or manual invoicing plus an operator switch for `plan`), with project-count, custom-domain and badge gating matching the landing page — `src/app/page.tsx:16-20`; `src/app/admin/actions.ts:44-77, 178-212`. For a first customer a manual "set plan" admin tool is enough; the landing-page promises must match reality.
2. **Reliable lead delivery and follow-up.** Make email alerts mandatory and branded with reply-to, add an instant WhatsApp/SMS alert to the agent, log WhatsApp-click handoffs as leads, add CSV export and a webhook — `src/lib/leads.ts:37-53`; `src/lib/format.ts:20-24`. Lead capture is the value the agent pays for; today a missed env var means leads only reach a console log.
3. **Dubai compliance and trust fields.** Permit/RERA/DLD number per listing, agent BRN and brokerage ORN, privacy policy/terms pages and a chat/data consent notice — absent from `init.sql:7-21, 54-84`; `src/components/sections/client.tsx:218`.
4. **Listing ingestion.** CSV/XML import or a Property Finder/Bayut/CRM feed sync, plus structured units (size, bathrooms, floor plans, per-unit price) — only manual entry exists, `src/app/admin/projects/[id]/project-form.tsx`. Without it, onboarding an agent with more than a handful of listings is hours of retyping.
5. **Abuse and cost protection on public endpoints.** IP rate limiting and CAPTCHA/Turnstile on `/api/chat`, `/api/contact` and sign-up; server-side history instead of client-supplied; allow-list of model ids; token-usage tracking per tenant — `src/app/api/chat/route.ts:33-53, 85-93`; `src/app/admin/ai/ai-form.tsx:54-56`.
6. **Arabic / RTL and multilingual content.** Locale-aware `lang`/`dir`, translated UI strings, per-language content — `src/app/layout.tsx:11`. The bot answers in the visitor's language but the site around it is English-only.
7. **SEO plumbing.** Per-tenant sitemap and robots, canonical URLs, JSON-LD for listings and the agent, slug-based project URLs, OG images on all pages, indexable content on the Lounge home, caching and image optimisation — `src/proxy.ts:81`; `src/lib/tenant.ts:73-74`; `src/app/s/[site]/page.tsx:13-23`; `next.config.ts:4-6`.
8. **Account basics.** Password reset, email-confirmation callback, team invites with enforced roles, per-agent lead assignment for brokerages — `src/app/login/login-form.tsx:16`; `init.sql:24-37`.
9. **Custom-domain robustness.** Unique constraint on domains, ownership verification, DNS/SSL status shown in admin, apex-domain instructions — `src/lib/domains.ts:13-30`; `src/lib/tenant.ts:23`; `src/app/admin/settings/settings-form.tsx:55-58`.
10. **Concierge depth at scale and analytics.** Relevance-ranked retrieval (or embeddings) over all listings, descriptions and amenities in context, multi-turn-aware retrieval; plus visitor analytics (page views, sources/UTM on leads, chat-to-lead conversion) — `src/lib/ai/knowledge.ts:41-67`; `src/app/admin/page.tsx:96-100`.

### Inferences
- Fastest route to a first paying customer is the self-hosted or concierge-managed sale to a single off-plan advisor (single-tenant mode sidesteps billing, sign-up abuse and plan gating), provided items 2 and 3 are closed first.
- Against the named competitors, the defensible parts today are the chat-first Lounge experience, grounded answers from the agent's own inventory, low running cost on free-tier models, and the self-host option; the website-builder, CRM, IDX/portal-sync and marketing-automation breadth of those products is not matched anywhere in this code.

### Gaps
- Competitor capabilities were out of scope for this review (repository only), so the comparison in the last inference is directional and must be confirmed by the competitor research.
- Real-world chat quality, page performance and visual polish were not measured because nothing was executed.
