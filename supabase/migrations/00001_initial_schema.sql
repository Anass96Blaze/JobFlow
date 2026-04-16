-- JobFlow: Initial Schema Migration
-- Run this in your Supabase SQL Editor to set up all tables, RLS, and seed data.

-- ============================================================================
-- EXTENSIONS
-- ============================================================================
create extension if not exists "uuid-ossp";

-- ============================================================================
-- REFERENCE TABLES
-- ============================================================================

create table public.statuses (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  sort_order integer not null default 0
);

create table public.priorities (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  sort_order integer not null default 0
);

create table public.sources (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  sort_order integer not null default 0
);

create table public.action_types (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  sort_order integer not null default 0
);
-- ============================================================================
-- PROFILES
-- ============================================================================

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================================
-- APPLICATIONS
-- ============================================================================

create table public.applications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  company text not null,
  role text not null,
  location text,
  job_link text,
  date_added date not null default current_date,
  date_applied date,
  source_id uuid references public.sources(id) on delete set null,
  status_id uuid not null references public.statuses(id),
  priority_id uuid references public.priorities(id) on delete set null,
  fit_score integer check (fit_score >= 0 and fit_score <= 100),
  cv_version text,
  cover_letter_required boolean not null default false,
  salary_range text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_applications_user_id on public.applications(user_id);
create index idx_applications_status_id on public.applications(status_id);

-- ============================================================================
-- CONTACTS
-- ============================================================================

create table public.contacts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  application_id uuid not null references public.applications(id) on delete cascade,
  name text not null,
  role text,
  email text,
  phone text,
  notes text,
  created_at timestamptz not null default now()
);

create index idx_contacts_application_id on public.contacts(application_id);

-- ============================================================================
-- ACTIONS
-- ============================================================================

create table public.actions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  application_id uuid not null references public.applications(id) on delete cascade,
  action_type_id uuid not null references public.action_types(id),
  title text not null,
  due_date date,
  completed boolean not null default false,
  completed_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_actions_application_id on public.actions(application_id);
create index idx_actions_user_due on public.actions(user_id, due_date) where completed = false;

-- ============================================================================
-- INTERVIEWS
-- ============================================================================

