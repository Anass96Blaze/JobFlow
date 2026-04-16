import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useApplications, useDeleteApplication } from './use-applications'
import { useStatuses, usePriorities, useSources } from '@/hooks/use-reference-data'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { ErrorState } from '@/components/ui/error-state'
import { PageLoader } from '@/components/ui/spinner'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { formatDate, getStatusColor, getPriorityColor } from '@/lib/utils'
import { Plus, Search, Briefcase, Trash2, Pencil, Eye, ChevronUp, ChevronDown, Filter, X } from 'lucide-react'

type SortField = 'date_added' | 'company' | 'date_applied'

export function ApplicationsListPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [sourceFilter, setSourceFilter] = useState('')
  const [sortBy, setSortBy] = useState<SortField>('date_added')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [deleteId, setDeleteId] = useState<string | null>(null)

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

  if (isLoading) return <PageLoader />
  if (error) return <ErrorState message={error.message} onRetry={refetch} />

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortBy !== field) return <ChevronDown className="h-3 w-3 text-gray-400" />
    return sortDir === 'asc'
      ? <ChevronUp className="h-3 w-3 text-indigo-600" />
      : <ChevronDown className="h-3 w-3 text-indigo-600" />
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Applications</h1>
          <p className="mt-1 text-sm text-gray-500">
            Tracking {applications?.length ?? 0}{' '}
            {applications?.length !== 1 ? 'active opportunities' : 'active opportunity'}.
          </p>
        </div>
        <Button onClick={() => navigate('/applications/new')} className="shrink-0">
          <Plus className="h-4 w-4" /> New Application
        </Button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
        <div className="flex items-center gap-3 flex-1 min-w-[240px]">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search companies, roles, or locations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5">
            <Filter className="h-3.5 w-3.5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-xs font-medium text-gray-600 focus:outline-none cursor-pointer"
            >
              <option value="">All Status</option>
              {statuses.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white px-3 py-1.5">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-transparent text-xs font-medium text-gray-600 focus:outline-none cursor-pointer"
            >
              <option value="">All Priorities</option>
              {priorities.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>

          <div className="hidden rounded-lg border border-gray-200 bg-white px-3 py-1.5 md:block">
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="bg-transparent text-xs font-medium text-gray-600 focus:outline-none cursor-pointer"
            >
              <option value="">All Sources</option>
              {sources.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-100"
            >
              <X className="h-3 w-3" /> Clear
            </button>
          )}
        </div>
      </div>

      {!applications?.length ? (
        <EmptyState
          icon={<Briefcase className="h-10 w-10" />}
          title="No applications found"
          description={hasActiveFilters ? 'No applications match your current filters. Try adjusting your search criteria.' : 'Start tracking your job applications to stay organized.'}
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
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="px-6 py-4 text-left">
                    <button
                      onClick={() => toggleSort('company')}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500 hover:text-gray-700"
                    >
                      Company & Role <SortIcon field="company" />
                    </button>
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Status</th>
                  <th className="hidden px-4 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 sm:table-cell">Priority</th>
                  <th className="hidden px-4 py-4 text-left md:table-cell">
                    <button
                      onClick={() => toggleSort('date_added')}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500 hover:text-gray-700"
                    >
                      Added <SortIcon field="date_added" />
                    </button>
                  </th>
                  <th className="hidden px-4 py-4 text-left lg:table-cell">
                    <button
                      onClick={() => toggleSort('date_applied')}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500 hover:text-gray-700"
                    >
                      Applied <SortIcon field="date_applied" />
                    </button>
                  </th>
                  <th className="px-4 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {applications.map((app) => (
                  <tr key={app.id} className="group transition-colors hover:bg-gray-50/50 cursor-pointer">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50">
                          <Briefcase className="h-4 w-4 text-indigo-600" />
                        </div>
                        <div>
                          <Link
                            to={`/applications/${app.id}`}
                            className="font-semibold text-gray-900 hover:text-indigo-600 transition-colors"
                          >
                            {app.company}
                          </Link>
                          <p className="text-sm text-gray-500">{app.role}</p>
                          {app.location && (
                            <p className="text-xs text-gray-400">{app.location}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4">
                      {app.status && <Badge color={getStatusColor(app.status.name)}>{app.status.name}</Badge>}
                    </td>
                    <td className="hidden whitespace-nowrap px-4 py-4 sm:table-cell">
                      {app.priority && <Badge color={getPriorityColor(app.priority.name)}>{app.priority.name}</Badge>}
                    </td>
                    <td className="hidden whitespace-nowrap px-4 py-4 text-sm text-gray-500 md:table-cell">
                      {formatDate(app.date_added)}
                    </td>
                    <td className="hidden whitespace-nowrap px-4 py-4 text-sm text-gray-500 lg:table-cell">
                      {app.date_applied ? formatDate(app.date_applied) : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4">
                      <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
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
                ))}
              </tbody>
            </table>
          </div>

          <div className="border-t border-gray-100 bg-gray-50/50 px-6 py-3">
            <p className="text-sm text-gray-500">
              Showing <span className="font-semibold text-gray-900">{applications.length}</span> {applications.length !== 1 ? 'applications' : 'application'}
            </p>
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
