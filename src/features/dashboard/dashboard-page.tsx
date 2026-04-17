import { useDashboardMetrics, useUpcomingInterviews, useRecentActivity, useTodayActions, useCompleteAction, usePipelineCounts } from './use-dashboard'
import type { TodayAction } from './use-dashboard'
import { PageLoader } from '@/components/ui/spinner'
import { ErrorState } from '@/components/ui/error-state'
import { formatDate, formatDateTime } from '@/lib/utils'
import { Link, useNavigate } from 'react-router-dom'
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
  Zap,
  CheckCircle2,
  Circle,
  Sparkles,
  ChevronRight,
  ArrowRightLeft,
  StickyNote,
  ClipboardList,
  Video,
  Target,
  Rocket,
} from 'lucide-react'

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 18) return 'afternoon'
  return 'evening'
}

const pipelineColorMap: Record<string, { bg: string; fill: string; text: string }> = {
  gray:    { bg: 'bg-gray-100',    fill: 'bg-gray-400',    text: 'text-gray-700' },
  blue:    { bg: 'bg-blue-100',    fill: 'bg-blue-500',    text: 'text-blue-700' },
  yellow:  { bg: 'bg-amber-100',   fill: 'bg-amber-500',   text: 'text-amber-700' },
  violet:  { bg: 'bg-violet-100',  fill: 'bg-violet-500',  text: 'text-violet-700' },
  emerald: { bg: 'bg-emerald-100', fill: 'bg-emerald-500', text: 'text-emerald-700' },
  rose:    { bg: 'bg-rose-100',    fill: 'bg-rose-500',    text: 'text-rose-700' },
}

const eventIcons: Record<string, { icon: React.ReactNode; bg: string }> = {
  application_created: { icon: <Briefcase className="h-3.5 w-3.5 text-blue-600" />, bg: 'bg-blue-50' },
  status_changed:      { icon: <ArrowRightLeft className="h-3.5 w-3.5 text-purple-600" />, bg: 'bg-purple-50' },
  action_added:        { icon: <ClipboardList className="h-3.5 w-3.5 text-orange-600" />, bg: 'bg-orange-50' },
  action_completed:    { icon: <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />, bg: 'bg-green-50' },
  interview_added:     { icon: <Video className="h-3.5 w-3.5 text-indigo-600" />, bg: 'bg-indigo-50' },
  note_added:          { icon: <StickyNote className="h-3.5 w-3.5 text-yellow-600" />, bg: 'bg-yellow-50' },
}

const metricCards = [
  { key: 'totalTracked'  as const, label: 'Total Tracked',  icon: Briefcase,     color: 'text-indigo-600',  bg: 'bg-indigo-50',   border: 'border-indigo-100',  num: 'text-indigo-700',  hoverBg: 'hover:border-indigo-300' },
  { key: 'applied'       as const, label: 'Applied',        icon: Send,          color: 'text-blue-600',    bg: 'bg-blue-50',     border: 'border-blue-100',    num: 'text-blue-700',    hoverBg: 'hover:border-blue-300' },
  { key: 'interviewing'  as const, label: 'Interviewing',   icon: Users,         color: 'text-violet-600',  bg: 'bg-violet-50',   border: 'border-violet-100',  num: 'text-violet-700',  hoverBg: 'hover:border-violet-300' },
  { key: 'offers'        as const, label: 'Offers',         icon: Trophy,        color: 'text-emerald-600', bg: 'bg-emerald-50',  border: 'border-emerald-100', num: 'text-emerald-700', hoverBg: 'hover:border-emerald-300' },
  { key: 'rejected'      as const, label: 'Rejected',       icon: XCircle,       color: 'text-rose-600',    bg: 'bg-rose-50',     border: 'border-rose-100',    num: 'text-rose-700',    hoverBg: 'hover:border-rose-300' },
  { key: 'highPriority'  as const, label: 'High Priority',  icon: Flag,          color: 'text-orange-600',  bg: 'bg-orange-50',   border: 'border-orange-100',  num: 'text-orange-700',  hoverBg: 'hover:border-orange-300' },
  { key: 'dueThisWeek'   as const, label: 'Due This Week',  icon: Clock,         color: 'text-amber-600',   bg: 'bg-amber-50',    border: 'border-amber-100',   num: 'text-amber-700',   hoverBg: 'hover:border-amber-300' },
  { key: 'overdueActions'as const, label: 'Overdue',        icon: AlertTriangle, color: 'text-red-600',     bg: 'bg-red-50',      border: 'border-red-100',     num: 'text-red-700',     hoverBg: 'hover:border-red-300' },
]