create table public.interviews (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  application_id uuid not null references public.applications(id) on delete cascade,
  stage text not null,
  interview_at timestamptz not null,
  format text,
  interviewer_name text,
  outcome text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_interviews_application_id on public.interviews(application_id);

-- ============================================================================
-- APPLICATION NOTES
-- ============================================================================

create table public.application_notes (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  application_id uuid not null references public.applications(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_application_notes_application_id on public.application_notes(application_id);

-- ============================================================================
-- STATUS HISTORY
-- ============================================================================

create table public.status_history (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  application_id uuid not null references public.applications(id) on delete cascade,
  from_status_id uuid references public.statuses(id),
  to_status_id uuid not null references public.statuses(id),
  changed_at timestamptz not null default now()
);

create index idx_status_history_application_id on public.status_history(application_id);

-- ============================================================================
-- ACTIVITY LOG
-- ============================================================================

create table public.activity_log (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  application_id uuid not null references public.applications(id) on delete cascade,
  event_type text not null,
  description text not null,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index idx_activity_log_application_id on public.activity_log(application_id);
create index idx_activity_log_user_created on public.activity_log(user_id, created_at desc);

-- ============================================================================
-- UPDATED_AT TRIGGER
-- ============================================================================

create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at before update on public.profiles
  for each row execute function public.handle_updated_at();
create trigger set_updated_at before update on public.applications
  for each row execute function public.handle_updated_at();
create trigger set_updated_at before update on public.actions
  for each row execute function public.handle_updated_at();
create trigger set_updated_at before update on public.interviews
  for each row execute function public.handle_updated_at();
create trigger set_updated_at before update on public.application_notes
  for each row execute function public.handle_updated_at();

-- ============================================================================
-- AUTO-CREATE PROFILE ON SIGN UP
-- ============================================================================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================================
-- ACTIVITY LOG TRIGGERS
-- ============================================================================

create or replace function public.log_application_created()
returns trigger as $$
begin
  insert into public.activity_log (user_id, application_id, event_type, description)
  values (new.user_id, new.id, 'application_created', 'Application created');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_application_created
  after insert on public.applications
  for each row execute function public.log_application_created();

create or replace function public.log_status_change()
returns trigger as $$
begin
  if old.status_id is distinct from new.status_id then
    insert into public.status_history (user_id, application_id, from_status_id, to_status_id)
    values (new.user_id, new.id, old.status_id, new.status_id);

    insert into public.activity_log (user_id, application_id, event_type, description)
    values (new.user_id, new.id, 'status_changed', 'Status changed');
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_application_status_changed
  after update on public.applications
  for each row execute function public.log_status_change();

create or replace function public.log_action_event()
returns trigger as $$
begin
  if tg_op = 'INSERT' then
    insert into public.activity_log (user_id, application_id, event_type, description)
    values (new.user_id, new.application_id, 'action_added', 'Action added: ' || new.title);
  elsif tg_op = 'UPDATE' and old.completed = false and new.completed = true then
    insert into public.activity_log (user_id, application_id, event_type, description)
    values (new.user_id, new.application_id, 'action_completed', 'Action completed: ' || new.title);
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_action_event
  after insert or update on public.actions
  for each row execute function public.log_action_event();

create or replace function public.log_interview_added()
returns trigger as $$
begin
  insert into public.activity_log (user_id, application_id, event_type, description)
  values (new.user_id, new.application_id, 'interview_added', 'Interview scheduled: ' || new.stage);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_interview_added
  after insert on public.interviews
  for each row execute function public.log_interview_added();

create or replace function public.log_note_added()
returns trigger as $$
begin
  insert into public.activity_log (user_id, application_id, event_type, description)
  values (new.user_id, new.application_id, 'note_added', 'Note added');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_note_added
  after insert on public.application_notes
  for each row execute function public.log_note_added();

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

alter table public.profiles enable row level security;
alter table public.applications enable row level security;
alter table public.contacts enable row level security;
alter table public.actions enable row level security;
alter table public.interviews enable row level security;
alter table public.application_notes enable row level security;
alter table public.status_history enable row level security;
alter table public.activity_log enable row level security;

alter table public.statuses enable row level security;
alter table public.priorities enable row level security;
alter table public.sources enable row level security;
alter table public.action_types enable row level security;

create policy "reference tables are readable by authenticated users"
  on public.statuses for select to authenticated using (true);
create policy "priorities readable by authenticated users"
  on public.priorities for select to authenticated using (true);
create policy "sources readable by authenticated users"
  on public.sources for select to authenticated using (true);
create policy "action_types readable by authenticated users"
  on public.action_types for select to authenticated using (true);

create policy "users can view own profile"
  on public.profiles for select to authenticated using (auth.uid() = id);
create policy "users can insert own profile"
  on public.profiles for insert to authenticated with check (auth.uid() = id);
create policy "users can update own profile"
  on public.profiles for update to authenticated using (auth.uid() = id);

create policy "users can view own applications"
  on public.applications for select to authenticated using (auth.uid() = user_id);
create policy "users can insert own applications"
  on public.applications for insert to authenticated with check (auth.uid() = user_id);
create policy "users can update own applications"
  on public.applications for update to authenticated using (auth.uid() = user_id);
create policy "users can delete own applications"
  on public.applications for delete to authenticated using (auth.uid() = user_id);

create policy "users can view own contacts"
  on public.contacts for select to authenticated using (auth.uid() = user_id);
create policy "users can insert own contacts"
  on public.contacts for insert to authenticated with check (auth.uid() = user_id);
create policy "users can update own contacts"
  on public.contacts for update to authenticated using (auth.uid() = user_id);
create policy "users can delete own contacts"
  on public.contacts for delete to authenticated using (auth.uid() = user_id);

create policy "users can view own actions"
  on public.actions for select to authenticated using (auth.uid() = user_id);
create policy "users can insert own actions"
  on public.actions for insert to authenticated with check (auth.uid() = user_id);
create policy "users can update own actions"
  on public.actions for update to authenticated using (auth.uid() = user_id);
create policy "users can delete own actions"
  on public.actions for delete to authenticated using (auth.uid() = user_id);

create policy "users can view own interviews"
  on public.interviews for select to authenticated using (auth.uid() = user_id);
create policy "users can insert own interviews"
  on public.interviews for insert to authenticated with check (auth.uid() = user_id);
create policy "users can update own interviews"
  on public.interviews for update to authenticated using (auth.uid() = user_id);
create policy "users can delete own interviews"
  on public.interviews for delete to authenticated using (auth.uid() = user_id);

create policy "users can view own notes"
  on public.application_notes for select to authenticated using (auth.uid() = user_id);
create policy "users can insert own notes"
  on public.application_notes for insert to authenticated with check (auth.uid() = user_id);
create policy "users can update own notes"
  on public.application_notes for update to authenticated using (auth.uid() = user_id);
create policy "users can delete own notes"
  on public.application_notes for delete to authenticated using (auth.uid() = user_id);

create policy "users can view own status history"
  on public.status_history for select to authenticated using (auth.uid() = user_id);
create policy "users can insert own status history"
  on public.status_history for insert to authenticated with check (auth.uid() = user_id);

create policy "users can view own activity log"
  on public.activity_log for select to authenticated using (auth.uid() = user_id);
create policy "users can insert own activity log"
  on public.activity_log for insert to authenticated with check (auth.uid() = user_id);

-- ============================================================================
-- TABLE GRANTS
-- ============================================================================

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.applications TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contacts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.actions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.interviews TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.application_notes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.status_history TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.activity_log TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;

GRANT SELECT ON public.statuses TO authenticated;
GRANT SELECT ON public.priorities TO authenticated;
GRANT SELECT ON public.sources TO authenticated;
GRANT SELECT ON public.action_types TO authenticated;

-- ============================================================================
-- SEED DATA
-- ============================================================================

insert into public.statuses (name, sort_order) values
  ('To Apply', 1),
  ('Applied', 2),
  ('HR Screening', 3),
  ('Interview', 4),
  ('Final Interview', 5),
  ('Offer', 6),
  ('Rejected', 7),
  ('No Response', 8),
  ('On Hold', 9),
  ('Withdrawn', 10)
on conflict (name) do nothing;

insert into public.priorities (name, sort_order) values
  ('High', 1),
  ('Medium', 2),
  ('Low', 3)
on conflict (name) do nothing;

insert into public.sources (name, sort_order) values
  ('LinkedIn', 1),
  ('Indeed', 2),
  ('Company Site', 3),
  ('Referral', 4),
  ('Recruiter', 5),
  ('Networking', 6),
  ('Other', 7)
on conflict (name) do nothing;

insert into public.action_types (name, sort_order) values
  ('Tailor CV', 1),
  ('Submit Application', 2),
  ('Follow Up', 3),
  ('Prep Interview', 4),
  ('Send Thank You', 5),
  ('Negotiate Offer', 6),
  ('Wait', 7),
  ('Archive', 8)
on conflict (name) do nothing;