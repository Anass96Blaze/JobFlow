import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Status, Priority, Source, ActionType } from '@/types/database'

export function useStatuses() {
  return useQuery<Status[]>({
    queryKey: ['statuses'],
    queryFn: async () => {
      const { data, error } = await supabase.from('statuses').select('*').order('sort_order')
      if (error) throw error
      return data
    },
    staleTime: 1000 * 60 * 30,
  })
}

export function usePriorities() {
  return useQuery<Priority[]>({
    queryKey: ['priorities'],
    queryFn: async () => {
      const { data, error } = await supabase.from('priorities').select('*').order('sort_order')
      if (error) throw error
      return data
    },
    staleTime: 1000 * 60 * 30,
  })
}

export function useSources() {
  return useQuery<Source[]>({
    queryKey: ['sources'],
    queryFn: async () => {
      const { data, error } = await supabase.from('sources').select('*').order('sort_order')
      if (error) throw error
      return data
    },
    staleTime: 1000 * 60 * 30,
  })
}

export function useActionTypes() {
  return useQuery<ActionType[]>({
    queryKey: ['action_types'],
    queryFn: async () => {
      const { data, error } = await supabase.from('action_types').select('*').order('sort_order')
      if (error) throw error
      return data
    },
    staleTime: 1000 * 60 * 30,
  })
}