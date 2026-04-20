import { ArrowRight, CheckCircle2, Circle, CalendarClock, AlertTriangle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn, formatDate } from '@/lib/utils'
import type { Action, ActionType } from '@/types/database'
import {
  getUrgency,
  urgencyStyles,
  getTypeName,
  classifyActionType,
  contextBadgeColor,
} from '@/features/actions/urgency'

interface NextActionCardProps {
  action: Action | null
  actionTypes: ActionType[]
  onToggleComplete: (action: Action) => void
  onAddAction: () => void
}

/**
 * Compact "what should I do next?" callout. Sits between hero and tabs.
 * The background subtly tints on high-urgency states to draw the eye
 * without feeling alarming.
 */
export function NextActionCard({ action, actionTypes, onToggleComplete, onAddAction }: NextActionCardProps) {
  if (!action) {
    return (
      <div className="group flex items-center justify-between gap-4 rounded-2xl border border-dashed border-gray-200 bg-gradient-to-br from-white to-gray-50/60 px-5 py-4 transition-colors hover:border-indigo-200 hover:from-indigo-50/30">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white ring-1 ring-gray-200 transition-colors group-hover:ring-indigo-200">
            <CalendarClock className="h-4 w-4 text-gray-400 transition-colors group-hover:text-indigo-500" />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-gray-400">Next Action</p>
            <p className="text-sm font-medium leading-snug text-gray-600">Nothing planned — stay ahead.</p>
          </div>
        </div>
        <button
          onClick={onAddAction}
          className="inline-flex items-center gap-1.5 rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-semibold text-white shadow-[0_1px_2px_rgba(16,24,40,0.1)] transition-all hover:-translate-y-px hover:bg-gray-800 hover:shadow-md"
        >
          Add action <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    )
  }

  const urgency = getUrgency(action)
  const meta = urgencyStyles[urgency]
  const typeName = getTypeName(action, actionTypes)
  const badgeColor = contextBadgeColor[classifyActionType(typeName)]
  const isOverdue = urgency === 'overdue'
  const isToday   = urgency === 'today'

  return (
    <div
      className={cn(
        'group relative flex items-start gap-4 overflow-hidden rounded-2xl border bg-white p-4',
        'shadow-[0_1px_2px_rgba(16,24,40,0.05)] transition-all',
        'hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(16,24,40,0.06)]',
        isOverdue ? 'border-red-200/70'
          : isToday  ? 'border-amber-200/70'
          : 'border-gray-200',
      )}
    >
      {/* Subtle urgency tint — bottom-right wash only */}
      {(isOverdue || isToday) && (
        <div
          aria-hidden
          className={cn(
            'pointer-events-none absolute -right-16 -bottom-16 h-40 w-40 rounded-full blur-2xl',
            isOverdue ? 'bg-red-200/30' : 'bg-amber-200/40',
          )}
        />
      )}

      <button
        onClick={() => onToggleComplete(action)}
        className="relative mt-0.5 shrink-0 rounded-full transition-transform duration-150 hover:scale-110 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/30"
        aria-label={action.completed ? 'Mark as not done' : 'Mark as done'}
      >
        {action.completed
          ? <CheckCircle2 className="h-6 w-6 text-emerald-500 drop-shadow-[0_1px_2px_rgba(16,185,129,0.25)]" />
          : <Circle className={cn('h-6 w-6 transition-colors', isOverdue ? 'text-red-300 hover:text-red-500' : 'text-gray-300 hover:text-indigo-500')} />}
      </button>

      <div className="relative min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-gray-400">Next Action</p>
          <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset', meta.pill)}>
            <span className={cn('h-1.5 w-1.5 rounded-full', meta.dot)} />
            {meta.label}
          </span>
        </div>
        <p className={cn('mt-1 text-[15px] font-semibold leading-snug tracking-[-0.005em]', action.completed ? 'text-gray-400 line-through' : 'text-gray-900')}>
          {action.title}
        </p>
        <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-gray-500">
          {typeName && <Badge color={badgeColor}>{typeName}</Badge>}
          {action.due_date && (
            <span className={cn('inline-flex items-center gap-1', isOverdue && 'font-semibold text-red-600')}>
              {isOverdue && <AlertTriangle className="h-3 w-3" />}
              Due {formatDate(action.due_date)}
            </span>
          )}
        </div>
      </div>

      {!action.completed && (
        <button
          onClick={() => onToggleComplete(action)}
          className="relative shrink-0 rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-semibold text-white shadow-[0_1px_2px_rgba(16,24,40,0.1)] transition-all hover:-translate-y-px hover:bg-gray-800 hover:shadow-md"
        >
          Mark done
        </button>
      )}
    </div>
  )
}
