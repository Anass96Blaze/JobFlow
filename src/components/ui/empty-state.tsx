import { AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
  /**
   * Compact mode used inside panels (smaller padding, no outer border).
   */
  compact?: boolean
  className?: string
}

/**
 * Elegant empty state — soft dashed card with a muted icon tile.
 * Use `compact` inside tabs so the layout stays tight.
 */
export function EmptyState({ icon, title, description, action, compact, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gradient-to-br from-gray-50/60 to-white text-center animate-fade-in',
        compact ? 'py-10 px-6' : 'py-16 px-8',
        className,
      )}
    >
      <div
        className={cn(
          'mb-3.5 flex items-center justify-center rounded-2xl bg-white text-gray-400',
          'shadow-[0_1px_2px_rgba(16,24,40,0.04),inset_0_0_0_1px_rgba(16,24,40,0.04)]',
          compact ? 'h-12 w-12' : 'h-14 w-14',
        )}
      >
        {icon || <AlertCircle className={compact ? 'h-6 w-6' : 'h-7 w-7'} />}
      </div>
      <h3 className={cn('font-semibold tracking-[-0.005em] text-gray-900', compact ? 'text-[15px]' : 'text-base')}>
        {title}
      </h3>
      {description && (
        <p className="mt-1 max-w-sm text-[13px] leading-relaxed text-gray-500">
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
