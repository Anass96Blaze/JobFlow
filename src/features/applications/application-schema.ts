import { z } from 'zod'

export const applicationSchema = z.object({
  company: z.string().min(1, 'Company is required'),
  role: z.string().min(1, 'Role is required'),
  location: z.string().optional().default(''),
  job_link: z.string().url('Must be a valid URL').optional().or(z.literal('')).default(''),
  date_added: z.string().min(1, 'Date added is required'),
  date_applied: z.string().optional().default(''),
  source_id: z.string().optional().default(''),
  status_id: z.string().min(1, 'Status is required'),
  priority_id: z.string().optional().default(''),
  fit_score: z.preprocess(
    (val) => (val === '' || val === undefined || val === null || val === 'undefined' ? null : Number(val)),
    z.number().min(0).max(100).nullable()
  ),
  cv_version: z.string().optional().default(''),
  cover_letter_required: z.boolean().default(false),
  salary_range: z.string().optional().default(''),
  notes: z.string().optional().default(''),
})

export type ApplicationFormValues = z.infer<typeof applicationSchema>