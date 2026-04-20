import { Plus, ClipboardList, CheckCircle2, Flame, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ActionsHeaderProps {
  total: number
  completed: number
  overdue: number
  onAdd: () => void
}

/**
 * Top-of-panel header with:
 *  - gradient icon tile + title
 *  - live progress text with overdue alert
 *  - celebration state when 100% done
 *  - shimmer-animated progress bar
 */
export function ActionsHeader({ total, completed, overdue, onAdd }: ActionsHeaderProps) {
  const pct = total ? Math.round((completed / total) * 100) : 0
  const done = total > 0 && pct === 100

  return (
    <div className="space-y-3.5">
      {/* Title row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 shadow-[0_4px_10px_-2px_rgba(245,158,11,0.4)] ring-1 ring-white/10">
            <ClipboardList className="h-[17px] w-[17px] text-white" />
          </div>
          <div>
            <h3 className="text-[15px] font-semibold tracking-[-0.01em] text-gray-900">Actions</h3>
            {total > 0 ? (
              <p className="mt-0.5 flex items-center gap-1.5 text-[11.5px] text-gray-500">
                <span className="tabular-nums">
                  <span className="font-semibold text-gray-800">{completed}</span>
                  <span className="mx-0.5 text-gray-400">/</span>
                  <span>{total}</span>
                  <span className="ml-1">completed</span>
                </span>
                {overdue > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-1.5 py-0.5 font-semibold text-red-700 ring-1 ring-inset ring-red-100">
                    <Flame className="h-3 w-3" />
                    {overdue} overdue
                  </span>
                )}
                {done && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-1.5 py-0.5 font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-100">
                    <Sparkles className="h-3 w-3" />
                    All caught up
                  </span>
                )}
              </p>
            ) : (
              <p className="mt-0.5 text-[11.5px] text-gray-500">Plan the follow-ups for this opportunity</p>
            )}
          </div>
        </div>
        <Button size="sm" onClick={onAdd}>
          <Plus className="h-4 w-4" /> Add action
        </Button>
      </div>

      {/* Progress bar */}
      {total > 0 && (
        <div
          className={cn(
            'flex items-center gap-3 rounded-xl border px-3.5 py-2.5 transition-colors',
            'shadow-[0_1px_2px_rgba(16,24,40,0.03)]',
            done
              ? 'border-emerald-100 bg-gradient-to-br from-emerald-50/50 to-white'
              : 'border-gray-100 bg-gradient-to-br from-gray-50/70 to-white',
          )}
        >
          <div className="relative shrink-0">
            <CheckCircle2
              className={cn(
                'h-4 w-4 transition-colors',
                done ? 'text-emerald-500' : 'text-gray-300',
              )}
            />
            {done && (
              <span className="pointer-events-none absolute inset-0 rounded-full bg-emerald-400/50 animate-soft-ping" />
            )}
          </div>

          <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100">
            <div
              className={cn(
                'h-full rounded-full transition-[width] duration-700 ease-out',
                done
                  ? 'bg-gradient-to-r from-emerald-400 to-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.45)]'
                  : 'bg-gradient-to-r from-indigo-400 via-indigo-500 to-violet-500 shadow-[0_0_8px_rgba(99,102,241,0.35)]',
              )}
              style={{ width: `${pct}%` }}
            />
            {/* Animated shimmer — only while work remains */}
            {!done && pct > 0 && (
              <div
                className="pointer-events-none absolute inset-y-0 left-0 animate-progress-shimmer rounded-full"
                style={{ width: `${pct}%` }}
              />
            )}
          </div>

          <span className={cn(
            'shrink-0 text-[11.5px] font-semibold tabular-nums transition-colors',
            done ? 'text-emerald-600' : 'text-gray-600',
          )}>
            {pct}%
          </span>
        </div>
      )}
    </div>
  )
}
