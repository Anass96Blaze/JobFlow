import { useMemo, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ClipboardList, MessageSquare, Clock, Activity,
  AlertTriangle, CalendarClock, Sparkles, Video, StickyNote, Plus,
} from 'lucide-react'

import { useApplication, useDeleteApplication } from './use-applications'
import { useActions, useUpdateAction } from '@/features/actions/use-actions'
import { useInterviews } from '@/features/interviews/use-interviews'
import { useNotes } from '@/features/notes/use-notes'
import { useActivityLog } from '@/features/activity/use-activity'
import { useActionTypes } from '@/hooks/use-reference-data'

import { ActionsPanel, type ActionsPanelHandle } from '@/features/actions/actions-panel'
import { InterviewsPanel, type InterviewsPanelHandle } from '@/features/interviews/interviews-panel'
import { NotesPanel, type NotesPanelHandle } from '@/features/notes/notes-panel'
import { ActivityTimeline } from '@/features/activity/activity-timeline'

import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { PageLoader } from '@/components/ui/spinner'
import { ErrorState } from '@/components/ui/error-state'
import { daysFromNow } from '@/lib/utils'
import type { Action } from '@/types/database'

import { ApplicationHeroCard } from './components/application-hero-card'
import { NextActionCard } from './components/next-action-card'
import { DetailTabs, type DetailTab } from './components/detail-tabs'
import type { Insight } from './components/insight-badge-row'
import { ApplicationReminderBanner } from '@/features/notifications/application-reminder-banner'

type TabKey = 'actions' | 'interviews' | 'notes' | 'activity'

/**
 * Pick the single most relevant action for the "Next Action" callout.
 * Priority: overdue → soonest upcoming → any with no due date.
 * Ignores completed actions.
 */
function pickNextAction(actions: Action[] | undefined): Action | null {
  if (!actions?.length) return null
  const open = actions.filter((a) => !a.completed)
  if (!open.length) return null
  const withDue = open
    .filter((a) => a.due_date)
    .sort((a, b) => (a.due_date ?? '').localeCompare(b.due_date ?? ''))
  if (withDue.length) return withDue[0]
  return open[0]
}

