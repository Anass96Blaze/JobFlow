import type { SelectOption } from '@/components/ui/app-select'
import type { Status, Priority, Source, ActionType } from '@/types/database'

const statusColorMap: Record<string, string> = {
  'To Apply': 'gray',
  'Applied': 'blue',
  'HR Screening': 'indigo',
  'Interview': 'purple',
  'Final Interview': 'violet',
  'Offer': 'green',
  'Rejected': 'red',
  'No Response': 'slate',
  'On Hold': 'amber',
  'Withdrawn': 'rose',
}

const priorityColorMap: Record<string, string> = {
  'High': 'red',
  'Medium': 'amber',
  'Low': 'gray',
}

const actionTypeColorMap: Record<string, string> = {
  'Tailor CV': 'blue',
  'Submit Application': 'indigo',
  'Follow Up': 'violet',
  'Prep Interview': 'purple',
  'Send Thank You': 'green',
  'Negotiate Offer': 'emerald',
  'Wait': 'amber',
  'Archive': 'slate',
}

export function mapStatusesToOptions(statuses: Status[]): SelectOption[] {
  return statuses.map((s) => ({
    value: s.id,
    label: s.name,
    color: statusColorMap[s.name] || 'gray',
  }))
}

export function mapPrioritiesToOptions(priorities: Priority[]): SelectOption[] {
  return priorities.map((p) => ({
    value: p.id,
    label: p.name,
    color: priorityColorMap[p.name] || 'gray',
  }))
}

export function mapSourcesToOptions(sources: Source[]): SelectOption[] {
  return sources.map((s) => ({
    value: s.id,
    label: s.name,
  }))
}

export function mapActionTypesToOptions(actionTypes: ActionType[]): SelectOption[] {
  return actionTypes.map((a) => ({
    value: a.id,
    label: a.name,
    color: actionTypeColorMap[a.name] || 'gray',
  }))
}

export function mapStringsToOptions(values: string[]): SelectOption[] {
  return values.map((v) => ({ value: v, label: v }))
}