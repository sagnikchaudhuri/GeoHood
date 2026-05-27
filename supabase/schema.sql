-- ============================================================
-- GeoHood — Supabase Schema
-- Safe to re-run: uses IF NOT EXISTS + DROP POLICY IF EXISTS
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- Required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ────────────────────────────────────────────────────────────
-- 1. PROFILES
-- ────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id                    uuid        primary key references auth.users(id) on delete cascade,
  phone                 text        not null,
  name                  text        not null,
  locality              text        not null default 'patuli',
  profile_image_url     text,
  notifications_enabled boolean     not null default true,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

-- unique phone constraint (one account per phone number)
create unique index if not exists profiles_phone_idx on public.profiles (phone);

-- RLS
alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

-- ────────────────────────────────────────────────────────────
-- 2. VENDORS
-- ────────────────────────────────────────────────────────────
create table if not exists public.vendors (
  id            uuid        primary key default gen_random_uuid(),
  owner_id      uuid        not null references public.profiles(id) on delete cascade,
  business_name text        not null,
  category      text        not null,
  subcategory   text        not null default '',
  description   text        not null default '',
  whatsapp      text        not null,
  locality      text        not null,
  is_live       boolean     not null default false,
  lat           double precision,
  lng           double precision,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Indexes
create index if not exists vendors_owner_idx    on public.vendors (owner_id);
create index if not exists vendors_locality_idx on public.vendors (locality);
create index if not exists vendors_is_live_idx  on public.vendors (is_live);

-- RLS — public read, owner write
alter table public.vendors enable row level security;

drop policy if exists "vendors_select_all" on public.vendors;
create policy "vendors_select_all"
  on public.vendors for select
  using (true);

drop policy if exists "vendors_insert_own" on public.vendors;
create policy "vendors_insert_own"
  on public.vendors for insert
  with check (auth.uid() = owner_id);

drop policy if exists "vendors_update_own" on public.vendors;
create policy "vendors_update_own"
  on public.vendors for update
  using (auth.uid() = owner_id);

drop policy if exists "vendors_delete_own" on public.vendors;
create policy "vendors_delete_own"
  on public.vendors for delete
  using (auth.uid() = owner_id);

-- ────────────────────────────────────────────────────────────
-- 3. SAVED VENDORS
-- ────────────────────────────────────────────────────────────
create table if not exists public.saved_vendors (
  id         uuid        primary key default gen_random_uuid(),
  user_id    uuid        not null references public.profiles(id) on delete cascade,
  vendor_id  text        not null,   -- mock id ('v001') or real uuid
  created_at timestamptz not null default now(),
  unique (user_id, vendor_id)
);

create index if not exists saved_vendors_user_idx on public.saved_vendors (user_id);

alter table public.saved_vendors enable row level security;

drop policy if exists "saved_select_own" on public.saved_vendors;
create policy "saved_select_own"
  on public.saved_vendors for select
  using (auth.uid() = user_id);

drop policy if exists "saved_insert_own" on public.saved_vendors;
create policy "saved_insert_own"
  on public.saved_vendors for insert
  with check (auth.uid() = user_id);

drop policy if exists "saved_delete_own" on public.saved_vendors;
create policy "saved_delete_own"
  on public.saved_vendors for delete
  using (auth.uid() = user_id);

-- ────────────────────────────────────────────────────────────
-- 4. LEADS
-- ────────────────────────────────────────────────────────────
create table if not exists public.leads (
  id          uuid        primary key default gen_random_uuid(),
  vendor_id   text        not null,
  vendor_name text        not null,
  user_id     uuid        references public.profiles(id) on delete set null,
  user_name   text        not null default 'Anonymous',
  action      text        not null check (action in ('whatsapp_click', 'call_click', 'view')),
  locality    text        not null,
  created_at  timestamptz not null default now()
);

create index if not exists leads_vendor_idx on public.leads (vendor_id);
create index if not exists leads_user_idx   on public.leads (user_id);

alter table public.leads enable row level security;

-- Anyone can insert a lead (contact action)
drop policy if exists "leads_insert_all" on public.leads;
create policy "leads_insert_all"
  on public.leads for insert
  with check (true);

-- Vendor owners can read leads for their vendors
drop policy if exists "leads_select_vendor_owner" on public.leads;
create policy "leads_select_vendor_owner"
  on public.leads for select
  using (
    exists (
      select 1 from public.vendors v
      where v.id::text = vendor_id
        and v.owner_id = auth.uid()
    )
  );

-- ────────────────────────────────────────────────────────────
-- 5. REALTIME
-- ────────────────────────────────────────────────────────────
-- Add tables to supabase_realtime only if not already members
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname    = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename  = 'vendors'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.vendors;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname    = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename  = 'leads'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.leads;
  END IF;
END $$;

-- ────────────────────────────────────────────────────────────
-- 6. STORAGE BUCKETS
-- ────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  values (
    'profile-photos',
    'profile-photos',
    true,
    5242880,  -- 5 MB
    ARRAY['image/jpeg','image/png','image/webp','image/gif']
  )
  on conflict (id) do nothing;

-- Profile-photos storage RLS
drop policy if exists "profile_photos_select_all" on storage.objects;
create policy "profile_photos_select_all"
  on storage.objects for select
  using (bucket_id = 'profile-photos');

drop policy if exists "profile_photos_insert_own" on storage.objects;
create policy "profile_photos_insert_own"
  on storage.objects for insert
  with check (
    bucket_id = 'profile-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "profile_photos_update_own" on storage.objects;
create policy "profile_photos_update_own"
  on storage.objects for update
  using (
    bucket_id = 'profile-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "profile_photos_delete_own" on storage.objects;
create policy "profile_photos_delete_own"
  on storage.objects for delete
  using (
    bucket_id = 'profile-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- ────────────────────────────────────────────────────────────
-- 7. HELPER FUNCTION — updated_at trigger
-- ────────────────────────────────────────────────────────────
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

drop trigger if exists vendors_updated_at on public.vendors;
create trigger vendors_updated_at
  before update on public.vendors
  for each row execute function public.handle_updated_at();
