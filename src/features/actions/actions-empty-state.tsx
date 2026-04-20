import { ClipboardList, Plus, Target, Phone, Briefcase, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ActionsEmptyStateProps {
  onAdd: () => void
}

/**
 * Inviting first-run state for a blank Actions tab.
 *
 *  - Layered gradient tile with a soft glow — signals "this is your
 *    command center, not just a list".
 *  - Inspirational chips hint at job-search-specific action types.
 *  - Primary CTA is high-contrast.
 */
const INSPIRATION = [
  { icon: Phone,     text: 'Follow up with recruiter' },
  { icon: Briefcase, text: 'Tailor resume to JD' },
  { icon: Target,    text: 'Prep for HR screen' },
  { icon: Mail,      text: 'Send thank-you email' },
]

export function ActionsEmptyState({ onAdd }: ActionsEmptyStateProps) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-dashed border-gray-200 bg-gradient-to-br from-white via-gray-50/40 to-white px-6 py-10 text-center animate-fade-in"
    >
      {/* Soft ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-12 left-1/2 h-48 w-[420px] -translate-x-1/2 opacity-60"
        style={{
          background:
            'radial-gradient(300px 140px at 50% 50%, rgba(99,102,241,0.12), rgba(139,92,246,0.06), transparent 70%)',
        }}
      />

      {/* Icon tile */}
      <div className="relative mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-[0_10px_30px_-8px_rgba(99,102,241,0.55)] ring-1 ring-white/10">
        <ClipboardList className="h-[22px] w-[22px]" />
        {/* orbiting dot for a subtle premium touch */}
        <span className="absolute -right-1 -top-1 inline-flex h-2.5 w-2.5 rounded-full bg-amber-400 ring-2 ring-white">
          <span className="absolute inline-flex h-full w-full animate-soft-ping rounded-full bg-amber-400 opacity-60" />
        </span>
      </div>

      <h3 className="relative text-[16px] font-semibold tracking-[-0.01em] text-gray-900">
        No actions yet
      </h3>
      <p className="relative mx-auto mt-1.5 max-w-sm text-[13px] leading-relaxed text-gray-500">
        Add follow-ups and tasks to stay on track with this opportunity.
      </p>

      {/* Inspiration chips */}
      <div className="relative mt-5 flex flex-wrap items-center justify-center gap-1.5">
        {INSPIRATION.map((chip) => {
          const Icon = chip.icon
          return (
            <span
              key={chip.text}
              className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-2.5 py-1 text-[11px] font-medium text-gray-600 shadow-[0_1px_2px_rgba(16,24,40,0.04)]"
            >
              <Icon className="h-3 w-3 text-indigo-500" />
              {chip.text}
            </span>
          )
        })}
      </div>

      <div className="relative mt-6">
        <Button size="sm" onClick={onAdd}>
          <Plus className="h-4 w-4" /> Add your first action
        </Button>
      </div>
    </div>
  )
}
