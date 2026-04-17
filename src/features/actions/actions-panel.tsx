import { useState } from 'react'
import { useActions, useCreateAction, useUpdateAction, useDeleteAction } from './use-actions'
import { useActionTypes } from '@/hooks/use-reference-data'
import { mapActionTypesToOptions } from '@/lib/select-options'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AppSelect } from '@/components/ui/app-select'
import { Textarea } from '@/components/ui/textarea'
import { Modal } from '@/components/ui/modal'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { EmptyState } from '@/components/ui/empty-state'
import { Badge } from '@/components/ui/badge'
import { PageLoader } from '@/components/ui/spinner'
import { formatDate, isOverdue } from '@/lib/utils'
import { Plus, CheckCircle2, Circle, Trash2, ClipboardList } from 'lucide-react'
import type { Action } from '@/types/database'

interface ActionsPanelProps {
  applicationId: string
}

export function ActionsPanel({ applicationId }: ActionsPanelProps) {
  const { data: actions, isLoading } = useActions(applicationId)
  const { data: actionTypes = [] } = useActionTypes()
  const createMutation = useCreateAction()
  const updateMutation = useUpdateAction()
  const deleteMutation = useDeleteAction()

  const [showForm, setShowForm] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [actionTypeId, setActionTypeId] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [notes, setNotes] = useState('')

  const resetForm = () => { setTitle(''); setActionTypeId(''); setDueDate(''); setNotes(''); setShowForm(false) }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    await createMutation.mutateAsync({
      application_id: applicationId,
      action_type_id: actionTypeId,
      title,
      due_date: dueDate || null,
      completed: false,
      completed_at: null,
      notes: notes || null,
    })
    resetForm()
  }

  const toggleComplete = async (action: Action) => {
    const completed = !action.completed
    await updateMutation.mutateAsync({
      id: action.id,
      application_id: applicationId,
      completed,
      completed_at: completed ? new Date().toISOString() : null,
    })
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
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-500">
            <ClipboardList className="h-4 w-4 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Actions</h3>
          {actions?.length ? (
            <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700">{actions.length}</span>
          ) : null}
        </div>
        <Button size="sm" onClick={() => setShowForm(true)}><Plus className="h-4 w-4" /> Add</Button>
      </div>

      {!actions?.length ? (
        <EmptyState icon={<ClipboardList className="h-10 w-10" />} title="No actions yet" description="Add follow-up actions for this application" />
      ) : (
        <div className="space-y-2">
          {actions.map((action) => {
            const overdue = !action.completed && isOverdue(action.due_date)
            const typeName = actionTypes.find((t) => t.id === action.action_type_id)?.name
            return (
              <div key={action.id} className={`group flex items-start gap-3 rounded-xl border p-3.5 transition-all hover:shadow-sm ${overdue ? 'border-red-200 bg-red-50/50' : action.completed ? 'border-gray-100 bg-gray-50/50' : 'border-gray-200 bg-white'}`}>
                <button onClick={() => toggleComplete(action)} className="mt-0.5 shrink-0 transition-transform hover:scale-110">
                  {action.completed
                    ? <CheckCircle2 className="h-5 w-5 text-green-500" />
                    : <Circle className="h-5 w-5 text-gray-300 hover:text-indigo-400" />}
                </button>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${action.completed ? 'text-gray-400 line-through' : 'text-gray-900'}`}>{action.title}</p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2">
                    {typeName && <Badge color="blue">{typeName}</Badge>}
                    {action.due_date && (
                      <span className={`text-xs ${overdue ? 'font-semibold text-red-600' : 'text-gray-500'}`}>
                        Due {formatDate(action.due_date)}
                      </span>
                    )}
                  </div>
                  {action.notes && <p className="mt-1.5 text-xs text-gray-500 leading-relaxed">{action.notes}</p>}
                </div>
                <button onClick={() => setDeleteId(action.id)} className="shrink-0 rounded-lg p-1.5 text-gray-400 opacity-0 transition-all group-hover:opacity-100 hover:bg-red-50 hover:text-red-600">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            )
          })}
        </div>
      )}

      <Modal open={showForm} onClose={resetForm} title="Add Action">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input id="action-title" label="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <AppSelect
            label="Type"
            placeholder="Select type"
            options={mapActionTypesToOptions(actionTypes)}
            value={actionTypeId}
            onValueChange={setActionTypeId}
            required
          />
          <Input id="action-due" label="Due Date" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          <Textarea id="action-notes" label="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" type="button" onClick={resetForm}>Cancel</Button>
            <Button type="submit" loading={createMutation.isPending}>Add Action</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Delete Action" description="Are you sure you want to delete this action?" loading={deleteMutation.isPending} />
    </div>
  )
}