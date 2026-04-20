import { daysFromNow } from '@/lib/utils'
import type { Action, ActionType } from '@/types/database'

export type Urgency = 'overdue' | 'today' | 'soon' | 'later' | 'completed' | 'none'

/**
 * Classify an action by urgency. Used across ActionCard, NextActionCard,
 * and the grouping header system. `soon` = within 3 days.
 */
export function getUrgency(action: Action): Urgency {
  if (action.completed) return 'completed'
  if (!action.due_date) return 'none'
  const diff = daysFromNow(action.due_date)
  if (diff === null) return 'none'
  if (diff < 0) return 'overdue'
  if (diff === 0) return 'today'
  if (diff <= 3) return 'soon'
  return 'later'
}

export interface UrgencyStyle {
  label: string
  pill: string  // Tailwind classes for the urgency pill (bg + text + ring).
  dot: string   // Colored dot class.
  accent: string // Left-border accent class for the card.
}

export const urgencyStyles: Record<Urgency, UrgencyStyle> = {
  overdue:   { label: 'Overdue',     pill: 'text-red-700 bg-red-50 ring-red-100',          dot: 'bg-red-500',     accent: 'before:bg-red-500' },
  today:     { label: 'Due today',   pill: 'text-amber-800 bg-amber-50 ring-amber-100',    dot: 'bg-amber-500',   accent: 'before:bg-amber-500' },
  soon:      { label: 'Due soon',    pill: 'text-amber-700 bg-amber-50/80 ring-amber-100', dot: 'bg-amber-400',   accent: 'before:bg-amber-300' },
  later:     { label: 'Upcoming',    pill: 'text-indigo-700 bg-indigo-50 ring-indigo-100', dot: 'bg-indigo-500',  accent: 'before:bg-indigo-300' },
  completed: { label: 'Completed',   pill: 'text-emerald-700 bg-emerald-50 ring-emerald-100', dot: 'bg-emerald-500', accent: 'before:bg-emerald-400' },
  none:      { label: 'No due date', pill: 'text-gray-600 bg-gray-50 ring-gray-200/70',    dot: 'bg-gray-400',    accent: 'before:bg-gray-300' },
}

/**
 * Heuristic context classifier — colors the action-type badge so
 * recruiter follow-ups, interview prep, and apply/submit actions
 * stand out even in a long list. Purely visual, never semantic.
 */
export type ActionContext = 'follow-up' | 'interview' | 'apply' | 'thank' | 'research' | 'other'

export function classifyActionType(typeName: string | undefined | null): ActionContext {
  if (!typeName) return 'other'
  const n = typeName.toLowerCase()
  if (n.includes('follow')) return 'follow-up'
  if (n.includes('interview') || n.includes('prep')) return 'interview'
  if (n.includes('apply') || n.includes('submit') || n.includes('send')) return 'apply'
  if (n.includes('thank')) return 'thank'
  if (n.includes('research') || n.includes('study')) return 'research'
  return 'other'
}

export const contextBadgeColor: Record<ActionContext, string> = {
  'follow-up': 'indigo',
  'interview': 'amber',
  'apply':     'violet',
  'thank':     'emerald',
  'research':  'teal',
  'other':     'blue',
}

export function getTypeName(action: Action, types: ActionType[]): string | undefined {
  return types.find((t) => t.id === action.action_type_id)?.name
}
