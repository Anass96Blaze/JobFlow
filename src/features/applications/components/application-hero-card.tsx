import { Link } from 'react-router-dom'
import {
  ArrowLeft, Pencil, Trash2, ExternalLink, MapPin, Calendar,
  DollarSign, Star, FileText, Building2,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn, formatDate, getStatusColor, getPriorityColor } from '@/lib/utils'
import type { ApplicationWithRelations } from '@/types/database'
import { InsightBadgeRow, type Insight } from './insight-badge-row'

interface ApplicationHeroCardProps {
  app: ApplicationWithRelations
  insights: Insight[]
  onDelete: () => void
}

function getInitials(company: string) {
  return company
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
}

function MetaItem({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="text-gray-400">{icon}</span>
      <span>{children}</span>
    </span>
  )
}

/**
 * Top-of-page identity card.
 *
 * Visual tiers (top → bottom):
 *  0. Thin gradient spine (1px) — restrained premium accent.
 *  1. Breadcrumb row.
 *  2. Identity: avatar, company, role, meta row, primary CTAs.
 *  3. Status/priority/source/fit signal badges on a soft divider.
 *  4. Smart insights row.
 *  5. Long-form notes block.
 */
export function ApplicationHeroCard({ app, insights, onDelete }: ApplicationHeroCardProps) {
  const initials = getInitials(app.company)

  return (
    <section
      className={cn(
        'relative overflow-hidden rounded-[20px] border border-gray-200/80 bg-white',
        'shadow-[0_1px_2px_rgba(16,24,40,0.04),0_1px_3px_rgba(16,24,40,0.06)]',
        'transition-shadow duration-300 hover:shadow-[0_4px_12px_rgba(16,24,40,0.06),0_2px_4px_rgba(16,24,40,0.04)]',
      )}
    >
      {/* Soft radial highlight — barely-there premium feel */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 right-0 h-48 w-[420px] opacity-[0.55]"
        style={{
          background: 'radial-gradient(600px 200px at 80% 20%, rgba(99,102,241,0.12), rgba(139,92,246,0.06), transparent 70%)',
        }}
      />
      <div className="h-[3px] bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500" />

      <div className="relative p-6 sm:p-7">
        {/* Breadcrumb */}
        <div className="mb-5 flex items-center justify-between">
          <Link
            to="/applications"
            className="group -ml-2 inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.06em] text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
          >
            <ArrowLeft className="h-3 w-3 transition-transform duration-200 group-hover:-translate-x-0.5" />
            All Applications
          </Link>
          <span className="hidden items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-gray-400 sm:inline-flex">
            <Building2 className="h-3 w-3" />
            Opportunity workspace
          </span>
        </div>

        {/* Tier 1: Identity + CTAs */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <div
              className={cn(
                'flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl',
                'bg-gradient-to-br from-indigo-500 to-violet-600 text-[17px] font-bold text-white',
                'shadow-[0_6px_18px_-4px_rgba(99,102,241,0.55)] ring-1 ring-white/10',
                'transition-transform duration-300 hover:-translate-y-0.5 hover:rotate-2',
              )}
            >
              {initials}
            </div>
            <div className="min-w-0">
              <h1 className="text-[22px] font-semibold leading-tight tracking-[-0.015em] text-gray-900">
                {app.company}
              </h1>
              <p className="mt-0.5 text-[15px] leading-snug text-gray-600">{app.role}</p>
              <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12.5px] text-gray-500">
                {app.location   && <MetaItem icon={<MapPin className="h-3.5 w-3.5" />}>{app.location}</MetaItem>}
                <MetaItem icon={<Calendar className="h-3.5 w-3.5" />}>Added {formatDate(app.date_added)}</MetaItem>
                {app.date_applied && <MetaItem icon={<Calendar className="h-3.5 w-3.5" />}>Applied {formatDate(app.date_applied)}</MetaItem>}
                {app.salary_range && <MetaItem icon={<DollarSign className="h-3.5 w-3.5" />}>{app.salary_range}</MetaItem>}
              </div>
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2">
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
            <Button variant="danger" size="sm" onClick={onDelete}>
              <Trash2 className="h-4 w-4" /> Delete
            </Button>
          </div>
        </div>

        {/* Tier 2: Signal badges */}
        <div className="mt-5 flex flex-wrap items-center gap-1.5 border-t border-gray-100 pt-4">
          {app.status   && <Badge color={getStatusColor(app.status.name)} variant="solid">{app.status.name}</Badge>}
          {app.priority && <Badge color={getPriorityColor(app.priority.name)}>{app.priority.name}</Badge>}
          {app.source   && <Badge color="gray">{app.source.name}</Badge>}
          {app.fit_score !== null && app.fit_score !== undefined && (
            <Badge color="indigo">
              <Star className="h-3 w-3" /> Fit {app.fit_score}%
            </Badge>
          )}
          {app.cover_letter_required && (
            <Badge color="orange">
              <FileText className="h-3 w-3" /> Cover Letter
            </Badge>
          )}
          {app.cv_version && <Badge color="teal">CV · {app.cv_version}</Badge>}
        </div>

        {/* Tier 3: Insights */}
        {insights.length > 0 && (
          <div className="mt-4">
            <InsightBadgeRow insights={insights} />
          </div>
        )}

        {/* Tier 4: Notes */}
        {app.notes && (
          <div className="mt-5 rounded-xl border border-gray-100 bg-gray-50/60 px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-gray-400">
              Notes
            </p>
            <p className="mt-1 whitespace-pre-wrap text-[13.5px] leading-relaxed text-gray-600">
              {app.notes}
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
