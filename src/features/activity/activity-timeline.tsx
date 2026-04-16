import { useActivityLog } from './use-activity'
import { EmptyState } from '@/components/ui/empty-state'
import { PageLoader } from '@/components/ui/spinner'
import { formatDateTime } from '@/lib/utils'
import { Activity, Briefcase, ArrowRightLeft, CheckCircle2, Video, StickyNote, ClipboardList } from 'lucide-react'

const eventIcons: Record<string, React.ReactNode> = {
  application_created: <Briefcase className="h-4 w-4 text-blue-500" />,
  status_changed: <ArrowRightLeft className="h-4 w-4 text-purple-500" />,
  action_added: <ClipboardList className="h-4 w-4 text-orange-500" />,
  action_completed: <CheckCircle2 className="h-4 w-4 text-green-500" />,
  interview_added: <Video className="h-4 w-4 text-indigo-500" />,
  note_added: <StickyNote className="h-4 w-4 text-yellow-600" />,
}

const eventBgColors: Record<string, string> = {
  application_created: 'bg-blue-50 ring-blue-200',
  status_changed: 'bg-purple-50 ring-purple-200',
  action_added: 'bg-orange-50 ring-orange-200',
  action_completed: 'bg-green-50 ring-green-200',
  interview_added: 'bg-indigo-50 ring-indigo-200',
  note_added: 'bg-yellow-50 ring-yellow-200',
}

interface ActivityTimelineProps {
  applicationId: string
}

export function ActivityTimeline({ applicationId }: ActivityTimelineProps) {
  const { data: activities, isLoading } = useActivityLog(applicationId)

  if (isLoading) return <PageLoader />

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-500">
          <Activity className="h-4 w-4 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Activity</h3>
        {activities?.length ? (
          <span className="rounded-full bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-700">{activities.length}</span>
        ) : null}
      </div>

      {!activities?.length ? (
        <EmptyState icon={<Activity className="h-10 w-10" />} title="No activity yet" description="Activity will appear here as you interact with this application" />
      ) : (
        <div className="relative space-y-0">
          <div className="absolute left-[11px] top-2 bottom-2 w-px bg-gradient-to-b from-indigo-200 via-purple-200 to-transparent" />
          {activities.map((activity) => {
            const bgClass = eventBgColors[activity.event_type] || 'bg-gray-50 ring-gray-200'
            return (
              <div key={activity.id} className="relative flex gap-3.5 py-2.5">
                <div className={`relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ring-2 ${bgClass}`}>
                  {eventIcons[activity.event_type] || <Activity className="h-4 w-4 text-gray-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700">{activity.description}</p>
                  <p className="text-xs text-gray-400">{formatDateTime(activity.created_at)}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}