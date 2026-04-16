import { useDashboardMetrics, useUpcomingInterviews, useRecentActivity } from './use-dashboard'
import { PageLoader } from '@/components/ui/spinner'
import { ErrorState } from '@/components/ui/error-state'
import { formatDateTime } from '@/lib/utils'
import { Link } from 'react-router-dom'
import { useAuth } from '@/features/auth/auth-context'
import {
  Briefcase,
  Send,
  Users,
  Trophy,
  XCircle,
  Flag,
  Clock,
  AlertTriangle,
  CalendarDays,
  Activity,
  Plus,
  ArrowRight,
  TrendingUp,
} from 'lucide-react'

const metricCards = [
  { key: 'totalTracked'  as const, label: 'Total Tracked',  icon: Briefcase,      color: 'text-indigo-600',  bg: 'bg-indigo-50',   border: 'border-indigo-200',  num: 'text-indigo-700' },
  { key: 'applied'       as const, label: 'Applied',        icon: Send,           color: 'text-blue-600',    bg: 'bg-blue-50',     border: 'border-blue-200',    num: 'text-blue-700'   },
  { key: 'interviewing'  as const, label: 'Interviewing',   icon: Users,          color: 'text-violet-600',  bg: 'bg-violet-50',   border: 'border-violet-200',  num: 'text-violet-700' },
  { key: 'offers'        as const, label: 'Offers',         icon: Trophy,         color: 'text-emerald-600', bg: 'bg-emerald-50',  border: 'border-emerald-200', num: 'text-emerald-700'},
  { key: 'rejected'      as const, label: 'Rejected',       icon: XCircle,        color: 'text-rose-600',    bg: 'bg-rose-50',     border: 'border-rose-200',    num: 'text-rose-700'   },
  { key: 'highPriority'  as const, label: 'High Priority',  icon: Flag,           color: 'text-orange-600',  bg: 'bg-orange-50',   border: 'border-orange-200',  num: 'text-orange-700' },
  { key: 'dueThisWeek'   as const, label: 'Due This Week',  icon: Clock,          color: 'text-amber-600',   bg: 'bg-amber-50',    border: 'border-amber-200',   num: 'text-amber-700'  },
  { key: 'overdueActions'as const, label: 'Overdue',        icon: AlertTriangle,  color: 'text-red-600',     bg: 'bg-red-50',      border: 'border-red-200',     num: 'text-red-700'    },
]

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 18) return 'afternoon'
  return 'evening'
}

export function DashboardPage() {
  const { user } = useAuth()
  const { data: metrics, isLoading, error, refetch } = useDashboardMetrics()
  const { data: interviews } = useUpcomingInterviews()
  const { data: activities } = useRecentActivity()

  const username = user?.email?.split('@')[0] ?? 'there'

  if (isLoading) return <PageLoader />
  if (error) return <ErrorState message={error.message} onRetry={refetch} />

  const hasData = (metrics?.totalTracked ?? 0) > 0

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-600 to-violet-700 p-6 shadow-lg shadow-indigo-500/20">
        <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/5" />
        <div className="absolute -right-4 bottom-0 h-32 w-32 rounded-full bg-white/5" />
        <div className="relative z-10 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-indigo-200">Good {getGreeting()},</p>
            <h1 className="mt-0.5 text-2xl font-bold text-white capitalize">{username} 👋</h1>
            <p className="mt-1 text-sm text-indigo-200">
              {hasData
                ? `You have ${metrics?.totalTracked} application${metrics?.totalTracked !== 1 ? 's' : ''} tracked.`
                : 'Start tracking your job applications today.'}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Link
              to="/applications/new"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-indigo-700 shadow-md transition-all hover:bg-indigo-50 hover:shadow-lg"
            >
              <Plus className="h-4 w-4" />
              Add Application
            </Link>
          </div>
        </div>
      </div>

      <div>
        <div className="mb-3 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-gray-400" />
          <h2 className="text-sm font-semibold text-gray-700">Overview</h2>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-4 xl:grid-cols-8">
          {metricCards.map((card) => {
            const Icon = card.icon
            const value = metrics?.[card.key] ?? 0
            return (
              <div
                key={card.key}
                className={`group flex flex-col rounded-xl border bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${card.border}`}
              >
                <div className={`mb-3 flex h-8 w-8 items-center justify-center rounded-lg ${card.bg}`}>
                  <Icon className={`h-4 w-4 ${card.color}`} />
                </div>
                <p className={`text-2xl font-bold ${card.num}`}>{value}</p>
                <p className="mt-0.5 text-xs font-medium text-gray-500">{card.label}</p>
              </div>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50">
                <CalendarDays className="h-4 w-4 text-violet-600" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-gray-900">Upcoming Interviews</h2>
                <p className="text-xs text-gray-400">Scheduled sessions</p>
              </div>
            </div>
            {interviews && interviews.length > 0 && (
              <span className="rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-semibold text-violet-700">
                {interviews.length}
              </span>
            )}
          </div>
          <div className="px-5 py-3">
            {!interviews?.length ? (
              <div className="flex flex-col items-center py-8 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                  <CalendarDays className="h-5 w-5 text-gray-400" />
                </div>
                <p className="mt-3 text-sm font-medium text-gray-600">No interviews scheduled</p>
                <p className="mt-1 text-xs text-gray-400">Interviews will appear here once added</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {interviews.map((interview) => (
                  <div key={interview.id} className="flex items-center gap-3 py-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-100">
                      <CalendarDays className="h-3.5 w-3.5 text-violet-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-900">
                        {interview.application?.company} — {interview.application?.role}
                      </p>
                      <p className="text-xs text-gray-500">{interview.stage}</p>
                    </div>
                    <span className="shrink-0 rounded-lg bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
                      {formatDateTime(interview.interview_at)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50">
                <Activity className="h-4 w-4 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-gray-900">Recent Activity</h2>
                <p className="text-xs text-gray-400">Latest updates</p>
              </div>
            </div>
            <Link to="/applications" className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-500">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="px-5 py-3">
            {!activities?.length ? (
              <div className="flex flex-col items-center py-8 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                  <Activity className="h-5 w-5 text-gray-400" />
                </div>
                <p className="mt-3 text-sm font-medium text-gray-600">No recent activity</p>
                <p className="mt-1 text-xs text-gray-400">Activity shows up as you track applications</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {activities.slice(0, 6).map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 py-3">
                    <div className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-400" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-gray-700">
                        <span className="font-medium text-gray-900">{activity.application?.company}</span>
                        <span className="text-gray-400"> · </span>
                        {activity.description}
                      </p>
                      <p className="mt-0.5 text-xs text-gray-400">{formatDateTime(activity.created_at)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
