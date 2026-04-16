import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Application, ApplicationWithRelations, InsertTables, UpdateTables } from '@/types/database'

interface ApplicationFilters {
  search?: string
  status_id?: string
  priority_id?: string
  source_id?: string
  sort_by?: 'date_added' | 'company' | 'date_applied'
  sort_dir?: 'asc' | 'desc'
}

export function useApplications(filters: ApplicationFilters = {}) {
  return useQuery<ApplicationWithRelations[]>({
    queryKey: ['applications', filters],
    queryFn: async () => {
      let query = supabase
        .from('applications')
        .select('*, status:statuses(*), priority:priorities(*), source:sources(*)')

      if (filters.search) {
        query = query.or(`company.ilike.%${filters.search}%,role.ilike.%${filters.search}%`)
      }
      if (filters.status_id) query = query.eq('status_id', filters.status_id)
      if (filters.priority_id) query = query.eq('priority_id', filters.priority_id)
      if (filters.source_id) query = query.eq('source_id', filters.source_id)

      const sortBy = filters.sort_by || 'date_added'
      const sortDir = filters.sort_dir || 'desc'
      query = query.order(sortBy, { ascending: sortDir === 'asc' })

      const { data, error } = await query
      if (error) throw error
      return data as ApplicationWithRelations[]
    },
  })
}

export function useApplication(id: string | undefined) {
  return useQuery<ApplicationWithRelations>({
    queryKey: ['applications', id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('applications')
        .select('*, status:statuses(*), priority:priorities(*), source:sources(*)')
        .eq('id', id!)
        .single()
      if (error) throw error
      return data as ApplicationWithRelations
    },
  })
}

export function useCreateApplication() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (values: InsertTables<'applications'>) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      const { data, error } = await supabase
        .from('applications')
        .insert({ ...values, user_id: user.id } as never)
        .select()
        .single()
      if (error) throw error
      return data as Application
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['applications'] })
    },
  })
}

export function useUpdateApplication() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...values }: UpdateTables<'applications'> & { id: string }) => {
      const { data, error } = await supabase.from('applications').update(values as never).eq('id', id).select().single()
      if (error) throw error
      return data as Application
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['applications'] })
      qc.invalidateQueries({ queryKey: ['applications', variables.id] })
    },
  })
}

export function useDeleteApplication() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('applications').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['applications'] })
    },
  })
}
