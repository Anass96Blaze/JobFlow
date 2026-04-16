import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Action, InsertTables, UpdateTables } from '@/types/database'

export function useActions(applicationId: string | undefined) {
  return useQuery<Action[]>({
    queryKey: ['actions', applicationId],
    enabled: !!applicationId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('actions')
        .select('*')
        .eq('application_id', applicationId!)
        .order('due_date', { ascending: true, nullsFirst: false })
      if (error) throw error
      return data
    },
  })
}

export function useCreateAction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (values: InsertTables<'actions'>) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      const { data, error } = await supabase.from('actions').insert({ ...values, user_id: user.id } as never).select().single()
      if (error) throw error
      return data as Action
    },
    onSuccess: (_d, v) => { qc.invalidateQueries({ queryKey: ['actions', v.application_id] }) },
  })
}

export function useUpdateAction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, application_id, ...values }: UpdateTables<'actions'> & { id: string; application_id: string }) => {
      const { data, error } = await supabase.from('actions').update(values as never).eq('id', id).select().single()
      if (error) throw error
      return data as Action
    },
    onSuccess: (_d, v) => { qc.invalidateQueries({ queryKey: ['actions', v.application_id] }) },
  })
}

export function useDeleteAction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, application_id: _appId }: { id: string; application_id: string }) => {
      const { error } = await supabase.from('actions').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: (_d, v) => { qc.invalidateQueries({ queryKey: ['actions', v.application_id] }) },
  })
}
