import { useMemo, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Action, ActionType } from '@/types/database'
import { ActionCard } from './action-card'
import { getUrgency, type Urgency } from './urgency'

interface ActionsListProps {
  actions: Action[]
  actionTypes: ActionType[]
  onToggleComplete: (a: Action) => void
  onEdit: (a: Action) => void
  onDelete: (id: string) => void
}

/**
 * Groups are rendered in execution-priority order. Each header has a
 * colored status dot, uppercase label, count pill, and a gradient
 * rule line that fades into the background.
 */
const GROUP_ORDER: {
  key: Urgency | 'soonCombo'
  label: string
  dot: string
  text: string
  includes: Urgency[]
}[] = [
  { key: 'overdue',   label: 'Overdue',      dot: 'bg-red-500',     text: 'text-red-700',     includes: ['overdue'] },
  { key: 'soonCombo', label: 'Today & soon', dot: 'bg-amber-500',   text: 'text-amber-800',   includes: ['today', 'soon'] },
  { key: 'later',     label: 'Upcoming',     dot: 'bg-indigo-500',  text: 'text-indigo-700',  includes: ['later'] },
  { key: 'none',      label: 'No due date',  dot: 'bg-gray-400',    text: 'text-gray-600',    includes: ['none'] },
  { key: 'completed', label: 'Completed',    dot: 'bg-emerald-500', text: 'text-emerald-700', includes: ['completed'] },
]

export function ActionsList({
  actions,
  actionTypes,
  onToggleComplete,
  onEdit,
  onDelete,
}: ActionsListProps) {
  const [completedOpen, setCompletedOpen] = useState(false)

  const grouped = useMemo(() => {
    const map = new Map<Urgency, Action[]>()
    for (const a of actions) {
      const u = getUrgency(a)
      const arr = map.get(u) ?? []
      arr.push(a)
      map.set(u, arr)
    }
    // Sort each bucket.
    for (const [u, arr] of map) {
      if (u === 'completed') {
        arr.sort((a, b) => (b.completed_at ?? '').localeCompare(a.completed_at ?? ''))
      } else {
        arr.sort((a, b) => {
          if (!a.due_date && !b.due_date) return 0
          if (!a.due_date) return 1
          if (!b.due_date) return -1
          return a.due_date.localeCompare(b.due_date)
        })
      }
    }
    return map
  }, [actions])

  return (
    <div className="space-y-6">
      {GROUP_ORDER.map((group) => {
        const items = group.includes.flatMap((u) => grouped.get(u) ?? [])
        if (!items.length) return null

        const isCompleted = group.key === 'completed'
        const open = !isCompleted || completedOpen
        const isOverdueGroup = group.key === 'overdue'

        return (
          <section key={group.key}>
            <button
              type="button"
              onClick={() => isCompleted && setCompletedOpen((v) => !v)}
              disabled={!isCompleted}
              className={cn(
                'mb-2.5 flex w-full items-center gap-2 px-0.5 text-left',
                isCompleted && 'cursor-pointer hover:opacity-90',
                !isCompleted && 'cursor-default',
              )}
              aria-expanded={isCompleted ? open : undefined}
            >
              {/* Colored status dot (pulses for Overdue) */}
              <span className="relative flex h-2 w-2">
                {isOverdueGroup && (
                  <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-70 animate-soft-ping" />
                )}
                <span className={cn('relative inline-flex h-2 w-2 rounded-full', group.dot)} />
              </span>

              <span className={cn('text-[10px] font-semibold uppercase tracking-[0.12em]', group.text)}>
                {group.label}
              </span>

              <span className="inline-flex min-w-[20px] items-center justify-center rounded-full bg-gray-100 px-1.5 py-px text-[10px] font-semibold tabular-nums text-gray-600 ring-1 ring-inset ring-gray-200/60">
                {items.length}
              </span>

              <span className="ml-1 h-px flex-1 bg-gradient-to-r from-gray-200 via-gray-100 to-transparent" />

              {isCompleted && (
                <ChevronDown
                  className={cn(
                    'h-3.5 w-3.5 text-gray-400 transition-transform duration-200',
                    open && 'rotate-180',
                  )}
                />
              )}
            </button>

            {open && (
              <div className="space-y-2.5 animate-fade-in">
                {items.map((action) => (
                  <ActionCard
                    key={action.id}
                    action={action}
                    actionTypes={actionTypes}
                    onToggleComplete={onToggleComplete}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                ))}
              </div>
            )}
          </section>
        )
      })}
    </div>
  )
}
