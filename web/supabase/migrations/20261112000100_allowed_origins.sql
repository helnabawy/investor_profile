-- Origins (e.g. https://www.clientdomain.com) allowed to call this tenant's chat and contact endpoints
-- from an exported copy of their site. Set by the operator with scripts/export-site.mjs; members cannot
-- edit it because the column-level update grant in 20261108000100 does not include it.
alter table public.tenants add column allowed_origins text[] not null default '{}';
