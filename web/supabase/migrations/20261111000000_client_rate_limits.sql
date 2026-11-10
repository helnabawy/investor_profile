-- Per-visitor rate limiting for the public chat and contact endpoints.
-- client_hash is a salted SHA-256 of the visitor's IP address (src/lib/rate-limit.ts), never the IP itself.
alter table public.chat_messages add column client_hash text;
alter table public.leads         add column client_hash text;

create index chat_messages_client_recent_idx on public.chat_messages (client_hash, created_at) where client_hash is not null;
create index leads_client_recent_idx         on public.leads (client_hash, created_at) where client_hash is not null;
