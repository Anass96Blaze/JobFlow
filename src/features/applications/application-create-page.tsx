import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useCreateApplication } from './use-applications'
import { ApplicationForm } from './application-form'
import type { ApplicationFormValues } from './application-schema'
import { ArrowLeft, Plus } from 'lucide-react'

export function ApplicationCreatePage() {
  const navigate = useNavigate()
  const mutation = useCreateApplication()
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (values: ApplicationFormValues) => {
    setError(null)
    try {
      const payload = {
        ...values,
        location: values.location || null,
        job_link: values.job_link || null,
        date_applied: values.date_applied || null,
        source_id: values.source_id || null,
        priority_id: values.priority_id || null,
        fit_score: values.fit_score ?? null,
        cv_version: values.cv_version || null,
        salary_range: values.salary_range || null,
        notes: values.notes || null,
      }
      const app = await mutation.mutateAsync(payload)
      navigate(`/applications/${app.id}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create application')
    }
  }

  return (
    <div className="mx-auto max-w-2xl animate-fade-in">
      <div className="mb-6 flex items-center gap-3">
        <Link
          to="/applications"
          className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
      </div>

      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-md shadow-indigo-500/20">
            <Plus className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">New Application</h1>
            <p className="text-sm text-gray-500">Add a new job application to track</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <div className="mt-0.5 h-4 w-4 shrink-0 rounded-full bg-red-500 flex items-center justify-center">
            <span className="text-[9px] font-bold text-white">!</span>
          </div>
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <ApplicationForm onSubmit={handleSubmit} loading={mutation.isPending} submitLabel="Create Application" />
      </div>
    </div>
  )
}
