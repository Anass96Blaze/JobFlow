-- ============================================================================
-- Notifications / Reminders system
-- ============================================================================
-- In-app notifications generated from the user's own data (actions + apps).
-- De-duplicated by a natural key (user_id, type, application_id, action_id)
-- so the generator can be run safely on every app load.
-- ============================================================================

create table public.notifications (
  id             uuid primary key default uuid_generate_v4(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  application_id uuid references public.applications(id) on delete cascade,
  action_id      uuid references public.actions(id)      on delete cascade,

  -- Discriminator:
  --   ACTION_DUE_SOON       action due in 1–2 days
  --   ACTION_OVERDUE        action past due, not completed
  --   FOLLOW_UP_REMINDER    applied >= 5 days ago, no "Follow Up" action
  --   INACTIVITY_REMINDER   no activity on application for >= 14 days
  type           text not null check (type in (
    'ACTION_DUE_SOON',
    'ACTION_OVERDUE',
    'FOLLOW_UP_REMINDER',
    'INACTIVITY_REMINDER'
  )),

  title          text not null,
  message        text not null,
  is_read        boolean not null default false,

  -- Lower = more urgent. Used to sort the inbox after unread/read:
  --   1 = overdue action            (critical)
  --   2 = action due today          (high)
  --   3 = action due soon (1-2 d)   (medium)
  --   4 = follow-up reminder        (gentle nudge)
  --   5 = inactivity reminder       (soft suggestion)
  priority       smallint not null default 5 check (priority between 1 and 5),

  -- Cached reference values so the dropdown doesn't need extra joins.
  due_date       date,

  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- --- Indexes ---------------------------------------------------------------

-- Inbox view: "my latest unread notifications" — now ordered by priority.
create index notifications_user_unread_idx
  on public.notifications (user_id, is_read, priority, created_at desc);

-- De-duplication key: one row per (type, application, action).
-- NULLS NOT DISTINCT (PG15+) lets us treat NULL values as equal so
-- notifications not tied to an action (e.g. FOLLOW_UP_REMINDER) still
-- de-duplicate correctly.
create unique index notifications_dedup_key
  on public.notifications (user_id, type, application_id, action_id)
  nulls not distinct;

-- --- updated_at trigger ----------------------------------------------------

create trigger set_updated_at before update on public.notifications
  for each row execute function public.handle_updated_at();

-- --- RLS -------------------------------------------------------------------

alter table public.notifications enable row level security;

create policy "users can view own notifications"
  on public.notifications for select
  to authenticated
  using (auth.uid() = user_id);

create policy "users can insert own notifications"
  on public.notifications for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "users can update own notifications"
  on public.notifications for update
  to authenticated
  using (auth.uid() = user_id);

create policy "users can delete own notifications"
  on public.notifications for delete
  to authenticated
  using (auth.uid() = user_id);
