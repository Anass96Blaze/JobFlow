import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { ApplicationNote, InsertTables } from '@/types/database'

export function useNotes(applicationId: string | undefined) {
  return useQuery<ApplicationNote[]>({
    queryKey: ['notes', applicationId],
    enabled: !!applicationId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('application_notes')
        .select('*')
        .eq('application_id', applicationId!)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },
  })
}

export function useCreateNote() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (values: InsertTables<'application_notes'>) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      const { data, error } = await supabase.from('application_notes').insert({ ...values, user_id: user.id } as never).select().single()
      if (error) throw error
      return data as ApplicationNote
    },
    onSuccess: (_d, v) => { qc.invalidateQueries({ queryKey: ['notes', v.application_id] }) },
  })
}

export function useDeleteNote() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id }: { id: string; application_id: string }) => {
      const { error } = await supabase.from('application_notes').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: (_d, v) => { qc.invalidateQueries({ queryKey: ['notes', v.application_id] }) },
  })
}
