import { useState, type FormEvent } from 'react'
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
import { mapStringsToOptions } from '@/lib/select-options'
import { Plus, Trash2, Video, Calendar } from 'lucide-react'

const STAGES = ['Phone Screen', 'Technical', 'Behavioral', 'On-site', 'Final', 'Other']
const FORMATS = ['Phone', 'Video', 'In-person', 'Take-home', 'Other']
const OUTCOMES = ['Pending', 'Passed', 'Failed', 'Cancelled']

const outcomeColors: Record<string, string> = {
  Pending: 'yellow',
  Passed: 'green',
  Failed: 'red',
  Cancelled: 'gray',
}

interface InterviewsPanelProps {
  applicationId: string
}

export function InterviewsPanel({ applicationId }: InterviewsPanelProps) {
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

  const resetForm = () => { setStage(''); setInterviewAt(''); setFormat(''); setInterviewerName(''); setOutcome(''); setNotes(''); setShowForm(false) }

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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500">
            <Video className="h-4 w-4 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Interviews</h3>
          {interviews?.length ? (
            <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700">{interviews.length}</span>
          ) : null}
        </div>
        <Button size="sm" onClick={() => setShowForm(true)}><Plus className="h-4 w-4" /> Add</Button>
      </div>

      {!interviews?.length ? (
        <EmptyState icon={<Video className="h-10 w-10" />} title="No interviews yet" description="Log interviews as they are scheduled" />
      ) : (
        <div className="space-y-2">
          {interviews.map((interview) => (
            <div key={interview.id} className="group rounded-xl border border-gray-200 bg-white p-4 transition-all hover:shadow-sm hover:border-indigo-200">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50">
                  <Calendar className="h-4.5 w-4.5 text-indigo-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900">{interview.stage}</span>
                    {interview.format && <Badge color="blue">{interview.format}</Badge>}
                    {interview.outcome && <Badge color={outcomeColors[interview.outcome] || 'gray'}>{interview.outcome}</Badge>}
                  </div>
                  <p className="mt-1 text-xs text-gray-500">{formatDateTime(interview.interview_at)}</p>
                  {interview.interviewer_name && <p className="text-xs text-gray-500">with <span className="font-medium text-gray-700">{interview.interviewer_name}</span></p>}
                  {interview.notes && <p className="mt-1.5 text-xs text-gray-500 leading-relaxed">{interview.notes}</p>}
                </div>
                <button onClick={() => setDeleteId(interview.id)} className="shrink-0 rounded-lg p-1.5 text-gray-400 opacity-0 transition-all group-hover:opacity-100 hover:bg-red-50 hover:text-red-600">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
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

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Delete Interview" description="Are you sure you want to delete this interview?" loading={deleteMutation.isPending} />
    </div>
  )
}