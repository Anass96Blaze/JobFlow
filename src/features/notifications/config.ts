import type { LucideIcon } from 'lucide-react'
import { AlertTriangle, CalendarClock, Send, MoonStar } from 'lucide-react'
import type { NotificationType } from '@/types/database'

export type NotificationTone = 'danger' | 'warning' | 'info' | 'neutral'

export interface NotificationVisual {
  icon: LucideIcon
  tone: NotificationTone
  /** Short human label used in the dropdown. */
  label: string
}

/**
 * Visual mapping for every notification type. One place to own
 * icon + tone + label, used by dropdown items and the reminder banner.
 */
export const notificationVisuals: Record<NotificationType, NotificationVisual> = {
  ACTION_OVERDUE:      { icon: AlertTriangle, tone: 'danger',  label: 'Overdue' },
  ACTION_DUE_SOON:     { icon: CalendarClock, tone: 'warning', label: 'Due soon' },
  FOLLOW_UP_REMINDER:  { icon: Send,          tone: 'info',    label: 'Follow up' },
  INACTIVITY_REMINDER: { icon: MoonStar,      tone: 'neutral', label: 'Inactive' },
}

export const toneStyles: Record<NotificationTone, {
  iconBg: string
  iconText: string
  pillBg: string
  pillText: string
  pillRing: string
  dot: string
}> = {
  danger: {
    iconBg: 'bg-red-50 ring-red-100',
    iconText: 'text-red-600',
    pillBg: 'bg-red-50',
    pillText: 'text-red-700',
    pillRing: 'ring-red-100',
    dot: 'bg-red-500',
  },
  warning: {
    iconBg: 'bg-amber-50 ring-amber-100',
    iconText: 'text-amber-600',
    pillBg: 'bg-amber-50',
    pillText: 'text-amber-700',
    pillRing: 'ring-amber-100',
    dot: 'bg-amber-500',
  },
  info: {
    iconBg: 'bg-indigo-50 ring-indigo-100',
    iconText: 'text-indigo-600',
    pillBg: 'bg-indigo-50',
    pillText: 'text-indigo-700',
    pillRing: 'ring-indigo-100',
    dot: 'bg-indigo-500',
  },
  neutral: {
    iconBg: 'bg-gray-50 ring-gray-200/70',
    iconText: 'text-gray-600',
    pillBg: 'bg-gray-50',
    pillText: 'text-gray-700',
    pillRing: 'ring-gray-200/70',
    dot: 'bg-gray-400',
  },
}

export function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime()
  const min = Math.floor(diffMs / 60_000)
  if (min < 1) return 'Just now'
  if (min < 60) return `${min}m ago`
  const h = Math.floor(min / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  if (d < 7) return `${d}d ago`
  const w = Math.floor(d / 7)
  return `${w}w ago`
}
