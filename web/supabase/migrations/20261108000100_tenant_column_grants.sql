-- Owners may edit their site's content/settings, but not billing or identity fields
-- (plan, slug, id) — those change only via the service role (signup, billing webhooks).
revoke update on public.tenants from authenticated, anon;
grant update (name, tagline, domains, theme, ai_config, contact, nav, published) on public.tenants to authenticated;
