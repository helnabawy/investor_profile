-- Arabic beside English. Every visitor-facing text column gets an `_ar` twin; text inside jsonb
-- (sections, nav, contact, theme, ai_config, price_growth) uses the same `<key>_ar` sibling keys.
-- An empty Arabic value falls back to the English one on the site (src/lib/i18n/content.ts).

-- ───────── tenants ─────────
alter table public.tenants
  add column name_ar        text,
  add column tagline_ar     text,
  add column default_locale text not null default 'en' check (default_locale in ('en','ar')),
  add column locales        text[] not null default '{en,ar}'
    check (locales <@ array['en','ar']::text[] and cardinality(locales) between 1 and 2);

-- Owners may edit the new content and language settings (see 20261108000100_tenant_column_grants.sql).
grant update (name_ar, tagline_ar, default_locale, locales) on public.tenants to authenticated;

-- ───────── pages ─────────
alter table public.pages
  add column title_ar       text,
  add column description_ar text;

-- ───────── projects ─────────
alter table public.projects
  add column title_ar         text,
  add column developer_ar     text,
  add column area_ar          text,
  add column city_ar          text,
  add column property_type_ar text,
  add column bedrooms_ar      text,
  add column handover_ar      text,
  add column payment_plan_ar  text,
  add column roi_ar           text,
  add column description_ar   text,
  add column amenities_ar     text[] not null default '{}';

-- The concierge searches both languages.
alter table public.projects drop column search;
alter table public.projects add column search tsvector generated always as (
  to_tsvector('simple',
    coalesce(title,'') || ' ' || coalesce(developer,'') || ' ' || coalesce(area,'') || ' ' ||
    coalesce(city,'') || ' ' || coalesce(property_type,'') || ' ' || coalesce(status,'') || ' ' ||
    coalesce(bedrooms,'') || ' ' || coalesce(description,'') || ' ' ||
    coalesce(title_ar,'') || ' ' || coalesce(developer_ar,'') || ' ' || coalesce(area_ar,'') || ' ' ||
    coalesce(city_ar,'') || ' ' || coalesce(property_type_ar,'') || ' ' || coalesce(description_ar,''))
) stored;
create index projects_search_idx on public.projects using gin (search);

-- ───────── faqs ─────────
alter table public.faqs
  add column question_ar text,
  add column answer_ar   text;

alter table public.faqs drop column search;
alter table public.faqs add column search tsvector generated always as (
  to_tsvector('simple', question || ' ' || answer || ' ' || coalesce(question_ar,'') || ' ' || coalesce(answer_ar,''))
) stored;
create index faqs_search_idx on public.faqs using gin (search);

-- ───────── leads ─────────
-- The language the visitor used, so the agent replies in it.
alter table public.leads add column locale text check (locale in ('en','ar'));
