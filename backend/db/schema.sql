-- SourceSea schema
-- Single table for v1. user_id is nullable for now (no auth yet);
-- once Supabase Google OAuth is wired in, it becomes a FK to auth.users
-- and RLS is switched on using the commented policy at the bottom.

create extension if not exists pgcrypto;

create table if not exists resources (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid,                           -- Supabase user id (auth.users lives in a different DB — no FK here)
  url         text not null,
  title       text not null,
  notes       text,
  remind_at   timestamptz not null,          -- when the reminder should fire
  status      text not null default 'pending' check (status in ('pending', 'done', 'dismissed')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Fast lookups for "what's due" polling and per-user scoping
create index if not exists idx_resources_remind_at on resources (remind_at);
create index if not exists idx_resources_user_id   on resources (user_id);

-- Auto-bump updated_at on every edit
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_resources_updated_at on resources;
create trigger trg_resources_updated_at
  before update on resources
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- FUTURE: enable once Supabase Google OAuth is in place.
-- ---------------------------------------------------------------------------
-- alter table resources enable row level security;
--
-- create policy "select_own_resources" on resources
--   for select using (auth.uid() = user_id);
--
-- create policy "insert_own_resources" on resources
--   for insert with check (auth.uid() = user_id);
--
-- create policy "update_own_resources" on resources
--   for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
--
-- create policy "delete_own_resources" on resources
--   for delete using (auth.uid() = user_id);
