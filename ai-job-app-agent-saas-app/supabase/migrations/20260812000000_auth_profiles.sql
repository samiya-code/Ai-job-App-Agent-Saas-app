-- Migration: Create profiles table, RLS policies, and auth trigger
-- Run this in Supabase SQL editor or via the CLI

-- Create profiles table keyed by auth.users.id
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  created_at timestamptz default now()
);

-- Enable row level security
alter table public.profiles enable row level security;

-- Policy: allow users to select their own profile
create policy "select_own_profile" on public.profiles
  for select using (auth.uid() = id);

-- Policy: allow users to insert their own profile (used by the trigger)
create policy "insert_own_profile" on public.profiles
  for insert with check (auth.uid() = id);

-- Policy: allow users to update their own profile
create policy "update_own_profile" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- Function to provision a profile when a new auth user is created
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email, full_name, created_at)
  values (new.id, new.email, (new.raw_user_meta_data->> 'full_name')::text, now())
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Trigger: run after a new user is created
drop trigger if exists auth_user_created on auth.users;
create trigger auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
-- User-facing profile records. The authentication identity stays in auth.users.
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  email text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = id);

create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.email
  )
  on conflict (id) do update
    set full_name = coalesce(excluded.full_name, public.profiles.full_name),
        email = excluded.email,
        updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
