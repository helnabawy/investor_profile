# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
- **Buyers (primary for tenant sites):** property investors and buyers, often international, browsing an agent's site to judge whether to trust that agent and to find suitable projects. Their job is to get credible answers about projects, prices, payment plans and process, and to reach a human advisor.
- **Agents and brokers (paying customers):** independent real-estate agents and brokerages, starting in Dubai, who need a premium personal site that captures leads without a web team. They edit content, projects, theme and chatbot in `/admin`.
- **Operator:** the person selling the product, running it as hosted SaaS or delivering self-hosted installs.

## Product Purpose
A sellable website product: each agent gets a property portfolio site with an AI concierge that answers only from their own inventory, FAQs and notes, then turns visitors into leads (WhatsApp, phone, email). Success means visitors trust the agent enough to leave contact details, and agents can run everything themselves.

## Positioning
A personal-brand "lounge" for one advisor rather than a listings portal. The concierge is the front door, grounded in that agent's real inventory and handing off to that agent. The same codebase is sold both as hosted SaaS and as a self-hosted copy per client.

## Capabilities and Constraints
- Multi-tenant (`DEPLOY_MODE=multi`, subdomain or custom domain) and single-tenant self-hosted (`DEPLOY_MODE=single`), from one codebase.
- Everything tenant-facing must be configurable per tenant: copy, images, theme, navigation, sections, chatbot persona. Nothing may be hard-coded to one brand.
- **Site layouts:** "Classic" (top navigation, long scrolling sections) and "Lounge" (sidebar shell, chat-first home, numbered story about, contact cards with form). The agent chooses one in a template gallery (premium templates at extra cost are planned) and previews it on their own site before publishing; new sites default to Classic. Lounge's structure is modelled on hindlounge.com, which the user named as the reference. Its branding, photos and copy must not be reused.
- Imagery: agents upload their own portrait and story photos. Demo content uses stock architecture and interior photos, never invented people.
- AI runs on free or low-cost models (Gemini, Groq, OpenRouter, Claude Haiku) with automatic fallback.
- Stack: Next.js 16 App Router, Tailwind v4, Supabase, Vercel AI SDK v7.
- Not yet built: investor portal (holdings, payments, documents), Stripe billing, embeddable chat widget.

## Evidence on Hand
- No real customers, testimonials or metrics exist yet. Seed tenants ("Aurelia Estates", "Skyline Homes") and their projects and testimonials are fictional placeholders and must stay clearly fictional.
- Plans are Free, Solo and Team (decided 2026-11-11); their limits live in `src/lib/plans.ts` and are enforced. The Solo price on the landing page (AED 199/mo) is a placeholder awaiting the user's decision.

## Product Principles
1. The concierge is the front door: the fastest path from a visitor's question to a grounded answer and a human handoff.
2. Every word and image a buyer sees belongs to the agent and is editable by them.
3. Premium restraint: tenant sites should feel like a private advisory, not a portal.
4. Never fabricate: the bot answers only from tenant data, and demos never pose as real people or results.
5. Running cost matters: prefer approaches that stay cheap per tenant.
