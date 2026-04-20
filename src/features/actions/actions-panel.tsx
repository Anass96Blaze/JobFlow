import { forwardRef, useImperativeHandle, useMemo, useState } from 'react'
import { useActions, useCreateAction, useUpdateAction, useDeleteAction } from './use-actions'
import { useActionTypes } from '@/hooks/use-reference-data'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { PageLoader } from '@/components/ui/spinner'
import type { Action } from '@/types/database'

import { getUrgency } from './urgency'
import { ActionsHeader } from './actions-header'
import { ActionsList } from './actions-list'
import { AddActionModal, type ActionFormValues } from './add-action-modal'
import { ActionsEmptyState } from './actions-empty-state'

export interface ActionsPanelHandle {
  openAddForm: () => void
}

interface ActionsPanelProps {
  applicationId: string
}

/**
 * Actions tab — a job-search-specific task manager.
 *
 * Composition:
 *   ActionsHeader    — progress bar, overdue badge, Add CTA
 *   ActionsList      — groups cards by urgency (Overdue / Today & soon / Upcoming / No due / Completed)
 *   AddActionModal   — smart defaults (Follow Up, +3 days), used for both create & edit
 *
 * Empty / loading states are handled here.
 */
export const ActionsPanel = forwardRef<ActionsPanelHandle, ActionsPanelProps>(
  function ActionsPanel({ applicationId }, ref) {
    const { data: actions, isLoading } = useActions(applicationId)
    const { data: actionTypes = [] } = useActionTypes()
    const createMutation = useCreateAction()
    const updateMutation = useUpdateAction()
    const deleteMutation = useDeleteAction()

    const [showForm, setShowForm] = useState(false)
    const [editing, setEditing] = useState<Action | null>(null)
    const [deleteId, setDeleteId] = useState<string | null>(null)

    useImperativeHandle(ref, () => ({
      openAddForm: () => { setEditing(null); setShowForm(true) },
    }), [])

    const openCreate = () => { setEditing(null); setShowForm(true) }
    const openEdit   = (a: Action) => { setEditing(a); setShowForm(true) }
    const closeForm  = () => { setShowForm(false); setEditing(null) }

    const { total, completedCount, overdueCount } = useMemo(() => {
      const list = actions ?? []
      let done = 0
      let overdue = 0
      for (const a of list) {
        if (a.completed) done += 1
        else if (getUrgency(a) === 'overdue') overdue += 1
      }
      return { total: list.length, completedCount: done, overdueCount: overdue }
    }, [actions])

    const handleSubmit = async (values: ActionFormValues) => {
      if (editing) {
        await updateMutation.mutateAsync({
          id: editing.id,
          application_id: applicationId,
          action_type_id: values.action_type_id,
          title: values.title,
          due_date: values.due_date || null,
          notes: values.notes || null,
        })
      } else {
        await createMutation.mutateAsync({
          application_id: applicationId,
          action_type_id: values.action_type_id,
          title: values.title,
          due_date: values.due_date || null,
          completed: false,
          completed_at: null,
          notes: values.notes || null,
        })
      }
      closeForm()
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
      <div className="space-y-5 animate-fade-in">
        <ActionsHeader
          total={total}
          completed={completedCount}
          overdue={overdueCount}
          onAdd={openCreate}
        />

        {total === 0 ? (
          <ActionsEmptyState onAdd={openCreate} />
        ) : (
          <ActionsList
            actions={actions ?? []}
            actionTypes={actionTypes}
            onToggleComplete={toggleComplete}
            onEdit={openEdit}
            onDelete={setDeleteId}
          />
        )}

        <AddActionModal
          open={showForm}
          onClose={closeForm}
          onSubmit={handleSubmit}
          actionTypes={actionTypes}
          editing={editing}
          loading={createMutation.isPending || updateMutation.isPending}
        />

        <ConfirmDialog
          open={!!deleteId}
          onClose={() => setDeleteId(null)}
          onConfirm={handleDelete}
          title="Delete Action"
          description="Are you sure you want to delete this action?"
          loading={deleteMutation.isPending}
        />
      </div>
    )
  },
)
