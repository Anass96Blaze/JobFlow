import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useApplications, useDeleteApplication } from './use-applications'
import type { ApplicationWithRelations } from '@/types/database'
import { useStatuses, usePriorities, useSources } from '@/hooks/use-reference-data'
import { mapStatusesToOptions, mapPrioritiesToOptions, mapSourcesToOptions } from '@/lib/select-options'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { ErrorState } from '@/components/ui/error-state'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { FilterSelect } from '@/components/ui/app-select'
import { formatDate, getStatusColor, getPriorityColor } from '@/lib/utils'
import {
  Plus, Search, Briefcase, Trash2, Pencil, Eye,
  ChevronUp, ChevronDown, Filter, X,
  LayoutList, Columns3, Star,
} from 'lucide-react'

type SortField = 'date_added' | 'company' | 'date_applied'
type ViewMode = 'table' | 'kanban'

const KANBAN_STAGES = [
  { key: 'to apply',        label: 'To Apply',        color: 'gray'   },
  { key: 'applied',         label: 'Applied',         color: 'blue'   },
  { key: 'hr screening',    label: 'Screening',       color: 'yellow' },
  { key: 'interview',       label: 'Interview',       color: 'violet' },
  { key: 'final interview', label: 'Final Interview',  color: 'indigo' },
  { key: 'offer',           label: 'Offer',           color: 'emerald'},
  { key: 'rejected',        label: 'Rejected',        color: 'rose'   },
]

const stageHeaderColors: Record<string, string> = {
  gray:    'bg-gray-100 text-gray-700',
  blue:    'bg-blue-100 text-blue-700',
  yellow:  'bg-amber-100 text-amber-700',
  violet:  'bg-violet-100 text-violet-700',
  indigo:  'bg-indigo-100 text-indigo-700',
  emerald: 'bg-emerald-100 text-emerald-700',
  rose:    'bg-rose-100 text-rose-700',
}

function getSortIcon(sortBy: SortField, sortDir: 'asc' | 'desc', field: SortField) {
  if (sortBy !== field) return <ChevronDown className="h-3 w-3 text-gray-400" />
  return sortDir === 'asc'
    ? <ChevronUp className="h-3 w-3 text-indigo-600" />
    : <ChevronDown className="h-3 w-3 text-indigo-600" />
}

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <tr key={i} className="border-b border-gray-100">
          <td className="px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gray-100 animate-pulse" />
              <div className="space-y-2">
                <div className="h-4 w-28 rounded bg-gray-100 animate-pulse" />
                <div className="h-3 w-20 rounded bg-gray-100 animate-pulse" />
              </div>
            </div>
          </td>
          <td className="px-4 py-4"><div className="h-5 w-20 rounded-full bg-gray-100 animate-pulse" /></td>
          <td className="hidden px-4 py-4 sm:table-cell"><div className="h-5 w-16 rounded-full bg-gray-100 animate-pulse" /></td>
          <td className="hidden px-4 py-4 xl:table-cell"><div className="h-5 w-14 rounded-full bg-gray-100 animate-pulse" /></td>
          <td className="hidden px-4 py-4 md:table-cell"><div className="h-4 w-20 rounded bg-gray-100 animate-pulse" /></td>
          <td className="px-4 py-4"><div className="ml-auto h-7 w-7 rounded-lg bg-gray-100 animate-pulse" /></td>
        </tr>
      ))}
    </>
  )
}

