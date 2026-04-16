import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { applicationSchema, type ApplicationFormValues } from './application-schema'
import { useStatuses, usePriorities, useSources } from '@/hooks/use-reference-data'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Building2, MapPin, Link2, Tag, Flag, Globe, Calendar, Target, FileText, DollarSign, StickyNote } from 'lucide-react'

interface ApplicationFormProps {
  defaultValues?: Partial<ApplicationFormValues>
  onSubmit: (values: ApplicationFormValues) => void
  loading?: boolean
  submitLabel?: string
}

export function ApplicationForm({ defaultValues, onSubmit, loading, submitLabel = 'Save' }: ApplicationFormProps) {
  const { data: statuses = [] } = useStatuses()
  const { data: priorities = [] } = usePriorities()
  const { data: sources = [] } = useSources()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      company: '',
      role: '',
      location: '',
      job_link: '',
      date_added: new Date().toISOString().split('T')[0],
      date_applied: '',
      source_id: '',
      status_id: '',
      priority_id: '',
      fit_score: null as number | null,
      cv_version: '',
      cover_letter_required: false,
      salary_range: '',
      notes: '',
      ...defaultValues,
    },
  })

  const errorCount = Object.keys(errors).length

  return (
    <form onSubmit={handleSubmit((data) => onSubmit(data as ApplicationFormValues))} className="space-y-8">
      {errorCount > 0 && (
        <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <div className="mt-0.5 h-4 w-4 shrink-0 rounded-full bg-red-500 flex items-center justify-center">
            <span className="text-[9px] font-bold text-white">!</span>
          </div>
          <p className="text-sm text-red-700">
            Please fix {errorCount} {errorCount === 1 ? 'error' : 'errors'} below before submitting.
          </p>
        </div>
      )}

      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50">
            <Building2 className="h-3.5 w-3.5 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Basic Information</h3>
            <p className="text-xs text-gray-400">Company and position details</p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input id="company" label="Company" error={errors.company?.message} {...register('company')} placeholder="e.g. Google" />
          <Input id="role" label="Role" error={errors.role?.message} {...register('role')} placeholder="e.g. Frontend Developer" />
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input id="location" label="Location" error={errors.location?.message} {...register('location')} placeholder="e.g. Remote, New York" />
          <Input id="job_link" label="Job Link" error={errors.job_link?.message} {...register('job_link')} placeholder="https://..." />
        </div>
      </div>

      <hr className="border-gray-100" />

      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-50">
            <Tag className="h-3.5 w-3.5 text-violet-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Status & Classification</h3>
            <p className="text-xs text-gray-400">Track your application pipeline</p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Select
            id="status_id"
            label="Status"
            error={errors.status_id?.message}
            options={statuses.map((s) => ({ value: s.id, label: s.name }))}
            placeholder="Select status"
            {...register('status_id')}
          />
          <Select
            id="priority_id"
            label="Priority"
            error={errors.priority_id?.message}
            options={priorities.map((p) => ({ value: p.id, label: p.name }))}
            placeholder="Select priority"
            {...register('priority_id')}
          />
          <Select
            id="source_id"
            label="Source"
            error={errors.source_id?.message}
            options={sources.map((s) => ({ value: s.id, label: s.name }))}
            placeholder="Select source"
            {...register('source_id')}
          />
        </div>
      </div>

      <hr className="border-gray-100" />

      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50">
            <Calendar className="h-3.5 w-3.5 text-amber-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Dates & Scoring</h3>
            <p className="text-xs text-gray-400">Timeline and fit assessment</p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Input id="date_added" label="Date Added" type="date" error={errors.date_added?.message} {...register('date_added')} />
          <Input id="date_applied" label="Date Applied" type="date" error={errors.date_applied?.message} {...register('date_applied')} />
          <Input id="fit_score" label="Fit Score (0-100)" type="number" error={errors.fit_score?.message} {...register('fit_score')} placeholder="e.g. 85" />
        </div>
      </div>

      <hr className="border-gray-100" />

      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50">
            <FileText className="h-3.5 w-3.5 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Additional Details</h3>
            <p className="text-xs text-gray-400">CV, salary, and notes</p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input id="cv_version" label="CV Version" error={errors.cv_version?.message} {...register('cv_version')} placeholder="e.g. v2-frontend" />
          <Input id="salary_range" label="Salary Range" error={errors.salary_range?.message} {...register('salary_range')} placeholder="e.g. $80k-$100k" />
        </div>

        <div className="mt-4 flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
          <input type="checkbox" id="cover_letter_required" className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" {...register('cover_letter_required')} />
          <label htmlFor="cover_letter_required" className="text-sm font-medium text-gray-700">Cover letter required</label>
        </div>

        <div className="mt-4">
          <Textarea id="notes" label="Notes" {...register('notes')} placeholder="Any additional notes about this application..." />
        </div>
      </div>

      <div className="flex justify-end gap-3 border-t border-gray-100 pt-5">
        <Button type="submit" loading={loading}>{submitLabel}</Button>
      </div>
    </form>
  )
}
