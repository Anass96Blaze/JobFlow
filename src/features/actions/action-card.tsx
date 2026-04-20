import { useRef, useState } from 'react'
import { CheckCircle2, Circle, Pencil, Trash2, AlertTriangle, Clock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn, daysFromNow, formatDate } from '@/lib/utils'
import type { Action, ActionType } from '@/types/database'
import {
  getUrgency,
  urgencyStyles,
  getTypeName,
  classifyActionType,
  contextBadgeColor,
} from './urgency'

interface ActionCardProps {
  action: Action
  actionTypes: ActionType[]
  onToggleComplete: (a: Action) => void
  onEdit: (a: Action) => void
  onDelete: (id: string) => void
}

function relativeCreated(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime()
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (days <= 0) return 'today'
  if (days === 1) return 'yesterday'
  if (days < 7)   return `${days}d ago`
  if (days < 30)  return `${Math.floor(days / 7)}w ago`
  return formatDate(iso)
}

/**
 * Countdown chip — "in 3d" / "5d overdue" / "today". Designed to be
 * readable peripherally while scanning the list.
 */
function countdown(dueDate: string | null, completed: boolean): { label: string; cls: string } | null {
  if (completed || !dueDate) return null
  const d = daysFromNow(dueDate)
  if (d === null) return null
  if (d < 0)  return { label: `${Math.abs(d)}d overdue`, cls: 'text-red-700 bg-red-50 ring-red-100' }
  if (d === 0) return { label: 'today',                  cls: 'text-amber-800 bg-amber-50 ring-amber-100' }
  if (d === 1) return { label: 'tomorrow',               cls: 'text-amber-700 bg-amber-50/80 ring-amber-100' }
  if (d <= 3)  return { label: `in ${d}d`,               cls: 'text-amber-700 bg-amber-50/80 ring-amber-100' }
  return { label: `in ${d}d`, cls: 'text-gray-600 bg-gray-50 ring-gray-200/70' }
}

/**
 * Premium task-style action card.
 *
 *  - Left stripe + soft bg tint + urgency pill + countdown chip
 *  - Action-type badge context-colored (Follow Up → indigo, Interview → amber, etc.)
 *  - Springy check-toggle with a subtle burst ring
 *  - Overdue cards gently pulse their accent stripe
 *  - Inline edit + delete on hover / focus
 */
export function ActionCard({
  action,
  actionTypes,
  onToggleComplete,
  onEdit,
  onDelete,
}: ActionCardProps) {
  const urgency = getUrgency(action)
  const style = urgencyStyles[urgency]
  const typeName = getTypeName(action, actionTypes)
  const ctx = classifyActionType(typeName)
  const badgeColor = contextBadgeColor[ctx]
  const overdue = urgency === 'overdue'
  const done    = urgency === 'completed'
  const count   = countdown(action.due_date, action.completed)

  // Transient animation state: when user toggles complete, we play a brief
  // pop + burst ring. Local, cleared by timeout — no global side-effects.
  const [animating, setAnimating] = useState(false)
  const timeoutRef = useRef<number | null>(null)

  const handleToggle = () => {
    setAnimating(true)
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current)
    timeoutRef.current = window.setTimeout(() => setAnimating(false), 500)
    onToggleComplete(action)
  }

  return (
    <div
      className={cn(
        'group relative flex items-start gap-3 rounded-xl border bg-white p-4 pl-[18px]',
        'shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition-all duration-200',
        'hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(16,24,40,0.06)]',
        // 3px urgency accent stripe on the left
        'before:absolute before:left-0 before:top-3.5 before:bottom-3.5 before:w-[3px] before:rounded-full',
        style.accent,
        overdue && 'before:animate-overdue-pulse',
        overdue ? 'border-red-200/70 bg-gradient-to-br from-red-50/50 to-white'
          : done ? 'border-gray-100 bg-gray-50/60 opacity-90 hover:opacity-100'
          : 'border-gray-200 hover:border-indigo-200',
      )}
    >
      {/* Checkbox with springy pop + completion burst ring */}
      <button
        onClick={handleToggle}
        className={cn(
          'relative mt-0.5 shrink-0 rounded-full transition-transform duration-150',
          'hover:scale-110 active:scale-90',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/30',
          animating && 'animate-check-pop',
        )}
        aria-label={action.completed ? 'Mark as not done' : 'Mark as done'}
      >
        {animating && action.completed && (
          <span className="pointer-events-none absolute inset-0 rounded-full bg-emerald-400 animate-check-burst" />
        )}
        {action.completed
          ? <CheckCircle2 className="relative h-[19px] w-[19px] text-emerald-500 drop-shadow-[0_1px_2px_rgba(16,185,129,0.3)]" />
          : <Circle className={cn(
              'relative h-[19px] w-[19px] transition-colors',
              overdue ? 'text-red-300 hover:text-red-500' : 'text-gray-300 hover:text-indigo-500',
            )} />}
      </button>

      <div className="min-w-0 flex-1">
        <p
          className={cn(
            'text-[14px] font-semibold leading-snug tracking-[-0.005em]',
            done ? 'text-gray-400' : 'text-gray-900',
          )}
        >
          {/* Strike-through animates in when completing */}
          <span className={cn(done && animating && 'animate-strike', done && !animating && 'line-through')}>
            {action.title}
          </span>
        </p>

        <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
          {typeName && <Badge color={badgeColor}>{typeName}</Badge>}

          {urgency !== 'later' && urgency !== 'none' && (
            <span className={cn(
              'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset',
              style.pill,
            )}>
              {overdue && <AlertTriangle className="h-3 w-3" />}
              {style.label}
            </span>
          )}

          {count && (
            <span className={cn(
              'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset tabular-nums',
              count.cls,
            )}>
              <Clock className="h-3 w-3" />
              {count.label}
            </span>
          )}

          {action.due_date && (
            <span className={cn(
              'text-[11.5px]',
              overdue ? 'font-semibold text-red-600' : 'text-gray-500',
            )}>
              Due {formatDate(action.due_date)}
            </span>
          )}
        </div>

        {action.notes && (
          <p className="mt-2.5 whitespace-pre-wrap text-[12.5px] leading-relaxed text-gray-500">
            {action.notes}
          </p>
        )}

        <p className="mt-2.5 text-[10.5px] text-gray-400">
          Created {relativeCreated(action.created_at)}
          {done && action.completed_at && (
            <> · <span className="text-emerald-600">Done {relativeCreated(action.completed_at)}</span></>
          )}
        </p>
      </div>

      {/* Hover actions */}
      <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity duration-150 group-hover:opacity-100 focus-within:opacity-100">
        <button
          onClick={() => onEdit(action)}
          className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 focus-visible:outline-none focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-indigo-500/30"
          aria-label="Edit action"
          title="Edit"
        >
          <Pencil className="h-4 w-4" />
        </button>
        <button
          onClick={() => onDelete(action.id)}
          className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-red-500/30"
          aria-label="Delete action"
          title="Delete"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
