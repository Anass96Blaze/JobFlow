import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
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
  application_id: string
  application: { company: string; role: string } | null
}

interface RecentActivityItem {
  id: string
  event_type: string
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
        .select('id, stage, interview_at, application_id, application:applications(company, role)')
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
        .select('id, event_type, description, created_at, application:applications(company)')
        .order('created_at', { ascending: false })
        .limit(10)
      if (error) throw error
      return data as unknown as RecentActivityItem[]
    },
  })
}

export interface TodayAction {
  id: string
  title: string
  due_date: string | null
  completed: boolean
  application_id: string
  company: string
  role: string
  isOverdue: boolean
  isDueToday: boolean
}

export function useTodayActions() {
  return useQuery<TodayAction[]>({
    queryKey: ['today-actions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('actions')
        .select('id, title, due_date, completed, application_id, application:applications(company, role)')
        .eq('completed', false)
        .not('due_date', 'is', null)
        .order('due_date', { ascending: true })
        .limit(20)
      if (error) throw error

      const now = new Date()
      const todayStr = now.toISOString().split('T')[0]

      type Row = {
        id: string
        title: string
        due_date: string | null
        completed: boolean
        application_id: string
        application: { company: string; role: string } | null
      }

      return ((data ?? []) as unknown as Row[])
        .filter((a) => {
          if (!a.due_date) return false
          const dStr = a.due_date.split('T')[0]
          return dStr <= todayStr
        })
        .map((a) => ({
          id: a.id,
          title: a.title,
          due_date: a.due_date,
          completed: a.completed,
          application_id: a.application_id,
          company: a.application?.company ?? 'Unknown',
          role: a.application?.role ?? '',
          isOverdue: a.due_date ? a.due_date.split('T')[0] < todayStr : false,
          isDueToday: a.due_date ? a.due_date.split('T')[0] === todayStr : false,
        }))
    },
  })
}

export function useCompleteAction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (actionId: string) => {
      const { error } = await supabase
        .from('actions')
        .update({ completed: true, completed_at: new Date().toISOString() } as never)
        .eq('id', actionId)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['today-actions'] })
      qc.invalidateQueries({ queryKey: ['dashboard-metrics'] })
      qc.invalidateQueries({ queryKey: ['actions'] })
    },
  })
}

export interface PipelineStage {
  name: string
  count: number
  color: string
}

export function usePipelineCounts() {
  return useQuery<PipelineStage[]>({
    queryKey: ['pipeline-counts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('applications')
        .select('id, status:statuses(name)')
      if (error) throw error

      type Row = { id: string; status: { name: string } | null }
      const rows = (data ?? []) as Row[]

      const stageConfig = [
        { match: ['to apply'], name: 'To Apply', color: 'gray' },
        { match: ['applied'], name: 'Applied', color: 'blue' },
        { match: ['hr screening'], name: 'Screening', color: 'yellow' },
        { match: ['interview', 'final interview'], name: 'Interview', color: 'violet' },
        { match: ['offer'], name: 'Offer', color: 'emerald' },
        { match: ['rejected'], name: 'Rejected', color: 'rose' },
      ]

      return stageConfig.map((stage) => ({
        name: stage.name,
        count: rows.filter((r) => stage.match.includes(r.status?.name?.toLowerCase() ?? '')).length,
        color: stage.color,
      }))
    },
  })
}
