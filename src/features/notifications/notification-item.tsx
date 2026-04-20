import { useNavigate } from 'react-router-dom'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Notification } from '@/types/database'
import { notificationVisuals, toneStyles, relativeTime } from './config'

interface NotificationItemProps {
  notification: Notification
  onRead: (id: string) => void
  onClose: () => void
}

/**
 * Single inbox row. Clicking navigates to the related application
 * (and highlights the related action via a hash fragment), then
 * marks the notification read.
 *
 * Dismiss action (the small check on hover) simply marks-as-read.
 * We never delete rows from the client — the unique (user, type,
 * app, action) dedup key means deleting would re-surface the same
 * notification on the next generator run, which feels like spam.
 * Marking-as-read preserves the tombstone while hiding it from focus.
 */
export function NotificationItem({ notification, onRead, onClose }: NotificationItemProps) {
  const navigate = useNavigate()
  const visual = notificationVisuals[notification.type]
  const tone = toneStyles[visual.tone]
  const Icon = visual.icon
  const unread = !notification.is_read

  const handleClick = () => {
    if (unread) onRead(notification.id)
    if (notification.application_id) {
      const hash = notification.action_id ? `#action-${notification.action_id}` : ''
      navigate(`/applications/${notification.application_id}${hash}`)
    }
    onClose()
  }

  return (
    <div
      className={cn(
        'group relative flex cursor-pointer gap-3 px-4 py-3 transition-colors',
        unread ? 'bg-indigo-50/30 hover:bg-indigo-50/60' : 'hover:bg-gray-50',
      )}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick() } }}
    >
      {/* Unread indicator rail */}
      {unread && (
        <span className="absolute left-1.5 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-indigo-500 ring-2 ring-indigo-100" />
      )}

      <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset', tone.iconBg)}>
        <Icon className={cn('h-[17px] w-[17px]', tone.iconText)} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className={cn(
            'text-[13.5px] leading-snug tracking-[-0.005em]',
            unread ? 'font-semibold text-gray-900' : 'font-medium text-gray-700',
          )}>
            {notification.title}
          </p>
          <span className="shrink-0 text-[10.5px] font-medium text-gray-400 whitespace-nowrap">
            {relativeTime(notification.created_at)}
          </span>
        </div>
        <p className={cn('mt-0.5 line-clamp-2 text-[12.5px] leading-relaxed', unread ? 'text-gray-600' : 'text-gray-500')}>
          {notification.message}
        </p>
        <div className="mt-1.5 flex items-center gap-1.5">
          <span className={cn(
            'inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ring-1 ring-inset',
            tone.pillBg, tone.pillText, tone.pillRing,
          )}>
            <span className={cn('h-1 w-1 rounded-full', tone.dot)} />
            {visual.label}
          </span>
        </div>
      </div>

      <button
        onClick={(e) => { e.stopPropagation(); if (unread) onRead(notification.id) }}
        className={cn(
          'shrink-0 self-start rounded-lg p-1 transition-all hover:bg-gray-200 focus-visible:opacity-100',
          unread
            ? 'text-gray-300 opacity-0 group-hover:opacity-100 hover:text-emerald-600'
            : 'invisible',
        )}
        aria-label="Mark as read"
        title="Mark as read"
      >
        <Check className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}
