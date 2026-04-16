import { useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useApplication, useUpdateApplication } from './use-applications'
import { ApplicationForm } from './application-form'
import type { ApplicationFormValues } from './application-schema'
import { PageLoader } from '@/components/ui/spinner'
import { ErrorState } from '@/components/ui/error-state'
import { ArrowLeft, Pencil } from 'lucide-react'

export function ApplicationEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: app, isLoading, error } = useApplication(id)
  const mutation = useUpdateApplication()
  const [submitError, setSubmitError] = useState<string | null>(null)

  const handleSubmit = async (values: ApplicationFormValues) => {
    if (!id) return
    setSubmitError(null)
    try {
      const payload = {
        id,
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
      await mutation.mutateAsync(payload)
      navigate(`/applications/${id}`)
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : 'Failed to update application')
    }
  }

  if (isLoading) return <PageLoader />
  if (error || !app) return <ErrorState message="Application not found" />

  return (
    <div className="mx-auto max-w-2xl animate-fade-in">
      <div className="mb-6 flex items-center gap-3">
        <Link
          to={`/applications/${id}`}
          className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
      </div>

      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-md shadow-indigo-500/20">
            <Pencil className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Edit Application</h1>
            <p className="text-sm text-gray-500">{app.company} — {app.role}</p>
          </div>
        </div>
      </div>

      {submitError && (
        <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <div className="mt-0.5 h-4 w-4 shrink-0 rounded-full bg-red-500 flex items-center justify-center">
            <span className="text-[9px] font-bold text-white">!</span>
          </div>
          <p className="text-sm text-red-700">{submitError}</p>
        </div>
      )}

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <ApplicationForm
          defaultValues={{
            company: app.company,
            role: app.role,
            location: app.location || '',
            job_link: app.job_link || '',
            date_added: app.date_added,
            date_applied: app.date_applied || '',
            source_id: app.source_id || '',
            status_id: app.status_id,
            priority_id: app.priority_id || '',
            fit_score: app.fit_score,
            cv_version: app.cv_version || '',
            cover_letter_required: app.cover_letter_required,
            salary_range: app.salary_range || '',
            notes: app.notes || '',
          }}
          onSubmit={handleSubmit}
          loading={mutation.isPending}
          submitLabel="Update Application"
        />
      </div>
    </div>
  )
}
