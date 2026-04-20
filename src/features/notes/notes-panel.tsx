import { forwardRef, useImperativeHandle, useRef, useState } from 'react'
import { useNotes, useCreateNote, useDeleteNote } from './use-notes'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { EmptyState } from '@/components/ui/empty-state'
import { PageLoader } from '@/components/ui/spinner'
import { formatDateTime } from '@/lib/utils'
import { Trash2, StickyNote, Send } from 'lucide-react'
import type { ApplicationNote } from '@/types/database'

export interface NotesPanelHandle {
  focusComposer: () => void
}

interface NotesPanelProps {
  applicationId: string
}

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime()
  const now = Date.now()
  const diffMs = now - then
  const min = Math.floor(diffMs / 60000)
  if (min < 1) return 'Just now'
  if (min < 60) return `${min}m ago`
  const h = Math.floor(min / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  if (d < 7) return `${d}d ago`
  return formatDateTime(iso)
}

function NoteItem({ note, onDelete }: { note: ApplicationNote; onDelete: (id: string) => void }) {
  return (
    <div className="group relative rounded-xl border border-gray-200 bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition-all duration-200 hover:-translate-y-px hover:border-indigo-200 hover:shadow-[0_4px_10px_rgba(16,24,40,0.06)]">
      <div className="flex items-start justify-between gap-3">
        <p className="whitespace-pre-wrap text-[13.5px] leading-relaxed text-gray-700">{note.content}</p>
        <button
          onClick={() => onDelete(note.id)}
          className="shrink-0 rounded-lg p-1.5 text-gray-400 opacity-0 transition-all duration-150 group-hover:opacity-100 hover:bg-red-50 hover:text-red-600 focus-visible:opacity-100"
          aria-label="Delete note"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
      <div className="mt-2 flex items-center gap-1.5 text-[11px] text-gray-400">
        <span className="h-1 w-1 rounded-full bg-gray-300" />
        <span title={formatDateTime(note.created_at)}>{relativeTime(note.created_at)}</span>
        {note.updated_at && note.updated_at !== note.created_at && (
          <span className="italic text-gray-300">· edited</span>
        )}
      </div>
    </div>
  )
}

export const NotesPanel = forwardRef<NotesPanelHandle, NotesPanelProps>(
  function NotesPanel({ applicationId }, ref) {
    const { data: notes, isLoading } = useNotes(applicationId)
    const createMutation = useCreateNote()
    const deleteMutation = useDeleteNote()
    const [content, setContent] = useState('')
    const [deleteId, setDeleteId] = useState<string | null>(null)
    const composerRef = useRef<HTMLTextAreaElement>(null)

    useImperativeHandle(ref, () => ({
      focusComposer: () => composerRef.current?.focus(),
    }), [])

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
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-[0_4px_10px_-2px_rgba(16,185,129,0.4)] ring-1 ring-white/10">
            <StickyNote className="h-[17px] w-[17px] text-white" />
          </div>
          <div>
            <h3 className="text-[15px] font-semibold tracking-[-0.01em] text-gray-900">Notes</h3>
            {notes?.length ? (
              <p className="text-[11.5px] text-gray-500">{notes.length} {notes.length === 1 ? 'note' : 'notes'}</p>
            ) : null}
          </div>
        </div>

        <form
          onSubmit={handleCreate}
          className="rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50/80 to-white p-3 transition-colors focus-within:border-indigo-300 focus-within:ring-2 focus-within:ring-indigo-500/10"
        >
          <Textarea
            id="new-note"
            ref={composerRef}
            placeholder="Write a note — recruiter chat, salary feedback, thoughts…"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="border-0 bg-transparent shadow-none focus:ring-0"
          />
          <div className="mt-2 flex items-center justify-between">
            <p className="text-[11px] text-gray-400">
              {content.length > 0 ? `${content.length} chars` : 'Tip: capture small observations early.'}
            </p>
            <Button size="sm" type="submit" loading={createMutation.isPending} disabled={!content.trim()}>
              <Send className="h-3.5 w-3.5" /> Add note
            </Button>
          </div>
        </form>

        {!notes?.length ? (
          <EmptyState
            compact
            icon={<StickyNote className="h-6 w-6" />}
            title="No notes yet"
            description="Notes are your private log — what the recruiter said, salary hints, red flags, prep ideas."
          />
        ) : (
          <div className="relative space-y-2 border-l border-gray-100 pl-4">
            {notes.map((note) => (
              <div key={note.id} className="relative">
                <span className="absolute -left-[21px] top-4 h-2 w-2 rounded-full bg-emerald-400 ring-4 ring-emerald-50" />
                <NoteItem note={note} onDelete={setDeleteId} />
              </div>
            ))}
          </div>
        )}

        <ConfirmDialog
          open={!!deleteId}
          onClose={() => setDeleteId(null)}
          onConfirm={handleDelete}
          title="Delete Note"
          description="Are you sure you want to delete this note?"
          loading={deleteMutation.isPending}
        />
      </div>
    )
  },
)
