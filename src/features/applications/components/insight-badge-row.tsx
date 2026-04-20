import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export type InsightTone = 'info' | 'success' | 'warning' | 'danger' | 'neutral'

export interface Insight {
  id: string
  icon: ReactNode
  label: string
  tone?: InsightTone
}

const toneClasses: Record<InsightTone, string> = {
  info:    'bg-indigo-50  text-indigo-700  ring-indigo-100',
  success: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  warning: 'bg-amber-50   text-amber-700   ring-amber-100',
  danger:  'bg-red-50     text-red-700     ring-red-100',
  neutral: 'bg-gray-50    text-gray-600    ring-gray-100',
}

interface InsightBadgeRowProps {
  insights: Insight[]
  className?: string
}

/**
 * Subtle, pill-shaped chip row. Used in the hero card to answer:
 * "what should I know about this opportunity at a glance?".
 */
export function InsightBadgeRow({ insights, className }: InsightBadgeRowProps) {
  if (!insights.length) return null

  return (
    <div className={cn('flex flex-wrap items-center gap-1.5', className)}>
      {insights.map((i) => (
        <span
          key={i.id}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-medium leading-[1.35] tracking-[0.005em] ring-1 ring-inset',
            toneClasses[i.tone ?? 'neutral'],
          )}
        >
          <span className="shrink-0 opacity-80">{i.icon}</span>
          <span className="truncate">{i.label}</span>
        </span>
      ))}
    </div>
  )
}
