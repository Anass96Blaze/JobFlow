import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  color?: string
  className?: string
}

const colorMap: Record<string, string> = {
  blue: 'bg-secondary-container text-on-secondary-container',
  green: 'bg-tertiary-fixed text-on-tertiary-fixed',
  yellow: 'bg-primary-fixed text-on-primary-fixed-variant',
  red: 'bg-error-container text-on-error-container',
  purple: 'bg-primary-fixed text-on-primary-fixed',
  orange: 'bg-error-container text-on-error-container',
  gray: 'bg-surface-container text-on-surface-variant',
  indigo: 'bg-primary-fixed text-on-primary-fixed-variant',
  pink: 'bg-error-container text-on-error-container',
  teal: 'bg-tertiary-fixed text-on-tertiary-fixed-variant',
}

export function Badge({ children, color = 'gray', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold',
        colorMap[color] || colorMap.gray,
        className,
      )}
    >
      {children}
    </span>
  )
}
