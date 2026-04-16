import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Interview, InsertTables } from '@/types/database'

export function useInterviews(applicationId: string | undefined) {
  return useQuery<Interview[]>({
    queryKey: ['interviews', applicationId],
    enabled: !!applicationId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('interviews')
        .select('*')
        .eq('application_id', applicationId!)
        .order('interview_at', { ascending: true })
      if (error) throw error
      return data
    },
  })
}

export function useCreateInterview() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (values: InsertTables<'interviews'>) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      const { data, error } = await supabase.from('interviews').insert({ ...values, user_id: user.id } as never).select().single()
      if (error) throw error
      return data as Interview
    },
    onSuccess: (_d, v) => { qc.invalidateQueries({ queryKey: ['interviews', v.application_id] }) },
  })
}

export function useDeleteInterview() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, application_id: _appId }: { id: string; application_id: string }) => {
      const { error } = await supabase.from('interviews').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: (_d, v) => { qc.invalidateQueries({ queryKey: ['interviews', v.application_id] }) },
  })
}
