import { useState } from 'react'
import { useNotes, useCreateNote, useDeleteNote } from './use-notes'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { EmptyState } from '@/components/ui/empty-state'
import { PageLoader } from '@/components/ui/spinner'
import { formatDateTime } from '@/lib/utils'
import { Trash2, StickyNote, Send } from 'lucide-react'

interface NotesPanelProps {
  applicationId: string
}

export function NotesPanel({ applicationId }: NotesPanelProps) {
  const { data: notes, isLoading } = useNotes(applicationId)
  const createMutation = useCreateNote()
  const deleteMutation = useDeleteNote()
  const [content, setContent] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return
    await createMutation.mutateAsync({ application_id: applicationId, content: content.trim() })
    setContent('')
  }

  const handleDelete = async () => {
    if (!deleteId) return
    await deleteMutation.mutateAsync({ id: deleteId, application_id: applicationId })
    setDeleteId(null)
  }

  if (isLoading) return <PageLoader />

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500">
          <StickyNote className="h-4 w-4 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Notes</h3>
        {notes?.length ? (
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">{notes.length}</span>
        ) : null}
      </div>

      <form onSubmit={handleCreate} className="rounded-xl border border-gray-200 bg-gray-50/50 p-3">
        <Textarea id="new-note" placeholder="Write a note..." value={content} onChange={(e) => setContent(e.target.value)} className="border-0 bg-transparent shadow-none focus:ring-0" />
        <div className="mt-2 flex justify-end">
          <Button size="sm" type="submit" loading={createMutation.isPending} disabled={!content.trim()}>
            <Send className="h-3.5 w-3.5" /> Add Note
          </Button>
        </div>
      </form>

      {!notes?.length ? (
        <EmptyState icon={<StickyNote className="h-10 w-10" />} title="No notes yet" description="Add notes to keep track of important details" />
      ) : (
        <div className="space-y-2">
          {notes.map((note) => (
            <div key={note.id} className="group rounded-xl border border-gray-200 bg-white p-4 transition-all hover:shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <p className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">{note.content}</p>
                <button onClick={() => setDeleteId(note.id)} className="shrink-0 rounded-lg p-1.5 text-gray-400 opacity-0 transition-all group-hover:opacity-100 hover:bg-red-50 hover:text-red-600">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-2 text-xs text-gray-400">{formatDateTime(note.created_at)}</p>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Delete Note" description="Are you sure you want to delete this note?" loading={deleteMutation.isPending} />
    </div>
  )
}