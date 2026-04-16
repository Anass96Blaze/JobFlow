import { useStatuses, usePriorities, useSources, useActionTypes } from '@/hooks/use-reference-data'
import { Badge } from '@/components/ui/badge'
import { PageLoader } from '@/components/ui/spinner'
import { getStatusColor, getPriorityColor } from '@/lib/utils'
import { Tag, Flag, Globe, Zap, Settings2 } from 'lucide-react'

const sections = [
  { key: 'statuses', label: 'Statuses', description: 'Application pipeline stages', icon: Tag, iconBg: 'bg-indigo-50', iconColor: 'text-indigo-600' },
  { key: 'priorities', label: 'Priorities', description: 'Urgency levels for applications', icon: Flag, iconBg: 'bg-orange-50', iconColor: 'text-orange-600' },
  { key: 'sources', label: 'Sources', description: 'Where you found the job listing', icon: Globe, iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600' },
  { key: 'actionTypes', label: 'Action Types', description: 'Types of follow-up actions', icon: Zap, iconBg: 'bg-violet-50', iconColor: 'text-violet-600' },
] as const

export function SettingsPage() {
  const { data: statuses, isLoading: sl } = useStatuses()
  const { data: priorities, isLoading: pl } = usePriorities()
  const { data: sources, isLoading: sol } = useSources()
  const { data: actionTypes, isLoading: al } = useActionTypes()

  if (sl || pl || sol || al) return <PageLoader />

  const dataMap = {
    statuses: { items: statuses, getColor: (name: string) => getStatusColor(name) },
    priorities: { items: priorities, getColor: (name: string) => getPriorityColor(name) },
    sources: { items: sources, getColor: () => 'gray' },
    actionTypes: { items: actionTypes, getColor: () => 'blue' },
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-md shadow-indigo-500/20">
          <Settings2 className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Settings</h1>
          <p className="text-sm text-gray-500">View your application tracking configuration</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {sections.map((section) => {
          const Icon = section.icon
          const data = dataMap[section.key]
          return (
            <div key={section.key} className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="flex items-center gap-3 border-b border-gray-100 px-5 py-4">
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${section.iconBg}`}>
                  <Icon className={`h-4 w-4 ${section.iconColor}`} />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-gray-900">{section.label}</h2>
                  <p className="text-xs text-gray-400">{section.description}</p>
                </div>
                {data.items && (
                  <span className="ml-auto rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-600">
                    {data.items.length}
                  </span>
                )}
              </div>
              <div className="px-5 py-4">
                <div className="flex flex-wrap gap-2">
                  {data.items?.map((item) => (
                    <Badge key={item.id} color={data.getColor(item.name)}>{item.name}</Badge>
                  ))}
                </div>
                {!data.items?.length && (
                  <p className="text-sm text-gray-400">No items configured</p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
