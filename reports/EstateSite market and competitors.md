# EstateSite targets a real but narrow gap

EstateSite will find an audience, but a much smaller one than Dubai's headline broker count suggests, and not with the product as it stands today. The gap is genuine: no vendor found, globally or in the UAE, sells a self-serve personal agent site with an AI chat grounded in the agent's own inventory at a low flat price, and the one Dubai site that shows the pattern (hindlounge.com) is a one-off custom build. The realistic buyer is the established off-plan advisor or boutique brokerage past its first year, not the 13,000 newcomers who enter each year and mostly leave within six months; that puts the serviceable audience in the low thousands of accounts and plausible early revenue in the hundreds of thousands of dollars a year, against a theoretical Dubai ceiling of about USD 11.6 million. A defensible price is roughly AED 150-300 a month self-serve, with a managed or self-hosted install at AED 5,000-15,000 as the faster first sale. The code is a coherent late prototype: the core loop works, but there is no billing, no Dubai compliance fields, no Arabic, no listing import, and lead delivery can silently fail. The main risks are a 2026 market downturn, very high agent churn, free inventory apps (Reelly, with 60,000+ registered agents) that already do project pages better, and the fact that demand for personal agent websites in Dubai is unproven by any independent data. Confidence is medium-high on the product assessment and the existence of the gap, medium on market size, and low on willingness to pay; most competitor prices and all chatbot-conversion statistics come from vendor marketing or search snippets and are flagged below.

## The code is a working prototype, not a sellable service

The review of `web/` (read-only; nothing was built or run) found a thin but complete vertical slice of about 5,700 lines written across three commits between 8 and 11 November 2026. An agent signs up, gets a themed site on a subdomain, adds projects and FAQs, and an AI concierge answers from that content, captures leads through a tool call and hands off to WhatsApp via a `wa.me` link; leads and transcripts appear in an admin inbox (`src/app/signup/actions.ts`, `src/app/api/chat/route.ts`, `src/lib/ai/tools.ts`, `src/app/admin/leads/page.tsx`). Tenant isolation is deliberate: row-level security on every table, service-role queries scoped by tenant id, and a script that tests cross-tenant access (`supabase/migrations/20261108000000_init.sql`, `scripts/test-rls.mts`). The chat-first "Lounge" template and the theme draft-and-preview flow are the most distinctive pieces. Code quality sits above typical prototype level.

What is missing is everything between a demo and a paid product. **There is no way to take money**, and `tenants.plan` is read in only two places (the daily chat cap and the footer badge), so the "up to 10 projects" and "custom domain on Pro" limits promised on the landing page are not enforced (`src/app/page.tsx`, `src/app/admin/actions.ts`). **Lead alerts depend on an optional environment variable**: without a Resend key, new leads reach only a console log (`src/lib/leads.ts`). WhatsApp clicks create no lead record. There is no listing import, no CRM or portal sync, no CSV export, no webhook, no password reset, no legal pages, no sitemap or structured data, and project URLs are UUIDs. The site chrome is English-only with `<html lang="en">` hard-coded, although Arabic-capable fonts ship and the bot is told to reply in the visitor's language.

The concierge itself fits a boutique portfolio and degrades beyond it. Each prompt carries one-line summaries of at most **40 projects**, chosen by featured flag rather than relevance, and omits descriptions and amenities, so the bot cannot answer "does it have a gym" from project data; FAQ retrieval is unranked keyword matching on the latest message only, which fails for Arabic or Russian questions against English content (`src/lib/ai/knowledge.ts`). The data model is a single flat "project" with handover, payment plan, yield and bedrooms stored as free text; it has no units, floor plans, sizes, permit numbers, or any concept of a resale or rental listing. The code trusts client-supplied chat history and lets a tenant type any model id to run on the operator's API key. A per-visitor rate limiter keyed on a hashed IP was committed while this review was under way (commit `2e2327a`: `src/lib/rate-limit.ts`, migration `20261111000000_client_rate_limits.sql`), which closes the IP rate-limiting gap the review first found; it was not tested here. The fair rating is **late prototype / early MVP**: sellable today as a managed single-tenant install to one friendly advisor, not as self-serve SaaS. Confidence here is medium-high for what exists and low for runtime behaviour, since answer quality, performance and visual polish were never measured.

## 32,294 brokers shrink to a few thousand real prospects

