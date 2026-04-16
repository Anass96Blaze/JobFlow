import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { ActivityLog } from '@/types/database'

export function useActivityLog(applicationId: string | undefined) {
  return useQuery<ActivityLog[]>({
    queryKey: ['activity', applicationId],
    enabled: !!applicationId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('activity_log')
        .select('*')
        .eq('application_id', applicationId!)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },
  })
}