export function ApplicationDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: app, isLoading, error } = useApplication(id)
  const { data: actions } = useActions(id)
  const { data: interviews } = useInterviews(id)
  const { data: notes } = useNotes(id)
  const { data: activities } = useActivityLog(id)
  const { data: actionTypes = [] } = useActionTypes()

  const deleteMutation = useDeleteApplication()
  const updateActionMutation = useUpdateAction()

  const [activeTab, setActiveTab] = useState<TabKey>('actions')
  const [showDelete, setShowDelete] = useState(false)

  const actionsRef    = useRef<ActionsPanelHandle>(null)
  const interviewsRef = useRef<InterviewsPanelHandle>(null)
  const notesRef      = useRef<NotesPanelHandle>(null)

  const nextAction = useMemo(() => pickNextAction(actions), [actions])

  // Smart insights — computed from live data, subtle and actionable.
  const insights: Insight[] = useMemo(() => {
    const out: Insight[] = []
    if (nextAction?.due_date) {
      const d = daysFromNow(nextAction.due_date)
      if (d !== null) {
        if (d < 0)       out.push({ id: 'act-overdue', icon: <AlertTriangle className="h-3 w-3" />, label: `Action overdue by ${Math.abs(d)}d`, tone: 'danger' })
        else if (d === 0) out.push({ id: 'act-today',   icon: <CalendarClock className="h-3 w-3" />, label: 'Action due today', tone: 'warning' })
        else if (d <= 2)  out.push({ id: 'act-soon',    icon: <CalendarClock className="h-3 w-3" />, label: `Next action in ${d}d`, tone: 'warning' })
      }
    }
    if (!interviews?.length) {
      out.push({ id: 'no-iv', icon: <Video className="h-3 w-3" />, label: 'No interview scheduled', tone: 'neutral' })
    } else {
      const upcoming = interviews.filter((iv) => new Date(iv.interview_at) > new Date()).length
      if (upcoming > 0) {
        out.push({ id: 'iv-upcoming', icon: <Video className="h-3 w-3" />, label: `${upcoming} upcoming interview${upcoming > 1 ? 's' : ''}`, tone: 'info' })
      }
    }
    if (app?.fit_score != null && app.fit_score >= 80) {
      out.push({ id: 'hot', icon: <Sparkles className="h-3 w-3" />, label: 'High potential opportunity', tone: 'success' })
    }
    if (!notes?.length) {
      out.push({ id: 'no-notes', icon: <StickyNote className="h-3 w-3" />, label: 'No notes yet', tone: 'neutral' })
    }
    return out
  }, [nextAction, interviews, notes, app])

  const tabs: DetailTab<TabKey>[] = useMemo(() => [
    { key: 'actions',    label: 'Actions',    icon: ClipboardList,  count: actions?.length ?? 0 },
    { key: 'interviews', label: 'Interviews', icon: Clock,          count: interviews?.length ?? 0 },
    { key: 'notes',      label: 'Notes',      icon: MessageSquare,  count: notes?.length ?? 0 },
    { key: 'activity',   label: 'Activity',   icon: Activity,       count: activities?.length ?? 0 },
  ], [actions, interviews, notes, activities])

  const openAddAction = () => {
    setActiveTab('actions')
    setTimeout(() => actionsRef.current?.openAddForm(), 0)
  }
  const openAddInterview = () => {
    setActiveTab('interviews')
    setTimeout(() => interviewsRef.current?.openAddForm(), 0)
  }
  const openAddNote = () => {
    setActiveTab('notes')
    setTimeout(() => notesRef.current?.focusComposer(), 50)
  }

  const handleDelete = async () => {
    if (!id) return
    await deleteMutation.mutateAsync(id)
    navigate('/applications')
  }

  const handleToggleNextAction = async (action: Action) => {
    const completed = !action.completed
    await updateActionMutation.mutateAsync({
      id: action.id,
      application_id: action.application_id,
      completed,
      completed_at: completed ? new Date().toISOString() : null,
    })
  }

  if (isLoading) return <PageLoader />
  if (error || !app) return <ErrorState message="Application not found" />

  return (
    <div className="space-y-6 animate-fade-in">
      <ApplicationReminderBanner applicationId={app.id} onFocusActions={() => setActiveTab('actions')} />
      <ApplicationHeroCard
        app={app}
        insights={insights}
        onDelete={() => setShowDelete(true)}
      />

      {/* Quick-add row + Next Action */}
      <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-stretch">
        <NextActionCard
          action={nextAction}
          actionTypes={actionTypes}
          onToggleComplete={handleToggleNextAction}
          onAddAction={openAddAction}
        />
        <div className="flex flex-wrap gap-1 rounded-2xl border border-gray-200 bg-white p-1.5 shadow-[0_1px_2px_rgba(16,24,40,0.04)] md:flex-nowrap">
          <button
            onClick={openAddAction}
            className="group inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3.5 py-2 text-[12px] font-semibold text-gray-600 transition-all hover:bg-indigo-50 hover:text-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/30 md:flex-initial"
          >
            <Plus className="h-3.5 w-3.5 transition-transform duration-200 group-hover:rotate-90" />
            Add action
          </button>
          <button
            onClick={openAddInterview}
            className="group inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3.5 py-2 text-[12px] font-semibold text-gray-600 transition-all hover:bg-indigo-50 hover:text-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/30 md:flex-initial"
          >
            <Plus className="h-3.5 w-3.5 transition-transform duration-200 group-hover:rotate-90" />
            Add interview
          </button>
          <button
            onClick={openAddNote}
            className="group inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3.5 py-2 text-[12px] font-semibold text-gray-600 transition-all hover:bg-indigo-50 hover:text-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/30 md:flex-initial"
          >
            <Plus className="h-3.5 w-3.5 transition-transform duration-200 group-hover:rotate-90" />
            Add note
          </button>
        </div>
      </div>

      {/* Tabs + content */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
        <DetailTabs tabs={tabs} active={activeTab} onChange={setActiveTab} />

        <div className="p-5 sm:p-6 animate-fade-in" key={activeTab}>
          {activeTab === 'actions'    && <ActionsPanel    ref={actionsRef}    applicationId={app.id} />}
          {activeTab === 'interviews' && <InterviewsPanel ref={interviewsRef} applicationId={app.id} />}
          {activeTab === 'notes'      && <NotesPanel      ref={notesRef}      applicationId={app.id} />}
          {activeTab === 'activity'   && <ActivityTimeline                   applicationId={app.id} />}
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