The official base is large. Dubai Land Department counted **32,294 registered brokers and 9,785 brokerage offices at end-2025**, with 13,083 new brokers registered that year, up 38% ([Dubai Media Office](https://mediaoffice.ae/en/news/2026/march/09-03/dubai-brokerage-sector-strengthens-its-role-as-a-key-driver-of-market-growth-in-2025)). Press figures run higher, at about 39,776 active brokers, though the article is internally inconsistent ([Khaleej Times](https://www.khaleejtimes.com/business/dubai-property-brokers-rake-in-dh1373-billion-in-2025)). That works out to roughly 3.3 brokers per office, so the typical firm is tiny, which suits a product for individuals and small teams. Brokers shared AED 13.59 billion of commission in 2025, about AED 421,000 gross each on average, and a recruiter report puts take-home at around AED 18,000 a month with agents keeping 40-50% at large agencies and 60-70% at boutiques ([The National](https://www.thenationalnews.com/business/money/2025/10/30/dubai-real-estate-agents-salaries)). Averages hide a heavily skewed distribution for which no data was found.

Three facts cut the addressable number hard. First, **churn**: the same recruiter report says average tenure has fallen from about twelve months to six or less, with new and rental agents often gone within three months, while luxury and off-plan brokers stay up to two years ([The National](https://www.thenationalnews.com/business/money/2025/10/30/dubai-real-estate-agents-salaries)). Inflow of roughly 40% of the base per year means a large share of registered brokers will not survive a subscription's first renewal. No source publishes an attrition rate. Second, **the 2026 downturn**: after a record 2025, a regional war from late February 2026 cut nine-month transactions 23% and sales value 27%, Q3 value fell 47% year on year, and S&P reports prices down 5-15% from end-2025 ([The National](https://www.thenationalnews.com/business/property/2026/10/07/dubai-home-sale-transactions-fall-in-third-quarter-due-to-regional-uncertainty/)). At a constant commission rate that implies a 2026 commission pool nearer AED 10 billion than 13.6 billion, spread over at least as many agents (an inference from the notes, not a published figure). Third, **regulation**: agents cannot operate freelance and must sit under a licensed brokerage, so the "independent agent" in the product pitch is legally a brokerage employee with a personal brand ([Oliva](https://joinoliva.com/en/learn/blog/dubai-real-estate-brokerage-regulations-2026), a vendor blog; no primary RERA text was retrieved).

The downturn is not all bad for the positioning. Off-plan has held at roughly 72% of purchases in Q3 2026, so the surviving agent base tilts towards investor-facing off-plan sellers, which is exactly the product's data model ([The National](https://www.thenationalnews.com/business/property/2026/10/07/dubai-home-sale-transactions-fall-in-third-quarter-due-to-regional-uncertainty/)). Non-resident buyers were reported at about 42% of Q1 2026 transactions, led by India and the UK, which supports an always-on, cross-time-zone concierge; that figure comes from a vendor blog snippet with no official DLD source and predates most of the war's effect ([Oliva](https://joinoliva.com/en/learn/blog/dubai-foreign-buyer-share-q1-2026-2026)).

On size, the research-firm "proptech" totals are unusable (global real-estate software estimates for 2025 range from about USD 4.8 billion to USD 13 billion), so bottom-up arithmetic is the only honest method. Every Dubai broker at USD 30 a month is about **USD 11.6 million a year at 100% penetration** and about USD 0.6 million at 5%; adding Abu Dhabi (3,302 licensed brokers, [WAM](https://www.wam.ae/en/article/c19mj9i-abu-dhabi-real-estate-centre-records-aed117), snippet only) and Saudi Arabia (more than 86,000 licensed brokers in July 2025, [Argaam](https://www.argaam.com/en/article/articledetail/id/1829569), snippet only) lifts the theoretical Gulf ceiling to roughly USD 43-58 million. Those are ceilings built on an assumed price. This report's own judgment, which is an estimate and not a sourced figure, is that the serviceable audience in Dubai is the off-plan-focused agent with more than a year's tenure plus boutique brokerages wanting a branded front door: a few thousand accounts at most. Winning 300 to 1,000 of them at AED 200 a month would yield about AED 0.7-2.4 million (USD 0.2-0.65 million) a year. That is a viable small software business and a poor fit for venture-scale expectations unless Saudi Arabia or a brokerage-level product follows. Confidence: high on the DLD counts, medium on the downturn's effect on agents, low on the serviceable-audience estimate.

## Nobody sells this bundle, yet substitutes surround it

The global market proves agents pay for brand sites, at far higher prices than EstateSite contemplates. Luxury Presence announced it passed **USD 100 million in annual recurring revenue in May 2026**, up from USD 75 million nine months earlier ([BusinessWire](https://www.businesswire.com/news/home/20260527265173/en/Luxury-Presence-Reaches-%24100-Million-Annual-Recurring-Revenue-as-Top-Producing-Agents-Unify-Their-Businesses-on-One-AI-Growth-Platform), from a search summary). Premium vendors charge a setup fee plus a monthly licence: AgentFire lists USD 800-6,500 setup and USD 165-215 a month on its own pricing page ([AgentFire](https://agentfire.com/pricing/)), and Easy Agent Pro lists USD 229-899 a month ([Easy Agent Pro](https://www.easyagentpro.com/pricing/)). Their AI is mostly outbound nurture by SMS, email and voice after a form fill, sold as an upsell on a USD 300+ base; an on-site chat that answers from the agent's own curated inventory is rare, and none was found with a WhatsApp handoff. Below USD 50 a month the options are a generic site with no listing-aware chat (Wix, Squarespace, Placester Essential) or a chat widget with no site and no property data (Tidio from USD 29). The do-it-yourself equivalent of EstateSite is therefore a USD 45-60 stack plus hours of setup for a weaker result. Almost all of these vendors are built around US MLS/IDX feeds that do not exist in Dubai, so they are price anchors more than direct rivals. The most important unverified point is whether Wix or Squarespace now ship a visitor-facing AI agent trained on site content in their cheap plans; if they do, the global gap is narrower than it looks.

In the UAE the picture is different and more threatening. The table shows the local substitutes an agent will actually weigh.

| Substitute | What the agent gets | Price | Verification |
|---|---|---|---|
| Reelly | Live developer inventory, one-touch branded presentations and offer links; 60,000+ registered agents | Free to start; paid tier AED 540-900/month | Free tier read on [vendor site](https://reelly.io/); paid price from a single blog, unverified |
| Alnair | Off-plan unit catalogue app | AED 150/month per broker | Snippet only; vendor page failed to load |
| knowme.ae | Personal agent profile page, English + Arabic, bookings; no listings, no AI chat | Free, or AED 299 one-off | Read on [vendor site](https://knowme.ae/real-estate-agent-website-dubai) |
| PropSpace | Brokerage CRM with portal publishing | AED 176-220/user/month, AED 500 minimum, 12-month term | Read on [vendor site](https://www.propspace.com/pricing); lower figure conflicting |
| Dubai web agencies | One-off agent or brokerage site | AED 3,000-18,000 basic; AED 18,000-90,000+ custom | Agency price lists, e.g. [Propphy](https://www.propphy.com/blog/real-estate-website-cost-dubai-2026), [Skimbox](https://www.skimbox.co/en/resources/blogs/real-estate-website-development-dubai) |
| Wati / respond.io | WhatsApp team inbox with AI agents; no site, no property model | USD 59-349/month | Read on [Wati](https://www.wati.io/pricing/) and [respond.io](https://respond.io/pricing) |
| Custom AI bot | Bespoke qualification chatbot for a brokerage | USD 11,000-33,000 setup plus USD 400-1,600/month | Single agency quote, [Kolonell](https://kolonell.com/en/blog/ai-lead-qualification-chatbot-real-estate-agency-cost-dubai-2026) |

No local product was found that combines a persistent personal site on the agent's own domain, off-plan project pages and an inventory-grounded concierge as self-serve SaaS. The reference site, hindlounge.com, is a client-rendered app on Vercel and Supabase with a public AI assistant, a logged-in investor portal and a DLD search, carrying no vendor credit, which is consistent with a bespoke build for one agent ([hindlounge.com](https://www.hindlounge.com/), by direct inspection of the public bundle). That cuts both ways: the pattern exists and nobody has productised it, but a motivated agent can commission one, and the reference goes further than EstateSite with a client-retention portal.

The uncomfortable finding is where EstateSite is weakest against these substitutes. Its project pages are typed in by hand, while Reelly and Alnair populate payment plans, brochures and live availability from developer feeds for free or AED 150. Competing on inventory is a losing position. The defensible ground is the part those apps do not offer: the agent's owned front door, with a bio, a domain, search visibility, an always-on concierge and leads that belong to the agent. Reelly already has the audience and the branding features, so hosted agent pages would be a short step for it; that is the most credible fast-follower threat. Confidence that the gap exists today is medium, because the scan of AI-native entrants and MENA or India vendors was shallow and Property Finder and Bayut agent-microsite offerings were not checked.

## Demand rests on conversion, and the evidence is thin

The best survey evidence is American and lukewarm. In the NAR 2025 Technology Survey, only **12% of Realtors named their personal website a top source of quality leads**, against 39% for social media, and only 7% used chatbots for lead capture ([HousingWire](https://www.housingwire.com/articles/nar-2025-technology-survey-realtor-tech-usage-trends/)). No Dubai or MENA survey on agents' own websites was found at all. Local agencies describe portals and referrals as the primary sources, paid Meta and Google ads as the supplement, and WhatsApp as the conversion layer for everything; a personal site is framed as an owned funnel and credibility asset, not a lead source ([Propphy](https://www.propphy.com/blog/how-dubai-real-estate-agents-generate-leads-online-2026), agency opinion). The claims that chat converts better than forms (12% higher, or 14% to 39% at one Texas brokerage) come entirely from chatbot vendors, and they confound chat format with response speed. None should appear in EstateSite's marketing as fact.

This reframes the pitch. EstateSite does not generate leads; it converts traffic the agent already buys or earns. The honest promise is an instant, grounded, multilingual answer to an overseas investor at 3 a.m., followed by a WhatsApp handoff with the lead logged. The economics support that even at modest uplift: agencies quote Meta cost per lead at roughly AED 35-200 and portal subscriptions at AED 3,000-15,000+ per office per month (unofficial estimates; neither portal publishes prices, [Groovy Web](https://www.groovyweb.co/blog/bayut-vs-property-finder-leads)), and a 2% commission on an AED 1 million sale is AED 20,000 ([Property Finder](https://www.propertyfinder.ae/blog/how-much-is-real-estate-commission-dubai/)). Affordability is not the objection; proof that it converts is. That makes ad-landing features (UTM capture on leads, pixel fields, per-project landing pages, WhatsApp click logging) more commercially important than more templates.

On price, the landing page's placeholder of USD 29 a month (about AED 107) sits under every local anchor except knowme.ae's one-off fee. The table gives a pricing structure consistent with the anchors above; the figures are this report's recommendation, not market data.

| Offer | Buyer | Suggested price | Anchored against |
|---|---|---|---|
| Free | Trial and distribution | Subdomain, badge, small project cap, low chat cap | Reelly free tier, knowme.ae Basic |
| Solo | Established off-plan agent | AED 149-299/month | Alnair AED 150; PropSpace AED 220/user; US agents' USD 50-250 monthly tech spend |
| Team | Boutique brokerage, 3-15 agents | AED 500-1,000/month | PropSpace AED 500 floor; Wati/respond.io USD 59-349 |
| Managed or self-hosted | Agent who wants it done once and owned | AED 5,000-15,000 setup, optional care plan | Agency sites AED 3,000-18,000; custom bots at five-figure USD |

Two cautions apply. High agent churn argues for annual prepay discounts and for selling to the brokerage where possible. And the free tier's AI cost falls on the operator's API keys, so it needs hard caps and a model allow-list before it is opened to the public. Confidence in the price band is medium for the anchors and low for actual willingness to pay, which only customer conversations will establish.

## Seven changes decide whether agents will pay

The order below follows one test: what stands between today's code and a first paying Dubai customer, then a tenth. The table is the prioritised recommendation set.

| Priority | Change | Why it ranks here |
|---|---|---|
| 1 | Make lead delivery unmissable: mandatory branded email with reply-to, instant WhatsApp or SMS alert to the agent, WhatsApp clicks logged as leads, CSV export and a webhook | Leads are the only thing the agent pays for; today a missing key sends them to a console log |
| 2 | Add Dubai compliance fields and legal basics: per-listing Trakheesi permit number and QR, brokerage name and ORN, agent BRN, privacy policy, terms, a consent notice before the chat collects contact details | Secondary sources say permits apply to an agent's own website with fines from AED 50,000; without these fields a careful agent cannot publish |
| 3 | Sell five to ten managed installs before building billing; then add payment and enforce the plan limits the landing page advertises | Validates willingness to pay, the weakest-evidenced assumption, at near-zero build cost; single-tenant mode sidesteps billing and sign-up abuse |
| 4 | Stop competing on inventory: CSV or XML import first, then a feed or link-out to Reelly/Alnair-type sources; add structured units, floor plans and multi-stage payment plans | Manual retyping caps the product at a handful of projects and is its worst point against free apps |
| 5 | Arabic with true right-to-left layout, then Russian; translate content, not only chrome | Local agencies treat Arabic + English as table stakes and even the AED 299 competitor includes it |
| 6 | Finish abuse and cost controls: keep the newly committed per-visitor rate limiter, add a bot check on sign-up and forms, use server-side chat history, restrict model ids, track tokens per tenant | The operator pays every tenant's AI bill; a public free tier without these is an open cost exposure |
| 7 | Make the site a measurable ad landing page: UTM and source on leads, pixel fields, sitemap, canonical URLs, structured data, slug URLs, indexable content on the Lounge home, relevance-ranked retrieval over all listings with amenities | Turns "does it convert?" into a number the agent can see, and fixes the 40-project ceiling |

The compliance item needs a caveat. Every regulatory statement in the notes comes from brokerage, consultancy or law-firm summaries, for example PropSpace's permit guide ([PropSpace](https://www.propspace.com/blog/uae-real-estate-advertising-permits)); no primary DLD or RERA text was read, the fine amounts conflict between sources, and how the rule applies to generic off-plan project pages as opposed to unit adverts is unconfirmed. The same holds for the UAE data-protection law, whose executive regulations were reportedly still unpublished as of May 2026 ([UpperSetup](https://uppersetup.com/en/blog/uae-personal-data-protection-law-pdpl-the-complete-business)). A concierge that quotes prices for specific units and sends transcripts to a foreign model provider raises advertising-consistency and cross-border questions that warrant a paid opinion from a UAE real-estate lawyer before public launch.

The risks, in order of weight, are these. Demand is unproven: no independent data shows Dubai agents want or pay for personal sites, and the US analogue is weak. The market is contracting, with commission income down materially in 2026 and discretionary spend under pressure. Customer churn is structural, because the customers themselves leave the profession within months. A fast follower with distribution (Reelly, a portal, PropSpace, or a general builder adding listing-aware AI chat) can copy the bundle. Compliance exposure sits with both the agent and the platform. Finally, the product is three days old with one developer, no tests in CI and no monitoring, so execution capacity is itself a constraint.

## Conclusion

The research changes the question. "Is there a market for agent websites in Dubai?" has a weak answer, because websites are not where Dubai leads originate and free inventory apps already cover the off-plan catalogue. "Is there a market for an agent-owned conversion layer that answers investors instantly from the agent's own material and hands them to WhatsApp?" has a better one: nobody sells it as a product, the one visible example was custom-built, and its price would be trivial against portal and ad spend if it demonstrably converts. EstateSite's real asset is that it already implements this loop cheaply; its website-builder breadth will never match incumbents and does not need to.

The cheapest way to resolve the low-confidence items is not more desk research. Ten conversations with off-plan agents of more than a year's tenure, and three to five paid managed installs with source-tagged leads, would test willingness to pay, the price band and the conversion claim within weeks. If those installs produce attributable leads, the self-serve build order above is justified; if agents will not pay AED 5,000 for a done-for-you version, a AED 200 subscription will not rescue the idea. A natural second act, if the first works, is the brokerage tier and Saudi Arabia's much larger licensed base rather than deeper penetration of Dubai's churning newcomers. This is a product and market assessment only and is not investment advice.

---

## Addendum (11 Nov 2026): hosting, plans and code export

This section answers three follow-up questions. It is based on the code in `web/`, not on new market research. Nothing here was deployed or tested.

### Hosting the platform on your own domain

The code already supports the layout you describe. `src/proxy.ts` reads the request's host name and decides what to serve:

| Visitor opens | What is served |
|---|---|
| `mypersonalbrand.com` | Your landing page, sign-up, login and admin |
| `clientname.mypersonalbrand.com` | That client's site (free plan) |
| `clientdomain.com` | That client's site, if the domain is saved in their settings (paid plan) |

What you need to set up, once:

1. **Buy the domain** and create a hosted Supabase project (run the migrations in `supabase/migrations/`).
2. **Deploy `web/` to Vercel** with `DEPLOY_MODE=multi` and `NEXT_PUBLIC_ROOT_DOMAIN=mypersonalbrand.com`, plus the Supabase keys, at least one AI key and `RESEND_API_KEY`.
3. **Add two domains to the Vercel project:** `mypersonalbrand.com` and the wildcard `*.mypersonalbrand.com`. The wildcard is what makes every client subdomain work without any per-client step. Vercel issues wildcard certificates only when the domain uses Vercel's nameservers, so point the domain's nameservers at Vercel at your registrar (confirm against Vercel's current domain docs when you do it).
4. **Set the Supabase Auth site URL** and redirect URLs to `https://mypersonalbrand.com`.
5. **For client custom domains,** set `VERCEL_TOKEN` and `VERCEL_PROJECT_ID`. `src/lib/domains.ts` then registers each domain a client saves, and Vercel issues its certificate. The client adds one DNS record at their registrar (a CNAME to Vercel for `www`, or Vercel's A record for the bare domain).

Two things to fix before real clients use custom domains: nothing stops two tenants claiming the same domain, and the app does not show the client whether their DNS is verified yet.

### Plans: Free, Solo, Team

The database already has a `plan` column with three values (`free`, `pro`, `business`) that drive the daily chat cap. These map directly onto your three plans; only the labels change.

| | Free | Solo | Team |
|---|---|---|---|
| Suggested price | AED 0 | AED 149–299 / month | AED 500–1,000 / month |
| Address | `name.mypersonalbrand.com` | Own domain | Own domain |
| "Powered by" badge | Shown | Removed | Removed |
| Projects | Up to 10 | Unlimited | Unlimited |
| Concierge messages / day | 100 | 2,000 | 10,000 |
| Templates | Classic, Lounge | Plus premium templates | Plus premium templates |
| Users | 1 | 1 | Several agents, shared leads inbox |
| Lead alerts | Email | Email + export | Email + export + per-agent routing |

The prices are suggestions from the report, not tested with customers. What is not built yet:

- **Enforcement.** Done on 11 Nov 2026: the project limit, custom-domain gate, badge and chat cap are now enforced from `src/lib/plans.ts` and in the database, and the plan values are `free`, `solo`, `team`. Change a client's plan with `scripts/set-plan.mjs`.
- **Payment.** There is no billing. For the first clients, invoice manually and set `plan` by hand; add Stripe when the manual work becomes a burden.
- **Team features.** The role column exists but is never checked, and there are no invites. Team is the plan furthest from ready, so launch with Free and Solo and list Team as "contact us".
- **Free-plan cost.** You pay every free site's AI bill. Keep the free cap low and add a bot check on sign-up before opening it publicly.

### Giving a client their site without exposing the platform

There are three ways to do this, and they protect your code to different degrees.

| Option | What the client receives | Is your code exposed? | Chat, leads and admin |
|---|---|---|---|
| **A. Managed dedicated install** | Nothing but a working site on their domain. You run a separate single-tenant deployment (`DEPLOY_MODE=single`) on your own account. | No | All work |
| **B. Docker image** | The compiled image built by the `Dockerfile`, run on their server | Partly. It contains minified JavaScript, not your source, but all the logic is in it and a determined developer can read it. Protection is the licence contract, not the technology. | All work |
| **C. Static export + hosted concierge** | Plain HTML, CSS and images of their site, which they can host anywhere | No. The files contain only their pages. | Only if the chat and contact form call back to your hosted platform |

Recommendation: sell **A** as "Managed". It is what the code does today, the client never touches code, and you keep control of updates and the AI bill. Call it "dedicated" or "private" hosting rather than self-hosted.

Offer **C** as the answer to "what if I leave?" or as a one-time purchase. It is the only option that hands over real code with none of yours in it. It needs two pieces that do not exist yet:

- An export command that saves a tenant's rendered pages as static files.
- The embeddable chat widget (already on the "not built" list), with `/api/chat` and `/api/contact` allowed to accept calls from the client's domain. Without it, an exported site has no concierge and no lead form.

A client on option C who keeps the widget is still a paying subscriber for the concierge, which is the part of the product with the clearest value.

Avoid **B** unless a client insists on running it on their own servers, and then only with a signed licence and a higher price. Never hand over the repository itself as part of a standard plan.

Separately from code, let every client export their own content (projects, FAQs, leads) as CSV. It costs little, answers lock-in complaints that the report found against larger competitors, and exposes nothing.
