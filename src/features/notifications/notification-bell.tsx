import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, BellRing, Check, RefreshCw, Inbox, Building2, ChevronDown, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  useNotifications,
  useUnreadCount,
  useMarkAsRead,
  useMarkAllAsRead,
  useGenerateNotifications,
  useApplicationLookup,
} from './use-notifications'
import { NotificationItem } from './notification-item'
import { clusterNotifications, priorityRibbonSummary, type NotificationCluster } from './grouping'

/**
 * Bell icon + intelligent dropdown inbox.
 *
 * Smart behaviour:
 *  - Ordering: unread → priority (1 = overdue, 5 = inactivity) → recency
 *  - Grouping: 2+ notifications for the same application collapse
 *    into a single expandable "By application" cluster
 *  - Priority ribbon: a concise banner when there are overdue / today
 *    items so the first thing the user sees is the most useful action
 *  - Dismiss = mark-as-read (never delete) so the dedup index keeps
 *    working and the user is never spammed with a re-surfaced item
 */
export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const { data: notifications = [], isLoading } = useNotifications(40)
  const { data: unreadCount = 0 } = useUnreadCount()
  const { data: appLookup } = useApplicationLookup()
  const markAsRead = useMarkAsRead()
  const markAllAsRead = useMarkAllAsRead()
  const generate = useGenerateNotifications()

  const clusters = useMemo(() => clusterNotifications(notifications), [notifications])
  const ribbon = useMemo(() => priorityRibbonSummary(notifications), [notifications])

  const hasUnread = unreadCount > 0
  const badgeLabel = unreadCount > 9 ? '9+' : String(unreadCount)

  useEffect(() => {
    if (!open) return
    const handlePointer = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', handlePointer)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handlePointer)
      document.removeEventListener('keydown', handleKey)
    }
  }, [open])

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={`Notifications${hasUnread ? ` (${unreadCount} unread)` : ''}`}
        aria-haspopup="menu"
        aria-expanded={open}
        className={cn(
          'relative flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 transition-all',
          'shadow-[0_1px_2px_rgba(16,24,40,0.04)] hover:border-indigo-200 hover:text-indigo-600 hover:shadow-[0_4px_10px_rgba(16,24,40,0.06)]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/30',
          open && 'border-indigo-200 text-indigo-600',
        )}
      >
        {hasUnread ? <BellRing className="h-[17px] w-[17px]" /> : <Bell className="h-[17px] w-[17px]" />}
        {hasUnread && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-rose-500 px-1 text-[9px] font-bold text-white shadow-[0_2px_6px_-1px_rgba(244,63,94,0.6)] ring-2 ring-white tabular-nums">
            {badgeLabel}
            <span className="absolute inset-0 -z-10 rounded-full bg-red-400 opacity-60 animate-soft-ping" />
          </span>
        )}
      </button>

      {open && (
        <div
          role="menu"
          className={cn(
            'absolute right-0 top-full z-40 mt-2 w-[400px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-gray-200 bg-white animate-scale-in',
            'shadow-[0_12px_40px_-8px_rgba(16,24,40,0.18),0_4px_10px_rgba(16,24,40,0.08)]',
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <div className="flex items-center gap-2">
              <h3 className="text-[14px] font-semibold tracking-[-0.005em] text-gray-900">Notifications</h3>
              {hasUnread && (
                <span className="inline-flex items-center rounded-full bg-indigo-50 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-700 ring-1 ring-inset ring-indigo-100 tabular-nums">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-0.5">
              <button
                onClick={() => generate.mutate()}
                disabled={generate.isPending}
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800 disabled:opacity-50"
                title="Refresh notifications"
              >
                <RefreshCw className={cn('h-3 w-3', generate.isPending && 'animate-spin')} />
                Refresh
              </button>
              {hasUnread && (
                <button
                  onClick={() => markAllAsRead.mutate()}
                  disabled={markAllAsRead.isPending}
                  className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold text-indigo-600 transition-colors hover:bg-indigo-50 disabled:opacity-50"
                >
                  <Check className="h-3 w-3" />
                  Mark all read
                </button>
              )}
            </div>
          </div>

          {/* Priority ribbon */}
          {ribbon && (
            <div className="flex items-center gap-2 border-b border-red-100 bg-gradient-to-r from-red-50/80 via-rose-50/40 to-transparent px-4 py-2">
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-rose-500 text-white shadow-[0_2px_6px_-1px_rgba(244,63,94,0.5)]">
                <Sparkles className="h-3 w-3" />
              </div>
              <p className="text-[11.5px] font-semibold text-red-800">{ribbon}</p>
            </div>
          )}

          {/* Body */}
          <div className="max-h-[min(70vh,480px)] overflow-y-auto overscroll-contain">
            {isLoading ? (
              <div className="flex items-center justify-center py-12 text-[12px] text-gray-400">Loading…</div>
            ) : notifications.length === 0 ? (
              <EmptyInbox />
            ) : (
              <div className="divide-y divide-gray-100">
                {clusters.map((cluster) =>
                  cluster.items.length === 1 ? (
                    <NotificationItem
                      key={cluster.key}
                      notification={cluster.items[0]}
                      onRead={(id) => markAsRead.mutate(id)}
                      onClose={() => setOpen(false)}
                    />
                  ) : (
                    <ClusterGroup
                      key={cluster.key}
                      cluster={cluster}
                      appLabel={cluster.applicationId ? appLookup?.get(cluster.applicationId) : undefined}
                      onRead={(id) => markAsRead.mutate(id)}
                      onClose={() => setOpen(false)}
                    />
                  ),
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

/** Collapsible application cluster. Expanded by default when unread items exist. */
function ClusterGroup({
  cluster,
  appLabel,
  onRead,
  onClose,
}: {
  cluster: NotificationCluster
  appLabel?: { company: string; role: string }
  onRead: (id: string) => void
  onClose: () => void
}) {
  const navigate = useNavigate()
  const [open, setOpen] = useState(cluster.unreadCount > 0)
  const hasUnread = cluster.unreadCount > 0

  const company = appLabel?.company ?? 'Application'
  const role    = appLabel?.role
  const label = role ? `${company} · ${role}` : company

  return (
    <div>
      <div
        className={cn(
          'flex items-center gap-2 px-4 py-2.5 transition-colors',
          hasUnread ? 'bg-gradient-to-r from-indigo-50/40 to-transparent' : 'bg-gray-50/50',
        )}
      >
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-200/60 hover:text-gray-700"
          aria-label={open ? 'Collapse' : 'Expand'}
        >
          <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', open && 'rotate-180')} />
        </button>

        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white text-gray-500 ring-1 ring-inset ring-gray-200">
          <Building2 className="h-[13px] w-[13px]" />
        </div>

        <button
          onClick={() => {
            if (cluster.applicationId) navigate(`/applications/${cluster.applicationId}`)
            onClose()
          }}
          className="group min-w-0 flex-1 text-left"
        >
          <p className="truncate text-[12.5px] font-semibold text-gray-800 group-hover:text-indigo-700">
            {label}
          </p>
          <p className="truncate text-[11px] text-gray-500">
            {cluster.items.length} reminders
            {hasUnread && <> · <span className="font-semibold text-indigo-600">{cluster.unreadCount} new</span></>}
          </p>
        </button>

        {hasUnread && (
          <span className="inline-flex h-4 min-w-4 shrink-0 items-center justify-center rounded-full bg-indigo-600 px-1 text-[9px] font-bold text-white tabular-nums">
            {cluster.unreadCount}
          </span>
        )}
      </div>

      {open && (
        <div className="divide-y divide-gray-100 bg-white">
          {cluster.items.map((n) => (
            <div key={n.id} className="pl-4">
              <NotificationItem notification={n} onRead={onRead} onClose={onClose} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function EmptyInbox() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-12 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-gray-50 to-white ring-1 ring-gray-200 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
        <Inbox className="h-5 w-5 text-gray-400" />
      </div>
      <p className="text-[13px] font-semibold text-gray-800">You're all caught up</p>
      <p className="text-[11.5px] text-gray-500">
        Reminders about follow-ups, overdue actions and inactive apps will appear here.
      </p>
    </div>
  )
}