function ActionItem({ action, onComplete, isCompleting }: { action: TodayAction; onComplete: (id: string) => void; isCompleting: boolean }) {
  return (
    <div className={`group flex items-center gap-3 rounded-xl border p-3 transition-all duration-200 hover:shadow-sm ${action.isOverdue ? 'border-red-200 bg-red-50/40' : 'border-gray-150 bg-white hover:border-indigo-200'}`}>
      <button
        onClick={() => onComplete(action.id)}
        disabled={isCompleting}
        className="shrink-0 transition-transform duration-150 hover:scale-110 disabled:opacity-50"
      >
        <Circle className={`h-5 w-5 ${action.isOverdue ? 'text-red-300 hover:text-red-500' : 'text-gray-300 hover:text-indigo-500'}`} />
      </button>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-gray-900">{action.title}</p>
        <div className="mt-0.5 flex items-center gap-2 text-xs text-gray-500">
          <span className="font-medium text-gray-700">{action.company}</span>
          {action.due_date && (
            <>
              <span className="text-gray-300">·</span>
              <span className={action.isOverdue ? 'font-semibold text-red-600' : 'text-gray-500'}>
                {action.isOverdue ? 'Overdue' : 'Due today'} · {formatDate(action.due_date)}
              </span>
            </>
          )}
        </div>
      </div>
      <Link
        to={`/applications/${action.application_id}`}
        className="shrink-0 rounded-lg p-1.5 text-gray-400 opacity-0 transition-all group-hover:opacity-100 hover:bg-gray-100 hover:text-gray-600"
      >
        <ChevronRight className="h-4 w-4" />
      </Link>
    </div>
  )
}

