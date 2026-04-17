import { AlertTriangle, RotateCcw } from 'lucide-react'
import { Button } from './button'

interface ErrorStateProps {
  message?: string
  onRetry?: () => void
}

export function ErrorState({ message = 'Something went wrong', onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-red-200 bg-red-50/50 py-16 text-center animate-fade-in">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 ring-4 ring-red-50">
        <AlertTriangle className="h-7 w-7 text-red-600" />
      </div>
      <h3 className="text-base font-semibold text-gray-900">Something went wrong</h3>
      <p className="mt-1.5 max-w-sm text-sm text-gray-500 leading-relaxed">{message}</p>
      {onRetry && (
        <div className="mt-6">
          <Button variant="secondary" size="sm" onClick={onRetry}>
            <RotateCcw className="h-3.5 w-3.5" /> Try again
          </Button>
        </div>
      )}
    </div>
  )
}
