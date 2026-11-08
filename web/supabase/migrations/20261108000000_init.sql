-- EstateSite core schema: multi-tenant real-estate agent sites with AI concierge.
-- Every tenant-owned row carries tenant_id; RLS isolates tenants.

create extension if not exists pg_trgm;

-- ───────────────────────── tenants ─────────────────────────
create table public.tenants (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique check (slug ~ '^[a-z0-9](-?[a-z0-9])*$' and length(slug) between 2 and 40),
  name          text not null,
  tagline       text,
  domains       text[] not null default '{}',          -- custom domains, lowercase, no port
  plan          text not null default 'free',
  theme         jsonb not null default '{}'::jsonb,     -- see src/lib/theme.ts
  ai_config     jsonb not null default '{}'::jsonb,     -- see src/lib/ai/config.ts
  contact       jsonb not null default '{}'::jsonb,     -- {email, phone, whatsapp, address, socials{}}
  nav           jsonb not null default '[]'::jsonb,     -- [{label, href}]
  published     boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index tenants_domains_idx on public.tenants using gin (domains);

create table public.tenant_members (
  tenant_id  uuid not null references public.tenants(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  role       text not null default 'owner' check (role in ('owner','editor')),
  created_at timestamptz not null default now(),
  primary key (tenant_id, user_id)
);
create index tenant_members_user_idx on public.tenant_members(user_id);

-- Helper used by RLS policies. security definer avoids recursive RLS on tenant_members.
create or replace function public.is_member(t uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.tenant_members where tenant_id = t and user_id = auth.uid());
$$;

-- ───────────────────────── content ─────────────────────────
create table public.pages (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null references public.tenants(id) on delete cascade,
  slug        text not null,                 -- '' = home
  title       text not null,
  description text,
  sections    jsonb not null default '[]'::jsonb,  -- [{id, type, props}]
  published   boolean not null default true,
  sort        int not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (tenant_id, slug)
);

create table public.projects (
  id            uuid primary key default gen_random_uuid(),
  tenant_id     uuid not null references public.tenants(id) on delete cascade,
  title         text not null,
  developer     text,
  area          text,                         -- community / district, e.g. "Dubai Marina"
  city          text,
  property_type text,                         -- apartment, villa, townhouse, penthouse, office...
  status        text not null default 'off-plan' check (status in ('off-plan','ready','sold-out')),
  bedrooms      text,                         -- free text: "1-3", "Studio, 1, 2"
  price_from    numeric,
  currency      text not null default 'AED',
  handover      text,                         -- "Q4 2027"
  payment_plan  text,                         -- "60/40", or longer description
  roi           text,                         -- "7-8% expected yield"
  description   text,
  amenities     text[] not null default '{}',
  images        text[] not null default '{}',
  brochure_url  text,
  featured      boolean not null default false,
  published     boolean not null default true,
  sort          int not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  search        tsvector generated always as (
    to_tsvector('simple',
      coalesce(title,'') || ' ' || coalesce(developer,'') || ' ' || coalesce(area,'') || ' ' ||
      coalesce(city,'') || ' ' || coalesce(property_type,'') || ' ' || coalesce(status,'') || ' ' ||
      coalesce(bedrooms,'') || ' ' || coalesce(description,''))
  ) stored
);
create index projects_tenant_idx on public.projects(tenant_id, published, sort);
create index projects_search_idx on public.projects using gin (search);

create table public.faqs (
  id         uuid primary key default gen_random_uuid(),
  tenant_id  uuid not null references public.tenants(id) on delete cascade,
  question   text not null,
  answer     text not null,
  published  boolean not null default true,
  sort       int not null default 0,
  created_at timestamptz not null default now(),
  search     tsvector generated always as (to_tsvector('simple', question || ' ' || answer)) stored
);
create index faqs_tenant_idx on public.faqs(tenant_id);
create index faqs_search_idx on public.faqs using gin (search);

-- Free-form knowledge the agent wants the bot to know (market notes, process, fees...).
create table public.knowledge (
  id         uuid primary key default gen_random_uuid(),
  tenant_id  uuid not null references public.tenants(id) on delete cascade,
  title      text not null,
  content    text not null,
  created_at timestamptz not null default now(),
  search     tsvector generated always as (to_tsvector('simple', title || ' ' || content)) stored
);
create index knowledge_search_idx on public.knowledge using gin (search);

-- ───────────────────────── leads & chat ─────────────────────────
create table public.leads (
  id         uuid primary key default gen_random_uuid(),
  tenant_id  uuid not null references public.tenants(id) on delete cascade,
  name       text,
  email      text,
  phone      text,
  interest   text,
  budget     text,
  message    text,
  source     text not null default 'form' check (source in ('form','chat')),
  status     text not null default 'new' check (status in ('new','contacted','qualified','closed')),
  session_id uuid,
  created_at timestamptz not null default now()
);
create index leads_tenant_idx on public.leads(tenant_id, created_at desc);

create table public.chat_sessions (
  id         uuid primary key default gen_random_uuid(),
  tenant_id  uuid not null references public.tenants(id) on delete cascade,
  visitor_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index chat_sessions_tenant_idx on public.chat_sessions(tenant_id, updated_at desc);

create table public.chat_messages (
  id         uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.chat_sessions(id) on delete cascade,
  tenant_id  uuid not null references public.tenants(id) on delete cascade,
  role       text not null check (role in ('user','assistant')),
  content    text not null,
  created_at timestamptz not null default now()
);
create index chat_messages_session_idx on public.chat_messages(session_id, created_at);
create index chat_messages_tenant_day_idx on public.chat_messages(tenant_id, created_at);

-- ───────────────────────── updated_at ─────────────────────────
create or replace function public.touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;
create trigger tenants_touch  before update on public.tenants  for each row execute function public.touch_updated_at();
create trigger pages_touch    before update on public.pages    for each row execute function public.touch_updated_at();
create trigger projects_touch before update on public.projects for each row execute function public.touch_updated_at();

-- ───────────────────────── RLS ─────────────────────────
alter table public.tenants        enable row level security;
alter table public.tenant_members enable row level security;
alter table public.pages          enable row level security;
alter table public.projects       enable row level security;
alter table public.faqs           enable row level security;
alter table public.knowledge      enable row level security;
alter table public.leads          enable row level security;
alter table public.chat_sessions  enable row level security;
alter table public.chat_messages  enable row level security;

-- tenants: anyone can read published tenants (public sites); members can read/update their own.
-- ai_config is public-readable on purpose: it never holds API keys (keys live in server env).
create policy tenants_public_read on public.tenants for select using (published or public.is_member(id));
create policy tenants_member_update on public.tenants for update using (public.is_member(id)) with check (public.is_member(id));

create policy members_self_read on public.tenant_members for select using (user_id = auth.uid());

-- Public content: read when published, full access for members.
create policy pages_public_read   on public.pages    for select using (published or public.is_member(tenant_id));
create policy pages_member_write  on public.pages    for all    using (public.is_member(tenant_id)) with check (public.is_member(tenant_id));
create policy projects_public_read  on public.projects for select using (published or public.is_member(tenant_id));
create policy projects_member_write on public.projects for all    using (public.is_member(tenant_id)) with check (public.is_member(tenant_id));
create policy faqs_public_read   on public.faqs for select using (published or public.is_member(tenant_id));
create policy faqs_member_write  on public.faqs for all    using (public.is_member(tenant_id)) with check (public.is_member(tenant_id));

-- Private to members (the chatbot reads these with the service role on the server).
create policy knowledge_member_all on public.knowledge     for all using (public.is_member(tenant_id)) with check (public.is_member(tenant_id));
create policy leads_member_all     on public.leads         for all using (public.is_member(tenant_id)) with check (public.is_member(tenant_id));
create policy sessions_member_read on public.chat_sessions for select using (public.is_member(tenant_id));
create policy messages_member_read on public.chat_messages for select using (public.is_member(tenant_id));

-- ───────────────────────── storage ─────────────────────────
insert into storage.buckets (id, name, public) values ('media', 'media', true) on conflict do nothing;
-- Objects are stored under "<tenant_id>/..." ; only members of that tenant may write.
create policy media_public_read on storage.objects for select using (bucket_id = 'media');
create policy media_member_insert on storage.objects for insert
  with check (bucket_id = 'media' and public.is_member(((storage.foldername(name))[1])::uuid));
create policy media_member_update on storage.objects for update
  using (bucket_id = 'media' and public.is_member(((storage.foldername(name))[1])::uuid));
create policy media_member_delete on storage.objects for delete
  using (bucket_id = 'media' and public.is_member(((storage.foldername(name))[1])::uuid));