export function DashboardPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { data: metrics, isLoading, error, refetch } = useDashboardMetrics()
  const { data: interviews } = useUpcomingInterviews()
  const { data: activities } = useRecentActivity()
  const { data: todayActions } = useTodayActions()
  const { data: pipeline } = usePipelineCounts()
  const completeMutation = useCompleteAction()

  const username = user?.email?.split('@')[0] ?? 'there'

  if (isLoading) return <PageLoader />
  if (error) return <ErrorState message={error.message} onRetry={refetch} />

  const hasData = (metrics?.totalTracked ?? 0) > 0
  const overdueCount = todayActions?.filter((a) => a.isOverdue).length ?? 0
  const dueTodayCount = todayActions?.filter((a) => a.isDueToday).length ?? 0
  const interviewCount = interviews?.length ?? 0
  const totalPipeline = pipeline?.reduce((sum, s) => sum + s.count, 0) ?? 0

  const insights: string[] = []
  if (overdueCount > 0) insights.push(`${overdueCount} overdue task${overdueCount !== 1 ? 's' : ''} need attention`)
  if (dueTodayCount > 0) insights.push(`${dueTodayCount} action${dueTodayCount !== 1 ? 's' : ''} due today`)
  if (interviewCount > 0) insights.push(`${interviewCount} upcoming interview${interviewCount !== 1 ? 's' : ''}`)
  if ((metrics?.highPriority ?? 0) > 0 && insights.length < 2) insights.push(`${metrics!.highPriority} high-priority application${metrics!.highPriority !== 1 ? 's' : ''}`)

  const handleComplete = (actionId: string) => {
    completeMutation.mutate(actionId)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Welcome Banner ── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-700 p-6 shadow-lg shadow-indigo-500/20">
        <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/5" />
        <div className="absolute -right-6 bottom-0 h-36 w-36 rounded-full bg-white/5" />
        <div className="absolute left-1/3 -bottom-10 h-28 w-28 rounded-full bg-white/5" />
        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-indigo-200">Good {getGreeting()},</p>
            <h1 className="mt-0.5 text-2xl font-bold text-white capitalize">{username} 👋</h1>
            {hasData ? (
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                {insights.length > 0 ? (
                  insights.map((insight, i) => (
                    <span key={i} className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                      {insight}
                    </span>
                  ))
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-sm text-indigo-200">
                    <Sparkles className="h-4 w-4" /> You're all caught up. Nice work!
                  </span>
                )}
              </div>
            ) : (
              <p className="mt-1 text-sm text-indigo-200">Start tracking your job applications today.</p>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Link
              to="/applications/new"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-indigo-700 shadow-md transition-all hover:bg-indigo-50 hover:shadow-lg hover:scale-105 active:scale-95"
            >
              <Plus className="h-4 w-4" />
              New Application
            </Link>
          </div>
        </div>
      </div>

      {/* ── Pipeline Overview ── */}
      {totalPipeline > 0 && pipeline && (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-gray-400" />
              <h2 className="text-sm font-semibold text-gray-700">Pipeline</h2>
            </div>
            <span className="text-xs text-gray-400">{totalPipeline} total</span>
          </div>
          <div className="flex items-center gap-1">
            {pipeline.filter((s) => s.count > 0).map((stage) => {
              const colors = pipelineColorMap[stage.color] || pipelineColorMap.gray
              const pct = Math.max((stage.count / totalPipeline) * 100, 8)
              return (
                <div key={stage.name} className="group relative" style={{ width: `${pct}%` }}>
                  <div className={`h-2.5 rounded-full ${colors.fill} transition-all duration-300 group-hover:h-3`} />
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none">
                    <div className="whitespace-nowrap rounded-lg bg-gray-900 px-2.5 py-1 text-xs font-medium text-white shadow-lg">
                      {stage.name}: {stage.count}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1">
            {pipeline.filter((s) => s.count > 0).map((stage) => {
              const colors = pipelineColorMap[stage.color] || pipelineColorMap.gray
              return (
                <div key={stage.name} className="flex items-center gap-1.5 text-xs">
                  <div className={`h-2 w-2 rounded-full ${colors.fill}`} />
                  <span className="text-gray-500">{stage.name}</span>
                  <span className={`font-semibold ${colors.text}`}>{stage.count}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── KPI Cards ── */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-gray-400" />
          <h2 className="text-sm font-semibold text-gray-700">Overview</h2>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-8">
          {metricCards.map((card, index) => {
            const Icon = card.icon
            const value = metrics?.[card.key] ?? 0
            const isOverdueCard = card.key === 'overdueActions' && value > 0
            return (
              <button
                key={card.key}
                onClick={() => navigate('/applications')}
                className={`group relative flex flex-col rounded-xl border bg-white p-4 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${card.border} ${card.hoverBg} ${isOverdueCard ? 'ring-2 ring-red-200 ring-offset-1' : ''}`}
                style={{ animationDelay: `${index * 50}ms`, animation: 'slideUp 0.35s ease-out both' }}
              >
                {isOverdueCard && (
                  <span className="absolute -right-1 -top-1 flex h-3 w-3">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500" />
                  </span>
                )}
                <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-xl ${card.bg} transition-transform duration-200 group-hover:scale-110`}>
                  <Icon className={`h-4 w-4 ${card.color}`} />
                </div>
                <p className={`text-2xl font-bold leading-none ${card.num}`}>{value}</p>
                <p className="mt-1 text-xs font-medium text-gray-500">{card.label}</p>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── What should I do today? ── */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 shadow-sm shadow-orange-500/20">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-900">What should I do today?</h2>
              <p className="text-xs text-gray-400">Your priority tasks and follow-ups</p>
            </div>
          </div>
          {(todayActions?.length ?? 0) > 0 && (
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${overdueCount > 0 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
              {todayActions!.length} task{todayActions!.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        <div className="p-5">
          {!todayActions?.length ? (
            <div className="flex flex-col items-center py-6 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-50 to-green-50">
                <Sparkles className="h-6 w-6 text-emerald-500" />
              </div>
              <p className="mt-3 text-sm font-semibold text-gray-900">You're all caught up!</p>
              <p className="mt-1 max-w-xs text-xs text-gray-500">No overdue or due-today tasks. Add actions to your applications to stay on top of your job search.</p>
              <Link
                to="/applications"
                className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-200"
              >
                View Applications <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {todayActions.map((action) => (
                <ActionItem
                  key={action.id}
                  action={action}
                  onComplete={handleComplete}
                  isCompleting={completeMutation.isPending}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Interviews + Activity Grid ── */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Upcoming Interviews */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-shadow duration-300 hover:shadow-md">
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
            <div className="flex items-center gap-2">
              {interviewCount > 0 && (
                <span className="rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-semibold text-violet-700">
                  {interviewCount}
                </span>
              )}
            </div>
          </div>
          <div className="px-5 py-3">
            {!interviews?.length ? (
              <div className="flex flex-col items-center py-8 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50">
                  <CalendarDays className="h-6 w-6 text-violet-400" />
                </div>
                <p className="mt-3 text-sm font-semibold text-gray-700">No interviews scheduled</p>
                <p className="mt-1 max-w-xs text-xs text-gray-400">Schedule interviews from an application's detail page. They'll show up here automatically.</p>
                <Link
                  to="/applications"
                  className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-violet-50 px-3 py-1.5 text-xs font-medium text-violet-700 transition-colors hover:bg-violet-100"
                >
                  <Plus className="h-3 w-3" /> Go to Applications
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {interviews.map((interview) => (
                  <Link
                    key={interview.id}
                    to={`/applications/${interview.application_id}`}
                    className="flex items-center gap-3 py-3 -mx-2 rounded-lg px-2 transition-colors duration-150 hover:bg-violet-50/50"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-100">
                      <Video className="h-4 w-4 text-violet-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-900">
                        {interview.application?.company}
                      </p>
                      <p className="text-xs text-gray-500">{interview.stage} · {interview.application?.role}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <span className="rounded-lg bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
                        {formatDateTime(interview.interview_at)}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-shadow duration-300 hover:shadow-md">
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
            <Link to="/applications" className="group inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 transition-colors hover:text-indigo-500">
              View all <ArrowRight className="h-3 w-3 transition-transform duration-150 group-hover:translate-x-0.5" />
            </Link>
          </div>
          <div className="px-5 py-3">
            {!activities?.length ? (
              <div className="flex flex-col items-center py-8 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50">
                  <Activity className="h-6 w-6 text-indigo-400" />
                </div>
                <p className="mt-3 text-sm font-semibold text-gray-700">No recent activity</p>
                <p className="mt-1 text-xs text-gray-400">Activity shows up as you track applications</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {activities.slice(0, 6).map((activity) => {
                  const evt = eventIcons[activity.event_type] || { icon: <Activity className="h-3.5 w-3.5 text-gray-400" />, bg: 'bg-gray-50' }
                  return (
                    <div key={activity.id} className="flex items-start gap-3 py-3 -mx-2 rounded-lg px-2 transition-colors duration-150 hover:bg-gray-50/80">
                      <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${evt.bg}`}>
                        {evt.icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-gray-700">
                          <span className="font-medium text-gray-900">{activity.application?.company}</span>
                          <span className="text-gray-300"> · </span>
                          {activity.description}
                        </p>
                        <p className="mt-0.5 text-xs text-gray-400">{formatDateTime(activity.created_at)}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Quick Start (when no data) ── */}
      {!hasData && (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50/50 p-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/25">
            <Rocket className="h-7 w-7 text-white" />
          </div>
          <h3 className="mt-4 text-lg font-bold text-gray-900">Ready to launch your job search?</h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
            Add your first application to start tracking companies, scheduling interviews, and managing your entire pipeline.
          </p>
          <button
            onClick={() => navigate('/applications/new')}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/25 transition-all hover:bg-indigo-700 hover:shadow-lg active:scale-95"
          >
            <Plus className="h-4 w-4" /> Add Your First Application
          </button>
        </div>
      )}
    </div>
  )
}
