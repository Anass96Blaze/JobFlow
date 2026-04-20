import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Notification } from '@/types/database'
import { generateNotifications } from './generator'

const NOTIFICATIONS_KEY = ['notifications'] as const

/**
 * Newest-first list of the current user's notifications, ordered
 * so that:
 *   1. Unread comes before read
 *   2. Within each section, higher priority (lower number) comes first
 *   3. Then by recency
 * RLS ensures only the signed-in user's rows are returned.
 */
export function useNotifications(limit = 30) {
  return useQuery<Notification[]>({
    queryKey: [...NOTIFICATIONS_KEY, limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('is_read', { ascending: true })
        .order('priority', { ascending: true })
        .order('created_at', { ascending: false })
        .limit(limit)
      if (error) throw error
      return data ?? []
    },
    staleTime: 30_000,
  })
}

/**
 * Lightweight unread count for the bell badge.
 * Uses HEAD + exact count so we don't pull rows we don't render.
 */
export function useUnreadCount() {
  return useQuery<number>({
    queryKey: [...NOTIFICATIONS_KEY, 'unread-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('is_read', false)
      if (error) throw error
      return count ?? 0
    },
    staleTime: 30_000,
  })
}

export function useMarkAsRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true } as never)
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: NOTIFICATIONS_KEY })
    },
  })
}

export function useMarkAllAsRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true } as never)
        .eq('is_read', false)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: NOTIFICATIONS_KEY })
    },
  })
}

export function useDeleteNotification() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('notifications').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: NOTIFICATIONS_KEY })
    },
  })
}

/**
 * Manually trigger the generator + refresh the inbox. Used by the bell
 * header "Refresh" button; the main bootstrap runs it automatically.
 */
export function useGenerateNotifications() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: generateNotifications,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: NOTIFICATIONS_KEY })
    },
  })
}

/**
 * Lightweight id → { company, role } lookup used by the grouped
 * notifications dropdown to render cluster headers. One network
 * call, cached aggressively — the full app list rarely changes.
 */
export function useApplicationLookup() {
  return useQuery<Map<string, { company: string; role: string }>>({
    queryKey: ['applications', 'lookup'],
    queryFn: async () => {
      const { data, error } = await supabase.from('applications').select('id, company, role')
      if (error) throw error
      const map = new Map<string, { company: string; role: string }>()
      for (const row of (data ?? []) as Array<{ id: string; company: string; role: string }>) {
        map.set(row.id, { company: row.company, role: row.role })
      }
      return map
    },
    staleTime: 5 * 60_000,
  })
}
