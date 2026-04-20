import { supabase } from '@/lib/supabase'
import type { InsertTables, Action, Application, ActionType, Notification } from '@/types/database'

/**
 * Pure client-side notification generator.
 *
 * Runs on app boot and after data mutations. Scans the user's own data
 * and upserts a row per distinct (type, application, action) tuple
 * so running the scan multiple times is safe and idempotent.
 *
 * Triggers:
 *   ACTION_DUE_SOON       — action due today, tomorrow, or in 2 days
 *   ACTION_OVERDUE        — action past due, not completed
 *   FOLLOW_UP_REMINDER    — applied >= FOLLOWUP_THRESHOLD_DAYS ago, no "Follow Up" action
 *   INACTIVITY_REMINDER   — app updated_at >= INACTIVITY_THRESHOLD_DAYS ago
 */

const FOLLOWUP_THRESHOLD_DAYS   = 5
const INACTIVITY_THRESHOLD_DAYS = 14

type Candidate = Omit<InsertTables<'notifications'>, 'user_id'>

function toDateOnly(d: Date): string {
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function daysBetween(aIso: string, bIso: string): number {
  const a = new Date(aIso).getTime()
  const b = new Date(bIso).getTime()
  return Math.floor((a - b) / (1000 * 60 * 60 * 24))
}

/**
 * Build candidate notifications for a single user from live data.
 */
async function buildCandidates(userId: string): Promise<Candidate[]> {
  const todayDate = new Date()
  todayDate.setHours(0, 0, 0, 0)
  const today = toDateOnly(todayDate)

  const [actionsRes, appsRes, typesRes] = await Promise.all([
    supabase
      .from('actions')
      .select('*')
      .eq('user_id', userId)
      .eq('completed', false),
    supabase
      .from('applications')
      .select('*')
      .eq('user_id', userId),
    supabase.from('action_types').select('*'),
  ])

  if (actionsRes.error) throw actionsRes.error
  if (appsRes.error)    throw appsRes.error
  if (typesRes.error)   throw typesRes.error

  const actions = (actionsRes.data ?? []) as Action[]
  const apps    = (appsRes.data ?? [])    as Application[]
  const types   = (typesRes.data ?? [])   as ActionType[]
  const appById = new Map(apps.map((a) => [a.id, a]))

  const followUpTypeId = types.find((t) => /follow.?up/i.test(t.name))?.id

  const candidates: Candidate[] = []

  // --- A/B: per-action urgency -----------------------------------------------
  for (const a of actions) {
    if (!a.due_date) continue
    const app = appById.get(a.application_id)
    const appLabel = app ? app.company : 'this application'
    const diff = daysBetween(a.due_date, today) // >0 future, 0 today, <0 past

    if (diff < 0) {
      const daysAgo = Math.abs(diff)
      candidates.push({
        application_id: a.application_id,
        action_id: a.id,
        type: 'ACTION_OVERDUE',
        priority: 1, // critical
        title: `${appLabel} — overdue action`,
        message: daysAgo === 1
          ? `"${a.title}" was due yesterday. A quick follow-up can still recover momentum.`
          : `"${a.title}" was due ${daysAgo} days ago. Take 2 minutes to close it out.`,
        due_date: a.due_date,
      })
    } else if (diff === 0) {
      candidates.push({
        application_id: a.application_id,
        action_id: a.id,
        type: 'ACTION_DUE_SOON',
        priority: 2, // high — today
        title: `${appLabel} — due today`,
        message: `"${a.title}" is on today's list. Knock it out while it's fresh.`,
        due_date: a.due_date,
      })
    } else if (diff <= 2) {
      const whenLabel = diff === 1 ? 'tomorrow' : `in ${diff} days`
      candidates.push({
        application_id: a.application_id,
        action_id: a.id,
        type: 'ACTION_DUE_SOON',
        priority: 3, // medium — soon
        title: `${appLabel} — due ${whenLabel}`,
        message: `Heads up: "${a.title}" is coming up ${whenLabel}.`,
        due_date: a.due_date,
      })
    }
  }

  // Index active actions per app to detect missing follow-ups.
  const actionsByApp = new Map<string, typeof actions>()
  for (const a of actions) {
    const arr = actionsByApp.get(a.application_id) ?? []
    arr.push(a)
    actionsByApp.set(a.application_id, arr)
  }

  // --- C: no follow-up after N days --------------------------------------------
  if (followUpTypeId) {
    for (const app of apps) {
      if (!app.date_applied) continue
      const daysSinceApplied = daysBetween(today, app.date_applied)
      if (daysSinceApplied < FOLLOWUP_THRESHOLD_DAYS) continue

      const appActions = actionsByApp.get(app.id) ?? []
      const hasFollowUp = appActions.some((a) => a.action_type_id === followUpTypeId)
      if (hasFollowUp) continue

      candidates.push({
        application_id: app.id,
        action_id: null,
        type: 'FOLLOW_UP_REMINDER',
        priority: 4, // gentle nudge
        title: `Nudge ${app.company}?`,
        message: `It's been ${daysSinceApplied} days since you applied — a short follow-up often gets a reply.`,
        due_date: null,
      })
    }
  }

  // --- D: inactivity ---------------------------------------------------------
  for (const app of apps) {
    const days = daysBetween(today, app.updated_at.slice(0, 10))
    if (days < INACTIVITY_THRESHOLD_DAYS) continue
    candidates.push({
      application_id: app.id,
      action_id: null,
      type: 'INACTIVITY_REMINDER',
      priority: 5, // soft suggestion
      title: `Check in on ${app.company}`,
      message: `No updates on ${app.role} in ${days} days. Worth a status check or moving it to archived?`,
      due_date: null,
    })
  }

  return candidates
}

/**
 * Generate notifications for the current user.
 *
 * Uses Postgres `upsert` on the (user_id, type, application_id, action_id)
 * natural key so re-running is safe. `ignoreDuplicates: true` means we
 * *never* overwrite existing rows (preserving their `is_read` state).
 *
 * Also cleans up notifications whose underlying condition has resolved —
 * e.g. an action was completed or its due date moved far into the future.
 */
export async function generateNotifications(): Promise<{ inserted: number; cleaned: number }> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { inserted: 0, cleaned: 0 }

  const candidates = await buildCandidates(user.id)

  // --- Clean up obsolete notifications -------------------------------------
  // If a notification is tied to an action_id that is no longer in our
  // live set (completed / deleted / pushed out), remove it so the inbox
  // stays honest. The DB's ON DELETE CASCADE already handles deleted rows.
  const liveActionIds = new Set(
    candidates.filter((c) => c.action_id).map((c) => c.action_id as string),
  )
  const { data: existingActionBased } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .in('type', ['ACTION_DUE_SOON', 'ACTION_OVERDUE'])
    .not('action_id', 'is', null)

  const staleIds = ((existingActionBased ?? []) as Notification[])
    .filter((n) => n.action_id && !liveActionIds.has(n.action_id))
    .map((n) => n.id)

  if (staleIds.length) {
    await supabase.from('notifications').delete().in('id', staleIds)
  }

  // --- Upsert fresh candidates ---------------------------------------------
  if (!candidates.length) return { inserted: 0, cleaned: staleIds.length }

  const rows = candidates.map((c) => ({ ...c, user_id: user.id }))
  const { error } = await supabase
    .from('notifications')
    .upsert(rows as never, {
      // The unique index is expression-based (COALESCE), so we can't use
      // its name directly; PostgREST falls back to the columns we name.
      onConflict: 'user_id,type,application_id,action_id',
      ignoreDuplicates: true,
    })

  if (error) {
    // Non-fatal — generator runs in the background.
    console.warn('[notifications] upsert failed', error)
    return { inserted: 0, cleaned: staleIds.length }
  }

  return { inserted: candidates.length, cleaned: staleIds.length }
}