function FitScore({ score }: { score: number | null | undefined }) {
  if (score === null || score === undefined) return <span className="text-xs text-gray-300">—</span>
  const cls =
    score >= 80 ? 'bg-emerald-50 text-emerald-700'
    : score >= 50 ? 'bg-amber-50 text-amber-700'
    : 'bg-red-50 text-red-700'
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${cls}`}>
      <Star className="h-3 w-3" />{score}%
    </span>
  )
}


function KanbanCard({
  app,
}: {
  app: ApplicationWithRelations
}) {
  const navigate = useNavigate()
  return (
    <div
      onClick={() => navigate(`/applications/${app.id}`)}
      className="group cursor-pointer rounded-xl border border-gray-200 bg-white p-3 shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-gray-900">{app.company}</p>
          <p className="truncate text-xs text-gray-500">{app.role}</p>
        </div>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        {app.priority && (
          <Badge color={getPriorityColor(app.priority.name)}>{app.priority.name}</Badge>
        )}
        <FitScore score={app.fit_score} />
      </div>
      {app.date_applied && (
        <p className="mt-1.5 text-xs text-gray-400">Applied {formatDate(app.date_applied)}</p>
      )}
    </div>
  )
}

export function ApplicationsListPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [sourceFilter, setSourceFilter] = useState('')
  const [sortBy, setSortBy] = useState<SortField>('date_added')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('table')

  const { data: statuses = [] } = useStatuses()
  const { data: priorities = [] } = usePriorities()
  const { data: sources = [] } = useSources()

  const { data: applications, isLoading, error, refetch } = useApplications({
    search: search || undefined,
    status_id: statusFilter || undefined,
    priority_id: priorityFilter || undefined,
    source_id: sourceFilter || undefined,
    sort_by: sortBy,
    sort_dir: sortDir,
  })



  const deleteMutation = useDeleteApplication()

  const toggleSort = (field: SortField) => {
    if (sortBy === field) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortBy(field); setSortDir('desc') }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    await deleteMutation.mutateAsync(deleteId)
    setDeleteId(null)
  }

  const hasActiveFilters = !!(statusFilter || priorityFilter || sourceFilter)
  const clearFilters = () => {
    setStatusFilter('')
    setPriorityFilter('')
    setSourceFilter('')
  }

  if (error) return <ErrorState message={error.message} onRetry={refetch} />

  const kanbanGroups = KANBAN_STAGES.map((stage) => ({
    ...stage,
    apps: (applications ?? []).filter(
      (a) => (a.status?.name?.toLowerCase() ?? '') === stage.key
    ),
  }))

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Applications</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            {isLoading
              ? 'Loading…'
              : `${applications?.length ?? 0} ${(applications?.length ?? 0) !== 1 ? 'opportunities' : 'opportunity'} tracked`}
          </p>
        </div>
        <Button onClick={() => navigate('/applications/new')} className="shrink-0">
          <Plus className="h-4 w-4" /> New Application
        </Button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
        <div className="relative min-w-[200px] flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search companies, roles, locations…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-10 pr-8 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <FilterSelect
            placeholder="All Status"
            options={mapStatusesToOptions(statuses)}
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v === '__all__' ? '' : v)}
            icon={<Filter className="h-3.5 w-3.5" />}
          />
          <FilterSelect
            placeholder="All Priorities"
            options={mapPrioritiesToOptions(priorities)}
            value={priorityFilter}
            onValueChange={(v) => setPriorityFilter(v === '__all__' ? '' : v)}
          />
          <div className="hidden md:block">
            <FilterSelect
              placeholder="All Sources"
              options={mapSourcesToOptions(sources)}
              value={sourceFilter}
              onValueChange={(v) => setSourceFilter(v === '__all__' ? '' : v)}
            />
          </div>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-100"
            >
              <X className="h-3 w-3" /> Clear filters
            </button>
          )}

          <div className="ml-1 flex items-center rounded-lg border border-gray-200 bg-gray-50 p-0.5">
            <button
              onClick={() => setViewMode('table')}
              className={`rounded-md p-1.5 transition-colors ${
                viewMode === 'table' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-400 hover:text-gray-600'
              }`}
              title="Table view"
            >
              <LayoutList className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`rounded-md p-1.5 transition-colors ${
                viewMode === 'kanban' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-400 hover:text-gray-600'
              }`}
              title="Kanban view"
            >
              <Columns3 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'table' ? (
        !isLoading && !applications?.length ? (
          <EmptyState
            icon={<Briefcase className="h-10 w-10" />}
            title="No applications found"
            description={
              hasActiveFilters
                ? 'No applications match your filters. Try adjusting your search.'
                : 'Start tracking your job applications to stay organized and increase your chances.'
            }
            action={
              !hasActiveFilters
                ? <Button onClick={() => navigate('/applications/new')}><Plus className="h-4 w-4" /> Add your first application</Button>
                : <Button variant="secondary" onClick={clearFilters}><X className="h-4 w-4" /> Clear all filters</Button>
            }
          />
        ) : (
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/60">
                    <th className="px-6 py-3.5 text-left">
                      <button
                        onClick={() => toggleSort('company')}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500 hover:text-gray-700"
                      >
                        Company & Role {getSortIcon(sortBy, sortDir, 'company')}
                      </button>
                    </th>
                    <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Status</th>
                    <th className="hidden px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 sm:table-cell">Priority</th>
                    <th className="hidden px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 xl:table-cell">Fit</th>
                    <th className="hidden px-4 py-3.5 text-left md:table-cell">
                      <button
                        onClick={() => toggleSort('date_applied')}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500 hover:text-gray-700"
                      >
                        Applied {getSortIcon(sortBy, sortDir, 'date_applied')}
                      </button>
                    </th>
                    <th className="px-4 py-3.5 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {isLoading ? (
                    <SkeletonRows />
                  ) : (
                    (applications ?? []).map((app) => (
                        <tr
                          key={app.id}
                          onClick={() => navigate(`/applications/${app.id}`)}
                          className="group cursor-pointer transition-colors duration-100 hover:bg-gray-50/50"
                        >
                          <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 transition-all duration-150 group-hover:bg-indigo-100 group-hover:shadow-sm">
                                <Briefcase className="h-4 w-4 text-indigo-600" />
                              </div>
                              <div>
                                <Link
                                  to={`/applications/${app.id}`}
                                  className="font-semibold text-gray-900 transition-colors hover:text-indigo-600"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {app.company}
                                </Link>
                                <p className="text-sm text-gray-500">{app.role}</p>
                                {app.location && <p className="text-xs text-gray-400">{app.location}</p>}
                              </div>
                            </div>
                          </td>

                          <td className="whitespace-nowrap px-4 py-4">
                            {app.status && (
                              <Badge color={getStatusColor(app.status.name)}>{app.status.name}</Badge>
                            )}
                          </td>

                          <td className="hidden whitespace-nowrap px-4 py-4 sm:table-cell">
                            {app.priority && (
                              <Badge color={getPriorityColor(app.priority.name)}>{app.priority.name}</Badge>
                            )}
                          </td>

                          <td className="hidden whitespace-nowrap px-4 py-4 xl:table-cell">
                            <FitScore score={app.fit_score} />
                          </td>

                          <td className="hidden whitespace-nowrap px-4 py-4 text-sm text-gray-500 md:table-cell">
                            {app.date_applied ? formatDate(app.date_applied) : <span className="text-gray-300">—</span>}
                          </td>

                          <td className="whitespace-nowrap px-4 py-4">
                            <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100" onClick={(e) => e.stopPropagation()}>
                              <Link
                                to={`/applications/${app.id}`}
                                className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-indigo-50 hover:text-indigo-600"
                                title="View"
                              >
                                <Eye className="h-4 w-4" />
                              </Link>
                              <Link
                                to={`/applications/${app.id}/edit`}
                                className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-indigo-50 hover:text-indigo-600"
                                title="Edit"
                              >
                                <Pencil className="h-4 w-4" />
                              </Link>
                              <button
                                onClick={() => setDeleteId(app.id)}
                                className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {!isLoading && (applications?.length ?? 0) > 0 && (
              <div className="border-t border-gray-100 bg-gray-50/50 px-6 py-3">
                <p className="text-sm text-gray-500">
                  Showing{' '}
                  <span className="font-semibold text-gray-900">{applications!.length}</span>{' '}
                  {applications!.length !== 1 ? 'applications' : 'application'}
                </p>
              </div>
            )}
          </div>
        )
      ) : (
        <div className="-mx-1 overflow-x-auto pb-4">
          <div className="flex gap-3 px-1" style={{ minWidth: 'max-content' }}>
            {kanbanGroups.map((col) => {
              const headerCls = stageHeaderColors[col.color] || stageHeaderColors.gray
              return (
                <div key={col.key} className="flex w-[240px] flex-col gap-2">
                  <div className={`flex items-center justify-between rounded-lg px-3 py-2 ${headerCls}`}>
                    <span className="text-xs font-semibold">{col.label}</span>
                    <span className="rounded-full bg-white/60 px-2 py-0.5 text-xs font-bold">{col.apps.length}</span>
                  </div>

                  <div className="flex flex-col gap-2">
                    {col.apps.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-gray-200 py-6 text-center">
                        <p className="text-xs text-gray-400">No applications</p>
                      </div>
                    ) : (
                      col.apps.map((app) => (
                        <KanbanCard
                          key={app.id}
                          app={app}
                        />
                      ))
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Application"
        description="This will permanently delete this application and all associated data. This action cannot be undone."
        loading={deleteMutation.isPending}
      />
    </div>
  )
}
