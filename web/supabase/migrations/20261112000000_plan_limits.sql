-- Plans are free / solo / team (previously free / pro / business), and their limits are enforced
-- here as well as in the app, because site members can write to these tables directly through
-- the API. The numbers mirror src/lib/plans.ts — change both together.
update public.tenants set plan = 'solo' where plan = 'pro';
update public.tenants set plan = 'team' where plan = 'business';
update public.tenants set plan = 'free' where plan not in ('free', 'solo', 'team');
alter table public.tenants add constraint tenants_plan_check check (plan in ('free', 'solo', 'team'));

-- Free sites hold at most 10 projects. Existing projects over the limit (after a downgrade) stay.
create function public.enforce_project_limit() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  site_plan text;
begin
  -- Locking the site row makes concurrent inserts queue, so the count below cannot be raced.
  select plan into site_plan from tenants where id = new.tenant_id for update;
  if site_plan = 'free' and (select count(*) from projects where tenant_id = new.tenant_id) >= 10 then
    raise exception 'The Free plan includes up to 10 projects. Upgrade to add more.';
  end if;
  return new;
end $$;

create trigger projects_plan_limit before insert on public.projects
  for each row execute function public.enforce_project_limit();

-- Custom domains need a paid plan. A site that is downgraded keeps its saved domains (the app
-- stops serving them) but cannot change them.
create function public.enforce_domain_plan() returns trigger
language plpgsql as $$
begin
  if new.plan = 'free' and cardinality(new.domains) > 0
     and (tg_op = 'INSERT' or new.domains is distinct from old.domains) then
    raise exception 'Custom domains are not included in the Free plan.';
  end if;
  return new;
end $$;

create trigger tenants_domain_plan before insert or update of domains on public.tenants
  for each row execute function public.enforce_domain_plan();
