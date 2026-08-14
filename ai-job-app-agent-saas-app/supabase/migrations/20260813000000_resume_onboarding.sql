-- Resume onboarding: extend profiles, related tables, and storage bucket

-- Extend profiles with resume-derived fields
alter table public.profiles
  add column if not exists headline text,
  add column if not exists professional_summary text,
  add column if not exists phone text,
  add column if not exists location text,
  add column if not exists website text,
  add column if not exists linkedin_url text,
  add column if not exists github_url text,
  add column if not exists other_links jsonb not null default '[]'::jsonb,
  add column if not exists onboarding_completed_at timestamptz;

-- Parse status enum
do $$ begin
  create type public.resume_parse_status as enum (
    'pending',
    'processing',
    'completed',
    'failed'
  );
exception
  when duplicate_object then null;
end $$;

-- Resumes table
create table if not exists public.resumes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  file_name text not null,
  storage_path text not null,
  file_size bigint not null default 0,
  mime_type text not null,
  parse_status public.resume_parse_status not null default 'pending',
  parse_error text,
  is_primary boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists resumes_user_id_created_at_idx
  on public.resumes (user_id, created_at desc);

-- Work experiences
create table if not exists public.work_experiences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  company text not null,
  job_title text not null,
  location text,
  start_date text,
  end_date text,
  is_current boolean not null default false,
  responsibilities text[] not null default '{}',
  display_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists work_experiences_user_id_idx
  on public.work_experiences (user_id, display_order);

-- Education entries
create table if not exists public.education_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  institution text not null,
  degree text,
  field_of_study text,
  start_date text,
  end_date text,
  display_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists education_entries_user_id_idx
  on public.education_entries (user_id, display_order);

-- Skills
create table if not exists public.skills (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  category text,
  display_order int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists skills_user_id_idx
  on public.skills (user_id, display_order);

-- Projects
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  description text,
  url text,
  technologies text[] not null default '{}',
  display_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists projects_user_id_idx
  on public.projects (user_id, display_order);

-- Certifications
create table if not exists public.certifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  issuer text,
  issue_date text,
  url text,
  display_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists certifications_user_id_idx
  on public.certifications (user_id, display_order);

-- Enable RLS on all new tables
alter table public.resumes enable row level security;
alter table public.work_experiences enable row level security;
alter table public.education_entries enable row level security;
alter table public.skills enable row level security;
alter table public.projects enable row level security;
alter table public.certifications enable row level security;

-- Resumes policies
create policy "Users can view own resumes"
  on public.resumes for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can insert own resumes"
  on public.resumes for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update own resumes"
  on public.resumes for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete own resumes"
  on public.resumes for delete to authenticated
  using ((select auth.uid()) = user_id);

-- Work experiences policies
create policy "Users can view own work experiences"
  on public.work_experiences for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can insert own work experiences"
  on public.work_experiences for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update own work experiences"
  on public.work_experiences for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete own work experiences"
  on public.work_experiences for delete to authenticated
  using ((select auth.uid()) = user_id);

-- Education policies
create policy "Users can view own education"
  on public.education_entries for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can insert own education"
  on public.education_entries for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update own education"
  on public.education_entries for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete own education"
  on public.education_entries for delete to authenticated
  using ((select auth.uid()) = user_id);

-- Skills policies
create policy "Users can view own skills"
  on public.skills for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can insert own skills"
  on public.skills for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update own skills"
  on public.skills for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete own skills"
  on public.skills for delete to authenticated
  using ((select auth.uid()) = user_id);

-- Projects policies
create policy "Users can view own projects"
  on public.projects for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can insert own projects"
  on public.projects for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update own projects"
  on public.projects for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete own projects"
  on public.projects for delete to authenticated
  using ((select auth.uid()) = user_id);

-- Certifications policies
create policy "Users can view own certifications"
  on public.certifications for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can insert own certifications"
  on public.certifications for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update own certifications"
  on public.certifications for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete own certifications"
  on public.certifications for delete to authenticated
  using ((select auth.uid()) = user_id);

-- Storage bucket for resumes
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'resumes',
  'resumes',
  false,
  5242880,
  array[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
on conflict (id) do update set
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Storage policies: users can manage files under their own folder
create policy "Users can upload own resumes"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'resumes'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );

create policy "Users can view own resume files"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'resumes'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );

create policy "Users can update own resume files"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'resumes'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  )
  with check (
    bucket_id = 'resumes'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );

create policy "Users can delete own resume files"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'resumes'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );
