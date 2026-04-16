import { cn } from '@/lib/utils'

interface CardProps {
  children: React.ReactNode
  className?: string
}

export function Card({ children, className }: CardProps) {
  return <div className={cn('rounded-xl bg-surface-container-lowest ambient-shadow', className)}>{children}</div>
}

export function CardHeader({ children, className }: CardProps) {
  return <div className={cn('border-b border-surface-container-low px-6 py-4', className)}>{children}</div>
}

export function CardContent({ children, className }: CardProps) {
  return <div className={cn('px-6 py-4', className)}>{children}</div>
}
