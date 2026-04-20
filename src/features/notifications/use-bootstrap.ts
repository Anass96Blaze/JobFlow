import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { generateNotifications } from './generator'

/** 10 minutes between background regenerations. */
const REFRESH_INTERVAL_MS = 10 * 60 * 1000

/**
 * Runs the notification generator on mount and on an interval so the
 * inbox stays fresh while the app is open. Safe to run many times —
 * the generator upserts with `ignoreDuplicates: true` on a unique
 * (user, type, application, action) key.
 *
 * We also regenerate when the tab returns to foreground: the user
 * might have been away long enough for an action to become overdue.
 */
export function useNotificationBootstrap() {
  const qc = useQueryClient()

  useEffect(() => {
    let cancelled = false

    const run = async () => {
      try {
        await generateNotifications()
        if (!cancelled) {
          qc.invalidateQueries({ queryKey: ['notifications'] })
        }
      } catch {
        // Non-fatal.
      }
    }

    run()
    const interval = window.setInterval(run, REFRESH_INTERVAL_MS)

    const onVisible = () => { if (document.visibilityState === 'visible') run() }
    document.addEventListener('visibilitychange', onVisible)

    return () => {
      cancelled = true
      window.clearInterval(interval)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [qc])
}
