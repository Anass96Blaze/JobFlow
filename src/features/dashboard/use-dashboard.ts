import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

interface DashboardMetrics {
  totalTracked: number
  applied: number
  interviewing: number
  offers: number
  rejected: number
  highPriority: number
  dueThisWeek: number
  overdueActions: number
}

export function useDashboardMetrics() {
  return useQuery<DashboardMetrics>({
    queryKey: ['dashboard-metrics'],
    queryFn: async () => {
      const { data: apps, error: appsErr } = await supabase
        .from('applications')
        .select('id, status:statuses(name), priority:priorities(name)')
      if (appsErr) throw appsErr

      const now = new Date()
      const weekEnd = new Date(now)
      weekEnd.setDate(weekEnd.getDate() + 7)

      const { data: actions, error: actionsErr } = await supabase
        .from('actions')
        .select('id, due_date, completed')
        .eq('completed', false)
      if (actionsErr) throw actionsErr

      const totalTracked = apps?.length ?? 0

      type AppRow = { id: string; status: { name: string } | null; priority: { name: string } | null }
      const typedApps = (apps ?? []) as AppRow[]

      const applied = typedApps.filter((a) => a.status?.name?.toLowerCase() === 'applied').length
      const interviewing = typedApps.filter((a) => ['interview', 'final interview', 'hr screening'].includes(a.status?.name?.toLowerCase() ?? '')).length
      const offers = typedApps.filter((a) => a.status?.name?.toLowerCase() === 'offer').length
      const rejected = typedApps.filter((a) => a.status?.name?.toLowerCase() === 'rejected').length
      const highPriority = typedApps.filter((a) => a.priority?.name?.toLowerCase() === 'high').length

      type ActionRow = { id: string; due_date: string | null; completed: boolean }
      const typedActions = (actions ?? []) as ActionRow[]

      const dueThisWeek = typedActions.filter((a) => {
        if (!a.due_date) return false
        const d = new Date(a.due_date)
        return d >= now && d <= weekEnd
      }).length

      const overdueActions = typedActions.filter((a) => {
        if (!a.due_date) return false
        return new Date(a.due_date) < now
      }).length

      return { totalTracked, applied, interviewing, offers, rejected, highPriority, dueThisWeek, overdueActions }
    },
  })
}

interface UpcomingInterview {
  id: string
  stage: string
  interview_at: string
  application: { company: string; role: string } | null
}

interface RecentActivityItem {
  id: string
  description: string
  created_at: string
  application: { company: string } | null
}

export function useUpcomingInterviews() {
  return useQuery<UpcomingInterview[]>({
    queryKey: ['upcoming-interviews'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('interviews')
        .select('id, stage, interview_at, application:applications(company, role)')
        .gte('interview_at', new Date().toISOString())
        .order('interview_at', { ascending: true })
        .limit(5)
      if (error) throw error
      return data as unknown as UpcomingInterview[]
    },
  })
}

export function useRecentActivity() {
  return useQuery<RecentActivityItem[]>({
    queryKey: ['recent-activity'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('activity_log')
        .select('id, description, created_at, application:applications(company)')
        .order('created_at', { ascending: false })
        .limit(10)
      if (error) throw error
      return data as unknown as RecentActivityItem[]
    },
  })
}