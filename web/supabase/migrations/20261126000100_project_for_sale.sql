-- Agents tick this to tell visitors a project has units available for sale right now.
alter table public.projects add column for_sale boolean not null default false;
