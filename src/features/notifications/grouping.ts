import type { Notification } from '@/types/database'

export interface NotificationCluster {
  /** Distinct key for React list rendering. */
  key: string
  /** When defined, cluster shares a single application. */
  applicationId: string | null
  /** Lowest priority number (most urgent) in the cluster. */
  priority: number
  /** Count of unread items inside this cluster. */
  unreadCount: number
  /** Underlying notifications (already sorted unread → priority → recency). */
  items: Notification[]
}

/**
 * Group notifications for the dropdown. Rules:
 *
 *  - If 2+ notifications share the same application_id, they render as
 *    one collapsible cluster headed by the app ID — prevents the inbox
 *    from being dominated by a single noisy opportunity.
 *  - Solo notifications (unique app, or no app) render as their own
 *    single-item cluster.
 *  - Clusters are sorted by their most-urgent priority first,
 *    then by the most recent item.
 *
 * Purely a presentation grouping — the underlying rows are untouched.
 */
export function clusterNotifications(list: Notification[]): NotificationCluster[] {
  const byApp = new Map<string, Notification[]>()
  const solo: Notification[] = []

  // Pass 1: bucket by application, track unique keys for non-app rows.
  for (const n of list) {
    if (n.application_id) {
      const arr = byApp.get(n.application_id) ?? []
      arr.push(n)
      byApp.set(n.application_id, arr)
    } else {
      solo.push(n)
    }
  }

  const clusters: NotificationCluster[] = []

  for (const [appId, items] of byApp) {
    if (items.length === 1) {
      // Only one notification for this app — treat as solo (less chrome).
      solo.push(items[0])
      continue
    }
    const priority = items.reduce((p, n) => Math.min(p, n.priority), 99)
    const unreadCount = items.filter((n) => !n.is_read).length
    clusters.push({
      key: `app:${appId}`,
      applicationId: appId,
      priority,
      unreadCount,
      items,
    })
  }

  for (const n of solo) {
    clusters.push({
      key: `single:${n.id}`,
      applicationId: n.application_id,
      priority: n.priority,
      unreadCount: n.is_read ? 0 : 1,
      items: [n],
    })
  }

  // Global sort: priority asc, then most recent item desc.
  clusters.sort((a, b) => {
    if (a.priority !== b.priority) return a.priority - b.priority
    const aTime = a.items[0]?.created_at ?? ''
    const bTime = b.items[0]?.created_at ?? ''
    return bTime.localeCompare(aTime)
  })

  return clusters
}

/**
 * Returns a 1-line summary for the "Priority" ribbon that appears
 * when the inbox has urgent items. Null when nothing is urgent.
 */
export function priorityRibbonSummary(list: Notification[]): string | null {
  const unreadCritical = list.filter((n) => !n.is_read && n.priority <= 2)
  if (unreadCritical.length === 0) return null
  const n = unreadCritical.length
  return n === 1
    ? '1 item needs your attention'
    : `${n} items need your attention`
}
