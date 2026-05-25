-- ============================================================
-- GeoHood — Supabase Schema
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

create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

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

create policy "vendors_select_all"
  on public.vendors for select
  using (true);

create policy "vendors_insert_own"
  on public.vendors for insert
  with check (auth.uid() = owner_id);

create policy "vendors_update_own"
  on public.vendors for update
  using (auth.uid() = owner_id);

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

create policy "saved_select_own"
  on public.saved_vendors for select
  using (auth.uid() = user_id);

create policy "saved_insert_own"
  on public.saved_vendors for insert
  with check (auth.uid() = user_id);

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
create policy "leads_insert_all"
  on public.leads for insert
  with check (true);

-- Vendor owners can read leads for their vendors
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
-- Enable realtime for vendors and leads tables
alter publication supabase_realtime add table public.vendors;
alter publication supabase_realtime add table public.leads;

-- ────────────────────────────────────────────────────────────
-- 6. STORAGE BUCKETS
-- ────────────────────────────────────────────────────────────
-- Run these in the Storage section or via SQL:

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
create policy "profile_photos_select_all"
  on storage.objects for select
  using (bucket_id = 'profile-photos');

create policy "profile_photos_insert_own"
  on storage.objects for insert
  with check (
    bucket_id = 'profile-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "profile_photos_update_own"
  on storage.objects for update
  using (
    bucket_id = 'profile-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

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

create or replace trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

create or replace trigger vendors_updated_at
  before update on public.vendors
  for each row execute function public.handle_updated_at();
