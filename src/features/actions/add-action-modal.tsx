import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AppSelect } from '@/components/ui/app-select'
import { Textarea } from '@/components/ui/textarea'
import { Modal } from '@/components/ui/modal'
import { mapActionTypesToOptions } from '@/lib/reference'
import { Sparkles } from 'lucide-react'
import type { Action, ActionType } from '@/types/database'

export interface ActionFormValues {
  action_type_id: string
  title: string
  due_date: string
  notes: string
}

interface AddActionModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (values: ActionFormValues) => Promise<void> | void
  actionTypes: ActionType[]
  /** When provided → edit mode. When null/undefined → create mode with smart defaults. */
  editing?: Action | null
  loading?: boolean
}

/** "Follow Up" is the canonical default for job search. */
const DEFAULT_TYPE_MATCH = /follow.?up/i

/** Today + N days in YYYY-MM-DD (local). */
function todayPlus(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function initialValues(editing: Action | null | undefined, actionTypes: ActionType[]): ActionFormValues {
  if (editing) {
    return {
      action_type_id: editing.action_type_id,
      title: editing.title,
      due_date: editing.due_date ?? '',
      notes: editing.notes ?? '',
    }
  }
  const followUp = actionTypes.find((t) => DEFAULT_TYPE_MATCH.test(t.name))
  return {
    action_type_id: followUp?.id ?? actionTypes[0]?.id ?? '',
    title: '',
    due_date: todayPlus(3), // "Follow up in 3 days" — proven sweet spot.
    notes: '',
  }
}

/**
 * Internal form. Mounted fresh on every open (via the `key` on
 * AddActionModal) so defaults are recomputed each time and state
 * is never stale — no setState-in-effect needed.
 */
function ActionForm({
  editing,
  actionTypes,
  loading,
  onSubmit,
  onClose,
}: Pick<AddActionModalProps, 'editing' | 'actionTypes' | 'loading' | 'onSubmit' | 'onClose'>) {
  const [values, setValues] = useState<ActionFormValues>(() => initialValues(editing, actionTypes))
  const isEditing = !!editing

  const set = <K extends keyof ActionFormValues>(k: K, v: ActionFormValues[K]) =>
    setValues((prev) => ({ ...prev, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(values)
  }

  const datePresets = [
    { label: 'Today',     value: todayPlus(0) },
    { label: 'Tomorrow',  value: todayPlus(1) },
    { label: 'In 3 days', value: todayPlus(3) },
    { label: 'Next week', value: todayPlus(7) },
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!isEditing && (
        <div className="flex items-start gap-2 rounded-xl border border-indigo-100 bg-indigo-50/50 px-3 py-2 text-[12px] text-indigo-800">
          <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>
            We pre-filled <span className="font-semibold">Follow Up</span> in 3 days — tweak anything or hit save.
          </span>
        </div>
      )}

      <Input
        id="action-title"
        label="Title"
        placeholder="e.g. Follow up with recruiter"
        value={values.title}
        onChange={(e) => set('title', e.target.value)}
        required
        autoFocus
      />

      <AppSelect
        label="Type"
        placeholder="Select type"
        options={mapActionTypesToOptions(actionTypes)}
        value={values.action_type_id}
        onValueChange={(v) => set('action_type_id', v)}
        required
      />

      <div className="space-y-2">
        <Input
          id="action-due"
          label="Due date"
          type="date"
          value={values.due_date}
          onChange={(e) => set('due_date', e.target.value)}
        />
        <div className="flex flex-wrap gap-1.5">
          {datePresets.map((p) => {
            const active = values.due_date === p.value
            return (
              <button
                key={p.label}
                type="button"
                onClick={() => set('due_date', p.value)}
                className={
                  'rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset transition-colors ' +
                  (active
                    ? 'bg-indigo-600 text-white ring-indigo-600'
                    : 'bg-white text-gray-600 ring-gray-200 hover:bg-gray-50 hover:text-gray-800')
                }
              >
                {p.label}
              </button>
            )
          })}
        </div>
      </div>

      <Textarea
        id="action-notes"
        label="Notes (optional)"
        placeholder="Context, questions to ask, links…"
        value={values.notes}
        onChange={(e) => set('notes', e.target.value)}
      />

      <div className="flex justify-end gap-3 pt-1">
        <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
        <Button type="submit" loading={loading}>
          {isEditing ? 'Save changes' : 'Add Action'}
        </Button>
      </div>
    </form>
  )
}

/**
 * Create / edit a single action. Smart defaults applied in create mode:
 *  - type = "Follow Up"
 *  - due date = today + 3 days
 * These reduce friction and match real-world job-search best practice.
 *
 * The form is remounted on every open via `key` so state is always fresh
 * — avoids useEffect-based prop sync entirely.
 */
export function AddActionModal({
  open,
  onClose,
  onSubmit,
  actionTypes,
  editing,
  loading,
}: AddActionModalProps) {
  if (!open) return <Modal open={false} onClose={onClose} title="New Action"><></></Modal>
  return (
    <Modal open onClose={onClose} title={editing ? 'Edit Action' : 'New Action'}>
      <ActionForm
        key={editing?.id ?? 'create'}
        editing={editing}
        actionTypes={actionTypes}
        loading={loading}
        onSubmit={onSubmit}
        onClose={onClose}
      />
    </Modal>
  )
}
