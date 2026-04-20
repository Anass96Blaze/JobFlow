import { cn } from '@/lib/utils'

type BadgeColor =
  | 'gray' | 'slate'
  | 'blue' | 'indigo' | 'violet' | 'purple'
  | 'green' | 'emerald' | 'teal'
  | 'red' | 'rose' | 'orange' | 'amber' | 'yellow' | 'pink'

interface BadgeProps {
  children: React.ReactNode
  color?: BadgeColor | string
  className?: string
  /** Use a slightly more prominent solid-tint variant. */
  variant?: 'soft' | 'solid'
  size?: 'sm' | 'md'
}

/**
 * Unified premium pill badge.
 *
 *  soft   — default, low-emphasis (bg-50 / text-700 / ring-100)
 *  solid  — medium-emphasis (bg-100 / text-800 / ring-200)
 *
 * Typography: 11px, semibold, tracked. Consistent across all statuses,
 * priorities, sources, outcomes, and types.
 */
const softMap: Record<string, string> = {
  gray:    'bg-gray-50    text-gray-700    ring-gray-200/70',
  slate:   'bg-slate-50   text-slate-700   ring-slate-200/70',
  blue:    'bg-blue-50    text-blue-700    ring-blue-100',
  indigo:  'bg-indigo-50  text-indigo-700  ring-indigo-100',
  violet:  'bg-violet-50  text-violet-700  ring-violet-100',
  purple:  'bg-purple-50  text-purple-700  ring-purple-100',
  green:   'bg-emerald-50 text-emerald-700 ring-emerald-100',
  emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  teal:    'bg-teal-50    text-teal-700    ring-teal-100',
  red:     'bg-red-50     text-red-700     ring-red-100',
  rose:    'bg-rose-50    text-rose-700    ring-rose-100',
  orange:  'bg-orange-50  text-orange-700  ring-orange-100',
  amber:   'bg-amber-50   text-amber-700   ring-amber-100',
  yellow:  'bg-amber-50   text-amber-800   ring-amber-100',
  pink:    'bg-pink-50    text-pink-700    ring-pink-100',
}

const solidMap: Record<string, string> = {
  gray:    'bg-gray-100    text-gray-800    ring-gray-200',
  slate:   'bg-slate-100   text-slate-800   ring-slate-200',
  blue:    'bg-blue-100    text-blue-800    ring-blue-200',
  indigo:  'bg-indigo-100  text-indigo-800  ring-indigo-200',
  violet:  'bg-violet-100  text-violet-800  ring-violet-200',
  purple:  'bg-purple-100  text-purple-800  ring-purple-200',
  green:   'bg-emerald-100 text-emerald-800 ring-emerald-200',
  emerald: 'bg-emerald-100 text-emerald-800 ring-emerald-200',
  teal:    'bg-teal-100    text-teal-800    ring-teal-200',
  red:     'bg-red-100     text-red-800     ring-red-200',
  rose:    'bg-rose-100    text-rose-800    ring-rose-200',
  orange:  'bg-orange-100  text-orange-800  ring-orange-200',
  amber:   'bg-amber-100   text-amber-900   ring-amber-200',
  yellow:  'bg-amber-100   text-amber-900   ring-amber-200',
  pink:    'bg-pink-100    text-pink-800    ring-pink-200',
}

export function Badge({
  children,
  color = 'gray',
  className,
  variant = 'soft',
  size = 'sm',
}: BadgeProps) {
  const map = variant === 'solid' ? solidMap : softMap
  const palette = map[color] ?? map.gray

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-semibold ring-1 ring-inset whitespace-nowrap',
        size === 'sm'
          ? 'px-2 py-0.5 text-[11px] leading-[1.35] tracking-[0.01em]'
          : 'px-2.5 py-1 text-xs leading-tight tracking-[0.01em]',
        palette,
        className,
      )}
    >
      {children}
    </span>
  )
}
