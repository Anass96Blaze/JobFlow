import { useMemo } from 'react'
import { AlertTriangle, CalendarClock, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useActions } from '@/features/actions/use-actions'
import { getUrgency } from '@/features/actions/urgency'

interface ApplicationReminderBannerProps {
  applicationId: string
  /** Scrolls / opens the Actions tab when clicked. */
  onFocusActions: () => void
}

/**
 * Contextual reminder strip shown above the application hero.
 * Surfaces the single most urgent signal for this application:
 *   1) overdue actions (red)
 *   2) due-today/soon actions (amber)
 * Stays completely hidden when nothing is pressing — zero noise.
 */
export function ApplicationReminderBanner({ applicationId, onFocusActions }: ApplicationReminderBannerProps) {
  const { data: actions = [] } = useActions(applicationId)

  const { overdue, dueSoon } = useMemo(() => {
    let overdue = 0
    let dueSoon = 0
    for (const a of actions) {
      const u = getUrgency(a)
      if (u === 'overdue') overdue += 1
      else if (u === 'today' || u === 'soon') dueSoon += 1
    }
    return { overdue, dueSoon }
  }, [actions])

  if (!overdue && !dueSoon) return null

  const isDanger = overdue > 0
  const Icon = isDanger ? AlertTriangle : CalendarClock

  const title = isDanger
    ? `${overdue} overdue ${overdue === 1 ? 'action' : 'actions'}`
    : `${dueSoon} ${dueSoon === 1 ? 'action' : 'actions'} due soon`

  const detail = isDanger
    ? dueSoon > 0
      ? `Plus ${dueSoon} more due in the next few days.`
      : 'Tackle these before they slip further.'
    : 'Stay on track with this opportunity.'

  return (
    <button
      onClick={onFocusActions}
      className={cn(
        'group flex w-full items-center gap-3 overflow-hidden rounded-2xl border px-4 py-3 text-left transition-all animate-fade-in',
        'shadow-[0_1px_2px_rgba(16,24,40,0.04)] hover:-translate-y-px hover:shadow-[0_4px_10px_rgba(16,24,40,0.06)]',
        isDanger
          ? 'border-red-200/70 bg-gradient-to-br from-red-50/70 via-white to-white'
          : 'border-amber-200/70 bg-gradient-to-br from-amber-50/70 via-white to-white',
      )}
    >
      <div className={cn(
        'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset',
        isDanger ? 'bg-red-100/70 ring-red-200/70 text-red-600' : 'bg-amber-100/70 ring-amber-200/70 text-amber-600',
      )}>
        <Icon className="h-[17px] w-[17px]" />
      </div>
      <div className="min-w-0 flex-1">
        <p className={cn(
          'text-[13.5px] font-semibold tracking-[-0.005em]',
          isDanger ? 'text-red-900' : 'text-amber-900',
        )}>
          {title}
        </p>
        <p className={cn(
          'mt-0.5 text-[12px] leading-snug',
          isDanger ? 'text-red-700/90' : 'text-amber-800/90',
        )}>
          {detail}
        </p>
      </div>
      <span className={cn(
        'hidden shrink-0 items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11.5px] font-semibold transition-colors sm:inline-flex',
        isDanger
          ? 'bg-red-600 text-white group-hover:bg-red-700'
          : 'bg-amber-500 text-white group-hover:bg-amber-600',
      )}>
        <Sparkles className="h-3.5 w-3.5" />
        Review
      </span>
    </button>
  )
}
