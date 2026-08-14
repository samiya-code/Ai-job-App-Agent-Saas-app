-- Jobs fetched from external platforms (Greenhouse, Lever, Workable, Wellfound)

create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  platform text not null,
  title text not null,
  company text not null,
  company_logo text,
  location text,
  salary text,
  job_type text,
  experience_level text,
  description text,
  tags jsonb not null default '[]'::jsonb,
  match_score int not null default 0,
  job_url text not null,
  source_url text,
  applied_status boolean not null default false,
  saved_status boolean not null default false,
  fetched_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (user_id, job_url)
);

create index if not exists jobs_user_id_fetched_at_idx
  on public.jobs (user_id, fetched_at desc);

create index if not exists jobs_user_id_platform_idx
  on public.jobs (user_id, platform);

alter table public.jobs enable row level security;

create policy "Users can view their own jobs"
  on public.jobs for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can insert their own jobs"
  on public.jobs for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own jobs"
  on public.jobs for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete their own jobs"
  on public.jobs for delete
  to authenticated
  using ((select auth.uid()) = user_id);
