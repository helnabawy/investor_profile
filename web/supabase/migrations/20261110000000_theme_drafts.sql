-- Unpublished theme/template changes. An agent edits a draft, previews it on their
-- real site, then publishes (copies it into tenants.theme) or discards it.
-- Separate table so drafts are never readable through the public tenants policy.
create table public.theme_drafts (
  tenant_id  uuid primary key references public.tenants(id) on delete cascade,
  theme      jsonb not null default '{}'::jsonb,   -- same shape as tenants.theme
  updated_at timestamptz not null default now()
);

create trigger theme_drafts_touch before update on public.theme_drafts for each row execute function public.touch_updated_at();

alter table public.theme_drafts enable row level security;
create policy theme_drafts_member_all on public.theme_drafts for all
  using (public.is_member(tenant_id)) with check (public.is_member(tenant_id));
