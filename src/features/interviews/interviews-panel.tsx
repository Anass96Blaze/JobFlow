import { forwardRef, useImperativeHandle, useState, type FormEvent } from 'react'
import { useInterviews, useCreateInterview, useDeleteInterview } from './use-interviews'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AppSelect } from '@/components/ui/app-select'
import { Textarea } from '@/components/ui/textarea'
import { Modal } from '@/components/ui/modal'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { EmptyState } from '@/components/ui/empty-state'
import { Badge } from '@/components/ui/badge'
import { PageLoader } from '@/components/ui/spinner'
import { formatDateTime } from '@/lib/utils'
import { mapStringsToOptions } from '@/lib/reference'
import { Plus, Trash2, Video, Calendar, User, Clock } from 'lucide-react'
import type { Interview } from '@/types/database'

const STAGES = ['Phone Screen', 'Technical', 'Behavioral', 'On-site', 'Final', 'Other']
const FORMATS = ['Phone', 'Video', 'In-person', 'Take-home', 'Other']
const OUTCOMES = ['Pending', 'Passed', 'Failed', 'Cancelled']

const outcomeColors: Record<string, string> = {
  Pending: 'yellow',
  Passed: 'green',
  Failed: 'red',
  Cancelled: 'gray',
}

export interface InterviewsPanelHandle {
  openAddForm: () => void
}

interface InterviewsPanelProps {
  applicationId: string
}

function InterviewItem({ interview, onDelete }: { interview: Interview; onDelete: (id: string) => void }) {
  const isUpcoming = new Date(interview.interview_at) > new Date() && (!interview.outcome || interview.outcome === 'Pending')

  return (
    <div className="group relative flex items-start gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition-all duration-200 hover:-translate-y-px hover:border-indigo-200 hover:shadow-[0_4px_10px_rgba(16,24,40,0.06)]">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-50 to-violet-50 ring-1 ring-indigo-100/70">
        <Calendar className="h-[17px] w-[17px] text-indigo-600" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-sm font-semibold tracking-[-0.005em] text-gray-900">{interview.stage}</span>
          {interview.format && <Badge color="blue">{interview.format}</Badge>}
          {interview.outcome && <Badge color={outcomeColors[interview.outcome] || 'gray'}>{interview.outcome}</Badge>}
          {isUpcoming && (
            <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-700 ring-1 ring-inset ring-indigo-100">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-indigo-500" />
              </span>
              Upcoming
            </span>
          )}
        </div>

        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-gray-500">
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3 text-gray-400" />
            {formatDateTime(interview.interview_at)}
          </span>
          {interview.interviewer_name && (
            <span className="inline-flex items-center gap-1">
              <User className="h-3 w-3 text-gray-400" />
              <span className="font-medium text-gray-700">{interview.interviewer_name}</span>
            </span>
          )}
        </div>

        {interview.notes && (
          <p className="mt-2.5 whitespace-pre-wrap rounded-lg border border-gray-100 bg-gray-50/60 px-3 py-2 text-[12.5px] leading-relaxed text-gray-600">
            {interview.notes}
          </p>
        )}
      </div>

      <button
        onClick={() => onDelete(interview.id)}
        className="shrink-0 rounded-lg p-1.5 text-gray-400 opacity-0 transition-all duration-150 group-hover:opacity-100 hover:bg-red-50 hover:text-red-600 focus-visible:opacity-100"
        aria-label="Delete interview"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  )
}

export const InterviewsPanel = forwardRef<InterviewsPanelHandle, InterviewsPanelProps>(
  function InterviewsPanel({ applicationId }, ref) {
    const { data: interviews, isLoading } = useInterviews(applicationId)
    const createMutation = useCreateInterview()
    const deleteMutation = useDeleteInterview()

    const [showForm, setShowForm] = useState(false)
    const [deleteId, setDeleteId] = useState<string | null>(null)
    const [stage, setStage] = useState('')
    const [interviewAt, setInterviewAt] = useState('')
    const [format, setFormat] = useState('')
    const [interviewerName, setInterviewerName] = useState('')
    const [outcome, setOutcome] = useState('')
    const [notes, setNotes] = useState('')

    useImperativeHandle(ref, () => ({ openAddForm: () => setShowForm(true) }), [])

    const resetForm = () => {
      setStage(''); setInterviewAt(''); setFormat(''); setInterviewerName('')
      setOutcome(''); setNotes(''); setShowForm(false)
    }

    const handleCreate = async (e: FormEvent) => {
      e.preventDefault()
      await createMutation.mutateAsync({
        application_id: applicationId,
        stage,
        interview_at: interviewAt,
        format: format || null,
        interviewer_name: interviewerName || null,
        outcome: outcome || null,
        notes: notes || null,
      })
      resetForm()
    }

    const handleDelete = async () => {
      if (!deleteId) return
      await deleteMutation.mutateAsync({ id: deleteId, application_id: applicationId })
      setDeleteId(null)
    }

    if (isLoading) return <PageLoader />

    return (
      <div className="space-y-4 animate-fade-in">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 shadow-[0_4px_10px_-2px_rgba(99,102,241,0.4)] ring-1 ring-white/10">
              <Video className="h-[17px] w-[17px] text-white" />
            </div>
            <div>
              <h3 className="text-[15px] font-semibold tracking-[-0.01em] text-gray-900">Interviews</h3>
              {interviews?.length ? (
                <p className="text-[11.5px] text-gray-500">{interviews.length} total</p>
              ) : null}
            </div>
          </div>
          <Button size="sm" onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4" /> Add interview
          </Button>
        </div>

        {!interviews?.length ? (
          <EmptyState
            compact
            icon={<Video className="h-6 w-6" />}
            title="No interviews scheduled"
            description="Log interviews as they are scheduled — stage, format, interviewer, and outcome."
            action={<Button size="sm" onClick={() => setShowForm(true)}><Plus className="h-4 w-4" /> Add interview</Button>}
          />
        ) : (
          <div className="space-y-2">
            {interviews.map((interview) => (
              <InterviewItem key={interview.id} interview={interview} onDelete={setDeleteId} />
            ))}
          </div>
        )}

        <Modal open={showForm} onClose={resetForm} title="Add Interview">
          <form onSubmit={handleCreate} className="space-y-4">
            <AppSelect label="Stage" placeholder="Select stage" options={mapStringsToOptions(STAGES)} value={stage} onValueChange={setStage} required />
            <Input id="interview-at" label="Date & Time" type="datetime-local" value={interviewAt} onChange={(e) => setInterviewAt(e.target.value)} required />
            <AppSelect label="Format" placeholder="Select format" options={mapStringsToOptions(FORMATS)} value={format} onValueChange={setFormat} />
            <Input id="interviewer-name" label="Interviewer Name" value={interviewerName} onChange={(e) => setInterviewerName(e.target.value)} />
            <AppSelect label="Outcome" placeholder="Select outcome" options={mapStringsToOptions(OUTCOMES)} value={outcome} onValueChange={setOutcome} />
            <Textarea id="interview-notes" label="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
            <div className="flex justify-end gap-3">
              <Button variant="secondary" type="button" onClick={resetForm}>Cancel</Button>
              <Button type="submit" loading={createMutation.isPending}>Add Interview</Button>
            </div>
          </form>
        </Modal>

        <ConfirmDialog
          open={!!deleteId}
          onClose={() => setDeleteId(null)}
          onConfirm={handleDelete}
          title="Delete Interview"
          description="Are you sure you want to delete this interview?"
          loading={deleteMutation.isPending}
        />
      </div>
    )
  },
)
