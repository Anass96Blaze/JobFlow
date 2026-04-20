import { useMemo } from 'react'
import { useActivityLog } from './use-activity'
import { EmptyState } from '@/components/ui/empty-state'
import { PageLoader } from '@/components/ui/spinner'
import { Activity, Briefcase, ArrowRightLeft, CheckCircle2, Video, StickyNote, ClipboardList } from 'lucide-react'
import type { ActivityLog } from '@/types/database'

const eventIcons: Record<string, React.ReactNode> = {
  application_created: <Briefcase className="h-3.5 w-3.5 text-blue-600" />,
  status_changed:      <ArrowRightLeft className="h-3.5 w-3.5 text-purple-600" />,
  action_added:        <ClipboardList className="h-3.5 w-3.5 text-orange-600" />,
  action_completed:    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />,
  interview_added:     <Video className="h-3.5 w-3.5 text-indigo-600" />,
  note_added:          <StickyNote className="h-3.5 w-3.5 text-amber-600" />,
}

const eventRings: Record<string, string> = {
  application_created: 'bg-blue-50 ring-blue-100',
  status_changed:      'bg-purple-50 ring-purple-100',
  action_added:        'bg-orange-50 ring-orange-100',
  action_completed:    'bg-emerald-50 ring-emerald-100',
  interview_added:     'bg-indigo-50 ring-indigo-100',
  note_added:          'bg-amber-50 ring-amber-100',
}

interface ActivityTimelineProps {
  applicationId: string
}

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate()
}

function dateGroupLabel(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  const yesterday = new Date(); yesterday.setDate(now.getDate() - 1)

  if (sameDay(d, now)) return 'Today'
  if (sameDay(d, yesterday)) return 'Yesterday'
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: d.getFullYear() === now.getFullYear() ? undefined : 'numeric' })
}

function timeLabel(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

export function ActivityTimeline({ applicationId }: ActivityTimelineProps) {
  const { data: activities, isLoading } = useActivityLog(applicationId)

  const groups = useMemo(() => {
    if (!activities?.length) return []
    const acc: { label: string; items: ActivityLog[] }[] = []
    for (const a of activities) {
      const label = dateGroupLabel(a.created_at)
      const last = acc[acc.length - 1]
      if (last && last.label === label) last.items.push(a)
      else acc.push({ label, items: [a] })
    }
    return acc
  }, [activities])

  if (isLoading) return <PageLoader />

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 shadow-[0_4px_10px_-2px_rgba(139,92,246,0.4)] ring-1 ring-white/10">
          <Activity className="h-[17px] w-[17px] text-white" />
        </div>
        <div>
          <h3 className="text-[15px] font-semibold tracking-[-0.01em] text-gray-900">Activity</h3>
          {activities?.length ? (
            <p className="text-[11.5px] text-gray-500">{activities.length} events</p>
          ) : null}
        </div>
      </div>

      {!activities?.length ? (
        <EmptyState
          compact
          icon={<Activity className="h-6 w-6" />}
          title="No activity yet"
          description="Events like status changes, notes and completions will appear here automatically."
        />
      ) : (
        <div className="space-y-6">
          {groups.map((group) => (
            <div key={group.label}>
              <p className="mb-2 pl-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-gray-400">
                {group.label}
              </p>

              <div className="relative">
                <div className="absolute left-[11px] top-3 bottom-3 w-px bg-gradient-to-b from-indigo-100 via-gray-100 to-transparent" />
                {group.items.map((activity) => {
                  const ring = eventRings[activity.event_type] || 'bg-gray-50 ring-gray-100'
                  return (
                    <div key={activity.id} className="relative flex gap-3 py-2">
                      <div className={`relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ring-2 ${ring}`}>
                        {eventIcons[activity.event_type] || <Activity className="h-3.5 w-3.5 text-gray-400" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm leading-snug text-gray-700">{activity.description}</p>
                        <p className="text-[11px] text-gray-400">{timeLabel(activity.created_at)}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
