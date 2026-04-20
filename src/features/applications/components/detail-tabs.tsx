import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface DetailTab<K extends string = string> {
  key: K
  label: string
  icon: LucideIcon
  count?: number
}

interface DetailTabsProps<K extends string> {
  tabs: DetailTab<K>[]
  active: K
  onChange: (key: K) => void
}

/**
 * Premium underline tabs with counts.
 *
 *  - Idle:   muted gray, gentle hover lift of text color.
 *  - Active: indigo text + indigo count chip + gradient underline bar.
 *  - The underline uses a pseudo-bar that animates via opacity so the
 *    layout never shifts between tabs.
 */
export function DetailTabs<K extends string>({ tabs, active, onChange }: DetailTabsProps<K>) {
  return (
    <div
      className={cn(
        'flex items-center gap-0.5 overflow-x-auto border-b border-gray-100 px-2',
        'bg-gradient-to-b from-white to-gray-50/40',
      )}
    >
      {tabs.map((tab) => {
        const Icon = tab.icon
        const isActive = active === tab.key
        return (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              'group relative inline-flex items-center gap-2 rounded-t-lg px-4 py-3 text-[13px] font-medium transition-colors focus-visible:outline-none',
              isActive ? 'text-indigo-700' : 'text-gray-500 hover:text-gray-900',
            )}
          >
            <Icon
              className={cn(
                'h-[15px] w-[15px] transition-colors',
                isActive ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-600',
              )}
            />
            <span>{tab.label}</span>

            {typeof tab.count === 'number' && (
              <span
                className={cn(
                  'inline-flex min-w-[20px] items-center justify-center rounded-full px-1.5 py-px text-[10px] font-semibold tabular-nums transition-colors',
                  isActive
                    ? 'bg-indigo-100 text-indigo-700 ring-1 ring-inset ring-indigo-200/70'
                    : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200 group-hover:text-gray-700',
                )}
              >
                {tab.count}
              </span>
            )}

            {/* Animated active underline */}
            <span
              className={cn(
                'pointer-events-none absolute inset-x-3 -bottom-px h-[2px] rounded-full transition-all duration-300',
                isActive
                  ? 'bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500 opacity-100 scale-x-100'
                  : 'bg-gray-300 opacity-0 scale-x-50 group-hover:opacity-30 group-hover:scale-x-75',
              )}
            />
          </button>
        )
      })}
    </div>
  )
}
