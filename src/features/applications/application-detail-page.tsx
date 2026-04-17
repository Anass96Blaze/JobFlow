import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useApplication, useDeleteApplication } from './use-applications'
import { ActionsPanel } from '@/features/actions/actions-panel'
import { InterviewsPanel } from '@/features/interviews/interviews-panel'
import { NotesPanel } from '@/features/notes/notes-panel'
import { ActivityTimeline } from '@/features/activity/activity-timeline'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { PageLoader } from '@/components/ui/spinner'
import { ErrorState } from '@/components/ui/error-state'
import { formatDate, getStatusColor, getPriorityColor } from '@/lib/utils'
import {
  ArrowLeft, Pencil, Trash2, ExternalLink, MapPin, Calendar,
  DollarSign, ClipboardList, MessageSquare, Clock, Activity,
  Star, FileText,
} from 'lucide-react'

const tabs = [
  { key: 'Actions'    as const, icon: ClipboardList, label: 'Actions' },
  { key: 'Interviews' as const, icon: Clock,         label: 'Interviews' },
  { key: 'Notes'      as const, icon: MessageSquare, label: 'Notes' },
  { key: 'Activity'   as const, icon: Activity,      label: 'Activity' },
]
type Tab = (typeof tabs)[number]['key']

export function ApplicationDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: app, isLoading, error } = useApplication(id)
  const deleteMutation = useDeleteApplication()
  const [activeTab, setActiveTab] = useState<Tab>('Actions')
  const [showDelete, setShowDelete] = useState(false)

  const handleDelete = async () => {
    if (!id) return
    await deleteMutation.mutateAsync(id)
    navigate('/applications')
  }

  if (isLoading) return <PageLoader />
  if (error || !app) return <ErrorState message="Application not found" />

  const initials = app.company
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center gap-2">
        <Link
          to="/applications"
          className="group flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-gray-500 transition-all hover:bg-gray-100 hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5" /> Back to Applications
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-shadow duration-300 hover:shadow-md">
        <div className="h-2 bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500" />

        <div className="p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-lg font-bold text-white shadow-md shadow-indigo-500/20 transition-transform duration-300 hover:scale-105 hover:rotate-3">
                {initials}
              </div>
              <div className="min-w-0">
                <h1 className="text-xl font-bold text-gray-900">{app.company}</h1>
                <p className="mt-0.5 text-base text-gray-600">{app.role}</p>
                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-400">
                  {app.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />{app.location}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />Added {formatDate(app.date_added)}
                  </span>
                  {app.date_applied && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />Applied {formatDate(app.date_applied)}
                    </span>
                  )}
                  {app.salary_range && (
                    <span className="flex items-center gap-1">
                      <DollarSign className="h-3.5 w-3.5" />{app.salary_range}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              {app.job_link && (
                <a href={app.job_link} target="_blank" rel="noopener noreferrer">
                  <Button variant="secondary" size="sm">
                    <ExternalLink className="h-4 w-4" /> Job Post
                  </Button>
                </a>
              )}
              <Link to={`/applications/${app.id}/edit`}>
                <Button variant="secondary" size="sm">
                  <Pencil className="h-4 w-4" /> Edit
                </Button>
              </Link>
              <Button variant="danger" size="sm" onClick={() => setShowDelete(true)}>
                <Trash2 className="h-4 w-4" /> Delete
              </Button>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-gray-100 pt-4">
            {app.status && <Badge color={getStatusColor(app.status.name)}>{app.status.name}</Badge>}
            {app.priority && <Badge color={getPriorityColor(app.priority.name)}>{app.priority.name}</Badge>}
            {app.source && <Badge color="gray">{app.source.name}</Badge>}
            {app.fit_score !== null && app.fit_score !== undefined && (
              <Badge color="indigo">
                <Star className="h-3 w-3" /> Fit: {app.fit_score}%
              </Badge>
            )}
            {app.cover_letter_required && (
              <Badge color="orange">
                <FileText className="h-3 w-3" /> Cover Letter Required
              </Badge>
            )}
            {app.cv_version && <Badge color="teal">CV: {app.cv_version}</Badge>}
          </div>

          {app.notes && (
            <div className="mt-4 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Notes</p>
              <p className="mt-1 text-sm leading-relaxed text-gray-600">{app.notes}</p>
            </div>
          )}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center gap-1 border-b border-gray-100 px-4 py-2.5 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const active = activeTab === tab.key
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`relative flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  active
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-sm shadow-indigo-500/25'
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                }`}
              >
                <Icon className={`h-3.5 w-3.5 transition-transform duration-200 ${active ? 'scale-110' : ''}`} />
                {tab.label}
              </button>
            )
          })}
        </div>

        <div className="p-5 animate-fade-in" key={activeTab}>
          {activeTab === 'Actions'    && <ActionsPanel applicationId={app.id} />}
          {activeTab === 'Interviews' && <InterviewsPanel applicationId={app.id} />}
          {activeTab === 'Notes'      && <NotesPanel applicationId={app.id} />}
          {activeTab === 'Activity'   && <ActivityTimeline applicationId={app.id} />}
        </div>
      </div>

      <ConfirmDialog
        open={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
        title="Delete Application"
        description="This will permanently delete this application and all associated data. This action cannot be undone."
        loading={deleteMutation.isPending}
      />
    </div>
  )
}
